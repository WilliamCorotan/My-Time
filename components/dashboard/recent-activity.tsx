"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface RecentActivityProps {
  records: Array<{
    date: string;
    timeIn?: string;
    timeOut?: string;
    message?: string;
  }>;
}

export function RecentActivity({ records }: RecentActivityProps) {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateHours = (timeIn?: string, timeOut?: string) => {
    if (!timeIn || !timeOut) return null;
    
    const start = new Date(`2000-01-01T${timeIn}`);
    const end = new Date(`2000-01-01T${timeOut}`);
    const diff = end.getTime() - start.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    return hours.toFixed(1);
  };

  const getStatusBadge = (timeIn?: string, timeOut?: string) => {
    if (!timeIn) return <Badge variant="secondary">No Entry</Badge>;
    if (!timeOut) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="default">Complete</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No recent activity
            </div>
          ) : (
            records.slice(0, 5).map((record, idx) => (
              <div key={`${record.date}-${record.timeIn || ''}-${record.timeOut || ''}-${idx}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">
                      {format(parseISO(record.date), 'MMM dd, yyyy')}
                    </span>
                    {getStatusBadge(record.timeIn, record.timeOut)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {record.timeIn ? formatTime(record.timeIn) : '-'} - {record.timeOut ? formatTime(record.timeOut) : '-'}
                    </span>
                    {calculateHours(record.timeIn, record.timeOut) && (
                      <span className="font-medium text-primary">
                        {calculateHours(record.timeIn, record.timeOut)}h
                      </span>
                    )}
                  </div>
                  {record.message && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {record.message}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}