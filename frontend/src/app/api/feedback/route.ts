import { NextRequest, NextResponse } from 'next/server';
import { serverAPI, APIError } from '@/lib/apiClient';

// Helper to extract auth token from request
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const data = await serverAPI.feedback.create(body, token);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Feedback API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const data = await serverAPI.feedback.getAll(token);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Feedback API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
