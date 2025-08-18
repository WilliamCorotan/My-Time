import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, BarChart3 } from 'lucide-react';
import { formatDuration } from '@/lib/time-entries-format';
import { formatTime } from '@/lib/time-format';
import { db } from '@/lib/db/config';
import { timeEntries, userOrganizations } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { OrganizationManagement } from '@/components/admin/organization-management';
import { DtrExport } from '@/components/admin/dtr-export';
import { clerkClient } from '@clerk/nextjs/server';
import { getUserDisplayName } from '@/lib/user-utils';
import { OrganizationSwitcher } from '@/components/ui/organization-switcher';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';
import type { User } from '@clerk/nextjs/server';

function getStatusBadge(entry: TimeEntryWithDuration) {
  if (!entry.timeIn) return <Badge variant="secondary">No Entry</Badge>;
  if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
  return <Badge variant="default">Complete</Badge>;
}

export default async function AdminPage() {
  const { userId, orgId } = await auth();
  
  console.log('userId', userId);
  console.log('orgId', orgId);

  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Fetch all time entries for the organization
  const entries = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.orgId, orgId))
    .orderBy(desc(timeEntries.date), desc(timeEntries.timeIn));

  // Transform entries to include duration and isActive
  const records: TimeEntryWithDuration[] = entries.map((entry) => {
    let duration: number | undefined;
    let isActive = false;

    if (entry.timeOut) {
      const start = new Date(entry.timeIn).getTime();
      const end = new Date(entry.timeOut).getTime();
      duration = Math.max(0, Math.round((end - start) / 60000));
    } else {
      isActive = true;
    }

    return {
      ...entry,
      duration,
      isActive
    };
  });

  // Get unique user IDs from records
  const userIds = Array.from(new Set(records.map(record => record.userId)));

  // Fetch user details from Clerk
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ userId: userIds });
  const userMap = new Map(users.data.map((user: User) => [user.id, user]));

  // Fetch organization members and their roles
  const orgMembers = await db
    .select()
    .from(userOrganizations)
    .where(eq(userOrganizations.orgId, orgId));

  const memberRoleMap = new Map(orgMembers.map(member => [member.userId, member.role]));

  // Group records by user and date
  const groupedByUser = records.reduce((groups, record) => {
    const user = userMap.get(record.userId);
    const userName = user ? getUserDisplayName(user) : record.userId;
    
    if (!groups[record.userId]) {
      groups[record.userId] = {
        userId: record.userId,
        userName: userName,
        dates: {}
      };
    }
    
    if (!groups[record.userId].dates[record.date]) {
      groups[record.userId].dates[record.date] = {
        date: record.date,
        entries: [],
        totalMinutes: 0
      };
    }
    
    groups[record.userId].dates[record.date].entries.push(record);
    if (record.duration) {
      groups[record.userId].dates[record.date].totalMinutes += record.duration;
    }
    
    return groups;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    dates: Record<string, {
      date: string;
      entries: TimeEntryWithDuration[];
      totalMinutes: number;
    }>;
  }>);

  // Convert to array format expected by AdminClient
  const groupedRecords = Object.values(groupedByUser).map(user => ({
    userId: user.userId,
    userName: user.userName,
    dates: Object.values(user.dates).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization and view team time records</p>
        </div>
        <OrganizationSwitcher variant="compact" />
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="time-records">Time Records</TabsTrigger>
          <TabsTrigger value="export-dtr">Export DTR</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="export-dtr" className="space-y-6">
          <DtrExport orgId={orgId} members={Object.values(groupedByUser).map(user => {
            const userData = userMap.get(user.userId);
            const role = memberRoleMap.get(user.userId) || 'member';
            return {
              userId: user.userId,
              name: user.userName,
              email: userData?.emailAddresses?.[0]?.emailAddress || user.userName,
              role: role
            };
          })} />
        </TabsContent>

        <TabsContent value="time-records" className="space-y-6">
          {groupedRecords.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Time Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>No team time records found</p>
                  <p className="text-sm">Team members need to start tracking time to see records here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Time Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {groupedRecords.map(({ userId, userName, dates }) => (
                    <div key={userId} className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">{userName}</h3>
                      <div className="space-y-4">
                        {dates.map(({ date, entries, totalMinutes }) => (
                          <div key={date} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium">
                                {new Date(date).toLocaleDateString([], { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {formatDuration(totalMinutes)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {entries.map((entry, index) => (
                                <div key={entry.id} className="flex items-center justify-between text-sm">
                                  <span>Session {index + 1}</span>
                                  <span className="text-gray-600">
                                    {formatTime(entry.timeIn)} - {entry.timeOut ? formatTime(entry.timeOut) : 'In Progress'}
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {entry.duration ? formatDuration(entry.duration) : 'Active'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}