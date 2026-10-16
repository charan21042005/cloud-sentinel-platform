from typing import Optional

from fastapi import HTTPException, status

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import Token, UserLogin, UserRegister
from app.services.audit_service import AuditService


class AuthService:
    """
    Business logic for Authentication and Identity Management.
    """

    def __init__(self, user_repo: UserRepository, audit_service: AuditService):
        self.user_repo = user_repo
        self.audit_service = audit_service

    async def register_user(self, user_in: UserRegister) -> User:
        """Register a new user with hashed password."""
        # Check for duplicates
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        existing_username = await self.user_repo.get_by_username(user_in.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

        # Hash password and save
        user_obj = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role="viewer",  # Default role
        )
        self.user_repo.db.add(user_obj)
        await self.user_repo.db.flush()
        self.audit_service.stage(
            "user.created",
            "Public registration completed",
            actor_user_id=user_obj.id,
            target_type="user",
            target_id=str(user_obj.id),
            details={"role": "viewer", "registration": "public"},
        )
        await self.user_repo.db.commit()
        await self.user_repo.db.refresh(user_obj)
        return user_obj

    async def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """Verify username and password."""
        user = await self.user_repo.get_by_username(login_data.username)
        if not user:
            await self.audit_service.record(
                "authentication.login",
                "Login failed",
                outcome="failure",
                details={"reason": "invalid_credentials"},
            )
            return None
        if not verify_password(login_data.password, user.hashed_password):
            await self.audit_service.record(
                "authentication.login",
                "Login failed",
                actor_user_id=user.id,
                outcome="failure",
                target_type="user",
                target_id=str(user.id),
                details={"reason": "invalid_credentials"},
            )
            return None
        await self.audit_service.record(
            "authentication.login",
            "Login succeeded",
            actor_user_id=user.id,
            target_type="user",
            target_id=str(user.id),
        )
        await self.user_repo.db.refresh(user)
        return user

    def create_user_token(self, user: User) -> Token:
        """Issue a JWT for an authenticated user."""
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)
