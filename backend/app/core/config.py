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

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # add to settings if you want this configurable

    class Config:
        env_file = ".env"


settings = Settings()