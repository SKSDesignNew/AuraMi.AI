import { supabaseAdmin } from '@/lib/supabase-server';

interface AddRelationshipInput {
  from_person_id: string;
  to_person_id: string;
  relation_type: string;
  relation_label?: string;
  start_date?: string;
  householdId: string;
  userId: string;
}

export async function addRelationship(input: AddRelationshipInput) {
  const { householdId, userId, ...relData } = input;

  const { data: relationship, error } = await supabaseAdmin
    .from('relationships')
    .insert({
      ...relData,
      household_id: householdId,
      source: 'manual',
    })
    .select(
      '*, from_person:persons!relationships_from_person_id_fkey(first_name, last_name), to_person:persons!relationships_to_person_id_fkey(first_name, last_name)'
    )
    .single();

  if (error) {
    throw new Error(`Failed to add relationship: ${error.message}`);
  }

  const fromName = `${relationship.from_person.first_name} ${relationship.from_person.last_name}`;
  const toName = `${relationship.to_person.first_name} ${relationship.to_person.last_name}`;

  return {
    success: true,
    relationship: {
      id: relationship.id,
      from: fromName,
      to: toName,
      type: relationship.relation_type,
      label: relationship.relation_label,
    },
    message: `Linked ${fromName} as ${relationship.relation_type} of ${toName}.`,
  };
}
