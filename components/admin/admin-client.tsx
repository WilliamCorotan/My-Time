"use client";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatDuration } from '@/lib/time-entries-format';
import type { TimeEntryWithDuration } from '@/lib/time-entries-types';

type AdminClientProps = {
  records: (TimeEntryWithDuration & { userName?: string })[];
  orgId: string;
};

export function AdminClient({ records, orgId }: AdminClientProps) {
  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exportCSV = () => {
    if (!records.length) {
      toast.error("No data to export", {
        description: "There are no time records to export for this organization."
      });
      return;
    }

    const headers = ["User Name", "User ID", "Date", "Session", "Time In", "Time Out", "Duration", "Note"];
    
    // Group by user and date to create proper session numbers
    const groupedByUser = new Map<string, Map<string, (TimeEntryWithDuration & { userName?: string })[]>>();
    
    records.forEach(record => {
      if (!groupedByUser.has(record.userId)) {
        groupedByUser.set(record.userId, new Map());
      }
      const userRecords = groupedByUser.get(record.userId)!;
      if (!userRecords.has(record.date)) {
        userRecords.set(record.date, []);
      }
      userRecords.get(record.date)!.push(record);
    });

    const rows: string[][] = [];
    
    Array.from(groupedByUser.entries()).forEach(([userId, dateMap]) => {
      Array.from(dateMap.entries())
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .forEach(([date, entries]) => {
          entries
            .sort((a, b) => new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime())
            .forEach((entry, index) => {
              rows.push([
                entry.userName || entry.userId,
                entry.userId,
                date,
                `Session ${index + 1}`,
                formatTime(entry.timeIn),
                entry.timeOut ? formatTime(entry.timeOut) : 'In Progress',
                entry.duration ? formatDuration(entry.duration) : 'Active',
                entry.note || ''
              ]);
            });
        });
    });

    const csv = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dtr-org-${orgId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const uniqueUsers = new Set(records.map(r => r.userId)).size;
    toast.success("Organization data exported successfully!", {
      description: `Downloaded ${records.length} time records from ${uniqueUsers} team member${uniqueUsers !== 1 ? 's' : ''}.`
    });
  };

  return (
    <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export All Data
    </Button>
  );
}