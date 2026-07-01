// Deterministic decision rules for Gen1 runtime — Phase 10.5
//
// Rules are evaluated in strict priority order by decisionEngine.ts.
// First matching rule produces the action; no further rules are evaluated.
//
// Rule map (matches Phase 10.5 spec priority order):
//   R01  Trust Before Lead             (CRITICAL)
//   R02  Medical Before Sales          (HIGH)
//   R03  Claim / Hospital Before Lead  (HIGH)
//   R04  Human Request → Handoff       (HIGH)
//   R07  Product Education             (STANDARD)
//   R08  Recommendation                (STANDARD)
//   R07b Lead Capture (safe, neutral)  (STANDARD)
//   R09  Unknown → Clarify / Discover  (LOW)
//   R10  Fallback                      (LOW — always matches)

import type { RuntimeDecisionInput, RuntimeDecisionRuleResult, RuntimeAction, RuntimeDecisionPriority } from './decisionTypes';

// ─── Blocked ACP IDs per context ─────────────────────────────────────────────

// ACPs blocked when trust signal active (ACP-08 Restrictions: no product, no lead, no sales)
const TRUST_BLOCKED_ACPS = ['ACP-11', 'ACP-09', 'ACP-12', 'ACP-10', 'ACP-19'];

// ACP blocked during medical, claim, hospital (lead capture not allowed)
const SUPPORT_BLOCKED_ACPS = ['ACP-11'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeResult(
  ruleId: string,
  ruleName: string,
  action: RuntimeAction,
  priority: RuntimeDecisionPriority,
  overrides: Partial<RuntimeDecisionRuleResult> = {},
): RuntimeDecisionRuleResult {
  return {
    ruleId,
    ruleName,
    action,
    priority,
    shouldCollectLead:        false,
    shouldEscalate:           false,
    askField:                 null,
    mustAnswerFirst:          true,   // CP-01: always answer before asking
    mustBuildTrust:           false,
    mustIncludeDisclaimer:    false,
    mustIncludeRiskDisclosure: false,
    allowedCapabilities:      [],
    blockedCapabilities:      [],
    reason:                   '',
    conditionsMet:            [],
    ...overrides,
  };
}

// Known field protection: pick the first candidate not already in knownFields
function safePick(candidates: readonly string[], knownFields: string[]): string | null {
  for (const c of candidates) {
    if (!knownFields.includes(c)) return c;
  }
  return null;
}

// ─── R01: Trust Before Lead (CRITICAL) ───────────────────────────────────────
// Source: ACP-08 Decision_Rules.md — overrides ALL other capabilities.
// No product, no lead, no data collection when trust signal detected.

export function ruleTrustBeforeLead(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isTrustSignal } = input.intentResult.flags;
  const { trustConcernActive } = input.memoryResult.trustMemory;

  if (!isTrustSignal && !trustConcernActive) return null;

  const conditionsMet: string[] = [];
  if (isTrustSignal)     conditionsMet.push('isTrustSignal=true (current message)');
  if (trustConcernActive) conditionsMet.push('trustConcernActive=true (session state)');

  return makeResult('R01', 'Trust Before Lead', 'build_trust', 'CRITICAL', {
    shouldCollectLead:   false,
    shouldEscalate:      false,   // escalate only if customer explicitly requests Jirawat
    askField:            null,
    mustBuildTrust:      true,
    blockedCapabilities: TRUST_BLOCKED_ACPS,
    reason:             'Trust/fraud signal detected — ACP-08 CRITICAL priority. No lead capture, no product mention, credentials provided.',
    conditionsMet,
  });
}

// ─── R01b: Validation-Risk Handoff (HIGH) ────────────────────────────────────
// Product/legal/contract questions that require policy-specific validation should
// not be answered with unsupported certainty. Route to Jirawat with CRM context.

const VALIDATION_RISK_KEYWORDS = [
  'ไม่คุ้มครอง', 'ยกเว้น', 'ข้อยกเว้น', 'exclusion',
  '120 วัน', '120-day', '120 day', 'โรคที่รอคอย', 'โรครอคอย',
  'รายชื่อโรครอคอย', 'ระยะเวลารอคอย', 'waiting period',
  'มะเร็งไม่คุ้มครอง', 'เนื้องอก', 'ถุงน้ำ', 'cyst',
  'รายการโรค', 'เงื่อนไขกรมธรรม์',
  'นิยามโรคร้ายแรง', 'นิยาม ci', 'เอกสารเคลม', 'ระยะเวลาเคลม',
  'ผ่าตัด', 'ไส้เลื่อน', 'ต้อกระจก', 'ริดสีดวง', 'นิ่ว',
  'ต่อมทอนซิล', 'อะดีนอยด์', 'เส้นเลือดขอด', 'เยื่อบุโพรงมดลูก',
  'adenoid', 'critical illness', 'underwriting',
] as const;

