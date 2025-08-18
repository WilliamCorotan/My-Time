"use client";
import { useOrganizationContext } from '@/lib/contexts/organization-context';

export function useCurrentOrganizationId() {
  const { currentOrganization } = useOrganizationContext();
  return currentOrganization?.id;
}
