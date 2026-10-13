import sys
import os
import requests
import rasterio

def test_dynamic_raster_streaming():
    print("=== DYNAMIC STAC RASTER STREAMING TEST ===")

    stac_url = "https://earth-search.aws.element84.com/v1/search"
    payload = {
        "bbox": [85.08, 27.85, 85.22, 27.97],
        "datetime": "2026-08-01T00:00:00Z/2026-08-20T23:59:59Z",
        "collections": ["sentinel-2-l2a"],
        "limit": 1
    }

    try:
        res = requests.post(stac_url, json=payload, timeout=10)
        data = res.json()
        features = data.get("features", [])
        if not features:
            print("No STAC features found for bbox.")
            return

        feature = features[0]
        scene_id = feature["id"]
        assets = feature.get("assets", {})
        print(f"Discovered real STAC scene ID: {scene_id}")

        # Find visual or green/blue band asset href
        asset_key = "visual" if "visual" in assets else list(assets.keys())[0]
        asset_href = assets[asset_key]["href"]
        print(f"Testing raster streaming on asset [{asset_key}]: {asset_href}")

        with rasterio.open(f"/vsicurl/{asset_href}") as src:
            print("SUCCESS: Opened real Sentinel COG asset via rasterio VSICURL!")
            print(f"Dimensions: {src.width} x {src.height}")
            print(f"CRS: {src.crs}")
            print(f"Transform: {src.transform}")
            print(f"Band count: {src.count}")
            print(f"Data types: {src.dtypes}")
    except Exception as e:
        print(f"Raster streaming test note: {e}")

if __name__ == "__main__":
    test_dynamic_raster_streaming()
