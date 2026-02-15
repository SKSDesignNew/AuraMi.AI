'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import MembersPage from '@/components/MembersPage';
import FamilyTreePage from '@/components/FamilyTreePage';
import TimelinePage from '@/components/TimelinePage';
import EventsPage from '@/components/EventsPage';
import PhotosPage from '@/components/PhotosPage';
import StoriesPage from '@/components/StoriesPage';
import SettingsPage from '@/components/SettingsPage';
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

  function renderPage() {
    switch (activePage) {
      case 'chat':
        return <ChatWindow householdId={householdId} userId={userId} />;
      case 'tree':
        return <FamilyTreePage householdId={householdId} />;
      case 'timeline':
        return <TimelinePage householdId={householdId} />;
      case 'members':
        return <MembersPage householdId={householdId} />;
      case 'events':
        return <EventsPage householdId={householdId} />;
      case 'photos':
        return <PhotosPage householdId={householdId} userId={userId} />;
      case 'stories':
        return <StoriesPage householdId={householdId} />;
      case 'settings':
        return (
          <SettingsPage
            householdId={householdId}
            householdName={householdName}
            userId={userId}
            userEmail={userEmail}
          />
        );
      default:
        return <ChatWindow householdId={householdId} userId={userId} />;
    }
  }

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar active={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass flex items-center justify-between px-6 py-3 flex-shrink-0">
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
        {renderPage()}
      </main>
    </div>
  );
}
