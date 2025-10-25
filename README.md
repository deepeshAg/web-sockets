# Real-time Polling Application

## Environment Variables

The application uses environment variables for configuration. You can set these in your shell or create a `.env.local` file in the frontend directory.

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

### Backend Configuration

The backend runs on port 8001 by default. You can change this by modifying the `start.sh` script.

## Quick Start

1. Run the startup script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

2. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs
   - WebSocket: ws://localhost:8001/ws

## Features

- ✅ Real-time polling with WebSocket updates
- ✅ Responsive design for web and mobile
- ✅ User authentication with usernames
- ✅ Poll creation, voting, and deletion
- ✅ User-to-user liking system
- ✅ Live voter list updates
- ✅ Stunning Apple-inspired UI/UX

## Development

The application automatically sets environment variables when using the startup script. For custom configurations, you can:

1. Set environment variables in your shell
2. Create a `.env.local` file in the frontend directory
3. Modify the `start.sh` script for different ports