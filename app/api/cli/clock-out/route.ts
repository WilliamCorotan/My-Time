import { NextRequest, NextResponse } from 'next/server';
import { clockOut, isUserClockedIn } from '@/lib/time-entries';
import { validateApiToken } from '@/lib/api-tokens';

export async function POST(req: NextRequest) {
  // Get token from Authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    // Validate token and get user info
    const tokenData = await validateApiToken(token);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { userId, orgId } = tokenData;

    const body = await req.json();
    const { note } = body;

    if (!note || note.trim() === '') {
      return NextResponse.json({ error: 'Note is required when clocking out' }, { status: 400 });
    }

    // Check if user is clocked in
    const isClockedIn = await isUserClockedIn(userId, orgId);
    if (!isClockedIn) {
      return NextResponse.json({ error: 'You are not clocked in. Please clock in first.' }, { status: 400 });
    }

    const entry = await clockOut(userId, orgId, note);
    return NextResponse.json({
      success: true,
      entry,
      message: 'Successfully clocked out'
    });
  } catch (error: unknown) {
    console.error('Error clocking out via CLI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to clock out';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