function normDecisionText(text: string): string {
  return text.normalize('NFC').trim().toLowerCase();
}

export function isValidationRiskQuestion(text: string): boolean {
  const n = normDecisionText(text);
  return VALIDATION_RISK_KEYWORDS.some((kw) => n.includes(normDecisionText(kw)));
}

export function ruleValidationRiskHandoff(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  if (!isValidationRiskQuestion(input.runtimeInput.message)) return null;

  const askField = safePick(HANDOFF_CONTACT_FIELDS, input.memoryResult.knownFields);

  return makeResult('R01b', 'Validation-Risk → Jirawat Handoff', 'handoff', 'HIGH', {
    shouldCollectLead: askField !== null,
    shouldEscalate:    true,
    askField,
    mustAnswerFirst:   true,
    reason:            `Validation-risk question detected — avoid unsupported certainty and hand off to Jirawat. ${askField ? `Collecting ${askField} for follow-up.` : 'Contact fields already known.'}`,
    conditionsMet:     ['validation_risk_question=true'],
  });
}

// ─── R02: Medical Before Sales (HIGH) ────────────────────────────────────────
// Source: ACP-04 Decision_Rules.md — case-by-case language mandatory.
// No lead fields asked; only ONE medical follow-up question per turn.

export function ruleMedicalBeforeSales(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isMedicalSignal } = input.intentResult.flags;
  const { medicalConcernActive } = input.memoryResult.medicalMemory;

  if (!isMedicalSignal && !medicalConcernActive) return null;

  const conditionsMet: string[] = [];
  if (isMedicalSignal)     conditionsMet.push('isMedicalSignal=true (current message)');
  if (medicalConcernActive) conditionsMet.push('medicalConcernActive=true (conditions disclosed)');

  return makeResult('R02', 'Medical Before Sales', 'answer_then_ask', 'HIGH', {
    shouldCollectLead:     false,
    askField:              'medical_follow_up',   // sentinel — not a lead field
    mustIncludeDisclaimer: true,                  // case-by-case language mandatory
    mustAnswerFirst:       true,
    blockedCapabilities:   SUPPORT_BLOCKED_ACPS,
    reason:               'Medical signal detected — ACP-04. Case-by-case underwriting language required. No lead fields; ONE medical follow-up only.',
    conditionsMet,
  });
}

// ─── R03: Claim / Hospital Before Lead (HIGH) ─────────────────────────────────
// Source: ACP-15, ACP-16 Decision_Rules.md — no lead capture during support contexts.

export function ruleClaimHospitalBeforeLead(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isEmergency } = input.intentResult.flags;
  const { intent } = input.intentResult;

  const isClaim    = intent === 'claim_question';
  const isHospital = intent === 'hospital_question';

  if (!isClaim && !isHospital && !isEmergency) return null;

  const conditionsMet: string[] = [];
  if (isClaim)    conditionsMet.push('intent=claim_question');
  if (isHospital) conditionsMet.push('intent=hospital_question');
  if (isEmergency) conditionsMet.push('isEmergency=true');

  const action: RuntimeAction =
    isEmergency ? 'emergency_guide' :
    isClaim     ? 'claim_guide'     :
    'answer_then_ask';

  return makeResult('R03', 'Claim / Hospital Before Lead', action, 'HIGH', {
    shouldCollectLead:   false,
    shouldEscalate:      isEmergency,
    askField:            null,
    mustAnswerFirst:     true,
    blockedCapabilities: SUPPORT_BLOCKED_ACPS,
    reason:             isEmergency
      ? 'Emergency detected — ACP-16 immediate guidance. No data collection.'
      : isClaim
      ? 'Claim question — ACP-15 claim process guidance. No lead capture during claim support.'
      : 'Hospital question — ACP-16 network/cost guidance. No lead capture.',
    conditionsMet,
  });
}

// ─── R04: Human Request → Handoff (HIGH) ─────────────────────────────────────
// Source: ACP-17 Decision_Rules.md — warm transfer to Jirawat.
// Exception: handoff MAY collect contact fields (phone/name) for the context package.

const HANDOFF_CONTACT_FIELDS = ['phone', 'real_name', 'preferred_contact_time'] as const;

