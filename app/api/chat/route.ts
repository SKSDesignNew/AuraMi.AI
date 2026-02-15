import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase-server';
import { originTools } from '@/mcp/tools';
import { executeToolCall } from '@/mcp/index';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(householdName?: string): string {
  const name = householdName || 'your';
  return `You are AuraMi.AI, a warm and knowledgeable family historian for the "${name}" family. You help family members discover, record, and explore their family history through natural conversation.

Your personality:
- Warm, respectful, and curious about family stories
- You speak as if you genuinely care about preserving this family's legacy
- You encourage users to share more details and stories
- When you find connections between family members, you highlight them naturally
- You use culturally appropriate terms when relevant (e.g., Dadi, Nani, Chacha)

Your capabilities:
- Search across the family's entire history (persons, events, stories, photos)
- Add new family members, relationships, events, and stories
- Answer questions about the family tree and relationships
- Find and display family photos
- Generate biographies from available data

Rules:
- Always cite which persons, events, or stories your answers come from
- If you're not sure about something, say so — don't make up family history
- When adding data, always confirm with the user before saving
- When showing search results, summarize them naturally — don't dump raw data
- If asked about a person and multiple matches exist, ask the user to clarify`;
}

export async function POST(request: Request) {
  const { message, sessionId, householdId, userId } = await request.json();

  if (!message || !householdId || !userId) {
    return Response.json(
      { error: 'Missing required fields: message, householdId, userId' },
      { status: 400 }
    );
  }

  // 1. Get or create chat session
  let session = sessionId;
  if (!session) {
    const { data } = await supabaseAdmin
      .from('chat_sessions')
      .insert({ household_id: householdId, created_by: userId })
      .select('id')
      .single();
    session = data?.id;
  }

  // 2. Load chat history
  const { data: history } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session)
    .order('created_at', { ascending: true })
    .limit(50);

  const messages: Anthropic.MessageParam[] = [
    ...(history || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // 3. Save user message
  await supabaseAdmin.from('chat_messages').insert({
    household_id: householdId,
    session_id: session,
    role: 'user',
    content: message,
  });

  // 4. Get household name for system prompt
  const { data: household } = await supabaseAdmin
    .from('households')
    .select('name')
    .eq('id', householdId)
    .single();

  const systemPrompt = buildSystemPrompt(household?.name);

  // 5. Call Claude with tools
  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    tools: originTools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema as Anthropic.Tool['input_schema'],
    })),
  });

  // 6. Handle tool use loop
  const allMessages: Anthropic.MessageParam[] = [...messages];

  while (response.stop_reason === 'tool_use') {
    const assistantContent = response.content;
    allMessages.push({ role: 'assistant', content: assistantContent });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of assistantContent) {
      if (block.type === 'tool_use') {
        const result = await executeToolCall(
          block.name,
          block.input as Record<string, unknown>,
          householdId,
          userId
        );
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    allMessages.push({ role: 'user', content: toolResults });

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt,
      messages: allMessages,
      tools: originTools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema as Anthropic.Tool['input_schema'],
      })),
    });
  }

  // 7. Extract final text response
  const assistantMessage = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  // 8. Save assistant response
  await supabaseAdmin.from('chat_messages').insert({
    household_id: householdId,
    session_id: session,
    role: 'assistant',
    content: assistantMessage,
  });

  // 9. Return response
  return Response.json({
    message: assistantMessage,
    sessionId: session,
  });
}
