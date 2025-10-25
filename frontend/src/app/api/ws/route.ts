import { NextRequest } from 'next/server';

const BACKEND_URL = 'http://65.2.178.151:8001';

export async function GET(request: NextRequest) {
  // This is a placeholder for WebSocket connection
  // WebSocket connections need to be handled differently in Next.js
  
  return new Response(
    JSON.stringify({ 
      message: 'WebSocket proxy not available in API routes',
      suggestion: 'Use direct WebSocket connection or implement Socket.IO'
    }),
    {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
