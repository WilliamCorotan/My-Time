import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getUserOrganizations, 
  createOrganization, 
  addUserToOrganization 
} from '@/lib/organizations';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const organizations = await getUserOrganizations(userId);
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, action } = body;

    if (action === 'create') {
      if (!name) {
        return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
      }

      const organization = await createOrganization(name, description, userId);
      return NextResponse.json(organization);
    }

    if (action === 'join') {
      const { orgId } = body;
      if (!orgId) {
        return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
      }

      await addUserToOrganization(userId, orgId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling organization request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}