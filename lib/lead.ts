import { LeadUpsert } from '@/types/faq';

export async function upsertLead(data: LeadUpsert): Promise<void> {
  const url = process.env.LEAD_SHEET_CSV_URL;

  if (!url) {
    console.warn('[CRM] LEAD_SHEET_CSV_URL not set — skipping');
    return;
  }

  // Validate URL looks like a Google Apps Script /exec endpoint
  const isExecUrl = url.includes('script.google.com') && url.includes('/exec');
  if (!isExecUrl) {
    console.error(
      '[CRM] LEAD_SHEET_CSV_URL ต้องเป็น Google Apps Script Web App URL (/exec) ไม่ใช่ Google Sheet CSV URL'
    );
  }

  console.log(`[CRM] POST to Apps Script url_set=true is_exec_url=${isExecUrl}`);

  const payload: LeadUpsert = {
    ...data,
    last_contact_date: new Date().toISOString().split('T')[0],
  };

  // Never log customer PII — only log field names
  const fields = Object.keys(payload).join(',');
  console.log(`[CRM] fields=${fields}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Google Apps Script redirects POST to GET — follow redirects
      redirect: 'follow',
    });

    const responseText = await res.text();
    console.log(
      `[CRM] method=POST status=${res.status} body="${responseText.slice(0, 200)}"`
    );

    if (!res.ok) {
      console.error(`[CRM] update failed: ${res.status} — ตรวจสอบ Apps Script deployment`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CRM] fetch error: ${msg}`);
  }
}
