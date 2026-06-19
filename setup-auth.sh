#!/bin/bash

# Sena Kids - Authentication Setup Script
# This script automates the initial setup for authentication

echo "🚀 Sena Kids Authentication Setup"
echo "=================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 2: Generate NextAuth secret
echo "🔐 Step 2: Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)

# Check if .env exists
if [ -f .env ]; then
    # Check if NEXTAUTH_SECRET already exists
    if grep -q "NEXTAUTH_SECRET=" .env; then
        echo "⚠️  NEXTAUTH_SECRET already exists in .env"
        echo "   Skipping..."
    else
        echo "" >> .env
        echo "# NextAuth Configuration" >> .env
        echo "NEXTAUTH_URL=http://localhost:3000" >> .env
        echo "NEXTAUTH_SECRET=$SECRET" >> .env
        echo "✅ Added NEXTAUTH_SECRET to .env"
    fi
else
    echo "❌ .env file not found"
    exit 1
fi

echo ""

# Step 3: Database setup
echo "🗄️  Step 3: Setting up database..."
echo "   You need to manually add the User model to prisma/schema.prisma"
echo "   Press Enter after you've added it..."
read

npx prisma db push
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to update database"
    exit 1
fi

echo "✅ Database updated"
echo ""

# Step 4: Create admin user
echo "👤 Step 4: Creating admin user..."

if [ -f prisma/seed-admin.js ]; then
    node prisma/seed-admin.js
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create admin user"
        exit 1
    fi
    
    echo "✅ Admin user created"
else
    echo "⚠️  prisma/seed-admin.js not found"
    echo "   Create this file first, then run: node prisma/seed-admin.js"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Review IMPLEMENTATION_GUIDE.md for detailed instructions"
echo "2. Create the required files (auth routes, pages, components)"
echo "3. Test the authentication flow"
echo ""
echo "🔐 Admin Credentials:"
echo "   Email: admin@senakids.com"
echo "   Password: SenaKids2024!Secure"
echo "   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!"
echo ""
echo "🚀 Start dev server with: npm run dev"
echo "=================================="
