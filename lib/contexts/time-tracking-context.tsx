"use client";
import React, { createContext, useContext, useCallback } from 'react';
import { useRealtimeData } from '@/lib/hooks/use-realtime-data';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type TimeTrackingData = {
  activeEntry: TimeEntryWithDuration | null;
  todayEntries: TimeEntryWithDuration[];
  isClockedIn: boolean;
};

type TimeTrackingContextType = {
  data: TimeTrackingData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
};

const TimeTrackingContext = createContext<TimeTrackingContextType | null>(null);

type TimeTrackingProviderProps = {
  children: React.ReactNode;
  initialData: TimeTrackingData;
};

export function TimeTrackingProvider({ children, initialData }: TimeTrackingProviderProps) {
  const fetchTimeData = useCallback(async (): Promise<TimeTrackingData> => {
    const response = await fetch('/dtr/api', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch time tracking data');
    }
    return response.json();
  }, []);

  const {
    data,
    loading,
    error,
    refresh
  } = useRealtimeData(fetchTimeData, initialData, {
    interval: 30000, // Update every 30 seconds
    enabled: true,
    immediate: false
  });

  const value: TimeTrackingContextType = {
    data,
    loading,
    error,
    refresh,
    isRefreshing: loading
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTrackingContext() {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error('useTimeTrackingContext must be used within a TimeTrackingProvider');
  }
  return context;
}