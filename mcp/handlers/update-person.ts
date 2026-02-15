import { supabaseAdmin } from '@/lib/supabase-server';
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

  const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };

  if (birth_country_code) {
    const { data: country } = await supabaseAdmin
      .from('countries')
      .select('id')
      .eq('code', birth_country_code.toUpperCase())
      .single();
    if (country) updateData.birth_country_id = country.id;
  }

  const { data: person, error } = await supabaseAdmin
    .from('persons')
    .update(updateData)
    .eq('id', person_id)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update person: ${error.message}`);
  }

  // Re-generate embedding
  const embeddingText = buildPersonEmbeddingText(person);
  const embedding = await generateEmbedding(embeddingText);

  await supabaseAdmin
    .from('persons')
    .update({ embedding })
    .eq('id', person_id);

  // Update document chunks
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('id')
    .eq('source_table', 'persons')
    .eq('source_id', person_id)
    .single();

  if (doc) {
    await supabaseAdmin
      .from('document_chunks')
      .update({ content: embeddingText, embedding })
      .eq('document_id', doc.id);
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
