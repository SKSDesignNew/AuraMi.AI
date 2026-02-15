import { query, queryOne } from '@/lib/db';

interface AddEventInput {
  title: string;
  event_type?: string;
  event_date?: string;
  event_year?: number;
  location?: string;
  description?: string;
  person_ids?: string[];
  roles?: string[];
  householdId: string;
  userId: string;
}

export async function addEvent(input: AddEventInput) {
  const { householdId, userId, person_ids, roles, ...eventData } = input;

  const event = await queryOne<Record<string, unknown>>(
    `INSERT INTO events (
       household_id, title, event_type, event_date, event_year,
       location, description, created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      householdId,
      eventData.title,
      eventData.event_type || null,
      eventData.event_date || null,
      eventData.event_year || null,
      eventData.location || null,
      eventData.description || null,
      userId,
    ]
  );

  if (!event) {
    throw new Error('Failed to add event');
  }

  // Link persons to the event
  if (person_ids && person_ids.length > 0) {
    const valuePlaceholders: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (let i = 0; i < person_ids.length; i++) {
      valuePlaceholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      values.push(householdId, event.id, person_ids[i], roles?.[i] || null);
    }

    await query(
      `INSERT INTO event_links (household_id, event_id, person_id, role)
       VALUES ${valuePlaceholders.join(', ')}`,
      values
    );
  }

  return {
    success: true,
    event: {
      id: event.id,
      title: event.title,
      event_type: event.event_type,
      event_date: event.event_date,
      location: event.location,
    },
    message: `Recorded event: "${event.title}".`,
  };
}
