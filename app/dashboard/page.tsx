import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { queryOne } from '@/lib/db';
import DashboardClient from './dashboard-client';
import CreateHouseholdForm from './create-household-form';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;
  const userEmail = session.user.email || '';

  // Get user's household membership
  const membership = await queryOne<{
    household_id: string;
    role: string;
    household_name: string;
  }>(
    `SELECT hm.household_id, hm.role, h.name as household_name
     FROM household_members hm
     JOIN households h ON h.id = hm.household_id
     WHERE hm.user_id = $1 AND hm.status = 'active'
     LIMIT 1`,
    [userId]
  );

  if (!membership) {
    return <CreateHouseholdForm />;
  }

  return (
    <DashboardClient
      userId={userId}
      userEmail={userEmail}
      householdId={membership.household_id}
      householdName={membership.household_name}
    />
  );
}
