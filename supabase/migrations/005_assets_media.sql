-- 005_assets_media.sql
-- Assets (photos, documents), tagging, person links

create table assets (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  asset_type text not null check (asset_type in ('photo', 'document', 'certificate', 'letter', 'video', 'audio')),
  storage_bucket text not null default 'family_assets',
  storage_path text not null,
  original_filename text,
  mime_type text,
  description text,
  captured_at timestamptz,
  year integer,
  linked_event_id uuid references events(id),
  linked_person_id uuid references persons(id),
  checksum text,
  embedding vector,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table asset_persons (
  asset_id uuid not null references assets(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  is_primary boolean default false,
  face_index integer,
  created_at timestamptz not null default now(),
  primary key (asset_id, person_id)
);

create table asset_tags (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now()
);

-- Add FK from persons.primary_photo_asset_id to assets
alter table persons
  add constraint fk_persons_primary_photo
  foreign key (primary_photo_asset_id) references assets(id);
