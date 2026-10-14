import sys
import os

# Add ml-worker directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_worker_health():
    response = client.get("/health")
    print("GET /health response:", response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_model_status():
    response = client.get("/model/status")
    print("GET /model/status response:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["weightsAvailable"] == False
    assert data["status"] == "weights_missing"
    assert data["inputChannels"] == 3
    assert data["outputClasses"]["1"] == "Flooded Water Extent"
    print("Verification passed: Worker accurately reports model architecture, expected input bands, and missing weights status without fabrication.")

def test_predict_rejection_without_weights():
    response = client.post("/predict", json={
        "sceneId": "test_scene_01",
        "assetHref": "https://example.com/test.tif",
        "aoi": {"minLat": 27.85, "maxLat": 27.97, "minLng": 85.08, "maxLng": 85.22}
    })
    print("POST /predict response status:", response.status_code)
    print("POST /predict response detail:", response.json().get("detail"))
    assert response.status_code == 400
    assert "Inference rejected" in response.json().get("detail", "")
    print("Verification passed: /predict rejected mock inference when weights are missing.")

if __name__ == "__main__":
    print("=== RUNNING PYTHON WORKER INTEGRATION TESTS ===")
    test_worker_health()
    test_model_status()
    test_predict_rejection_without_weights()
    print("=== ALL PYTHON WORKER INTEGRATION TESTS PASSED ===")
