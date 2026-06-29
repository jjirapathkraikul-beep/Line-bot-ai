// Pattern Recognition Engine — Phase 12.0B
// Transforms individual IssueRecords into reusable AIOS Learning Patterns.
// READ-ONLY: never modifies Issues, Audits, Conversations, or Runtime.
// Runs asynchronously — NEVER blocks customer-facing responses.
// No LLM calls. Deterministic rules only.

import { getKvClient } from '../observability/kvClient';
import {
  getIssuesByCategoryFromKv,
  type IssueRecord,
  type IssueCategory,
  type IssueSeverity,
} from '../observability/issueDatabase';

// ─── TTL ──────────────────────────────────────────────────────────────────────

export const PATTERN_TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days

// ─── Types ────────────────────────────────────────────────────────────────────

// Level 1 — Operational Pattern: answers "What is happening?"
export type OperationalCategory =
  | 'MEMORY'
  | 'KNOWLEDGE'
  | 'COMMERCIAL'
  | 'CONVERSATION'
  | 'PRODUCT'
  | 'TRUST'
  | 'MEDICAL'
  | 'HANDOFF';

// Level 2 — Architectural Pattern: answers "Which Intelligence should improve?"
export type AffectedIntelligence =
  | 'Conversation Intelligence'
  | 'Customer Intelligence'
  | 'Commercial Intelligence'
  | 'Product Intelligence'
  | 'Learning Intelligence'
  | 'Business Intelligence'
  | 'Advisor Intelligence';

// Confidence rules (deterministic, frequency-based):
//   issueCount < 3  → LOW
//   issueCount 3–9  → MEDIUM
//   issueCount >= 10 → HIGH
export type PatternConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

// Status lifecycle:
//   issueCount === 1 → EMERGING (pattern just forming)
//   issueCount >= 2  → ACTIVE   (confirmed recurring pattern)
//   MONITORING / RESOLVED: set externally (future phases)
export type PatternStatus = 'EMERGING' | 'ACTIVE' | 'MONITORING' | 'RESOLVED';

export interface PatternRecord {
  patternId:            string;                        // PATTERN-{CATEGORY}-001
  patternName:          string;
  operationalCategory:  OperationalCategory;           // Level 1 classification
  affectedIntelligence: AffectedIntelligence;          // Level 2 classification (mandatory)
  issueCount:           number;
  confidence:           PatternConfidence;
  severityDistribution: Record<IssueSeverity, number>; // P0/P1/P2/P3 breakdown
  firstSeen:            string;                        // ISO timestamp
  lastSeen:             string;                        // ISO timestamp
  relatedIssueIds:      string[];                      // max 50
  suggestedOwner:       string;
  status:               PatternStatus;
  createdAt:            string;
  updatedAt:            string;
}

export interface PatternSummary {
  scannedCategories: number;
  patternsDetected:  number;  // categories with at least 1 issue
  patternsCreated:   number;  // new pattern records written to KV
  patternsUpdated:   number;  // existing pattern records refreshed
  highConfidence:    number;
  mediumConfidence:  number;
  lowConfidence:     number;
  errors:            number;
}

// ─── Classification Tables ────────────────────────────────────────────────────
//
// Operational → Architectural mapping (Architecture Guardian requirement).
// Every pattern MUST identify its Affected Intelligence.

export const INTELLIGENCE_MAP: Record<OperationalCategory, AffectedIntelligence> = {
  MEMORY:       'Customer Intelligence',       // Memory loss → Customer Intelligence
  KNOWLEDGE:    'Product Intelligence',        // Knowledge gap → Product Intelligence
  COMMERCIAL:   'Commercial Intelligence',     // Conversion issues → Commercial Intelligence
  CONVERSATION: 'Conversation Intelligence',   // Flow failures → Conversation Intelligence
  PRODUCT:      'Product Intelligence',        // Product confusion → Product Intelligence
  TRUST:        'Conversation Intelligence',   // Trust failures → Conversation Intelligence
  MEDICAL:      'Conversation Intelligence',   // Medical flow → Conversation Intelligence
  HANDOFF:      'Advisor Intelligence',        // Wrong handoff timing → Advisor Intelligence
};

const PATTERN_NAMES: Record<OperationalCategory, string> = {
  MEMORY:       'Repeated Memory Continuity Issues',
  KNOWLEDGE:    'Repeated Knowledge Gap Failures',
  COMMERCIAL:   'Repeated Commercial Conversion Issues',
  CONVERSATION: 'Repeated Conversation Flow Failures',
  PRODUCT:      'Repeated Product Knowledge Gaps',
  TRUST:        'Repeated Trust Flow Issues',
  MEDICAL:      'Repeated Medical Flow Issues',
  HANDOFF:      'Repeated Handoff Timing Issues',
};

