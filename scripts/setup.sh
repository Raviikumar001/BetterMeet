#!/bin/bash
set -e

echo "🔧 Setting up Record Meet Monorepo..."
echo ""

# Backend setup
echo "📦 Setting up backend..."
if [ -d "backend" ]; then
    cd backend
    go mod download 2>/dev/null || echo "   (go mod download skipped)"
    go mod tidy 2>/dev/null || echo "   (go mod tidy skipped)"
    cd ..
    echo "   ✅ Backend dependencies ready"
else
    echo "   ⚠️  Backend directory not found (will be created on first run)"
fi

# Frontend setup
echo "📦 Setting up frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm install >/dev/null 2>&1 &
    PID=$!
    wait $PID
    cd ..
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ⚠️  Frontend directory not found (will be created on first run)"
fi

# Copy env files if they don't exist
echo "🔑 Creating environment files..."
[ ! -f backend/.env.local ] && [ -f backend/.env.example ] && cp backend/.env.example backend/.env.local && echo "   ✅ backend/.env.local created"
[ ! -f frontend/.env.local ] && echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > frontend/.env.local && echo "   ✅ frontend/.env.local created"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review environment files:"
echo "     - backend/.env.local"
echo "     - frontend/.env.local"
echo ""
echo "  2. Start development servers:"
echo "     npm run dev    (both services)"
echo "     make dev       (alternative)"
echo ""
echo "  3. Access services:"
echo "     - Frontend: http://localhost:3000"
echo "     - Backend:  http://localhost:3001"
echo "     - Health:   http://localhost:3001/health"
echo ""
