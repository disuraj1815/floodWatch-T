import { checkAIModelAvailability, runAIInferencePipeline } from './src/services/ai.service.ts';
import { searchStacScenes } from './src/services/stac.service.ts';

async function runPhase3BVerification() {
  console.log('=== FLOODWATCH PHASE 3B VERIFICATION START ===');

  // 1. Check AI Model Availability & Weight Status
  console.log('[Task 2 & 3] Checking AI Model Availability (Sen1Floods11 U-Net)...');
  const aiStatus = await checkAIModelAvailability();
  console.log('AI Model Status:', aiStatus);

  // 2. Test STAC Discovery + AI Inference State Tracking
  const testBbox: [number, number, number, number] = [85.08, 27.85, 85.22, 27.97];
  const testDatetime = '2026-08-01T00:00:00Z/2026-08-20T23:59:59Z';
  const scenes = await searchStacScenes({ bbox: testBbox, datetime: testDatetime, limit: 1 });

  const sceneId = scenes.length > 0 ? scenes[0].sceneId : 'dummy_scene_01';
  console.log(`[Task 4] Running AI Inference pipeline state check for scene: ${sceneId}`);

  const inferenceResult = await runAIInferencePipeline(sceneId, { minLat: 27.85, maxLat: 27.97, minLng: 85.08, maxLng: 85.22 });
  console.log('AI Inference Pipeline Result:', inferenceResult);

  console.log('=== FLOODWATCH PHASE 3B VERIFICATION COMPLETED ===');
}

runPhase3BVerification();
