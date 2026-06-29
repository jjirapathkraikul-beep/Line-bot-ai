// Pattern Report Generator — Phase 12.0B
// Aggregates PatternRecords from KV into a structured JSON report.
// Read-only. No side effects. No LLM calls.

import {
  getPatternByIdFromKv,
  getRecentPatterns,
  getPatternsByCategory,
  getPatternsByIntelligence,
  getHighConfidencePatternsFromKv,
  getRecentPatternIds,
  OPERATIONAL_CATEGORIES,
  type PatternRecord,
  type OperationalCategory,
  type AffectedIntelligence,
} from './patternRecognition';

// ─── Re-export public read helpers ───────────────────────────────────────────
export { getPatternByIdFromKv as getPatternById };
export { getRecentPatterns     as getPatterns };
export { getPatternsByCategory };
export { getPatternsByIntelligence };
export { getHighConfidencePatternsFromKv as getHighConfidencePatterns };

// ─── Report Schema ────────────────────────────────────────────────────────────

export type PatternTrend = 'STABLE' | 'EMERGING' | 'ACCELERATING';

export interface PatternReport {
  generatedAt:          string;
  periodDays:           number;
  totalPatterns:        number;
  patternsDetected:     number;       // patterns with ACTIVE or EMERGING status
  highConfidence:       number;
  mediumConfidence:     number;
  lowConfidence:        number;
  highestFrequency:     number;       // max issueCount across all patterns
  trend:                PatternTrend;
  topPatterns:          PatternRecord[];  // sorted by issueCount desc, top 5
  emergingPatterns:     PatternRecord[];  // status === EMERGING
  resolvedPatterns:     PatternRecord[];  // status === RESOLVED
  affectedIntelligences: AffectedIntelligence[]; // unique intelligences with active patterns
  patternsByCategory:   Record<string, number>;
  recommendations:      string[];
}

// ─── Trend calculation ───────────────────────────────────────────────────────
// Deterministic:
//   Any HIGH confidence pattern → ACCELERATING
//   Any EMERGING pattern (and no HIGH) → EMERGING
//   Otherwise → STABLE

function deriveTrend(patterns: PatternRecord[]): PatternTrend {
  if (patterns.some((p) => p.confidence === 'HIGH'))  return 'ACCELERATING';
  if (patterns.some((p) => p.status === 'EMERGING'))  return 'EMERGING';
  return 'STABLE';
}

// ─── Recommendations ─────────────────────────────────────────────────────────

function buildPatternRecommendations(patterns: PatternRecord[]): string[] {
  const recs: string[] = [];

  const highConf = patterns.filter((p) => p.confidence === 'HIGH');
  if (highConf.length > 0) {
    const names = highConf.map((p) => p.operationalCategory).join(', ');
    recs.push(`CRITICAL: ${highConf.length} HIGH-confidence pattern(s) detected (${names}) — escalate to Architecture Guardian review`);
  }

  const p0Patterns = patterns.filter((p) => (p.severityDistribution.P0 ?? 0) > 0);
  if (p0Patterns.length > 0) {
    recs.push(`${p0Patterns.length} pattern(s) contain P0 severity issues — immediate resolution required`);
  }

  const trustMedical = patterns.filter(
    (p) => p.operationalCategory === 'TRUST' || p.operationalCategory === 'MEDICAL',
  );
  if (trustMedical.length > 0) {
    recs.push(`COMPLIANCE: Trust/Medical patterns detected — verify ACP priority routing and disclaimer fragments`);
  }

  const knowledgeProduct = patterns.filter(
    (p) => p.operationalCategory === 'KNOWLEDGE' || p.operationalCategory === 'PRODUCT',
  );
  if (knowledgeProduct.length > 0) {
    const total = knowledgeProduct.reduce((sum, p) => sum + p.issueCount, 0);
    recs.push(`Product Intelligence gap: ${total} knowledge/product issues across ${knowledgeProduct.length} pattern(s) — expand Knowledge Path Registry`);
  }

  const memoryPattern = patterns.find((p) => p.operationalCategory === 'MEMORY');
  if (memoryPattern) {
    recs.push(`Memory continuity pattern (${memoryPattern.issueCount} issues) — review memoryResolver extraction and session hydration`);
  }

  if (recs.length === 0) {
    recs.push('No critical patterns detected — maintain current learning cycle cadence');
  }

  return recs;
}

// ─── Report generation ────────────────────────────────────────────────────────

export async function generatePatternReport(periodDays = 30): Promise<PatternReport> {
  const generatedAt = new Date().toISOString();

  // Fetch all patterns via recent index (up to 50, one per category max in MVP)
  const allPatterns = await getRecentPatterns(50);

  const activePatterns  = allPatterns.filter((p) => p.status === 'ACTIVE' || p.status === 'EMERGING');
  const emergingPatterns = allPatterns.filter((p) => p.status === 'EMERGING');
  const resolvedPatterns = allPatterns.filter((p) => p.status === 'RESOLVED');

  const highConf   = allPatterns.filter((p) => p.confidence === 'HIGH').length;
  const mediumConf = allPatterns.filter((p) => p.confidence === 'MEDIUM').length;
  const lowConf    = allPatterns.filter((p) => p.confidence === 'LOW').length;

  const highestFrequency = allPatterns.reduce((max, p) => Math.max(max, p.issueCount), 0);

  const topPatterns = [...allPatterns]
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 5);

  const affectedIntelligences: AffectedIntelligence[] = [
    ...new Set(activePatterns.map((p) => p.affectedIntelligence)),
  ];

  const patternsByCategory: Record<string, number> = {};
  for (const cat of OPERATIONAL_CATEGORIES) {
    const match = allPatterns.find((p) => p.operationalCategory === cat);
    patternsByCategory[cat] = match?.issueCount ?? 0;
  }

  const trend           = deriveTrend(activePatterns);
  const recommendations = buildPatternRecommendations(activePatterns);

  const report: PatternReport = {
    generatedAt,
    periodDays,
    totalPatterns:        allPatterns.length,
    patternsDetected:     activePatterns.length,
    highConfidence:       highConf,
    mediumConfidence:     mediumConf,
    lowConfidence:        lowConf,
    highestFrequency,
    trend,
    topPatterns:          topPatterns.slice(0, 5),
    emergingPatterns,
    resolvedPatterns,
    affectedIntelligences,
    patternsByCategory,
    recommendations,
  };

  console.log('[PATTERN_REPORT]', JSON.stringify({
    generatedAt,
    totalPatterns:    report.totalPatterns,
    patternsDetected: report.patternsDetected,
    highConfidence:   highConf,
    trend,
    recommendations:  recommendations.length,
  }));

  return report;
}
