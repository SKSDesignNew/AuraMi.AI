-- 002_identity_access.sql
-- Profiles, households, members, invitations, household_links
-- NOTE: Profiles table replaces Supabase auth.users as the user reference

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
