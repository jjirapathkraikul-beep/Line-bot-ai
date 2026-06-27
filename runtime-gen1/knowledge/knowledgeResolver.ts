// Gen1 Knowledge Resolver — Phase 10.4
// Selects and loads AIOS knowledge documents based on detected intent and signals.
// Trust-first (SR-SEL-03), medical-first (SR-SEL-04), CID-20 always (SR-SEL-09).

import type { KnowledgeSelectionInput, KnowledgeSelectionResult, KnowledgeSnippet, KnowledgeTrace } from './knowledgeTypes';
import { getSourcesForIntent, ALWAYS_INCLUDE_SOURCES, TRUST_BLOCKED_TYPES } from './knowledgeRegistry';
import { loadKnowledgeFile } from './knowledgeLoader';

// ─── Mandatory synthetic fragments ───────────────────────────────────────────
// Injected as KnowledgeSnippets even if no corresponding file exists.
// Content language: bilingual Thai/EN, matches AIOS-ACE-08 compliance requirement.

const MEDICAL_UNCERTAINTY_FRAGMENT: KnowledgeSnippet = {
  sourcePath:  'AIOS/Mandatory/medical_uncertainty_language',
  title:       'Underwriting Uncertainty Language (Mandatory)',
  content: [
    'MANDATORY UNDERWRITING LANGUAGE — Must appear in all medical underwriting responses.',
    '',
    'TH: บริษัทพิจารณาเป็นรายกรณี — ไม่สามารถรับประกันการรับหรือปฏิเสธล่วงหน้าได้',
    'EN: The company considers each application individually.',
    '    Acceptance or rejection cannot be guaranteed in advance.',
    '    All underwriting decisions depend on the specific health condition, age, and product applied for.',
    '',
    'Source: AIOS-ACE-08, SR-06, ACP-04 Restrictions',
  ].join('\n'),
  charCount:   430,
  trustLevel:  'AUTHORITATIVE',
  freshness:   'SYNTHETIC',
  loadedAt:    0,
  isMandatory: true,
  isCacheHit:  false,
};

const INVESTMENT_RISK_FRAGMENT: KnowledgeSnippet = {
  sourcePath:  'AIOS/Mandatory/investment_risk_disclosure',
  title:       'Investment Risk Disclosure (Mandatory)',
  content: [
    'MANDATORY INVESTMENT RISK DISCLOSURE — Must appear in all ILP / investment-linked responses.',
    '',
    'TH: ผลตอบแทนไม่การันตี ขึ้นอยู่กับผลการลงทุน — มูลค่ากรมธรรม์อาจเพิ่มหรือลดได้',
    'EN: Returns are not guaranteed and depend on investment performance.',
    '    Policy value may increase or decrease.',
    '',
    'Source: AIOS-ACE-08, SR-05, ACP-07 Restrictions',
  ].join('\n'),
  charCount:   340,
  trustLevel:  'AUTHORITATIVE',
  freshness:   'SYNTHETIC',
  loadedAt:    0,
  isMandatory: true,
  isCacheHit:  false,
};

// ─── Minimum relevance threshold ──────────────────────────────────────────────

const MIN_RELEVANCE_SCORE = 0.7;

// ─── Resolver ─────────────────────────────────────────────────────────────────

