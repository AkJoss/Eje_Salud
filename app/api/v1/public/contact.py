from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactRead

router = APIRouter(prefix="/contact-messages", tags=["public-contact"])


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_settings().rate_limit_write)
def create_contact_message(
    request: Request,
    payload: ContactCreate,
    db: Session = Depends(get_db),
) -> ContactMessage:
    now = datetime.now(tz=UTC)
    entity = ContactMessage(
        name=payload.name.strip(),
        email=str(payload.email).strip().lower(),
        phone=payload.phone.strip() if payload.phone else None,
        subject=payload.subject.strip(),
        body=payload.body.strip(),
        is_read=False,
        created_at=now,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity
