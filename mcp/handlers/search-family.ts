import { supabaseAdmin } from '@/lib/supabase-server';
import { generateEmbedding } from '@/lib/embeddings';

interface SearchFamilyInput {
  query: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchFamily(input: SearchFamilyInput) {
  const { query, limit = 10, householdId } = input;

  const embedding = await generateEmbedding(query);

  const { data: chunks, error } = await supabaseAdmin.rpc(
    'search_family_across_households',
    {
      input_household_id: householdId,
      query_embedding: embedding,
      match_threshold: 0.65,
      match_count: limit,
    }
  );

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  if (!chunks || chunks.length === 0) {
    const { data: persons } = await supabaseAdmin
      .from('persons')
      .select('id, first_name, last_name, nickname, birth_year, birth_place, notes')
      .eq('household_id', householdId)
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,nickname.ilike.%${query}%`
      )
      .limit(limit);

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
    results: chunks.map((c: Record<string, unknown>) => ({
      content: c.content,
      source_type: c.source_type,
      source_id: c.source_id,
      household_id: c.household_id,
      similarity: Math.round((c.similarity as number) * 100) / 100,
    })),
    source: 'semantic_search',
    count: chunks.length,
  };
}
