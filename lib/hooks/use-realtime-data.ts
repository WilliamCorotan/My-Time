"use client";
import { useState, useEffect, useCallback, useRef } from 'react';

type RealtimeDataOptions = {
  interval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean;
  immediate?: boolean; // fetch immediately on mount
};

export function useRealtimeData<T>(
  fetchFn: () => Promise<T>,
  initialData: T,
  options: RealtimeDataOptions = {}
) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    immediate = false
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, enabled]);

  const startPolling = useCallback(() => {
    if (!enabled || intervalRef.current) return;

    intervalRef.current = setInterval(fetchData, interval);
  }, [enabled, interval, fetchData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    if (enabled) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, immediate, fetchData, startPolling, stopPolling]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    data,
    loading,
    error,
    refresh,
    startPolling,
    stopPolling
  };
}