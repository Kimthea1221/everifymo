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

    class Config:
        env_file = ".env"


settings = Settings()