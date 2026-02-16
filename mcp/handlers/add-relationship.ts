import { queryOne } from '@/lib/db';

interface AddRelationshipInput {
  from_person_id: string;
  to_person_id: string;
  relation_type: string;
  relation_label?: string;
  start_date?: string;
  householdId: string;
  userId: string;
}

export async function addRelationship(input: AddRelationshipInput) {
  const { householdId, userId, ...relData } = input;

  // Insert relationship and fetch related person names in one go
  const relationship = await queryOne<Record<string, unknown>>(
    `INSERT INTO relationships (
       household_id, from_person_id, to_person_id, relation_type,
       relation_label, start_date, source
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      householdId,
      relData.from_person_id,
      relData.to_person_id,
      relData.relation_type,
      relData.relation_label || null,
      relData.start_date || null,
      'manual',
    ]
  );

  if (!relationship) {
    throw new Error('Failed to add relationship');
  }

  // Fetch person names
  const fromPerson = await queryOne<{ first_name: string; last_name: string }>(
    `SELECT first_name, last_name FROM persons WHERE id = $1`,
    [relData.from_person_id]
  );

  const toPerson = await queryOne<{ first_name: string; last_name: string }>(
    `SELECT first_name, last_name FROM persons WHERE id = $1`,
    [relData.to_person_id]
  );

  const fromName = fromPerson ? `${fromPerson.first_name} ${fromPerson.last_name}` : 'Unknown';
  const toName = toPerson ? `${toPerson.first_name} ${toPerson.last_name}` : 'Unknown';

  return {
    success: true,
    relationship: {
      id: relationship.id,
      from: fromName,
      to: toName,
      type: relationship.relation_type,
      label: relationship.relation_label,
    },
    message: `Linked ${fromName} as ${relationship.relation_type} of ${toName}.`,
  };
}
