import { LeadUpsert } from '@/types/faq';

const CRM_TIMEOUT_MS = 5_000;

export async function upsertLead(data: LeadUpsert): Promise<void> {
  const url = process.env.LEAD_SHEET_CSV_URL;

  if (!url) {
    console.warn('[CRM] LEAD_SHEET_CSV_URL not set — skipping');
    return;
  }

  const isExecUrl = url.includes('script.google.com') && url.includes('/exec');
  if (!isExecUrl) {
    console.error('[CRM] URL must be a Google Apps Script Web App /exec URL — got something else');
    return;
  }

  const payload: LeadUpsert = {
    ...data,
    last_contact_date: new Date().toISOString().split('T')[0],
  };

  // Never log customer PII — only log field names being sent
  const fields = Object.keys(payload).join(',');
  console.log(`[CRM] sending fields=${fields}`);

  // Use GET + URLSearchParams — avoids the POST→GET redirect issue with Apps Script.
  // Apps Script /exec responds with a 302 redirect; Node.js fetch converts POST to GET
  // when following that redirect, causing 405. GET params bypass this entirely.
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, String(val));
    }
  }

  const targetUrl = `${url}?${params.toString()}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });

    const body = await res.text();
    console.log(`[CRM] method=GET status=${res.status} body="${body.slice(0, 200)}"`);

    if (!res.ok) {
      console.error(`[CRM] update failed: ${res.status}`);
    }
  } catch (err) {
    const e = err as { name?: string; message?: string; cause?: unknown };
    const causeName = e.cause instanceof Error ? e.cause.message : String(e.cause ?? '');
    console.error(
      `[CRM] fetch error name=${e.name ?? 'unknown'} message="${e.message ?? ''}" cause="${causeName}"`
    );
  }
}
