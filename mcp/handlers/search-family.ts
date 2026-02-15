import { query } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

interface SearchFamilyInput {
  query: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchFamily(input: SearchFamilyInput) {
  const { query: searchQuery, limit = 10, householdId } = input;

  const embedding = await generateEmbedding(searchQuery);
  const embeddingStr = `[${embedding.join(',')}]`;

  // Semantic search across household + linked households
  const chunks = await query<{
    id: string;
    content: string;
    source_type: string;
    source_id: string;
    household_id: string;
    similarity: number;
  }>(
    `SELECT * FROM search_family_across_households($1, $2::vector, $3, $4)`,
    [householdId, embeddingStr, 0.65, limit]
  );

  if (!chunks || chunks.length === 0) {
    // Fallback: direct text search on persons table
    const searchPattern = `%${searchQuery}%`;
    const persons = await query<{
      id: string;
      first_name: string;
      last_name: string;
      nickname: string | null;
      birth_year: number | null;
      birth_place: string | null;
      notes: string | null;
    }>(
      `SELECT id, first_name, last_name, nickname, birth_year, birth_place, notes
       FROM persons
       WHERE household_id = $1
         AND (first_name ILIKE $2 OR last_name ILIKE $2 OR nickname ILIKE $2)
       LIMIT $3`,
      [householdId, searchPattern, limit]
    );

    if (persons && persons.length > 0) {
      return {
        results: persons.map((p) => ({
          type: 'person',
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          nickname: p.nickname,
          birth_year: p.birth_year,
          birth_place: p.birth_place,
          notes: p.notes,
        })),
        source: 'text_search',
        count: persons.length,
      };
    }

    return { results: [], source: 'none', count: 0 };
  }

  return {
    results: chunks.map((c) => ({
      content: c.content,
      source_type: c.source_type,
      source_id: c.source_id,
      household_id: c.household_id,
      similarity: Math.round(c.similarity * 100) / 100,
    })),
    source: 'semantic_search',
    count: chunks.length,
  };
}
