import os
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.models.shared_files import SharedFile

router = APIRouter(prefix="/shared-files", tags=["Shared Files"])


    #
    #
    #
    #
    #
    #
    # GET /shared-files/{file_id}/download
@router.get("/{file_id}/download")
def download_shared_file(
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    file_row = db.query(SharedFile).filter(SharedFile.file_id == file_id).first()

    if not file_row:
        raise HTTPException(status_code=404, detail="File not found.")

    if not os.path.exists(file_row.file_path):
        # Row exists but the physical file is missing — a real edge
        # case worth surfacing clearly rather than crashing
        raise HTTPException(status_code=404, detail="File no longer exists on disk.")

    # FileResponse streams the actual file bytes back to whoever
    # requested it. filename= sets what the browser suggests as the
    # saved filename (the ORIGINAL name, not the UUID-prefixed one
    # stored on disk) — media_type tells the browser what kind of
    # file it is, so it can decide to preview vs. force-download it.
    return FileResponse(
        path=file_row.file_path,
        filename=file_row.file_name,
        media_type=file_row.mime_type,
    )