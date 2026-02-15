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
  created_by uuid not null references auth.users(id),
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
