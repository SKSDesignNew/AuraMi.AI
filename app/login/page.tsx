'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Integrate Supabase Auth magic link
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
              MyVansh.AI
            </span>
          </h1>
          <p className="text-text-500 font-body text-sm">
            Sign in to explore your family history
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <p className="text-text-700 font-body">
              Check your email for a magic link to sign in.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-md space-y-4"
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
                className="w-full rounded-lg border border-text-300/30 bg-bg px-4 py-2.5 text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-coral/40 font-body text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              Send Magic Link
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
