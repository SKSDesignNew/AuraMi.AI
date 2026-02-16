import { type NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query, queryOne } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    // Cognito (primary)
    ...(process.env.COGNITO_CLIENT_ID
      ? [
          CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID!,
            clientSecret: process.env.COGNITO_CLIENT_SECRET!,
            issuer: process.env.COGNITO_ISSUER!,
          }),
        ]
      : []),
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    // Apple OAuth
    ...(process.env.APPLE_CLIENT_ID
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    // Email/password fallback for development
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        try {
          // Upsert user in our profiles table
          const user = await queryOne<{ id: string; email: string; first_name: string | null }>(
            `INSERT INTO profiles (id, email, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, NOW(), NOW())
             ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
             RETURNING id, email, first_name`,
            [credentials.email]
          );

          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.first_name || user.email,
          };
        } catch (err) {
          console.error('[Auth] authorize failed — DB may be unreachable:', err instanceof Error ? err.message : err);
          throw new Error('Database connection failed. Please try again later.');
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // Upsert profile on sign-in
        await query(
          `INSERT INTO profiles (id, email, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE SET updated_at = NOW()`,
          [user.email]
        );
      } catch (err) {
        console.error('[Auth] signIn callback DB error:', err instanceof Error ? err.message : err);
        // Allow sign-in to proceed even if profile upsert fails
        // (profile will be created on next successful connection)
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        try {
          // Get the DB user ID on first sign-in
          const profile = await queryOne<{ id: string }>(
            `SELECT id FROM profiles WHERE email = $1`,
            [user.email!]
          );
          if (profile) {
            token.userId = profile.id;
          }
        } catch (err) {
          console.error('[Auth] jwt callback DB error:', err instanceof Error ? err.message : err);
          // Continue without userId — will retry on next session refresh
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
  },

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET,
};
