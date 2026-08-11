from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone, timedelta

from app.database.sessions import get_db
from app.models.users import User
from app.models.account_invitation_tokens import AccountInvitationToken
from app.models.regions import Region

from app.desktop.schemas.auth.registration import (
    ValidateTokenResponse, TokenStatus,
    RegistrationCompleteRequest, RegistrationCompleteResponse,
)

from app.core.constants import UserStatus

from app.desktop.schemas.auth.registration import ResendInviteRequest, ResendInviteResponse
import secrets

from app.desktop.schemas.auth.registration import RequestResendRequest, RequestResendResponse


# All registration-related endpoints will start with /registration
router = APIRouter(prefix="/registration", tags=["Registration"])

    #
    #
    #
    #
    #
    #
    # GET /registration/validate/{invite_token}
@router.get("/validate/{invite_token}", response_model=ValidateTokenResponse)
def validate_token(invite_token: str, db: Session = Depends(get_db)):
    db.execute(text("SET app.bypass_rls = 'true'"))

    token_row = db.query(AccountInvitationToken).filter(
        AccountInvitationToken.invite_token == invite_token
    ).first()

    if not token_row:
        return ValidateTokenResponse(status=TokenStatus.invalid, message="This invitation link is not valid.")

    user_row = db.query(User).filter(User.user_id == token_row.user_id).first()
    role = user_row.role if user_row else None

    if token_row.used_at is not None:
        return ValidateTokenResponse(
            status=TokenStatus.used,
            message="This invitation has already been used to complete registration.",
            role=role,
        )

    if token_row.expires_at < datetime.now(timezone.utc):
        return ValidateTokenResponse(
            status=TokenStatus.expired,
            message="This invitation link has expired. Please request a new one.",
            role=role,
        )

    region_row = db.query(Region).filter(Region.region_id == user_row.region_id).first()

    return ValidateTokenResponse(
        status=TokenStatus.valid,
        email=user_row.email,
        role=role,
        region_id=user_row.region_id,
        region_name=region_row.region_name if region_row else None,
    )

    #
    #
    #
    #
    #
    #
    # POST /registration/complete
@router.post("/complete", response_model=RegistrationCompleteResponse)
def complete_registration(data: RegistrationCompleteRequest, db: Session = Depends(get_db)):

    # Same as before — officer isn't logged in yet, so we need this
    # to be allowed to look at the users table at all
    db.execute(text("SET app.bypass_rls = 'true'"))   

    # This time the token comes from the request body (the form data),
    # not from the URL like in validate_token
    token_row = db.query(AccountInvitationToken).filter(
        AccountInvitationToken.invite_token == data.invite_token   
    ).first()


    # Same checks as validate_token — we don't trust that the token is
    # still good just because the officer got this far. It could have
    # expired or been used in between loading the form and submitting it.
    if not token_row:
        raise HTTPException(status_code=404, detail="Invalid invitation token.")   

    if token_row.used_at is not None:
        # 409 = the token exists, but its state conflicts with what we're trying to do
        raise HTTPException(status_code=409, detail="This invitation has already been used to complete registration.")   

    if token_row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This invitation has expired.")

    # Token is good — find the stub account this invite belongs to
    user_row = db.query(User).filter(User.user_id == token_row.user_id).first()

    # Fill in everything the officer typed into the registration form
    user_row.first_name = data.first_name
    user_row.last_name = data.last_name          
    user_row.middle_name = data.middle_name
    user_row.position = data.position           
    user_row.employee_id = data.employee_id
    user_row.contact_number = data.contact_number
    user_row.department = data.department

    # Account has moved from "invited" to "waiting for SuperAdmin to review it"
    user_row.status = UserStatus.PENDING_APPROVAL       

    # Mark this token as used so it can never be used again
    token_row.used_at = datetime.now(timezone.utc)

    # Save both changes together — either both go through, or neither does
    db.commit()   

    return RegistrationCompleteResponse(
        message="Registration submitted successfully.",
        status=UserStatus.PENDING_APPROVAL,   
    )

    #
    #
    #
    #
    #
    #
    # POST /registration/resend-invite
@router.post("/resend-invite", response_model=ResendInviteResponse)
def resend_invite(data: ResendInviteRequest, db: Session = Depends(get_db)):

    # Same as the other two endpoints — officer isn't logged in,
    # so we need this to be allowed to look at these tables at all
    db.execute(text("SET app.bypass_rls = 'true'"))   

    # Find the old, presumably-expired token the officer is trying to resend
    old_token_row = db.query(AccountInvitationToken).filter(
        AccountInvitationToken.invite_token == data.invite_token   
    ).first()

    # If registration was never started with this token, there's nothing to resend
    if not old_token_row:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    
    # If registration was already completed with this token, there's
    # nothing to resend — the account has already moved on.
    if old_token_row.used_at is not None:
        raise HTTPException(status_code=409, detail="This invitation was already used to complete registration.")

    # Resending only makes sense if the old one is genuinely expired —
    # otherwise someone could keep generating new tokens for a link that still works fine
    if old_token_row.expires_at > datetime.now(timezone.utc):   
        raise HTTPException(status_code=400, detail="This invitation has not expired yet.")

    # Build a brand new token, pointing at the same user.
    # We don't touch or delete the old row — it stays in the table for audit purposes.
    new_token = AccountInvitationToken(
        user_id=old_token_row.user_id,                        
        invite_token=secrets.token_urlsafe(32),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=48),
    )

    # This is a brand new row, never fetched from the database, so we
    # need add() before commit() will know to save it.
    db.add(new_token)   
    db.commit()

    return ResendInviteResponse(
        message="A new invitation has been generated.",
    )

  #
  #
  #
  #
  #
  #
  # POST /registration/request-resend
@router.post("/request-resend", response_model=RequestResendResponse)
def request_resend(data: RequestResendRequest, db: Session = Depends(get_db)):
    # Officer isn't logged in, same bypass as every other registration endpoint
    db.execute(text("SET app.bypass_rls = 'true'"))

    # Find the token the officer is asking to have resent
    token_row = db.query(AccountInvitationToken).filter(
        AccountInvitationToken.invite_token == data.invite_token
    ).first()

    if not token_row:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    if token_row.used_at is not None:
        raise HTTPException(status_code=409, detail="This invitation was already used.")

    # Only makes sense to request a resend if the link is actually expired
    if token_row.expires_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This invitation has not expired yet.")

    # Don't let the same expired token flood SuperAdmin with repeat requests
    if token_row.resend_requested_at is not None:
        raise HTTPException(status_code=409, detail="A resend has already been requested for this invitation.")

    # Just flag the request — SuperAdmin decides whether to actually resend
    token_row.resend_requested_at = datetime.now(timezone.utc)
    db.commit()

    return RequestResendResponse(
        message="Your request has been sent to the administrator.",
    )