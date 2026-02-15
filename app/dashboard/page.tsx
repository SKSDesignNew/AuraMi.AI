'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

// TODO: Replace with real auth context after Supabase Auth integration
const DEMO_HOUSEHOLD_ID = 'demo-household-id';
const DEMO_USER_ID = 'demo-user-id';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('chat');

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar active={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col">
        {activePage === 'chat' && (
          <ChatWindow
            householdId={DEMO_HOUSEHOLD_ID}
            userId={DEMO_USER_ID}
          />
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
