import type { LeadUpsert } from '@/types/faq';

const CRM_TIMEOUT_MS = 10_000;

type CrmPayload = Pick<LeadUpsert, 'line_user_id' | 'last_question' | 'last_contact_date' | 'lead_status' | 'interest'>;

export async function upsertLead(data: LeadUpsert): Promise<void> {
  const url = process.env.LEAD_SHEET_CSV_URL;

  if (!url) {
    console.warn('[CRM] LEAD_SHEET_CSV_URL not set — skipping');
    return;
  }

  const isExecUrl = url.includes('script.google.com') && url.includes('/exec');
  if (!isExecUrl) {
    console.error('[CRM] URL must end with /exec (Google Apps Script Web App URL)');
    return;
  }

  const payload: CrmPayload = {
    line_user_id: data.line_user_id,
    last_question: data.last_question?.substring(0, 300) ?? '',
    last_contact_date: new Date().toISOString().split('T')[0],
    lead_status: data.lead_status ?? 'new',
    interest: data.interest ?? '',
  };

  const bodyJson = JSON.stringify(payload);
  console.log(`[CRM] POST fields=${Object.keys(payload).join(',')}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyJson,
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });

    const responseText = await res.text();
    console.log(`[CRM] POST status=${res.status} body="${responseText.slice(0, 200)}"`);

    if (!res.ok) {
      console.error(`[CRM] update failed: ${res.status} — check Apps Script deployment`);
    }
  } catch (err) {
    const e = err as { name?: string; message?: string; cause?: unknown };
    const cause = e.cause instanceof Error ? e.cause.message : String(e.cause ?? '');
    console.error(
      `[CRM] error name=${e.name ?? 'unknown'} message="${e.message ?? ''}" cause="${cause}"`
    );
  }
}
