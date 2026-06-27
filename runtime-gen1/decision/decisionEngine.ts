// Gen1 Decision Engine — Phase 10.5
// Evaluates decision rules in priority order and returns a fully-typed decision result.
// The LLM does NOT choose the action — ACE makes the decision deterministically.

import type {
  RuntimeDecisionInput,
  RuntimeDecisionResult,
  RuntimeDecisionRuleResult,
  RuntimeDecisionWarning,
  RuntimeDecisionTrace,
} from './decisionTypes';
import { DECISION_RULES, ruleFallback } from './decisionRules';

// Static priority chain — always evaluated CRITICAL → HIGH → STANDARD → LOW
const STATIC_PRIORITY_CHAIN = ['CRITICAL', 'HIGH', 'STANDARD', 'LOW'] as const;

// Decision confidence by priority — deterministic rules are high confidence
const CONFIDENCE_MAP: Record<string, number> = {
  CRITICAL: 0.98,
  HIGH:     0.90,
  STANDARD: 0.80,
  LOW:      0.65,
};

// ─── Engine ───────────────────────────────────────────────────────────────────

export function makeDecision(input: RuntimeDecisionInput): RuntimeDecisionResult {
  const rulesEvaluated: string[] = [];
  const warnings: RuntimeDecisionWarning[] = [];

  // Evaluate rules in priority order; collect first two matches for audit.
  const matches: RuntimeDecisionRuleResult[] = [];

  for (const { id, fn } of DECISION_RULES) {
    rulesEvaluated.push(id);
    const result = fn(input);
    if (result !== null) {
      matches.push(result);
      if (matches.length >= 2) break; // first = decision; second = alternative (audit)
    }
  }

  // ruleFallback always matches — defensive only
  let primary: RuntimeDecisionRuleResult = matches[0] ?? ruleFallback(input);
  const alternative: RuntimeDecisionRuleResult | null = matches[1] ?? null;

  // ── Safety guard: known field protection (CP-05) ─────────────────────────
  // Rules should prevent this, but engine adds a second layer.
  if (primary.askField !== null && input.memoryResult.knownFields.includes(primary.askField)) {
    warnings.push({
      code:     'W01_KNOWN_FIELD_BLOCKED',
      message:  `Rule ${primary.ruleId} attempted to ask known field '${primary.askField}' — blocked by CP-05 Known Field Protection.`,
      severity: 'HARD',
    });
    primary = { ...primary, askField: null, shouldCollectLead: false };
  }

  // ── Safety guard: lead capture while trust is active ──────────────────────
  if (primary.shouldCollectLead && !input.memoryResult.trustMemory.leadCaptureAllowed) {
    warnings.push({
      code:     'W02_LEAD_BLOCKED_BY_TRUST',
      message:  'Lead capture attempted while leadCaptureAllowed=false — blocked by ACP-08.',
      severity: 'HARD',
    });
    primary = { ...primary, shouldCollectLead: false, askField: null };
  }

  // ── Advisory: medical signal without disclaimer flag ──────────────────────
  const hasMedical =
    input.intentResult.flags.isMedicalSignal ||
    input.memoryResult.medicalMemory.medicalConcernActive;
  if (hasMedical && !primary.mustIncludeDisclaimer && primary.action !== 'build_trust') {
    warnings.push({
      code:     'W03_MEDICAL_DISCLAIMER_ADVISORY',
      message:  'Medical signal present but mustIncludeDisclaimer=false — review rule R02 activation.',
      severity: 'SOFT',
    });
  }

  const decisionTrace: RuntimeDecisionTrace = {
    rulesEvaluated,
    ruleMatched:       primary.ruleName,
    ruleMatchedId:     primary.ruleId,
    conditionsMet:     primary.conditionsMet,
    conditionsBlocked: [],           // Phase 10.6 context engine will populate this
    priorityChain:     [...STATIC_PRIORITY_CHAIN],
    confidence:        CONFIDENCE_MAP[primary.priority] ?? 0.65,
    alternativeAction: alternative?.action ?? null,
  };

  return {
    action:                    primary.action,
    priority:                  primary.priority,
    shouldCollectLead:         primary.shouldCollectLead,
    shouldEscalate:            primary.shouldEscalate,
    askField:                  primary.askField,
    mustAnswerFirst:           primary.mustAnswerFirst,
    mustBuildTrust:            primary.mustBuildTrust,
    mustIncludeDisclaimer:     primary.mustIncludeDisclaimer,
    mustIncludeRiskDisclosure: primary.mustIncludeRiskDisclosure,
    allowedCapabilities:       primary.allowedCapabilities,
    blockedCapabilities:       primary.blockedCapabilities,
    reason:                    primary.reason,
    warnings,
    decisionTrace,
  };
}
