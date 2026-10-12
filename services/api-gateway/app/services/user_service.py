from fastapi import HTTPException, status

from app.core.roles import UserRole
from app.core.security import get_password_hash
from app.db.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import AdminUserCreate


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user(self, user_id: any) -> User:
        """
        Retrieve a user by their UUID.
        """
        user = await self.user_repo.get(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user

    async def list_users(self) -> list[User]:
        return await self.user_repo.list_users()

    async def create_managed_user(self, user_in: AdminUserCreate) -> User:
        if await self.user_repo.get_by_email(user_in.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if await self.user_repo.get_by_username(user_in.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role,
            is_active=True,
        )
        return await self.user_repo.create(user)

    async def update_role(self, user_id: any, role: UserRole) -> User:
        user = await self.get_user(user_id)
        if user.is_active and user.role == UserRole.ADMIN and role != UserRole.ADMIN:
            if await self.user_repo.count_active_admins() <= 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="The last active administrator cannot be demoted",
                )
        user.role = role
        return await self.user_repo.save(user)
