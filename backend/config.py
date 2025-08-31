from pydantic_settings import BaseSettings
from pydantic import Field
from plaid import Configuration, ApiClient, Environment
from plaid.api import plaid_api

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    PLAID_CLIENT_ID: str = Field(..., env="PLAID_CLIENT_ID")
    PLAID_SECRET: str = Field(..., env="PLAID_SECRET")
    openai_api_key: str  
    ENV: str  # e.g. "sandbox" or "production"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        url = self.DATABASE_URL
        # Render often provides "postgres://"
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]
        return url

    class Config:
        env_file = ".env"

settings = Settings()

# Plaid client setup
plaid_environment = (
    Environment.Sandbox if settings.ENV == "sandbox" else Environment.Production
)

configuration = Configuration(
    host=plaid_environment,
    api_key={
        "clientId": settings.PLAID_CLIENT_ID,
        "secret": settings.PLAID_SECRET,
    },
)

api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

