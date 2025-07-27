"use client";
import { useUser } from '@clerk/nextjs';
import { useOrganization } from '@/lib/hooks/use-organization';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { formatTimeOnly } from '@/lib/time-format';

type CalendarRecord = {
  date: string;
  timeIn: string;
  timeOut?: string;
  note?: string;
  duration: string | null;
  entries: Array<{
    id: number;
    userId: string;
    orgId: string;
    date: string;
    timeIn: string;
    timeOut?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export default function CalendarPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const [records, setRecords] = useState<CalendarRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!orgId) return;
    
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const month = format(currentDate, 'yyyy-MM');
        const res = await fetch(`/calendar/api?month=${month}`, { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user, orgId, currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRecordForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return records.find(record => record.date === dateStr);
  };

  const getStatusColor = (record?: CalendarRecord) => {
    if (!record) return '';
    if (!record.timeIn) return 'bg-gray-50';
    if (!record.timeOut) return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading calendar: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendar View</h1>
        <p className="text-muted-foreground">View your time records in a calendar format.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map(day => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const record = getRecordForDate(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-2 border border-border rounded-lg transition-colors
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    ${getStatusColor(record)}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                    {record?.duration && (
                      <Badge variant="success" className="text-xs">
                        {record.duration}h
                      </Badge>
                    )}
                  </div>
                  
                  {record && (
                    <div className="space-y-1 text-xs">
                      {record.timeIn && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeOnly(record.timeIn)}</span>
                        </div>
                      )}
                      {record.timeOut && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeOnly(record.timeOut)}</span>
                        </div>
                      )}
                      {record.note && (
                        <div className="text-xs text-muted-foreground truncate" title={record.note}>
                          {record.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}