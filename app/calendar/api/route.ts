import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/config';
import { timeEntries } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    
    if (!month) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }
    
    // Calculate start and end of month
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().slice(0, 10);
    
    const records = await db.select().from(timeEntries)
      .where(and(
        eq(timeEntries.userId, userId), 
        eq(timeEntries.orgId, orgId), 
        gte(timeEntries.date, startDate),
        lte(timeEntries.date, endDate)
      ))
      .orderBy(timeEntries.date, timeEntries.timeIn);
    
    // Group records by date and calculate daily totals
    const dailyRecords: Record<string, {
      date: string;
      timeIn: string;
      timeOut?: string;
      note?: string;
      duration: number;
      entries: typeof records;
    }> = {};
    
    records.forEach(record => {
      if (!dailyRecords[record.date]) {
        dailyRecords[record.date] = {
          date: record.date,
          timeIn: record.timeIn,
          timeOut: record.timeOut || undefined,
          note: record.note || undefined,
          duration: 0,
          entries: []
        };
      }
      
      dailyRecords[record.date].entries.push(record);
      
      // Calculate total duration for the day
      if (record.timeOut) {
        const start = new Date(record.timeIn).getTime();
        const end = new Date(record.timeOut).getTime();
        const duration = (end - start) / (1000 * 60 * 60); // Duration in hours
        dailyRecords[record.date].duration += duration;
      }
    });
    
    // Convert to array and format duration
    const formattedRecords = Object.values(dailyRecords).map((record) => ({
      ...record,
      duration: record.duration > 0 ? record.duration.toFixed(1) : null
    }));
    
    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 