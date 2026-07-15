from fastapi import Depends, FastAPI, HTTPException, status
from typing import Annotated

from fastapi.middleware.cors import CORSMiddleware

""" from app.routers.auth.invite import router as invite_router
from app.routers.regions.regions import router as regions_router """

# registration endpoints are in a separate file, so we import the router here and attach it to the main app
from app.desktop.routers.auth import registration
from app.desktop.routers.auth.invite import router as invite_router
from app.desktop.routers.regions.regions import router as regions_router

from app.database.base import Base
from app.database.sessions import engine, get_db
from app.models import consumer_accounts
from app.extension.routers import consumer_acc as consumer_acc_router
from app.extension.routers import auth as auth_router
from app.core.security import get_current_user
from app.extension.routers import complaints


app = FastAPI()
Base.metadata.create_all(bind=engine)

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

consumer_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/", status_code=status.HTTP_200_OK)
async def user(consumer: consumer_dependency):
    if consumer is None:
        raise HTTPException(status_code=401,
                            detail = "Authentication Failed")
    return {
        "User": consumer
    }
