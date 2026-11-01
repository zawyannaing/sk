"""
Cloud API Multi-View 3x3 Pipeline: Fal.ai & Replicate Execution Scripts
"""

import os
import requests
from typing import Dict, Any, List

# ===================================================================== #
# 1. FAL.AI SV3D / ZERO123-PLUS EXECUTION SCRIPT
# ===================================================================== #
def execute_fal_sv3d(
    image_url: str,
    fal_key: str = None
) -> Dict[str, Any]:
    """
    Executes 9-angle multi-view orbital synthesis via Fal.ai SV3D endpoint.
    Trajectory:
      Row 1: [-45°, +30°], [0°, +75°], [+45°, +30°]
      Row 2: [-90°, 0°], [0°, 0° Anchor], [+90°, 0°]
      Row 3: [180°, 0°], [0°, -30°], [+135°, -15°]
    """
    key = fal_key or os.getenv("FAL_KEY")
    if not key:
        raise ValueError("FAL_KEY is mandatory for Fal.ai execution")

    endpoint = "https://fal.run/fal-ai/sv3d"
    headers = {
        "Authorization": f"Key {key}",
        "Content-Type": "application/json"
    }

    payload = {
        "image_url": image_url,
        "elevations_deg": [30.0, 75.0, 30.0, 0.0, 0.0, 0.0, 0.0, -30.0, -15.0],
        "azimuths_deg": [-45.0, 0.0, 45.0, -90.0, 0.0, 90.0, 180.0, 0.0, 135.0],
        "num_frames": 9,
        "fps": 7
    }

    res = requests.post(endpoint, headers=headers, json=payload, timeout=90)
    res.raise_for_status()
    data = res.json()
    return {
        "master_sheet_url": data.get("images", [{}])[0].get("url"),
        "video_orbit_url": data.get("video", {}).get("url"),
        "raw_response": data
    }


# ===================================================================== #
# 2. REPLICATE ZERO123++ NOVEL VIEW SYNTHESIS
# ===================================================================== #
def execute_replicate_zero123plus(
    image_url: str,
    replicate_token: str = None
) -> Dict[str, Any]:
    """
    Executes Zero123++ on Replicate to generate multi-view contact sheets.
    """
    token = replicate_token or os.getenv("REPLICATE_API_TOKEN")
    if not token:
        raise ValueError("REPLICATE_API_TOKEN is mandatory for Replicate execution")

    endpoint = "https://api.replicate.com/v1/predictions"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "version": "sudo-ai/zero123plus-v1.2:1931da7e279b908b90150ec7c7d4131df33db9e7db7908c6de4259b04f762a4d",
        "input": {
            "image": image_url,
            "num_views": 9,
            "elevation": 0.0
        }
    }

    res = requests.post(endpoint, headers=headers, json=payload, timeout=60)
    res.raise_for_status()
    prediction = res.json()
    return prediction
