from pydantic import BaseModel, Field


class SpecialtyRead(BaseModel):
    id: int
    slug: str
    name: str
    description: str
    sort_order: int
    is_active: bool

    model_config = {"from_attributes": True}


class SpecialtyAdminCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=80)
    name: str = Field(..., min_length=2, max_length=120)
    description: str = Field(default="", max_length=20000)
    sort_order: int = Field(default=0, ge=0, le=10_000)
    is_active: bool = True


class SpecialtyAdminUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=2, max_length=80)
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=20000)
    sort_order: int | None = Field(default=None, ge=0, le=10_000)
    is_active: bool | None = None
