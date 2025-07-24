import { auth } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { getUserOrganizations } from '@/lib/organizations';
import { redirect } from 'next/navigation';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { getUserDisplayName } from '@/lib/user-utils';
import { 
  getActiveTimeEntry, 
  getTodayTimeEntries, 
  isUserClockedIn,
  getTimeEntriesForRange
} from '@/lib/time-entries';
import { calculateTotalDuration, formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

async function getDashboardData(userId: string, orgId: string) {
  const [activeEntry, todayEntries, isClockedIn, recentRecords] = await Promise.all([
    getActiveTimeEntry(userId, orgId),
    getTodayTimeEntries(userId, orgId),
    isUserClockedIn(userId, orgId),
    getTimeEntriesForRange(userId, orgId, getPast7DaysDate(), getTodayDate())
  ]);

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
  const stats = calculateStats(todayEntries, activeEntry, isClockedIn, recentRecords);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {getUserDisplayName(user)}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your time tracking overview for today.
        </p>
      </div>

      <StatsCards stats={stats} />

      <DashboardClient
        initialActiveEntry={activeEntry}
        initialTodayEntries={todayEntries}
        initialIsClockedIn={isClockedIn}
      />
      
      <RecentActivity records={recentRecords.map(r => ({
        date: r.date,
        timeIn: r.timeIn ? new Date(r.timeIn).toLocaleTimeString('en-GB', { hour12: false }) : undefined,
        timeOut: r.timeOut ? new Date(r.timeOut).toLocaleTimeString('en-GB', { hour12: false }) : undefined,
        message: r.note || undefined
      }))} />
    </div>
  );
}