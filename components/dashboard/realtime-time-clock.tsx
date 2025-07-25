"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, MessageSquare, RefreshCw } from 'lucide-react';
import { formatDuration, calculateTotalDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';
import { useTimeTracking } from '@/lib/hooks/use-time-tracking';
import { useTimeActions } from '@/lib/hooks/use-time-actions';

type RealtimeTimeClockProps = {
  initialActiveEntry: TimeEntryWithDuration | null;
  initialTodayEntries: TimeEntryWithDuration[];
  initialIsClockedIn: boolean;
};

export function RealtimeTimeClock({ 
  initialActiveEntry, 
  initialTodayEntries, 
  initialIsClockedIn 
}: RealtimeTimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  
  const { data, loading, error, clockIn, clockOut, refresh } = useTimeTracking({
    activeEntry: initialActiveEntry,
    todayEntries: initialTodayEntries,
    isClockedIn: initialIsClockedIn
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateLiveTodayHours = () => {
    let totalMinutes = calculateTotalDuration(data.todayEntries);
    
    // Add current session time if clocked in
    if (data.activeEntry && data.isClockedIn) {
      const now = currentTime.getTime();
      const start = new Date(data.activeEntry.timeIn).getTime();
      totalMinutes += Math.round((now - start) / (1000 * 60));
    }
    
    return formatDuration(totalMinutes);
  };
  
  const calculateLiveCurrentSessionHours = () => {
    if (!data.activeEntry || !data.isClockedIn) return "0:00";
    
    const now = currentTime.getTime();
    const start = new Date(data.activeEntry.timeIn).getTime();
    const minutes = Math.round((now - start) / (1000 * 60));
    
    return formatDuration(minutes);
  };

  const getStatus = () => {
    if (!data.isClockedIn) return { text: "Not Clocked In", variant: "secondary" as const };
    return { text: "Clocked In", variant: "default" as const };
  };
  
  const handleClockIn = async () => {
    try {
      await clockIn();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClockOut = async () => {
    if (!showNoteInput) {
      setShowNoteInput(true);
      return;
    }
    
    try {
      await clockOut(note);
      setNote('');
      setShowNoteInput(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancelClockOut = () => {
    setShowNoteInput(false);
    setNote('');
  };

  const handleRefresh = () => {
    refresh();
  };

  const status = getStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Clock
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-foreground">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Badge variant={status.variant} className="animate-pulse">
            {status.text}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Current Session:</span>
            <div className="font-medium text-foreground">
              {data.activeEntry ? formatTime(data.activeEntry.timeIn) : "-"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Session Time:</span>
            <div className="font-medium text-primary">
              {calculateLiveCurrentSessionHours()}
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-muted-foreground">Today&apos;s Total:</span>
          <div className="text-xl font-bold text-primary">
            {calculateLiveTodayHours()}
          </div>
        </div>
        
        {data.todayEntries.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {data.todayEntries.length} session{data.todayEntries.length !== 1 ? "s" : ""} today
          </div>
        )}

        {showNoteInput && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4" />
              Clock Out Note (Required)
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Please describe what you worked on during this session..."
              className="min-h-[80px]"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleClockOut}
                disabled={loading || !note.trim()}
                className="flex-1"
                size="sm"
              >
                <Square className="mr-2 h-3 w-3" />
                {loading ? 'Clocking Out...' : 'Confirm Clock Out'}
              </Button>
              <Button
                onClick={handleCancelClockOut}
                disabled={loading}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {!showNoteInput && (
          <div className="flex gap-2">
            <Button
              onClick={handleClockIn}
              disabled={loading || data.isClockedIn}
              className="flex-1"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              {loading ? 'Clocking In...' : 'Clock In'}
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={loading || !data.isClockedIn}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              <Square className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}