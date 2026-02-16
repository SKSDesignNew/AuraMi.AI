import { query } from '@/lib/db';

interface GetTimelineInput {
  year_from?: number;
  year_to?: number;
  householdId: string;
  userId: string;
}

export async function getTimeline(input: GetTimelineInput) {
  const { householdId, year_from, year_to } = input;

  const conditions: string[] = ['household_id = $1'];
  const values: unknown[] = [householdId];
  let paramIndex = 2;

  if (year_from) {
    conditions.push(`event_year >= $${paramIndex++}`);
    values.push(year_from);
  }

  if (year_to) {
    conditions.push(`event_year <= $${paramIndex++}`);
    values.push(year_to);
  }

  const timeline = await query<Record<string, unknown>>(
    `SELECT *
     FROM family_timeline
     WHERE ${conditions.join(' AND ')}
     ORDER BY sort_date ASC`,
    values
  );

  return {
    timeline: timeline.map((t) => ({
      year: t.event_year,
      date: t.sort_date,
      title: t.title,
      type: t.event_type,
      location: t.location,
      description: t.description,
      people: t.people_involved,
    })),
    count: timeline.length,
  };
}
