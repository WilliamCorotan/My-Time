"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare } from 'lucide-react';
import { formatDuration } from '@/lib/time-entries-format';
import { formatTime } from '@/lib/time-format';
import { useRealtimeData } from '@/lib/hooks/use-realtime-data';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type TodayEntriesData = {
  todayEntries: TimeEntryWithDuration[];
  activeEntry: TimeEntryWithDuration | null;
  isClockedIn: boolean;
};

type RealtimeTodayEntriesProps = {
  initialEntries: TimeEntryWithDuration[];
  initialActiveEntry: TimeEntryWithDuration | null;
  initialIsClockedIn: boolean;
};

export function RealtimeTodayEntries({ 
  initialEntries, 
  initialActiveEntry, 
  initialIsClockedIn 
}: RealtimeTodayEntriesProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live duration calculation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayData = async (): Promise<TodayEntriesData> => {
    const response = await fetch('/dtr/api', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch today\'s entries');
    }
    return response.json();
  };

  const { data, loading, refresh } = useRealtimeData(
    fetchTodayData,
    {
      todayEntries: initialEntries,
      activeEntry: initialActiveEntry,
      isClockedIn: initialIsClockedIn
    },
    {
      interval: 30000, // Update every 30 seconds
      enabled: true
    }
  );

  const getSessionDuration = (entry: TimeEntryWithDuration) => {
    if (entry.duration) {
      return formatDuration(entry.duration);
    } else if (entry.isActive && data.activeEntry?.id === entry.id) {
      // Show live duration for active session
      const now = currentTime.getTime();
      const start = new Date(entry.timeIn).getTime();
      const minutes = Math.round((now - start) / (1000 * 60));
      return formatDuration(minutes) + ' (live)';
    }
    return '0:00';
  };

  const getStatusBadge = (entry: TimeEntryWithDuration) => {
    if (!entry.timeIn) return <Badge variant="secondary">No Entry</Badge>;
    if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="default">Complete</Badge>;
  };

  if (data.todayEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No time entries today</p>
            <p className="text-sm">Clock in to start tracking your time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today&apos;s Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.todayEntries.map((entry, index) => (
            <div key={entry.id} className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Session {index + 1}</span>
                  {getStatusBadge(entry)}
                </div>
                <div className="font-medium text-primary">
                  {getSessionDuration(entry)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Clock In:</span>
                  <div className="font-medium text-foreground">{formatTime(entry.timeIn)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Clock Out:</span>
                  <div className="font-medium text-foreground">
                    {entry.timeOut ? formatTime(entry.timeOut) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>

              {entry.note && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Note:</span>
                  </div>
                  <div className="text-foreground bg-card p-2 rounded border-l-2 border-primary/20">
                    {entry.note}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}