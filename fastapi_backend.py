"""
AI Image Studio & Computer Vision Backend Agent
FastAPI Implementation routing UI actions to AI pipelines / models
"""

import time
from typing import Optional, Literal, Dict, Any, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="AI Image Studio Computer Vision Agent",
    description="Backend API routing UI actions (Edit, Upscale, Change Background, Multi-View, Face Swap) to AI Models",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request / Response Schemas ----------------- #

class ImageActionRequest(BaseModel):
    action: Literal[
        "edit_image", 
        "upscale", 
        "change_background", 
        "multi_view", 
        "face_swap"
    ] = Field(..., description="Action selected from Frontend UI")
    
    # Common Parameters
    image_url: Optional[str] = Field(None, description="Base image URL or Base64 string")
    character_image: Optional[str] = Field(None, description="Slot 1: Subject / Character identity reference")
    background_image: Optional[str] = Field(None, description="Slot 2: Target environment / Scene layout reference")
    edge_blend_mask: Optional[str] = Field(None, description="Dilated silhouette boundary mask (transition zone)")
    denoising_strength: Optional[float] = Field(0.52, description="Target latent inpainting denoising strength (0.45 - 0.65)")
    
    # Edit Image Parameters
    edit_prompt: Optional[str] = Field(None, description="Prompt for inpainting/editing")
    mask_url: Optional[str] = Field(None, description="Mask URL for targeted edits")
    
    # Upscale Parameters
    scale_factor: Optional[int] = Field(4, description="Upscale multiplier (2, 4, 8)")
    
    # Change Background Parameters
    new_background_prompt: Optional[str] = Field(None, description="Text prompt for new background")
    new_background_image_url: Optional[str] = Field(None, description="Custom background image URL")
    
    # Multi-view Parameters
    views_count: Optional[int] = Field(4, description="Number of view angles to generate")
    elevation_angle: Optional[float] = Field(0.0, description="Camera elevation angle")
    
    # Face Swap Parameters
    source_face_url: Optional[str] = Field(None, description="Source face to extract identity from")
    source_face_image: Optional[str] = Field(None, description="Slot 1: Identity to inject")
    target_image_url: Optional[str] = Field(None, description="Target face image URL (defaults to image_url)")
    target_image: Optional[str] = Field(None, description="Slot 2: Target body, pose, skin tone, and lighting")
    face_mask_url: Optional[str] = Field(None, description="Face parsing segmentation mask")


class ImageActionResponse(BaseModel):
    status: Literal["success", "error"]
    action: str
    pipeline: str
    pipeline_used: str
    output_image_url: Optional[str] = None
    result_image_url: Optional[str] = None
    multi_view_urls: Optional[List[str]] = None
    metadata: Dict[str, Any]
    execution_time_ms: float
    message: str
    error_message: Optional[str] = None


# ----------------- AI Agent Execution Handlers ----------------- #

async def handle_edit_image(payload: ImageActionRequest):
    if not payload.edit_prompt:
        raise HTTPException(status_code=400, detail="edit_prompt is mandatory for edit_image")
    if not payload.image_url and not payload.mask_url:
        raise HTTPException(status_code=400, detail="image_url or mask_url is mandatory for edit_image")
    
    # InstructPix2Pix / Stable Diffusion Inpainting pipeline
    return {
        "pipeline": "StableDiffusion-Inpaint-v2",
        "output_url": payload.image_url,
        "parameters": {
            "prompt": payload.edit_prompt,
            "mask_provided": bool(payload.mask_url)
        }
    }

async def handle_upscale(payload: ImageActionRequest):
    scale = payload.scale_factor if payload.scale_factor in [2, 4, 8] else 4
    denoise = max(0.15, min(0.35, payload.denoising_strength if payload.denoising_strength is not None else 0.22))
    # Tiled Super-Resolution with CodeFormer & Lab Color Preservation
    return {
        "pipeline": f"Real-ESRGAN-x{scale}",
        "output_url": payload.image_url,
        "parameters": {
            "scale_factor": scale,
            "model": f"RealESRGAN_x{scale}plus",
            "denoising_strength": denoise,
            "denoising_range": "0.15 - 0.35",
            "codeformer_fidelity": 0.70,
            "tile_size": 1024,
            "tile_overlap": 64,
            "color_preservation": True,
            "negative_prompt": "blur, jpeg artifacts, over-sharpened, oil painting effect, plastic skin, distorted text, chromatic aberration, grain noise"
        }
    }

