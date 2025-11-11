#!/bin/bash
set -e

echo "🏗️ Building both services..."
echo ""

# Build backend
echo "📦 Building backend..."
cd backend
go build -o main cmd/server/main.go
cd ..
echo "   ✅ Backend built"

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build >/dev/null 2>&1
cd ..
echo "   ✅ Frontend built"

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "  - Start with Docker: npm start"
echo "  - Or with docker-compose: docker-compose up"
echo ""
