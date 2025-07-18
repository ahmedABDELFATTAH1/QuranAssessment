#!/bin/bash

# Comprehensive Testing Script
echo "🧪 Running All Tests - Frontend & Backend"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_PASSED=false
FRONTEND_PASSED=false

echo -e "${BLUE}📦 Step 1: Backend Tests${NC}"
echo "========================="

cd backend
if npm test; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
    BACKEND_PASSED=true
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Step 2: Frontend Tests${NC}"
echo "=========================="

cd ../frontend
if npm test; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
    FRONTEND_PASSED=true
else
    echo -e "${RED}❌ Frontend tests failed!${NC}"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=========================================="

if [[ "$BACKEND_PASSED" == true ]]; then
    echo -e "Backend:  ${GREEN}✅ PASSED${NC}"
else
    echo -e "Backend:  ${RED}❌ FAILED${NC}"
fi

if [[ "$FRONTEND_PASSED" == true ]]; then
    echo -e "Frontend: ${GREEN}✅ PASSED${NC}"
else
    echo -e "Frontend: ${RED}❌ FAILED${NC}"
fi

echo ""

if [[ "$BACKEND_PASSED" == true && "$FRONTEND_PASSED" == true ]]; then
    echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
    echo ""
    echo "📋 Quick Commands:"
    echo "  npm run test:backend     # Backend tests only"
    echo "  npm run test:frontend    # Frontend tests only"
    echo "  npm run test:all         # Both test suites"
    echo "  ./test-backend.sh        # Backend with detailed output"
    echo "  ./test-frontend.sh       # Frontend with detailed output"
    exit 0
else
    echo -e "${RED}💥 Some tests failed. Please check the output above.${NC}"
    echo ""
    echo "🔧 Debugging Commands:"
    echo "  npm run test:backend:watch    # Watch backend tests"
    echo "  npm run test:frontend:watch   # Watch frontend tests"
    echo "  ./test-backend.sh --coverage  # Backend coverage report"
    echo "  ./test-frontend.sh --coverage # Frontend coverage report"
    exit 1
fi
