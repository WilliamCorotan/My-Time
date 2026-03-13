import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createChangeRequest, getChangeRequestsForUser } from '@/lib/time-change-requests';

// GET - List user's own change requests
export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requests = await getChangeRequestsForUser(userId, orgId);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

// POST - Create a new change request
export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { timeEntryId, requestedTimeIn, requestedTimeOut, requestedNote, reason } = body;

    if (!timeEntryId || typeof timeEntryId !== 'number') {
      return NextResponse.json({ error: 'Valid timeEntryId is required' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (reason.trim().length > 500) {
      return NextResponse.json({ error: 'Reason must be 500 characters or less' }, { status: 400 });
    }

    const request = await createChangeRequest(userId, orgId, timeEntryId, {
      requestedTimeIn: requestedTimeIn || undefined,
      requestedTimeOut: requestedTimeOut || undefined,
      requestedNote: requestedNote || undefined,
      reason: reason.trim(),
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create change request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
