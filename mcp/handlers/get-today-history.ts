import { query } from '@/lib/db';

interface GetTodayHistoryInput {
  householdId: string;
  userId: string;
}

export async function getTodayHistory(input: GetTodayHistoryInput) {
  const { householdId } = input;

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Run all three queries in parallel
  const [todayEvents, births, todayDeaths] = await Promise.all([
    // Events on this day
    query<Record<string, unknown>>(
      `SELECT e.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'person_id', el.person_id,
                    'role', el.role,
                    'name', p.first_name || ' ' || p.last_name
                  )
                ) FILTER (WHERE el.id IS NOT NULL),
                '[]'::json
              ) AS people
       FROM events e
       LEFT JOIN event_links el ON el.event_id = e.id
       LEFT JOIN persons p ON p.id = el.person_id
       WHERE e.household_id = $1
         AND e.event_date IS NOT NULL
         AND EXTRACT(MONTH FROM e.event_date) = $2
         AND EXTRACT(DAY FROM e.event_date) = $3
       GROUP BY e.id`,
      [householdId, month, day]
    ),

    // Births on this day
    query<{ id: string; first_name: string; last_name: string; birth_year: number | null }>(
      `SELECT id, first_name, last_name, birth_year
       FROM persons
       WHERE household_id = $1 AND birth_month = $2 AND birth_day = $3`,
      [householdId, month, day]
    ),

    // Deaths on this day
    query<{ id: string; first_name: string; last_name: string; death_date: string }>(
      `SELECT id, first_name, last_name, death_date
       FROM persons
       WHERE household_id = $1
         AND death_date IS NOT NULL
         AND EXTRACT(MONTH FROM death_date) = $2
         AND EXTRACT(DAY FROM death_date) = $3`,
      [householdId, month, day]
    ),
  ]);

  return {
    date: `${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    events_on_this_day: todayEvents.map((e) => ({
      title: e.title,
      type: e.event_type,
      year: new Date(e.event_date as string).getFullYear(),
      location: e.location,
    })),
    births_on_this_day: births.map((p) => ({
      name: `${p.first_name} ${p.last_name}`,
      year: p.birth_year,
    })),
    deaths_on_this_day: todayDeaths.map((p) => ({
      name: `${p.first_name} ${p.last_name}`,
      year: new Date(p.death_date).getFullYear(),
    })),
  };
}
