"use client";
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTimeTrackingContext } from '@/lib/contexts/time-tracking-context';

export function useTimeActions() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useTimeTrackingContext();

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

      // Refresh data to get the latest state
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

      // Refresh data to get the latest state
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
    clockIn,
    clockOut,
    loading
  };
}