import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.services import get_auth_service
from app.schemas.auth import Token, UserLogin, UserRegister
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    user_in: UserRegister, auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new sentinel on the platform.
    """
    logger.info(f"Registration attempt for user: {user_in.username}")
    user = await auth_service.register_user(user_in)
    logger.info(f"User successfully registered: {user.username} (ID: {user.id})")
    return user


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate and receive a JWT access token.
    """
    logger.info(f"Login attempt for user: {login_data.username}")
    user = await auth_service.authenticate_user(login_data)

    if not user:
        logger.warning(f"Failed login attempt for user: {login_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_service.create_user_token(user)
    logger.info(f"User logged in successfully: {user.username}")
    return token
