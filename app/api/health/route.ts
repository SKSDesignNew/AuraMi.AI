/**
 * Health Check Endpoint
 *
 * GET /api/health — returns status of all dependencies.
 * Used to diagnose deployment issues (missing env vars, DB connectivity, etc.)
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; detail?: string }> = {};

  // 1. Check critical environment variables (existence only, not values)
  const envVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  for (const key of envVars) {
    checks[key] = process.env[key]
      ? { status: 'set', detail: key === 'NEXTAUTH_URL' ? process.env[key] : `${process.env[key]!.slice(0, 4)}...` }
      : { status: 'MISSING' };
  }

  // 2. Check optional env vars
  const optionalVars = ['GOOGLE_CLIENT_ID', 'APPLE_CLIENT_ID', 'COGNITO_CLIENT_ID', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];
  for (const key of optionalVars) {
    checks[key] = process.env[key]
      ? { status: 'set' }
      : { status: 'not set (optional)' };
  }

  // 3. Check database connectivity
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const { rows } = await client.query('SELECT NOW() as time');
    checks['db_connection'] = { status: 'connected', detail: rows[0]?.time };

    // Check if profiles table exists
    const { rows: tables } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles'`
    );
    checks['profiles_table'] = tables.length > 0
      ? { status: 'exists' }
      : { status: 'MISSING — run migrations' };

    // Check if _migrations table exists (shows if migrations have ever run)
    const { rows: migrationTables } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = '_migrations'`
    );
    if (migrationTables.length > 0) {
      const { rows: applied } = await client.query(
        'SELECT COUNT(*) as count FROM _migrations'
      );
      checks['migrations'] = { status: 'table exists', detail: `${applied[0]?.count} applied` };
    } else {
      checks['migrations'] = { status: 'NEVER RUN — _migrations table missing' };
    }

    client.release();
    await pool.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    checks['db_connection'] = { status: 'FAILED', detail: message };
  }

  // 4. Check NODE_ENV
  checks['NODE_ENV'] = { status: process.env.NODE_ENV || 'not set' };

  // 5. Overall status
  const critical = ['NEXTAUTH_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'db_connection', 'profiles_table'];
  const allGood = critical.every(k => checks[k]?.status !== 'MISSING' && checks[k]?.status !== 'FAILED' && !checks[k]?.status.startsWith('MISSING'));

  return NextResponse.json(
    {
      overall: allGood ? 'healthy' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allGood ? 200 : 503 }
  );
}
