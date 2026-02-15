'use client';

import { useState } from 'react';

interface SettingsPageProps {
  householdId: string;
  householdName: string;
  userId: string;
  userEmail: string;
}

export default function SettingsPage({
  householdId,
  householdName,
  userId,
  userEmail,
}: SettingsPageProps) {
  const [name, setName] = useState(householdName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === householdName) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_household_name',
          householdId,
          name: name.trim(),
        }),
      });

      if (res.ok) {
        setMessage('Household name updated!');
      } else {
        const data = await res.json();
        setMessage('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch {
      setMessage('Network error. Please try again.');
    }
    setSaving(false);
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Settings</h2>
          <p className="font-body text-text-500 text-sm">Manage your household and account</p>
        </div>

        {/* Household settings */}
        <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-text-900 mb-4">Household</h3>
          <form onSubmit={handleSaveName}>
            <label className="block mb-2 text-sm font-body font-semibold text-text-700">
              Household Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body"
                disabled={saving}
              />
              <button
                type="submit"
                disabled={saving || !name.trim() || name.trim() === householdName}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {message && (
              <p className="text-sm font-body text-text-600 mt-2">{message}</p>
            )}
          </form>

          <div className="mt-5 pt-5 border-t border-[rgba(0,245,255,0.06)]">
            <p className="text-xs font-body text-text-400">
              Household ID: <span className="font-mono text-text-500">{householdId}</span>
            </p>
          </div>
        </div>

        {/* Account settings */}
        <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-text-900 mb-4">Account</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-body font-semibold text-text-700 mb-1">
                Email
              </label>
              <p className="font-body text-text-600">{userEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-body font-semibold text-text-700 mb-1">
                User ID
              </label>
              <p className="font-mono text-xs text-text-400">{userId}</p>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card p-6">
          <h3 className="font-display text-lg font-bold text-text-900 mb-4">Data &amp; Privacy</h3>
          <p className="font-body text-text-500 text-sm mb-4">
            Your family data is stored securely in your household&apos;s private database. Only
            household members can access it.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-alt">
              <span className="text-lg">{'\uD83D\uDD12'}</span>
              <div>
                <p className="font-body text-sm font-semibold text-text-700">Application-Level Security</p>
                <p className="font-body text-xs text-text-400">
                  All data is protected with authentication and authorization controls
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-alt">
              <span className="text-lg">{'\uD83D\uDEE1\uFE0F'}</span>
              <div>
                <p className="font-body text-sm font-semibold text-text-700">Encrypted Storage</p>
                <p className="font-body text-xs text-text-400">
                  All photos and documents are stored with encryption at rest on AWS S3
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
