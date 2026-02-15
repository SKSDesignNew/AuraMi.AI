import { supabaseAdmin } from '@/lib/supabase-server';
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

  let birth_country_id = null;
  if (birth_country_code) {
    const { data: country } = await supabaseAdmin
      .from('countries')
      .select('id')
      .eq('code', birth_country_code.toUpperCase())
      .single();
    birth_country_id = country?.id || null;
  }

  const embeddingText = buildPersonEmbeddingText(personData);
  const embedding = await generateEmbedding(embeddingText);

  const { data: person, error } = await supabaseAdmin
    .from('persons')
    .insert({
      ...personData,
      household_id: householdId,
      birth_country_id,
      embedding,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add person: ${error.message}`);
  }

  const { data: doc } = await supabaseAdmin
    .from('documents')
    .insert({
      household_id: householdId,
      title: `${person.first_name} ${person.last_name}`,
      doc_type: 'person_bio',
      source_table: 'persons',
      source_id: person.id,
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
      metadata: { person_id: person.id, type: 'person_bio' },
      embedding,
    });
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
