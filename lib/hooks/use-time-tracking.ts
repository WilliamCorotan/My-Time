"use client";
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';
import { useRealtimeData } from './use-realtime-data';

type TimeTrackingData = {
  activeEntry: TimeEntryWithDuration | null;
  todayEntries: TimeEntryWithDuration[];
  isClockedIn: boolean;
};

export function useTimeTracking(initialData: TimeTrackingData) {
  const [loading, setLoading] = useState(false);

  const fetchTimeData = useCallback(async (): Promise<TimeTrackingData> => {
    const response = await fetch('/dtr/api', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch time tracking data');
    }
    return response.json();
  }, []);

  const {
    data,
    loading: realtimeLoading,
    error,
    refresh
  } = useRealtimeData(fetchTimeData, initialData, {
    interval: 30000, // Update every 30 seconds
    enabled: true,
    immediate: false
  });

  const clockIn = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/dtr/api', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

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
      setLoading(false);
    }
  }, [refresh]);

  const clockOut = useCallback(async (note: string) => {
    if (!note.trim()) {
      toast.error("Note required", {
        description: "Please add a note describing your work before clocking out."
      });
      throw new Error('Note is required');
    }

    setLoading(true);
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
      setLoading(false);
    }
  }, [refresh]);

  return {
    data,
    loading: loading || realtimeLoading,
    error,
    clockIn,
    clockOut,
    refresh
  };
}