import { query, queryOne } from '@/lib/db';
import { generateEmbedding, buildPersonEmbeddingText } from '@/lib/embeddings';

interface AddPersonInput {
  first_name: string;
  last_name: string;
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

export async function addPerson(input: AddPersonInput) {
  const { householdId, userId, birth_country_code, ...personData } = input;

  // Resolve country code to country ID
  let birth_country_id: string | null = null;
  if (birth_country_code) {
    const country = await queryOne<{ id: string }>(
      `SELECT id FROM countries WHERE code = $1`,
      [birth_country_code.toUpperCase()]
    );
    birth_country_id = country?.id || null;
  }

  // Generate embedding
  const embeddingText = buildPersonEmbeddingText(personData);
  const embedding = await generateEmbedding(embeddingText);
  const embeddingStr = `[${embedding.join(',')}]`;

  // Insert person
  const person = await queryOne<Record<string, unknown>>(
    `INSERT INTO persons (
       household_id, first_name, last_name, middle_name, nickname,
       sex, birth_year, birth_month, birth_day, birth_date,
       birth_city, birth_place, birth_country_id, death_date,
       notes, embedding, created_by
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10,
       $11, $12, $13, $14,
       $15, $16::vector, $17
     ) RETURNING *`,
    [
      householdId,
      personData.first_name,
      personData.last_name,
      personData.middle_name || null,
      personData.nickname || null,
      personData.sex || null,
      personData.birth_year || null,
      personData.birth_month || null,
      personData.birth_day || null,
      personData.birth_date || null,
      personData.birth_city || null,
      personData.birth_place || null,
      birth_country_id,
      personData.death_date || null,
      personData.notes || null,
      embeddingStr,
      userId,
    ]
  );

  if (!person) {
    throw new Error('Failed to add person');
  }

  // Create document + chunk for RAG pipeline
  const doc = await queryOne<{ id: string }>(
    `INSERT INTO documents (household_id, title, doc_type, source_table, source_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      householdId,
      `${person.first_name} ${person.last_name}`,
      'person_bio',
      'persons',
      person.id,
    ]
  );

  if (doc) {
    await queryOne(
      `INSERT INTO document_chunks (
         household_id, document_id, chunk_index, content,
         token_count, metadata, embedding
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
      [
        householdId,
        doc.id,
        0,
        embeddingText,
        Math.ceil(embeddingText.length / 4),
        JSON.stringify({ person_id: person.id, type: 'person_bio' }),
        embeddingStr,
      ]
    );
  }

  return {
    success: true,
    person: {
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      birth_year: person.birth_year,
      birth_place: person.birth_place,
    },
    message: `Added ${person.first_name} ${person.last_name} to the family tree.`,
  };
}
