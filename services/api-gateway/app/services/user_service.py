from fastapi import HTTPException, status

from app.core.roles import UserRole
from app.core.security import get_password_hash
from app.services.audit_service import AuditService
from app.db.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import AdminUserCreate


class UserService:
    def __init__(self, user_repo: UserRepository, audit_service: AuditService):
        self.user_repo = user_repo
        self.audit_service = audit_service

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

    async def create_managed_user(
        self, user_in: AdminUserCreate, actor_user_id
    ) -> User:
        if await self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
            )
        if await self.user_repo.get_by_username(user_in.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Username already taken"
            )
        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            role=user_in.role,
            is_active=True,
        )
        self.user_repo.db.add(user)
        await self.user_repo.db.flush()
        created = user
        self.audit_service.stage(
            "user.created",
            "Administrator created a user",
            actor_user_id=actor_user_id,
            target_type="user",
            target_id=str(created.id),
            details={"role": created.role},
        )
        await self.user_repo.db.commit()
        await self.user_repo.db.refresh(created)
        return created

    async def update_role(self, user_id: any, role: UserRole, actor_user_id) -> User:
        user = await self.get_user(user_id)
        previous_role = user.role
        if user.is_active and user.role == UserRole.ADMIN and role != UserRole.ADMIN:
            if await self.user_repo.count_active_admins() <= 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="The last active administrator cannot be demoted",
                )
        user.role = role
        updated = user
        self.audit_service.stage(
            "user.role_changed",
            "Administrator changed a user's role",
            actor_user_id=actor_user_id,
            target_type="user",
            target_id=str(updated.id),
            details={"previous_role": previous_role, "new_role": updated.role},
        )
        await self.user_repo.db.commit()
        await self.user_repo.db.refresh(updated)
        return updated
