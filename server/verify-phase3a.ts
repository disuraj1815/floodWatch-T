import { searchStacScenes } from './src/services/stac.service.ts';
import { inspectRasterAsset } from './src/services/raster.service.ts';
import { runPreprocessingPipeline } from './src/services/preprocess.service.ts';

async function runPhase3AVerification() {
  console.log('=== FLOODWATCH PHASE 3A VERIFICATION START ===');

  const testBbox: [number, number, number, number] = [85.08, 27.85, 85.22, 27.97]; // Trishuli AOI
  const testDatetime = '2026-08-01T00:00:00Z/2026-08-20T23:59:59Z';

  console.log('[Task 1 & 2] Searching STAC API and inspecting raster assets...');
  const scenes = await searchStacScenes({ bbox: testBbox, datetime: testDatetime, limit: 2 });
  console.log(`Discovered ${scenes.length} scenes from STAC API.`);

  if (scenes.length > 0) {
    const firstScene = scenes[0];
    console.log(`Inspecting assets for scene ID: ${firstScene.sceneId} (Collection: ${firstScene.collection})`);

    const assetKeys = Object.keys(firstScene.assets || {}).slice(0, 3);
    for (const key of assetKeys) {
      const assetObj = firstScene.assets[key];
      const inspection = await inspectRasterAsset(key, assetObj);
      console.log(`- Asset [${key}]: accessible = ${inspection.isAccessible}, message = ${inspection.message}, type = ${inspection.type || 'unknown'}`);
    }

    console.log('[Task 3] Running preprocessing pipeline & spatial intersection validation...');
    const aoiGeometry = {
      minLat: 27.85,
      maxLat: 27.97,
      minLng: 85.08,
      maxLng: 85.22,
      center: [27.91, 85.15] as [number, number],
      name: 'Trishuli Test AOI'
    };

    const preprocessing = await runPreprocessingPipeline(aoiGeometry, firstScene.bbox);
    console.log('Preprocessing Result:', preprocessing);
  } else {
    console.log('NO SUITABLE SATELLITE DATA AVAILABLE for the specified AOI and time window.');
  }

  console.log('=== FLOODWATCH PHASE 3A VERIFICATION COMPLETED ===');
}

runPhase3AVerification();
