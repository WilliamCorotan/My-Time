"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Download } from 'lucide-react';
import { formatDuration, type TimeEntryWithDuration } from '@/lib/time-entries-utils';
import { formatTime } from '@/lib/time-format';
import { toast } from 'sonner';

type TrackerClientProps = {
  records: TimeEntryWithDuration[];
  userName: string;
};

export function TrackerClient({ records, userName }: TrackerClientProps) {
  const exportCSV = () => {
    if (!records.length) {
      toast.error("No data to export", {
        description: "There are no time records to export."
      });
      return;
    }

    const headers = ["Date", "Session", "Time In", "Time Out", "Duration", "Note"];
    
    // Group by date and create rows
    const groupedByDate = new Map<string, TimeEntryWithDuration[]>();
    records.forEach(record => {
      if (!groupedByDate.has(record.date)) {
        groupedByDate.set(record.date, []);
      }
      groupedByDate.get(record.date)!.push(record);
    });

    const rows: string[][] = [];
    Array.from(groupedByDate.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([date, entries]) => {
        entries
          .sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime())
          .forEach((entry, index) => {
            rows.push([
              date,
              `Session ${index + 1}`,
              formatTime(entry.timeIn),
              entry.timeOut ? formatTime(entry.timeOut) : 'In Progress',
              entry.duration ? formatDuration(entry.duration) : 'Active',
              entry.note || ''
            ]);
          });
      });

    const csv = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-records-${userName.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Export successful", {
      description: "Your time records have been exported to CSV."
    });
  };

  const getStatusBadge = (entry: TimeEntryWithDuration) => {
    if (!entry.timeIn) return <Badge variant="secondary">No Entry</Badge>;
    if (!entry.timeOut) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="default">Complete</Badge>;
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No time records found</p>
            <p className="text-sm">Start tracking your time to see records here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group records by date
  const groupedRecords = records.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, TimeEntryWithDuration[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Tracker</h1>
          <p className="text-muted-foreground">View and export your time tracking records</p>
        </div>
        <Button onClick={exportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Time Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedDates.map(date => {
              const entries = groupedRecords[date].sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime());
              const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
              
              return (
                <div key={date} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {new Date(date).toLocaleDateString([], { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                      <div className="text-lg font-bold text-primary">
                        {formatDuration(totalMinutes)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {entries.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-foreground">Session {index + 1}</span>
                            {getStatusBadge(entry)}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(entry.timeIn)} - {entry.timeOut ? formatTime(entry.timeOut) : 'In Progress'}
                            </span>
                            {entry.duration && (
                              <span className="font-medium text-primary">
                                {formatDuration(entry.duration)}
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2 p-2 bg-card rounded border-l-2 border-primary/20">
                              <span className="text-xs">💬</span>
                              <span>{entry.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}