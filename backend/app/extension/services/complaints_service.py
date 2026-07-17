import uuid
from sqlalchemy.orm import Session

from app.models.complaints import Complaint
from app.extension.schemas.complaints import CreateComplaint
from app.core.config import settings

def create_complaints(db: Session, create_consumer_request: CreateComplaint, consumer_id: str) -> Complaint:
    complaint = Complaint(
        case_reference=f"CMP-{uuid.uuid4().hex[:8].upper()}",
        source="extension",
        region_id = settings.DEFAULT_EXTENSION_REGION_ID,
        product_title = create_consumer_request.product_title,
        store_name = create_consumer_request.store_name,
        product_url = str(create_consumer_request.product_url),
        consumer_description = create_consumer_request.consumer_description,
        platform = create_consumer_request.platform,
        verification_result="not_verified_yet",
        consumer_id=consumer_id,
    ) 
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

