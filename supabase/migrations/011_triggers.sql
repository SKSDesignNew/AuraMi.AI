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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