export function ruleHumanHandoff(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isHumanRequest } = input.intentResult.flags;
  const { intent } = input.intentResult;

  if (!isHumanRequest && intent !== 'human_handoff') return null;

  const { knownFields } = input.memoryResult;
  const askField = safePick(HANDOFF_CONTACT_FIELDS, knownFields);
  const shouldCollectLead = askField !== null;

  return makeResult('R04', 'Human Request → Handoff', 'handoff', 'HIGH', {
    shouldCollectLead,
    shouldEscalate: true,
    askField,
    mustAnswerFirst: true,
    reason:         `Human handoff — ACP-17. ${askField ? `Collecting ${askField} for Jirawat context package.` : 'All contact fields known; ready for handoff.'}`,
    conditionsMet:  [isHumanRequest ? 'isHumanRequest=true' : 'intent=human_handoff'],
  });
}

// ─── Rules 5 & 6 (constraints, not standalone rules) ─────────────────────────
// CP-01 Answer Before Asking → mustAnswerFirst=true (set on all rule results above)
// CP-05 Known Field Protection → safePick() helper prevents asking a known field

// ─── R07: Product Education Before Lead Capture (STANDARD) ───────────────────
// Source: ACP-02/03/05/06/07, CP-03 (Educate Before Capture).
// Education first; lead capture ONLY after value is delivered.

export function ruleProductEducation(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isProductIntent, isPriceIntent } = input.intentResult.flags;
  const { intent } = input.intentResult;

  const isProductOrRelated =
    isProductIntent ||
    isPriceIntent ||
    intent === 'premium_question' ||
    intent === 'price_objection' ||
    intent === 'existing_policy';

  if (!isProductOrRelated) return null;

  const { leadMemory, trustMemory, knownFields } = input.memoryResult;
  const canCaptureLead = leadMemory.valueDelivered && trustMemory.leadCaptureAllowed;

  // Known field protection: memory resolver gives nextBestFieldToAsk; verify it's not known
  const rawAskField = canCaptureLead ? input.memoryResult.nextBestFieldToAsk : null;
  const askField = rawAskField && !knownFields.includes(rawAskField) ? rawAskField : null;
  const shouldCollectLead = askField !== null;

  // If no education yet → educate; else answer+optionally ask
  const action: RuntimeAction = !leadMemory.valueDelivered ? 'educate' : 'answer_then_ask';
  const mustIncludeRiskDisclosure = intent === 'investment_linked';

  const conditionsMet: string[] = [`intent=${intent}`];
  if (leadMemory.valueDelivered) conditionsMet.push('valueDelivered=true');
  if (shouldCollectLead)         conditionsMet.push(`collectLead=>${askField}`);

  return makeResult('R07', 'Product Education Before Lead Capture', action, 'STANDARD', {
    shouldCollectLead,
    shouldEscalate:           false,
    askField,
    mustAnswerFirst:          true,
    mustIncludeRiskDisclosure,
    reason: !leadMemory.valueDelivered
      ? `Product intent '${intent}' — educating customer (CP-03: educate before capture).`
      : askField
      ? `Product intent '${intent}' — value delivered. Collecting ${askField} next.`
      : `Product intent '${intent}' — answering question. No lead field available this turn.`,
    conditionsMet,
  });
}

// ─── R08: Recommendation (STANDARD) ──────────────────────────────────────────
// Source: ACP-09 — personalized recommendation if enough facts are known.
// With insufficient facts → answer first + ask ONE clarifying question.

export function ruleRecommendation(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { isRecommendationIntent } = input.intentResult.flags;
  const { intent } = input.intentResult;

  if (!isRecommendationIntent && intent !== 'recommendation_request') return null;

  const { customerProfile } = input.memoryResult;
  const hasEnoughFacts =
    customerProfile.interest_category !== null &&
    (customerProfile.age !== null || customerProfile.budget_annual !== null);

  const askField: string | null = !hasEnoughFacts
    ? (customerProfile.interest_category === null ? 'interest_category' : 'age')
    : null;

  const conditionsMet = ['intent=recommendation_request'];
  if (hasEnoughFacts) conditionsMet.push('sufficient facts for recommendation');
  else conditionsMet.push(`missing: ${askField}`);

  return makeResult('R08', 'Recommendation Before Handoff', hasEnoughFacts ? 'recommend' : 'answer_then_ask', 'STANDARD', {
    shouldCollectLead: false,
    shouldEscalate:    false,
    askField,
    mustAnswerFirst:   true,
    reason: hasEnoughFacts
      ? 'Recommendation request with sufficient facts — ACP-09 recommendation.'
      : `Recommendation request — insufficient facts (${askField} missing); clarifying first.`,
    conditionsMet,
  });
}

