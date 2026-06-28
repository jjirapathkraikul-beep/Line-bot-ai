// Gen1 Context Builder — Phase 10.6
// Assembles the canonical ExecutionContext from all upstream resolver outputs.
// Source: AIOS-ACE-03 (15-step pipeline), AIOS-ACE-12 (response profile).

import type {
  ContextBuilderInput,
  ContextBuilderResult,
  ExecutionContext,
  ContextRequest,
  ContextUser,
  ContextSession,
  ContextMessage,
  ContextIntent,
  ContextCapability,
  ContextCapabilityRef,
  ContextMemory,
  KnownContextFact,
  ContextKnowledge,
  ContextKnowledgeFragment,
  ContextDecision,
  ContextConversationStrategy,
  ResponseProfile,
  ContextRestriction,
  ContextRestrictions,
  ContextEscalation,
  ContextLeadPolicy,
  ContextTrustPolicy,
  ContextMedicalPolicy,
  ContextAnalytics,
  ContextTrace,
} from './contextTypes';
import { validateExecutionContext } from './contextValidator';
import { compressExecutionContext } from './contextCompressor';

// ─── Global prohibited phrases (AIOS-ACE-12) ─────────────────────────────────

const GLOBAL_PROHIBITED_PHRASES: string[] = [
  'ผมการันตีว่าจะผ่านการพิจารณา',   // guarantee of acceptance
  'ผลตอบแทนเฉลี่ย',                 // fabricated return rates prefix
  'ราคาถูกที่สุด',                   // cheapest price claim without evidence
  'บริษัทอื่นด้อยกว่า',              // competitor denigration
  'ต้องตัดสินใจวันนี้เท่านั้น',       // urgency pressure tactic
  'ไม่ใช่มิจฉาชีพครับ',              // self-denial without evidence during trust concern
];

// Context-specific hard prohibition strings
const MEDICAL_GUARANTEE_PROHIBITION =
  'NEVER guarantee acceptance or rejection for any medical condition — case-by-case only (ACP-04)';
const INVESTMENT_RETURN_PROHIBITION =
  'NEVER quote specific return rates or guarantee investment performance (ACP-07)';

// ─── Step 01: Request ─────────────────────────────────────────────────────────

function buildRequest(input: ContextBuilderInput): ContextRequest {
  const { runtimeInput } = input;
  // NFC normalize + trim
  const normalized = runtimeInput.message
    .normalize('NFC')
    .toLowerCase()
    .trim();

  // Derive session ID from userId (Gen1 has no dedicated session ID field yet)
  const sessionId = `sess-${runtimeInput.userId.substring(0, 12)}`;

  return {
    rawInput:        runtimeInput.message,
    normalizedInput: normalized,
    channel:         'line',   // Gen1 is LINE-only at adapter level; context is channel-agnostic
    timestamp:       runtimeInput.timestamp,
    turnNumber:      1,        // Phase 10.6: turn tracking not yet implemented
    sessionId,
  };
}

// ─── Step 02 / User ──────────────────────────────────────────────────────────

function buildUser(input: ContextBuilderInput): ContextUser {
  const { runtimeInput, memoryResult } = input;
  const { customerProfile } = memoryResult;

  // Detect language heuristic: Thai characters present?
  const thaiPattern = /[฀-๿]/;
  const latinPattern = /[a-zA-Z]/;
  const hasThai  = thaiPattern.test(runtimeInput.message);
  const hasLatin = latinPattern.test(runtimeInput.message);
  const language = hasThai && hasLatin ? 'mixed' : hasThai ? 'th' : 'en';

  return {
    userId:      `${runtimeInput.userId.substring(0, 8)}***`,   // masked
    displayName: customerProfile.real_name ?? runtimeInput.displayName ?? null,
    language,
    isReturning: memoryResult.knownFields.length > 0,
  };
}

// ─── Step 03 / Session ───────────────────────────────────────────────────────

function buildSession(input: ContextBuilderInput): ContextSession {
  const { memoryResult, runtimeInput } = input;
  const { conversationMemory } = memoryResult;

  return {
    sessionId:   `sess-${runtimeInput.userId.substring(0, 12)}`,
    turnCount:   conversationMemory.turnCount,
    activeState: conversationMemory.currentState,
    priorState:  conversationMemory.priorState,
  };
}

// ─── Step 03 / Message (conversation context stub) ───────────────────────────
// Phase 10.6: no conversation history available; stubs empty.

