import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db/config';
import { dtr } from '@/libs/db/schema';
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
  const days = getPast7Days();
  const records = await db.select().from(dtr)
    .where(and(eq(dtr.userId, userId), eq(dtr.orgId, orgId), gte(dtr.date, days[days.length - 1])))
    .orderBy(dtr.date);
  return NextResponse.json(records);
} 