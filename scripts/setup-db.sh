#!/bin/bash

# Database setup script
# Usage: ./scripts/setup-db.sh [database_name] [username]

DB_NAME=${1:-blog_db}
DB_USER=${2:-postgres}

echo "Setting up database: $DB_NAME"

# Check if database exists
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Database $DB_NAME already exists. Dropping and recreating..."
    dropdb -U "$DB_USER" "$DB_NAME"
fi

# Create database
createdb -U "$DB_USER" "$DB_NAME"

# Run migrations
echo "Running migrations..."
psql -U "$DB_USER" -d "$DB_NAME" -f migrations/001_initial_schema.sql

echo "Database setup complete!"