// ─── R07b: Lead Capture (safe neutral context) (STANDARD) ────────────────────
// Fires when all blockers are absent AND value has been delivered AND nextBestFieldToAsk
// is available from Memory Resolver (which already incorporates all blocking logic).

export function ruleLeadCapture(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { trustMemory, leadMemory, knownFields } = input.memoryResult;

  // Trust must allow lead capture
  if (!trustMemory.leadCaptureAllowed) return null;

  // Education guard: value must have been delivered (CP-03)
  if (!leadMemory.valueDelivered) return null;

  // Memory resolver has already applied all blocking logic (trust/medical/claim/hospital/unknown)
  const rawAskField = input.memoryResult.nextBestFieldToAsk;
  if (!rawAskField) return null;

  // Known field protection (CP-05)
  if (knownFields.includes(rawAskField)) return null;

  return makeResult('R07b', 'Lead Capture (Safe)', 'collect_lead', 'STANDARD', {
    shouldCollectLead: true,
    shouldEscalate:    false,
    askField:          rawAskField,
    mustAnswerFirst:   false,   // collect_lead is the primary action this turn
    reason:           `Safe lead capture context. Collecting ${rawAskField} (not yet known, no blockers).`,
    conditionsMet:    ['leadCaptureAllowed=true', 'valueDelivered=true', `askField=${rawAskField}`],
  });
}

// ─── R09: Unknown → Clarify / Discover (LOW) ─────────────────────────────────
// Greeting → answer (welcome). Unknown intent → discovery question.

export function ruleUnknownDiscover(input: RuntimeDecisionInput): RuntimeDecisionRuleResult | null {
  const { intent } = input.intentResult;

  if (intent === 'greeting') {
    return makeResult('R09a', 'Greeting → Answer', 'answer', 'LOW', {
      shouldCollectLead: false,
      mustAnswerFirst:   false,  // answer IS the action; no lead follow-up
      reason:           'Greeting detected — welcome response. No lead capture on first contact.',
      conditionsMet:    ['intent=greeting'],
    });
  }

  if (intent === 'unknown') {
    return makeResult('R09b', 'Unknown → Discovery', 'discovery', 'LOW', {
      shouldCollectLead: false,
      askField:          null,
      reason:           'Intent unclear — ACT-10 discovery question to understand customer need.',
      conditionsMet:    ['intent=unknown'],
    });
  }

  return null;
}

// ─── R10: Fallback (LOW — always matches) ────────────────────────────────────
// ACT-12: generic helpful response when no rule applies.

export function ruleFallback(_input: RuntimeDecisionInput): RuntimeDecisionRuleResult {
  return makeResult('R10', 'Fallback', 'fallback', 'LOW', {
    shouldCollectLead: false,
    mustAnswerFirst:   false,
    reason:           'No specific rule matched — ACT-12 FALLBACK. Always offers a help path.',
    conditionsMet:    ['no-other-rule-matched'],
  });
}

// ─── Ordered rule chain ───────────────────────────────────────────────────────
// Evaluated in order; first match wins (CRITICAL → HIGH → STANDARD → LOW).

export type DecisionRuleFn = (input: RuntimeDecisionInput) => RuntimeDecisionRuleResult | null;

export const DECISION_RULES: ReadonlyArray<{ id: string; name: string; fn: DecisionRuleFn }> = [
  { id: 'R01',  name: 'Trust Before Lead',              fn: ruleTrustBeforeLead         },
  { id: 'R01b', name: 'Validation-Risk Handoff',        fn: ruleValidationRiskHandoff   },
  { id: 'R02',  name: 'Medical Before Sales',           fn: ruleMedicalBeforeSales      },
  { id: 'R03',  name: 'Claim / Hospital Before Lead',   fn: ruleClaimHospitalBeforeLead },
  { id: 'R04',  name: 'Human Request → Handoff',        fn: ruleHumanHandoff            },
  { id: 'R07',  name: 'Product Education',              fn: ruleProductEducation        },
  { id: 'R08',  name: 'Recommendation',                 fn: ruleRecommendation          },
  { id: 'R07b', name: 'Lead Capture (Safe)',            fn: ruleLeadCapture             },
  { id: 'R09',  name: 'Unknown → Discover',             fn: ruleUnknownDiscover         },
  { id: 'R10',  name: 'Fallback',                       fn: ruleFallback                },
] as const;
