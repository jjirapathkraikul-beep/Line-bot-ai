// Root Cause Analysis Engine — Phase 12.0C
// Reads PatternRecords from KV and generates structured RootCauseRecords.
// READ-ONLY: never modifies Patterns, Issues, Audits, Conversations, or Runtime.
// Deterministic rules only. No LLM calls. Never blocks customer runtime.

import { getKvClient } from '../observability/kvClient';
import {
  getRecentPatternIds,
  getPatternByIdFromKv,
  type PatternRecord,
  type OperationalCategory,
  type AffectedIntelligence,
  type PatternConfidence,
} from './patternRecognition';

// ─── TTL ──────────────────────────────────────────────────────────────────────

export const ROOTCAUSE_TTL_SECONDS = 180 * 24 * 60 * 60; // 180 days

// ─── Types ────────────────────────────────────────────────────────────────────

// Root Cause Categories — answers "What systemic issue caused this pattern?"
// Maps from observation (Pattern) to system-design explanation (Root Cause).
export type RootCauseCategory =
  | 'Knowledge Gap'
  | 'Memory Weakness'
  | 'Conversation Design'
  | 'Commercial Logic'
  | 'Recommendation Timing'
  | 'Trust Strategy'
  | 'Medical Flow'
  | 'Product Coverage'
  | 'Architecture Debt'
  | 'Governance Gap'
  | 'Unknown';

export type RootCauseStatus = 'OPEN' | 'LINKED' | 'RESOLVED';

export interface RootCauseRecord {
  rootCauseId:          string;              // RCA-{CATEGORY}-001
  patternId:            string;              // links to PatternRecord
  rootCauseCategory:    RootCauseCategory;
  affectedIntelligence: AffectedIntelligence;
  affectedCapability:   string;
  description:          string;
  confidence:           PatternConfidence;   // inherited from PatternRecord
  evidence:             string[];
  supportingPatterns:   string[];            // patternIds
  createdAt:            string;
  status:               RootCauseStatus;
}

export interface RootCauseAnalysisResult {
  patternsAnalyzed:   number;
  rootCausesCreated:  number;
  rootCausesUpdated:  number;
  errors:             number;
}

// ─── Classification Tables ────────────────────────────────────────────────────

// Operational Pattern → Root Cause Category
// Each mapping explains WHY this class of issue occurs at the system level.
export const ROOT_CAUSE_CATEGORY_MAP: Record<OperationalCategory, RootCauseCategory> = {
  KNOWLEDGE:    'Knowledge Gap',
  MEMORY:       'Memory Weakness',
  CONVERSATION: 'Conversation Design',
  COMMERCIAL:   'Commercial Logic',
  PRODUCT:      'Product Coverage',
  TRUST:        'Trust Strategy',
  MEDICAL:      'Medical Flow',
  HANDOFF:      'Recommendation Timing',
};

// Operational Pattern → Primary Affected Capability
const CAPABILITY_MAP: Record<OperationalCategory, string> = {
  KNOWLEDGE:    'knowledgeResolver (runtime-gen1/knowledge/knowledgeResolver.ts)',
  MEMORY:       'memoryResolver (runtime-gen1/memory/memoryResolver.ts)',
  CONVERSATION: 'strategyEngine (runtime-gen1/conversation/strategyEngine.ts)',
  COMMERCIAL:   'ACP-11 Lead Capture (CapabilityPackages/ACP-11_LEAD_CAPTURE/)',
  PRODUCT:      'knowledgeRegistry (runtime-gen1/knowledge/knowledgeRegistry.ts)',
  TRUST:        'CAP-002 Trust Engine (runtime-gen1/capability/intentDetector.ts)',
  MEDICAL:      'CAP-003 Medical Engine (CapabilityPackages/ACP-04_MEDICAL_ADVISOR/)',
  HANDOFF:      'ACP-17 Human Handoff (CapabilityPackages/ACP-17_HUMAN_HANDOFF/)',
};

