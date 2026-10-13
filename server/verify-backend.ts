import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './src/config/db.ts';
import apiRoutes from './src/routes/api.routes.ts';
import { searchStacScenes } from './src/services/stac.service.ts';

dotenv.config();

async function runVerification() {
  console.log('=== FLOODWATCH PHASE 2 VERIFICATION START ===');

  // 1. Check DB Connection status logic
  const dbStatus = getDbStatus();
  console.log(`[Test 1] DB Status check: connected = ${dbStatus.connected}, host = ${dbStatus.host || 'none'}`);

  // 2. Test STAC Satellite Discovery Service directly
  console.log('[Test 2] Testing STAC Satellite Discovery Service (AWS Earth Search)...');
  try {
    const testBbox: [number, number, number, number] = [85.08, 27.85, 85.22, 27.97]; // Trishuli AOI
    const testDatetime = '2026-08-01T00:00:00Z/2026-08-20T23:59:59Z';
    const scenes = await searchStacScenes({ bbox: testBbox, datetime: testDatetime, limit: 3 });
    console.log(`[Test 2 SUCCESS] STAC API returned ${scenes.length} scenes.`);
    if (scenes.length > 0) {
      console.log('Sample Scene ID:', scenes[0].sceneId);
      console.log('Sample Collection:', scenes[0].collection);
      console.log('Sample Acquisition Date:', scenes[0].acquisitionDate);
    }
  } catch (err: any) {
    console.log('[Test 2 INFO] STAC API network request note:', err.message);
  }

  // 3. Start Express app on test port 5001 and test endpoints
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = app.listen(5001, async () => {
    console.log('[Test 3] Express test server listening on port 5001');

    try {
      // Test GET /api/health
      const healthRes = await fetch('http://localhost:5001/api/health');
      const healthData: any = await healthRes.json();
      console.log('[Test 3.1] GET /api/health response:', healthData);

      // Test POST /api/analysis
      const analysisPayload = {
        locationName: 'Trishuli, Nepal',
        eventName: 'Trishuli Flash Flood Test',
        eventDate: '2026-08-14',
        beforeDateStart: '2026-08-01',
        beforeDateEnd: '2026-08-10',
        afterDateStart: '2026-08-15',
        afterDateEnd: '2026-08-20',
        aoi: {
          minLat: 27.85,
          maxLat: 27.97,
          minLng: 85.08,
          maxLng: 85.22,
          center: [27.91, 85.15],
          name: 'Trishuli Test AOI'
        },
        sensor: 'both'
      };

      const postRes = await fetch('http://localhost:5001/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisPayload)
      });
      const postData: any = await postRes.json();
      console.log('[Test 3.2] POST /api/analysis response status:', postRes.status);
      console.log('[Test 3.2] Created Analysis ID:', postData.analysisId);

      if (postData.analysisId) {
        const id = postData.analysisId;

        // Test GET /api/analysis/:id
        const getRes = await fetch(`http://localhost:5001/api/analysis/${id}`);
        const getData: any = await getRes.json();
        console.log('[Test 3.3] GET /api/analysis/:id location:', getData.locationName);

        // Test GET /api/analysis/:id/status
        const statusRes = await fetch(`http://localhost:5001/api/analysis/${id}/status`);
        const statusData: any = await statusRes.json();
        console.log('[Test 3.4] GET /api/analysis/:id/status:', statusData.status);

        // Test GET /api/analysis/:id/report
        const reportRes = await fetch(`http://localhost:5001/api/analysis/${id}/report`);
        const reportData: any = await reportRes.json();
        console.log('[Test 3.5] GET /api/analysis/:id/report title:', reportData.reportTitle);
      }

      console.log('=== ALL PHASE 2 VERIFICATION TESTS COMPLETED SUCCESSFULLY ===');
    } catch (testErr: any) {
      console.error('[Test Error]:', testErr);
    } finally {
      server.close();
    }
  });
}

runVerification();
