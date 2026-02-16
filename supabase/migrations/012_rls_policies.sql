-- 012_rls_policies.sql
-- NOTE: On AWS RDS, access control is handled at the application level
-- via NextAuth session checks and household_id scoping in queries.
-- RLS policies below are optional and can be enabled if using
-- multiple database roles (e.g., a restricted app role).

-- Uncomment the following if you want RLS on RDS:
-- alter table households enable row level security;
-- alter table household_members enable row level security;
-- alter table profiles enable row level security;
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
