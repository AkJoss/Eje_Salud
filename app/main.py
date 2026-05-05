from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.security import hash_password
from app.db.seed import seed_specialties_if_empty
from app.db.session import SessionLocal
from app.models.admin_user import AdminUser


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    db = SessionLocal()
    try:
        seed_specialties_if_empty(db)
        if settings.admin_bootstrap_email and settings.admin_bootstrap_password:
            exists = db.scalars(select(AdminUser)).first()
            if exists is None:
                db.add(
                    AdminUser(
                        email=settings.admin_bootstrap_email.strip().lower(),
                        hashed_password=hash_password(settings.admin_bootstrap_password),
                        is_active=True,
                        created_at=datetime.now(tz=UTC),
                    )
                )
                db.commit()
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
