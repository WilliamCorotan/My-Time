import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrganizationMembers, removeUserFromOrganization, updateUserRole } from '@/lib/organizations';
import { getUserDisplayName, getUserEmail, getUserImageUrl } from '@/lib/user-utils';
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

export async function GET(req: NextRequest) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (req.nextUrl.searchParams.get('members') === '1') {
    // List org members
    const members = await getOrganizationMembers(orgId);
    const userIds = members.map(m => m.userId);
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ userId: userIds });
    const userMap = new Map(users.data.map((u: any) => [u.id, u]));
    const membersWithDetails = members.map(m => {
      const user = userMap.get(m.userId);
      return {
        userId: m.userId,
        name: getUserDisplayName(user as any),
        email: getUserEmail(user as any),
        role: m.role,
        joinedAt: m.joinedAt,
        imageUrl: getUserImageUrl(user as any),
      };
    });
    return NextResponse.json(membersWithDetails);
  }
  const days = getPast7Days();
  const records = await db.select().from(timeEntries)
    .where(and(eq(timeEntries.orgId, orgId), gte(timeEntries.date, days[days.length - 1])))
    .orderBy(timeEntries.date, timeEntries.timeIn);
  // Get unique userIds
  const userIds = Array.from(new Set(records.map(r => r.userId)));
  // Fetch user info from Clerk
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ userId: userIds });
  const userMap = new Map(users.data.map((u: any) => [u.id, getUserDisplayName(u)]));
  // Attach userName to each record and calculate duration
  const recordsWithNames = records.map(r => {
    let duration = 0;
    if (r.timeOut) {
      const start = new Date(r.timeIn).getTime();
      const end = new Date(r.timeOut).getTime();
      duration = Math.round((end - start) / (1000 * 60)); // Duration in minutes
    }
    return { 
      ...r, 
      userName: userMap.get(r.userId) || r.userId,
      duration
    };
  });
  return NextResponse.json(recordsWithNames);
}

export async function POST(req: NextRequest) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  if (body.action === 'remove' && body.targetUserId) {
    await removeUserFromOrganization(body.targetUserId, orgId);
    return NextResponse.json({ success: true });
  }
  if (body.action === 'role' && body.targetUserId && body.role) {
    await updateUserRole(body.targetUserId, orgId, body.role);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
} 