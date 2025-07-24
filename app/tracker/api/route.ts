import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/config';
import { timeEntries } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

function getPast7Days() {
  const today = new Date();
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const days = getPast7Days();
    const records = await db.select().from(timeEntries)
      .where(and(
        eq(timeEntries.userId, userId), 
        eq(timeEntries.orgId, orgId), 
        gte(timeEntries.date, days[days.length - 1])
      ))
      .orderBy(timeEntries.date, timeEntries.timeIn);
    
    // Calculate duration for each entry
    const recordsWithDuration = records.map(record => {
      let duration = undefined;
      if (record.timeOut) {
        const start = new Date(record.timeIn).getTime();
        const end = new Date(record.timeOut).getTime();
        duration = Math.round((end - start) / (1000 * 60)); // Duration in minutes
      }
      
      return {
        ...record,
        duration,
        isActive: !record.timeOut,
      };
    });
    
    return NextResponse.json(recordsWithDuration);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 