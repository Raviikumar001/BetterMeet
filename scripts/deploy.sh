#!/bin/bash
set -e

echo "🚀 Deploying to production..."
echo ""

echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose -f docker-compose.yml up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services running:"
docker-compose ps
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
