from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Eje Salud API"
    debug: bool = False

    database_url: str = "sqlite:///./eje_salud.db"
    jwt_secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8

    frontend_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"

    admin_bootstrap_email: str | None = None
    admin_bootstrap_password: str | None = None

    rate_limit_default: str = "100/minute"
    rate_limit_write: str = "20/minute"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.frontend_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
