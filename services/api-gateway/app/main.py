from fastapi import FastAPI

app = FastAPI(
    title="Cloud Sentinel API",
    description="Primary API Gateway and Logic Engine for the Cloud Sentinel Platform",
    version="1.0.0"
)

@app.get("/health", tags=["Liveness"])
async def health_check():
    """Service health check for K8s/ALB"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "version": "1.0.0"
    }

@app.get("/", tags=["General"])
async def root():
    return {"message": "Welcome to Cloud Sentinel API Service. Documentation at /docs"}
