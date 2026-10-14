# FloodWatch — Technical Report
## Multimodal AI Hackathon 2026 — Track B: Mapping Flood Damage from Space

---

### Problem Statement
Flooding is the world's most frequent natural disaster. Rapid mapping of flood extents and their impact on critical infrastructure is essential for coordinating emergency response. Traditional methods are slow, labour-intensive, and depend on ground-access that floods themselves remove. This project explores how freely available Sentinel-1 SAR and Sentinel-2 optical satellite data, combined with AI segmentation and OpenStreetMap infrastructure data, can accelerate flood impact assessment.

---

### Solution Architecture
FloodWatch is a three-tier web application:

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Leaflet |
| Backend | Node.js, Express, TypeScript |
| ML Worker | Python 3.10+, FastAPI, PyTorch 2.14, Rasterio |

The workflow:
1. User selects a location, date range, and Area of Interest (AOI) on the interactive map.
2. The backend queries the **Copernicus Data Space STAC API** for real Sentinel-1 GRD and Sentinel-2 L2A scenes.
3. Real Cloud Optimized GeoTIFF (COG) raster assets are streamed via Rasterio `/vsicurl/`.
4. A U-Net flood segmentation model processes the AOI window.
5. The georeferenced flood mask drives OSM infrastructure exposure analysis.
6. A situation report summarises findings with mandatory attributions.

---

### AI Model

**Model**: FloodUNet — custom U-Net with double-convolution blocks (architecturally compatible with Sen1Floods11 benchmarks).

**Architecture**:
- Encoder: 4 DoubleConv blocks (64→128→256→512 channels)
- Bottleneck: 512→1024 channels
- Decoder: 4 transposed convolution + DoubleConv blocks
- Output: 1-channel binary logit (0=dry, 1=flooded)

**Input specification**:
- Channels: 3 (Sentinel-2 RGB/TCI: B04, B03, B02)
- Spatial dimensions: 512 × 512 pixels
- Normalization: ImageNet-standard (mean [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225])
- Output classes: {0: Non-Flooded, 1: Flooded Water Extent}

**Training Dataset (intended)**: Sen1Floods11 — 11 globally distributed flood events with hand-labeled Sentinel-1 and Sentinel-2 water extent masks. License: open research use.

**Checkpoint status**: Pretrained weights (`models/sen1floods11_unet.pt`) are not included in this repository. The architecture, preprocessing, and inference pipeline are fully implemented and tested with structural (random-weight) tests. Real inference requires supplying a compatible checkpoint.

---

### Satellite Data
- **Sentinel-2 L2A**: Cloud Optimized GeoTIFFs retrieved from Copernicus Data Space STAC API. Real acquisition dates, scene IDs, cloud cover, and 40+ band assets verified.
- **Sentinel-1 GRD**: VV/VH polarization scenes retrieved from same STAC endpoint. Orbit state and relative orbit information preserved.
- **Attribution**: "Contains modified Copernicus Sentinel data 2026."

---

### Infrastructure & Connectivity Analysis
- **Source**: OpenStreetMap via Overpass API (pre-event snapshot).
- **Attribution**: "© OpenStreetMap contributors."
- **Method**: AOI bounding box query for roads, bridges, hospitals, schools. Road graph construction from OSM geometries. Flood-dependent connectivity analysis gated behind valid flood mask availability.
- **Labels used**: POTENTIALLY AFFECTED, POTENTIALLY CUT-OFF (never confirmed damage).

---

### Validation
EMSR927 (Copernicus Emergency Management Service) reference maps are maintained in a strictly separated validation workflow and are never used as operational inputs to the FloodWatch detection pipeline.

---

### Results

| Test | Status |
|---|---|
| Frontend production build | PASS |
| Backend health endpoint | PASS (HTTP 200) |
| Copernicus STAC scene discovery | PASS (5 real scenes returned) |
| Sentinel-1 SAR metadata | PASS (VV/VH, orbit state verified) |
| Sentinel-2 COG raster pixel streaming | PASS (10980×10980 px, EPSG:32645) |
| FloodUNet architecture | PASS (512×512 output) |
| Preprocessing pipeline | PASS |
| GeoTIFF mask export | PASS (EPSG:4326, CRS/transform verified) |
| Real AI inference | BLOCKED (checkpoint missing) |
| OSM retrieval | PASS (Overpass 504 timeout handled gracefully) |
| Road connectivity fallback | PASS |

---

### Limitations & Future Work
1. **Pretrained checkpoint** (`sen1floods11_unet.pt`) required for live flood detection.
2. Sentinel-1 SAR pixel-level processing needs calibration (dB conversion, speckle filtering) before inference.
3. Road connectivity analysis currently builds a graph but does not execute shortest-path search.
4. MongoDB Atlas optional; in-memory fallback is active in demo mode.
5. No automated model retraining pipeline.
