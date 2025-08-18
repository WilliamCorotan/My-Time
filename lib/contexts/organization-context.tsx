"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { OrganizationWithRole } from '@/lib/organizations';

type OrganizationContextType = {
  currentOrganization: OrganizationWithRole | null;
  organizations: OrganizationWithRole[];
  loading: boolean;
  switching: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, description?: string) => Promise<OrganizationWithRole>;
  joinOrganization: (orgId: string) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

type OrganizationProviderProps = {
  children: React.ReactNode;
};

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved organization preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrgId = localStorage.getItem('selected-org-id');
      if (savedOrgId && organizations.length > 0) {
        const org = organizations.find(o => o.id === savedOrgId);
        if (org) {
          setCurrentOrganization(org);
        }
      }
    }
  }, [organizations]);

  // Fetch organizations when user changes
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setOrganizations([]);
      setCurrentOrganization(null);
      return;
    }

    fetchOrganizations();
  }, [user?.id]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/organizations', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      
      const orgs = await response.json();
      setOrganizations(orgs);
      
      // Set current organization if none is selected
      if (!currentOrganization && orgs.length > 0) {
        const savedOrgId = localStorage.getItem('selected-org-id');
        const org = savedOrgId 
          ? orgs.find((o: OrganizationWithRole) => o.id === savedOrgId)
          : orgs[0];
        
        if (org) {
          setCurrentOrganization(org);
          localStorage.setItem('selected-org-id', org.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setSwitching(true);
      setCurrentOrganization(org);
      localStorage.setItem('selected-org-id', orgId);
      
      // Also set cookie for server-side access
      document.cookie = `selected-org-id=${orgId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      
      // Refresh the page to ensure all server-side data is updated
      window.location.reload();
    }
  };

  const createOrganization = async (name: string, description?: string): Promise<OrganizationWithRole> => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create',
          name,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create organization: ${response.status}`);
      }

      const newOrg = await response.json();
      const orgWithRole = { ...newOrg, role: 'admin' as const };
      
      setOrganizations(prev => [...prev, orgWithRole]);
      setCurrentOrganization(orgWithRole);
      localStorage.setItem('selected-org-id', newOrg.id);
      
      return orgWithRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const joinOrganization = async (orgId: string): Promise<void> => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'join',
          orgId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to join organization: ${response.status}`);
      }

      // Refresh organizations list
      await fetchOrganizations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const leaveOrganization = async (orgId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'leave',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to leave organization: ${response.status}`);
      }

      setOrganizations(prev => prev.filter(org => org.id !== orgId));
      
      if (currentOrganization?.id === orgId) {
        const remainingOrgs = organizations.filter(org => org.id !== orgId);
        if (remainingOrgs.length > 0) {
          const newCurrentOrg = remainingOrgs[0];
          setCurrentOrganization(newCurrentOrg);
          localStorage.setItem('selected-org-id', newCurrentOrg.id);
        } else {
          setCurrentOrganization(null);
          localStorage.removeItem('selected-org-id');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    loading,
    switching,
    error,
    switchOrganization,
    createOrganization,
    joinOrganization,
    leaveOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
}

// Convenience hook for getting just the current organization
export function useCurrentOrganization() {
  const { currentOrganization } = useOrganizationContext();
  return currentOrganization;
}

// Convenience hook for getting all organizations
export function useOrganizations() {
  const { organizations, loading, error } = useOrganizationContext();
  return { organizations, loading, error };
}
