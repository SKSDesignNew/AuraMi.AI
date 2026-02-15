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
