import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getInvitation } from '@/lib/invitations';
import { getOrganizationById } from '@/lib/organizations';
import { InvitePage } from '@/components/invite/invite-page';

export default async function InvitePageServer({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    // Redirect to sign in if not authenticated
    redirect('/sign-in');
  }

  try {
    const { invitationId } = await params;
    const invitation = await getInvitation(invitationId);
    
    if (!invitation) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
            <p className="text-gray-600">This invitation link is invalid or has expired.</p>
          </div>
        </div>
      );
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    const isExpired = now > expiresAt;

    if (isExpired || invitation.status !== 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Expired</h1>
            <p className="text-gray-600">
              {invitation.status === 'accepted' 
                ? 'This invitation has already been accepted.' 
                : 'This invitation has expired and is no longer valid.'
              }
            </p>
          </div>
        </div>
      );
    }

    // Get organization details
    const organization = await getOrganizationById(invitation.orgId);
    if (!organization) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
            <p className="text-gray-600">The organization associated with this invitation no longer exists.</p>
          </div>
        </div>
      );
    }

    return (
      <InvitePage 
        invitation={invitation}
        organization={organization}
      />
    );
  } catch (error) {
    console.error('Error loading invitation:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">An error occurred while loading the invitation.</p>
        </div>
      </div>
    );
  }
} 