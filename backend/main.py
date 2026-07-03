from fastapi import FastAPI

# registration endpoints are in a separate file, so we import the router here and attach it to the main app
from app.routers.auth import registration


app = FastAPI()
app.include_router(registration.router)

@app.get("/")
def root():
    return {"message": "Backend is running"}