"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { OrganizationWithRole } from '@/lib/organizations';

export function useOrganization(orgId?: string) {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrg, setCurrentOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user organizations
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/organizations', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.status}`);
        }
        
        const orgs = await response.json();
        setOrganizations(orgs);
        
        // Set current organization
        if (orgId) {
          const org = orgs.find((o: OrganizationWithRole) => o.id === orgId);
          setCurrentOrg(org || null);
        } else if (orgs.length > 0) {
          // Default to first organization
          setCurrentOrg(orgs[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user?.id, orgId]);

  const switchOrganization = (newOrgId: string) => {
    const org = organizations.find(o => o.id === newOrgId);
    setCurrentOrg(org || null);
  };

  const createOrganization = async (name: string, description?: string) => {
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
      setCurrentOrg(orgWithRole);
      
      return newOrg;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const joinOrganization = async (orgId: string) => {
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
      const orgsResponse = await fetch('/api/organizations', { credentials: 'include' });
      if (orgsResponse.ok) {
        const orgs = await orgsResponse.json();
        setOrganizations(orgs);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const leaveOrganization = async (orgId: string) => {
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
      if (currentOrg?.id === orgId) {
        setCurrentOrg(organizations.length > 1 ? organizations[0] : null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave organization';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    organization: currentOrg,
    organizations,
    membership: currentOrg ? { role: currentOrg.role } : null,
    loading,
    error,
    switchOrganization,
    createOrganization,
    joinOrganization,
    leaveOrganization,
  };
}