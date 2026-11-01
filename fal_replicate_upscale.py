"""
Cloud Super-Resolution API Handlers: Fal.ai & Replicate Execution Scripts
"""

import os
import requests
from typing import Dict, Any, Optional

# ===================================================================== #
# 1. FAL.AI CLARITY / REAL-ESRGAN SUPER-RESOLUTION
# ===================================================================== #
def execute_fal_clarity_upscaler(
    image_url: str,
    scale_factor: int = 4,
    denoising_strength: float = 0.22,
    face_fidelity: float = 0.70,
    fal_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes Fal.ai Clarity Upscaler with tile inpainting and face fidelity lock.
    """
    key = fal_key or os.getenv("FAL_KEY")
    if not key:
        raise ValueError("FAL_KEY is mandatory for Fal.ai execution")

    endpoint = "https://fal.run/fal-ai/clarity-upscaler"
    headers = {
        "Authorization": f"Key {key}",
        "Content-Type": "application/json"
    }

    payload = {
        "image_url": image_url,
        "scale": scale_factor,
        "creativity": min(0.35, max(0.15, denoising_strength)),
        "resemblance": 0.85,
        "face_enhancement": True,
        "face_fidelity": min(0.85, max(0.50, face_fidelity)),
        "tiling": True,
        "tile_width": 1024,
        "tile_height": 1024,
        "overlap": 64,
        "negative_prompt": (
            "blur, jpeg artifacts, over-sharpened, oil painting effect, "
            "plastic skin, distorted text, chromatic aberration, grain noise"
        )
    }

    res = requests.post(endpoint, headers=headers, json=payload, timeout=120)
    res.raise_for_status()
    return res.json()


# ===================================================================== #
# 2. REPLICATE REAL-ESRGAN / CODEFORMER SUPER-RESOLUTION
# ===================================================================== #
def execute_replicate_upscale(
    image_url: str,
    scale_factor: int = 4,
    codeformer_fidelity: float = 0.70,
    replicate_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes Replicate NightmareAI Real-ESRGAN + CodeFormer face restoration.
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
        "version": "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        "input": {
            "image": image_url,
            "scale": scale_factor,
            "face_enhance": True,
            "codeformer_fidelity": codeformer_fidelity
        }
    }

    res = requests.post(endpoint, headers=headers, json=payload, timeout=60)
    res.raise_for_status()
    return res.json()
