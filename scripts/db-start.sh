#!/bin/bash

# Start PostgreSQL Docker container
echo "Starting PostgreSQL Docker container..."
docker compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 3

# Check if database is ready
if docker exec blog_db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    echo "Database connection: postgresql://postgres:postgres@localhost:5433/blog_db"
else
    echo "❌ Database is not ready yet. Please wait a moment and try again."
    exit 1
fi

