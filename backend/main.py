from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

""" from app.routers.auth.invite import router as invite_router
from app.routers.regions.regions import router as regions_router """

# registration endpoints are in a separate file, so we import the router here and attach it to the main app
from app.desktop.routers.auth import registration
from app.desktop.routers.auth.invite import router as invite_router
from app.desktop.routers.regions.regions import router as regions_router

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
app.imclude_router(registration.router)

@app.get("/")
def root():
    return {"message": "Backend is running"}