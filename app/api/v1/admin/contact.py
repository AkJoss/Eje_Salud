from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.contact import ContactMessage
from app.schemas.contact import ContactAdminUpdate, ContactRead

router = APIRouter(prefix="/admin/contact-messages", tags=["admin-contact"])


@router.get("", response_model=list[ContactRead])
def list_contact_messages(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
    unread_only: bool = Query(False),
) -> list[ContactMessage]:
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    if unread_only:
        stmt = stmt.where(ContactMessage.is_read.is_(False))
    return list(db.scalars(stmt).all())


@router.patch("/{message_id}", response_model=ContactRead)
def update_contact_message(
    message_id: int,
    payload: ContactAdminUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> ContactMessage:
    entity = db.scalars(select(ContactMessage).where(ContactMessage.id == message_id)).first()
    if entity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(entity, key, value)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity
