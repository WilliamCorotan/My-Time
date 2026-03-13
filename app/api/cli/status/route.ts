import { NextRequest, NextResponse } from 'next/server';
import { getActiveTimeEntry, getTodayTimeEntries, isUserClockedIn } from '@/lib/time-entries';
import { validateApiToken } from '@/lib/api-tokens';

export async function GET(req: NextRequest) {
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

    const activeEntry = await getActiveTimeEntry(userId, orgId);
    const todayEntries = await getTodayTimeEntries(userId, orgId);
    const isClockedIn = await isUserClockedIn(userId, orgId);

    return NextResponse.json({
      activeEntry,
      todayEntries,
      isClockedIn,
    });
  } catch (error) {
    console.error('Error fetching status via CLI:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
