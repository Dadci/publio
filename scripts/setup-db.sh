#!/bin/bash

# Local PostgreSQL Database Setup Script for Publio

echo "🚀 Setting up local PostgreSQL database for Publio..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "You can start it with: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database
echo "📦 Creating database 'publio_db'..."
createdb publio_db 2>/dev/null || echo "⚠️  Database 'publio_db' might already exist"

# Check if we can connect
if psql -d publio_db -c '\q' 2>/dev/null; then
    echo "✅ Successfully connected to publio_db"
else
    echo "❌ Failed to connect to database. Please check your PostgreSQL setup."
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Update your .env.local file with the correct DATABASE_URL"
echo "2. Run: npm run db:push"
echo "3. Start developing! 🎉"
echo ""
echo "📚 Available commands:"
echo "  npm run db:generate  - Generate migrations"
echo "  npm run db:push      - Push schema to database"
echo "  npm run db:studio    - Open Drizzle Studio"
