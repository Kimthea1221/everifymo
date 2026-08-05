from fastapi import Depends, FastAPI, HTTPException, status
from typing import Annotated

from fastapi.middleware.cors import CORSMiddleware

""" from app.routers.auth.invite import router as invite_router
from app.routers.regions.regions import router as regions_router """

from app.desktop.routers.auth.superadmin_login import router as superadmin_login_router
from app.desktop.routers.auth.password_reset import router as password_reset_router
from app.desktop.routers.auth.sessions import router as sessions_router
from app.desktop.routers.auth import registration
from app.desktop.routers.auth.invite import router as invite_router
from app.desktop.routers.regions.regions import router as regions_router
from app.desktop.routers.user_management.management import router as user_management_router
from app.desktop.routers.auth.personnel_login import router as personnel_login_router
from app.desktop.routers.auth.password_change import router as password_change_router

from app.database.base import Base
from app.database.sessions import engine, get_db
from app.models import consumer_accounts
from app.extension.routers import consumer_acc as consumer_acc_router
from app.extension.routers import auth as auth_router
from app.core.security import get_current_user
from app.extension.routers import complaints

from app.extension.routers import status as status_router


# Saved Drafts feature
from app.desktop.routers.drafts.walkin_drafts import router as walkin_drafts_router
from app.desktop.routers.drafts.all_drafts import router as all_drafts_router
from app.desktop.routers.drafts.verification_drafts import router as verification_drafts_router

# Complainant and Complaint Creation feature
from app.desktop.routers.complaints.walkin_complaints import (
    draft_submit_router,
    direct_complaint_router,
)

# Verification Joined Detail feature
from app.desktop.routers.complaints.complaint_detail import router as complaint_detail_router
# Not used yet, but will be used in the future for shared files download
from app.desktop.routers.complaints.shared_files import router as shared_files_router

# Verificatiion Request feature
from app.desktop.routers.verification.verification_requests import (
    draft_submit_router as verification_draft_submit_router,
    direct_request_router as verification_direct_request_router,
)

# verification Ready to Send and Awaiting FDA tab
from app.desktop.routers.verification.verification_requests import (
    draft_submit_router as verification_draft_submit_router,
    direct_request_router as verification_direct_request_router,
    list_router as verification_list_router,
)

app = FastAPI()
# Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invite_router)
app.include_router(regions_router)
app.include_router(registration.router)

app.include_router(consumer_acc_router.router)
app.include_router(auth_router.router)
app.include_router(complaints.router)

app.include_router(status_router.router)

consumer_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/")
def root():
    return {"message": "Backend is running"}



app.include_router(superadmin_login_router)
app.include_router(password_reset_router)
app.include_router(sessions_router)

app.include_router(user_management_router)

app.include_router(walkin_drafts_router)
app.include_router(all_drafts_router)
app.include_router(verification_drafts_router)

app.include_router(draft_submit_router)
app.include_router(direct_complaint_router)

app.include_router(complaint_detail_router)
app.include_router(shared_files_router)

app.include_router(verification_draft_submit_router)
app.include_router(verification_direct_request_router)

app.include_router(verification_list_router)

app.include_router(personnel_login_router)
app.include_router(password_change_router)

@app.get("/", status_code=status.HTTP_200_OK)
async def user(consumer: consumer_dependency):
    if consumer is None:
        raise HTTPException(status_code=401,
                            detail = "Authentication Failed")
    return {
        "User": consumer
    }

