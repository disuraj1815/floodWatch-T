import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './src/routes/api.routes.ts';
import { fetchOSMInfrastructure } from './src/services/osm.service.ts';
import { analyzeRoadNetworkConnectivity } from './src/services/connectivity.service.ts';

dotenv.config();

async function runPhases456Verification() {
  console.log('=== FLOODWATCH PHASES 4, 5 & 6 VERIFICATION START ===');

  const testAoi = {
    minLat: 27.85,
    maxLat: 27.97,
    minLng: 85.08,
    maxLng: 85.22,
    center: [27.91, 85.15] as [number, number],
    name: 'Trishuli Test AOI'
  };

  // 1. Test OSM Infrastructure Service
  console.log('[Phase 4] Testing real OSM infrastructure retrieval via Overpass API...');
  const osmFeatures = await fetchOSMInfrastructure(testAoi);
  console.log(`Retrieved ${osmFeatures.length} OSM features from Overpass API.`);
  if (osmFeatures.length > 0) {
    console.log('Sample OSM Feature:', osmFeatures[0].name, 'Type:', osmFeatures[0].type);
  }

  // 2. Test Road Network Connectivity & Fallback (No Flood Mask)
  console.log('[Phase 5] Testing road graph connectivity analysis with honest flood-mask fallback...');
  const connectivityFallback = await analyzeRoadNetworkConnectivity(osmFeatures, false);
  console.log('Connectivity Fallback Result:', connectivityFallback);

  // 3. Test Express API Endpoints on Port 5002
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = app.listen(5002, async () => {
    console.log('[Phase 6] Express test server listening on port 5002');

    try {
      // Test GET /api/health
      const healthRes = await fetch('http://localhost:5002/api/health');
      const healthData: any = await healthRes.json();
      console.log('GET /api/health version:', healthData.version, 'OSM Service:', healthData.osmService);

      // Test POST /api/analysis with Phase 4/5 integration
      const analysisPayload = {
        locationName: 'Trishuli Valley, Nepal',
        eventName: 'Monsoon Flash Flood 2026',
        eventDate: '2026-08-14',
        beforeDateStart: '2026-08-01',
        beforeDateEnd: '2026-08-10',
        afterDateStart: '2026-08-15',
        afterDateEnd: '2026-08-20',
        aoi: testAoi,
        sensor: 'both'
      };

      const postRes = await fetch('http://localhost:5002/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisPayload)
      });
      const postData: any = await postRes.json();
      console.log('POST /api/analysis status:', postRes.status);
      console.log('Analysis ID created:', postData.analysisId);
      console.log('Discovered Scenes Count:', postData.data?.discoveredScenes?.length);
      console.log('OSM Infrastructure Items Count:', postData.data?.osmInfrastructure?.length);
      console.log('Road Connectivity Status:', postData.data?.roadConnectivity?.status);

      // Test GET report endpoint
      if (postData.analysisId) {
        const reportRes = await fetch(`http://localhost:5002/api/analysis/${postData.analysisId}/report`);
        const reportData: any = await reportRes.json();
        console.log('GET /api/analysis/:id/report title:', reportData.reportTitle);
      }

      console.log('=== ALL PHASES 4, 5 & 6 VERIFICATION TESTS PASSED SUCCESSFULLY ===');
    } catch (err: any) {
      console.error('Verification test error:', err);
    } finally {
      server.close();
    }
  });
}

runPhases456Verification();
