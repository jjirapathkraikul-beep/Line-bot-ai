// Gen1 Prompt Builder — Phase Pre-10.9
// Converts ExecutionContext into a deterministic 12-section system prompt.
// Source: AIOS-AEE-06 (Response Composer), AIOS-ACE-12 (Response Profile).
//
// Sections:
//   1. Role           2. Customer Message   3. Conversation Context
//   4. Intent         5. Capability         6. Memory
//   7. Knowledge      8. Decision           9. Restrictions
//   10. Response Profile  11. Strategy      12. Output Rules

import type { ExecutionContext } from '../context/contextTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PromptBuilderInput {
  executionContext: ExecutionContext;
}

export interface PromptBuilderResult {
  systemPrompt: string;
  userMessage: string;
  sectionCount: number;
  promptCharCount: number;
}

// ─── Action-specific output rules (AIOS-AEE-06) ──────────────────────────────

const ACTION_OUTPUT_RULES: Record<string, string[]> = {
  build_trust: [
    'Do NOT ask for personal data, phone numbers, or any lead information.',
    'Do NOT mention insurance products or pricing.',
    'Focus entirely on acknowledging the customer\'s concern and building credibility.',
    'Do NOT include any CTA (call to action).',
    'No follow-up question — response ends after building trust.',
  ],
  emergency_guide: [
    'Priority is GUIDANCE, not sales.',
    'Give clear, immediate, actionable steps.',
    'Do NOT collect any personal data.',
    'One sentence of empathy, then guidance.',
    'No CTA. No product mention.',
  ],
  answer: [
    'Answer the question directly and completely.',
    'No follow-up question.',
    'Be concise — stay within the length target.',
  ],
  answer_then_ask: [
    'Answer the customer\'s question FIRST — fully and completely.',
    'Then ask exactly ONE question to move the conversation forward.',
    'Never ask two questions. Never bundle questions.',
  ],
  collect_lead: [
    'Ask for exactly ONE piece of information only.',
    'Do NOT ask for any other data in the same response.',
    'Natural, low-pressure tone — conversational, not transactional.',
    'Short response — maximum 30 words.',
  ],
  educate: [
    'Explain the concept clearly before any product mention.',
    'Use simple Thai language suitable for a first-time insurance customer.',
    'After educating, may end with ONE soft follow-up question.',
  ],
  recommend: [
    'Present recommendation with clear reasoning.',
    'Do NOT over-promise or guarantee outcomes.',
    'Reference the customer\'s situation from Known Facts.',
    'May include ONE clarifying question at the end.',
  ],
  handoff: [
    'Warmly inform the customer that Jirawat will personally assist them.',
    'No product pitch. No data collection.',
    'No follow-up question.',
    'Closing tone — warm and affirming.',
  ],
  claim_guide: [
    'Focus on the claim process: documents required, steps to take, timeline.',
    'Empathetic and practical tone.',
    'No product sales. No lead capture.',
  ],
  discovery: [
    'Ask ONE open question to understand the customer\'s needs better.',
    'Warm and curious tone — feel like a natural conversation.',
    'Do not overwhelm with multiple questions.',
  ],
  redirect: [
    'Gently redirect the conversation to insurance and financial planning.',
    'Acknowledge what the customer said before redirecting.',
    'Keep it brief.',
  ],
  fallback: [
    'Use a short, empathetic message.',
    'Acknowledge that you could not fully assist right now.',
    'Offer to help with something else.',
    'No follow-up question.',
  ],
  wait: [
    'Acknowledge the customer without pressure.',
    'Short response. Patient tone.',
    'No question. No CTA.',
  ],
};

// ─── Section builders ─────────────────────────────────────────────────────────

function buildRole(ctx: ExecutionContext): string {
  return [
    '=== 1: ROLE ===',
    'You are AIOS AI Advisor — the digital financial advisor for Jirawat Financial Advisory (ที่ปรึกษาการเงินของคุณจิราวัฒน์).',
    'You assist Thai customers with insurance planning and financial guidance — professional, warm, and honest.',
    'You are NOT a general-purpose AI. Respond ONLY about insurance and financial planning.',
    'You represent Jirawat Jirapathkraikul personally — every response must reflect his advisory standards.',
    `Active ACP:       ${ctx.capability.primary.name} (${ctx.capability.primary.acpPath})`,
    `Decision Action:  ${ctx.decision.action.toUpperCase()}`,
    `Priority:         ${ctx.decision.priority}`,
  ].join('\n');
}

