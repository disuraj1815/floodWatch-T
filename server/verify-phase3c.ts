import { checkAIModelAvailability, runAIInferencePipeline } from './src/services/ai.service.ts';

async function runPhase3CVerification() {
  console.log('=== FLOODWATCH PHASE 3C VERIFICATION START ===');

  console.log('[Task 2 & 5] Checking AI Model Availability & Python ML Worker connection...');
  const modelStatus = await checkAIModelAvailability();
  console.log('Model & Worker Status Result:', modelStatus);

  console.log('[Task 4] Testing inference pipeline with offline/missing worker guard...');
  const inferenceResult = await runAIInferencePipeline('S2B_45RUL_20260817_0_L2A', { minLat: 27.85, maxLat: 27.97, minLng: 85.08, maxLng: 85.22 });
  console.log('Inference Pipeline Result:', inferenceResult);

  console.log('=== FLOODWATCH PHASE 3C VERIFICATION COMPLETED ===');
}

runPhase3CVerification();
