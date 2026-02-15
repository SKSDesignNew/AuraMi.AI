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
