"use client";
import { useState } from 'react';
import { useOrganization } from '@/lib/hooks/use-organization';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, Building2, Plus, Check } from 'lucide-react';

export function OrganizationSelector() {
  const { 
    organization, 
    organizations, 
    switchOrganization, 
    createOrganization,
    loading 
  } = useOrganization();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      await createOrganization(createForm.name, createForm.description);
      setCreateForm({ name: '', description: '' });
      setShowCreateForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handleSwitchOrganization = (orgId: string) => {
    switchOrganization(orgId);
    // Set cookie for server-side persistence
    document.cookie = `selected-org-id=${orgId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-2 border-b border-sidebar-border">
      <Button
        variant="ghost"
        className="w-full justify-between p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <div className="text-left min-w-0">
            <div className="font-medium truncate">
              {organization?.name || 'Select Organization'}
            </div>
            {organization && (
              <div className="text-xs text-sidebar-foreground/60">
                <Badge variant={organization.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {organization.role}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 z-50 mt-1">
          <Card className="shadow-lg border-border">
            <CardContent className="p-2">
              <div className="space-y-1">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSwitchOrganization(org.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {organization?.id === org.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <div className="text-left">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">
                            <Badge variant={org.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                              {org.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
                
                <hr className="my-1 border-border" />
                
                {!showCreateForm ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                ) : (
                  <form onSubmit={handleCreateOrganization} className="p-2 space-y-2">
                    <Input
                      placeholder="Organization Name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm"
                      required
                    />
                    <div className="flex gap-1">
                      <Button type="submit" size="sm" className="flex-1">
                        Create
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateForm({ name: '', description: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}