// Root Cause Description Templates (deterministic, no LLM)
const DESCRIPTION_TEMPLATES: Record<OperationalCategory, string> = {
  KNOWLEDGE:    'Repeated fallback responses indicate missing or insufficient knowledge coverage. The knowledge resolver fails to match customer intent to available knowledge documents.',
  MEMORY:       'Repeated memory continuity failures indicate session data is not being correctly read, written, or injected into prompt context. Customers are receiving repeated questions for already-captured data.',
  CONVERSATION: 'Repeated conversation flow failures indicate the strategy engine is selecting inappropriate strategies for the customer context, resulting in poor turn-by-turn quality.',
  COMMERCIAL:   'Repeated commercial conversion failures indicate lead capture timing, qualification logic, or recommendation sequencing is not aligned with customer readiness signals.',
  PRODUCT:      'Repeated product knowledge failures indicate gaps in the Product Knowledge Base or Knowledge Path Registry. The system cannot accurately answer product-specific customer questions.',
  TRUST:        'Repeated trust flow failures indicate the trust detection and response system is not correctly identifying or handling customer skepticism and legitimacy concerns.',
  MEDICAL:      'Repeated medical flow failures indicate the medical underwriting response system is missing required disclaimers, providing incorrect guidance, or failing to properly handle health disclosures.',
  HANDOFF:      'Repeated handoff timing failures indicate the system is escalating too early, too late, or with incomplete context, reducing handoff quality and advisor effectiveness.',
};

// ─── Pure helper functions ────────────────────────────────────────────────────

export function mapPatternToRootCauseCategory(
  category: OperationalCategory,
): RootCauseCategory {
  return ROOT_CAUSE_CATEGORY_MAP[category] ?? 'Unknown';
}

export function mapPatternToAffectedCapability(category: OperationalCategory): string {
  return CAPABILITY_MAP[category] ?? 'Unknown capability';
}

function buildEvidence(pattern: PatternRecord): string[] {
  const { P0, P1, P2, P3 } = pattern.severityDistribution;
  return [
    `${pattern.issueCount} ${pattern.operationalCategory} issue(s) detected`,
    `Confidence: ${pattern.confidence} (frequency threshold met)`,
    `Severity distribution — P0: ${P0}, P1: ${P1}, P2: ${P2}, P3: ${P3}`,
    `Pattern active since: ${pattern.firstSeen}`,
    `Last occurrence: ${pattern.lastSeen}`,
    `Affected intelligence: ${pattern.affectedIntelligence}`,
  ];
}

// ─── KV helpers ───────────────────────────────────────────────────────────────

async function upsertRootCause(
  pattern: PatternRecord,
): Promise<{ rootCause: RootCauseRecord; isNew: boolean }> {
  const kv          = getKvClient();
  const rootCauseId = `RCA-${pattern.operationalCategory}-001`;
  const now         = new Date().toISOString();

  const existingRaw = await kv.get(`rootcause:byId:${rootCauseId}`);
  const existing    = existingRaw ? (JSON.parse(existingRaw) as RootCauseRecord) : null;

  const rootCause: RootCauseRecord = {
    rootCauseId,
    patternId:            pattern.patternId,
    rootCauseCategory:    mapPatternToRootCauseCategory(pattern.operationalCategory),
    affectedIntelligence: pattern.affectedIntelligence,
    affectedCapability:   mapPatternToAffectedCapability(pattern.operationalCategory),
    description:          DESCRIPTION_TEMPLATES[pattern.operationalCategory],
    confidence:           pattern.confidence,
    evidence:             buildEvidence(pattern),
    supportingPatterns:   [pattern.patternId],
    createdAt:            existing?.createdAt ?? now,
    status:               existing?.status ?? 'OPEN',
  };

  await kv.set(`rootcause:byId:${rootCauseId}`, JSON.stringify(rootCause), { ex: ROOTCAUSE_TTL_SECONDS });

  const isNew = existing === null;
  const rcCategory = rootCause.rootCauseCategory;

  if (isNew) {
    await kv.lpush('rootcause:recent', rootCauseId);
    await kv.expire('rootcause:recent', ROOTCAUSE_TTL_SECONDS);
    const categoryKey = `rootcause:category:${rcCategory.replace(/ /g, '_')}`;
    await kv.lpush(categoryKey, rootCauseId);
    await kv.expire(categoryKey, ROOTCAUSE_TTL_SECONDS);
  }

  if (isNew) {
    console.log('[ROOT_CAUSE_CREATED]', JSON.stringify({
      rootCauseId,
      rootCauseCategory:    rcCategory,
      affectedIntelligence: rootCause.affectedIntelligence,
      confidence:           rootCause.confidence,
      patternId:            pattern.patternId,
    }));
  }

  return { rootCause, isNew };
}

