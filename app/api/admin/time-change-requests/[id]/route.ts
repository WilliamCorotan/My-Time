import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reviewChangeRequest } from '@/lib/time-change-requests';

// PATCH - Approve or reject a change request (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (orgRole !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const requestId = parseInt(id);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const body = await req.json();
    const { action, reviewNote } = body;

    if (action !== 'approved' && action !== 'rejected') {
      return NextResponse.json({ error: 'Action must be "approved" or "rejected"' }, { status: 400 });
    }

    if (reviewNote && typeof reviewNote === 'string' && reviewNote.length > 500) {
      return NextResponse.json({ error: 'Review note must be 500 characters or less' }, { status: 400 });
    }

    const result = await reviewChangeRequest(requestId, userId, orgId, action, reviewNote);

    return NextResponse.json({ success: true, request: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
