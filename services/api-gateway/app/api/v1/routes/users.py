from uuid import UUID
from fastapi import APIRouter, Depends, status
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.dependencies.services import get_user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate, 
    service: UserService = Depends(get_user_service)
):
    """
    Register a new user in the platform.
    """
    return await service.create_user(user_in)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID, 
    service: UserService = Depends(get_user_service)
):
    """
    Retrieve user details by UUID.
    """
    return await service.get_user(user_id)
