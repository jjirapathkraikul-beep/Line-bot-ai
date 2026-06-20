import { LeadUpsert } from '@/types/faq';

/**
 * Sends lead data to a Google Apps Script Web App that handles Google Sheet CRM writes.
 * LEAD_SHEET_CSV_URL should be the published Apps Script deployment URL.
 */
export async function upsertLead(data: LeadUpsert): Promise<void> {
  const url = process.env.LEAD_SHEET_CSV_URL;
  if (!url) {
    console.warn('[Lead] LEAD_SHEET_CSV_URL not set — skipping CRM update');
    return;
  }

  try {
    const payload: LeadUpsert = {
      ...data,
      last_contact_date: new Date().toISOString().split('T')[0],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[Lead] CRM update failed: ${res.status}`);
    }
  } catch (err) {
    console.error('[Lead] Error updating CRM:', err);
  }
}
