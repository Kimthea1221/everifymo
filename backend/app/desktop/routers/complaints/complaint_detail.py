from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.complaints.complaints import ComplaintVerificationDetailResponse
from app.desktop.services.complaints.complaint_detail_service import get_complaint_verification_detail

from app.models.verification_requests import VerificationRequest
from app.desktop.schemas.complaints.complaints import ComplaintAwaitingRequestResponse

from app.models.complaints import Complaint

from app.desktop.schemas.complaints.complaints import WalkinComplaintDetailResponse
from app.models.shared_files import SharedFile

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
    return get_complaint_verification_detail(db, complaint_id, current_user.region_id)


    #
    #
    #
    #
    #
    #
    # GET /complaints/awaiting-verification-request
@router.get("/awaiting-verification-request", response_model=list[ComplaintAwaitingRequestResponse])
def list_complaints_awaiting_request(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    #complaint_ids_with_requests = db.query(VerificationRequest.complaint_id).subquery() initial code before adding recall and resend reminder
    complaint_ids_with_requests = db.query(VerificationRequest.complaint_id).filter(
        VerificationRequest.verification_request_status == "pending"
    ).subquery()


    complaints = db.query(Complaint).filter(
        Complaint.complaint_id.notin_(complaint_ids_with_requests),
        Complaint.status == "open",
        Complaint.region_id == current_user.region_id,   # NEW — region scoping
    ).order_by(Complaint.created_at.desc()).all()

    return complaints

    #
    #
    # GET /complaints/{complaint_id}/walkin-detail
@router.get("/{complaint_id}/walkin-detail", response_model=WalkinComplaintDetailResponse)
def get_walkin_complaint_detail(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id,
        Complaint.region_id == current_user.region_id,
        Complaint.source == "walk_in",
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    complainant = None
    if complaint.complainant_id:
        complainant = db.query(WalkinComplainant).filter(
            WalkinComplainant.complainant_id == complaint.complainant_id
        ).first()

    files = db.query(SharedFile).filter(SharedFile.complaint_id == complaint_id).all()

    # Same "status" derivation as the list endpoint — latest linked
    # verification request, or "queued" if there isn't one.
    latest_request = db.query(VerificationRequest).filter(
        VerificationRequest.complaint_id == complaint_id
    ).order_by(VerificationRequest.requested_at.desc()).first()
    effective_status = latest_request.verification_request_status if latest_request else "queued"

    return WalkinComplaintDetailResponse(
        complaint_id=complaint.complaint_id,
        case_reference=complaint.case_reference,
        product_title=complaint.product_title,
        manufacturer=complaint.manufacturer,
        product_category=complaint.product_category,
        complainant_name=complainant.full_name if complainant else None,
        status=effective_status,
        created_at=complaint.created_at,
        nature_of_complaint=complaint.nature_of_complaint,
        attached_files=[SharedFileResponse.model_validate(f) for f in files],
    )