import os
from typing import Tuple, Optional, Dict, Any

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:
    class DoubleConv(nn.Module):
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.conv = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )

        def forward(self, x):
            return self.conv(x)

    class FloodUNet(nn.Module):
        """
        Standard U-Net segmentation architecture for satellite flood extent mapping.
        Input channels: 3 (Sentinel-2 RGB/TCI) or 2 (Sentinel-1 SAR VV+VH).
        Output channels: 1 (Binary flood mask logit: 0 = background/dry land, 1 = flooded water).
        """
        def __init__(self, in_channels=3, out_channels=1, features=[64, 128, 256, 512]):
            super().__init__()
            self.downs = nn.ModuleList()
            self.ups = nn.ModuleList()
            self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

            # Down part of UNet
            in_ch = in_channels
            for feature in features:
                self.downs.append(DoubleConv(in_ch, feature))
                in_ch = feature

            # Bottleneck
            self.bottleneck = DoubleConv(features[-1], features[-1] * 2)

            # Up part of UNet
            for feature in reversed(features):
                self.ups.append(
                    nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2)
                )
                self.ups.append(DoubleConv(feature * 2, feature))

            self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)

        def forward(self, x):
            skip_connections = []
            for down in self.downs:
                x = down(x)
                skip_connections.append(x)
                x = self.pool(x)

            x = self.bottleneck(x)
            skip_connections = skip_connections[::-1]

            for idx in range(0, len(self.ups), 2):
                x = self.ups[idx](x)
                skip_connection = skip_connections[idx // 2]
                if x.shape != skip_connection.shape:
                    x = nn.functional.interpolate(x, size=skip_connection.shape[2:])
                concat_skip = torch.cat((skip_connection, x), dim=1)
                x = self.ups[idx + 1](concat_skip)

            return self.final_conv(x)


def load_checkpoint(weights_path: str, in_channels: int = 3, device: str = "cpu") -> Tuple[Optional[Any], str]:
    """
    Safely load model weights from disk.
    Returns (model, status_message).
    """
    if not TORCH_AVAILABLE:
        return None, "PyTorch is not installed in the Python environment."

    if not os.path.exists(weights_path):
        return None, f"Model checkpoint file not found at '{weights_path}'."

    try:
        model = FloodUNet(in_channels=in_channels, out_channels=1)
        checkpoint = torch.load(weights_path, map_location=torch.device(device), weights_only=True)
        if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            model.load_state_dict(checkpoint["state_dict"])
        elif isinstance(checkpoint, dict):
            model.load_state_dict(checkpoint)
        elif isinstance(checkpoint, nn.Module):
            model = checkpoint
        else:
            return None, "Unrecognized checkpoint format."

        model.to(device)
        model.eval()
        return model, "Model checkpoint loaded successfully."
    except Exception as e:
        return None, f"Failed to load checkpoint: {str(e)}"
