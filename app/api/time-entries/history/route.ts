import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTimeEntriesForRange } from '@/lib/time-entries';

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 90);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  try {
    const entries = await getTimeEntriesForRange(userId, orgId, startStr, endStr);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching time entry history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
