import os
import uuid
import tempfile
from fastapi import UploadFile
from starlette.background import BackgroundTask

TEMP_DIR = os.getenv("TEMP_DIR", tempfile.gettempdir())

MEDIA_TYPES = {
    "pdf": "application/pdf",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "csv": "text/csv",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "zip": "application/zip",
}


class FileHandler:
    async def save_upload(self, file: UploadFile, extension: str) -> str:
        unique_name = f"{uuid.uuid4().hex}.{extension}"
        file_path = os.path.join(TEMP_DIR, unique_name)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        return file_path

    def get_media_type(self, extension: str) -> str:
        return MEDIA_TYPES.get(extension.lower(), "application/octet-stream")

    def cleanup_task(self, *paths: str) -> BackgroundTask:
        def _cleanup():
            for path in paths:
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                    except OSError:
                        pass

        return BackgroundTask(_cleanup)
