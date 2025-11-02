#!/bin/bash

# Gemini AI Deployment Script
# This script sets up the Gemini API key and deploys the Edge Function

set -e  # Exit on error

echo "🤖 Gemini AI Deployment Script"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Not in a Supabase project directory${NC}"
    echo "Run 'supabase init' first"
    exit 1
fi

echo -e "${GREEN}✅ Supabase project detected${NC}"
echo ""

# Set the Gemini API key
echo "🔑 Setting Gemini API Key..."
GEMINI_KEY="AIzaSyAB-VKzw__bvX-WJykGceJjJ9ebkXoWAwo"

supabase secrets set GEMINI_API_KEY=$GEMINI_KEY

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Gemini API key set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set API key${NC}"
    exit 1
fi

echo ""

# Deploy the Edge Function
echo "🚀 Deploying Edge Function..."
supabase functions deploy make-server-f573a585

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Edge Function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy Edge Function${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Your app now has:"
echo "  ✨ Smart natural language search"
echo "  📸 AI-powered receipt scanning"
echo ""
echo "Next steps:"
echo "  1. Test the search with: 'coffee expenses'"
echo "  2. Try scanning a receipt"
echo "  3. Monitor usage in Google Cloud Console"
echo ""
echo "⚠️  Remember to:"
echo "  - Set up billing alerts"
echo "  - Monitor API usage"
echo "  - Keep your API key secret"
echo ""
