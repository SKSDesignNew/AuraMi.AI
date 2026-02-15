import { supabaseAdmin } from '@/lib/supabase-server';
import { anthropic } from '@/lib/claude';

interface GenerateBioInput {
  person_id: string;
  householdId: string;
  userId: string;
}

export async function generateBio(input: GenerateBioInput) {
  const { person_id, householdId } = input;

  // Gather all data about this person
  const [personRes, relsRes, eventsRes, storiesRes] = await Promise.all([
    supabaseAdmin
      .from('persons')
      .select('*')
      .eq('id', person_id)
      .eq('household_id', householdId)
      .single(),
    supabaseAdmin
      .from('relationships')
      .select('*, from_person:persons!relationships_from_person_id_fkey(first_name, last_name), to_person:persons!relationships_to_person_id_fkey(first_name, last_name)')
      .eq('household_id', householdId)
      .or(`from_person_id.eq.${person_id},to_person_id.eq.${person_id}`),
    supabaseAdmin
      .from('event_links')
      .select('role, event:events(title, event_type, event_date, event_year, location, description)')
      .eq('person_id', person_id),
    supabaseAdmin
      .from('story_persons')
      .select('mention_type, story:stories(title, content, era, location)')
      .eq('person_id', person_id),
  ]);

  if (personRes.error) {
    throw new Error(`Person not found: ${personRes.error.message}`);
  }

  const person = personRes.data;
  const relationships = relsRes.data || [];
  const events = eventsRes.data || [];
  const stories = storiesRes.data || [];

  const dataContext = JSON.stringify(
    { person, relationships, events, stories },
    null,
    2
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Write a warm, narrative biography for this family member based on the data below. Write in third person, 2-3 paragraphs. Include relationships, events, and stories if available. Be respectful and celebratory of their life.\n\nData:\n${dataContext}`,
      },
    ],
  });

  const bio = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n');

  return {
    person_id,
    name: `${person.first_name} ${person.last_name}`,
    biography: bio,
  };
}
