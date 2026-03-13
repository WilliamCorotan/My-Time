import { auth } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { getUserOrganizations } from '@/lib/organizations';
import { redirect } from 'next/navigation';
import { DTRContent } from '@/components/dtr/dtr-content';
import { getTodayTimeEntries } from '@/lib/time-entries';

import type { TimeEntryWithDuration } from '@/lib/time-entries-types'

async function getDTRData(userId: string, orgId: string) {
  const todayEntries = await getTodayTimeEntries(userId, orgId);
  const activeEntry = todayEntries.find(e => !e.timeOut) ?? null;
  const isClockedIn = activeEntry !== null;

  return {
    activeEntry,
    todayEntries,
    isClockedIn
  };
}

export default async function DTRPage() {
  const user = await currentUser();
  const { userId, orgId } = await auth();

  if (!user || !userId) {
    redirect('/sign-in');
  }

  // Get user organizations
  const userOrgs = await getUserOrganizations(userId);
  
  // Redirect to welcome page if user has no organizations
  if (userOrgs.length === 0) {
    redirect('/welcome');
  }

  if (!orgId) {
    redirect('/welcome');
  }

  // Fetch DTR data server-side
  const { activeEntry, todayEntries, isClockedIn } = await getDTRData(userId, orgId);

  return (
    <DTRContent
      initialActiveEntry={activeEntry as TimeEntryWithDuration}
      initialTodayEntries={todayEntries}
      initialIsClockedIn={isClockedIn}
    />
  );
}