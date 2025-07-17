import { NextRequest, NextResponse } from 'next/server';
import { serverAPI, APIError } from '@/lib/apiClient';

// Helper to extract auth token from request
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await serverAPI.feedback.delete(parseInt(id), token);
    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback API error:', error);
    
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
