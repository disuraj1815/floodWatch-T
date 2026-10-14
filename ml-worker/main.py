import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from model import load_checkpoint, TORCH_AVAILABLE

app = FastAPI(
    title="FloodWatch ML Worker",
    description="FastAPI geospatial AI worker for Sen1Floods11 U-Net flood segmentation",
    version="1.2.0"
)

MODEL_NAME = "Sen1Floods11-ResNet-Unet"
WEIGHTS_PATH = os.getenv("MODEL_WEIGHTS_PATH", "./models/sen1floods11_unet.pt")
DEVICE = os.getenv("DEVICE", "cpu")

# Attempt initial model checkpoint load on worker startup
loaded_model, load_message = load_checkpoint(WEIGHTS_PATH, in_channels=3, device=DEVICE)


class PredictionRequest(BaseModel):
    sceneId: str
    assetHref: str
    aoi: dict


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FloodWatch Python ML Worker",
        "model": MODEL_NAME,
        "torchAvailable": TORCH_AVAILABLE,
        "device": DEVICE
    }


@app.get("/model/status")
def model_status():
    global loaded_model, load_message
    if loaded_model is None:
        loaded_model, load_message = load_checkpoint(WEIGHTS_PATH, in_channels=3, device=DEVICE)

    weights_exists = os.path.exists(WEIGHTS_PATH)
    is_ready = loaded_model is not None

    return {
        "modelName": MODEL_NAME,
        "architecture": "U-Net with ResNet-34 Encoder",
        "trainingDataset": "Sen1Floods11 (Sentinel-1 SAR & Sentinel-2 Optical)",
        "inputChannels": 3,
        "inputBands": ["Red (B04)", "Green (B03)", "Blue (B02) / TCI"],
        "expectedDimensions": [1, 3, 512, 512],
        "normalization": "Mean [0.485, 0.456, 0.406], Std [0.229, 0.224, 0.225]",
        "outputClasses": {0: "Non-Flooded Background", 1: "Flooded Water Extent"},
        "weightsAvailable": weights_exists,
        "weightsLoaded": is_ready,
        "weightsPath": WEIGHTS_PATH,
        "license": "MIT / Open Research License",
        "status": "ready" if is_ready else ("weights_missing" if not weights_exists else "load_error"),
        "message": load_message
    }


@app.post("/predict")
def predict_flood(req: PredictionRequest):
    global loaded_model
    if loaded_model is None:
        raise HTTPException(
            status_code=400,
            detail=f"Inference rejected: Model weights for '{MODEL_NAME}' not available at '{WEIGHTS_PATH}'. {load_message}"
        )

    from inference import run_full_pipeline
    result = run_full_pipeline(
        cog_href=req.assetHref,
        aoi=req.aoi,
        weights_path=WEIGHTS_PATH,
        device=DEVICE
    )

    if result["inference"] != "completed":
        raise HTTPException(
            status_code=422,
            detail=f"Inference failed: {result['messages']}"
        )

    return {
        "sceneId": req.sceneId,
        "status": "completed",
        "model": MODEL_NAME,
        "device": DEVICE,
        "rasterRead": result["rasterRead"],
        "preprocessing": result["preprocessing"],
        "inference": result["inference"],
        "maskGeneration": result["maskGeneration"],
        "floodedPixels": result["floodedPixels"],
        "totalPixels": result["totalPixels"],
        "floodFraction": result["floodFraction"],
        "maskPath": result["maskPath"],
        "outputClasses": {0: "Non-Flooded Background", 1: "Flooded Water Extent"},
        "messages": result["messages"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
