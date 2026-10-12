from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.roles import UserRole


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class AdminUserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    role: UserRole

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password exceeds the supported length")
        return value


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)  # SQLAlchemy 2.0 ORM compatibility

    id: UUID
    is_active: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime
