import { supabaseAdmin } from '@/lib/supabase-server';
import { generateEmbedding } from '@/lib/embeddings';

interface SearchStoriesInput {
  query?: string;
  person_id?: string;
  era?: string;
  tag?: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchStories(input: SearchStoriesInput) {
  const { householdId, query, person_id, era, tag, limit = 10 } = input;

  // Semantic search if query provided
  if (query) {
    const embedding = await generateEmbedding(query);

    const { data: chunks } = await supabaseAdmin.rpc(
      'search_family_across_households',
      {
        input_household_id: householdId,
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: limit,
      }
    );

    if (chunks && chunks.length > 0) {
      const storyIds = chunks
        .filter((c: Record<string, unknown>) => {
          const meta = c.metadata as Record<string, unknown> | undefined;
          return meta?.type === 'story';
        })
        .map((c: Record<string, unknown>) => {
          const meta = c.metadata as Record<string, unknown>;
          return meta.story_id;
        });

      if (storyIds.length > 0) {
        const { data: stories } = await supabaseAdmin
          .from('stories')
          .select('*, story_persons(person_id, mention_type, person:persons(first_name, last_name))')
          .in('id', storyIds);

        return { stories: stories || [], count: stories?.length || 0 };
      }
    }
  }

  // Fallback: filtered query
  let dbQuery = supabaseAdmin
    .from('stories')
    .select('*, story_persons(person_id, mention_type, person:persons(first_name, last_name))')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (era) {
    dbQuery = dbQuery.eq('era', era);
  }

  if (tag) {
    dbQuery = dbQuery.contains('tags', [tag]);
  }

  const { data: stories, error } = await dbQuery;

  if (error) {
    throw new Error(`Failed to search stories: ${error.message}`);
  }

  let results = stories || [];

  if (person_id) {
    results = results.filter((s: Record<string, unknown>) =>
      (s.story_persons as Array<Record<string, unknown>>)?.some(
        (sp) => sp.person_id === person_id
      )
    );
  }

  return { stories: results, count: results.length };
}
