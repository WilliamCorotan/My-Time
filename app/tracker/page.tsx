import { auth } from '@/lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import { getUserOrganizations } from '@/lib/organizations';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrackerClient } from '@/components/tracker/tracker-client';
import { BarChart3, Calendar, Clock, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getUserDisplayName } from '@/lib/user-utils';
import { getTimeEntriesForRange } from '@/lib/time-entries';
import { calculateTotalDuration, formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

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

function formatTime(dateTimeString: string) {
  return new Date(dateTimeString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getStatusBadge(entry: TimeEntryWithDuration) {
  if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
  return <Badge variant="secondary">Complete</Badge>;
}

function calculateStats(records: TimeEntryWithDuration[]) {
  const totalMinutes = calculateTotalDuration(records.filter(r => r.duration !== undefined));
  const totalHours = formatDuration(totalMinutes);
  const completedDays = new Set(records.filter(r => r.duration !== undefined).map(r => r.date)).size;
  const averageDaily = completedDays > 0 ? (totalMinutes / 60 / completedDays).toFixed(1) + 'h' : '0h';

  return {
    totalHours,
    completedDays,
    averageDaily
  };
}

// Group entries by date for display
function groupEntriesByDate(entries: TimeEntryWithDuration[]) {
  const grouped = new Map<string, TimeEntryWithDuration[]>();
  
  entries.forEach(entry => {
    if (!grouped.has(entry.date)) {
      grouped.set(entry.date, []);
    }
    grouped.get(entry.date)!.push(entry);
  });

  // Convert to array and sort by date (newest first)
  return Array.from(grouped.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime()),
      totalMinutes: calculateTotalDuration(entries)
    }));
}

export default async function TrackerPage() {
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

  // Fetch time entries for the past 7 days
  const records = await getTimeEntriesForRange(userId, orgId, getPast7DaysDate(), getTodayDate());
  
  const stats = calculateStats(records);
  const groupedRecords = groupEntriesByDate(records);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Time Tracker</h1>
          <p className="text-muted-foreground">View and analyze your time records over the past 7 days.</p>
        </div>
        <TrackerClient records={records} userName={getUserDisplayName(user)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Worked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDays}</div>
            <p className="text-xs text-muted-foreground">Complete days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDaily}</div>
            <p className="text-xs text-muted-foreground">Hours per day</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Time Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groupedRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No time records found</p>
              <p className="text-sm">Start tracking your time to see records here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedRecords.map(({ date, entries, totalMinutes }) => (
                <div key={date} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-foreground">
                      {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-medium text-primary">
                        {formatDuration(totalMinutes)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-foreground">Session {index + 1}</span>
                            {getStatusBadge(entry)}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(entry.timeIn)} - {entry.timeOut ? formatTime(entry.timeOut) : 'In Progress'}
                            </span>
                            {entry.duration && (
                              <span className="font-medium text-primary">
                                {formatDuration(entry.duration)}
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2 p-2 bg-card rounded border-l-2 border-primary/20">
                              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{entry.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}