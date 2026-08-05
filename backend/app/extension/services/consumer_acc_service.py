from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.core.security import pwd_context
from app.models.consumer_accounts import ConsumerAccount
from app.extension.schemas.consumer_acc import CreateConsumerAcc
from app.models import consumer_accounts

from app.extension.services.consumer_otp_service import create_otp, verify_otp
from app.extension.services.google_auth_service import verify_google_token

def create_user(db: Session, create_user_request: CreateConsumerAcc) -> ConsumerAccount:
    consumer_acc = ConsumerAccount(
        email = create_user_request.email,
        username = create_user_request.username,
        password_hash = pwd_context.hash(create_user_request.password),
        consumer_type = "verified account",
        auth_provider = "local",
    )
    db.add(consumer_acc)

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        error = str(e.orig)
        if "email" in error: 
            detail = "Email already registered"
        elif "username" in error: 
            detail = "Username already taken"
        else: 
            detail = "Account could not be created"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
    db.refresh(consumer_acc)

    code = create_otp(db, consumer_acc.consumer_id, purpose="signup_verification")
    return consumer_acc, code

def verify_signup_otp(db: Session, email: str, otp_code: str) -> ConsumerAccount:
    consumer = db.query(ConsumerAccount).filter(ConsumerAccount.email == email).first()

    if not consumer:
        raise HTTPException(status_code=404, detail="Account not found")

    verify_otp(db, consumer.consumer_id, otp_code, purpose="signup_verification")

    consumer.is_verified = True
    db.commit()
    db.refresh(consumer)
    return consumer

def resend_signup_otp(db: Session, email: str) -> str:
    consumer = db.query(ConsumerAccount).filter(ConsumerAccount.email == email).first()

    if not consumer:
        raise HTTPException(status_code=404, detail="Account not found")
    if consumer.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    return create_otp(db, consumer.consumer_id, purpose="signup_verification")

def update_username(db: Session, user_id: int, updatedUsername: str):
    user = db.query( consumer_accounts.ConsumerAccount
        ).filter(consumer_accounts.ConsumerAccount.consumer_id == user_id).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    usernameExist = db.query(consumer_accounts.ConsumerAccount).filter(
        consumer_accounts.ConsumerAccount.username == updatedUsername,
        consumer_accounts.ConsumerAccount.consumer_id != user_id).first()

    if usernameExist:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exist.")

    user.username = updatedUsername
    db.commit()
    db.refresh(user)
    return user

def login_with_google(db: Session, google_token: str) -> ConsumerAccount:
    infoID = verify_google_token(google_token)
    email = infoID["email"]

    consumer = db.query(ConsumerAccount).filter(ConsumerAccount.email == email).first()

    if not consumer:
        raise HTTPException(status_code=404, detail="No account found with this email. Please sign up first.")

    if not consumer.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your account before logging in.")

    return consumer