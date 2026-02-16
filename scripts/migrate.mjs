#!/usr/bin/env node

/**
 * Database Migration Runner for AuraMi.AI
 *
 * Runs SQL migration files in order against RDS PostgreSQL.
 * Tracks which migrations have been applied in a `_migrations` table.
 *
 * Usage:
 *   node scripts/migrate.mjs                  # Run pending migrations
 *   node scripts/migrate.mjs --status         # Show migration status
 *   node scripts/migrate.mjs --fresh          # Drop all & re-run (DANGEROUS)
 *
 * Requires env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Skip migrations if database credentials are not configured
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.log(`\nSkipping migrations — missing env vars: ${missingVars.join(', ')}`);
  console.log('Set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD to enable migrations.\n');
  process.exit(0);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function getChecksum(content) {
  // Simple hash for change detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && f !== '000_run_all.sql')
    .sort();
  return files;
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    'SELECT filename, checksum, applied_at FROM _migrations ORDER BY id'
  );
  return new Map(rows.map(r => [r.filename, r]));
}

async function runMigrations() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles();

    let pending = 0;
    let succeeded = 0;
    let failed = 0;

    console.log(`\nFound ${files.length} migration files, ${applied.size} already applied.\n`);

    for (const filename of files) {
      if (applied.has(filename)) {
        const content = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf-8');
        const currentChecksum = getChecksum(content);
        const appliedRecord = applied.get(filename);

        if (appliedRecord.checksum !== currentChecksum) {
          console.log(`  WARNING: ${filename} has changed since it was applied!`);
        }
        continue;
      }

      pending++;
      const filepath = path.join(MIGRATIONS_DIR, filename);
      const sql = fs.readFileSync(filepath, 'utf-8');
      const checksum = getChecksum(sql);

      process.stdout.write(`  Applying ${filename}... `);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename, checksum) VALUES ($1, $2)',
          [filename, checksum]
        );
        await client.query('COMMIT');
        console.log('OK');
        succeeded++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.log('FAILED');
        console.error(`    Error: ${err.message}`);
        failed++;
        // Stop on first failure — migrations are sequential
        break;
      }
    }

    console.log(`\nMigration summary:`);
    console.log(`  Applied: ${succeeded}`);
    if (failed > 0) console.log(`  Failed:  ${failed}`);
    if (pending === 0 && failed === 0) console.log(`  Database is up to date.`);
    console.log('');

    if (failed > 0) process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function showStatus() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const applied = await getAppliedMigrations(client);
    const files = getMigrationFiles();

    console.log('\nMigration Status:\n');
    console.log('  Status    | Filename                          | Applied At');
    console.log('  ----------|-----------------------------------|---------------------------');

    for (const filename of files) {
      if (applied.has(filename)) {
        const record = applied.get(filename);
        const date = new Date(record.applied_at).toISOString().replace('T', ' ').slice(0, 19);
        console.log(`  APPLIED   | ${filename.padEnd(33)} | ${date}`);
      } else {
        console.log(`  PENDING   | ${filename.padEnd(33)} |`);
      }
    }
    console.log('');
  } finally {
    client.release();
    await pool.end();
  }
}

async function freshMigration() {
  console.log('\n  WARNING: This will drop ALL tables and re-run all migrations!');
  console.log('  This is destructive and irreversible.\n');

  // In CI, allow it. Interactively, require --yes flag.
  if (!process.env.CI && !process.argv.includes('--yes')) {
    console.log('  Add --yes flag to confirm: node scripts/migrate.mjs --fresh --yes\n');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    // Drop all tables in public schema
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

    if (rows.length > 0) {
      const tables = rows.map(r => `"${r.tablename}"`).join(', ');
      await client.query(`DROP TABLE IF EXISTS ${tables} CASCADE`);
      console.log(`  Dropped ${rows.length} tables.`);
    }

    // Drop views
    const { rows: views } = await client.query(`
      SELECT viewname FROM pg_views WHERE schemaname = 'public'
    `);
    for (const v of views) {
      await client.query(`DROP VIEW IF EXISTS "${v.viewname}" CASCADE`);
    }
    if (views.length > 0) console.log(`  Dropped ${views.length} views.`);

    console.log('  Running all migrations from scratch...\n');
  } finally {
    client.release();
    await pool.end();
  }

  // Re-create pool and run migrations
  await runMigrations();
}

// ─── CLI ─────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--status')) {
  showStatus().catch(err => {
    console.error('Migration status check failed:', err.message);
    process.exit(1);
  });
} else if (args.includes('--fresh')) {
  freshMigration().catch(err => {
    console.error('Fresh migration failed:', err.message);
    process.exit(1);
  });
} else {
  runMigrations().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
}
