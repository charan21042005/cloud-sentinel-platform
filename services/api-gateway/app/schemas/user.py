from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    pass # Password will be added in Auth phase

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True) # SQLAlchemy 2.0 ORM compatibility

    id: UUID
    is_active: bool
    role: str
    created_at: datetime
    updated_at: datetime
