"use client";
import { useUser } from '@clerk/nextjs';
import { useOrganization } from '@/lib/hooks/use-organization';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getClientUserDisplayName } from '@/lib/user-utils';

export default function WelcomePage() {
  const { user } = useUser();
  const { createOrganization, loading } = useOrganization();
  const router = useRouter();
  
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    setIsCreating(true);
    try {
      await createOrganization(createForm.name, createForm.description);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to DTR System, {getClientUserDisplayName(user)}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get started by creating or joining an organization to begin tracking time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Create Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">
                Start fresh by creating a new organization for your team.
              </p>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
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
                  rows={3}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isCreating || !createForm.name.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Organization'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5" />
                Join Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Have an invitation? Contact your administrator to get access to an existing organization.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  Your administrator will need to add you to their organization using your email: 
                  <br />
                  <span className="font-medium text-gray-700">{user?.primaryEmailAddress?.emailAddress}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact your system administrator or check our documentation.
          </p>
        </div>
      </div>
    </div>
  );
}