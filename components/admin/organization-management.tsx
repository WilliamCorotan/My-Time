"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOrganization } from '@/lib/hooks/use-organization';
import { Users, Plus, Settings, UserMinus, Shield, UserCheck, Loader2, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type Member = {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
};

export function OrganizationManagement() {
  const { organization, membership } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const isAdmin = membership?.role === 'admin';
  const orgId = organization?.id;

  useEffect(() => {
    if (isAdmin && orgId) {
      fetchMembers();
    }
  }, [isAdmin, orgId]);

  const fetchMembers = async () => {
    if (!orgId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }
      
      const membersData = await response.json();
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create',
          name: createForm.name,
          description: createForm.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create organization: ${response.status}`);
      }

      setCreateForm({ name: '', description: '' });
      setShowCreateForm(false);
      toast.success("Organization created successfully!", {
        description: `${createForm.name} has been created and you are now an admin.`
      });
      // The useOrganization hook will automatically refresh
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
      toast.error("Failed to create organization", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!orgId || !confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'remove_member',
          targetUserId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove member: ${response.status}`);
      }

      await fetchMembers();
      toast.success("Member removed successfully!", {
        description: "The member has been removed from the organization."
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      toast.error("Failed to remove member", {
        description: errorMessage
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'member') => {
    if (!orgId) return;

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetUserId: userId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status}`);
      }

      await fetchMembers();
      toast.success("Role updated successfully!", {
        description: `User role has been changed to ${newRole}.`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
      setError(errorMessage);
      toast.error("Failed to update role", {
        description: errorMessage
      });
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      const response = await fetch(`/api/organizations/${orgId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to send invitation: ${response.status}`);
      }

      setInviteEmail('');
      setShowInviteForm(false);
      toast.success("Invitation sent successfully!", {
        description: `An invitation has been sent to ${inviteEmail.trim()}.`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(errorMessage);
      toast.error("Failed to send invitation", {
        description: errorMessage
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You&apos;re not part of any organization yet.</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="mb-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
            
            {showCreateForm && (
              <form onSubmit={handleCreateOrganization} className="max-w-md mx-auto space-y-4">
                <Input
                  placeholder="Organization Name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {organization.name}
            </div>
            {organization.description && (
              <div>
                <span className="font-medium">Description:</span> {organization.description}
              </div>
            )}
            <div>
              <span className="font-medium">Your Role:</span>{' '}
              <Badge variant={membership?.role === 'admin' ? 'default' : 'secondary'}>
                {membership?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowInviteForm(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {showInviteForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">Invite New Member</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={handleSendInvitation} className="space-y-3">
                  <div>
                    <label htmlFor="invite-email" className="block text-sm font-medium text-blue-900 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={inviteLoading}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {inviteLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      <div className="text-xs text-gray-500">
                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <div className="flex gap-1">
                        {member.role === 'member' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(member.userId, 'admin')}
                            title="Make Admin"
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(member.userId, 'member')}
                            title="Remove Admin"
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600 hover:text-red-700"
                          title="Remove Member"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {members.length === 0 && (
                  <div className="text-center py-4 text-gray-600">
                    No members found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}