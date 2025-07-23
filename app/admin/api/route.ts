import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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

export async function GET(req: NextRequest) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (req.nextUrl.searchParams.get('members') === '1') {
    // List org members
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId });
    const users = await clerkClient.users.getUserList({ userId: memberships.data.map((m: any) => m.publicUserData.userId) });
    const userMap = new Map(users.data.map((u: any) => [u.id, u]));
    const members = memberships.data.map((m: any) => ({
      userId: m.publicUserData.userId,
      name: userMap.get(m.publicUserData.userId)?.fullName || userMap.get(m.publicUserData.userId)?.emailAddresses?.[0]?.emailAddress || m.publicUserData.userId,
      email: userMap.get(m.publicUserData.userId)?.emailAddresses?.[0]?.emailAddress || '',
      role: m.role,
    }));
    return NextResponse.json(members);
  }
  const days = getPast7Days();
  const records = await db.select().from(dtr)
    .where(and(eq(dtr.orgId, orgId), gte(dtr.date, days[days.length - 1])))
    .orderBy(dtr.date);
  // Get unique userIds
  const userIds = Array.from(new Set(records.map(r => r.userId)));
  // Fetch user info from Clerk
  const users = await clerkClient.users.getUserList({ userId: userIds });
  const userMap = new Map(users.data.map((u: any) => [u.id, u.fullName || (u.emailAddresses?.[0]?.emailAddress ?? u.id)]));
  // Attach userName to each record
  const recordsWithNames = records.map(r => ({ ...r, userName: userMap.get(r.userId) || r.userId }));
  return NextResponse.json(recordsWithNames);
}

export async function POST(req: NextRequest) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId || orgRole !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  if (body.action === 'remove' && body.targetUserId) {
    await clerkClient.organizations.removeOrganizationMembership({ organizationId: orgId, userId: body.targetUserId });
    return NextResponse.json({ success: true });
  }
  if (body.action === 'role' && body.targetUserId && body.role) {
    await clerkClient.organizations.updateOrganizationMembership({ organizationId: orgId, userId: body.targetUserId, role: body.role });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
} 