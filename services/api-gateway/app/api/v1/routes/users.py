from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.db.models.user import User
from app.dependencies.auth import get_current_user, require_admin
from app.dependencies.services import get_user_service
from app.schemas.user import AdminUserCreate, UserResponse, UserRoleUpdate
from app.services.user_service import UserService

# Prefix and tags are now handled by the central api_router
router = APIRouter()


@router.get("/", response_model=list[UserResponse])
async def list_users(
    service: UserService = Depends(get_user_service),
    _admin: User = Depends(require_admin),
):
    return await service.list_users()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: AdminUserCreate,
    service: UserService = Depends(get_user_service),
    _admin: User = Depends(require_admin),
):
    return await service.create_managed_user(user_in)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve the currently authenticated user's profile.
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: UUID,
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(require_admin),
):
    """
    Retrieve any user's details by UUID.
    Restricted to Admins.
    """
    return await service.get_user(user_id)


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID,
    role_in: UserRoleUpdate,
    service: UserService = Depends(get_user_service),
    _admin: User = Depends(require_admin),
):
    return await service.update_role(user_id, role_in.role)
