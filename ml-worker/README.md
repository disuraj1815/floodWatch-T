# FloodWatch Python ML Worker

FastAPI geospatial inference service for Sen1Floods11 U-Net flood segmentation.

## Requirements
- Python 3.10+
- PyTorch / torchvision
- Rasterio

## Setup & Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Place model weights:
   Place the pretrained `sen1floods11_unet.pt` weights file into `./models/`.

4. Run the worker:
   ```bash
   python main.py
   ```
   Server runs on `http://localhost:8000`.
