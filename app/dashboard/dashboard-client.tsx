'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { supabase } from '@/lib/supabase-client';

interface DashboardClientProps {
  userId: string;
  userEmail: string;
  householdId: string;
  householdName: string;
}

export default function DashboardClient({
  userId,
  userEmail,
  householdId,
  householdName,
}: DashboardClientProps) {
  const [activePage, setActivePage] = useState('chat');
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar active={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="glass flex items-center justify-between px-6 py-3">
          <div>
            <h2 className="font-display text-lg font-bold text-text-900">
              {householdName}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-500 text-sm font-body">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="text-text-400 text-sm font-body hover:text-pink transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Content */}
        {activePage === 'chat' && (
          <ChatWindow householdId={householdId} userId={userId} />
        )}

        {activePage !== 'chat' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-text-800 mb-2 capitalize">
                {activePage.replace('-', ' ')}
              </h2>
              <p className="text-text-500 font-body">
                This section is coming soon.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
