from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
from plaid import Configuration, ApiClient, Environment
from plaid.api import plaid_api


class Settings(BaseSettings):
    # Pydantic v2 settings config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",          # <- don't crash on unexpected env keys
        case_sensitive=False,
    )

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Accept either PLAID_SECRET or PLAID_SANDBOX_SECRET
    PLAID_CLIENT_ID: str = Field(..., validation_alias=AliasChoices("PLAID_CLIENT_ID"))
    PLAID_SECRET: str = Field(..., validation_alias=AliasChoices("PLAID_SECRET", "PLAID_SANDBOX_SECRET"))

    # Map OPENAI_API_KEY -> openai_api_key attribute
    openai_api_key: str = Field("", validation_alias=AliasChoices("OPENAI_API_KEY"))  

    # Accept either PLAID_ENV or ENV ("sandbox" / "production")
    ENV: str = Field("sandbox", validation_alias=AliasChoices("PLAID_ENV", "ENV")) 

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        url = self.DATABASE_URL
        # normalize to psycopg3 driver
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]
        return url
    

settings = Settings()

# Plaid client setup
plaid_environment = (
    Environment.Sandbox if settings.ENV.lower() == "sandbox" else Environment.Production
)

configuration = Configuration(
    host=plaid_environment,
    api_key={"clientId": settings.PLAID_CLIENT_ID, "secret": settings.PLAID_SECRET},
)

api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)
