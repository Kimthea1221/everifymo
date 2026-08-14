import uuid
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.verification_history import VerificationHistory
from app.extension.schemas.verification import CreateVerification

def create_verification(db: Session, create_verification_request: CreateVerification, consumer_id: str) -> VerificationHistory:
    verification = VerificationHistory(
        consumer_id=consumer_id,
        platform=create_verification_request.platform,
        product_title=create_verification_request.product_title,
        verification_result=create_verification_request.verification_result,
        checked_at=datetime.now()
    ) 

    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification