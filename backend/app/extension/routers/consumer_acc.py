from typing import Annotated

from fastapi import BackgroundTasks
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.sessions import get_db
from app.extension.schemas.consumer_acc import CreateConsumerAcc, UpdateUsername, VerifyOTP, RequestOTP
from app.extension.services import consumer_acc_service
from app.core.security import get_current_user

from app.extension.services.send_email import send_otp_email

router = APIRouter(
    prefix="/accounts",
    tags=["Consumer Accounts"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router .post("/", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependency, create_user_request: CreateConsumerAcc, background_tasks: BackgroundTasks):
    consumer, code = consumer_acc_service.create_user(db, create_user_request)
    background_tasks.add_task(send_otp_email, consumer.email, code)    

    return {"detail": "Account created successfully"}

@router .put("/username", status_code=status.HTTP_200_OK)
async def update_username(db: db_dependency, current_user: user_dependency, update_request: UpdateUsername):
    updated_user = consumer_acc_service.update_username(
        db, current_user["id"], update_request.username)

    return {
        "detail": "Username updated succesfully",
        "username": updated_user.username
    }

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(db: db_dependency, verify_request: VerifyOTP):
    consumer_acc_service.verify_signup_otp(db, verify_request.email, verify_request.otp_code)
    return {"detail": "Account verified successfully"}

@router.post("/resend-otp", status_code=status.HTTP_200_OK)
async def resend_otp(db: db_dependency, request: RequestOTP, background_tasks: BackgroundTasks):
    code = consumer_acc_service.resend_signup_otp(db, request.email)
    background_tasks.add_task(send_otp_email, request.email, code)
    
    return {"detail": "OTP resent"}