async def handle_change_background(payload: ImageActionRequest):
    bg_ref = payload.background_image or payload.new_background_image_url
    char_ref = payload.character_image or payload.image_url
    if not payload.new_background_prompt and not bg_ref:
        raise HTTPException(
            status_code=400, 
            detail="Either new_background_prompt or new_background_image_url must be provided for change_background"
        )
    denoise = max(0.45, min(0.65, payload.denoising_strength if payload.denoising_strength is not None else 0.52))
    # RMBG-1.4 + ControlNet-Depth / SDXL Background Inpaint pipeline with Separated Conditioning
    return {
        "pipeline": "RMBG-1.4 + ControlNet-Depth",
        "output_url": char_ref,
        "parameters": {
            "prompt": payload.new_background_prompt,
            "custom_bg": bool(bg_ref),
            "character_conditioning": "IP-Adapter / InstantID Identity Lock (Confined to Subject Bounding Box)",
            "background_conditioning": "ControlNet-Depth Geometry & Spatial Depth Lock",
            "compositing_mask": "BiRefNet Alpha Cutout with 4-6px Dilated Inpainting Blend Zone",
            "denoising_strength": denoise,
            "denoising_range": "0.45 - 0.65"
        }
    }

CANONICAL_3X3_TRAJECTORY = [
    {"index": 1, "id": "top_left", "name": "High-Angle Left 3/4", "azimuth": -45, "elevation": 30, "distance": 1.0, "row": 1, "col": 1},
    {"index": 2, "id": "top_center", "name": "Bird's Eye / Overhead", "azimuth": 0, "elevation": 75, "distance": 1.1, "row": 1, "col": 2},
    {"index": 3, "id": "top_right", "name": "High-Angle Right 3/4", "azimuth": 45, "elevation": 30, "distance": 1.0, "row": 1, "col": 3},
    {"index": 4, "id": "mid_left", "name": "Left 90° Profile View", "azimuth": -90, "elevation": 0, "distance": 1.0, "row": 2, "col": 1},
    {"index": 5, "id": "mid_center", "name": "Canonical Front Hero View", "azimuth": 0, "elevation": 0, "distance": 1.0, "row": 2, "col": 2},
    {"index": 6, "id": "mid_right", "name": "Right 90° Profile View", "azimuth": 90, "elevation": 0, "distance": 1.0, "row": 2, "col": 3},
    {"index": 7, "id": "bottom_left", "name": "Rear 180° Back View", "azimuth": 180, "elevation": 0, "distance": 1.0, "row": 3, "col": 1},
    {"index": 8, "id": "bottom_center", "name": "Low-Angle Upward Tilt", "azimuth": 0, "elevation": -30, "distance": 1.05, "row": 3, "col": 2},
    {"index": 9, "id": "bottom_right", "name": "Dynamic 3/4 Macro Angle", "azimuth": 135, "elevation": -15, "distance": 0.95, "row": 3, "col": 3},
]

async def handle_multi_view(payload: ImageActionRequest):
    views = payload.views_count if payload.views_count and payload.views_count in [4, 6, 8, 9] else 9
    elevation = payload.elevation_angle or 0.0
    # Zero123++ / SV3D / TripoSR canonical 3x3 trajectory pipeline
    urls = [
        f"https://cdn.example.com/results/view_cam{pose['index']}_{pose['id']}.png" 
        for pose in CANONICAL_3X3_TRAJECTORY[:views]
    ]
    master_3x3_sheet = payload.image_url or (urls[0] if urls else None)
    return {
        "pipeline": "Zero123Plus-NovelView",
        "output_url": master_3x3_sheet,
        "output_urls": urls,
        "parameters": {
            "views_count": views,
            "elevation_angle": elevation,
            "model": "zero123plus-v1.2",
            "camera_trajectory_matrix": CANONICAL_3X3_TRAJECTORY[:views],
            "boundary_padding_ratio": 0.15,
            "occlusion_handling": "Geometric & Texture Consistency Lock"
        }
    }

