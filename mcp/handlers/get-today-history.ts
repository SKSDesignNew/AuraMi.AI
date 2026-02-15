import { supabaseAdmin } from '@/lib/supabase-server';

interface GetTodayHistoryInput {
  householdId: string;
  userId: string;
}

export async function getTodayHistory(input: GetTodayHistoryInput) {
  const { householdId } = input;

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Events on this day
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*, event_links(person_id, role, person:persons(first_name, last_name))')
    .eq('household_id', householdId)
    .not('event_date', 'is', null);

  const todayEvents = (events || []).filter((e: Record<string, unknown>) => {
    const d = new Date(e.event_date as string);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });

  // Births on this day
  const { data: births } = await supabaseAdmin
    .from('persons')
    .select('id, first_name, last_name, birth_date, birth_month, birth_day, birth_year')
    .eq('household_id', householdId)
    .eq('birth_month', month)
    .eq('birth_day', day);

  // Deaths on this day
  const { data: allPersons } = await supabaseAdmin
    .from('persons')
    .select('id, first_name, last_name, death_date')
    .eq('household_id', householdId)
    .not('death_date', 'is', null);

  const todayDeaths = (allPersons || []).filter((p: Record<string, unknown>) => {
    const d = new Date(p.death_date as string);
    return d.getMonth() + 1 === month && d.getDate() === day;
  });

  return {
    date: `${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    events_on_this_day: todayEvents.map((e: Record<string, unknown>) => ({
      title: e.title,
      type: e.event_type,
      year: new Date(e.event_date as string).getFullYear(),
      location: e.location,
    })),
    births_on_this_day: (births || []).map((p: Record<string, unknown>) => ({
      name: `${p.first_name} ${p.last_name}`,
      year: p.birth_year,
    })),
    deaths_on_this_day: todayDeaths.map((p: Record<string, unknown>) => ({
      name: `${p.first_name} ${p.last_name}`,
      year: new Date(p.death_date as string).getFullYear(),
    })),
  };
}
