import type { LeadUpsert } from '@/types/faq';

const CRM_TIMEOUT_MS = 10_000;

// CRM sheet headers (must match row 1 in Google Sheet)
const CRM_FIELDS: Array<keyof LeadUpsert> = [
  'line_user_id',
  'display_name',
  'real_name',
  'age',
  'gender',
  'phone',
  'purchase_objective',
  'product_interest',
  'budget',
  'preferred_contact_time',
  'lead_status',
  'follow_up_status',
  'last_question',
  'conversation_summary',
  'first_contact_date',
  'last_contact_date',
];

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

  // Build payload: only CRM_FIELDS, fill missing with empty string
  const payload: Record<string, string> = {
    last_contact_date: new Date().toISOString().split('T')[0],
  };
  for (const field of CRM_FIELDS) {
    const val = data[field];
    if (val !== undefined && val !== null && val !== '') {
      payload[field] = String(val);
    }
  }
  // Ensure line_user_id always present
  payload.line_user_id = data.line_user_id;

  console.log(`[CRM] POST fields=${Object.keys(payload).filter(k => payload[k]).join(',')}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
