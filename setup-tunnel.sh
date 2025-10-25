#!/bin/bash

# Quick HTTPS Tunnel Setup

echo "🚀 Setting up HTTPS tunnel for FastAPI backend..."

# Option 1: Using ngrok (requires account)
echo "📦 Installing ngrok..."
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

echo "🔑 To use ngrok:"
echo "1. Sign up at https://ngrok.com"
echo "2. Get your auth token"
echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
echo "4. Run: ngrok http 8001"
echo "5. Use the HTTPS URL provided by ngrok"
echo ""

# Option 2: Using Cloudflare Tunnel (free)
echo "📦 Installing cloudflared..."
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

echo "🌐 To use Cloudflare Tunnel:"
echo "1. Run: cloudflared tunnel create my-tunnel"
echo "2. Run: cloudflared tunnel route dns my-tunnel your-domain.com"
echo "3. Run: cloudflared tunnel run my-tunnel --url http://localhost:8001"
echo "4. Use the HTTPS URL provided by Cloudflare"
