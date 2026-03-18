import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DtrAdjustmentsContent } from '@/components/dtr/dtr-adjustments-content';

export default async function DtrAdjustmentsPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!orgId) {
    redirect('/welcome');
  }

  return <DtrAdjustmentsContent />;
}
