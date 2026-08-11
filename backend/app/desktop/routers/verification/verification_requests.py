from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.verification.verification import (
    VerificationRequestCreate,
    VerificationRequestResponse,
)
from app.desktop.services.verification.verification_submit_service import (
    submit_verification_draft,
    create_verification_request_direct,
)

from app.models.complaints import Complaint
from app.models.walkin_complainants import WalkinComplainant
from app.desktop.schemas.verification.verification import VerificationRequestAwaitingFDAResponse

from app.models.verification_requests import VerificationRequest

# Same two-router-in-one-file pattern as walkin_complaints.py
draft_submit_router = APIRouter(prefix="/drafts/verification", tags=["Verification Requests"])
direct_request_router = APIRouter(prefix="/verification-requests", tags=["Verification Requests"])


    #
    #
    #
    #
    #
    #
    # POST /drafts/verification/{draft_id}/submit
@draft_submit_router.post("/{draft_id}/submit", response_model=VerificationRequestResponse)
def submit_draft(
    draft_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return submit_verification_draft(db, draft_id, current_user)


    #
    #
    #
    #
    #
    #
    # POST /verification-requests/
@direct_request_router.post("/", response_model=VerificationRequestResponse)
def create_request_direct(
    data: VerificationRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_verification_request_direct(
        db, current_user,
        complaint_id=data.complaint_id,
        product_code=data.product_code,
        priority=data.priority,
        notes_to_fda=data.notes_to_fda,
    )


# Third router in this file — listing/browsing, separate from the
# two submit-action routers already here. Reuses the same
# /verification-requests prefix as direct_request_router.
list_router = APIRouter(prefix="/verification-requests", tags=["Verification Requests"])


    #
    #
    #
    #
    #
    #
    # GET /verification-requests/awaiting-fda
@list_router.get("/awaiting-fda", response_model=list[VerificationRequestAwaitingFDAResponse])
def list_verification_requests_awaiting_fda(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = db.query(VerificationRequest, Complaint, WalkinComplainant).join(
        Complaint, VerificationRequest.complaint_id == Complaint.complaint_id
    ).outerjoin(
        WalkinComplainant, Complaint.complainant_id == WalkinComplainant.complainant_id
    ).filter(
        VerificationRequest.verification_request_status == "pending",
        Complaint.region_id == current_user.region_id,   # region scoping from the start
    ).order_by(VerificationRequest.requested_at.desc()).all()

    return [
        VerificationRequestAwaitingFDAResponse(
            request_id=request.request_id,
            complaint_id=complaint.complaint_id,
            case_reference=complaint.case_reference,
            product_name=request.product_name,
            manufacturer=complaint.manufacturer,
            product_category=complaint.product_category,
            complainant_name=complainant.full_name if complainant else None,
            source=complaint.source,
            priority=request.priority,
            requested_at=request.requested_at,
        )
        for request, complaint, complainant in results
    ]