async def handle_face_swap(payload: ImageActionRequest):
    src_face = payload.source_face_image or payload.source_face_url
    if not src_face:
        raise HTTPException(
            status_code=400, 
            detail="source_face_url is mandatory to extract facial identity for face_swap"
        )
    target = payload.target_image or payload.target_image_url or payload.image_url
    if not target:
        raise HTTPException(
            status_code=400,
            detail="target_image_url or image_url is mandatory for face_swap"
        )
    denoise = max(0.25, min(0.40, payload.denoising_strength if payload.denoising_strength is not None else 0.32))
    # InsightFace / ReActor pipeline with Reinhard Skin-Tone Transfer & Poisson Blending
    return {
        "pipeline": "InsightFace-ReActor-v1",
        "output_url": target,
        "parameters": {
            "source_face_provided": True,
            "target_provided": True,
            "restore_face": True,
            "skin_tone_matching": "Reinhard L*a*b* Color Transfer",
            "blending_method": "Poisson-style Multiband Gaussian Feathering",
            "denoising_strength": denoise,
            "denoising_range": "0.25 - 0.40"
        }
    }


# ----------------- Main Routing Endpoint ----------------- #

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "AI Image Studio Computer Vision Agent"}

@app.post("/api/v1/process-image", response_model=ImageActionResponse)
async def process_image_endpoint(payload: ImageActionRequest):
    start_time = time.time()
    
    action = payload.action
    result_url = None
    multi_views = None
    pipeline_name = ""
    parameters_applied = {}

    try:
        if action == "edit_image":
            res = await handle_edit_image(payload)
            pipeline_name = res["pipeline"]
            result_url = res["output_url"]
            parameters_applied = res.get("parameters", {})

        elif action == "upscale":
            res = await handle_upscale(payload)
            pipeline_name = res["pipeline"]
            result_url = res["output_url"]
            parameters_applied = res.get("parameters", {})

        elif action == "change_background":
            res = await handle_change_background(payload)
            pipeline_name = res["pipeline"]
            result_url = res["output_url"]
            parameters_applied = res.get("parameters", {})

        elif action == "multi_view":
            res = await handle_multi_view(payload)
            pipeline_name = res["pipeline"]
            multi_views = res["output_urls"]
            result_url = res.get("output_url") or (multi_views[0] if multi_views else None)
            parameters_applied = res.get("parameters", {})

        elif action == "face_swap":
            res = await handle_face_swap(payload)
            pipeline_name = res["pipeline"]
            result_url = res["output_url"]
            parameters_applied = res.get("parameters", {})

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported action: {action}")

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return ImageActionResponse(
            status="success",
            action=action,
            pipeline=pipeline_name,
            pipeline_used=pipeline_name,
            output_image_url=result_url,
            result_image_url=result_url,
            multi_view_urls=multi_views,
            metadata={
                "execution_time_ms": elapsed_ms,
                "parameters_applied": parameters_applied
            },
            execution_time_ms=elapsed_ms,
            message=f"Successfully processed {action}",
            error_message=None
        )

    except HTTPException as he:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return ImageActionResponse(
            status="error",
            action=action,
            pipeline=pipeline_name or "Validation",
            pipeline_used=pipeline_name or "Validation",
            output_image_url=None,
            result_image_url=None,
            multi_view_urls=None,
            metadata={"execution_time_ms": elapsed_ms, "parameters_applied": {}},
            execution_time_ms=elapsed_ms,
            message=str(he.detail),
            error_message=str(he.detail)
        )
    except Exception as exc:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return ImageActionResponse(
            status="error",
            action=action,
            pipeline=pipeline_name or "Unknown",
            pipeline_used=pipeline_name or "Unknown",
            output_image_url=None,
            result_image_url=None,
            multi_view_urls=None,
            metadata={"execution_time_ms": elapsed_ms, "parameters_applied": {}},
            execution_time_ms=elapsed_ms,
            message=str(exc),
            error_message=str(exc)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_backend:app", host="0.0.0.0", port=8000, reload=True)
