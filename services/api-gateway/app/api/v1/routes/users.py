from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.dependencies.services import get_user_service
from app.dependencies.auth import get_current_user, require_admin
from app.db.models.user import User

# Prefix and tags are now handled by the central api_router
router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the currently authenticated user's profile.
    """
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_details(
    user_id: UUID, 
    service: UserService = Depends(get_user_service),
    current_user: User = Depends(require_admin)
):
    """
    Retrieve any user's details by UUID.
    Restricted to Admins.
    """
    return await service.get_user(user_id)
