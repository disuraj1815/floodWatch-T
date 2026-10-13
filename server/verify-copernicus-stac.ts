import { searchStacScenes } from './src/services/stac.service.ts';

async function testCopernicusStac() {
  console.log('=== TESTING OFFICIAL COPERNICUS DATA SPACE STAC API ===');

  const testBbox: [number, number, number, number] = [85.08, 27.85, 85.22, 27.97]; // Trishuli AOI
  const testDatetime = '2026-08-01T00:00:00Z/2026-08-20T23:59:59Z';

  console.log('Searching for Sentinel-1 & Sentinel-2 scenes in Trishuli AOI...');
  const scenes = await searchStacScenes({
    bbox: testBbox,
    datetime: testDatetime,
    collections: ['sentinel-2-l2a', 'sentinel-1-grd'],
    limit: 5
  });

  console.log(`STAC API search returned ${scenes.length} total scenes.`);
  for (const scene of scenes) {
    console.log(`- Provider: ${scene.provider}`);
    console.log(`  Collection: ${scene.collection}`);
    console.log(`  Scene ID: ${scene.sceneId}`);
    console.log(`  Acquisition Date: ${scene.acquisitionDate}`);
    if (scene.cloudCover !== undefined) console.log(`  Cloud Cover: ${scene.cloudCover}%`);
    if (scene.polarization) console.log(`  Polarization: ${scene.polarization}`);
    console.log(`  Asset Keys: ${Object.keys(scene.assets).join(', ')}`);
  }

  console.log('=== COPERNICUS STAC API TEST COMPLETED ===');
}

testCopernicusStac();