export async function resolveKnowledge(input: KnowledgeSelectionInput): Promise<KnowledgeSelectionResult> {
  const { intentResult } = input;
  const intent = intentResult.intent;
  const isTrustSignal   = intentResult.flags.isTrustSignal;
  const isMedicalSignal = intentResult.flags.isMedicalSignal;
  const isInvestment    = intent === 'investment_linked';

  const warnings: string[] = [];
  const mandatoryFragmentsAdded: string[] = [];
  let blockedProductDocs = false;

  // Step 1: Get per-intent sources from registry
  let candidateSources = getSourcesForIntent(intent);
  const sourcesConsidered = candidateSources.length + ALWAYS_INCLUDE_SOURCES.length;

  // Step 2: Trust-first filtering (SR-SEL-03)
  // When trust signal is active, block product/recommendation/sales docs.
  // Override intent sources to trust_concern if not already trust/fraud.
  if (isTrustSignal && intent !== 'trust_concern' && intent !== 'fraud_concern') {
    candidateSources = getSourcesForIntent('trust_concern');
    blockedProductDocs = true;
    warnings.push(`SR-SEL-03: trust signal active — overriding ${intent} sources with trust_concern`);
  } else if (isTrustSignal) {
    // Already trust intent — still note if product types would have been blocked
    const hasProductTypes = candidateSources.some((s) => TRUST_BLOCKED_TYPES.has(s.type));
    if (hasProductTypes) {
      blockedProductDocs = true;
      candidateSources = candidateSources.filter((s) => !TRUST_BLOCKED_TYPES.has(s.type));
    }
  }

  // Step 3: Filter by relevance threshold (mandatory sources bypass threshold)
  const selectedSources = candidateSources.filter(
    (s) => s.mandatory || s.relevanceScore >= MIN_RELEVANCE_SCORE,
  );

  // Step 4: Add ALWAYS_INCLUDE (CID-20 etc.) — deduplicate by path
  const selectedPaths = new Set(selectedSources.map((s) => s.path));
  for (const always of ALWAYS_INCLUDE_SOURCES) {
    if (!selectedPaths.has(always.path)) {
      selectedSources.push(always);
      selectedPaths.add(always.path);
    }
  }

  const sourcesSelected = selectedSources.length;
  const mandatorySources = selectedSources.filter((s) => s.mandatory).map((s) => s.path);
  const optionalSources  = selectedSources.filter((s) => !s.mandatory).map((s) => s.path);

  // Step 5: Load each source from disk (via loader with 5-min cache)
  const loadedSnippets: KnowledgeSnippet[] = [];
  const missingSources: string[] = [];
  let cacheHits = 0;

  await Promise.all(
    selectedSources.map(async (source) => {
      const snippet = await loadKnowledgeFile(source.path, { mandatory: source.mandatory });
      if (snippet) {
        if (snippet.isCacheHit) cacheHits++;
        loadedSnippets.push(snippet);
      } else {
        missingSources.push(source.path);
        const severity = source.mandatory ? 'MANDATORY' : 'optional';
        warnings.push(`File not found (${severity}): ${source.path}`);
      }
    }),
  );

  // Step 6: Inject mandatory synthetic fragments
  // Medical uncertainty — required whenever medical signal is active (SR-SEL-04, SR-06)
  if (isMedicalSignal || intent === 'medical_underwriting') {
    loadedSnippets.push({ ...MEDICAL_UNCERTAINTY_FRAGMENT, loadedAt: Date.now() });
    mandatoryFragmentsAdded.push('medical_uncertainty_language');
  }

  // Investment risk disclosure — required for ILP context (SR-05)
  if (isInvestment) {
    loadedSnippets.push({ ...INVESTMENT_RISK_FRAGMENT, loadedAt: Date.now() });
    mandatoryFragmentsAdded.push('investment_risk_disclosure');
  }

  // Step 7: Evaluate mandatory coverage
  const mandatoryMissing = mandatorySources.filter((p) => missingSources.includes(p));
  const mandatoryIncluded = mandatoryMissing.length === 0;
  if (!mandatoryIncluded) {
    for (const mp of mandatoryMissing) {
      warnings.push(`MANDATORY source could not be loaded: ${mp}`);
    }
  }

  // Step 8: Build decision reason
  const parts: string[] = [`intent=${intent}`];
  if (blockedProductDocs) parts.push('trust-blocked product docs');
  if (isMedicalSignal)    parts.push('medical uncertainty fragment injected');
  if (isInvestment)       parts.push('investment risk disclosure injected');
  if (missingSources.length > 0) parts.push(`${missingSources.length} file(s) missing`);
  parts.push(`loaded ${loadedSnippets.length} snippets`);
  const knowledgeDecisionReason = parts.join('; ');

  const knowledgeTrace: KnowledgeTrace = {
    intentUsed:              intent,
    sourcesConsidered,
    sourcesSelected,
    sourcesLoaded:           loadedSnippets.length - mandatoryFragmentsAdded.length,
    sourcesMissing:          missingSources.length,
    mandatoryIncluded,
    mandatoryMissing,
    cacheHits,
    blockedProductDocs,
    mandatoryFragmentsAdded,
    knowledgeDecisionReason,
  };

  return {
    selectedSources,
    loadedSnippets,
    mandatorySources,
    optionalSources,
    missingSources,
    warnings,
    knowledgeTrace,
  };
}
