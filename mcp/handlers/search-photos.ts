import { supabaseAdmin } from '@/lib/supabase-server';

interface SearchPhotosInput {
  person_id?: string;
  event_id?: string;
  tag?: string;
  year?: number;
  keyword?: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchPhotos(input: SearchPhotosInput) {
  const { householdId, person_id, event_id, tag, year, keyword, limit = 20 } = input;

  let query = supabaseAdmin
    .from('assets')
    .select(
      '*, asset_persons(person_id, is_primary, person:persons(first_name, last_name)), asset_tags(tag)'
    )
    .eq('household_id', householdId)
    .order('captured_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (event_id) {
    query = query.eq('linked_event_id', event_id);
  }

  if (year) {
    query = query.eq('year', year);
  }

  if (keyword) {
    query = query.or(
      `description.ilike.%${keyword}%,original_filename.ilike.%${keyword}%`
    );
  }

  const { data: assets, error } = await query;

  if (error) {
    throw new Error(`Failed to search photos: ${error.message}`);
  }

  let results = assets || [];

  // Filter by person
  if (person_id) {
    results = results.filter((a: Record<string, unknown>) =>
      (a.asset_persons as Array<Record<string, unknown>>)?.some(
        (ap) => ap.person_id === person_id
      )
    );
  }

  // Filter by tag
  if (tag) {
    results = results.filter((a: Record<string, unknown>) =>
      (a.asset_tags as Array<Record<string, string>>)?.some(
        (at) => at.tag.toLowerCase() === tag.toLowerCase()
      )
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return {
    assets: results.map((a: Record<string, unknown>) => ({
      id: a.id,
      type: a.asset_type,
      description: a.description,
      captured_at: a.captured_at,
      year: a.year,
      url: `${supabaseUrl}/storage/v1/object/public/${a.storage_bucket}/${a.storage_path}`,
      people: (a.asset_persons as Array<Record<string, unknown>>)?.map((ap) => ({
        person_id: ap.person_id,
        name: ap.person
          ? `${(ap.person as Record<string, string>).first_name} ${(ap.person as Record<string, string>).last_name}`
          : null,
      })),
      tags: (a.asset_tags as Array<Record<string, string>>)?.map((at) => at.tag),
    })),
    count: results.length,
  };
}
