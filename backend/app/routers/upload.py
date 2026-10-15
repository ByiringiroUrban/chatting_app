import os
import aiofiles
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Media & File Uploads"])

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    """Handles upload of photos, audio recordings, documents, etc."""
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        clean_name = file.filename.replace(" ", "_") if file.filename else "upload"
        filename = f"{timestamp}_{clean_name}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        async with aiofiles.open(file_path, "wb") as out_file:
            content = await file.read()
            await out_file.write(content)

        file_url = f"/uploads/{filename}"
        return {
            "success": True,
            "filename": clean_name,
            "url": file_url,
            "size": len(content),
            "contentType": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
