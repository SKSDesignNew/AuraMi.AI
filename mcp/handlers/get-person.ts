import { query, queryOne } from '@/lib/db';

interface GetPersonInput {
  person_id?: string;
  name?: string;
  householdId: string;
  userId: string;
}

export async function getPerson(input: GetPersonInput) {
  const { person_id, name, householdId } = input;

  let person: Record<string, unknown> | null = null;

  if (person_id) {
    person = await queryOne(
      `SELECT * FROM persons WHERE id = $1 AND household_id = $2`,
      [person_id, householdId]
    );

    if (!person) throw new Error('Person not found');
  } else if (name) {
    const searchPattern = `%${name}%`;
    const matches = await query<Record<string, unknown>>(
      `SELECT * FROM persons
       WHERE household_id = $1
         AND (first_name ILIKE $2 OR last_name ILIKE $2 OR nickname ILIKE $2)
       LIMIT 5`,
      [householdId, searchPattern]
    );

    if (!matches || matches.length === 0) {
      return { found: false, message: `No person found matching "${name}"` };
    }
    if (matches.length > 1) {
      return {
        found: true,
        multiple: true,
        matches: matches.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          nickname: p.nickname,
          birth_year: p.birth_year,
        })),
        message: 'Multiple matches found. Please specify which person.',
      };
    }
    person = matches[0];
  } else {
    throw new Error('Either person_id or name is required');
  }

  // Fetch related data in parallel
  const [relationships, events, stories, photos] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT r.*,
              json_build_object('id', fp.id, 'first_name', fp.first_name, 'last_name', fp.last_name) AS from_person,
              json_build_object('id', tp.id, 'first_name', tp.first_name, 'last_name', tp.last_name) AS to_person
       FROM relationships r
       JOIN persons fp ON fp.id = r.from_person_id
       JOIN persons tp ON tp.id = r.to_person_id
       WHERE r.household_id = $1
         AND (r.from_person_id = $2 OR r.to_person_id = $2)`,
      [householdId, person.id]
    ),
    query<Record<string, unknown>>(
      `SELECT el.role, row_to_json(e.*) AS event
       FROM event_links el
       JOIN events e ON e.id = el.event_id
       WHERE el.household_id = $1 AND el.person_id = $2`,
      [householdId, person.id]
    ),
    query<Record<string, unknown>>(
      `SELECT sp.mention_type, row_to_json(s.*) AS story
       FROM story_persons sp
       JOIN stories s ON s.id = sp.story_id
       WHERE sp.person_id = $1`,
      [person.id]
    ),
    query<Record<string, unknown>>(
      `SELECT ap.is_primary, row_to_json(a.*) AS asset
       FROM asset_persons ap
       JOIN assets a ON a.id = ap.asset_id
       WHERE ap.person_id = $1`,
      [person.id]
    ),
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
    relationships,
    events,
    stories,
    photos,
  };
}
