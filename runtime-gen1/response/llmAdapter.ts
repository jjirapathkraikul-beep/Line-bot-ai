// Gen1 LLM Adapter — Phase 10.7
// Thin adapter between ExecutionContext prompt and OpenAI API.
// No business logic — only transport, retries, timeout, and error handling.
// Uses a separate singleton from V1's lib/openai.ts to prevent history cross-contamination.

import OpenAI from 'openai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LlmAdapterInput {
  systemPrompt: string;
  userMessage: string;
  userId: string;
  model?: string;
  timeoutMs?: number;
}

export interface LlmAdapterResult {
  text: string;
  model: string;
  promptCharCount: number;
  completionCharCount: number;
  promptTokens: number;
  completionTokens: number;
  warnings: string[];
  rawResponse?: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GEN1_PRIMARY_MODEL  = 'gpt-4o';
const GEN1_FALLBACK_MODEL = 'gpt-4o-mini';
const GEN1_TIMEOUT_MS     = 15_000;
const GEN1_MAX_TOKENS     = 600;
// Lower temperature than V1's 0.7 — gen1 context is highly constrained
const GEN1_TEMPERATURE    = 0.4;

export const GEN1_SAFE_FALLBACK_TEXT =
  'ขอโทษด้วยนะครับ ตอนนี้ระบบกำลังปรับปรุงอยู่ครับ ขอให้คุณจิราวัฒน์ช่วยตรวจคำถามนี้ต่อให้นะครับ';

// ─── Gen1-specific OpenAI client (isolated from V1 history) ───────────────────

let _gen1Client: OpenAI | null = null;
function getGen1Client(): OpenAI {
  if (!_gen1Client) {
    _gen1Client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _gen1Client;
}

// ─── Test injection point ─────────────────────────────────────────────────────

type MockFn = (input: LlmAdapterInput) => Promise<string>;
let _mockFn: MockFn | null = null;

export function __setMockLlmFn(fn: MockFn | null): void {
  _mockFn = fn;
}

// ─── Internal API caller ──────────────────────────────────────────────────────

async function callGen1OpenAI(
  model: string,
  systemPrompt: string,
  userMessage: string,
  signal?: AbortSignal,
): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  const client = getGen1Client();
  const response = await client.chat.completions.create(
    {
      model,
      temperature: GEN1_TEMPERATURE,
      max_tokens: GEN1_MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    },
    { signal },
  );

  const usage = response.usage;
  const raw   = response.choices[0]?.message?.content ?? GEN1_SAFE_FALLBACK_TEXT;

  // Decode unicode escape sequences (same as V1 lib/openai.ts)
  const text = raw.replace(
    /\\u([0-9A-Fa-f]{4})/g,
    (_, hex) => String.fromCharCode(parseInt(hex, 16)),
  );

  return {
    text,
    promptTokens:     usage?.prompt_tokens     ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
  };
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

export async function generateResponse(input: LlmAdapterInput): Promise<LlmAdapterResult> {
  const warnings: string[]  = [];
  const { systemPrompt, userMessage, userId } = input;
  const promptCharCount = systemPrompt.length + userMessage.length;
  const maskedId = `${userId.substring(0, 8)}***`;

  // ── Test mock path ─────────────────────────────────────────────────────────
  if (_mockFn) {
    try {
      const text = await _mockFn(input);
      return {
        text,
        model:              'mock',
        promptCharCount,
        completionCharCount: text.length,
        promptTokens:       0,
        completionTokens:   0,
        warnings,
      };
    } catch (err) {
      warnings.push(`W-LLM-MOCK-ERROR: ${err instanceof Error ? err.message : String(err)}`);
      return {
        text:               GEN1_SAFE_FALLBACK_TEXT,
        model:              'mock',
        promptCharCount,
        completionCharCount: GEN1_SAFE_FALLBACK_TEXT.length,
        promptTokens:       0,
        completionTokens:   0,
        warnings,
      };
    }
  }

  // ── Real API path ──────────────────────────────────────────────────────────
  const model     = input.model    ?? GEN1_PRIMARY_MODEL;
  const timeoutMs = input.timeoutMs ?? GEN1_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[GEN1-LLM] model=${model} userId=${maskedId} chars=${promptCharCount}`);
    const { text, promptTokens, completionTokens } = await callGen1OpenAI(
      model, systemPrompt, userMessage, controller.signal,
    );
    console.log(`[GEN1-LLM] ok model=${model} in=${promptTokens} out=${completionTokens}`);

    return {
      text,
      model,
      promptCharCount,
      completionCharCount: text.length,
      promptTokens,
      completionTokens,
      warnings,
    };
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'));

    if (isAbort) {
      console.error(`[GEN1-LLM] Timeout model=${model} userId=${maskedId}`);
      warnings.push(`W-LLM-TIMEOUT: model=${model} timed out after ${timeoutMs}ms`);
      return {
        text:               GEN1_SAFE_FALLBACK_TEXT,
        model,
        promptCharCount,
        completionCharCount: GEN1_SAFE_FALLBACK_TEXT.length,
        promptTokens:        0,
        completionTokens:    0,
        warnings,
      };
    }

    // 429 rate-limit: try fallback model once
    if (err instanceof OpenAI.APIError && err.status === 429 && model !== GEN1_FALLBACK_MODEL) {
      console.warn(`[GEN1-LLM] 429 on ${model} — falling back to ${GEN1_FALLBACK_MODEL}`);
      warnings.push(`W-LLM-RATE-LIMIT: primary model ${model} rate-limited; trying ${GEN1_FALLBACK_MODEL}`);
      clearTimeout(timeoutId);

      const fbController = new AbortController();
      const fbTimeoutId  = setTimeout(() => fbController.abort(), timeoutMs);
      try {
        const { text, promptTokens, completionTokens } = await callGen1OpenAI(
          GEN1_FALLBACK_MODEL, systemPrompt, userMessage, fbController.signal,
        );
        return {
          text,
          model:              GEN1_FALLBACK_MODEL,
          promptCharCount,
          completionCharCount: text.length,
          promptTokens,
          completionTokens,
          warnings,
        };
      } catch (fbErr) {
        warnings.push(`W-LLM-FALLBACK-FAILED: ${GEN1_FALLBACK_MODEL} also failed — ${fbErr instanceof Error ? fbErr.message : String(fbErr)}`);
        return {
          text:               GEN1_SAFE_FALLBACK_TEXT,
          model:              GEN1_FALLBACK_MODEL,
          promptCharCount,
          completionCharCount: GEN1_SAFE_FALLBACK_TEXT.length,
          promptTokens:        0,
          completionTokens:    0,
          warnings,
        };
      } finally {
        clearTimeout(fbTimeoutId);
      }
    }

    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[GEN1-LLM] Error model=${model} userId=${maskedId}: ${msg}`);
    warnings.push(`W-LLM-ERROR: ${msg}`);
    return {
      text:               GEN1_SAFE_FALLBACK_TEXT,
      model,
      promptCharCount,
      completionCharCount: GEN1_SAFE_FALLBACK_TEXT.length,
      promptTokens:        0,
      completionTokens:    0,
      warnings,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
