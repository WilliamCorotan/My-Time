import { auth } from '@/lib/auth';
import { currentUser, User } from '@clerk/nextjs/server';
import { getUserOrganizations, getOrganizationMembers, getOrganizationById } from '@/lib/organizations';
import { getUserDisplayName, getUserEmail, getUserImageUrl } from '@/lib/user-utils';
import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, Shield } from 'lucide-react';
import { OrganizationManagement } from '@/components/admin/organization-management';
import { AdminClient } from '@/components/admin/admin-client';
import { getTimeEntriesForRange } from '@/lib/time-entries';
import { formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

// Local type for records with user names
type TimeEntryWithUserName = TimeEntryWithDuration & {
  userName: string;
};

function getPast7DaysDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getAdminData(orgId: string) {
  // Get organization members
  const members = await getOrganizationMembers(orgId);
  const userIds = members.map(m => m.userId);
  
  // Fetch user details from Clerk
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ userId: userIds });
  const userMap = new Map(users.data.map((u: User) => [u.id, u]));
  
  const membersWithDetails = members.map(m => {
    const user = userMap.get(m.userId);
    return {
      userId: m.userId,
      name: getUserDisplayName(user as User),
      email: getUserEmail(user as User),
      role: m.role,
      joinedAt: m.joinedAt,
      imageUrl: getUserImageUrl(user as User),
    };
  });

  // Get time entries for the past 7 days
  const allRecords: TimeEntryWithDuration[] = [];
  for (const member of members) {
    const records = await getTimeEntriesForRange(member.userId, orgId, getPast7DaysDate(), getTodayDate());
    allRecords.push(...records);
  }

  // Add user names to records
  const recordsWithNames: TimeEntryWithUserName[] = allRecords.map(r => ({
    ...r,
    userName: userMap.get(r.userId) ? getUserDisplayName(userMap.get(r.userId) as User) : r.userId
  }));

  return {
    members: membersWithDetails,
    records: recordsWithNames
  };
}

function calculateStats(records: TimeEntryWithUserName[], members: { userId: string; role: string; joinedAt: string }[]) {
  const totalHours = records.reduce((acc, r) => {
    return acc + (r.duration || 0);
  }, 0);

  return {
    totalMembers: members.length,
    totalRecords: records.length,
    totalHours: formatDuration(totalHours)
  };
}

function formatTime(dateTimeString: string) {
  return new Date(dateTimeString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Group records by user and date
function groupRecordsByUser(records: TimeEntryWithUserName[]) {
  const grouped = new Map<string, Map<string, TimeEntryWithDuration[]>>();
  
  records.forEach(record => {
    if (!grouped.has(record.userId)) {
      grouped.set(record.userId, new Map());
    }
    const userRecords = grouped.get(record.userId)!;
    if (!userRecords.has(record.date)) {
      userRecords.set(record.date, []);
    }
    userRecords.get(record.date)!.push(record);
  });

  return Array.from(grouped.entries()).map(([userId, dateMap]) => ({
    userId,
    userName: records.find(r => r.userId === userId)?.userName || userId,
    dates: Array.from(dateMap.entries()).map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime()),
      totalMinutes: entries.reduce((sum, e) => sum + (e.duration || 0), 0)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }));
}

export default async function AdminPage() {
  const user = await currentUser();
  const { userId, orgId, orgRole } = await auth();

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

  // Check if user is admin
  if (orgRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Get organization details
  const organization = await getOrganizationById(orgId);
  
  // Fetch admin data server-side
  const { members, records } = await getAdminData(orgId);
  const stats = calculateStats(records, members);
  const groupedRecords = groupRecordsByUser(records);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-gray-600">Manage your organization and monitor team activity.</p>
        </div>
        <AdminClient records={records} orgId={orgId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{organization?.name}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="records">Time Records</TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No members found</p>
                  </div>
                ) : (
                  members.map((m) => (
                    <div key={m.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-sm text-gray-600">{m.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={m.role === 'admin' ? 'default' : 'secondary'}>
                          {m.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Time Records (Past 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {groupedRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No time records found</p>
                  </div>
                ) : (
                  groupedRecords.map(({ userId, userName, dates }) => (
                    <div key={userId} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-4">{userName}</h3>
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}