function buildCustomerMessage(ctx: ExecutionContext): string {
  const lines = [
    '=== 2: CUSTOMER MESSAGE ===',
    `Input: "${ctx.request.rawInput}"`,
  ];
  if (ctx.request.normalizedInput !== ctx.request.rawInput.toLowerCase().trim()) {
    lines.push(`Normalized: ${ctx.request.normalizedInput}`);
  }
  lines.push(`Channel: ${ctx.request.channel}  |  Turn: ${ctx.request.turnNumber}`);
  return lines.join('\n');
}

function buildConversationContext(ctx: ExecutionContext): string {
  const lines = [
    '=== 3: CONVERSATION CONTEXT ===',
    `Session turn:  ${ctx.session.turnCount}`,
    `Active state:  ${ctx.session.activeState ?? '(none)'}`,
    `Prior state:   ${ctx.session.priorState ?? '(none)'}`,
  ];
  if (ctx.message.lastAiAction) {
    lines.push(`Last AI action: ${ctx.message.lastAiAction}`);
  }
  if (ctx.message.unresolvedQuestion) {
    lines.push(`⚠️  UNRESOLVED from prior turn: "${ctx.message.unresolvedQuestion}"`);
    lines.push('    → Address or explicitly defer this before asking a new question.');
  }
  if (ctx.message.summary) {
    lines.push(`Summary: ${ctx.message.summary}`);
  }
  return lines.join('\n');
}

function buildIntent(ctx: ExecutionContext): string {
  const lines = [
    '=== 4: INTENT ===',
    `Primary: ${ctx.intent.primary} (${(ctx.intent.confidence * 100).toFixed(0)}% confidence)`,
  ];
  const flags: string[] = [];
  if (ctx.intent.isTrustSignal)          flags.push('TRUST_SIGNAL — customer has trust/scam concerns');
  if (ctx.intent.isMedicalSignal)        flags.push('MEDICAL_SIGNAL — medical condition in context');
  if (ctx.intent.isEmergency)            flags.push('EMERGENCY — immediate guidance required');
  if (ctx.intent.isHumanRequest)         flags.push('HUMAN_REQUEST — customer wants a human advisor');
  if (ctx.intent.isProductIntent)        flags.push('PRODUCT_INTENT — asking about an insurance product');
  if (ctx.intent.isRecommendationIntent) flags.push('RECOMMENDATION_INTENT — seeking a recommendation');
  if (flags.length > 0) {
    lines.push('Active flags:');
    flags.forEach((f) => lines.push(`  • ${f}`));
  }
  return lines.join('\n');
}

function buildCapability(ctx: ExecutionContext): string {
  const lines = [
    '=== 5: CAPABILITY ===',
    `Primary: ${ctx.capability.primary.id} — ${ctx.capability.primary.name}`,
    `ACP Path: ${ctx.capability.primary.acpPath}`,
    `Priority: ${ctx.capability.priority}`,
  ];
  if (ctx.capability.overrideReason) {
    lines.push(`Override: ${ctx.capability.overrideReason}`);
  }
  if (ctx.capability.secondary.length > 0) {
    lines.push('Secondary: ' + ctx.capability.secondary.map((c) => c.id).join(', '));
  }
  return lines.join('\n');
}

function buildMemory(ctx: ExecutionContext): string {
  const lines = ['=== 6: MEMORY — KNOWN CUSTOMER FACTS ==='];
  if (ctx.memory.knownFacts.length > 0) {
    ctx.memory.knownFacts.forEach((f) => lines.push(`  ${f.field}: ${f.value}`));
  } else {
    lines.push('  (no facts captured yet)');
  }
  if (ctx.memory.missingRequired.length > 0) {
    lines.push(`Not yet collected: ${ctx.memory.missingRequired.join(', ')}`);
  }
  if (ctx.leadPolicy.knownFields.length > 0) {
    lines.push(`NEVER ASK AGAIN (already captured): ${ctx.leadPolicy.knownFields.join(', ')}`);
  }
  if (ctx.leadPolicy.fieldBeingAsked) {
    lines.push(`This turn: collect → ${ctx.leadPolicy.fieldBeingAsked}`);
  }
  return lines.join('\n');
}

