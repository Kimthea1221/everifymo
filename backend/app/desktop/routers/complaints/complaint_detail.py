from uuid import UUID
from datetime import datetime, timedelta, timezone, date
from typing import List
from pydantic import BaseModel

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.core.dependencies import get_current_user
from app.desktop.schemas.complaints.complaints import ComplaintVerificationDetailResponse
from app.desktop.services.complaints.complaint_detail_service import get_complaint_verification_detail

from app.models.verification_requests import VerificationRequest
from app.desktop.schemas.complaints.complaints import ComplaintAwaitingRequestResponse
from app.models.complaints import Complaint
from app.models.walkin_complainants import WalkinComplainant
from app.core.complaint_status import transition_complaint_status

router = APIRouter(prefix="/complaints", tags=["Complaint Detail"])


# Response schema for list of complaints on the dashboard/tabs
class ComplaintListItemResponse(BaseModel):
    complaint_id: UUID
    case_reference: str
    product_title: str
    manufacturer: str | None
    product_category: str | None
    source: str
    status: str
    complainant_name: str | None
    created_at: datetime
    notes: str | None

class ComplaintTransitionRequest(BaseModel):
    new_status: str
    notes: str | None = None

class DashboardTrendsResponse(BaseModel):
    intake_data: list[int]
    forwarded_data: list[int]
    pipeline_data: list[dict]


# GET /complaints/trends
@router.get("/trends", response_model=DashboardTrendsResponse)
def get_dashboard_trends(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    start_of_year = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    
    # 1. Intake trend (walk-ins created this year)
    complaints = db.query(Complaint).filter(
        Complaint.region_id == current_user.region_id,
        Complaint.source == "walk_in",
        Complaint.created_at >= start_of_year,
        Complaint.deleted_at.is_(None)
    ).all()
    
    intake_trend = [0] * 12
    for c in complaints:
        m = c.created_at.month - 1
        intake_trend[m] += 1
        
    # 2. Forwarded trend (requests sent this year)
    requests = db.query(VerificationRequest).join(Complaint).filter(
        Complaint.region_id == current_user.region_id,
        VerificationRequest.requested_at >= start_of_year
    ).all()
    
    forwarded_trend = [0] * 12
    for r in requests:
        m = r.requested_at.month - 1
        forwarded_trend[m] += 1
        
    # 3. Monthly pipeline data (last 4 months)
    pipeline_trend = []
    for i in range(3, -1, -1):
        target_year = now.year
        target_month = now.month - i
        while target_month <= 0:
            target_month += 12
            target_year -= 1
            
        month_start = datetime(target_year, target_month, 1, tzinfo=timezone.utc)
        if target_month == 12:
            next_month_start = datetime(target_year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            next_month_start = datetime(target_year, target_month + 1, 1, tzinfo=timezone.utc)
            
        label = month_start.strftime("%b")
        
        ops_count = db.query(Complaint).filter(
            Complaint.region_id == current_user.region_id,
            Complaint.status.in_(["takedown_requested", "takedown_initiated", "completed"]),
            Complaint.created_at >= month_start,
            Complaint.created_at < next_month_start,
            Complaint.deleted_at.is_(None)
        ).count()
        
        takedowns_count = db.query(Complaint).filter(
            Complaint.region_id == current_user.region_id,
            Complaint.status == "dismissed",
            Complaint.created_at >= month_start,
            Complaint.created_at < next_month_start,
            Complaint.deleted_at.is_(None)
        ).count()
        
        pipeline_trend.append({
            "label": label,
            "ops": ops_count,
            "takedowns": takedowns_count
        })
        
    return DashboardTrendsResponse(
        intake_data=intake_trend,
        forwarded_data=forwarded_trend,
        pipeline_data=pipeline_trend
    )


# GET /complaints/
@router.get("", response_model=list[ComplaintListItemResponse])
def list_complaints(
    status: List[str] = Query(None),
    source: str | None = Query(None),
    search: str | None = Query(None),
    category: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Complaint, WalkinComplainant).outerjoin(
        WalkinComplainant, Complaint.complainant_id == WalkinComplainant.complainant_id
    ).filter(
        Complaint.region_id == current_user.region_id,
        Complaint.deleted_at.is_(None)
    )
    
    if status:
        query = query.filter(Complaint.status.in_(status))
    if source:
        query = query.filter(Complaint.source == source)
    if category:
        query = query.filter(Complaint.product_category == category)
    if search:
        query = query.filter(
            Complaint.case_reference.ilike(f"%{search}%")
            | Complaint.product_title.ilike(f"%{search}%")
            | Complaint.manufacturer.ilike(f"%{search}%")
        )
        
    results = query.order_by(Complaint.created_at.desc()).all()
    
    return [
        ComplaintListItemResponse(
            complaint_id=c.complaint_id,
            case_reference=c.case_reference,
            product_title=c.product_title,
            manufacturer=c.manufacturer,
            product_category=c.product_category,
            source=c.source,
            status=c.status,
            complainant_name=wc.full_name if wc else None,
            created_at=c.created_at,
            notes=c.notes
        )
        for c, wc in results
    ]


# POST /complaints/{complaint_id}/transition
@router.post("/{complaint_id}/transition")
def transition_complaint(
    complaint_id: UUID,
    data: ComplaintTransitionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id,
        Complaint.region_id == current_user.region_id
    ).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    
    transition_complaint_status(complaint, data.new_status)
    if data.notes is not None:
        complaint.notes = data.notes
    db.commit()
    return {"message": f"Complaint status transitioned to {data.new_status}."}


# GET /complaints/{complaint_id}/verification-detail
@router.get("/{complaint_id}/verification-detail", response_model=ComplaintVerificationDetailResponse)
def get_complaint_detail_for_verification(
    complaint_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_complaint_verification_detail(db, complaint_id, current_user.region_id)


# GET /complaints/awaiting-verification-request
@router.get("/awaiting-verification-request", response_model=list[ComplaintAwaitingRequestResponse])
def list_complaints_awaiting_request(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    complaint_ids_with_requests = db.query(VerificationRequest.complaint_id).subquery()

    complaints = db.query(Complaint).filter(
        Complaint.complaint_id.notin_(complaint_ids_with_requests),
        Complaint.status == "open",
        Complaint.region_id == current_user.region_id,   # NEW — region scoping
    ).order_by(Complaint.created_at.desc()).all()

    return complaints