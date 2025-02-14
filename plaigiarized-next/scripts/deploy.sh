#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting deployment process..."

# 1. Check if all required environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$NEXTAUTH_SECRET" ] || [ -z "$NEXTAUTH_URL" ]; then
    echo "${RED}Error: Missing required environment variables${NC}"
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "${RED}Error: Failed to install dependencies${NC}"
    exit 1
fi

# 3. Run type checks
echo "🔍 Running type checks..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "${RED}Error: Type check failed${NC}"
    exit 1
fi

# 4. Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "${RED}Error: Database migration failed${NC}"
    exit 1
fi

# 5. Build the application
echo "🏗️ Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "${RED}Error: Build failed${NC}"
    exit 1
fi

# 6. Start the application
echo "🌟 Starting application..."
npm run start

echo "${GREEN}✅ Deployment completed successfully!${NC}" 