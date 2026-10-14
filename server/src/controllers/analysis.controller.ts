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

    if (!eventDate) {
      return res.status(400).json({ error: 'Event date is required.' });
    }

    // Format datetime string for STAC query: [minLng, minLat, maxLng, maxLat]
    const bbox: [number, number, number, number] = [aoi.minLng, aoi.minLat, aoi.maxLng, aoi.maxLat];
    const datetime = `${beforeDateStart || '2026-08-01'}T00:00:00Z/${afterDateEnd || '2026-08-20'}T23:59:59Z`;

    // State 1: Scene Discovery
    console.log(`Querying STAC API for AOI bbox:`, bbox, `datetime:`, datetime);
    const scenes = await searchStacScenes({ bbox, datetime });

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
    const aiInferenceResult = await runAIInferencePipeline(primarySceneId, aoi);

    // Phase 4: OSM Infrastructure Retrieval
    const osmFeatures = await fetchOSMInfrastructure(aoi);
    const floodMaskAvailable = aiInferenceResult.floodMaskGeneration === 'completed' && aiInferenceResult.floodAreaSqKm !== null;

    const infrastructureImpact = osmFeatures.map(f => ({
      ...f,
      impactStatus: floodMaskAvailable ? 'POTENTIALLY AFFECTED' : 'FLOOD IMPACT UNAVAILABLE: NO VERIFIED FLOOD MASK',
      reason: floodMaskAvailable ? 'Feature located within AOI flood proximity.' : 'No verified flood mask generated because AI model weights are missing.'
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
