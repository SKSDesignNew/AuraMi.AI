import { query } from '@/lib/db';
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
  const { householdId, query: searchQuery, person_id, era, tag, limit = 10 } = input;

  // Semantic search if query provided
  if (searchQuery) {
    const embedding = await generateEmbedding(searchQuery);
    const embeddingStr = `[${embedding.join(',')}]`;

    const chunks = await query<{
      id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }>(
      `SELECT * FROM search_family_across_households($1, $2::vector, $3, $4)`,
      [householdId, embeddingStr, 0.6, limit]
    );

    if (chunks && chunks.length > 0) {
      const storyIds = chunks
        .filter((c) => {
          const meta = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
          return meta?.type === 'story';
        })
        .map((c) => {
          const meta = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : c.metadata;
          return meta.story_id;
        })
        .filter(Boolean);

      if (storyIds.length > 0) {
        // Build parameterized IN clause
        const placeholders = storyIds.map((_, i) => `$${i + 1}`).join(', ');

        const stories = await query<Record<string, unknown>>(
          `SELECT s.*,
                  COALESCE(
                    json_agg(
                      json_build_object(
                        'person_id', sp.person_id,
                        'mention_type', sp.mention_type,
                        'person', CASE WHEN p.id IS NOT NULL
                          THEN json_build_object('first_name', p.first_name, 'last_name', p.last_name)
                          ELSE NULL
                        END
                      )
                    ) FILTER (WHERE sp.person_id IS NOT NULL),
                    '[]'::json
                  ) AS story_persons
           FROM stories s
           LEFT JOIN story_persons sp ON sp.story_id = s.id
           LEFT JOIN persons p ON p.id = sp.person_id
           WHERE s.id IN (${placeholders})
           GROUP BY s.id`,
          storyIds
        );

        return { stories: stories || [], count: stories?.length || 0 };
      }
    }
  }

  // Fallback: filtered query
  const conditions: string[] = ['s.household_id = $1'];
  const values: unknown[] = [householdId];
  let paramIndex = 2;

  if (era) {
    conditions.push(`s.era = $${paramIndex++}`);
    values.push(era);
  }

  if (tag) {
    conditions.push(`$${paramIndex++} = ANY(s.tags)`);
    values.push(tag);
  }

  if (person_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM story_persons sp2 WHERE sp2.story_id = s.id AND sp2.person_id = $${paramIndex}
    )`);
    values.push(person_id);
    paramIndex++;
  }

  values.push(limit);
  const limitParam = paramIndex;

  const stories = await query<Record<string, unknown>>(
    `SELECT s.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'person_id', sp.person_id,
                  'mention_type', sp.mention_type,
                  'person', CASE WHEN p.id IS NOT NULL
                    THEN json_build_object('first_name', p.first_name, 'last_name', p.last_name)
                    ELSE NULL
                  END
                )
              ) FILTER (WHERE sp.person_id IS NOT NULL),
              '[]'::json
            ) AS story_persons
     FROM stories s
     LEFT JOIN story_persons sp ON sp.story_id = s.id
     LEFT JOIN persons p ON p.id = sp.person_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT $${limitParam}`,
    values
  );

  return { stories: stories || [], count: stories?.length || 0 };
}
