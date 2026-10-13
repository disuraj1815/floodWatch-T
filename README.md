# FloodWatch
## AI-Assisted Satellite Flood Mapping and Infrastructure Impact Assessment Platform

**Multimodal AI Hackathon 2026 — Track B: Mapping Flood Damage from Space**

---

### Project Overview
FloodWatch is a professional geospatial analysis platform designed for rapid situational awareness, radar/optical satellite observation discovery (Sentinel-1 SAR and Sentinel-2 MSI optical), OpenStreetMap infrastructure impact assessment, road network graph connectivity analysis, and EMSR927 validation benchmarking during extreme hydrological events.

---

### Key Features & Architecture
1. **Interactive GIS Frontend**: Built with React, TypeScript, Vite, Tailwind CSS, React Router, and React-Leaflet with CartoDB Dark Matter tiles, location geocoding, and bounding box Area of Interest (AOI) selection.
2. **Multilingual Support**: Fully functional UI language switching for **English (en)**, **Hindi (hi)**, and **Nepali (ne)**.
3. **Node.js Express Backend**: REST API providing health diagnostics, analysis request submission, STAC metadata querying, and situation report generation.
4. **Copernicus Data Space STAC Integration**: Official STAC API (`https://stac.dataspace.copernicus.eu/v1/search`) querying real Sentinel-1 SAR and Sentinel-2 optical scenes.
5. **Raster Pipeline**: Cloud Optimized GeoTIFF (COG) streaming and validation via `rasterio` and `/vsicurl/`.
6. **OpenStreetMap Infrastructure Pipeline**: Real OSM Overpass API integration retrieving roads, bridges, hospitals, and schools with honest fallback when flood masks are absent.
7. **Road Network Connectivity Analysis**: Road graph network construction with strict flood-mask gating (`unavailable_no_flood_mask`).
8. **Python FastAPI ML Worker**: Geospatial AI worker (`ml-worker/`) configured for `Sen1Floods11-ResNet-Unet` segmentation, with strict safety guards against missing model weights.

---

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet, React-Leaflet, Lucide React
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB optional / standalone mode)
- **Satellite Services**: Copernicus Data Space STAC API, AWS Earth Search STAC
- **ML Worker**: Python 3.10+, FastAPI, Uvicorn, PyTorch, Rasterio

---

### Installation & Environment Setup

#### 1. Frontend & Backend Setup
```bash
# Install root (frontend & backend) dependencies
npm install
```

#### 2. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/floodwatch?retryWrites=true&w=majority
NODE_ENV=development
STAC_API_URL=https://stac.dataspace.copernicus.eu/v1
```

#### 3. Python ML Worker Setup
```bash
cd ml-worker
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### Running the Application

- **Start Frontend Dev Server**:
  ```bash
  npm run dev
  ```
  *(Accessible at `http://localhost:3000`)*

- **Start Backend Node.js API Server**:
  ```bash
  npm run server:dev
  ```
  *(Accessible at `http://localhost:5000`)*

- **Start Python FastAPI ML Worker**:
  ```bash
  cd ml-worker
  python main.py
  ```
  *(Accessible at `http://localhost:8000`)*

---

### Test Commands
- **Frontend Production Build**:
  ```bash
  npm run build
  ```
- **Copernicus STAC Verification**:
  ```bash
  npx ts-node server/verify-copernicus-stac.ts
  ```
- **Phases 4, 5 & 6 Integration Verification**:
  ```bash
  npx ts-node server/verify-phases4-5-6.ts
  ```
- **Python ML Worker Tests**:
  ```bash
  python ml-worker/test_worker.py
  ```

---

### Data Sources & Mandatory Attributions
- *“Contains modified Copernicus Sentinel data 2026.”*
- *“Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.”*
- *“© OpenStreetMap contributors.”*

---

### Current Limitations & AI Model Status
- **AI Segmentation Status**: The AI inference pipeline and model status reporting are fully configured, but automated flood mask generation is currently **gated** (status: `not_downloaded` / `worker_offline`) because pretrained checkpoint weights (`sen1floods11_unet.pt`) are not present in the execution environment. The system strictly halts inference to prevent fabricated predictions.
