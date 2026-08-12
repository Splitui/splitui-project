from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    check_api_token: str
    check_api_url: str
    class Config:
        env_file = ".env"


settings = Settings()