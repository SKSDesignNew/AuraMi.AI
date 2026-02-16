'use client';

import { useState, useEffect } from 'react';

interface Member {
  id: string;
  role: string;
  status: string;
  user_id: string;
  created_at: string;
  profile?: { email: string; first_name: string | null; last_name: string | null; avatar_url: string | null };
}

interface MembersPageProps {
  householdId: string;
}

export default function MembersPage({ householdId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMembers();
  }, [householdId]);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/data?type=members&householdId=${householdId}`);
      const json = await res.json();
      setMembers(json.data || []);
    } catch {
      setMembers([]);
    }
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setMessage('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          householdId,
          inviteType: 'member',
        }),
      });

      if (res.ok) {
        setMessage('Invitation sent!');
        setInviteEmail('');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to send invitation.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  function getInitials(member: Member) {
    const p = member.profile;
    if (p?.first_name && p?.last_name) return `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
    if (p?.email) return p.email[0].toUpperCase();
    return '?';
  }

  function getDisplayName(member: Member) {
    const p = member.profile;
    if (p?.first_name && p?.last_name) return `${p.first_name} ${p.last_name}`;
    return p?.email || 'Unknown';
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Household Members</h2>
          <p className="font-body text-text-500 text-sm">
            {members.length} of 5 member slots used
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {loading ? (
            <div className="text-center py-12 text-text-400 font-body">Loading members...</div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 p-4 rounded-card bg-card border border-[rgba(0,245,255,0.08)]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink to-coral flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(m)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-text-800 truncate">
                    {getDisplayName(m)}
                  </p>
                  <p className="font-body text-xs text-text-400">{m.profile?.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-body font-semibold ${
                    m.role === 'owner'
                      ? 'bg-[rgba(240,147,251,0.1)] text-pink'
                      : 'bg-[rgba(0,245,255,0.08)] text-text-600'
                  }`}
                >
                  {m.role === 'owner' ? 'Owner' : 'Member'}
                </span>
              </div>
            ))
          )}
        </div>

        {members.length < 5 && (
          <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card p-6">
            <h3 className="font-display text-lg font-bold text-text-900 mb-1">Invite a Member</h3>
            <p className="font-body text-text-500 text-sm mb-4">
              Send an invitation to join your household. You can add {5 - members.length} more member{5 - members.length !== 1 ? 's' : ''}.
            </p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="family@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body"
                disabled={inviting}
              />
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? 'Sending...' : 'Invite'}
              </button>
            </form>
            {message && (
              <p className="text-sm font-body mt-3 text-text-600">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
