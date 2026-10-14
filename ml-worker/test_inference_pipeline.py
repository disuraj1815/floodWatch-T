"""
Test the FloodUNet architecture, preprocessing, and inference pipeline
without a real checkpoint (using random weights as a structural test only).
This verifies the pipeline is connected end-to-end.
NOT a real flood prediction test.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np

# 1. Test PyTorch + model architecture
print("=== TEST 1: PyTorch & FloodUNet Architecture ===")
import torch
from model import FloodUNet, TORCH_AVAILABLE

assert TORCH_AVAILABLE, "PyTorch not available"
model = FloodUNet(in_channels=3, out_channels=1)
model.eval()

# Synthetic input: [1, 3, 512, 512]
x = torch.randn(1, 3, 512, 512)
with torch.no_grad():
    out = model(x)
assert out.shape == (1, 1, 512, 512), f"Unexpected output shape: {out.shape}"
print(f"PASS: FloodUNet forward pass output shape: {out.shape}")

# 2. Test preprocessing
print("\n=== TEST 2: Preprocessing Pipeline ===")
from inference import preprocess_for_unet

fake_rgb = np.random.randint(0, 255, (3, 512, 512), dtype=np.uint8)
tensor = preprocess_for_unet(fake_rgb)
assert tensor.shape == (1, 3, 512, 512), f"Unexpected tensor shape: {tensor.shape}"
print(f"PASS: Preprocessing output shape: {tensor.shape}")

# 3. Test inference with random weights
print("\n=== TEST 3: Inference with Random Weights (structural test only) ===")
from inference import run_inference

mask, msg = run_inference(model, tensor)
assert mask.shape == (512, 512), f"Unexpected mask shape: {mask.shape}"
assert set(np.unique(mask)).issubset({0, 1}), "Mask contains values other than 0 and 1"
flooded = int(mask.sum())
total = mask.size
print(f"PASS: {msg}")
print(f"NOTE: Random-weight test only — NOT a real flood prediction.")
print(f"      Flooded pixels: {flooded}/{total} ({100*flooded/total:.1f}%)")
print(f"      (random weights produce ~50% flood fraction, expected)")

# 4. Test GeoTIFF export with synthetic transform
print("\n=== TEST 4: GeoTIFF Export ===")
from inference import save_mask_geotiff
from rasterio.transform import from_bounds
from rasterio.crs import CRS
import tempfile

transform = from_bounds(85.08, 27.85, 85.22, 27.97, 512, 512)
crs = CRS.from_epsg(4326)
tmp_path = tempfile.mktemp(suffix="_test_mask.tif")
msg = save_mask_geotiff(mask, transform, crs, tmp_path)
assert os.path.exists(tmp_path), "GeoTIFF file was not created"

import rasterio
with rasterio.open(tmp_path) as src:
    assert src.count == 1
    assert src.crs.to_epsg() == 4326
    saved_mask = src.read(1)
    assert saved_mask.shape == (512, 512)
    assert set(np.unique(saved_mask)).issubset({0, 1, 255})
    print(f"PASS: {msg}")
    print(f"      CRS: {src.crs}, Size: {src.width}x{src.height}, Bands: {src.count}")

os.unlink(tmp_path)  # cleanup

print("\n=== ALL STRUCTURAL TESTS PASSED ===")
print("BLOCKER: Real inference requires model/sen1floods11_unet.pt checkpoint.")
print("         Provide pretrained weights to enable real flood detection.")
