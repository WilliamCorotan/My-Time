import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient, User } from '@clerk/nextjs/server';
import { 
  getOrganizationMembers,
  isUserAdmin
} from '@/lib/organizations';
import { getUserDisplayName, getUserEmail, getUserImageUrl } from '@/lib/user-utils';

type Params = Promise<{ orgId: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    const isAdmin = await isUserAdmin(userId, orgId);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const members = await getOrganizationMembers(orgId);
    
    // Fetch user details from Clerk
    const userIds = members.map(m => m.userId);
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ userId: userIds });
    
    const membersWithDetails = members.map(member => {
      const user = users.data.find((u: User) => u.id === member.userId);
      return {
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        email: getUserEmail(user as User),
        name: getUserDisplayName(user as User) || 'Unknown User',
        imageUrl: getUserImageUrl(user as User),
      };
    });

    return NextResponse.json(membersWithDetails);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}