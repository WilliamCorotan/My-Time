"use client";
import { RealtimeTimeClock } from '@/components/dashboard/realtime-time-clock';
import { RealtimeTodayEntries } from '@/components/dashboard/realtime-today-entries';
import type { TimeEntryWithDuration } from '@/lib/time-entries';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RealtimeTimeClock
        initialActiveEntry={initialActiveEntry}
        initialTodayEntries={initialTodayEntries}
        initialIsClockedIn={initialIsClockedIn}
      />
      <RealtimeTodayEntries
        initialEntries={initialTodayEntries}
        initialActiveEntry={initialActiveEntry}
        initialIsClockedIn={initialIsClockedIn}
      />
    </div>
  );
}