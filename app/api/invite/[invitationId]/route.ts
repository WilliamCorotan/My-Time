import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getInvitation, acceptInvitation, expireInvitation } from '@/lib/invitations';
import { addUserToOrganization } from '@/lib/organizations';

type Params = Promise<{ invitationId: string }>;

export async function POST(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { invitationId } = await params;

    // Get invitation
    const invitation = await getInvitation(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation has already been used or expired' }, { status: 400 });
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (now > expiresAt) {
      // Mark as expired
      await expireInvitation(invitationId);
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Add user to organization
    await addUserToOrganization(userId, invitation.orgId, 'member');

    // Mark invitation as accepted
    await acceptInvitation(invitationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      organizationId: invitation.orgId,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 