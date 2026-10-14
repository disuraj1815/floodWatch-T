# FloodWatch — 3-Minute Demo Script
## Multimodal AI Hackathon 2026 — Track B

---

### Setup Before Recording
- Start backend: `npm run server:dev` (terminal 1)
- Start frontend: `npm run dev` (terminal 2)
- Start ML worker: `cd ml-worker && python main.py` (terminal 3)
- Open browser to http://localhost:3000
- Have Trishuli, Nepal ready as primary demo location

---

### 0:00 – 0:20 | Opening — What is FloodWatch?

**Screen**: Dashboard page

**Say**:
> "This is FloodWatch — an AI-assisted satellite flood mapping platform built for Track B. When a flood event occurs, emergency responders need rapid, satellite-based evidence of which infrastructure is cut off. FloodWatch connects real Copernicus Sentinel satellite data, AI flood segmentation, and OpenStreetMap infrastructure analysis in a single workflow."

**Action**: Point to the sidebar showing "Backend API: Connected" in green.

---

### 0:20 – 0:50 | Location & AOI Selection

**Screen**: Flood Analysis page

**Say**:
> "A user types a location — here, Trishuli, Nepal, August 2026 — and the map geocodes it using OpenStreetMap Nominatim. They confirm the AOI bounding box, set before and after dates, and choose Sentinel-1 SAR for all-weather coverage."

**Action**:
1. Type "Trishuli, Nepal" in search box → press Search
2. Show the map re-centering to Trishuli
3. Show the AOI rectangle on the map with coordinates displayed
4. Set event date to 2026-08-14
5. Select "Sentinel-1 & Sentinel-2"

---

### 0:50 – 1:30 | Real Satellite Scene Discovery

**Screen**: Satellite Observations page (or analysis result)

**Say**:
> "FloodWatch queries the official Copernicus Data Space STAC API and retrieves real satellite scenes. Here you can see actual Sentinel-2 scene IDs with acquisition timestamps — this is real metadata from ESA's Earth Observation catalogue, not placeholder data."

**Action**:
1. Click "Start Analysis"
2. Show the discovered scenes list: real IDs like `S2B_MSIL2A_20260817...`
3. Show cloud cover percentages and orbit information for Sentinel-1

**Say**:
> "Notice the cloud cover warning on the August 17th scene — 97%. FloodWatch flags this as unsuitable optical data and recommends the SAR scene instead, which penetrates cloud cover."

---

### 1:30 – 2:00 | AI Model Status & Flood Mask

**Screen**: System Diagnostics or AI status panel

**Say**:
> "The AI segmentation pipeline uses a U-Net architecture trained for Sentinel satellite flood detection. The model loads from a checkpoint and processes a 512×512 pixel window of the AOI, producing a georeferenced binary flood mask. Each pixel is classified as flooded or non-flooded."

**Action**: Show the model status panel displaying architecture, input bands, and CRS.

**Say**:
> "The system is fully transparent — it only reports inference as complete when the model has actually run. Missing weights or failed raster reads produce clear error messages, never fabricated results."

---

### 2:00 – 2:40 | Infrastructure Impact & Road Connectivity

**Screen**: Infrastructure Impact and Road Connectivity pages

**Say**:
> "Once a flood mask is generated, FloodWatch queries pre-event OpenStreetMap data — roads, bridges, hospitals, settlements — and tests which features spatially intersect or lie near the flood extent. Every flagged feature shows the evidence behind it."

**Action**:
1. Show infrastructure table with "POTENTIALLY AFFECTED" labels
2. Switch to Road Connectivity page
3. Show settlement connectivity analysis

**Say**:
> "Importantly, we label results as POTENTIALLY AFFECTED and POTENTIALLY CUT-OFF — never confirmed damage. We explain the spatial evidence, the uncertainty, and the limitations."

---

### 2:40 – 3:00 | Situation Report & Attributions

**Screen**: Situation Report page

**Say**:
> "Finally, FloodWatch generates a printable situation report containing observed satellite dates, data quality, findings, and uncertainty — everything a first responder needs to know. All required Copernicus and OpenStreetMap attributions are included. This is a decision-support prototype, not a substitute for emergency services."

**Action**: Show the report and click Print/Export PDF.

**Closing**: "FloodWatch — open-source, satellite-powered, AI-assisted flood intelligence."

---

### Post-Recording
- Export PDF report
- Run `npm run build` to verify build passes
- Push final commit to GitHub
