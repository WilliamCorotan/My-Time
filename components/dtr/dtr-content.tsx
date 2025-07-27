"use client";
import { useEffect, useState, useCallback } from "react";
import { DTRClient } from '@/components/dtr/dtr-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from 'lucide-react';
import { formatTime, formatDate } from '@/lib/time-format';
import { formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

function calculateTotalDuration(entries: TimeEntryWithDuration[]): number {
  return entries.reduce((sum: number, entry: TimeEntryWithDuration) => sum + (entry.duration || 0), 0);
}

function calculateTotalWorkedTime(entries: TimeEntryWithDuration[], activeEntry: TimeEntryWithDuration | null, isClockedIn: boolean): string {
  let totalMinutes = calculateTotalDuration(entries);
  if (activeEntry && isClockedIn) {
    const now = new Date().getTime();
    const start = new Date(activeEntry.timeIn).getTime();
    totalMinutes += Math.round((now - start) / (1000 * 60));
  }
  return formatDuration(totalMinutes);
}

function getStatus(isClockedIn: boolean, todayEntries: TimeEntryWithDuration[]): { text: string; variant: 'secondary' | 'default' | 'outline' } {
  if (!isClockedIn && todayEntries.length === 0) {
    return { text: "Not Clocked In", variant: "secondary" };
  }
  if (isClockedIn) {
    return { text: "Clocked In", variant: "default" };
  }
  return { text: "Completed Sessions", variant: "outline" };
}

type DTRContentProps = {
  initialActiveEntry: TimeEntryWithDuration | null;
  initialTodayEntries: TimeEntryWithDuration[];
  initialIsClockedIn: boolean;
};

export function DTRContent({ 
  initialActiveEntry, 
  initialTodayEntries, 
  initialIsClockedIn 
}: DTRContentProps) {
  const [activeEntry, setActiveEntry] = useState(initialActiveEntry);
  const [todayEntries, setTodayEntries] = useState(initialTodayEntries);
  const [isClockedIn, setIsClockedIn] = useState(initialIsClockedIn);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDTRData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/dtr/api", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setActiveEntry(data.activeEntry);
        setTodayEntries(data.todayEntries);
        setIsClockedIn(data.isClockedIn);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const totalWorkedTime = calculateTotalWorkedTime(todayEntries, activeEntry, isClockedIn);
  const status = getStatus(isClockedIn, todayEntries);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Time Clock</h1>
        <p className="text-muted-foreground">Track your daily work hours and manage your time records.</p>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Time Record
            </div>
            <Badge variant={status.variant}>{status.text}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <div className="font-semibold text-foreground">
                {formatDate(new Date().toISOString(), {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Current Session</div>
              <div className="font-semibold text-primary">
                {activeEntry ? formatTime(activeEntry.timeIn) : "-"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Sessions Today</div>
              <div className="font-semibold text-primary">
                {todayEntries.length}
              </div>
            </div>
          </div>

          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Hours Worked Today</div>
            <div className="text-3xl font-bold text-primary">
              {totalWorkedTime}
            </div>
          </div>

          <DTRClient
            initialActiveEntry={activeEntry}
            initialTodayEntries={todayEntries}
            initialIsClockedIn={isClockedIn}
            refreshData={fetchDTRData}
          />
        </CardContent>
      </Card>

      {todayEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                  <div>
                    <div className="font-medium text-foreground">Session {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(entry.timeIn)} - {entry.timeOut ? formatTime(entry.timeOut) : 'In Progress'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">
                      {entry.isActive ? 'Active' : formatDuration(entry.duration || 0)}
                    </div>
                    {entry.note && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Note: {entry.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 