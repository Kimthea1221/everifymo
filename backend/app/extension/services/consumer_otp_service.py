from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.consumer_accounts import ConsumerAccount

import secrets 
from datetime import datetime, timedelta, timezone
from app.models.consumer_otp_tokens import ConsumerOTPToken
from app.core.security import pwd_context

OTP_EXPIRATION_MINS = 5
MAX_OTP_ATTEMPTS = 5

def generate_otp_code(length: int = 6) -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(length))

def create_otp(db: Session, consumer_id, purpose: str) -> str:
    code = generate_otp_code()
    otp = ConsumerOTPToken(
        consumer_id = consumer_id,
        otp_hash = pwd_context.hash(code),
        expires_at = datetime.now(timezone.utc) + timedelta(minutes = OTP_EXPIRATION_MINS),
        purpose = purpose
    )
    db.add(otp)
    db.commit()
    return code

def verify_otp(db: Session, consumer_id, submitted_code: str, purpose: str) -> None:
    otp = (db.query(ConsumerOTPToken).filter(
            ConsumerOTPToken.consumer_id == consumer_id,
            ConsumerOTPToken.purpose == purpose,
            ConsumerOTPToken.is_used == False,
        ).order_by(ConsumerOTPToken.created_at.desc()).first()
    )

    if not otp: 
        raise HTTPException(status_code=400, detail="No OTP found, please request a new one")
    if otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired, please request a new one")
    if otp.attempt_count >= MAX_OTP_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Too many attempts, please request a new one")

    if not pwd_context.verify(submitted_code, otp.otp_hash):
        otp.attempt_count += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    otp.is_used = True
    db.commit()

# def verify_signup_otp(db: Session, email: str, otp_code: str) -> ConsumerAccount:
#     consumer = db.query(ConsumerAccount).filter(
#         ConsumerAccount.email == email).first()

#     if not consumer:
#         raise HTTPException(status_code=404, detail="Account not found")

#     verify_otp(db, consumer.consumer_id, otp_code, purpose="signup_verification")

#     consumer.is_verified = True
#     db.commit()
#     db.refresh(consumer)
#     return consumer

# def resend_signup_otp(db: Session, email: str) -> None:
#     consumer = db.query(ConsumerAccount).filter(
#         ConsumerAccount.email == email).first()

#     if not consumer:
#         raise HTTPException(status_code=404, detail="Account not found")
#     if consumer.is_verified:
#         raise HTTPException(status_code=400, detail="Account already verified")

#     code = create_otp(db, consumer.consumer_id, purpose="signup_verification")

#     return code