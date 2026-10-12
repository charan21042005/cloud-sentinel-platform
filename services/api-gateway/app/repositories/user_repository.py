from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    User-specific Repository for specialized queries.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    async def list_users(self) -> list[User]:
        result = await self.db.execute(select(User).order_by(User.created_at, User.id))
        return list(result.scalars().all())

    async def count_active_admins(self) -> int:
        result = await self.db.execute(
            select(User.id)
            .where(User.role == "admin", User.is_active.is_(True))
            .with_for_update()
        )
        return len(result.scalars().all())

    async def save(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
