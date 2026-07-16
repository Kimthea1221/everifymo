from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.core.security import pwd_context
from app.models.consumer_accounts import ConsumerAccount
from app.extension.schemas.consumer_acc import CreateConsumerAcc

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
    return consumer_acc