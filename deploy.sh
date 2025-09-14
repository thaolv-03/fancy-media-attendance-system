#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
npm run setup

# Build application
echo "🔨 Building application..."
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "- For Vercel: npm run deploy:vercel"
    echo "- For manual: npm run start"
else
    echo "❌ Build failed!"
    exit 1
fi