// ─── Run Root Cause Analysis ──────────────────────────────────────────────────
// Reads recent patterns from KV and generates RootCauseRecords.
// Accepts optional patternIds override (for testing or targeted runs).
// Never throws — all errors are caught and counted.

export async function runRootCauseAnalysis(
  patternIds?: string[],
  limit = 20,
): Promise<RootCauseAnalysisResult> {
  const result: RootCauseAnalysisResult = {
    patternsAnalyzed:  0,
    rootCausesCreated: 0,
    rootCausesUpdated: 0,
    errors:            0,
  };

  let ids: string[];
  try {
    ids = patternIds ?? (await getRecentPatternIds(limit));
  } catch (err) {
    console.error('[ROOT_CAUSE_ANALYSIS_ERROR]', JSON.stringify({ phase: 'fetch_patterns', error: String(err) }));
    return result;
  }

  for (const patternId of ids) {
    try {
      const pattern = await getPatternByIdFromKv(patternId);
      if (!pattern) continue;

      result.patternsAnalyzed++;
      const { isNew } = await upsertRootCause(pattern);
      if (isNew) result.rootCausesCreated++;
      else       result.rootCausesUpdated++;

    } catch (err) {
      result.errors++;
      console.error('[ROOT_CAUSE_ANALYSIS_ERROR]', JSON.stringify({ patternId, error: String(err) }));
    }
  }

  console.log('[ROOT_CAUSE_ANALYSIS]', JSON.stringify({ event: 'run_complete', ...result }));
  return result;
}

// ─── Async KV read helpers ────────────────────────────────────────────────────

export async function getRootCauseByIdFromKv(
  rootCauseId: string,
): Promise<RootCauseRecord | null> {
  try {
    const raw = await getKvClient().get(`rootcause:byId:${rootCauseId}`);
    return raw ? (JSON.parse(raw) as RootCauseRecord) : null;
  } catch (err) {
    console.error('[RCA_READ_ERROR]', String(err));
    return null;
  }
}

export async function getRecentRootCauseIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('rootcause:recent', 0, limit - 1);
  } catch (err) {
    console.error('[RCA_READ_ERROR]', String(err));
    return [];
  }
}

export async function getRecentRootCauses(limit = 20): Promise<RootCauseRecord[]> {
  const ids     = await getRecentRootCauseIds(limit);
  const results = await Promise.all(ids.map((id) => getRootCauseByIdFromKv(id)));
  return results.filter((r): r is RootCauseRecord => r !== null);
}

export async function getRootCausesByCategory(
  category: RootCauseCategory,
  limit = 20,
): Promise<RootCauseRecord[]> {
  try {
    const key = `rootcause:category:${category.replace(/ /g, '_')}`;
    const ids  = await getKvClient().lrange(key, 0, limit - 1);
    const results = await Promise.all(ids.map((id) => getRootCauseByIdFromKv(id)));
    return results.filter((r): r is RootCauseRecord => r !== null);
  } catch (err) {
    console.error('[RCA_READ_ERROR]', String(err));
    return [];
  }
}

// getRootCauses — alias for getRecentRootCauses (public API surface)
export { getRecentRootCauses as getRootCauses };
