"use client";
import { useUser } from '@clerk/nextjs';
import { useOrganization } from '@/lib/hooks/use-organization';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

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

  const formatTime = (time: string) => {
    // Handle both time strings (HH:mm:ss) and datetime strings
    let timeToFormat = time;
    if (time.includes('T')) {
      // It's already a datetime string
      timeToFormat = time;
    } else {
      // It's a time string, convert to datetime
      timeToFormat = `2000-01-01T${time}`;
    }
    
    const date = new Date(timeToFormat);
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // const calculateHours = (timeIn?: string, timeOut?: string) => {
  //   if (!timeIn || !timeOut) return null;
    
  //   // Handle both time strings (HH:mm:ss) and datetime strings
  //   let startTime = timeIn;
  //   let endTime = timeOut;
    
  //   if (!timeIn.includes('T')) {
  //     startTime = `2000-01-01T${timeIn}`;
  //   }
  //   if (!timeOut.includes('T')) {
  //     endTime = `2000-01-01T${timeOut}`;
  //   }
    
  //   const start = new Date(startTime);
  //   const end = new Date(endTime);
    
  //   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //     return null;
  //   }
    
  //   const diff = end.getTime() - start.getTime();
  //   const hours = diff / (1000 * 60 * 60);
    
  //   return hours.toFixed(1);
  // };

  const getStatusColor = (record?: CalendarRecord) => {
    if (!record?.timeIn) return 'bg-muted text-muted-foreground';
    if (!record.timeOut) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Calendar View
        </h1>
        <p className="text-muted-foreground">View your time records in a calendar format.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-semibold text-muted-foreground text-sm">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map(day => {
                const record = getRecordForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
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
                            <span>{formatTime(record.timeIn)}</span>
                          </div>
                        )}
                        {record.timeOut && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(record.timeOut)}</span>
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
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-foreground">Complete Day</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-sm text-foreground">In Progress</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border border-border rounded"></div>
              <span className="text-sm text-foreground">No Record</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}