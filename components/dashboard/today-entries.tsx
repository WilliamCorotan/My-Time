"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, Play, Square } from 'lucide-react';
import { formatDuration } from '@/lib/time-entries-format';

type TimeEntry = {
  id: number;
  timeIn: string;
  timeOut?: string | null;
  note?: string | null;
  duration?: number;
  isActive: boolean;
};

interface TodayEntriesProps {
  entries: TimeEntry[];
}

export function TodayEntries({ entries }: TodayEntriesProps) {
  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSessionDuration = (entry: TimeEntry) => {
    if (entry.duration) {
      return formatDuration(entry.duration);
    } else if (entry.isActive) {
      const now = new Date().getTime();
      const start = new Date(entry.timeIn).getTime();
      const minutes = Math.round((now - start) / (1000 * 60));
      return formatDuration(minutes) + ' (ongoing)';
    }
    return '0:00';
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today&apos;s Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No time entries today</p>
            <p className="text-sm">Clock in to start tracking your time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today&apos;s Sessions ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border ${
                entry.isActive 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Session {index + 1}
                  </span>
                  <Badge variant={entry.isActive ? 'default' : 'secondary'}>
                    {entry.isActive ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Square className="h-3 w-3 mr-1" />
                        Completed
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-600">
                    {getSessionDuration(entry)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Clock In:</span>
                  <div className="font-medium">{formatTime(entry.timeIn)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Clock Out:</span>
                  <div className="font-medium">
                    {entry.timeOut ? formatTime(entry.timeOut) : '-'}
                  </div>
                </div>
              </div>

              {entry.note && (
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Note:</span>
                  </div>
                  <div className="text-gray-700 bg-white p-2 rounded border-l-2 border-blue-200">
                    {entry.note}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}