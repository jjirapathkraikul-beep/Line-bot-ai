import { FaqRow } from '@/types/faq';

interface FaqCache {
  data: FaqRow[];
  timestamp: number;
}

let faqCache: FaqCache | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function fetchFaq(): Promise<FaqRow[]> {
  if (faqCache && Date.now() - faqCache.timestamp < CACHE_TTL_MS) {
    return faqCache.data;
  }

  const url = process.env.SHEET_CSV_URL;
  if (!url) return faqCache?.data ?? [];

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[Sheet] Fetch failed: ${res.status}`);
      return faqCache?.data ?? [];
    }

    const text = await res.text();
    const lines = text.trim().split('\n');
    const rows = lines.slice(1); // skip header row

    const faqs: FaqRow[] = rows
      .map((row) => {
        const cols = parseCSVRow(row);
        return {
          category: cols[0]?.trim() ?? '',
          question: cols[1]?.trim() ?? '',
          answer: cols[2]?.trim() ?? '',
          keyword: cols[3]?.trim() ?? '',
          updated_at: cols[4]?.trim() ?? '',
        };
      })
      .filter((f) => f.question && f.answer);

    faqCache = { data: faqs, timestamp: Date.now() };
    return faqs;
  } catch (err) {
    console.error('[Sheet] Error fetching FAQ:', err);
    return faqCache?.data ?? [];
  }
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
