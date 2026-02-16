import { query, queryOne } from '@/lib/db';
import { generateEmbedding, buildPersonEmbeddingText } from '@/lib/embeddings';

interface UpdatePersonInput {
  person_id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  nickname?: string;
  sex?: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  birth_date?: string;
  birth_city?: string;
  birth_place?: string;
  birth_country_code?: string;
  death_date?: string;
  notes?: string;
  householdId: string;
  userId: string;
}

export async function updatePerson(input: UpdatePersonInput) {
  const { person_id, householdId, userId, birth_country_code, ...updates } = input;

  // Build dynamic SET clause from provided fields
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const fieldMap: Record<string, unknown> = { ...updates };
  fieldMap.updated_at = new Date().toISOString();

  // Resolve country code if provided
  if (birth_country_code) {
    const country = await queryOne<{ id: string }>(
      `SELECT id FROM countries WHERE code = $1`,
      [birth_country_code.toUpperCase()]
    );
    if (country) {
      fieldMap.birth_country_id = country.id;
    }
  }

  // Remove internal fields that are not DB columns
  delete fieldMap.householdId;
  delete fieldMap.userId;
  delete fieldMap.person_id;

  for (const [key, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No fields to update');
  }

  // Add WHERE clause params
  values.push(person_id);
  const personIdParam = paramIndex++;
  values.push(householdId);
  const householdIdParam = paramIndex++;

  const person = await queryOne<Record<string, unknown>>(
    `UPDATE persons
     SET ${setClauses.join(', ')}
     WHERE id = $${personIdParam} AND household_id = $${householdIdParam}
     RETURNING *`,
    values
  );

  if (!person) {
    throw new Error('Failed to update person: person not found');
  }

  // Re-generate embedding
  const embeddingText = buildPersonEmbeddingText(person as {
    first_name: string;
    last_name: string;
    nickname?: string;
    birth_year?: number;
    birth_city?: string;
    birth_place?: string;
    notes?: string;
  });
  const embedding = await generateEmbedding(embeddingText);
  const embeddingStr = `[${embedding.join(',')}]`;

  await query(
    `UPDATE persons SET embedding = $1::vector WHERE id = $2`,
    [embeddingStr, person_id]
  );

  // Update document chunks
  const doc = await queryOne<{ id: string }>(
    `SELECT id FROM documents WHERE source_table = 'persons' AND source_id = $1`,
    [person_id]
  );

  if (doc) {
    await query(
      `UPDATE document_chunks SET content = $1, embedding = $2::vector WHERE document_id = $3`,
      [embeddingText, embeddingStr, doc.id]
    );
  }

  return {
    success: true,
    person: {
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
    },
    message: `Updated ${person.first_name} ${person.last_name}.`,
  };
}
