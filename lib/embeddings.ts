import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.trim(),
  });
  return response.data[0].embedding;
}

export function buildPersonEmbeddingText(person: {
  first_name: string;
  last_name: string;
  nickname?: string;
  birth_year?: number;
  birth_city?: string;
  birth_place?: string;
  notes?: string;
}): string {
  const parts = [
    `${person.first_name} ${person.last_name}`,
    person.nickname ? `also known as ${person.nickname}` : '',
    person.birth_year ? `born ${person.birth_year}` : '',
    person.birth_city || person.birth_place || '',
    person.notes || '',
  ];
  return parts.filter(Boolean).join('. ');
}
