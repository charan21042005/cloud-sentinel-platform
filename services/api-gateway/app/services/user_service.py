from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.db.models.user import User
from app.core.logging import logger

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def create_user(self, user_in: UserCreate) -> User:
        """
        Create a new platform user.
        Note: Use AuthService for registration to handle password hashing.
        """
        # Business Logic: Check for duplicates
        if await self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        if await self.user_repo.get_by_username(user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        logger.info(f"Creating new user: {user_in.username}")
        user_obj = User(**user_in.model_dump())
        return await self.user_repo.create(user_obj)

    async def get_user(self, user_id: any) -> User:
        """
        Retrieve a user by their UUID.
        """
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
