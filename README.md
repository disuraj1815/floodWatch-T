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

### AI Model Specifications & Provenance
- **Model Name**: `Sen1Floods11-ResNet-Unet`
- **Architecture**: U-Net architecture with a ResNet-34 encoder backbone implemented in PyTorch (`ml-worker/model.py`).
- **Training Dataset**: Sen1Floods11 benchmark dataset (hand-labeled surface water & flood extents across 11 global flood events).
- **Supported Sensors & Input Channels**:
  - Optical: 3 Channels — Sentinel-2 L2A Red (`B04`), Green (`B03`), Blue (`B02`) / TCI.
  - SAR: 2 Channels — Sentinel-1 GRD `VV` and `VH` polarizations.
- **Expected Tensor Dimensions**: `[1, 3, 512, 512]` (Batch, Channels, Height, Width).
- **Preprocessing & Normalization**:
  - Resized/cropped to 512x512 windows aligned with the user AOI bounding box.
  - Value scaling: Scaled to `[0.0, 1.0]` followed by channel normalization:
    - Mean: `[0.485, 0.456, 0.406]`
    - Std: `[0.229, 0.224, 0.225]`
- **Output Mask Classes**:
  - `0`: Non-Flooded Background / Dry Land
  - `1`: Flooded Water Extent
- **License**: MIT / Open Research License.
- **CPU Inference Support**: Fully supported via PyTorch CPU mapping (`map_location=torch.device('cpu')`).

---

### Current Limitations & AI Model Status
- **Pretrained Checkpoint Status**: Official Sen1Floods11 benchmarking repositories provide dataset splits and training scripts, but do not host an official public static `.pt` checkpoint file.
- **Inference Safety Guard**: Automated flood mask generation is currently **gated** (status: `weights_missing` / `not_downloaded`) because the checkpoint file `./models/sen1floods11_unet.pt` is not present in the workspace sandbox.
- **Zero Fabrication Guarantee**: The system strictly refuses to generate mock flood polygons, random weights, or heuristic thresholding masquerading as AI inference. The `/predict` endpoint returns HTTP 400 with actionable error messages when weights are absent.
- **To Enable Live Inference**:
  1. Train or place a compatible PyTorch state_dict checkpoint at `./models/sen1floods11_unet.pt`.
  2. Start the FastAPI ML worker (`cd ml-worker && python main.py`).
  3. The worker will automatically load the weights onto CPU/GPU and enable real-time inference on preprocessed Sentinel-2 COG raster pixels.
