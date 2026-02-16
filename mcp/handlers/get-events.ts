import { query } from '@/lib/db';

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

  // Build dynamic WHERE clause
  const conditions: string[] = ['e.household_id = $1'];
  const values: unknown[] = [householdId];
  let paramIndex = 2;

  if (event_type) {
    conditions.push(`e.event_type = $${paramIndex++}`);
    values.push(event_type);
  }

  if (year_from) {
    conditions.push(`e.event_year >= $${paramIndex++}`);
    values.push(year_from);
  }

  if (year_to) {
    conditions.push(`e.event_year <= $${paramIndex++}`);
    values.push(year_to);
  }

  if (keyword) {
    const searchPattern = `%${keyword}%`;
    conditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`);
    values.push(searchPattern);
    paramIndex++;
  }

  if (person_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM event_links el WHERE el.event_id = e.id AND el.person_id = $${paramIndex}
    )`);
    values.push(person_id);
    paramIndex++;
  }

  values.push(limit);
  const limitParam = paramIndex;

  const events = await query<Record<string, unknown>>(
    `SELECT e.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'person_id', el.person_id,
                  'role', el.role,
                  'name', CASE WHEN p.id IS NOT NULL
                    THEN p.first_name || ' ' || p.last_name
                    ELSE NULL
                  END
                )
              ) FILTER (WHERE el.id IS NOT NULL),
              '[]'::json
            ) AS people
     FROM events e
     LEFT JOIN event_links el ON el.event_id = e.id
     LEFT JOIN persons p ON p.id = el.person_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY e.id
     ORDER BY e.event_date DESC NULLS LAST
     LIMIT $${limitParam}`,
    values
  );

  return {
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      event_type: e.event_type,
      event_date: e.event_date,
      event_year: e.event_year,
      location: e.location,
      description: e.description,
      people: e.people,
    })),
    count: events.length,
  };
}
