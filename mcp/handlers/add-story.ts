import { query, queryOne } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

interface AddStoryInput {
  title: string;
  content: string;
  narrator_id?: string;
  era?: string;
  location?: string;
  tags?: string[];
  person_ids?: string[];
  householdId: string;
  userId: string;
}

export async function addStory(input: AddStoryInput) {
  const { householdId, userId, person_ids, ...storyData } = input;

  const embeddingText = `${storyData.title}. ${storyData.content}`;
  const embedding = await generateEmbedding(embeddingText);
  const embeddingStr = `[${embedding.join(',')}]`;

  const story = await queryOne<Record<string, unknown>>(
    `INSERT INTO stories (
       household_id, title, content, narrator_id, era,
       location, tags, embedding, created_by
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9)
     RETURNING *`,
    [
      householdId,
      storyData.title,
      storyData.content,
      storyData.narrator_id || null,
      storyData.era || null,
      storyData.location || null,
      storyData.tags || null,
      embeddingStr,
      userId,
    ]
  );

  if (!story) {
    throw new Error('Failed to add story');
  }

  // Link persons to the story
  if (person_ids && person_ids.length > 0) {
    const valuePlaceholders: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const pid of person_ids) {
      valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      values.push(story.id, pid, 'mentioned');
    }

    await query(
      `INSERT INTO story_persons (story_id, person_id, mention_type)
       VALUES ${valuePlaceholders.join(', ')}`,
      values
    );
  }

  // Create document + chunk for RAG
  const doc = await queryOne<{ id: string }>(
    `INSERT INTO documents (household_id, title, doc_type, source_table, source_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [householdId, story.title, 'story', 'stories', story.id]
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
        JSON.stringify({ story_id: story.id, type: 'story' }),
        embeddingStr,
      ]
    );
  }

  return {
    success: true,
    story: {
      id: story.id,
      title: story.title,
      era: story.era,
    },
    message: `Saved story: "${story.title}".`,
  };
}
