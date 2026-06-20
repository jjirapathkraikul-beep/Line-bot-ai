import OpenAI from 'openai';

const DEFAULT_REPLY =
  'ขออภัยครับ ขณะนี้ระบบมีปัญหาชั่วคราว\nรบกวนฝากชื่อและเบอร์โทรไว้ได้เลยครับ\nคุณจิราวัฒน์จะติดต่อกลับโดยเร็วที่สุดครับ 😊';

const OPENAI_MODEL = 'gpt-5.5';
const OPENAI_TIMEOUT_MS = 15_000;
const MAX_HISTORY = 20;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// In-memory conversation history per LINE userId
const conversationHistory = new Map<string, ChatMessage[]>();

function getClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getHistory(userId: string): ChatMessage[] {
  return conversationHistory.get(userId) ?? [];
}

function saveHistory(userId: string, messages: ChatMessage[]): void {
  const trimmed = messages.length > MAX_HISTORY ? messages.slice(-MAX_HISTORY) : messages;
  conversationHistory.set(userId, trimmed);
}

export async function getChatReply(
  userId: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const history = getHistory(userId);
  const updatedHistory: ChatMessage[] = [...history, { role: 'user', content: userMessage }];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const reply = await callOpenAI(systemPrompt, updatedHistory, controller.signal);
    saveHistory(userId, [...updatedHistory, { role: 'assistant', content: reply }]);
    return reply;
  } catch (err: unknown) {
    const error = err as { status?: number; name?: string; message?: string };

    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.error(`[OpenAI] Timeout userId=${userId}`);
      return DEFAULT_REPLY;
    }

    if (error.status === 429) {
      console.warn(`[OpenAI] Rate limit (429) userId=${userId} — retrying once`);
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const reply = await callOpenAI(systemPrompt, updatedHistory);
        saveHistory(userId, [...updatedHistory, { role: 'assistant', content: reply }]);
        return reply;
      } catch {
        return DEFAULT_REPLY;
      }
    }

    console.error(`[OpenAI] Error userId=${userId}:`, err);
    return DEFAULT_REPLY;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOpenAI(
  systemPrompt: string,
  history: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create(
    {
      model: OPENAI_MODEL,
      temperature: 1.0,
      max_tokens: 1024,
      messages: [{ role: 'system', content: systemPrompt }, ...history],
    },
    { signal }
  );

  const usage = response.usage;
  console.log(
    `[OpenAI] input=${usage?.prompt_tokens ?? 0} output=${usage?.completion_tokens ?? 0} total=${usage?.total_tokens ?? 0}`
  );

  return response.choices[0]?.message?.content ?? DEFAULT_REPLY;
}
