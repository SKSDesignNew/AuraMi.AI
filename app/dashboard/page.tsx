import { createSupabaseServerClient } from '@/lib/supabase-ssr';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's household membership
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, role, household:households(id, name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
              Welcome to MyVansh.AI
            </span>
          </h1>
          <p className="text-text-600 font-body mb-6">
            You don&apos;t have a household yet. Create one to start building
            your family history.
          </p>
          <p className="text-text-400 font-body text-sm">
            Household creation coming soon. Contact an admin to get started.
          </p>
        </div>
      </main>
    );
  }

  const household = membership.household as unknown as { id: string; name: string };

  return (
    <DashboardClient
      userId={user.id}
      userEmail={user.email || ''}
      householdId={household.id}
      householdName={household.name}
    />
  );
}
