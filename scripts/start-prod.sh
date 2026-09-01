#!/bin/bash

# Gym Yamjamsai - Production Startup Script
# Usage: ./scripts/start-prod.sh

set -e  # Exit on error

echo "=========================================="
echo "  Gym Yamjamsai - Production Startup"
echo "=========================================="

# Check .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Please copy .env.production.example to .env and configure values:"
    echo "   cp .env.production.example .env"
    echo "   nano .env  # Edit with production values"
    exit 1
fi

# Verify required environment variables
required_vars=("MYSQL_ROOT_PASSWORD" "JWT_SECRET" "FRONTEND_ORIGIN" "VITE_API_URL")
for var in "${required_vars[@]}"; do
    if [ -z "$(grep "^$var=" .env)" ]; then
        echo "❌ ERROR: Required environment variable missing: $var"
        exit 1
    fi
done

echo "✅ Environment variables verified"

# Build images
echo ""
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "✅ Images built successfully"

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Services started"

# Wait for MySQL to be healthy
echo ""
echo "⏳ Waiting for MySQL to initialize (30 seconds)..."
sleep 30

# Verify MySQL is running
if ! docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost &>/dev/null; then
    echo "❌ MySQL failed to start"
    docker-compose -f docker-compose.prod.yml logs mysql
    exit 1
fi

echo "✅ MySQL initialized successfully"

# Verify backend is running
echo ""
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health &>/dev/null; then
        echo "✅ Backend is running"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start after 30 seconds"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi
    sleep 1
done

# Verify frontend is running
echo ""
echo "⏳ Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost/ &>/dev/null; then
        echo "✅ Frontend is running"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start after 30 seconds"
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi
    sleep 1
done

# Print status
echo ""
echo "=========================================="
echo "✅ ALL SERVICES STARTED SUCCESSFULLY"
echo "=========================================="
echo ""
echo "📍 Frontend:  http://localhost"
echo "📍 Backend:   http://localhost:5000"
echo "📍 API Docs:  http://localhost:5000/api/health"
echo ""
echo "🔐 Test Login:"
echo "   Email: admin@test.com"
echo "   Password: admin123"
echo ""
echo "📊 View Logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop Services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo "=========================================="
