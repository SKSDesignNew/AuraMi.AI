-- 008_jobs_sync.sql
-- Background jobs and Google Sheets sync

create table ingestion_jobs (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  source_type text not null check (source_type in ('asset_upload', 'sheets_sync', 'bulk_import', 'story_embed')),
  source_asset_id uuid references assets(id),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table household_sheets (
  household_id uuid not null references households(id) on delete cascade,
  sheet_id text not null,
  sheet_url text not null,
  template_version text default 'v1',
  sync_enabled boolean not null default true,
  last_synced_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (household_id, sheet_id)
);
