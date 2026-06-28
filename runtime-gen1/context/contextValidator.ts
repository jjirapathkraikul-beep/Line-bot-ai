// Gen1 Context Validator — Phase 10.6
// Validates assembled ExecutionContext before it reaches the LLM adapter.
// Source: AIOS-ACE-13 (28 rules across 5 categories).
//
// Categories:
//   A: Structural Completeness (HARD — 7 rules)
//   B: Safety Rules (HARD — 7 rules)
//   C: Consistency Rules (SOFT — 6 rules)
//   D: Knowledge Quality (SOFT — 5 rules, simplified for Gen1)
//   E: Content Safety (HARD — 3 rules enforced in Gen1)

import type { ExecutionContext, ContextValidationResult, ContextValidationIssue } from './contextTypes';

// Valid action values from RuntimeAction
const VALID_ACTIONS = new Set([
  'answer', 'answer_then_ask', 'build_trust', 'educate', 'recommend',
  'collect_lead', 'handoff', 'emergency_guide', 'claim_guide',
  'discovery', 'redirect', 'fallback', 'wait',
]);

const VALID_QUESTION_STRATEGIES = new Set(['one_question', 'no_question', 'clarifying_only']);
const EMPATHY_ORDER = ['none', 'low', 'medium', 'high', 'critical'];

function empathyAtLeast(level: string, min: string): boolean {
  return EMPATHY_ORDER.indexOf(level) >= EMPATHY_ORDER.indexOf(min);
}

// ─── Category A: Structural Completeness (HARD) ───────────────────────────────

function validateCategoryA(ctx: ExecutionContext, issues: ContextValidationIssue[]): void {
  // VAL-A-01: capability populated
  if (!ctx.capability.primary.id) {
    issues.push({ ruleId: 'VAL-A-01', severity: 'HARD', message: 'selected_capabilities.primary is not populated' });
  }

  // VAL-A-02: decision.action valid
  if (!ctx.decision.action || !VALID_ACTIONS.has(ctx.decision.action)) {
    issues.push({ ruleId: 'VAL-A-02', severity: 'HARD', message: `decision.action '${ctx.decision.action}' is not a valid action taxonomy value` });
  }

  // VAL-A-03: response_profile.tone set
  if (!ctx.responseProfile.tone) {
    issues.push({ ruleId: 'VAL-A-03', severity: 'HARD', message: 'response_profile.tone is not set' });
  }

  // VAL-A-04: response_profile.question_strategy set
  if (!ctx.responseProfile.questionStrategy || !VALID_QUESTION_STRATEGIES.has(ctx.responseProfile.questionStrategy)) {
    issues.push({ ruleId: 'VAL-A-04', severity: 'HARD', message: `response_profile.question_strategy '${ctx.responseProfile.questionStrategy}' is not valid` });
  }

  // VAL-A-05: restrictions.hard_prohibitions not empty
  if (!ctx.restrictions.hardProhibitions || ctx.restrictions.hardProhibitions.length === 0) {
    issues.push({ ruleId: 'VAL-A-05', severity: 'HARD', message: 'restrictions.hard_prohibitions is empty — minimum global prohibitions must be present' });
  }

  // VAL-A-06: request.normalized_input not empty
  if (!ctx.request.normalizedInput || ctx.request.normalizedInput.trim() === '') {
    issues.push({ ruleId: 'VAL-A-06', severity: 'HARD', message: 'request.normalized_input is empty' });
  }

  // VAL-A-07: CID-20 master patterns included (via knowledge trace)
  const hasCid20 = ctx.knowledge.mandatoryFragmentsIncluded.length > 0 ||
    ctx.knowledge.sources.some((s) => s.fullPath.includes('CONVERSATION_PATTERNS'));
  if (!hasCid20) {
    // Soft in Gen1 — CID-20 is loaded by knowledgeResolver but might be empty if no AIOS files exist
    issues.push({ ruleId: 'VAL-A-07', severity: 'SOFT', message: 'CID-20 master conversation patterns not confirmed in knowledge sources (check knowledgeResolver)' });
  }
}

// ─── Category B: Safety Rules (HARD) ─────────────────────────────────────────

