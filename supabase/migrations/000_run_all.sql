-- 001_extensions.sql
-- Enable required PostgreSQL extensions

create extension if not exists vector;
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
-- 002_identity_access.sql
-- Profiles, households, members, invitations, household_links

-- Profiles (user accounts — managed by NextAuth + Cognito)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Households
create table households (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Household members
create table household_members (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references profiles(id),
  role text not null check (role in ('owner', 'member')),
  status text not null default 'active' check (status in ('active', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- Invitations
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('owner', 'member')),
  invite_type text default 'member' check (invite_type in ('member', 'household')),
  link_person_id uuid, -- FK added after persons table created
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_by uuid references profiles(id),
  accepted_at timestamptz,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Household links (cross-household tree connections)
create table household_links (
  id uuid primary key default uuid_generate_v4(),
  household_a uuid not null references households(id) on delete cascade,
  household_b uuid not null references households(id) on delete cascade,
  person_a uuid, -- FK added after persons table created
  person_b uuid, -- FK added after persons table created
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  constraint no_self_link check (household_a <> household_b)
);

-- Prevent duplicate links (A→B same as B→A)
create unique index idx_unique_household_pair
  on household_links (least(household_a, household_b), greatest(household_a, household_b));
-- 003_people_relationships.sql
-- Persons, relationships, countries

-- Countries reference table
create table countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

-- Persons (family members / ancestors)
create table persons (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  external_ref text,
  first_name text not null,
  middle_name text,
  last_name text not null,
  nickname text,
  sex text check (sex in ('male', 'female', 'other')),
  birth_date date,
  birth_day integer,
  birth_month integer,
  birth_year integer,
  birth_place text,
  birth_city text,
  birth_country_id uuid references countries(id),
  death_date date,
  notes text,
  primary_photo_asset_id uuid, -- FK added after assets table created
  embedding vector,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Relationships (directed: from → to)
create table relationships (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  from_person_id uuid not null references persons(id) on delete cascade,
  to_person_id uuid not null references persons(id) on delete cascade,
  relation_type text not null check (relation_type in ('parent', 'child', 'spouse', 'sibling')),
  relation_label text,
  start_date date,
  end_date date,
  is_primary boolean not null default true,
  source text check (source in ('manual', 'sheets', 'import')),
  created_at timestamptz not null default now()
);

-- Add FK from invitations and household_links to persons
alter table invitations
  add constraint fk_invitations_link_person
  foreign key (link_person_id) references persons(id);

alter table household_links
  add constraint fk_household_links_person_a
  foreign key (person_a) references persons(id);

alter table household_links
  add constraint fk_household_links_person_b
  foreign key (person_b) references persons(id);
-- 004_events.sql
-- Events and event-person links

create table events (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  event_type text check (event_type in ('birth', 'death', 'marriage', 'migration', 'achievement', 'custom')),
  event_date date,
  event_year integer,
  location text,
  description text,
  external_ref text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table event_links (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  role text,
  created_at timestamptz not null default now()
);
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
  created_by uuid not null references profiles(id),
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
-- 006_stories.sql
-- Stories and story-person links

create table stories (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  content text not null,
  narrator_id uuid references persons(id),
  era text,
  location text,
  tags text[],
  embedding vector,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table story_persons (
  story_id uuid not null references stories(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  mention_type text default 'mentioned' check (mention_type in ('narrator', 'subject', 'mentioned')),
  primary key (story_id, person_id)
);
-- 007_ai_search.sql
-- Documents, document_chunks (RAG), chat sessions, chat messages

create table documents (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  doc_type text not null check (doc_type in ('person_bio', 'event_desc', 'story', 'asset_desc', 'note')),
  source_table text,
  source_id uuid,
  language text,
  created_at timestamptz not null default now()
);

create table document_chunks (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  metadata jsonb not null default '{}',
  embedding vector,
  created_at timestamptz not null default now()
);

create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb,
  created_at timestamptz not null default now()
);
-- 008_jobs_sync.sql
-- Background jobs and Google Sheets sync

create table ingestion_jobs (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  source_type text not null check (source_type in ('asset_upload', 'sheets_sync', 'bulk_import', 'story_embed')),
  source_asset_id uuid references assets(id),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error text,
  created_by uuid not null references profiles(id),
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
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  primary key (household_id, sheet_id)
);
-- 009_views.sql
-- Pre-computed views for person summaries and family timeline

create or replace view person_summary as
select
  p.id,
  p.household_id,
  (p.first_name || ' ' || p.last_name) as full_name,
  p.nickname,
  p.sex,
  p.birth_year,
  p.birth_place,
  p.birth_city,
  c.name as birth_country,
  (p.death_date is not null) as is_deceased,
  coalesce(r.relationship_count, 0) as relationship_count,
  coalesce(el.event_count, 0) as event_count,
  coalesce(ap.photo_count, 0) as photo_count
from persons p
left join countries c on p.birth_country_id = c.id
left join lateral (
  select count(*) as relationship_count
  from relationships
  where from_person_id = p.id or to_person_id = p.id
) r on true
left join lateral (
  select count(*) as event_count
  from event_links
  where person_id = p.id
) el on true
left join lateral (
  select count(*) as photo_count
  from asset_persons
  where person_id = p.id
) ap on true;

create or replace view family_timeline as
select
  e.household_id,
  coalesce(e.event_date, make_date(coalesce(e.event_year, 1900), 1, 1)) as sort_date,
  e.event_year,
  e.title,
  e.event_type,
  e.location,
  e.description,
  array_agg(distinct (p.first_name || ' ' || p.last_name)) filter (where p.id is not null) as people_involved
from events e
left join event_links el on el.event_id = e.id
left join persons p on p.id = el.person_id
group by e.id, e.household_id, e.event_date, e.event_year, e.title, e.event_type, e.location, e.description
order by sort_date;
-- 010_functions.sql
-- All database functions for cross-household queries and operations

-- Get all household IDs directly linked to a given household (1 hop only)
create or replace function get_linked_household_ids(input_household_id uuid)
returns uuid[]
language sql stable
as $$
  select array_agg(linked_id)
  from (
    select household_b as linked_id
    from household_links
    where household_a = input_household_id and status = 'active'
    union
    select household_a as linked_id
    from household_links
    where household_b = input_household_id and status = 'active'
  ) sub;
$$;

-- Semantic search across household + linked households
create or replace function search_family_across_households(
  input_household_id uuid,
  query_embedding vector,
  match_threshold float default 0.65,
  match_count int default 10
)
returns table (
  id uuid,
  content text,
  source_type text,
  source_id uuid,
  household_id uuid,
  similarity float
)
language sql stable
as $$
  with allowed_households as (
    select input_household_id as hid
    union all
    select unnest(get_linked_household_ids(input_household_id))
  )
  select
    dc.id,
    dc.content,
    d.doc_type as source_type,
    d.source_id,
    dc.household_id,
    (1 - (dc.embedding <=> query_embedding))::float as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where dc.household_id in (select hid from allowed_households)
    and dc.embedding is not null
    and (1 - (dc.embedding <=> query_embedding)) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- Get persons across household + linked households
create or replace function get_persons_across_households(input_household_id uuid)
returns table (
  id uuid,
  household_id uuid,
  first_name text,
  last_name text,
  nickname text,
  sex text,
  birth_year integer,
  birth_place text,
  birth_city text,
  death_date date,
  notes text,
  is_linked boolean
)
language sql stable
as $$
  with allowed_households as (
    select input_household_id as hid, false as is_linked_hh
    union all
    select unnest(get_linked_household_ids(input_household_id)), true
  )
  select
    p.id,
    p.household_id,
    p.first_name,
    p.last_name,
    p.nickname,
    p.sex,
    p.birth_year,
    p.birth_place,
    p.birth_city,
    p.death_date,
    p.notes,
    ah.is_linked_hh as is_linked
  from persons p
  join allowed_households ah on p.household_id = ah.hid;
$$;

-- Get relationships across household + linked households
create or replace function get_relationships_across_households(input_household_id uuid)
returns table (
  id uuid,
  household_id uuid,
  from_person_id uuid,
  to_person_id uuid,
  relation_type text,
  relation_label text,
  start_date date,
  end_date date,
  is_linked boolean
)
language sql stable
as $$
  with allowed_households as (
    select input_household_id as hid, false as is_linked_hh
    union all
    select unnest(get_linked_household_ids(input_household_id)), true
  )
  select
    r.id,
    r.household_id,
    r.from_person_id,
    r.to_person_id,
    r.relation_type,
    r.relation_label,
    r.start_date,
    r.end_date,
    ah.is_linked_hh as is_linked
  from relationships r
  join allowed_households ah on r.household_id = ah.hid;
$$;

-- Activate a pending household link
create or replace function activate_household_link(link_id uuid)
returns void
language plpgsql
as $$
begin
  update household_links
  set status = 'active', activated_at = now()
  where id = link_id and status = 'pending';
end;
$$;

-- Revoke an active household link
create or replace function revoke_household_link(link_id uuid)
returns void
language plpgsql
as $$
begin
  update household_links
  set status = 'revoked'
  where id = link_id and status = 'active';
end;
$$;
-- 011_triggers.sql
-- Household member limit and single owner enforcement

-- Enforce max 5 active members per household
create or replace function enforce_household_member_limit()
returns trigger
language plpgsql
as $$
declare
  member_count integer;
begin
  if NEW.status = 'active' then
    select count(*) into member_count
    from household_members
    where household_id = NEW.household_id
      and status = 'active';

    if member_count >= 5 then
      raise exception 'Household already has the maximum of 5 active members.';
    end if;
  end if;

  return NEW;
end;
$$;

create trigger check_household_limit
  before insert on household_members
  for each row
  execute function enforce_household_member_limit();

-- Enforce exactly 1 owner per household
create or replace function enforce_single_owner()
returns trigger
language plpgsql
as $$
declare
  owner_count integer;
begin
  if NEW.role = 'owner' and NEW.status = 'active' then
    select count(*) into owner_count
    from household_members
    where household_id = NEW.household_id
      and role = 'owner'
      and status = 'active'
      and id <> coalesce(NEW.id, uuid_generate_v4());

    if owner_count >= 1 then
      raise exception 'Household already has an active owner.';
    end if;
  end if;

  return NEW;
end;
$$;

create trigger check_single_owner
  before insert or update on household_members
  for each row
  execute function enforce_single_owner();

-- Auto-create profile on auth signup
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email)
  values (NEW.id, NEW.email)
  on conflict (id) do nothing;
  return NEW;
end;
$$;

-- NOTE: Profile creation is handled by NextAuth callbacks (no auth.users trigger needed)
-- 012_rls_policies.sql
-- Row Level Security policies for all tables

-- Enable RLS on all tables
alter table households enable row level security;
alter table household_members enable row level security;
alter table profiles enable row level security;
alter table invitations enable row level security;
alter table household_links enable row level security;
alter table countries enable row level security;
alter table persons enable row level security;
alter table relationships enable row level security;
alter table events enable row level security;
alter table event_links enable row level security;
alter table assets enable row level security;
alter table asset_persons enable row level security;
alter table asset_tags enable row level security;
alter table stories enable row level security;
alter table story_persons enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table ingestion_jobs enable row level security;
alter table household_sheets enable row level security;

-- Helper: get user's household IDs
create or replace function get_user_household_ids()
returns setof uuid
language sql stable security definer
as $$
  select household_id
  from household_members
  where user_id = auth.uid()
    and status = 'active';
$$;

-- Countries: readable by all authenticated users
create policy "Countries are readable by authenticated users"
  on countries for select to authenticated using (true);

-- Profiles: users can read and update their own profile
create policy "Users can read own profile"
  on profiles for select to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update to authenticated
  using (id = auth.uid());

-- Households: members can read their household
create policy "Members can read their household"
  on households for select to authenticated
  using (id in (select get_user_household_ids()));

create policy "Authenticated users can create households"
  on households for insert to authenticated
  with check (created_by = auth.uid());

-- Household members: members can read their household's members
create policy "Members can read household members"
  on household_members for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Owners can insert household members"
  on household_members for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Invitations
create policy "Members can read household invitations"
  on invitations for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Owners can create invitations"
  on invitations for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Household links
create policy "Members can read their household links"
  on household_links for select to authenticated
  using (
    household_a in (select get_user_household_ids())
    or household_b in (select get_user_household_ids())
  );

create policy "Owners can create household links"
  on household_links for insert to authenticated
  with check (
    household_a in (select get_user_household_ids())
    or household_b in (select get_user_household_ids())
  );

create policy "Owners can update household links"
  on household_links for update to authenticated
  using (
    household_a in (select get_user_household_ids())
    or household_b in (select get_user_household_ids())
  );

-- Persons: read own + linked households, write own only
create policy "Members can read persons in their household"
  on persons for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert persons in their household"
  on persons for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

create policy "Members can update persons in their household"
  on persons for update to authenticated
  using (household_id in (select get_user_household_ids()));

-- Relationships
create policy "Members can read relationships"
  on relationships for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert relationships"
  on relationships for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Events
create policy "Members can read events"
  on events for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert events"
  on events for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Event links
create policy "Members can read event links"
  on event_links for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert event links"
  on event_links for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Assets
create policy "Members can read assets"
  on assets for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert assets"
  on assets for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Asset persons
create policy "Members can read asset persons"
  on asset_persons for select to authenticated
  using (
    asset_id in (select id from assets where household_id in (select get_user_household_ids()))
  );

create policy "Members can insert asset persons"
  on asset_persons for insert to authenticated
  with check (
    asset_id in (select id from assets where household_id in (select get_user_household_ids()))
  );

-- Asset tags
create policy "Members can read asset tags"
  on asset_tags for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert asset tags"
  on asset_tags for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Stories
create policy "Members can read stories"
  on stories for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert stories"
  on stories for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Story persons
create policy "Members can read story persons"
  on story_persons for select to authenticated
  using (
    story_id in (select id from stories where household_id in (select get_user_household_ids()))
  );

create policy "Members can insert story persons"
  on story_persons for insert to authenticated
  with check (
    story_id in (select id from stories where household_id in (select get_user_household_ids()))
  );

-- Documents
create policy "Members can read documents"
  on documents for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert documents"
  on documents for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Document chunks
create policy "Members can read document chunks"
  on document_chunks for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert document chunks"
  on document_chunks for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Chat sessions
create policy "Members can read chat sessions"
  on chat_sessions for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert chat sessions"
  on chat_sessions for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Chat messages
create policy "Members can read chat messages"
  on chat_messages for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert chat messages"
  on chat_messages for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Ingestion jobs
create policy "Members can read ingestion jobs"
  on ingestion_jobs for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert ingestion jobs"
  on ingestion_jobs for insert to authenticated
  with check (household_id in (select get_user_household_ids()));

-- Household sheets
create policy "Members can read household sheets"
  on household_sheets for select to authenticated
  using (household_id in (select get_user_household_ids()));

create policy "Members can insert household sheets"
  on household_sheets for insert to authenticated
  with check (household_id in (select get_user_household_ids()));
-- 013_storage.sql
-- Supabase Storage bucket and policies for family assets

insert into storage.buckets (id, name, public)
values ('family_assets', 'family_assets', false)
on conflict (id) do nothing;

-- Authenticated users can upload to their household folder
create policy "Authenticated users can upload assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'family_assets');

-- Authenticated users can view assets
create policy "Authenticated users can view assets"
  on storage.objects for select to authenticated
  using (bucket_id = 'family_assets');

-- Users can delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'family_assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
-- 014_indexes.sql
-- Performance indexes including pgvector

-- Persons
create index idx_persons_household on persons(household_id);
create index idx_persons_name on persons using gin ((first_name || ' ' || last_name) gin_trgm_ops);
create index idx_persons_external_ref on persons(household_id, external_ref) where external_ref is not null;

-- Relationships
create index idx_relationships_household on relationships(household_id);
create index idx_relationships_from on relationships(from_person_id);
create index idx_relationships_to on relationships(to_person_id);
create index idx_relationships_persons on relationships(from_person_id, to_person_id);

-- Events
create index idx_events_household on events(household_id);
create index idx_events_type on events(household_id, event_type);
create index idx_events_year on events(household_id, event_year);

-- Event links
create index idx_event_links_event on event_links(event_id);
create index idx_event_links_person on event_links(person_id);

-- Assets
create index idx_assets_household on assets(household_id);
create index idx_assets_type on assets(household_id, asset_type);

-- Asset persons
create index idx_asset_persons_person on asset_persons(person_id);

-- Stories
create index idx_stories_household on stories(household_id);

-- Story persons
create index idx_story_persons_person on story_persons(person_id);

-- Documents
create index idx_documents_household on documents(household_id);
create index idx_documents_source on documents(source_table, source_id);

-- Document chunks
create index idx_document_chunks_document on document_chunks(document_id);
create index idx_document_chunks_household on document_chunks(household_id);

-- Chat
create index idx_chat_sessions_household on chat_sessions(household_id);
create index idx_chat_messages_session on chat_messages(session_id);
create index idx_chat_messages_created on chat_messages(session_id, created_at);

-- Household members
create index idx_household_members_user on household_members(user_id);
create index idx_household_members_household on household_members(household_id);

-- Household links
create index idx_household_links_a on household_links(household_a);
create index idx_household_links_b on household_links(household_b);

-- pgvector indexes (using ivfflat for approximate nearest neighbor)
-- Note: These require at least some data to be present before they work well.
-- For small datasets (<1000 rows), exact search (no index) is fine.
-- Uncomment these after you have enough data:
--
-- create index idx_document_chunks_embedding on document_chunks
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);
-- create index idx_persons_embedding on persons
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);
-- create index idx_stories_embedding on stories
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);
-- create index idx_assets_embedding on assets
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);
