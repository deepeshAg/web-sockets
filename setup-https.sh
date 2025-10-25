#!/bin/bash

# EC2 HTTPS Setup Script for FastAPI Backend

echo "🔧 Setting up HTTPS for FastAPI backend on EC2..."

# Update system
sudo apt update

# Install nginx
echo "📦 Installing nginx..."
sudo apt install nginx -y

# Install certbot for SSL certificates
echo "🔒 Installing certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ nginx installed and started"
echo ""
echo "📝 Next steps:"
echo "1. Point your domain to this EC2 instance IP"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Update your Vercel environment variables:"
echo "   NEXT_PUBLIC_API_URL=https://your-domain.com"
echo "   NEXT_PUBLIC_WS_URL=wss://your-domain.com"
echo ""
echo "🚀 Your FastAPI backend should run on port 8001"
echo "🌐 nginx will proxy HTTPS requests to your FastAPI app"
