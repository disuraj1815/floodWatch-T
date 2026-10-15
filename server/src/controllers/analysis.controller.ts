import type { Request, Response } from 'express';
import { getDbStatus } from '../config/db.ts';
import { AnalysisRequestModel } from '../models/AnalysisRequest.model.ts';
import { searchStacScenes } from '../services/stac.service.ts';
import { inspectRasterAsset } from '../services/raster.service.ts';
import { runPreprocessingPipeline } from '../services/preprocess.service.ts';
import { checkAIModelAvailability, runAIInferencePipeline } from '../services/ai.service.ts';
import { fetchOSMInfrastructure } from '../services/osm.service.ts';
import { analyzeRoadNetworkConnectivity } from '../services/connectivity.service.ts';

// In-memory fallback storage if MongoDB is not connected
const memoryStore = new Map<string, any>();

export const getHealth = async (req: Request, res: Response) => {
  const dbStatus = getDbStatus();
  const aiStatus = await checkAIModelAvailability();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FloodWatch Backend API',
    version: '4.0.0-phase4-5-6',
    database: dbStatus.status,
    databaseReadyState: dbStatus.readyState,
    databaseHost: dbStatus.host || null,
    databaseMessage: dbStatus.message,
    stacApi: 'active',
    rasterService: 'active',
    preprocessingEngine: 'active',
    aiSegmentationService: aiStatus,
    osmService: 'active',
    connectivityEngine: 'active'
  });
};

