from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from typing import List
from app.services.conversion import ConversionService
from app.utils.file_handler import FileHandler
import os

router = APIRouter()
conversion_service = ConversionService()
file_handler = FileHandler()

SUPPORTED_FORMATS = {
    "docx": ["pdf", "xlsx"],
    "xlsx": ["csv", "pdf", "docx"],
    "pdf": ["jpg", "png", "docx"],
    "jpg": ["png", "pdf"],
    "png": ["jpg", "pdf"],
    "jpeg": ["png", "pdf"],
}


@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Doc Converter API is running"}


@router.get("/supported-formats")
async def get_supported_formats():
    return {"supported_formats": SUPPORTED_FORMATS}


@router.post("/convert")
async def convert_file(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    source_ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
    if source_ext == "jpeg":
        source_ext = "jpg"

    target_format = target_format.lower().strip()

    if source_ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported source format: {source_ext}. Supported: {list(SUPPORTED_FORMATS.keys())}",
        )

    if target_format not in SUPPORTED_FORMATS.get(source_ext, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot convert {source_ext} to {target_format}. Supported targets: {SUPPORTED_FORMATS[source_ext]}",
        )

    input_path = None
    output_path = None
    try:
        input_path = await file_handler.save_upload(file, source_ext)
        output_path = await conversion_service.convert(input_path, source_ext, target_format)

        media_type = file_handler.get_media_type(target_format)
        # Use only the base filename (no directory components) to prevent path traversal
        safe_basename = os.path.basename(file.filename)
        output_filename = os.path.splitext(safe_basename)[0] + f".{target_format}"

        return FileResponse(
            path=output_path,
            media_type=media_type,
            filename=output_filename,
            background=file_handler.cleanup_task(input_path, output_path),
        )
    except HTTPException:
        raise
    except Exception as e:
        if input_path and os.path.exists(input_path):
            os.remove(input_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@router.post("/merge-pdf")
async def merge_pdfs(
    files: List[UploadFile] = File(...),
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required to merge.")

    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        if ext != ".pdf":
            raise HTTPException(status_code=400, detail=f"All files must be PDFs. Got: {f.filename}")

    input_paths = []
    output_path = None
    try:
        for f in files:
            path = await file_handler.save_upload(f, "pdf")
            input_paths.append(path)

        output_path = await conversion_service.merge_pdfs(input_paths)

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="merged.pdf",
            background=file_handler.cleanup_task(*input_paths, output_path),
        )
    except HTTPException:
        raise
    except Exception as e:
        for p in input_paths:
            if os.path.exists(p):
                os.remove(p)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")