function validateCategoryB(ctx: ExecutionContext, issues: ContextValidationIssue[]): void {
  const { trustPolicy, decision, responseProfile, intent, leadPolicy } = ctx;

  // VAL-B-01: trust active + turns < 2 → action must NOT be collect_lead
  if (trustPolicy.trustConcernActive) {
    const turnsSince = trustPolicy.turnsSinceTrustConcern ?? 0;
    if (turnsSince < 2 && decision.action === 'collect_lead') {
      issues.push({ ruleId: 'VAL-B-01', severity: 'HARD', message: 'SAFETY: trust_concern_active AND turns < 2, but decision.action = collect_lead — must be build_trust' });
    }
  }

  // VAL-B-02: trust active → cta_allowed must be false
  if (trustPolicy.trustConcernActive && responseProfile.ctaAllowed) {
    issues.push({ ruleId: 'VAL-B-02', severity: 'HARD', message: 'SAFETY: trust_concern_active = true but cta_allowed = true — must be false' });
  }

  // VAL-B-03: emergency → action must be emergency_guide or handoff
  if (intent.isEmergency && decision.action !== 'emergency_guide' && decision.action !== 'handoff') {
    issues.push({ ruleId: 'VAL-B-03', severity: 'HARD', message: `SAFETY: emergency_detected = true but action = '${decision.action}' — must be emergency_guide or handoff` });
  }

  // VAL-B-04: medical → hard_prohibitions must include medical guarantee prohibition
  if (intent.isMedicalSignal || ctx.medicalPolicy.medicalConcernActive) {
    const hasMedicalProhibition = ctx.restrictions.hardProhibitions.some(
      (p) => p.includes('NEVER guarantee') && p.includes('medical'),
    );
    if (!hasMedicalProhibition) {
      issues.push({ ruleId: 'VAL-B-04', severity: 'HARD', message: 'SAFETY: medical signal present but medical guarantee prohibition missing from hard_prohibitions' });
    }
  }

  // VAL-B-05: investment → hard_prohibitions must include investment return guarantee prohibition
  if (intent.primary === 'investment_linked') {
    const hasInvestmentProhibition = ctx.restrictions.hardProhibitions.some(
      (p) => p.includes('NEVER') && (p.includes('return') || p.includes('guarantee') || p.includes('investment')),
    );
    if (!hasInvestmentProhibition) {
      issues.push({ ruleId: 'VAL-B-05', severity: 'HARD', message: 'SAFETY: investment intent detected but investment return guarantee prohibition missing from hard_prohibitions' });
    }
  }

  // VAL-B-06: collect_lead → leadCaptureAllowed must be true
  if (decision.action === 'collect_lead' && !leadPolicy.captureAllowed) {
    issues.push({ ruleId: 'VAL-B-06', severity: 'HARD', message: 'SAFETY: decision.action = collect_lead but lead_capture_allowed = false' });
  }

  // VAL-B-07: collect_lead → field being requested must NOT be in knownFields
  if (decision.action === 'collect_lead' && decision.askField) {
    if (leadPolicy.knownFields.includes(decision.askField)) {
      issues.push({ ruleId: 'VAL-B-07', severity: 'HARD', message: `SAFETY: collect_lead asks for '${decision.askField}' but it is already in known fields — CP-05 violation` });
    }
  }
}

// ─── Category C: Consistency Rules (SOFT) ────────────────────────────────────

function validateCategoryC(ctx: ExecutionContext, issues: ContextValidationIssue[]): void {
  const { capability, decision, responseProfile, memory } = ctx;

  // VAL-C-01: CRITICAL priority → action should be build_trust or emergency_guide
  if (capability.priority === 'CRITICAL' &&
      decision.action !== 'build_trust' &&
      decision.action !== 'emergency_guide') {
    issues.push({ ruleId: 'VAL-C-01', severity: 'SOFT', message: `Capability priority = CRITICAL but action = '${decision.action}' — expected build_trust or emergency_guide` });
  }

  // VAL-C-02: empathy_required (HIGH or CRITICAL) → empathy_level at least medium
  if (capability.priority === 'CRITICAL' || capability.priority === 'HIGH') {
    if (!empathyAtLeast(responseProfile.empathyLevel, 'medium')) {
      issues.push({ ruleId: 'VAL-C-02', severity: 'SOFT', message: `High-priority context but empathy_level = '${responseProfile.empathyLevel}' — should be at least medium` });
    }
  }

  // VAL-C-03: recommend → known_facts should contain at least interest_category or age
  if (decision.action === 'recommend') {
    const hasInterestOrAge = memory.knownFacts.some(
      (f) => f.field === 'interest_category' || f.field === 'age',
    );
    if (!hasInterestOrAge) {
      issues.push({ ruleId: 'VAL-C-03', severity: 'SOFT', message: 'action = recommend but memory has no interest_category or age — recommendation may lack basis' });
    }
  }

  // VAL-C-04: unresolved question → response should address it (advisory only)
  if (ctx.message.unresolvedQuestion) {
    issues.push({ ruleId: 'VAL-C-04', severity: 'SOFT', message: `Unresolved question from prior turn: "${ctx.message.unresolvedQuestion}" — LLM should address it` });
  }

  // VAL-C-05: one_question strategy → decision should not produce more than one question
  if (responseProfile.questionStrategy === 'one_question' && decision.constraints.length > 3) {
    // Heuristic: too many constraints may produce more than one question
    issues.push({ ruleId: 'VAL-C-05', severity: 'SOFT', message: 'question_strategy = one_question but many constraints present — verify LLM will ask exactly one question' });
  }

  // VAL-C-06: known fields not re-requested
  if (decision.askField && ctx.leadPolicy.knownFields.includes(decision.askField)) {
    issues.push({ ruleId: 'VAL-C-06', severity: 'SOFT', message: `decision.askField '${decision.askField}' is already in fields_captured — CP-05 soft warning` });
  }
}

