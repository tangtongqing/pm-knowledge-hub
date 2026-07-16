"""Serve Obsidian note images from the configured local vault."""

import os
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

ALLOWED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}


@router.get("/assets/{filename}", response_class=FileResponse)
async def get_note_asset(filename: str) -> FileResponse:
    notes_dir = os.getenv("NOTES_DIR", "").strip()
    if not notes_dir:
        raise HTTPException(status_code=503, detail="NOTES_DIR 未配置，无法读取笔记图片")

    asset_root = (Path(notes_dir) / "_images").resolve()
    asset_path = (asset_root / filename).resolve()

    if asset_path.parent != asset_root or asset_path.suffix.lower() not in ALLOWED_IMAGE_SUFFIXES:
        raise HTTPException(status_code=400, detail="无效的图片资源路径")
    if not asset_path.is_file():
        raise HTTPException(status_code=404, detail="笔记图片不存在")

    return FileResponse(asset_path)
