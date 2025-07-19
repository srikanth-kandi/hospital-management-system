#!/bin/bash

echo "🚀 Starting Hospital Management System deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it first: npm install -g pm2"
    exit 1
fi

print_status "Running production verification..."
npm run verify:prod

print_status "Checking current PM2 status..."
pm2 status

print_status "Pulling latest changes from git..."
git pull origin main

print_status "Installing dependencies..."
npm install

print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_status "Creating logs directory if it doesn't exist..."
mkdir -p logs

print_status "Restarting PM2 application..."
pm2 restart hms-backend

if [ $? -eq 0 ]; then
    print_status "✅ Deployment completed successfully!"
    print_status "📊 Application status:"
    pm2 status hms-backend
    
    print_status "📋 Recent logs:"
    pm2 logs hms-backend --lines 10
    
    print_status "🌐 Health check:"
    curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health
    
else
    print_error "❌ Deployment failed!"
    print_status "📋 Error logs:"
    pm2 logs hms-backend --err --lines 20
    exit 1
fi

echo ""
print_status "🎉 Hospital Management System is now live!"
print_status "📚 API Documentation: http://localhost:5000/api-docs"
print_status "🔍 Health Check: http://localhost:5000/api/health" 