const PATTERN_OWNERS: Record<OperationalCategory, string> = {
  MEMORY:       'Customer Intelligence Team',
  KNOWLEDGE:    'Product Intelligence Team',
  COMMERCIAL:   'Commercial Intelligence Team',
  CONVERSATION: 'Conversation Intelligence Team',
  PRODUCT:      'Product Intelligence Team',
  TRUST:        'Conversation Intelligence Team',
  MEDICAL:      'Conversation Intelligence Team',
  HANDOFF:      'Advisor Intelligence Team',
};

export const OPERATIONAL_CATEGORIES: OperationalCategory[] = [
  'MEMORY', 'KNOWLEDGE', 'COMMERCIAL', 'CONVERSATION',
  'PRODUCT', 'TRUST', 'MEDICAL', 'HANDOFF',
];

// ─── Pure deterministic functions ─────────────────────────────────────────────

export function mapCategoryToIntelligence(category: OperationalCategory): AffectedIntelligence {
  return INTELLIGENCE_MAP[category];
}

export function mapCategoryToPatternName(category: OperationalCategory): string {
  return PATTERN_NAMES[category];
}

export function mapCategoryToOwner(category: OperationalCategory): string {
  return PATTERN_OWNERS[category];
}

export function calculateConfidence(issueCount: number): PatternConfidence {
  if (issueCount >= 10) return 'HIGH';
  if (issueCount >= 3)  return 'MEDIUM';
  return 'LOW';
}

export function derivePatternStatus(issueCount: number): PatternStatus {
  return issueCount === 1 ? 'EMERGING' : 'ACTIVE';
}

export function buildSeverityDistribution(
  issues: IssueRecord[],
): Record<IssueSeverity, number> {
  const dist: Record<IssueSeverity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const issue of issues) {
    if (issue.severity in dist) {
      dist[issue.severity as IssueSeverity]++;
    }
  }
  return dist;
}

// ─── KV helpers ───────────────────────────────────────────────────────────────

function intelligenceKvKey(intelligence: AffectedIntelligence): string {
  return intelligence.replace(/ /g, '_');
}

// ─── Pattern upsert ───────────────────────────────────────────────────────────
// If a pattern for this category already exists in KV, update it (preserve createdAt/firstSeen).
// If new, create and push to all index lists.

async function upsertPattern(
  category: OperationalCategory,
  issues: IssueRecord[],
): Promise<{ pattern: PatternRecord; isNew: boolean }> {
  const kv        = getKvClient();
  const patternId = `PATTERN-${category}-001`;
  const now       = new Date().toISOString();

  // Load existing record (if any) to preserve firstSeen and createdAt
  const existingRaw = await kv.get(`pattern:byId:${patternId}`);
  const existing    = existingRaw ? (JSON.parse(existingRaw) as PatternRecord) : null;

  const sorted   = [...issues].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const firstSeen = existing?.firstSeen ?? (sorted[0]?.createdAt ?? now);
  const lastSeen  = sorted[sorted.length - 1]?.createdAt ?? now;

  const pattern: PatternRecord = {
    patternId,
    patternName:          PATTERN_NAMES[category],
    operationalCategory:  category,
    affectedIntelligence: INTELLIGENCE_MAP[category],
    issueCount:           issues.length,
    confidence:           calculateConfidence(issues.length),
    severityDistribution: buildSeverityDistribution(issues),
    firstSeen,
    lastSeen,
    relatedIssueIds:  issues.map((i) => i.issueId).slice(0, 50),
    suggestedOwner:   PATTERN_OWNERS[category],
    status:           derivePatternStatus(issues.length),
    createdAt:        existing?.createdAt ?? now,
    updatedAt:        now,
  };

  // Persist the record
  await kv.set(`pattern:byId:${patternId}`, JSON.stringify(pattern), { ex: PATTERN_TTL_SECONDS });

  const isNew = existing === null;

  // Only push to index lists on first creation (avoids duplicate entries)
  if (isNew) {
    await kv.lpush('pattern:recent', patternId);
    await kv.expire('pattern:recent', PATTERN_TTL_SECONDS);
    await kv.lpush(`pattern:category:${category}`, patternId);
    await kv.expire(`pattern:category:${category}`, PATTERN_TTL_SECONDS);
    await kv.lpush(
      `pattern:intelligence:${intelligenceKvKey(pattern.affectedIntelligence)}`,
      patternId,
    );
    await kv.expire(
      `pattern:intelligence:${intelligenceKvKey(pattern.affectedIntelligence)}`,
      PATTERN_TTL_SECONDS,
    );
  }

  const logEvent = isNew ? 'pattern_created' : 'pattern_updated';
  console.log(`[${isNew ? 'PATTERN_CREATED' : 'PATTERN_UPDATED'}]`, JSON.stringify({
    event:               logEvent,
    patternId,
    operationalCategory: category,
    affectedIntelligence: pattern.affectedIntelligence,
    issueCount:          pattern.issueCount,
    confidence:          pattern.confidence,
    status:              pattern.status,
  }));

  return { pattern, isNew };
}

