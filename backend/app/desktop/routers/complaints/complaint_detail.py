from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.complaints.complaints import ComplaintVerificationDetailResponse
from app.desktop.services.complaints.complaint_detail_service import get_complaint_verification_detail

from app.models.verification_requests import VerificationRequest
from app.desktop.schemas.complaints.complaints import ComplaintAwaitingRequestResponse

from app.models.complaints import Complaint
from app.models.walkin_complainants import WalkinComplainant
from app.models.shared_files import SharedFile

from app.desktop.schemas.complaints.complaints import (
    SharedFileResponse,
    WalkinComplaintDetailResponse,
    LeaInitiatedCaseListItem,
    LeaInitiatedCaseDetailResponse,
    LeaCloseCaseRequest,
    LeaCloseCaseResponse,
)

from app.desktop.services.complaints.lea_initiated_cases import (
    list_lea_initiated_cases,
    get_lea_initiated_case_detail,
    close_case,
)

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


# added by darlene --start
# ============================================================
# LEA INITIATED CASES TAB
# ============================================================


    #
    #
    #
    #
    #
    #
    # GET /complaints/initiated
@router.get("/initiated", response_model=list[LeaInitiatedCaseListItem])
def list_initiated_cases_endpoint(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return list_lea_initiated_cases(db, current_user)


    #
    #
    #
    #
    #
    #
    # GET /complaints/initiated/{complaint_id}
@router.get("/initiated/{complaint_id}", response_model=LeaInitiatedCaseDetailResponse)
def get_initiated_case_detail_endpoint(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_lea_initiated_case_detail(db, complaint_id, current_user)


    #
    #
    #
    #
    #
    #
    # POST /complaints/{complaint_id}/close-case
@router.post("/{complaint_id}/close-case", response_model=LeaCloseCaseResponse)
def close_case_endpoint(
    complaint_id: UUID,
    data: LeaCloseCaseRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return close_case(db, complaint_id, current_user, data)
#added by darlene --end 