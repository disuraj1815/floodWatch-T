# FloodWatch — AI-Assisted Satellite Flood Mapping & Infrastructure Impact Analysis

**Multimodal AI Hackathon 2026 — Track B Submission**

FloodWatch is an advanced web application and geospatial pipeline designed to accelerate flood impact assessment. By integrating Copernicus Sentinel satellite observations, AI-driven flood segmentation (Sen1Floods11 U-Net), and OpenStreetMap (OSM) infrastructure data, FloodWatch provides emergency responders and disaster management authorities with rapid, transparent, and actionable intelligence during extreme weather events.

---

## 🌟 Key Features

1. **Interactive Geospatial Map & AOI Selection:**
   - Leaflet-based mapping interface with CARTO Dark Matter tiles.
   - Global location geocoding via OpenStreetMap Nominatim.
   - Bounding box Area of Interest (AOI) definition and coordinate visualization.

2. **Real Satellite Scene Discovery:**
   - Direct integration with the **Copernicus Data Space STAC API**.
   - Queries real Sentinel-2 L2A (optical) and Sentinel-1 GRD (SAR all-weather) scenes.
   - Automatically surfaces acquisition dates, cloud cover percentages, and asset URLs.

3. **AI Flood Segmentation Pipeline:**
   - PyTorch-based U-Net architecture (`FloodUNet`) inspired by the Sen1Floods11 benchmark.
   - FastAPI Python ML worker (`ml-worker/`) for raster inspection, preprocessing, and inference.
   - Transparent handling of missing model weights (no fabricated outputs or fake confidence scores).

4. **Infrastructure Exposure & Road Connectivity:**
   - Overpass API integration for pre-event OpenStreetMap infrastructure (roads, bridges, hospitals, settlements).
   - Spatial intersection analysis to identify potentially affected infrastructure and cut-off settlements.

5. **Situation Reporting & Validation:**
   - Structured situation reports with mandatory Copernicus and OpenStreetMap attributions.
   - Strict separation of official Copernicus EMS (EMSR927) reference maps for validation only.

---

## 🏗️ Architecture

```
┌─────────────────────────┐          ┌─────────────────────────┐
│     React Frontend      │◄────────►│    Node.js / Express    │
│  (Vite + Tailwind CSS)  │          │      Backend API        │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                         Mongoose │ MongoDB Atlas
                                                  ▼
                                     ┌─────────────────────────┐
                                     │      MongoDB Atlas      │
                                     │   (Persistence Layer)   │
                                     └─────────────────────────┘
                                                  │
                                         HTTP API │ (Port 8000)
                                                  ▼
                                     ┌─────────────────────────┐
                                     │     Python ML Worker    │
                                     │   (FastAPI + PyTorch)   │
                                     └─────────────────────────┘
```

---

## ⚙️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (v3.10 or higher) for the ML worker
- **MongoDB Atlas** connection string (configured in `.env`)

---

## 🚀 Quick Start & PowerShell Startup Commands

To run the project locally, open **three separate PowerShell windows** in the project directory (`C:\Users\Dell\fw`):

### Terminal 1: Backend Server
```powershell
npm run server
```
*(Or for hot-reloading development mode:* `npm run server:dev` *)*

### Terminal 2: Python ML Worker (Optional for AI Inference)
```powershell
cd ml-worker
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
python main.py
```

### Terminal 3: Frontend Development Server
```powershell
npm run dev
```
Then open your browser to **http://localhost:3000**.

---

## 📁 Repository Structure

- `src/` — React frontend components, pages, and router.
- `server/` — Express backend API, STAC integration, and controllers.
- `ml-worker/` — FastAPI Python service, PyTorch model definition (`model.py`), and inference pipeline (`inference.py`).
- `REPORT.md` — Detailed technical report and architecture notes.
- `DEMO_SCRIPT.md` — 3-minute video presentation guide.
- `TESTING_CHECKLIST.md` — Step-by-step verification instructions.
- `DATA_SOURCES.md` — Attribution and licensing documentation.


## Integration and result-integrity notes

- The analysis form calls the real `POST /api/analysis` endpoint through the Vite `/api` proxy. Backend/network failures are shown as errors; no simulated satellite scene is created on failure.
- AI inference is only attempted when the worker reports a ready model and a compatible RGB/TCI asset is present. Missing model weights, unsupported assets, or failed inference remain unavailable rather than being replaced with fabricated metrics.
- Confidence scores are not emitted because the current worker does not calculate calibrated confidence scores. Flood-area estimates are only returned when the worker reports a completed mask and valid flood fraction; the area is an AOI-based estimate, not independent ground truth.
- Infrastructure impacts and cut-off settlements are not claimed as verified until feature-to-mask spatial intersection and real road-graph reachability are implemented.
- External STAC, OSM, MongoDB, and ML-worker behavior still depends on network access, provider availability, environment configuration, and a compatible model checkpoint.


## Which frontend is active?

When commands are run from the repository root, Vite uses the root `src/` directory and root `vite.config.ts`. The nested `fw/` directory contains a separate/older frontend copy and is not used by the root scripts. Start the app from the repository root unless you intentionally maintain that nested copy.