function buildMessage(input: ContextBuilderInput): ContextMessage {
  const { memoryResult } = input;
  return {
    summary:            '',
    lastAiAction:       memoryResult.conversationMemory.lastIntent,
    unresolvedQuestion: memoryResult.conversationMemory.unresolvedQuestion,
  };
}

// ─── Step 04 / Intent ────────────────────────────────────────────────────────

function buildIntent(input: ContextBuilderInput): ContextIntent {
  const { intentResult } = input;
  const { flags } = intentResult;
  return {
    primary:                intentResult.intent,
    confidence:             intentResult.confidence,
    secondary:              null,   // Phase 10.6: single-pass detection
    isTrustSignal:          flags.isTrustSignal,
    isMedicalSignal:        flags.isMedicalSignal,
    isEmergency:            flags.isEmergency,
    isHumanRequest:         flags.isHumanRequest,
    isProductIntent:        flags.isProductIntent,
    isRecommendationIntent: flags.isRecommendationIntent,
  };
}

// ─── Step 05 / Capability ────────────────────────────────────────────────────

function toCapabilityRef(cap: ContextBuilderInput['capabilityResult']['primaryCapability']): ContextCapabilityRef {
  return {
    id:       cap.capId,
    name:     cap.name,
    acpPath:  cap.acpPath,
    priority: cap.priority,
  };
}

function buildCapability(input: ContextBuilderInput): ContextCapability {
  const { capabilityResult, decisionResult, intentResult } = input;

  const overrideReason =
    intentResult.flags.isTrustSignal    ? 'Trust signal forced ACP-08 CRITICAL override' :
    intentResult.flags.isEmergency      ? 'Emergency forced ACP-16 HIGH override' :
    capabilityResult.shouldInterruptCurrentState ? capabilityResult.reason :
    null;

  return {
    primary:      toCapabilityRef(capabilityResult.primaryCapability),
    secondary:    capabilityResult.secondaryCapabilities.map(toCapabilityRef),
    priority:     decisionResult.priority === 'CRITICAL' ? 'CRITICAL'
                : decisionResult.priority === 'HIGH'     ? 'HIGH'
                : decisionResult.priority === 'STANDARD' ? 'STANDARD'
                : 'LOW',
    overrideReason,
  };
}

// ─── Step 10 / Memory ────────────────────────────────────────────────────────

function buildMemory(input: ContextBuilderInput): ContextMemory {
  const { memoryResult } = input;
  const { extractedFacts, customerProfile, missingFields } = memoryResult;

  const knownFacts: KnownContextFact[] = extractedFacts.map((f) => ({
    field:  f.field,
    value:  f.value,
    source: 'customer_stated',
  }));

  // Also include session-level known profile fields
  const profileFields: Array<{ key: keyof typeof customerProfile; label: string }> = [
    { key: 'real_name',             label: 'real_name' },
    { key: 'age',                   label: 'age' },
    { key: 'phone',                 label: 'phone' },
    { key: 'budget_annual',         label: 'budget_annual' },
    { key: 'interest_category',     label: 'interest_category' },
    { key: 'preferred_contact_time', label: 'preferred_contact_time' },
  ];
  for (const { key, label } of profileFields) {
    const val = customerProfile[key];
    if (val !== null && val !== undefined && !knownFacts.find((f) => f.field === label)) {
      knownFacts.push({ field: label, value: String(val), source: 'session' });
    }
  }

  return {
    requiredFieldsPresent: missingFields.length === 0,
    knownFacts,
    missingRequired: missingFields.map((f) => f.field),
  };
}

// ─── Step 08 / Knowledge ────────────────────────────────────────────────────

