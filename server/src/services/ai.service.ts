const ML_WORKER_URL = process.env.ML_WORKER_URL || 'http://localhost:8000';

export interface AIModelStatus {
  modelName: string;
  architecture: string;
  trainingDataset: string;
  weightsAvailable: boolean;
  weightsPath?: string;
  license: string;
  runtime: string;
  status: 'not_downloaded' | 'ready' | 'running' | 'error' | 'worker_offline';
  message: string;
}

export const checkAIModelAvailability = async (): Promise<AIModelStatus> => {
  try {
    const response = await fetch(`${ML_WORKER_URL}/model/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      return {
        modelName: 'Sen1Floods11-ResNet-Unet',
        architecture: 'U-Net with ResNet-34 Encoder',
        trainingDataset: 'Sen1Floods11 (Multispectral Sentinel-2 & SAR Sentinel-1)',
        weightsAvailable: false,
        license: 'MIT / Open Research License',
        runtime: 'Python 3.10 / FastAPI Worker',
        status: 'error',
        message: `ML worker responded with status ${response.status}.`
      };
    }

    const data: any = await response.json();
    return {
      modelName: data.modelName || 'Sen1Floods11-ResNet-Unet',
      architecture: data.architecture || 'U-Net with ResNet-34 Encoder',
      trainingDataset: data.trainingDataset || 'Sen1Floods11',
      weightsAvailable: !!data.weightsAvailable,
      weightsPath: data.weightsPath,
      license: data.license || 'MIT',
      runtime: 'Python 3.10 / FastAPI Worker (Online)',
      status: data.status || 'not_downloaded',
      message: data.message || 'Worker connected.'
    };
  } catch (error: any) {
    return {
      modelName: 'Sen1Floods11-ResNet-Unet',
      architecture: 'U-Net with ResNet-34 Encoder',
      trainingDataset: 'Sen1Floods11 (Multispectral Sentinel-2 & SAR Sentinel-1)',
      weightsAvailable: false,
      license: 'MIT / Open Research License',
      runtime: 'Python 3.10 / FastAPI Worker',
      status: 'worker_offline',
      message: 'Python ML worker is offline. Inference interface configured; start worker on port 8000 to enable connectivity.'
    };
  }
};

export interface AIInferenceResult {
  aiModelAvailability: 'not_downloaded' | 'ready' | 'worker_offline';
  aiInference: 'completed' | 'skipped' | 'failed';
  floodMaskGeneration: 'completed' | 'skipped' | 'failed';
  confidenceScores: null | number[];
  floodAreaSqKm: null | number;
  message: string;
}

export const runAIInferencePipeline = async (sceneId: string, aoi: any, assetHref?: string): Promise<AIInferenceResult> => {
  const modelStatus = await checkAIModelAvailability();

  if (!modelStatus.weightsAvailable || modelStatus.status !== 'ready') {
    return {
      aiModelAvailability: modelStatus.status === 'worker_offline' ? 'worker_offline' : 'not_downloaded',
      aiInference: 'skipped',
      floodMaskGeneration: 'skipped',
      confidenceScores: null,
      floodAreaSqKm: null,
      message: `AI inference skipped: Model weights are missing or ML worker is offline (${modelStatus.message}). No fabricated flood masks or confidence scores generated.`
    };
  }

  try {
    const response = await fetch(`${ML_WORKER_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sceneId, assetHref: assetHref || '', aoi }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      return {
        aiModelAvailability: 'ready',
        aiInference: 'failed',
        floodMaskGeneration: 'failed',
        confidenceScores: null,
        floodAreaSqKm: null,
        message: `ML worker prediction failed with status ${response.status}.`
      };
    }

    const result: any = await response.json();
    const inferenceCompleted = result?.inference === 'completed';
    const maskCompleted = result?.maskGeneration === 'completed' && typeof result?.floodFraction === 'number';
    let floodAreaSqKm: number | null = null;
    if (maskCompleted && Number.isFinite(result.floodFraction) && aoi &&
        Number.isFinite(aoi.minLat) && Number.isFinite(aoi.maxLat) &&
        Number.isFinite(aoi.minLng) && Number.isFinite(aoi.maxLng) &&
        aoi.minLat < aoi.maxLat && aoi.minLng < aoi.maxLng) {
      // Approximate AOI surface area on a spherical Earth, then apply the model's measured mask fraction.
      const earthRadiusKm = 6371.0088;
      const toRad = (degrees: number) => degrees * Math.PI / 180;
      const areaKm2 = earthRadiusKm * earthRadiusKm *
        Math.abs(toRad(aoi.maxLng - aoi.minLng)) *
        Math.abs(Math.sin(toRad(aoi.maxLat)) - Math.sin(toRad(aoi.minLat)));
      if (Number.isFinite(areaKm2) && result.floodFraction >= 0 && result.floodFraction <= 1) {
        floodAreaSqKm = Number((areaKm2 * result.floodFraction).toFixed(4));
      }
    }
    return {
      aiModelAvailability: 'ready',
      aiInference: inferenceCompleted ? 'completed' : 'failed',
      floodMaskGeneration: maskCompleted ? 'completed' : 'failed',
      confidenceScores: null,
      floodAreaSqKm,
      message: inferenceCompleted && maskCompleted
        ? `Model inference completed. Flood fraction: ${(result.floodFraction * 100).toFixed(2)}%. Flood area is an AOI-based estimate; review mask and input quality before operational use.`
        : `Worker did not confirm a valid completed inference and georeferenced mask. Details: ${(result?.messages || []).join('; ') || 'No valid mask statistics returned.'}`
    };
  } catch (error: any) {
    return {
      aiModelAvailability: 'ready',
      aiInference: 'failed',
      floodMaskGeneration: 'failed',
      confidenceScores: null,
      floodAreaSqKm: null,
      message: `ML worker request error: ${error.message}`
    };
  }
};
