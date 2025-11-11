#!/bin/bash
set -e

echo "🚀 Starting development servers..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start backend in background
echo -e "${BLUE}Starting Go backend on :3001${NC}"
cd backend
go run cmd/server/main.go &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo -e "${BLUE}Starting Next.js frontend on :3000${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Services running!${NC}"
echo ""
echo "   📱 Frontend: http://localhost:3000"
echo "   🔧 Backend:  http://localhost:3001"
echo "   ❤️  Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Clean up on exit
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
