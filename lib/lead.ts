import type { LeadUpsert } from '@/types/faq';

const CRM_TIMEOUT_MS = 10_000;

// Must match column headers in Google Sheet row 1.
// Columns A–U are V1 layout; V–X are Gen1 additions (Phase 19B).
// Do not reorder — Apps Script maps by column position/name.
const CRM_FIELDS: Array<keyof LeadUpsert> = [
  // A–U — existing V1 layout (preserved)
  'line_user_id',
  'display_name',
  'real_name',
  'age',
  'gender',
  'phone',
  'monthly_income',
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
  'handoff_notified_at',
  'handoff_reason',
  // Gen1 additions — new columns appended at the end
  'budget_annual',       // V: normalized annual budget (Gen1)
  'interest_category',   // W: e.g. health_insurance
  'pending_issue',       // X: issue Jirawat must handle
  'jp_status',           // Y: manual — Open | Appointment | Signed | Close
];

// jp_status is owned by Jirawat after initial bot creation.
// Rule: bot must NOT write jp_note, and must not overwrite jp_status after init.
// Implementation: include jp_status in payload ONLY when `gen1_jp_initialized` is not set.
// gen1_jp_initialized is a session flag (never sent to sheet) to prevent double-setting.

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

  // Build payload from CRM_FIELDS only — skip empty values
  const payload: Record<string, string> = {
    line_user_id: data.line_user_id,
    last_contact_date: new Date().toISOString().split('T')[0],
  };

  for (const field of CRM_FIELDS) {
    const val = data[field];
    if (val && val !== '') payload[field] = String(val);
  }

  const nonEmpty = Object.keys(payload).filter((k) => payload[k] && k !== 'line_user_id');
  console.log(`[CRM] POST fields=${nonEmpty.join(',')}`);

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
      console.error(`[CRM] update failed: ${res.status}`);
    }
  } catch (err) {
    const e = err as { name?: string; message?: string; cause?: unknown };
    const cause = e.cause instanceof Error ? e.cause.message : String(e.cause ?? '');
    console.error(`[CRM] error name=${e.name ?? 'unknown'} message="${e.message ?? ''}" cause="${cause}"`);
  }
}
