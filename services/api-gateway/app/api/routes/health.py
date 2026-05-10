from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["Infrastructure"])
async def health_check():
    """
    Liveness and Readiness probe endpoint for Kubernetes and Load Balancers.
    """
    return {
        "status": "healthy",
        "service": "api-gateway"
    }
