import { supabaseAdmin } from '@/lib/supabase-server';

interface GetTimelineInput {
  year_from?: number;
  year_to?: number;
  householdId: string;
  userId: string;
}

export async function getTimeline(input: GetTimelineInput) {
  const { householdId, year_from, year_to } = input;

  let query = supabaseAdmin
    .from('family_timeline')
    .select('*')
    .eq('household_id', householdId)
    .order('sort_date', { ascending: true });

  if (year_from) {
    query = query.gte('event_year', year_from);
  }

  if (year_to) {
    query = query.lte('event_year', year_to);
  }

  const { data: timeline, error } = await query;

  if (error) {
    throw new Error(`Failed to get timeline: ${error.message}`);
  }

  return {
    timeline: (timeline || []).map((t: Record<string, unknown>) => ({
      year: t.event_year,
      date: t.sort_date,
      title: t.title,
      type: t.event_type,
      location: t.location,
      description: t.description,
      people: t.people_involved,
    })),
    count: timeline?.length || 0,
  };
}
