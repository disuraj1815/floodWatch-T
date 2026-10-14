# FloodWatch — Data Sources, Attribution & Licensing

FloodWatch integrates open-access Earth Observation satellite data, AI model benchmarks, and crowdsourced geographic information. All data sources are properly attributed in accordance with provider terms.

---

### 1. Satellite Observation Data
- **Provider:** Copernicus Data Space Ecosystem / European Space Agency (ESA).
- **Datasets:**
  - **Sentinel-2 Multispectral Instrument (MSI) Level-2A:** High-resolution optical imagery (10m-20m bands) used for pre/post-event flood extent comparison.
  - **Sentinel-1 C-band Synthetic Aperture Radar (SAR) Ground Range Detected (GRD):** All-weather radar imagery (VV/VH polarization) capable of penetrating cloud cover.
- **Attribution Notice:** 
  > *"Contains modified Copernicus Sentinel data [2026], processed by FloodWatch."*
- **License:** Copernicus Sentinel Data Legal Notice (Free, full and open access).

---

### 2. AI Segmentation Dataset & Model
- **Dataset:** **Sen1Floods11** — A global benchmark dataset for flood detection from Sentinel-1 and Sentinel-2 imagery.
- **Model Architecture:** U-Net with ResNet-34 encoder (`FloodUNet`).
- **Attribution & Licensing:** Published under open research licenses for academic and disaster response prototyping.

---

### 3. Geographic & Infrastructure Data
- **Provider:** OpenStreetMap (OSM) via Overpass API.
- **Data Extracted:** Roads, bridges, waterways, hospitals, schools, and settlement boundaries.
- **Attribution Notice:**
  > *"© OpenStreetMap contributors."* (www.openstreetmap.org/copyright)
- **License:** Open Database License (ODbL).

---

### 4. Reference Validation Data
- **Dataset:** Copernicus Emergency Management Service (CEMS) — EMSR927 activation reference maps.
- **Usage:** Maintained strictly in a separate validation module to assess historical flood event accuracy. Never used as operational input for automated detection.
- **Attribution:** Copernicus Emergency Management Service © European Union.
