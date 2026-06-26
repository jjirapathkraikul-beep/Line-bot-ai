import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PRIMARY_MODEL, FALLBACK_MODEL } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const DIAG_SECRET = process.env.DIAG_SECRET;

export async function GET(req: Request): Promise<NextResponse> {
  // Simple token check — set DIAG_SECRET env var on Vercel to protect this endpoint
  if (DIAG_SECRET) {
    const token = new URL(req.url).searchParams.get('token');
    if (token !== DIAG_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const keyMasked = apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : null;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'OPENAI_API_KEY is not set',
      primary_model: PRIMARY_MODEL,
      fallback_model: FALLBACK_MODEL,
    }, { status: 500 });
  }

  const client = new OpenAI({ apiKey });
  const results: Record<string, unknown> = {
    api_key_masked: keyMasked,
    primary_model: PRIMARY_MODEL,
    fallback_model: FALLBACK_MODEL,
    timestamp: new Date().toISOString(),
  };

  // Test primary model
  const primaryResult = await testModel(client, PRIMARY_MODEL);
  results.primary = primaryResult;

  // Test fallback model only if primary fails with non-billing error
  if (!primaryResult.ok) {
    const fallbackResult = await testModel(client, FALLBACK_MODEL);
    results.fallback = fallbackResult;
  }

  const ok = primaryResult.ok || (results.fallback as { ok?: boolean } | undefined)?.ok === true;

  return NextResponse.json({ ok, ...results }, { status: ok ? 200 : 503 });
}

async function testModel(
  client: OpenAI,
  model: string
): Promise<Record<string, unknown>> {
  try {
    const res = await client.chat.completions.create({
      model,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return {
      ok: true,
      model,
      finish_reason: res.choices[0]?.finish_reason,
      tokens_used: res.usage?.total_tokens,
    };
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      const errBody = err.error as Record<string, unknown> | undefined;
      const type = String(errBody?.type ?? err.type ?? 'unknown');
      const code = String(errBody?.code ?? err.code ?? 'unknown');
      const diagnosis = diagnose429(type, code, err.status ?? 0);
      return {
        ok: false,
        model,
        http_status: err.status,
        error_type: type,
        error_code: code,
        error_message: err.message,
        diagnosis,
      };
    }
    return {
      ok: false,
      model,
      error_message: err instanceof Error ? err.message : String(err),
    };
  }
}

function diagnose429(type: string, code: string, status: number): string {
  if (status === 429) {
    if (type === 'insufficient_quota' || code === 'insufficient_quota') {
      return 'เครดิตหมด หรือ billing ยังไม่ active — เติมเงินที่ platform.openai.com/account/billing';
    }
    if (type === 'rate_limit_exceeded' || code === 'rate_limit_exceeded') {
      return 'Rate limit จริง — ลดความถี่ requests หรืออัพเกรด tier';
    }
    return 'Unknown 429 — ดู error_type และ error_code ด้านบน';
  }
  if (status === 404) {
    return `Model "${code}" ไม่มีอยู่ในบัญชีนี้ — ลอง gpt-4o หรือ gpt-4o-mini แทน`;
  }
  if (status === 401) {
    return 'API key ไม่ถูกต้อง หรือหมดอายุ — ตรวจสอบ OPENAI_API_KEY บน Vercel';
  }
  if (status === 403) {
    return 'ไม่มีสิทธิ์ใช้ model นี้ — ตรวจสอบ tier หรือเปลี่ยน model';
  }
  return `HTTP ${status} — ดู error_type และ error_message`;
}
