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
    assert data["status"] == "not_downloaded"
    print("Verification passed: Worker correctly reports weights are not available without fabrication.")

if __name__ == "__main__":
    print("=== RUNNING PYTHON WORKER TESTS ===")
    test_worker_health()
    test_model_status()
    print("=== ALL PYTHON WORKER TESTS PASSED ===")
