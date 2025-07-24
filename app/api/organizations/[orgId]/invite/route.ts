import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { 
  isUserAdmin,
  getOrganizationById
} from '@/lib/organizations';
import { createInvitation } from '@/lib/invitations';
import { sendInvitationEmail } from '@/lib/email';
import { getUserDisplayName } from '@/lib/user-utils';

type Params = Promise<{ orgId: string }>;

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user is admin of the organization
    const isAdmin = await isUserAdmin(userId, orgId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get organization details
    const organization = await getOrganizationById(orgId);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get inviter details
    const clerk = await clerkClient();
    const inviter = await clerk.users.getUser(userId);
    const inviterName = getUserDisplayName(inviter);

    // Create invitation
    const invitation = await createInvitation({
      email: email.trim(),
      orgId,
      inviterId: userId,
    });

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${invitation.id}`;

    // Send invitation email
    await sendInvitationEmail({
      to: email.trim(),
      organizationName: organization.name,
      inviterName,
      inviteUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      }
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 