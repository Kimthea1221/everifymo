from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from app.core.config import settings

TEMPLATE_PATH = Path(__file__).parent / "templates" / "invite_email.html"
TEMPLATE_PATH_SUPERADMIN = Path(__file__).parent / "templates" / "superadmin_otp_email.html"

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


def render_invite_email(agency_name: str, deep_link: str) -> str:
    html = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = html.replace("{{AGENCY_NAME}}", agency_name)
    html = html.replace("{{DEEP_LINK}}", deep_link)
    return html


async def send_invite_email(to_email: str, agency_name: str, token: str):
    display_name = {
        "fda_personnel": "FDA",
        "lea_personnel": "LEA-CIDG",
        "FDA": "FDA",
        "LEA-CIDG": "LEA-CIDG"
    }.get(agency_name, agency_name)

    deep_link = f"everifymo://complete-registration?token={token}"
    html_body = render_invite_email(display_name, deep_link)

    message = MessageSchema(
        subject="You're invited to register — ICMDA",
        recipients=[to_email],
        body=html_body,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)


def render_superadmin_otp_email(otp_code: str, expire_minutes: int) -> str:
    html = TEMPLATE_PATH_SUPERADMIN.read_text(encoding="utf-8")
    html = html.replace("{{OTP_CODE}}", otp_code)
    html = html.replace("{{EXPIRE_MINUTES}}", str(expire_minutes))
    return html


async def send_superadmin_otp_email(to_email: str, otp_code: str, expire_minutes: int = None):
    if expire_minutes is None:
        from app.core.config import settings
        expire_minutes = settings.OTP_EXPIRE_MINUTES

    html_body = render_superadmin_otp_email(otp_code, expire_minutes)

    message = MessageSchema(
        subject="Your Superadmin verification code",
        recipients=[to_email],
        body=html_body,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)