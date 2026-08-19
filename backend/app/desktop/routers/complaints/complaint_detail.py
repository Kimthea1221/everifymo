from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.sessions import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.desktop.schemas.complaints.complaints import ComplaintVerificationDetailResponse
from backend.app.desktop.services.complaints.complaint_detail_service import get_complaint_verification_detail

from backend.app.models.verification_requests import VerificationRequest
from backend.app.desktop.schemas.complaints.complaints import ComplaintAwaitingRequestResponse

from backend.app.models.complaints import Complaint
from backend.app.models.walkin_complainants import WalkinComplainant

from backend.app.desktop.schemas.complaints.complaints import WalkinComplaintDetailResponse, SharedFileResponse
from backend.app.models.shared_files import SharedFile

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
    Complaint.region_id == current_user.region_id,
    Complaint.deleted_at.is_(None),   # ADD — exclude soft-deleted complaints
    ).order_by(Complaint.created_at.desc()).all()

    return complaints

    #
    #Ashanti code starts here
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
    Complaint.deleted_at.is_(None), #added
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    complainant = None
    if complaint.complainant_id:
        complainant = db.query(WalkinComplainant).filter(
            WalkinComplainant.complainant_id == complaint.complainant_id
        ).first()

    files = db.query(SharedFile).filter(SharedFile.complaint_id == complaint_id).all()

    # Same precedence as the list endpoint: complaint.status is the
    # source of truth. "open" always means queued/Ready to Send,
    # regardless of any recalled/rejected request sitting in history.
    # Only fall back to the latest request's status when the complaint
    # itself is not open (i.e. a request is genuinely active or FDA
    # has responded).
    if complaint.status == "open":
        effective_status = "queued"
    else:
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
        place_of_purchase=complaint.place_of_purchase,
        date_of_purchase=complaint.date_of_purchase,
        amount_paid=complaint.amount_paid,
        full_name=complainant.full_name if complainant else None,
        contact_number=complainant.contact_number if complainant else None,
        email=complainant.email if complainant else None,
        id_type=complainant.id_type if complainant else None,
        address=complainant.address if complainant else None,
        attached_files=[SharedFileResponse.model_validate(f) for f in files],
    )
#Ashanti code ends here