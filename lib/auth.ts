import { auth as clerkAuth } from '@clerk/nextjs/server';
import { getUserOrganizations } from '@/lib/organizations';
import { cookies } from 'next/headers';

export async function auth() {
  const { userId } = await clerkAuth();
  
  if (!userId) {
    return { userId: null, orgId: null, orgRole: null };
  }

  // Get selected organization from cookie or use default
  const cookieStore = await cookies();
  const selectedOrgId = cookieStore.get('selected-org-id')?.value;
  
  const userOrgs = await getUserOrganizations(userId);
  
  let currentOrg;
  if (selectedOrgId) {
    currentOrg = userOrgs.find(org => org.id === selectedOrgId);
  }
  
  // If no selected org or invalid org, use first available
  if (!currentOrg && userOrgs.length > 0) {
    currentOrg = userOrgs[0];
  }

  return {
    userId,
    orgId: currentOrg?.id || null,
    orgRole: currentOrg?.role || null,
  };
}