import { supabaseAdmin } from '@/lib/supabase-server';

interface GetPersonInput {
  person_id?: string;
  name?: string;
  householdId: string;
  userId: string;
}

export async function getPerson(input: GetPersonInput) {
  const { person_id, name, householdId } = input;

  let person;

  if (person_id) {
    const { data, error } = await supabaseAdmin
      .from('persons')
      .select('*')
      .eq('id', person_id)
      .eq('household_id', householdId)
      .single();

    if (error) throw new Error(`Person not found: ${error.message}`);
    person = data;
  } else if (name) {
    const { data, error } = await supabaseAdmin
      .from('persons')
      .select('*')
      .eq('household_id', householdId)
      .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%,nickname.ilike.%${name}%`)
      .limit(5);

    if (error) throw new Error(`Search failed: ${error.message}`);
    if (!data || data.length === 0) {
      return { found: false, message: `No person found matching "${name}"` };
    }
    if (data.length > 1) {
      return {
        found: true,
        multiple: true,
        matches: data.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          nickname: p.nickname,
          birth_year: p.birth_year,
        })),
        message: 'Multiple matches found. Please specify which person.',
      };
    }
    person = data[0];
  } else {
    throw new Error('Either person_id or name is required');
  }

  // Fetch related data in parallel
  const [relationships, events, stories, photos] = await Promise.all([
    supabaseAdmin
      .from('relationships')
      .select('*, from_person:persons!relationships_from_person_id_fkey(id, first_name, last_name), to_person:persons!relationships_to_person_id_fkey(id, first_name, last_name)')
      .eq('household_id', householdId)
      .or(`from_person_id.eq.${person.id},to_person_id.eq.${person.id}`),
    supabaseAdmin
      .from('event_links')
      .select('role, event:events(*)')
      .eq('household_id', householdId)
      .eq('person_id', person.id),
    supabaseAdmin
      .from('story_persons')
      .select('mention_type, story:stories(*)')
      .eq('person_id', person.id),
    supabaseAdmin
      .from('asset_persons')
      .select('is_primary, asset:assets(*)')
      .eq('person_id', person.id),
  ]);

  return {
    found: true,
    person: {
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      middle_name: person.middle_name,
      nickname: person.nickname,
      sex: person.sex,
      birth_date: person.birth_date,
      birth_year: person.birth_year,
      birth_month: person.birth_month,
      birth_day: person.birth_day,
      birth_city: person.birth_city,
      birth_place: person.birth_place,
      death_date: person.death_date,
      notes: person.notes,
    },
    relationships: relationships.data || [],
    events: events.data || [],
    stories: stories.data || [],
    photos: photos.data || [],
  };
}
