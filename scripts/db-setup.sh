#!/bin/bash

# Setup database schema
echo "Setting up database schema..."

# Check if container is running
if ! docker ps | grep -q blog_db; then
    echo "❌ Database container is not running. Please start it first with:"
    echo "   docker compose up -d"
    echo "   or"
    echo "   ./scripts/db-start.sh"
    exit 1
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 2

# Run migrations
echo "Running migrations..."
docker exec -i blog_db psql -U postgres -d blog_db < migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema setup complete!"
    echo "Tables created: users, articles"
else
    echo "❌ Failed to setup database schema"
    exit 1
fi