function buildKnowledge(ctx: ExecutionContext): string {
  const lines = ['=== 7: KNOWLEDGE SUMMARY ==='];
  if (ctx.knowledge.sources.length === 0) {
    lines.push('(No knowledge loaded — respond from general training only if the content is safe and accurate.)');
    return lines.join('\n');
  }
  const mandatory = ctx.knowledge.sources.filter((s) => s.isMandatory);
  const optional  = ctx.knowledge.sources.filter((s) => !s.isMandatory);
  if (mandatory.length > 0) {
    lines.push('[MANDATORY CONTEXT — always apply in this response]:');
    mandatory.forEach((s) => lines.push(`  • ${s.excerpt.substring(0, 200)}`));
  }
  if (optional.length > 0) {
    lines.push('[REFERENCE CONTEXT — use if relevant]:');
    optional.forEach((s) => lines.push(`  • [${s.sourceId}] ${s.excerpt.substring(0, 150)}`));
  }
  return lines.join('\n');
}

function buildDecision(ctx: ExecutionContext): string {
  const lines = [
    '=== 8: DECISION ===',
    `ACTION:   ${ctx.decision.action.toUpperCase()}`,
    `PRIORITY: ${ctx.decision.priority}`,
    `REASON:   ${ctx.decision.reason}`,
  ];
  if (ctx.decision.constraints.length > 0) {
    lines.push('Constraints:');
    ctx.decision.constraints.forEach((c) => lines.push(`  • ${c}`));
  }
  if (ctx.decision.shouldCollectLead && ctx.decision.askField) {
    lines.push(`COLLECT LEAD: Ask for "${ctx.decision.askField}" — ONE question, naturally embedded.`);
  }
  if (ctx.decision.shouldEscalate) {
    lines.push('ESCALATE: Include a warm handoff to Jirawat after responding.');
    if (ctx.escalation.contextForJirawat) {
      lines.push(`Handoff context: ${ctx.escalation.contextForJirawat.substring(0, 100)}`);
    }
  }
  return lines.join('\n');
}

function buildRestrictions(ctx: ExecutionContext): string {
  const lines = ['=== 9: RESTRICTIONS ==='];
  if (ctx.restrictions.hardProhibitions.length > 0) {
    lines.push('HARD — NEVER violate (non-negotiable):');
    ctx.restrictions.hardProhibitions.forEach((r) => lines.push(`  ❌ ${r}`));
  }
  if (ctx.restrictions.softProhibitions.length > 0) {
    lines.push('SOFT — Avoid unless necessary:');
    ctx.restrictions.softProhibitions.forEach((r) => lines.push(`  ⚠️  ${r}`));
  }
  return lines.join('\n');
}

function buildResponseProfile(ctx: ExecutionContext): string {
  const lines = [
    '=== 10: RESPONSE PROFILE ===',
    `Tone:              ${ctx.responseProfile.tone}`,
    `Length:            ${ctx.responseProfile.length} (short=30–80 words, medium=80–200, long=200–400)`,
    `Empathy level:     ${ctx.responseProfile.empathyLevel}`,
    `Question strategy: ${ctx.responseProfile.questionStrategy}`,
    `Answer first:      ${ctx.responseProfile.answerFirst}`,
    `Thai response:     ${ctx.responseProfile.thaiResponse} — respond in Thai only`,
    `CTA allowed:       ${ctx.responseProfile.ctaAllowed}`,
    `Max recommendations: ${ctx.responseProfile.maxRecommendations}`,
  ];
  if (ctx.responseProfile.mustIncludeDisclaimer) {
    lines.push('⚠️  MUST INCLUDE: Medical uncertainty language — e.g. "พิจารณาเป็นรายกรณีครับ ขึ้นอยู่กับสภาวะสุขภาพแต่ละบุคคล"');
  }
  if (ctx.responseProfile.mustIncludeRiskDisclosure) {
    lines.push('⚠️  MUST INCLUDE: Investment risk disclosure — e.g. "ผลตอบแทนขึ้นอยู่กับสภาวะตลาดครับ ไม่ได้รับการันตี"');
  }
  if (ctx.responseProfile.prohibitedPhrases.length > 0) {
    lines.push('Prohibited phrases — NEVER use:');
    ctx.responseProfile.prohibitedPhrases.forEach((p) => lines.push(`  ✗ ${p}`));
  }
  return lines.join('\n');
}

