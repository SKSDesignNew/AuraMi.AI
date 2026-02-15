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
