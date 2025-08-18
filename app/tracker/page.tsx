import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/ui/organization-switcher';
import { calculateTotalDuration, formatDuration } from '@/lib/time-entries-format';
import { formatTime } from '@/lib/time-format';
import { db } from '@/lib/db/config';
import { timeEntries } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

function getStatusBadge(entry: TimeEntryWithDuration) {
  if (!entry.timeIn) return <Badge variant="secondary">No Entry</Badge>;
  if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
  return <Badge variant="default">Complete</Badge>;
}

export default async function TrackerPage() {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    redirect('/sign-in');
  }

  // Fetch all time entries for the user in the organization
  const entries = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.userId, userId), eq(timeEntries.orgId, orgId)))
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

  // Get user info for display
  const userName = "User"; // You might want to fetch this from your user service

  if (records.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
              <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Time Tracker</h1>
          <p className="text-muted-foreground">View and export your time tracking records</p>
        </div>
        <OrganizationSwitcher variant="compact" />
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No time records found</p>
              <p className="text-sm">Start tracking your time to see records here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group records by date
  const groupedRecords = records.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, TimeEntryWithDuration[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Time Tracker</h1>
          <p className="text-muted-foreground">View and export your time tracking records</p>
        </div>
        <OrganizationSwitcher variant="compact" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedDates.map(date => {
              const entries = groupedRecords[date].sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime());
              const totalMinutes = calculateTotalDuration(entries);
              
              return (
                <div key={date} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {new Date(date).toLocaleDateString([], { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                      <div className="text-lg font-bold text-primary">
                        {formatDuration(totalMinutes)}
                      </div>
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
                              <span className="text-xs">💬</span>
                              <span>{entry.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}