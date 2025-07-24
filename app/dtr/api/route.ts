import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  clockIn, 
  clockOut, 
  getActiveTimeEntry, 
  getTodayTimeEntries,
  isUserClockedIn 
} from '@/lib/time-entries';

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const activeEntry = await getActiveTimeEntry(userId, orgId);
    const todayEntries = await getTodayTimeEntries(userId, orgId);
    const isClockedIn = await isUserClockedIn(userId, orgId);
    
    return NextResponse.json({
      activeEntry,
      todayEntries,
      isClockedIn,
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    // Check if user is already clocked in
    const isClockedIn = await isUserClockedIn(userId, orgId);
    if (isClockedIn) {
      return NextResponse.json({ error: 'You are already clocked in. Please clock out first.' }, { status: 400 });
    }
    
    const entry = await clockIn(userId, orgId);
    return NextResponse.json({
      success: true,
      entry,
      message: 'Successfully clocked in'
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const { note } = body;
    
    if (!note || note.trim() === '') {
      return NextResponse.json({ error: 'Note is required when clocking out' }, { status: 400 });
    }
    
    // Check if user is clocked in
    const isClockedIn = await isUserClockedIn(userId, orgId);
    if (!isClockedIn) {
      return NextResponse.json({ error: 'You are not clocked in. Please clock in first.' }, { status: 400 });
    }
    
    const entry = await clockOut(userId, orgId, note);
    return NextResponse.json({
      success: true,
      entry,
      message: 'Successfully clocked out'
    });
  } catch (error: unknown) {
    console.error('Error clocking out:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to clock out';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 