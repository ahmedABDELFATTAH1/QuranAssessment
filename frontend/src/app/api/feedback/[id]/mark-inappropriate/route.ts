import { NextRequest, NextResponse } from 'next/server';
import { serverAPI, APIError } from '@/lib/apiClient';

// Helper to extract auth token from request
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const data = await serverAPI.feedback.markInappropriate(parseInt(params.id), token);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Mark inappropriate API error:', error);
    
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
