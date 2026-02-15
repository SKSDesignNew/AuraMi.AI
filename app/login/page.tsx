'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold mb-2">
            <span className="brand-aura">Aura</span>
            <span className="gradient-text font-extrabold">Mi</span>
            <span className="gradient-text font-medium">.AI</span>
          </h1>
          <p className="text-text-500 font-body text-sm">
            Sign in to explore your family history
          </p>
        </div>

        {submitted ? (
          <div className="bg-card rounded-card p-6 border border-[rgba(0,245,255,0.08)] text-center">
            <p className="text-text-700 font-body">
              Check your email for a magic link to sign in.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-card p-6 border border-[rgba(0,245,255,0.08)] space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-body font-medium text-text-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[rgba(0,245,255,0.1)] bg-bg px-4 py-2.5 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-body">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <p className="text-center text-text-400 text-xs mt-6 font-body">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </main>
  );
}
