"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, BarChart3, Zap } from 'lucide-react';
import { useTimeTrackingContext } from '@/lib/contexts/time-tracking-context';
import { formatDuration, calculateTotalDuration } from '@/lib/time-entries-format';

type LiveStatsCardsProps = {
  recentRecords: any[]; // Recent records for week/month calculations
};

export function LiveStatsCards({ recentRecords }: LiveStatsCardsProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data } = useTimeTrackingContext();

  // Update current time every second for live calculations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const calculateWeekHours = () => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekRecords = recentRecords.filter(r => new Date(r.date) >= thisWeek);
    let weekMinutes = calculateTotalDuration(weekRecords);
    
    // Add today's time if it's not already in recent records
    const today = new Date().toISOString().slice(0, 10);
    const todayInRecords = weekRecords.some(r => r.date === today);
    if (!todayInRecords) {
      let todayMinutes = calculateTotalDuration(data.todayEntries);
      if (data.activeEntry && data.isClockedIn) {
        const now = currentTime.getTime();
        const start = new Date(data.activeEntry.timeIn).getTime();
        todayMinutes += Math.round((now - start) / (1000 * 60));
      }
      weekMinutes += todayMinutes;
    }
    
    return formatDuration(weekMinutes);
  };

  const calculateMonthHours = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthRecords = recentRecords.filter(r => new Date(r.date) >= thisMonth);
    let monthMinutes = calculateTotalDuration(monthRecords);
    
    // Add today's time if it's not already in recent records
    const today = new Date().toISOString().slice(0, 10);
    const todayInRecords = monthRecords.some(r => r.date === today);
    if (!todayInRecords) {
      let todayMinutes = calculateTotalDuration(data.todayEntries);
      if (data.activeEntry && data.isClockedIn) {
        const now = currentTime.getTime();
        const start = new Date(data.activeEntry.timeIn).getTime();
        todayMinutes += Math.round((now - start) / (1000 * 60));
      }
      monthMinutes += todayMinutes;
    }
    
    return formatDuration(monthMinutes);
  };

  const getTotalDays = () => {
    const workingDays = new Set(recentRecords.filter(r => r.duration && r.duration > 0).map(r => r.date));
    
    // Add today if user has worked
    if (data.todayEntries.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      workingDays.add(today);
    }
    
    return workingDays.size;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.isClockedIn ? 'text-primary animate-pulse' : ''}`}>
            {calculateLiveTodayHours()}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.isClockedIn ? 'Currently tracking' : 'Hours worked'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calculateWeekHours()}</div>
          <p className="text-xs text-muted-foreground">Past 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calculateMonthHours()}</div>
          <p className="text-xs text-muted-foreground">Current month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalDays()}</div>
          <p className="text-xs text-muted-foreground">Days worked</p>
        </CardContent>
      </Card>
    </div>
  );
}