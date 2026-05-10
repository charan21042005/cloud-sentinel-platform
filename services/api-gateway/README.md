# Cloud Sentinel API Gateway — Foundation

Primary entry point for the Cloud Sentinel observability platform. Built with FastAPI and optimized for high-throughput cloud-native environments.

## 🏗️ Architecture Reasoning
- **Router Pattern:** Decouples endpoints from the app factory.
- **Pydantic Settings:** Ensures type-safe configuration via environment variables.
- **Slim Containerization:** Follows the "Least Privilege" principle with non-root users.

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Docker (optional)

### Installation (Local)
1. Navigate to the service:
   ```bash
   cd services/api-gateway
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running Locally
```bash
python run.py
```
The API will be available at `http://localhost:8000`. 
Interactive docs: `http://localhost:8000/docs`.

### Docker Commands
```bash
# Build the image
docker build -t sentinel-api-gateway .

# Run the container
docker run -p 8000:8000 sentinel-api-gateway
```

## 📊 Health Check Usage
- **Endpoint:** `/api/v1/health`
- **Method:** `GET`
- **Purpose:** Used by Kubernetes `livenessProbe` and `readinessProbe`.
