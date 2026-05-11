from typing import Optional
from sqlalchemy import select
from app.db.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """
    User-specific Repository for specialized queries.
    """
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalars().first()