// ─── Run Pattern Recognition ──────────────────────────────────────────────────
// Scans all 8 operational categories.
// For each category with issues in KV, creates or updates a PatternRecord.
// Returns a PatternSummary. Never throws.

export async function runPatternRecognition(limit = 200): Promise<PatternSummary> {
  const summary: PatternSummary = {
    scannedCategories: 0,
    patternsDetected:  0,
    patternsCreated:   0,
    patternsUpdated:   0,
    highConfidence:    0,
    mediumConfidence:  0,
    lowConfidence:     0,
    errors:            0,
  };

  for (const category of OPERATIONAL_CATEGORIES) {
    summary.scannedCategories++;
    try {
      const issues = await getIssuesByCategoryFromKv(category as IssueCategory, limit);
      if (issues.length === 0) continue;

      summary.patternsDetected++;
      const { pattern, isNew } = await upsertPattern(category, issues);

      if (isNew) summary.patternsCreated++;
      else       summary.patternsUpdated++;

      if (pattern.confidence === 'HIGH')   summary.highConfidence++;
      else if (pattern.confidence === 'MEDIUM') summary.mediumConfidence++;
      else summary.lowConfidence++;

    } catch (err) {
      summary.errors++;
      console.error('[PATTERN_RECOGNITION_ERROR]', JSON.stringify({
        category,
        error: String(err),
      }));
    }
  }

  console.log('[PATTERN_RECOGNITION]', JSON.stringify({
    event: 'run_complete',
    ...summary,
  }));

  return summary;
}

// ─── Async KV read helpers ────────────────────────────────────────────────────

export async function getPatternByIdFromKv(patternId: string): Promise<PatternRecord | null> {
  try {
    const raw = await getKvClient().get(`pattern:byId:${patternId}`);
    return raw ? (JSON.parse(raw) as PatternRecord) : null;
  } catch (err) {
    console.error('[PATTERN_READ_ERROR]', String(err));
    return null;
  }
}

export async function getRecentPatternIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('pattern:recent', 0, limit - 1);
  } catch (err) {
    console.error('[PATTERN_READ_ERROR]', String(err));
    return [];
  }
}

export async function getPatternIdsByCategory(
  category: OperationalCategory,
  limit = 20,
): Promise<string[]> {
  try {
    return await getKvClient().lrange(`pattern:category:${category}`, 0, limit - 1);
  } catch (err) {
    console.error('[PATTERN_READ_ERROR]', String(err));
    return [];
  }
}

export async function getPatternIdsByIntelligence(
  intelligence: AffectedIntelligence,
  limit = 20,
): Promise<string[]> {
  try {
    return await getKvClient().lrange(
      `pattern:intelligence:${intelligenceKvKey(intelligence)}`,
      0,
      limit - 1,
    );
  } catch (err) {
    console.error('[PATTERN_READ_ERROR]', String(err));
    return [];
  }
}

async function fetchPatternsByIds(ids: string[]): Promise<PatternRecord[]> {
  const results = await Promise.all(ids.map((id) => getPatternByIdFromKv(id)));
  return results.filter((r): r is PatternRecord => r !== null);
}

export async function getRecentPatterns(limit = 20): Promise<PatternRecord[]> {
  const ids = await getRecentPatternIds(limit);
  return fetchPatternsByIds(ids);
}

export async function getPatternsByCategory(
  category: OperationalCategory,
  limit = 20,
): Promise<PatternRecord[]> {
  const ids = await getPatternIdsByCategory(category, limit);
  return fetchPatternsByIds(ids);
}

export async function getPatternsByIntelligence(
  intelligence: AffectedIntelligence,
  limit = 20,
): Promise<PatternRecord[]> {
  const ids = await getPatternIdsByIntelligence(intelligence, limit);
  return fetchPatternsByIds(ids);
}

export async function getHighConfidencePatternsFromKv(limit = 20): Promise<PatternRecord[]> {
  const ids     = await getRecentPatternIds(limit * 3);
  const patterns = await fetchPatternsByIds(ids);
  return patterns.filter((p) => p.confidence === 'HIGH').slice(0, limit);
}
