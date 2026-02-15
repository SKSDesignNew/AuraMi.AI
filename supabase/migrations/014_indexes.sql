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
