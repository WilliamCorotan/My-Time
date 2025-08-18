"use client";
import { useEffect, useRef } from 'react';
import { useOrganizationContext } from '@/lib/contexts/organization-context';

export function useOrganizationEffect(callback: () => void | Promise<void>) {
  const { currentOrganization } = useOrganizationContext();
  const prevOrgId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (currentOrganization?.id && prevOrgId.current !== currentOrganization.id) {
      prevOrgId.current = currentOrganization.id;
      callback();
    }
  }, [currentOrganization?.id, callback]);
}
