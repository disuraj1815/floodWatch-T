"""
FloodWatch Inference Pipeline
Reads a Sentinel-2 COG window, preprocesses it for FloodUNet,
runs inference, and returns a georeferenced flood mask.
"""

import os
import io
import base64
import tempfile
from typing import Optional, Tuple, Dict, Any

import numpy as np

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    import rasterio
    from rasterio.transform import from_bounds
    from rasterio.crs import CRS
    RASTERIO_AVAILABLE = True
except ImportError:
    RASTERIO_AVAILABLE = False

from model import FloodUNet, load_checkpoint, TORCH_AVAILABLE

# ImageNet normalization for RGB inputs (Sentinel-2 TCI)
NORM_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
NORM_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
TARGET_SIZE = 512


def read_sentinel2_window(
    cog_href: str,
    aoi: Dict[str, float],
    target_size: int = TARGET_SIZE
) -> Tuple[Optional[np.ndarray], Optional[Any], Optional[Any], str]:
    """
    Read Sentinel-2 TCI COG asset for AOI bounding box using rasterio VSICURL.
    Returns (rgb_array HxWx3 uint8, transform, crs, status_message).
    """
    if not RASTERIO_AVAILABLE:
        return None, None, None, "rasterio is not available."

    try:
        vsicurl_path = f"/vsicurl/{cog_href}"
        with rasterio.open(vsicurl_path) as src:
            from rasterio.windows import from_bounds as window_from_bounds
            from rasterio.enums import Resampling

            # Transform AOI bbox to the raster CRS
            from rasterio.warp import transform_bounds
            src_crs_bounds = transform_bounds(
                "EPSG:4326", src.crs,
                aoi["minLng"], aoi["minLat"],
                aoi["maxLng"], aoi["maxLat"]
            )

            window = window_from_bounds(
                src_crs_bounds[0], src_crs_bounds[1],
                src_crs_bounds[2], src_crs_bounds[3],
                transform=src.transform
            )

            if src.count < 3:
                return None, None, None, f"Asset has only {src.count} bands; RGB TCI requires 3."

            rgb = src.read(
                [1, 2, 3],
                window=window,
                out_shape=(3, target_size, target_size),
                resampling=Resampling.bilinear
            )

            # Compute transform for the AOI window
            from rasterio.transform import from_bounds as transform_from_bounds
            out_transform = transform_from_bounds(
                src_crs_bounds[0], src_crs_bounds[1],
                src_crs_bounds[2], src_crs_bounds[3],
                target_size, target_size
            )

            return rgb, out_transform, src.crs, "Raster window read successfully."
    except Exception as e:
        return None, None, None, f"Raster read error: {str(e)}"


def preprocess_for_unet(rgb_array: np.ndarray) -> Optional[Any]:
    """
    Normalize uint8 RGB array to normalized float tensor [1, 3, H, W].
    """
    if not TORCH_AVAILABLE:
        return None

    # rgb_array: [3, H, W] uint8
    arr = rgb_array.astype(np.float32) / 255.0  # scale to [0,1]
    # Apply channel-wise normalization: (x - mean) / std
    for c in range(3):
        arr[c] = (arr[c] - NORM_MEAN[c]) / NORM_STD[c]

    tensor = torch.from_numpy(arr).unsqueeze(0)  # [1, 3, H, W]
    return tensor


def run_inference(model, tensor) -> Tuple[np.ndarray, str]:
    """
    Run forward pass and produce binary flood mask.
    Returns (mask_array HxW uint8, status_message).
    """
    with torch.no_grad():
        logits = model(tensor)  # [1, 1, H, W]
        probs = torch.sigmoid(logits)
        mask = (probs > 0.5).squeeze().cpu().numpy().astype(np.uint8)
    return mask, "Inference completed."


def save_mask_geotiff(
    mask: np.ndarray,
    transform: Any,
    crs: Any,
    output_path: str
) -> str:
    """
    Save binary flood mask to a georeferenced GeoTIFF file.
    Returns status message.
    """
    if not RASTERIO_AVAILABLE:
        return "rasterio not available for GeoTIFF export."
    try:
        with rasterio.open(
            output_path,
            'w',
            driver='GTiff',
            height=mask.shape[0],
            width=mask.shape[1],
            count=1,
            dtype=rasterio.uint8,
            crs=crs,
            transform=transform,
            nodata=255
        ) as dst:
            dst.write(mask, 1)
            dst.update_tags(
                DESCRIPTION="FloodWatch binary flood mask: 0=dry, 1=flooded",
                MODEL="FloodUNet-Sen1Floods11",
                INPUT_BANDS="Sentinel-2 RGB/TCI"
            )
        return f"Flood mask saved to {output_path}"
    except Exception as e:
        return f"GeoTIFF export error: {str(e)}"


def run_full_pipeline(
    cog_href: str,
    aoi: Dict[str, float],
    weights_path: str = "./models/sen1floods11_unet.pt",
    device: str = "cpu"
) -> Dict[str, Any]:
    """
    Complete pipeline: read raster -> preprocess -> infer -> return mask.
    Returns a dict with status, mask stats, and geotiff path.
    """
    result = {
        "rasterRead": "pending",
        "preprocessing": "pending",
        "inference": "pending",
        "maskGeneration": "pending",
        "floodedPixels": None,
        "totalPixels": None,
        "floodFraction": None,
        "maskPath": None,
        "messages": []
    }

    # Load model
    model, load_msg = load_checkpoint(weights_path, in_channels=3, device=device)
    result["messages"].append(f"Model: {load_msg}")
    if model is None:
        result["inference"] = "blocked_no_weights"
        result["maskGeneration"] = "blocked"
        return result

    # Read raster
    rgb, transform, crs, msg = read_sentinel2_window(cog_href, aoi)
    result["messages"].append(f"Raster: {msg}")
    if rgb is None:
        result["rasterRead"] = "failed"
        result["inference"] = "blocked"
        result["maskGeneration"] = "blocked"
        return result
    result["rasterRead"] = "completed"

    # Preprocess
    tensor = preprocess_for_unet(rgb)
    if tensor is None:
        result["preprocessing"] = "failed"
        result["inference"] = "blocked"
        return result
    result["preprocessing"] = "completed"

    # Inference
    mask, inf_msg = run_inference(model, tensor)
    result["messages"].append(f"Inference: {inf_msg}")
    result["inference"] = "completed"

    # Mask stats
    total = mask.size
    flooded = int(mask.sum())
    result["floodedPixels"] = flooded
    result["totalPixels"] = total
    result["floodFraction"] = round(flooded / total, 4) if total > 0 else 0.0

    # Save GeoTIFF
    tmp_path = tempfile.mktemp(suffix="_flood_mask.tif", dir="/tmp")
    save_msg = save_mask_geotiff(mask, transform, crs, tmp_path)
    result["messages"].append(save_msg)
    result["maskPath"] = tmp_path if os.path.exists(tmp_path) else None
    result["maskGeneration"] = "completed" if result["maskPath"] else "geotiff_error"

    return result
