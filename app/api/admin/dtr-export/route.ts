import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/config';
import { timeEntries, userOrganizations } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userOrg = await db
      .select()
      .from(userOrganizations)
      .where(and(eq(userOrganizations.userId, userId), eq(userOrganizations.orgId, orgId)))
      .limit(1);

    if (!userOrg.length || userOrg[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { startDate, endDate, userId: specificUserId } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    // Fetch time entries for the organization within the date range
    // If specificUserId is provided, filter by that user only
    const whereConditions = [
      eq(timeEntries.orgId, orgId),
      gte(timeEntries.date, startDate),
      lte(timeEntries.date, endDate)
    ];
    
    if (specificUserId) {
      whereConditions.push(eq(timeEntries.userId, specificUserId));
    }
    
    const entries = await db
      .select()
      .from(timeEntries)
      .where(and(...whereConditions))
      .orderBy(timeEntries.date, timeEntries.timeIn);

    // Group entries by user ID
    const groupedEntries: Record<string, Array<{
      id: number;
      userId: string;
      orgId: string;
      date: string;
      timeIn: string;
      timeOut: string | null;
      note: string | null;
      createdAt: string;
      updatedAt: string;
      duration?: number;
    }>> = {};
    
    entries.forEach(entry => {
      if (!groupedEntries[entry.userId]) {
        groupedEntries[entry.userId] = [];
      }
      
      // Calculate duration if timeOut exists
      let duration: number | undefined;
      if (entry.timeOut) {
        const start = new Date(entry.timeIn).getTime();
        const end = new Date(entry.timeOut).getTime();
        duration = Math.max(0, Math.round((end - start) / 60000)); // Convert to minutes
      }
      
      groupedEntries[entry.userId].push({
        ...entry,
        duration
      });
    });

    return NextResponse.json(groupedEntries);
  } catch (error) {
    console.error('DTR export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
