from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    subject: str = Field(default="", max_length=200)
    body: str = Field(..., min_length=5, max_length=10000)


class ContactRead(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    subject: str
    body: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactAdminUpdate(BaseModel):
    is_read: bool | None = None
