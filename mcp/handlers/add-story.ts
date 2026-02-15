import { supabaseAdmin } from '@/lib/supabase-server';
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

  const { data: story, error } = await supabaseAdmin
    .from('stories')
    .insert({
      ...storyData,
      household_id: householdId,
      embedding,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add story: ${error.message}`);
  }

  // Link persons to the story
  if (person_ids && person_ids.length > 0) {
    const links = person_ids.map((pid) => ({
      story_id: story.id,
      person_id: pid,
      mention_type: 'mentioned',
    }));

    await supabaseAdmin.from('story_persons').insert(links);
  }

  // Create document + chunk for RAG
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .insert({
      household_id: householdId,
      title: story.title,
      doc_type: 'story',
      source_table: 'stories',
      source_id: story.id,
    })
    .select('id')
    .single();

  if (doc) {
    await supabaseAdmin.from('document_chunks').insert({
      household_id: householdId,
      document_id: doc.id,
      chunk_index: 0,
      content: embeddingText,
      token_count: Math.ceil(embeddingText.length / 4),
      metadata: { story_id: story.id, type: 'story' },
      embedding,
    });
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
