"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Invitation } from '@/lib/invitations';
import type { Organization } from '@/lib/organizations';

type InvitePageProps = {
  invitation: Invitation;
  organization: Organization;
};

export function InvitePage({ invitation, organization }: InvitePageProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAcceptInvitation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invite/${invitation.id}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invitation');
      }

      toast.success('Invitation accepted successfully!', {
        description: `You are now a member of ${organization.name}.`,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
      toast.error('Failed to accept invitation', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryDate = (expiresAt: string) => {
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You&apos;re Invited!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            You&apos;ve been invited to join an organization on DTR
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Organization Details */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {organization.name}
              </h3>
              {organization.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {organization.description}
                </p>
              )}
            </div>
          </div>

          {/* Invitation Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Invited to:</span>
              <Badge variant="secondary">{invitation.email}</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Expires:</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900">
                  {formatExpiryDate(invitation.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What you&apos;ll get:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Time tracking and project management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Team collaboration tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Real-time activity monitoring
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleAcceptInvitation}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept Invitation
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By accepting this invitation, you&apos;ll be added as a member of this organization.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 