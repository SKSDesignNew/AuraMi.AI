'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  async function handleOAuth(provider: 'google' | 'apple') {
    setError('');
    setOauthLoading(provider);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setOauthLoading(null);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
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
        {/* Back to home */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-text-500 hover:text-text-700 text-sm font-body transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>

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
            <div className="text-3xl mb-3">&#9993;</div>
            <p className="text-text-700 font-body font-medium mb-1">
              Check your email
            </p>
            <p className="text-text-500 font-body text-sm">
              We sent a magic link to <strong className="text-text-700">{email}</strong>. Click it to sign in.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(''); }}
              className="mt-4 text-sm text-text-500 hover:text-text-700 font-body transition-colors"
            >
              Use a different method
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-card p-6 border border-[rgba(0,245,255,0.08)] space-y-4">
            {/* OAuth Buttons */}
            <button
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-full border border-[rgba(0,245,255,0.12)] bg-bg text-text-800 font-body font-semibold text-sm hover:border-[rgba(0,245,255,0.25)] transition-all disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <button
              onClick={() => handleOAuth('apple')}
              disabled={oauthLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-full border border-[rgba(0,245,255,0.12)] bg-bg text-text-800 font-body font-semibold text-sm hover:border-[rgba(0,245,255,0.25)] transition-all disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {oauthLoading === 'apple' ? 'Redirecting...' : 'Continue with Apple'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[rgba(0,245,255,0.08)]" />
              <span className="text-text-400 text-xs font-body">or use email</span>
              <div className="flex-1 h-px bg-[rgba(0,245,255,0.08)]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
          </div>
        )}

        <p className="text-center text-text-400 text-xs mt-6 font-body">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </main>
  );
}
