"use client";
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type TimeTrackingData = {
  activeEntry: TimeEntryWithDuration | null;
  todayEntries: TimeEntryWithDuration[];
  isClockedIn: boolean;
};

export function useTimeTracking(initialData: TimeTrackingData) {
  const [data, setData] = useState<TimeTrackingData>(initialData);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeData = useCallback(async (): Promise<TimeTrackingData> => {
    const response = await fetch('/dtr/api', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch time tracking data');
    }
    return response.json();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const newData = await fetchTimeData();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  }, [fetchTimeData]);

  const clockIn = useCallback(async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/dtr/api', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Immediately refresh data after clock in
      await refresh();
      toast.success("Successfully clocked in!", {
        description: "Your time tracking session has started."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock in';
      toast.error("Failed to clock in", {
        description: errorMessage
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const clockOut = useCallback(async (note: string) => {
    if (!note.trim()) {
      toast.error("Note required", {
        description: "Please add a note describing your work before clocking out."
      });
      throw new Error('Note is required');
    }

    setActionLoading(true);
    try {
      const response = await fetch('/dtr/api', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note: note.trim() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Immediately refresh data after clock out
      await refresh();
      toast.success("Successfully clocked out!", {
        description: "Your time tracking session has ended."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock out';
      toast.error("Failed to clock out", {
        description: errorMessage
      });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  return {
    data,
    loading: actionLoading,
    error,
    clockIn,
    clockOut,
    refresh
  };
}