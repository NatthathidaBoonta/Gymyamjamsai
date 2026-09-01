#!/bin/bash

# Gym Yamjamsai - Production Health Check
# Run this to verify all services are operational

set -e

echo "=========================================="
echo "  Gym Yamjamsai - Health Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_service() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Checking $name... "

    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $status)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected $expected_status, got $status)"
        return 1
    fi
}

all_healthy=true

# Check backend health
if ! check_service "Backend Health" "http://localhost:5000/api/health" "200"; then
    all_healthy=false
fi

# Check frontend access
if ! check_service "Frontend" "http://localhost/" "200"; then
    all_healthy=false
fi

# Check database
echo -n "Checking Database... "
if docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost &>/dev/null; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    all_healthy=false
fi

# Check Docker services status
echo ""
echo "Service Status:"
docker-compose -f docker-compose.prod.yml ps | tail -n +2 | while read line; do
    if [[ $line == *"Up"* ]]; then
        echo -e "${GREEN}✅${NC} $line"
    else
        echo -e "${RED}❌${NC} $line"
        all_healthy=false
    fi
done

# Check resource usage
echo ""
echo "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | grep gymyamjamsai

# Summary
echo ""
echo "=========================================="
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}✅ ALL SERVICES HEALTHY${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME SERVICES UNHEALTHY${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: docker-compose -f docker-compose.prod.yml logs"
    echo "  2. Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "  3. Verify .env file configured correctly"
    exit 1
fi
