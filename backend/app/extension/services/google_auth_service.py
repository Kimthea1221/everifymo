import requests
from fastapi import HTTPException

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

def verify_google_token(access_token: str) -> dict:
    response = requests.get(
        GOOGLE_USERINFO_URL,
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    userinfo = response.json()

    if not userinfo.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email not verified")

    return userinfo