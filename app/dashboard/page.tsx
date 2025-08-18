import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { OrganizationSwitcher } from '@/components/ui/organization-switcher';
import { getUserOrganizations } from '@/lib/organizations';
import { getUserDisplayName } from '@/lib/user-utils';
import { getActiveTimeEntry, getTimeEntriesForRange, isUserClockedIn } from '@/lib/time-entries';
import { calculateTotalDuration, formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

async function getDashboardData(userId: string, orgId: string) {
  const today = getTodayDate();
  const past7Days = getPast7DaysDate();
  
  // Get today's entries and recent records
  const todayEntries = await getTimeEntriesForRange(userId, orgId, today, today);
  const recentRecords = await getTimeEntriesForRange(userId, orgId, past7Days, today);
  
  // Find active entry (entry without timeOut)
  const activeEntry = await getActiveTimeEntry(userId, orgId);
  const isClockedIn = await isUserClockedIn(userId, orgId);
  
  return {
    activeEntry,
    todayEntries,
    isClockedIn,
    recentRecords
  };
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPast7DaysDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStats(
  todayEntries: TimeEntryWithDuration[], 
  activeEntry: TimeEntryWithDuration | null, 
  isClockedIn: boolean,
  records: TimeEntryWithDuration[]
) {
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date();
  thisMonth.setDate(1);

  // Calculate today's hours from dtrData (includes cross-midnight entries)
  let todayMinutes = 0;
  if (todayEntries) {
    todayMinutes = calculateTotalDuration(todayEntries);
    
    // Add current session time if clocked in (works for cross-midnight too)
    if (activeEntry && isClockedIn) {
      const now = new Date().getTime();
      const start = new Date(activeEntry.timeIn).getTime();
      todayMinutes += Math.round((now - start) / (1000 * 60));
    }
  }
  
  const todayHours = formatDuration(todayMinutes);

  // Calculate week and month hours from records
  const weekRecords = records.filter(r => new Date(r.date) >= thisWeek);
  const monthRecords = records.filter(r => new Date(r.date) >= thisMonth);

  const weekMinutes = calculateTotalDuration(weekRecords);
  const monthMinutes = calculateTotalDuration(monthRecords);

  return {
    todayHours,
    weekHours: formatDuration(weekMinutes),
    monthHours: formatDuration(monthMinutes),
    totalDays: records.filter(r => r.duration && r.duration > 0).length,
  };
}

export default async function DashboardPage() {
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

  // Fetch all dashboard data server-side
  const { activeEntry, todayEntries, isClockedIn, recentRecords } = await getDashboardData(userId, orgId);
  
  // Calculate stats server-side
  const stats = calculateStats(todayEntries, activeEntry as TimeEntryWithDuration, isClockedIn, recentRecords);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {getUserDisplayName(user)}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your time tracking overview for today.
          </p>
        </div>
        <OrganizationSwitcher variant="compact" />
      </div>

      <StatsCards stats={stats} />

      <DashboardClient
        initialActiveEntry={activeEntry as TimeEntryWithDuration}
        initialTodayEntries={todayEntries}
        initialIsClockedIn={isClockedIn}
      />
      
      <RecentActivity records={recentRecords.map(r => ({
        date: r.date,
        timeIn: r.timeIn,
        timeOut: r.timeOut || undefined,
        duration: r.duration,
        message: r.note || undefined
      }))} />
    </div>
  );
}