export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const { locationName, eventName, eventDate, beforeDateStart, beforeDateEnd, afterDateStart, afterDateEnd, aoi, sensor } = req.body;

    if (!aoi || typeof aoi.minLat !== 'number' || typeof aoi.maxLat !== 'number' || typeof aoi.minLng !== 'number' || typeof aoi.maxLng !== 'number') {
      return res.status(400).json({ error: 'Invalid or missing AOI geometry coordinates.' });
    }

    if (!eventDate || Number.isNaN(Date.parse(eventDate))) {
      return res.status(400).json({ error: 'A valid event date is required.' });
    }
    const validDate = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value));
    if ((beforeDateStart && !validDate(beforeDateStart)) || (beforeDateEnd && !validDate(beforeDateEnd)) ||
        (afterDateStart && !validDate(afterDateStart)) || (afterDateEnd && !validDate(afterDateEnd))) {
      return res.status(400).json({ error: 'One or more before/after date values are invalid.' });
    }
    if (aoi.minLat >= aoi.maxLat || aoi.minLng >= aoi.maxLng || aoi.minLat < -90 || aoi.maxLat > 90 || aoi.minLng < -180 || aoi.maxLng > 180) {
      return res.status(400).json({ error: 'AOI bounds are invalid.' });
    }
    const beforeStart = beforeDateStart || '2026-08-01';
    const afterEnd = afterDateEnd || '2026-08-20';
    if (beforeStart > afterEnd) {
      return res.status(400).json({ error: 'The overall satellite search start date must be on or before the end date.' });
    }

    // STAC bbox order is [minLng, minLat, maxLng, maxLat].
    const bbox: [number, number, number, number] = [aoi.minLng, aoi.minLat, aoi.maxLng, aoi.maxLat];
    const datetime = `${beforeStart}T00:00:00Z/${afterEnd}T23:59:59Z`;
    const sensorCollections: Record<string, string[]> = {
      'sentinel-1': ['sentinel-1-grd'],
      'sentinel-2': ['sentinel-2-l2a'],
      both: ['sentinel-1-grd', 'sentinel-2-l2a']
    };
    const collections = sensorCollections[sensor] || sensorCollections.both;

    // State 1: Scene Discovery
    console.log(`Querying STAC API for AOI bbox:`, bbox, `datetime:`, datetime, `collections:`, collections);
    const scenes = await searchStacScenes({ bbox, datetime, collections, limit: 20 });

    // State 2 & 3: Raster Asset Access & Download check
    let rasterInspectionResults: any[] = [];
    let sceneBbox: number[] | undefined;
    let primarySceneId = 'none';
    if (scenes.length > 0) {
      primarySceneId = scenes[0].sceneId;
      sceneBbox = scenes[0].bbox;
      const assets = scenes[0].assets || {};
      const primaryAssetKeys = Object.keys(assets).slice(0, 3);
      for (const key of primaryAssetKeys) {
        const inspection = await inspectRasterAsset(key, assets[key]);
        rasterInspectionResults.push(inspection);
      }
    }

    // State 4: Spatial Preprocessing Pipeline
    const preprocessingResult = await runPreprocessingPipeline(aoi, sceneBbox);

    // State 5, 6, 7: AI Model Availability, Inference, and Flood Mask Generation
    const aiStatus = await checkAIModelAvailability();
    // The worker expects a 3-band RGB/TCI COG. Do not pass an arbitrary single-band asset.
    const primaryScene = scenes[0];
    const assetEntries = Object.entries(primaryScene?.assets || {}) as Array<[string, any]>;
    const rgbAsset = assetEntries.find(([key, asset]) =>
      /^(visual|tci|true.?color|true.?colour)$/i.test(key) ||
      (Array.isArray(asset?.roles) && asset.roles.some((role: string) => /visual|thumbnail/i.test(role)))
    );
    const assetHref = typeof rgbAsset?.[1]?.href === 'string' ? rgbAsset[1].href : undefined;
    const aiInferenceResult = scenes.length > 0 && assetHref
      ? await runAIInferencePipeline(primarySceneId, aoi, assetHref)
      : {
          aiModelAvailability: aiStatus.status === 'worker_offline' ? 'worker_offline' as const : 'not_downloaded' as const,
          aiInference: 'skipped' as const,
          floodMaskGeneration: 'skipped' as const,
          confidenceScores: null,
          floodAreaSqKm: null,
          message: scenes.length === 0
            ? 'AI inference skipped because no suitable satellite scene was discovered.'
            : 'AI inference skipped: no compatible 3-band RGB/TCI asset was found in the selected scene.'
        };

    // Phase 4: OSM Infrastructure Retrieval
    const osmFeatures = await fetchOSMInfrastructure(aoi);
    const floodMaskAvailable = aiInferenceResult.floodMaskGeneration === 'completed' && aiInferenceResult.floodAreaSqKm !== null;

    // A valid mask alone does not establish impact; spatial feature-mask intersection must be performed.
    const infrastructureImpact = osmFeatures.map(f => ({
      ...f,
      impactStatus: 'FLOOD IMPACT UNVERIFIED',
      reason: floodMaskAvailable
        ? 'A flood mask exists, but feature-to-mask spatial intersection is not implemented; no impact claim is made.'
        : 'No verified flood mask is available for this analysis.'
    }));

    // Phase 5: Road Network Connectivity Analysis
    const roadConnectivityResult = await analyzeRoadNetworkConnectivity(osmFeatures, floodMaskAvailable);

    const analysisData = {
      locationName: locationName || 'Selected AOI',
      eventName: eventName || 'Flood Event Assessment',
      eventDate: new Date(eventDate),
      beforeDateStart: new Date(beforeDateStart || '2026-08-01'),
      beforeDateEnd: new Date(beforeDateEnd || '2026-08-10'),
      afterDateStart: new Date(afterDateStart || '2026-08-15'),
      afterDateEnd: new Date(afterDateEnd || '2026-08-20'),
      aoi,
      sensor: sensor || 'both',
      status: 'completed',
      discoveredScenes: scenes.length > 0 ? scenes : [],
      rasterInspection: rasterInspectionResults,
      preprocessing: preprocessingResult,
      aiModelStatus: aiStatus,
      aiInference: aiInferenceResult,
      osmInfrastructure: infrastructureImpact,
      roadConnectivity: roadConnectivityResult
    };

    const dbStatus = getDbStatus();
    let savedRecord: any;

    if (dbStatus.connected) {
      const record = new AnalysisRequestModel(analysisData);
      savedRecord = await record.save();
    } else {
      const id = 'sim_' + Date.now();
      savedRecord = { _id: id, ...analysisData, createdAt: new Date() };
      memoryStore.set(id, savedRecord);
    }

    return res.status(201).json({
      message: scenes.length > 0 ? 'Analysis successfully created with STAC discovery, raster inspection, preprocessing, AI status, OSM retrieval, and connectivity graph.' : 'NO SUITABLE SATELLITE DATA AVAILABLE for the specified area and date range.',
      analysisId: savedRecord._id || savedRecord.id,
      data: savedRecord
    });
  } catch (error: any) {
    console.error('Analysis creation error:', error);
    return res.status(500).json({ error: 'Internal server error during analysis processing.', details: error.message });
  }
};

export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    let record: any;
    if (dbStatus.connected) {
      record = await AnalysisRequestModel.findById(id);
    } else {
      record = memoryStore.get(id);
    }

    if (!record) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    return res.json(record);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAnalysisStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    let record: any;
    if (dbStatus.connected) {
      record = await AnalysisRequestModel.findById(id);
    } else {
      record = memoryStore.get(id);
    }

    if (!record) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    return res.json({
      analysisId: id,
      status: record.status || 'completed',
      scenesFound: record.discoveredScenes?.length || 0,
      updatedAt: record.updatedAt || new Date()
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAnalysisReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    let record: any;
    if (dbStatus.connected) {
      record = await AnalysisRequestModel.findById(id);
    } else {
      record = memoryStore.get(id);
    }

    if (!record) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    return res.json({
      reportTitle: `Situation Report — ${record.locationName}`,
      generatedAt: new Date().toISOString(),
      eventDate: record.eventDate,
      aoi: record.aoi,
      discoveredScenes: record.discoveredScenes,
      summary: 'Analysis completed successfully using STAC satellite discovery and spatial bounding box.',
      attributions: [
        'Contains modified Copernicus Sentinel data 2026.',
        'Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018.',
        '© OpenStreetMap contributors.'
      ]
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
