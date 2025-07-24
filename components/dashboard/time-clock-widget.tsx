"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Play, Square, MessageSquare } from 'lucide-react';
import { formatDuration } from '@/lib/time-entries-format';

type TimeEntry = {
  id: number;
  timeIn: string;
  timeOut?: string | null;
  note?: string | null;
  duration?: number;
  isActive: boolean;
};

interface TimeClockWidgetProps {
  activeEntry: TimeEntry | null;
  todayEntries: TimeEntry[];
  isClockedIn: boolean;
  onTimeIn: () => void;
  onTimeOut: (note: string) => void;
  loading: boolean;
}

export function TimeClockWidget({ activeEntry, todayEntries, isClockedIn, onTimeIn, onTimeOut, loading }: TimeClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

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

  const calculateTodayHours = () => {
    let totalMinutes = 0;
    
    todayEntries.forEach(entry => {
      if (entry.duration) {
        totalMinutes += entry.duration;
      } else if (entry.isActive && activeEntry) {
        // Calculate duration for active entry
        const now = new Date().getTime();
        const start = new Date(entry.timeIn).getTime();
        totalMinutes += Math.round((now - start) / (1000 * 60));
      }
    });
    
    return formatDuration(totalMinutes);
  };
  
  const calculateCurrentSessionHours = () => {
    if (!activeEntry) return "0:00";
    
    const now = new Date().getTime();
    const start = new Date(activeEntry.timeIn).getTime();
    const minutes = Math.round((now - start) / (1000 * 60));
    
    return formatDuration(minutes);
  };

  const getStatus = () => {
    if (!isClockedIn) return { text: "Not Clocked In", variant: "secondary" as const };
    return { text: "Clocked In", variant: "default" as const };
  };
  
  const handleClockOut = () => {
    if (!showNoteInput) {
      setShowNoteInput(true);
      return;
    }
    
    if (!note.trim()) {
      return; // Note is required
    }
    
    onTimeOut(note.trim());
    setNote('');
    setShowNoteInput(false);
  };
  
  const handleCancelClockOut = () => {
    setShowNoteInput(false);
    setNote('');
  };

  const status = getStatus();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Badge variant={status.variant}>{status.text}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Current Session:</span>
            <div className="font-medium text-foreground">
              {activeEntry ? formatTime(activeEntry.timeIn) : "-"}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Session Time:</span>
            <div className="font-medium text-foreground">
              {calculateCurrentSessionHours()}
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-muted-foreground">Today&apos;s Total:</span>
          <div className="text-xl font-bold text-primary">
            {calculateTodayHours()}
          </div>
        </div>
        
        {todayEntries.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {todayEntries.length} session{todayEntries.length !== 1 ? "s" : ""} today
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
                Confirm Clock Out
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
              onClick={onTimeIn}
              disabled={loading || isClockedIn}
              className="flex-1"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              Clock In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={loading || !isClockedIn}
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