from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.complaints.complaints import ComplaintResponse
from app.desktop.services.drafts.draft_submit_service import (
    submit_walkin_draft,
    create_walkin_complaint_direct,
)
from app.models.verification_requests import VerificationRequest
from app.models.walkin_complainants import WalkinComplainant
from app.desktop.schemas.complaints.complaints import WalkinComplaintListResponse
from app.models.complaints import Complaint

# Two separate routers in this one file, since these two endpoints
# need two different URL prefixes, even though they're closely
# related in purpose (both create real walk-in complaints).
draft_submit_router = APIRouter(prefix="/drafts/walkin", tags=["Walk-in Complaints"])
direct_complaint_router = APIRouter(prefix="/complaints/walkin", tags=["Walk-in Complaints"])


    #
    #
    #
    #
    #
    #
    # POST /drafts/walkin/{draft_id}/submit
@draft_submit_router.post("/{draft_id}/submit", response_model=ComplaintResponse)
def submit_draft(
    draft_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # All the real logic (fetching the draft, generating the case
    # reference, inserting complainant + complaint, copying files,
    # deleting the draft) already lives inside the service function.
    # This endpoint's only job is to receive the HTTP request and
    # hand off to that logic.
    new_complaint = submit_walkin_draft(db, draft_id, current_user)
    return new_complaint


    #
    #
    #
    #
    #
    #
    # POST /complaints/walkin/
@direct_complaint_router.post("/", response_model=ComplaintResponse)
def create_complaint_direct(
    # Optional fields — same as the walk-in draft save endpoint
    full_name: str | None = Form(None),
    contact_number: str | None = Form(None),
    email: str | None = Form(None),
    id_type: str | None = Form(None),
    address: str | None = Form(None),
    amount_paid: float | None = Form(None),

    # Required fields — Form(...) with no default means FastAPI
    # itself rejects the request with a 422 error if any of these
    # are missing, before our own code even runs. This is different
    # from drafts, which allow incomplete saves — a real complaint
    # being logged directly has no "incomplete" state at all.
    product_name: str = Form(...),
    manufacturer: str = Form(...),
    product_category: str = Form(...),
    place_of_purchase: str = Form(...),
    date_of_purchase: str = Form(...),
    nature_of_complaint: str = Form(...),

    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    complainant_fields = {
        "full_name": full_name,
        "contact_number": contact_number,
        "email": email,
        "id_type": id_type,
        "address": address,
    }

    complaint_fields = {
        "product_title": product_name,
        "manufacturer": manufacturer,
        "product_category": product_category,
        "place_of_purchase": place_of_purchase,
        # Manual string -> date conversion, since this dict feeds
        # directly into a SQLAlchemy model (Complaint), not a
        # Pydantic schema — SQLAlchemy doesn't auto-convert strings
        # into dates the way Pydantic does.
        "date_of_purchase": date.fromisoformat(date_of_purchase),
        "amount_paid": amount_paid,
        "nature_of_complaint": nature_of_complaint,
    }

    new_complaint = create_walkin_complaint_direct(
        db, current_user, complainant_fields, complaint_fields, files
    )
    return new_complaint
#
    #
    #
    #
    #
    #
    # GET /complaints/walkin/
@direct_complaint_router.get("/", response_model=list[WalkinComplaintListResponse])
def list_walkin_complaints(
    status: str | None = None,
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # "Status" here isn't a stored column — it's derived. Each
    # complaint's most recent verification request is joined in via
    # this subquery, so we know both the complaint's own lifecycle
    # status AND (if one exists) its latest request's status.
    latest_request_subq = (
        db.query(
            VerificationRequest.complaint_id,
            func.max(VerificationRequest.requested_at).label("latest_requested_at"),
        )
        .group_by(VerificationRequest.complaint_id)
        .subquery()
    )
 
    rows = (
        db.query(Complaint, WalkinComplainant, VerificationRequest)
        .outerjoin(WalkinComplainant, Complaint.complainant_id == WalkinComplainant.complainant_id)
        .outerjoin(
            latest_request_subq,
            latest_request_subq.c.complaint_id == Complaint.complaint_id,
        )
        .outerjoin(
            VerificationRequest,
            (VerificationRequest.complaint_id == latest_request_subq.c.complaint_id)
            & (VerificationRequest.requested_at == latest_request_subq.c.latest_requested_at),
        )
        .filter(
            Complaint.source == "walk_in",
            Complaint.region_id == current_user.region_id,
            Complaint.deleted_at.is_(None),
        )
    )
 
    if category is not None:
        rows = rows.filter(Complaint.product_category == category)
 
    if search is not None:
        term = f"%{search}%"
        rows = rows.filter(
            (Complaint.case_reference.ilike(term))
            | (Complaint.product_title.ilike(term))
            | (WalkinComplainant.full_name.ilike(term))
        )
 
    results = []
    for complaint, complainant, vr in rows.order_by(Complaint.created_at.desc()).all():
        # Complaint status is the source of truth for whether it's
        # actionable. If it's 'open', it belongs in Ready to Send —
        # full stop — regardless of whether it has a recalled (or any
        # other) request sitting in its history. A recalled complaint
        # goes back to being indistinguishable from a brand-new one,
        # which matches what it can actually do on screen (edit/delete
        # via Ready to Send) — showing old history here would be
        # misleading, since that history no longer reflects reality.
        if complaint.status == "open":
            effective_status = "queued"
        elif vr:
            effective_status = vr.verification_request_status
        else:
            effective_status = "queued"
 
        if status is not None and effective_status != status:
            continue
 
        results.append(WalkinComplaintListResponse(
            complaint_id=complaint.complaint_id,
            case_reference=complaint.case_reference,
            product_title=complaint.product_title,
            manufacturer=complaint.manufacturer,
            product_category=complaint.product_category,
            complainant_name=complainant.full_name if complainant else None,
            status=effective_status,
            created_at=complaint.created_at,
        ))
 
    return results
 