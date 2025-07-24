import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getUserOrganization, 
  getOrganizationMembers,
  removeUserFromOrganization,
  updateUserRole,
  isUserAdmin
} from '@/lib/organizations';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orgId = params.orgId;
    const organization = await getUserOrganization(userId, orgId);
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orgId = params.orgId;
    const body = await req.json();
    const { targetUserId, action } = body;

    if (action === 'remove_member') {
      const isAdmin = await isUserAdmin(userId, orgId);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      await removeUserFromOrganization(targetUserId, orgId);
      return NextResponse.json({ success: true });
    }

    if (action === 'leave') {
      await removeUserFromOrganization(userId, orgId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling organization request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orgId = params.orgId;
    const body = await req.json();
    const { targetUserId, role } = body;

    const isAdmin = await isUserAdmin(userId, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await updateUserRole(targetUserId, orgId, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}