function buildStrategy(ctx: ExecutionContext): string {
  const s = ctx.conversationStrategy;
  const lines = [
    '=== 11: CONVERSATION STRATEGY ===',
    `Strategy:  ${s.strategyId}`,
    `Goal:      ${s.strategyGoal}`,
  ];
  if (s.topicShiftDetected) {
    lines.push('⚠️  TOPIC SHIFT DETECTED — previous flow cancelled. Follow the customer\'s new topic.');
  }
  lines.push('Ordered steps:');
  s.orderedSteps.forEach((step, i) => lines.push(`  ${i + 1}. ${step}`));
  const guards: string[] = [];
  if (!s.leadCaptureAllowedByStrategy) guards.push('Lead capture NOT allowed by this strategy');
  if (s.mustAnswerFirst)               guards.push('MUST answer before any question (CP-01)');
  if (s.mustEducate)                   guards.push('MUST educate before capturing data (CP-03)');
  if (s.mustRecommendBeforeCapture)    guards.push('MUST recommend before capturing lead (CP-07)');
  if (guards.length > 0) {
    lines.push('Strategy guards:');
    guards.forEach((g) => lines.push(`  ⚠️  ${g}`));
  }
  if (s.strategyWarnings.length > 0) {
    lines.push('Strategy warnings:');
    s.strategyWarnings.forEach((w) => lines.push(`  ⚡ ${w}`));
  }
  return lines.join('\n');
}

function buildOutputRules(ctx: ExecutionContext): string {
  const action  = ctx.decision.action as string;
  const specific = ACTION_OUTPUT_RULES[action] ?? ACTION_OUTPUT_RULES['fallback']!;
  const s = ctx.conversationStrategy;
  const lines   = ['=== 12: OUTPUT RULES ==='];

  // Universal rules (always present)
  lines.push('Universal rules (always apply):');
  lines.push('  1. Respond in Thai ONLY — ภาษาไทยเท่านั้น');
  if (s.mustAnswerFirst) {
    // P0-003: stronger CP-01 enforcement when strategy mandates it
    lines.push('  2. [MANDATORY CP-01] Your FIRST SENTENCE must directly answer the customer\'s question. Never start with a greeting, question, or preamble.');
  } else if (ctx.responseProfile.answerFirst) {
    lines.push('  2. Answer the customer\'s question FIRST before any follow-up (CP-01)');
  } else {
    lines.push('  2. Lead with empathy/guidance — action type does not require answer-first');
  }
  switch (ctx.responseProfile.questionStrategy) {
    case 'one_question':
      lines.push('  3. Ask at most ONE question per response (CP-02) — never bundle two questions');
      break;
    case 'no_question':
      lines.push('  3. Do NOT ask any question in this response');
      break;
    case 'clarifying_only':
      lines.push('  3. Ask a clarifying question ONLY if essential for understanding — otherwise none');
      break;
  }
  lines.push('  4. Do NOT use any phrase listed as prohibited in the Restrictions or Response Profile sections');
  lines.push('  5. Never open with filler phrases: "ขอบคุณสำหรับคำถาม", "ยินดีที่จะช่วย", "นั่นเป็นคำถามที่น่าสนใจ"');
  lines.push('  6. Keep paragraph length to 2–3 sentences maximum; use bullet lists for multiple items');

  // P0-002: strategy-driven execution order (strategy is single source of truth — overrides action-specific rules below)
  lines.push('');
  lines.push(`Strategy execution order (from Section 11 — follow this, not just the action):`);
  s.orderedSteps.forEach((step, i) => lines.push(`  STEP ${i + 1}: ${step}`));

  // Strategy guards surfaced as explicit prohibitions
  if (s.mustRecommendBeforeCapture) {
    lines.push('  ⚠️  [CP-07 MANDATORY] Present a personalized recommendation BEFORE asking for any contact information.');
  }
  if (s.mustEducate) {
    lines.push('  ⚠️  [CP-03 MANDATORY] Educate about the insurance concept BEFORE capturing any customer data.');
  }
  if (s.topicShiftDetected) {
    lines.push('  ⚠️  [CP-08 MANDATORY] Topic shift detected — abandon previous lead capture flow entirely. Respond to the customer\'s new topic only.');
  }

  lines.push('');
  lines.push(`Action-specific rules for ${action.toUpperCase()} (secondary — strategy steps above take precedence):`);
  specific.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));

  return lines.join('\n');
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildPrompt(input: PromptBuilderInput): PromptBuilderResult {
  const { executionContext: ctx } = input;

  const sections: string[] = [
    buildRole(ctx),
    buildCustomerMessage(ctx),
    buildConversationContext(ctx),
    buildIntent(ctx),
    buildCapability(ctx),
    buildMemory(ctx),
    buildKnowledge(ctx),
    buildDecision(ctx),
    buildRestrictions(ctx),
    buildResponseProfile(ctx),
    buildStrategy(ctx),
    buildOutputRules(ctx),
  ];

  const systemPrompt  = sections.join('\n\n');
  const userMessage   = ctx.request.rawInput;
  const promptCharCount = systemPrompt.length + userMessage.length;

  return {
    systemPrompt,
    userMessage,
    sectionCount: sections.length,
    promptCharCount,
  };
}
