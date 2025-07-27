"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, MessageSquare } from 'lucide-react';
import { formatDuration, calculateTotalDuration } from '@/lib/time-entries-format';
import { formatTime, getCurrentTime, getCurrentDate } from '@/lib/time-format';
import { toast } from 'sonner';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type RealtimeTimeClockProps = {
  initialActiveEntry: TimeEntryWithDuration | null;
  initialTodayEntries: TimeEntryWithDuration[];
  initialIsClockedIn: boolean;
  onTimeAction?: () => void;
};

export function RealtimeTimeClock({ 
  initialActiveEntry, 
  initialTodayEntries, 
  initialIsClockedIn,
  onTimeAction
}: RealtimeTimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [data, setData] = useState({
    activeEntry: initialActiveEntry,
    todayEntries: initialTodayEntries,
    isClockedIn: initialIsClockedIn
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTimeData = async () => {
    try {
      const response = await fetch('/dtr/api', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch time tracking data');
      }
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  };

  // Determine if clocked in based on active entry in database
  const isClockedIn = !!data.activeEntry && !data.activeEntry.timeOut;

  const calculateLiveTodayHours = () => {
    let totalMinutes = calculateTotalDuration(data.todayEntries);
    
    // Add current session time if clocked in
    if (data.activeEntry && isClockedIn) {
      const now = currentTime.getTime();
      const start = new Date(data.activeEntry.timeIn).getTime();
      totalMinutes += Math.round((now - start) / (1000 * 60));
    }
    
    return formatDuration(totalMinutes);
  };
  
  const calculateLiveCurrentSessionHours = () => {
    if (!data.activeEntry || !isClockedIn) return "0:00";
    
    const now = currentTime.getTime();
    const start = new Date(data.activeEntry.timeIn).getTime();
    const minutes = Math.round((now - start) / (1000 * 60));
    
    return formatDuration(minutes);
  };

  const getStatus = () => {
    if (!isClockedIn) return { text: "Not Clocked In", variant: "secondary" as const };
    return { text: "Clocked In", variant: "default" as const };
  };
  
  const handleClockIn = async () => {
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

      // Refresh only this component's data
      await fetchTimeData();
      toast.success("Successfully clocked in!", {
        description: "Your time tracking session has started."
      });
      
      // Notify parent to refresh other components
      if (onTimeAction) {
        onTimeAction();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock in';
      toast.error("Failed to clock in", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!showNoteInput) {
      setShowNoteInput(true);
      return;
    }
    
    if (!note.trim()) {
      return; // Note is required
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

      // Refresh only this component's data
      await fetchTimeData();
      setNote('');
      setShowNoteInput(false);
      toast.success("Successfully clocked out!", {
        description: "Your time tracking session has ended."
      });
      
      // Notify parent to refresh other components
      if (onTimeAction) {
        onTimeAction();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clock out';
      toast.error("Failed to clock out", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelClockOut = () => {
    setShowNoteInput(false);
    setNote('');
  };

  const status = getStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
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
            {getCurrentTime()}
          </div>
          <div className="text-sm text-muted-foreground">
            {getCurrentDate()}
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

        {!showNoteInput ? (
          <div className="flex gap-2">
            {!isClockedIn ? (
              <Button 
                onClick={handleClockIn} 
                disabled={loading}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Clock In
              </Button>
            ) : (
              <Button 
                onClick={handleClockOut} 
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Add a note for this session:</span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you work on?"
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleClockOut} 
                disabled={loading || !note.trim()}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
              <Button 
                onClick={handleCancelClockOut} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}