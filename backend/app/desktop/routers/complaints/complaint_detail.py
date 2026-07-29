from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.complaints.complaints import ComplaintVerificationDetailResponse
from app.desktop.services.complaints.complaint_detail_service import get_complaint_verification_detail

router = APIRouter(prefix="/complaints", tags=["Complaint Detail"])


    #
    #
    #
    #
    #
    #
    # GET /complaints/{complaint_id}/verification-detail
@router.get("/{complaint_id}/verification-detail", response_model=ComplaintVerificationDetailResponse)
def get_complaint_detail_for_verification(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_complaint_verification_detail(db, complaint_id)