// ─── Category D: Knowledge Quality (SOFT, simplified for Gen1) ───────────────

function validateCategoryD(ctx: ExecutionContext, issues: ContextValidationIssue[]): void {
  // VAL-D-03: all loaded knowledge has relevance >= 0.5
  for (const src of ctx.knowledge.sources) {
    if (src.relevance < 0.5) {
      issues.push({ ruleId: 'VAL-D-03', severity: 'SOFT', message: `Knowledge source '${src.sourceId}' has relevance ${src.relevance} < 0.5 — should be excluded` });
    }
  }

  // VAL-D-05: medical excerpt should contain uncertainty language
  if (ctx.intent.isMedicalSignal || ctx.medicalPolicy.medicalConcernActive) {
    const hasUncertainty = ctx.knowledge.sources.some(
      (s) => s.excerpt.includes('รายกรณี') || s.excerpt.includes('case-by-case') || s.isMandatory,
    );
    if (!hasUncertainty && ctx.knowledge.sources.length > 0) {
      issues.push({ ruleId: 'VAL-D-05', severity: 'SOFT', message: 'Medical context detected but no uncertainty language found in knowledge excerpts — medical_uncertainty_language fragment may be missing' });
    }
  }
}

// ─── Category E: Content Safety (HARD, Gen1 scope) ───────────────────────────

function validateCategoryE(ctx: ExecutionContext, issues: ContextValidationIssue[]): void {
  // VAL-E-01: no LINE-specific tokens in knowledge or decision context
  const contextStr = JSON.stringify({ decision: ctx.decision, knowledge: ctx.knowledge });
  if (contextStr.includes('replyToken') || contextStr.includes('lineUserId') || contextStr.includes('webhook')) {
    issues.push({ ruleId: 'VAL-E-01', severity: 'HARD', message: 'SAFETY: LINE-specific fields detected in decision or knowledge context — must not leak into ExecutionContext' });
  }

  // VAL-E-02: no infrastructure details
  if (contextStr.includes('VERCEL_') || contextStr.includes('process.env') || contextStr.includes('KV_REST')) {
    issues.push({ ruleId: 'VAL-E-02', severity: 'HARD', message: 'SAFETY: Infrastructure/environment details detected in context — must not leak' });
  }

  // VAL-E-03: no raw PII in debug/analytics
  const analyticsStr = JSON.stringify(ctx.analytics);
  if (analyticsStr.includes('phone') || analyticsStr.includes('real_name')) {
    issues.push({ ruleId: 'VAL-E-03', severity: 'HARD', message: 'SAFETY: PII fields present in analytics section — must not appear in audit data' });
  }
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateExecutionContext(context: ExecutionContext): ContextValidationResult {
  const issues: ContextValidationIssue[] = [];

  validateCategoryA(context, issues);
  validateCategoryB(context, issues);
  validateCategoryC(context, issues);
  validateCategoryD(context, issues);
  validateCategoryE(context, issues);

  const hardFailures = issues.filter((i) => i.severity === 'HARD').map((i) => `${i.ruleId}: ${i.message}`);
  const softFailures = issues.filter((i) => i.severity === 'SOFT').map((i) => `${i.ruleId}: ${i.message}`);

  const hasHardFailure  = hardFailures.length > 0;
  const hasSafetyBorE  = issues.some((i) => i.severity === 'HARD' && (i.ruleId.startsWith('VAL-B') || i.ruleId.startsWith('VAL-E')));
  const passed          = !hasHardFailure;
  const safeToSendToLlm = !hasSafetyBorE;

  const action: ContextValidationResult['action'] =
    hasSafetyBorE  ? 'safe_fallback' :
    hasHardFailure ? 'fix_and_retry' :
    'proceed';

  return {
    passed,
    safeToSendToLlm,
    hardFailures,
    softFailures,
    issues,
    action,
  };
}
