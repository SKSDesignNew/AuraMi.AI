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
