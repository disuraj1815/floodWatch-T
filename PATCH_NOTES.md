# FloodWatch-T Repair Copy — Patch Notes

This ZIP is a repaired copy of the supplied archive. The original ZIP was not modified.

## Changes made

- Connected the active root frontend analysis form to `POST /api/analysis` and added request timeout, date/AOI validation, loading state, and clearer API errors.
- Removed the frontend's fake offline satellite-scene fallback. Failed backend requests now show an error and do not create a pretend success state.
- Replaced the hardcoded backend-disconnected message with the actual API response, analysis ID, scene count, and AI status message.
- Removed fabricated AI confidence scores and fixed flood-area fallback values.
- Aligned backend AI response handling with the Python worker's actual response fields and only calculates an AOI-based area estimate when a completed mask and valid flood fraction are returned.
- Passed a compatible RGB/TCI asset to inference only when the STAC scene provides one; otherwise the app reports that inference was skipped.
- Added request timeouts to ML and STAC requests.
- Added provider-specific STAC collection names and more accurate provider attribution for fallback results.
- Added validation for event dates and AOI bounds.
- Extended the MongoDB schema so the analysis pipeline metadata and scene assets are not silently discarded by strict schema behavior.
- Fixed OSM Overpass output so way features include centers, and corrected coordinate handling for zero-valued coordinates.
- Removed fabricated road graph edges and claims of completed road-connectivity analysis. The app now reports that real graph reachability remains unimplemented.
- Stopped labeling infrastructure as potentially affected without an implemented spatial intersection between the flood mask and infrastructure features.
- Restricted backend CORS to configured frontend origins and added related example environment variables.
- Documented which frontend is active when running from the repository root.

## Validation performed

- Python files passed `py_compile` syntax checks.
- Existing package JSON files parsed successfully.
- Static checks confirmed the known fabricated AI fallback values and simulated frontend scene were removed.

## Not verified in this environment

- A full TypeScript/Vite production build was not run because dependency installation did not complete in this environment.
- Live Copernicus/AWS STAC access, Overpass access, MongoDB persistence, and Python model inference were not end-to-end tested.
- The pretrained model checkpoint is not included in this ZIP. Real AI inference still requires a compatible checkpoint and a supported RGB/TCI raster asset.
- Full flood-mask-to-infrastructure intersection and real road-network reachability are still not implemented; the application intentionally reports those outputs as unverified/unavailable rather than inventing results.
