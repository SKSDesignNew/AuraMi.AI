import { supabaseAdmin } from '@/lib/supabase-server';

interface AddEventInput {
  title: string;
  event_type?: string;
  event_date?: string;
  event_year?: number;
  location?: string;
  description?: string;
  person_ids?: string[];
  roles?: string[];
  householdId: string;
  userId: string;
}

export async function addEvent(input: AddEventInput) {
  const { householdId, userId, person_ids, roles, ...eventData } = input;

  const { data: event, error } = await supabaseAdmin
    .from('events')
    .insert({
      ...eventData,
      household_id: householdId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add event: ${error.message}`);
  }

  // Link persons to the event
  if (person_ids && person_ids.length > 0) {
    const links = person_ids.map((pid, i) => ({
      household_id: householdId,
      event_id: event.id,
      person_id: pid,
      role: roles?.[i] || null,
    }));

    await supabaseAdmin.from('event_links').insert(links);
  }

  return {
    success: true,
    event: {
      id: event.id,
      title: event.title,
      event_type: event.event_type,
      event_date: event.event_date,
      location: event.location,
    },
    message: `Recorded event: "${event.title}".`,
  };
}
