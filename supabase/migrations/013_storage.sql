-- 013_storage.sql
-- Supabase Storage bucket and policies for family assets

insert into storage.buckets (id, name, public)
values ('family_assets', 'family_assets', false)
on conflict (id) do nothing;

-- Authenticated users can upload to their household folder
create policy "Authenticated users can upload assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'family_assets');

-- Authenticated users can view assets
create policy "Authenticated users can view assets"
  on storage.objects for select to authenticated
  using (bucket_id = 'family_assets');

-- Users can delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'family_assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
