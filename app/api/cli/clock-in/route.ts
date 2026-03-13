import { NextRequest, NextResponse } from 'next/server';
import { clockIn, isUserClockedIn } from '@/lib/time-entries';
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

    // Check if user is already clocked in
    const isClockedIn = await isUserClockedIn(userId, orgId);
    if (isClockedIn) {
      return NextResponse.json({ error: 'You are already clocked in. Please clock out first.' }, { status: 400 });
    }

    const entry = await clockIn(userId, orgId);
    return NextResponse.json({
      success: true,
      entry,
      message: 'Successfully clocked in'
    });
  } catch (error) {
    console.error('Error clocking in via CLI:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clock in' },
      { status: 500 }
    );
  }
}
