from typing import Optional
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserRegister, UserLogin, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.models.user import User

class AuthService:
    """
    Business logic for Authentication and Identity Management.
    """
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserRegister) -> User:
        """Register a new user with hashed password."""
        # Check for duplicates
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = await self.user_repo.get_by_username(user_in.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password and save
        user_obj = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role="viewer" # Default role
        )
        return await self.user_repo.create(user_obj)

    async def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """Verify username and password."""
        user = await self.user_repo.get_by_username(login_data.username)
        if not user:
            return None
        if not verify_password(login_data.password, user.hashed_password):
            return None
        return user

    def create_user_token(self, user: User) -> Token:
        """Issue a JWT for an authenticated user."""
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)
