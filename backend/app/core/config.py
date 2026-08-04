#from pydantic_settings import BaseSettings


#class Settings(BaseSettings):
#    DATABASE_URL: str
#    MIGRATIONS_DATABASE_URL: str
#    SECRET_KEY: str = ""

#    class Config:
#        env_file = ".env"


#settings = Settings()

#contents before i replaced it with the following code
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    MIGRATIONS_DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    # desktop otp
    MAIL_HOST: str
    MAIL_PORT: int
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_FROM_NAME: str = "ICMDA"

    # add these fields to your existing Settings class
    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 5
    RESET_TOKEN_EXPIRE_MINUTES: int = 15

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 180
    
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # add to settings if you want this configurable

    DEFAULT_EXTENSION_REGION_ID: str

    # extension otp
    MAIL_EXTENSION_USERNAME: str
    MAIL_EXTENSION_PASSWORD: str
    MAIL_EXTENSION_FROM_NAME: str
    OTP_EXTENSION_MIN_EXPIRE: int = 5
    MAIL_EXTENSION_FROM: str

    class Config:
        env_file = ".env"

settings = Settings()