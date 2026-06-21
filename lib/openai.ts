import OpenAI from 'openai';

const DEFAULT_REPLY =
  'ขออภัยครับ ขณะนี้ระบบมีปัญหาชั่วคราว\nรบกวนฝากชื่อและเบอร์โทรไว้ได้เลยครับ\nคุณจิราวัฒน์จะติดต่อกลับโดยเร็วที่สุดครับ 😊';

export const PRIMARY_MODEL = 'gpt-4o';
export const FALLBACK_MODEL = 'gpt-4o-mini';
const OPENAI_TIMEOUT_MS = 15_000;
const MAX_HISTORY = 20;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

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

function logApiError(context: string, err: unknown): void {
  if (err instanceof OpenAI.APIError) {
    const errBody = err.error as Record<string, unknown> | undefined;
    console.error(
      `[OpenAI] ${context} http=${err.status} type=${errBody?.type ?? err.type ?? 'unknown'} code=${errBody?.code ?? err.code ?? 'unknown'} msg="${err.message}"`
    );
  } else {
    const e = err as { name?: string; message?: string };
    console.error(`[OpenAI] ${context} name=${e.name ?? 'unknown'} msg="${e.message ?? String(err)}"`);
  }
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
    console.log(`[OpenAI] calling model=${PRIMARY_MODEL} userId=${userId}`);
    const reply = await callOpenAI(PRIMARY_MODEL, systemPrompt, updatedHistory, controller.signal);
    saveHistory(userId, [...updatedHistory, { role: 'assistant', content: reply }]);
    return reply;
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));

    if (isAbort) {
      console.error(`[OpenAI] Timeout model=${PRIMARY_MODEL} userId=${userId}`);
      return DEFAULT_REPLY;
    }

    if (err instanceof OpenAI.APIError && err.status === 429) {
      const errBody = err.error as Record<string, unknown> | undefined;
      const errorType = String(errBody?.type ?? err.type ?? 'unknown');
      console.warn(
        `[OpenAI] 429 model=${PRIMARY_MODEL} userId=${userId} type=${errorType} — retry with ${FALLBACK_MODEL}`
      );
      await new Promise((r) => setTimeout(r, 800));
      try {
        console.log(`[OpenAI] fallback model=${FALLBACK_MODEL} userId=${userId}`);
        const reply = await callOpenAI(FALLBACK_MODEL, systemPrompt, updatedHistory);
        saveHistory(userId, [...updatedHistory, { role: 'assistant', content: reply }]);
        return reply;
      } catch (retryErr) {
        logApiError(`fallback-failed model=${FALLBACK_MODEL} userId=${userId}`, retryErr);
        return DEFAULT_REPLY;
      }
    }

    logApiError(`error model=${PRIMARY_MODEL} userId=${userId}`, err);
    return DEFAULT_REPLY;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOpenAI(
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create(
    {
      model,
      temperature: 1.0,
      max_tokens: 1024,
      messages: [{ role: 'system', content: systemPrompt }, ...history],
    },
    { signal }
  );

  const usage = response.usage;
  console.log(
    `[OpenAI] ok model=${model} in=${usage?.prompt_tokens ?? 0} out=${usage?.completion_tokens ?? 0} total=${usage?.total_tokens ?? 0}`
  );

  return response.choices[0]?.message?.content ?? DEFAULT_REPLY;
}
