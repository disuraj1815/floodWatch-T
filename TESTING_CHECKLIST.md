# FloodWatch — Testing & Verification Checklist

Use this checklist to verify each component of the FloodWatch application during local development or evaluation.

---

### 1. Environment & Database Check
- [ ] `.env` file exists in project root with `MONGODB_URI` configured.
- [ ] Backend starts successfully (`npm run server`) and connects to MongoDB Atlas (or falls back gracefully to standalone mode if network restricts DNS SRV).
- [ ] Backend health endpoint (`GET /api/health`) responds with `status: "ok"` and database status.

### 2. Frontend & Map Verification
- [ ] Frontend builds successfully (`npm run build`).
- [ ] Frontend dev server runs (`npm run dev`) and opens at `http://localhost:3000`.
- [ ] Interactive map renders correctly with CARTO Dark Matter tiles.
- [ ] Location search (e.g., "Trishuli, Nepal" or "Uttarakhand, India") successfully geocodes via Nominatim and re-centers the map.
- [ ] AOI bounding box rectangle and marker render correctly on the map.

### 3. Satellite Data & STAC API Check
- [ ] STAC scene discovery queries the Copernicus Data Space STAC API (`https://stac.dataspace.copernicus.eu/v1/search`).
- [ ] Real Sentinel-2 L2A and Sentinel-1 GRD scene metadata (scene IDs, acquisition dates, cloud cover) are retrieved and displayed.
- [ ] Missing or cloudy data is handled gracefully with clear warnings.

### 4. AI ML Worker Check
- [ ] Python ML worker (`ml-worker/main.py`) starts on port 8000 via FastAPI.
- [ ] Model status endpoint (`GET http://localhost:8000/model/status`) correctly reports model architecture (`Sen1Floods11-ResNet-Unet`) and weight availability.
- [ ] When weights are missing (`sen1floods11_unet.pt`), the system safely skips inference without fabricating data or crashing.
- [ ] When weights are supplied, POST `/predict` executes successfully and generates a georeferenced flood mask.

### 5. Infrastructure & Situation Report Check
- [ ] OpenStreetMap Overpass API queries pre-event infrastructure (roads, bridges, hospitals, settlements).
- [ ] Infrastructure impact analysis lists potentially affected assets based on spatial proximity.
- [ ] Situation Report page generates a complete summary with proper attributions and data quality notes.
