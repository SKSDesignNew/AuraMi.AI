import { supabaseAdmin } from '@/lib/supabase-server';

interface GetEventsInput {
  person_id?: string;
  event_type?: string;
  year_from?: number;
  year_to?: number;
  keyword?: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function getEvents(input: GetEventsInput) {
  const { householdId, person_id, event_type, year_from, year_to, keyword, limit = 20 } = input;

  let query = supabaseAdmin
    .from('events')
    .select('*, event_links(person_id, role, person:persons(first_name, last_name))')
    .eq('household_id', householdId)
    .order('event_date', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (event_type) {
    query = query.eq('event_type', event_type);
  }

  if (year_from) {
    query = query.gte('event_year', year_from);
  }

  if (year_to) {
    query = query.lte('event_year', year_to);
  }

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }

  const { data: events, error } = await query;

  if (error) {
    throw new Error(`Failed to get events: ${error.message}`);
  }

  let results = events || [];

  // Filter by person if specified
  if (person_id) {
    results = results.filter((e: Record<string, unknown>) =>
      (e.event_links as Array<Record<string, unknown>>)?.some(
        (l) => l.person_id === person_id
      )
    );
  }

  return {
    events: results.map((e: Record<string, unknown>) => ({
      id: e.id,
      title: e.title,
      event_type: e.event_type,
      event_date: e.event_date,
      event_year: e.event_year,
      location: e.location,
      description: e.description,
      people: (e.event_links as Array<Record<string, unknown>>)?.map((l) => ({
        person_id: l.person_id,
        role: l.role,
        name: l.person
          ? `${(l.person as Record<string, string>).first_name} ${(l.person as Record<string, string>).last_name}`
          : null,
      })),
    })),
    count: results.length,
  };
}
