"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { formatDuration } from '@/lib/time-entries-format';
import { formatTime } from '@/lib/time-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type AdminClientProps = {
  records: Array<{
    userId: string;
    userName: string;
    dates: Array<{
      date: string;
      entries: TimeEntryWithDuration[];
      totalMinutes: number;
    }>;
  }>;
};

export function AdminClient({ records }: AdminClientProps) {
  const getStatusBadge = (entry: TimeEntryWithDuration) => {
    if (!entry.timeIn) return <Badge variant="secondary">No Entry</Badge>;
    if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="default">Complete</Badge>;
  };

  if (records.length === 0) {
    return (
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
            <p className="text-sm">No users have tracked time yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {records.map(({ userId, userName, dates }) => (
        <Card key={userId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {userName}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}