from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    PLAID_CLIENT_ID: str = Field(..., env="PLAID_CLIENT_ID")
    PLAID_SECRET: str = Field(..., env="PLAID_SECRET")
    openai_api_key: str  
    ENV: str

    class Config:
        env_file = ".env"

settings = Settings()
