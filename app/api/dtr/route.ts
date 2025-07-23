import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/libs/db/config';
import { dtr } from '@/libs/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper to get today's date string (YYYY-MM-DD)
function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const records = await db.select().from(dtr).where(and(eq(dtr.userId, userId), eq(dtr.orgId, orgId), eq(dtr.date, today())));
  return NextResponse.json(records[0] || null);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Check if already timed in
  const existing = await db.select().from(dtr).where(and(eq(dtr.userId, userId), eq(dtr.orgId, orgId), eq(dtr.date, today())));
  if (existing.length > 0) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });
  const now = new Date().toISOString().slice(11, 19); // HH:mm:ss
  const [record] = await db.insert(dtr).values({ userId, orgId, date: today(), timeIn: now }).returning();
  return NextResponse.json(record);
}

export async function PATCH(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.timeOut) updates.timeOut = body.timeOut;
  if (body.message !== undefined) updates.message = body.message;
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No updates' }, { status: 400 });
  const [record] = await db.update(dtr)
    .set(updates)
    .where(and(eq(dtr.userId, userId), eq(dtr.orgId, orgId), eq(dtr.date, today())))
    .returning();
  return NextResponse.json(record);
} 