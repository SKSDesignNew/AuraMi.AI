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
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table story_persons (
  story_id uuid not null references stories(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  mention_type text default 'mentioned' check (mention_type in ('narrator', 'subject', 'mentioned')),
  primary key (story_id, person_id)
);
