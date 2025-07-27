"use client";
import { useState, useCallback } from 'react';
import { RealtimeTimeClock } from '@/components/dashboard/realtime-time-clock';
import { RealtimeTodayEntries } from '@/components/dashboard/realtime-today-entries';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type DashboardClientProps = {
  initialActiveEntry: TimeEntryWithDuration | null;
  initialTodayEntries: TimeEntryWithDuration[];
  initialIsClockedIn: boolean;
};

export function DashboardClient({ 
  initialActiveEntry, 
  initialTodayEntries, 
  initialIsClockedIn 
}: DashboardClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTimeAction = useCallback(() => {
    // Trigger refresh of other components when time action occurs
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <RealtimeTimeClock
        initialActiveEntry={initialActiveEntry}
        initialTodayEntries={initialTodayEntries}
        initialIsClockedIn={initialIsClockedIn}
        onTimeAction={handleTimeAction}
      />
      <RealtimeTodayEntries
        key={refreshKey} // Force re-render when refreshKey changes
        initialEntries={initialTodayEntries}
        initialActiveEntry={initialActiveEntry}
        initialIsClockedIn={initialIsClockedIn}
      />
    </div>
  );
}