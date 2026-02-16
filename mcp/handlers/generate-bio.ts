import { query, queryOne } from '@/lib/db';
import { anthropic } from '@/lib/claude';

interface GenerateBioInput {
  person_id: string;
  householdId: string;
  userId: string;
}

export async function generateBio(input: GenerateBioInput) {
  const { person_id, householdId } = input;

  // Gather all data about this person in parallel
  const [person, relationships, events, stories] = await Promise.all([
    queryOne<Record<string, unknown>>(
      `SELECT * FROM persons WHERE id = $1 AND household_id = $2`,
      [person_id, householdId]
    ),
    query<Record<string, unknown>>(
      `SELECT r.*,
              json_build_object('first_name', fp.first_name, 'last_name', fp.last_name) AS from_person,
              json_build_object('first_name', tp.first_name, 'last_name', tp.last_name) AS to_person
       FROM relationships r
       JOIN persons fp ON fp.id = r.from_person_id
       JOIN persons tp ON tp.id = r.to_person_id
       WHERE r.household_id = $1
         AND (r.from_person_id = $2 OR r.to_person_id = $2)`,
      [householdId, person_id]
    ),
    query<Record<string, unknown>>(
      `SELECT el.role,
              json_build_object(
                'title', e.title, 'event_type', e.event_type,
                'event_date', e.event_date, 'event_year', e.event_year,
                'location', e.location, 'description', e.description
              ) AS event
       FROM event_links el
       JOIN events e ON e.id = el.event_id
       WHERE el.person_id = $1`,
      [person_id]
    ),
    query<Record<string, unknown>>(
      `SELECT sp.mention_type,
              json_build_object(
                'title', s.title, 'content', s.content,
                'era', s.era, 'location', s.location
              ) AS story
       FROM story_persons sp
       JOIN stories s ON s.id = sp.story_id
       WHERE sp.person_id = $1`,
      [person_id]
    ),
  ]);

  if (!person) {
    throw new Error('Person not found');
  }

  const dataContext = JSON.stringify(
    { person, relationships, events, stories },
    null,
    2
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Write a warm, narrative biography for this family member based on the data below. Write in third person, 2-3 paragraphs. Include relationships, events, and stories if available. Be respectful and celebratory of their life.\n\nData:\n${dataContext}`,
      },
    ],
  });

  const bio = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n');

  return {
    person_id,
    name: `${person.first_name} ${person.last_name}`,
    biography: bio,
  };
}
