'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateHouseholdForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/household', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold mb-2">
            <span className="brand-aura">Aura</span>
            <span className="gradient-text font-extrabold">Mi</span>
            <span className="gradient-text font-medium">.AI</span>
          </h1>
          <p className="text-text-500 font-body">
            Create your family household to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card p-8"
        >
          <label className="block mb-2 text-sm font-body font-semibold text-text-700">
            Household Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "The Kumar Family"'
            className="w-full px-4 py-3 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body mb-4"
            disabled={loading}
            autoFocus
          />

          {error && (
            <p className="text-sm text-coral font-body mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Creating...' : 'Create Household'}
          </button>

          <p className="text-text-400 text-xs font-body text-center mt-4">
            You&apos;ll be the Owner. You can invite up to 4 family members later.
          </p>
        </form>
      </div>
    </main>
  );
}
