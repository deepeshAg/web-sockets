import { NextRequest, NextResponse } from 'next/server';

// Your EC2 backend URL
const BACKEND_URL = 'http://65.2.178.151:8001';

// Helper function to proxy requests
async function proxyRequest(request: NextRequest, path: string) {
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}${path}${url.search}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Forward relevant headers
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const options: RequestInit = {
    method: request.method,
    headers,
  };

  // Add body for POST/PUT requests
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    try {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    } catch (error) {
      console.error('Error reading request body:', error);
    }
  }

  try {
    const response = await fetch(backendUrl, options);
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}

// Polls routes
export async function GET(request: NextRequest) {
  return proxyRequest(request, '/polls');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, '/polls');
}
