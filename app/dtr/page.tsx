import { auth } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { getUserOrganizations } from '@/lib/organizations';
import { redirect } from 'next/navigation';
import { DTRContent } from '@/components/dtr/dtr-content';
import { 
  getActiveTimeEntry, 
  getTodayTimeEntries, 
  isUserClockedIn,
  type TimeEntryWithDuration 
} from '@/lib/time-entries';

async function getDTRData(userId: string, orgId: string) {
  const [activeEntry, todayEntries, isClockedIn] = await Promise.all([
    getActiveTimeEntry(userId, orgId),
    getTodayTimeEntries(userId, orgId),
    isUserClockedIn(userId, orgId)
  ]);

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