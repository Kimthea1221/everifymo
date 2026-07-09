from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth.invite import router as invite_router
from app.routers.regions.regions import router as regions_router

from app.routers.auth.superadmin_login import router as superadmin_login_router
from app.routers.auth.password_reset import router as password_reset_router
from app.routers.auth.sessions import router as sessions_router
# registration endpoints are in a separate file, so we import the router here and attach it to the main app
from app.routers.auth import registration

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

