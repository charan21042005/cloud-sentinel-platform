#!/bin/bash
set -e

# --- Configuration ---
PROJECT_NAME="Cloud Sentinel Platform"
REQUIRED_TOOLS=("docker" "python3" "node" "npm")

echo "===================================================="
echo "🚀 Bootstrapping $PROJECT_NAME..."
echo "===================================================="

# Check for required tools
for tool in "${REQUIRED_TOOLS[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
        echo "❌ Error: '$tool' is not installed."
        exit 1
    fi
    echo "✅ Found: $tool"
done

# Initialize .env
if [ ! -f .env ]; then
    echo "📄 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env initialized."
else
    echo "ℹ️  .env already exists, skipping."
fi

# Setup Backend Virtual Environment (optional but recommended for local IDE)
echo "🐍 Setting up Python environment..."
cd services/api-gateway
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..

echo "===================================================="
echo "🎉 Setup Complete! Run 'make dev' to begin."
echo "===================================================="
