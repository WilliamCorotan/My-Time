import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingRequestsForOrg } from '@/lib/time-change-requests';

// GET - List all change requests for the org (admin only)
export async function GET() {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (orgRole !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const requests = await getPendingRequestsForOrg(orgId);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}