function buildKnowledge(input: ContextBuilderInput): ContextKnowledge {
  const { knowledgeResult } = input;
  const { loadedSnippets, knowledgeTrace } = knowledgeResult;

  const sources: ContextKnowledgeFragment[] = loadedSnippets.map((s) => ({
    sourceId:    s.sourcePath.replace('AIOS/', '').replace(/\//g, '-'),
    relevance:   1.0,   // Phase 10.6: all loaded snippets passed the 0.7 threshold
    excerpt:     s.content.substring(0, 300),
    fullPath:    s.sourcePath,
    isMandatory: s.isMandatory,
  }));

  return {
    sources,
    totalChars:               sources.reduce((sum, s) => sum + s.excerpt.length, 0),
    compressed:               false,
    mandatoryFragmentsIncluded: knowledgeTrace.mandatoryFragmentsAdded,
  };
}

// ─── Step 09 / Decision ──────────────────────────────────────────────────────

function buildDecision(input: ContextBuilderInput): ContextDecision {
  const { decisionResult } = input;
  const constraints: string[] = [];

  if (decisionResult.mustAnswerFirst)          constraints.push('CP-01: Answer before asking');
  if (decisionResult.mustBuildTrust)           constraints.push('ACP-08: Build trust before any product mention');
  if (decisionResult.mustIncludeDisclaimer)    constraints.push('ACP-04: Include medical uncertainty language');
  if (decisionResult.mustIncludeRiskDisclosure) constraints.push('ACP-07: Include investment risk disclosure');
  if (decisionResult.shouldCollectLead && decisionResult.askField) {
    constraints.push(`ACP-11: Collect one field only → ${decisionResult.askField}`);
  }

  return {
    action:           decisionResult.action,
    priority:         decisionResult.priority,
    reason:           decisionResult.reason,
    constraints,
    shouldCollectLead: decisionResult.shouldCollectLead,
    shouldEscalate:   decisionResult.shouldEscalate,
    askField:         decisionResult.askField,
  };
}

// ─── Step 06 / Conversation Strategy ─────────────────────────────────────────
// Phase Pre-10.9: lift strategy result into the canonical ExecutionContext.

function buildConversationStrategy(input: ContextBuilderInput): ContextConversationStrategy {
  const { strategyResult } = input;
  return {
    strategyId:                  strategyResult.strategyId,
    strategyGoal:                strategyResult.strategyGoal,
    orderedSteps:                strategyResult.orderedSteps,
    topicShiftDetected:          strategyResult.topicShiftDetected,
    leadCaptureAllowedByStrategy: strategyResult.leadCaptureAllowedByStrategy,
    mustAnswerFirst:             strategyResult.mustAnswerFirst,
    mustEducate:                 strategyResult.mustEducate,
    mustRecommendBeforeCapture:  strategyResult.mustRecommendBeforeCapture,
    strategyWarnings:            strategyResult.strategyWarnings,
  };
}

// ─── Step 11 / Response Profile ──────────────────────────────────────────────
// Source: AIOS-ACE-12

function buildResponseProfile(input: ContextBuilderInput): ResponseProfile {
  const { decisionResult, intentResult, memoryResult } = input;
  const { action } = decisionResult;
  const { isTrustSignal, isMedicalSignal, isEmergency } = intentResult.flags;
  const trustActive = memoryResult.trustMemory.trustConcernActive;

  type Mutable<T> = { -readonly [K in keyof T]: T[K] };
  const profile: Mutable<ResponseProfile> = {
    tone:                     'helpful, professional',
    length:                   'medium',
    empathyLevel:             'low',
    questionStrategy:         'one_question',
    answerFirst:              true,
    maxRecommendations:       2,
    thaiResponse:             true,
    prohibitedPhrases:        [...GLOBAL_PROHIBITED_PHRASES],
    ctaAllowed:               !trustActive,
    mustIncludeDisclaimer:    decisionResult.mustIncludeDisclaimer,
    mustIncludeRiskDisclosure: decisionResult.mustIncludeRiskDisclosure,
  };

  // Action-specific profile (AIOS-ACE-12 tone table)
  switch (action) {
    case 'build_trust':
      profile.tone             = 'empathetic, transparent';
      profile.length           = 'medium';
      profile.empathyLevel     = 'high';
      profile.questionStrategy = 'no_question';
      profile.ctaAllowed       = false;
      break;
    case 'emergency_guide':
      profile.tone             = 'empathetic, immediate';
      profile.length           = 'short';
      profile.empathyLevel     = 'high';
      profile.questionStrategy = 'clarifying_only';
      profile.ctaAllowed       = false;
      profile.answerFirst      = false;  // emergency IS the guidance
      break;
    case 'claim_guide':
      profile.tone             = 'empathetic, practical';
      profile.length           = 'medium';
      profile.empathyLevel     = 'medium';
      profile.questionStrategy = 'clarifying_only';
      profile.ctaAllowed       = false;
      break;
    case 'handoff':
      profile.tone             = 'warm, affirming';
      profile.length           = 'short';
      profile.empathyLevel     = 'medium';
      profile.questionStrategy = 'no_question';
      profile.ctaAllowed       = true;
      break;
    case 'educate':
      profile.tone             = 'educational, professional';
      profile.length           = 'medium';
      profile.empathyLevel     = 'low';
      profile.questionStrategy = 'one_question';
      profile.ctaAllowed       = false;
      break;
    case 'answer_then_ask':
      profile.tone             = 'helpful, consultative';
      profile.length           = 'medium';
      profile.empathyLevel     = isMedicalSignal ? 'medium' : 'low';
      profile.questionStrategy = 'one_question';
      profile.ctaAllowed       = !trustActive;
      break;
    case 'recommend':
      profile.tone             = 'consultative, confident';
      profile.length           = 'medium';
      profile.empathyLevel     = 'low';
      profile.questionStrategy = 'one_question';
      profile.ctaAllowed       = true;
      break;
    case 'collect_lead':
      profile.tone             = 'warm, low-pressure';
      profile.length           = 'short';
      profile.empathyLevel     = 'low';
      profile.questionStrategy = 'one_question';
      profile.ctaAllowed       = false;
      break;
    case 'answer':
      profile.tone             = 'helpful, professional';
      profile.length           = 'medium';
      profile.empathyLevel     = 'none';
      profile.questionStrategy = 'no_question';
      profile.ctaAllowed       = !trustActive;
      break;
    case 'discovery':
      profile.tone             = 'warm, curious';
      profile.length           = 'short';
      profile.empathyLevel     = 'low';
      profile.questionStrategy = 'one_question';
      profile.ctaAllowed       = false;
      break;
    default: // fallback, wait, redirect
      profile.tone             = 'empathetic';
      profile.length           = 'short';
      profile.empathyLevel     = 'medium';
      profile.questionStrategy = 'no_question';
      profile.ctaAllowed       = false;
  }

  // Safety overrides (AIOS-ACE-12 risk/trust modifiers)
  if (isEmergency) {
    profile.length       = 'short';
    profile.empathyLevel = 'high';
    profile.ctaAllowed   = false;
  }
  if (isTrustSignal || trustActive) {
    profile.ctaAllowed = false;
  }
  if (isMedicalSignal && profile.empathyLevel === 'none') {
    profile.empathyLevel = 'low';
  }

  // Medical/investment prohibited phrases add-ons
  if (decisionResult.mustIncludeDisclaimer) {
    profile.prohibitedPhrases.push('ผมการันตีว่าจะรับประกัน');
  }
  if (decisionResult.mustIncludeRiskDisclosure) {
    profile.prohibitedPhrases.push('ผลตอบแทนการันตี');
  }

  return profile;
}

// ─── Step 12 / Restrictions ──────────────────────────────────────────────────
// Source: AIOS-ACE-13 VAL-B rules

function buildRestrictions(input: ContextBuilderInput): ContextRestrictions {
  const { decisionResult, intentResult, memoryResult } = input;
  const { flags, intent } = intentResult;
  const trustActive = memoryResult.trustMemory.trustConcernActive;
  const { knownFields } = memoryResult;

  const active: ContextRestriction[] = [];
  const hardProhibitions: string[] = [
    'Ask only ONE question per turn (CP-02)',
    'Answer the customer\'s question BEFORE asking any follow-up (CP-01)',
    ...GLOBAL_PROHIBITED_PHRASES.map((p) => `Never use phrase: "${p}"`),
  ];
  const softProhibitions: string[] = [];

  // Known field protection (CP-05) — always
  if (knownFields.length > 0) {
    const fieldList = knownFields.join(', ');
    active.push({
      id:       'R-CP05-01',
      rule:     `Never ask for these already-known fields: ${fieldList}`,
      severity: 'HARD',
      source:   'CP-05 Known Field Protection',
    });
    hardProhibitions.push(`Never re-ask these known fields: ${fieldList}`);
  }

  // Trust restrictions (VAL-B-01, VAL-B-02)
  if (flags.isTrustSignal || trustActive) {
    const trustRules = [
      'NEVER ask for personal data while trust concern is active',
      'NEVER recommend products while trust concern is active',
      'NEVER mention pricing while trust concern is active',
      'NEVER present CTA while trust concern is active',
    ];
    for (const rule of trustRules) {
      active.push({ id: 'R-ACP08-TRUST', rule, severity: 'HARD', source: 'ACP-08 Trust Restrictions' });
      hardProhibitions.push(rule);
    }
  }

  // Medical restrictions (VAL-B-04)
  if (flags.isMedicalSignal || memoryResult.medicalMemory.medicalConcernActive) {
    active.push({
      id:       'R-ACP04-01',
      rule:     MEDICAL_GUARANTEE_PROHIBITION,
      severity: 'HARD',
      source:   'ACP-04 Medical Restrictions',
    });
    hardProhibitions.push(MEDICAL_GUARANTEE_PROHIBITION);
    softProhibitions.push('Ask only ONE medical follow-up question per turn');
  }

  // Investment risk (VAL-B-05)
  if (intent === 'investment_linked') {
    active.push({
      id:       'R-ACP07-01',
      rule:     INVESTMENT_RETURN_PROHIBITION,
      severity: 'HARD',
      source:   'ACP-07 Investment Restrictions',
    });
    hardProhibitions.push(INVESTMENT_RETURN_PROHIBITION);
  }

  // Emergency: no lead collection (VAL-B-03)
  if (flags.isEmergency) {
    active.push({
      id:       'R-ACP16-01',
      rule:     'NEVER collect lead data during emergency guidance',
      severity: 'HARD',
      source:   'ACP-16 Emergency Restrictions',
    });
    hardProhibitions.push('NEVER collect lead data during emergency guidance');
  }

  // Claim / hospital: no lead capture
  if (intent === 'claim_question' || intent === 'hospital_question') {
    active.push({
      id:       'R-SUPPORT-01',
      rule:     'NEVER collect lead data while handling claim or hospital support',
      severity: 'HARD',
      source:   'Support Context Policy',
    });
    hardProhibitions.push('NEVER collect lead data while handling claim or hospital support');
  }

  // P0-004: Topic shift cancels lead capture (CP-08)
  if (input.strategyResult.topicShiftDetected) {
    const topicShiftRule = 'TOPIC SHIFT ACTIVE — Do NOT collect any lead data this turn. Do NOT ask for name, phone, age, or budget. Respond only to the customer\'s new topic.';
    active.push({ id: 'R-CP08-01', rule: topicShiftRule, severity: 'HARD', source: 'CP-08 Topic Shift Recovery' });
    hardProhibitions.push(topicShiftRule);
  }

  // Lead capture guard: one field only (VAL-B-07)
  if (decisionResult.shouldCollectLead && decisionResult.askField) {
    active.push({
      id:       'R-ACP11-01',
      rule:     `Collect exactly ONE field this turn: ${decisionResult.askField}. No other questions.`,
      severity: 'SOFT',
      source:   'ACP-11 Lead Capture Rules',
    });
    softProhibitions.push(`Only ask for ${decisionResult.askField} this turn`);
  }

  return { active, hardProhibitions, softProhibitions };
}

// ─── Escalation ───────────────────────────────────────────────────────────────

function buildEscalation(input: ContextBuilderInput): ContextEscalation {
  const { decisionResult, memoryResult, runtimeInput } = input;

  if (!decisionResult.shouldEscalate) {
    return { required: false, type: null, reason: null, target: null, contextForJirawat: null };
  }

  const { customerProfile, knownFields } = memoryResult;
  const contextParts = [
    `Customer: ${customerProfile.real_name ?? runtimeInput.displayName ?? 'Unknown'}`,
    `Known fields: ${knownFields.join(', ') || 'none'}`,
    `Intent: ${input.intentResult.intent}`,
    `Decision: ${decisionResult.action} — ${decisionResult.reason}`,
  ];

  return {
    required:          true,
    type:              decisionResult.action === 'emergency_guide' ? 'immediate' : 'warm',
    reason:            decisionResult.reason,
    target:            'jirawat',
    contextForJirawat: contextParts.join('\n'),
  };
}

// ─── Policy sections ──────────────────────────────────────────────────────────

function buildLeadPolicy(input: ContextBuilderInput): ContextLeadPolicy {
  const { memoryResult, decisionResult, strategyResult } = input;
  const { leadMemory, trustMemory, knownFields } = memoryResult;

  // P0-004: Topic shift cancels lead capture for this turn (CP-08)
  const topicShiftActive = strategyResult.topicShiftDetected;

  return {
    captureAllowed: topicShiftActive ? false : trustMemory.leadCaptureAllowed,
    fieldBeingAsked: topicShiftActive ? null :
      (decisionResult.shouldCollectLead ? decisionResult.askField : null),
    knownFields,
    valueDelivered: leadMemory.valueDelivered,
    captureStage: leadMemory.captureStage,
  };
}

function buildTrustPolicy(input: ContextBuilderInput): ContextTrustPolicy {
  const { trustMemory } = input.memoryResult;
  return {
    trustConcernActive:     trustMemory.trustConcernActive,
    trustConcernTurn:       trustMemory.trustConcernTurn,
    turnsSinceTrustConcern: trustMemory.turnsSinceTrustConcern,
    leadCaptureAllowed:     trustMemory.leadCaptureAllowed,
    trustResolved:          trustMemory.trustResolved,
  };
}

function buildMedicalPolicy(input: ContextBuilderInput): ContextMedicalPolicy {
  const { medicalMemory } = input.memoryResult;
  return {
    medicalConcernActive: medicalMemory.medicalConcernActive,
    conditionsDisclosed:  medicalMemory.conditionsDisclosed,
    disclaimerRequired:   input.decisionResult.mustIncludeDisclaimer,
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function buildAnalytics(
  input: ContextBuilderInput,
  auditId: string,
  startMs: number,
  restrictionsCount: number,
  charCount: number,
  validationPassed: boolean,
): ContextAnalytics {
  return {
    auditId,
    acpSelected:        input.capabilityResult.primaryCapability.capId,
    intentConfidence:   input.intentResult.confidence,
    charCount,
    compressionApplied: false,
    assemblyTimeMs:     Date.now() - startMs,
    validationPassed,
    restrictionsActive: restrictionsCount,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildExecutionContext(input: ContextBuilderInput): ContextBuilderResult {
  const startMs  = Date.now();
  const auditId  = `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const warnings: string[] = [];

  // Steps 01–12: assemble all sections
  const request               = buildRequest(input);
  const user                  = buildUser(input);
  const session               = buildSession(input);
  const message               = buildMessage(input);
  const intent                = buildIntent(input);
  const capability            = buildCapability(input);
  const memory                = buildMemory(input);
  const knowledge             = buildKnowledge(input);
  const decision              = buildDecision(input);
  const conversationStrategy  = buildConversationStrategy(input);
  const responseProfile       = buildResponseProfile(input);
  const restrictions          = buildRestrictions(input);
  const escalation            = buildEscalation(input);
  const leadPolicy            = buildLeadPolicy(input);
  const trustPolicy           = buildTrustPolicy(input);
  const medicalPolicy         = buildMedicalPolicy(input);

  // Step 13: compress
  const partialContext: Omit<ExecutionContext, 'analytics' | 'trace'> = {
    request, user, session, message, intent, capability,
    memory, knowledge, decision, conversationStrategy, responseProfile,
    restrictions, escalation, leadPolicy, trustPolicy, medicalPolicy,
  };

  // Step 13: compress (analytics and trace added after)
  // Build a temporary full context for compression + validation
  const tempAnalytics: ContextAnalytics = {
    auditId, acpSelected: input.capabilityResult.primaryCapability.capId,
    intentConfidence: input.intentResult.confidence, charCount: 0,
    compressionApplied: false, assemblyTimeMs: 0,
    validationPassed: false, restrictionsActive: restrictions.active.length,
  };
  const tempTrace: ContextTrace = {
    assemblyTimeMs: 0, stepsCompleted: 0, compressedCharCount: 0,
    validationPassed: false, validationHardFailures: [], validationSoftFailures: [],
    auditId,
  };

  const tempContext: ExecutionContext = {
    ...partialContext, analytics: tempAnalytics, trace: tempTrace,
  };

  const compressedContext = compressExecutionContext(tempContext);
  const validation        = validateExecutionContext(tempContext);

  warnings.push(...validation.softFailures);
  for (const w of input.decisionResult.warnings) {
    warnings.push(`[DECISION-${w.severity}] ${w.code}: ${w.message}`);
  }
  for (const w of input.knowledgeResult.warnings) {
    warnings.push(`[KNOWLEDGE-SOFT] ${w}`);
  }

  // Step 15: finalize
  const contextTrace: ContextTrace = {
    assemblyTimeMs:      Date.now() - startMs,
    stepsCompleted:      15,
    compressedCharCount: compressedContext.length,
    validationPassed:    validation.passed,
    validationHardFailures: validation.hardFailures,
    validationSoftFailures: validation.softFailures,
    auditId,
  };

  const analytics = buildAnalytics(
    input, auditId, startMs,
    restrictions.active.length,
    compressedContext.length,
    validation.passed,
  );

  const executionContext: ExecutionContext = {
    ...partialContext,
    analytics,
    trace: contextTrace,
  };

  return { executionContext, compressedContext, validation, warnings, contextTrace };
}
