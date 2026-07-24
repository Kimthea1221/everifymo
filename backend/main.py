from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.desktop.routers.auth.superadmin_login import router as superadmin_login_router
from app.desktop.routers.auth.password_reset import router as password_reset_router
from app.desktop.routers.auth.sessions import router as sessions_router

# Registration feature
from app.desktop.routers.auth import registration

from app.desktop.routers.auth.invite import router as invite_router
from app.desktop.routers.regions.regions import router as regions_router
from app.desktop.routers.user_management.management import router as user_management_router

# Saved Drafts feature
from app.desktop.routers.drafts.walkin_drafts import router as walkin_drafts_router
from app.desktop.routers.drafts.all_drafts import router as all_drafts_router
from app.desktop.routers.drafts.verification_drafts import router as verification_drafts_router


app = FastAPI()


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


