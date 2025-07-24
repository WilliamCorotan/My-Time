"use client";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatDuration, type TimeEntryWithDuration } from '@/lib/time-entries-utils';

type TrackerClientProps = {
  records: TimeEntryWithDuration[];
  userName: string;
};

export function TrackerClient({ records, userName }: TrackerClientProps) {
  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
    
    toast.success("CSV exported successfully!", {
      description: `Downloaded ${records.length} time record${records.length !== 1 ? 's' : ''}.`
    });
  };

  return (
    <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}