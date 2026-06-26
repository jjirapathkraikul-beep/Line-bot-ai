import type { ExtractedData } from './leadCapture';
import { SCORED_FIELDS } from './leadCapture';

// Single source of truth for lead scoring — used by adminNotify and leadService.
export function computeLeadScore(data: ExtractedData): number {
  const filled = SCORED_FIELDS.filter((f) => !!data[f]).length;
  return Math.round((filled / SCORED_FIELDS.length) * 100);
}

export function isHighScore(data: ExtractedData): boolean {
  return computeLeadScore(data) >= 70;
}
