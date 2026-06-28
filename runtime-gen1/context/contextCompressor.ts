// Gen1 Context Compressor — Phase 10.6
// Produces a structured human-readable context string for the future LLM adapter.
// Source: AIOS-ACE-06 compression priority rules.
//
// Compression priority (AIOS-ACE-06):
//   Priority 1 (NEVER COMPRESS): hard_prohibitions, trust_profile, decision.action, response_profile
//   Priority 2 (compress last): decision.rationale, lead_profile beyond fields_captured
//   Priority 3 (compress if needed): knowledge excerpts, conversation examples
//   Priority 4 (compress first): conversation history, debug section

import type { ExecutionContext } from './contextTypes';

// ─── Main compressor ──────────────────────────────────────────────────────────

export function compressExecutionContext(context: ExecutionContext): string {
  const lines: string[] = [];

  // ── Section 1: Decision (NEVER COMPRESS) ────────────────────────────────────
  lines.push('=== DECISION (Priority 1 — Protected) ===');
  lines.push(`ACTION:    ${context.decision.action.toUpperCase()}`);
  lines.push(`PRIORITY:  ${context.decision.priority}`);
  lines.push(`REASON:    ${context.decision.reason}`);
  if (context.decision.constraints.length > 0) {
    lines.push('CONSTRAINTS:');
    context.decision.constraints.forEach((c) => lines.push(`  • ${c}`));
  }
  if (context.decision.askField) {
    lines.push(`ASK FIELD: ${context.decision.askField}`);
  }

  // ── Section 2: Hard Restrictions (NEVER COMPRESS — AIOS-ACE-06 Priority 1) ──
  lines.push('\n=== HARD RESTRICTIONS (Priority 1 — Protected) ===');
  context.restrictions.hardProhibitions.forEach((r) => lines.push(`❌ ${r}`));

  // ── Section 3: Response Profile (NEVER COMPRESS) ────────────────────────────
  lines.push('\n=== RESPONSE PROFILE (Priority 1 — Protected) ===');
  lines.push(`Tone:              ${context.responseProfile.tone}`);
  lines.push(`Length:            ${context.responseProfile.length}`);
  lines.push(`Empathy:           ${context.responseProfile.empathyLevel}`);
  lines.push(`Question strategy: ${context.responseProfile.questionStrategy}`);
  lines.push(`Answer first:      ${context.responseProfile.answerFirst}`);
  lines.push(`Thai response:     ${context.responseProfile.thaiResponse}`);
  lines.push(`CTA allowed:       ${context.responseProfile.ctaAllowed}`);
  if (context.responseProfile.mustIncludeDisclaimer) {
    lines.push('⚠️  MUST INCLUDE: Medical uncertainty language (case-by-case only)');
  }
  if (context.responseProfile.mustIncludeRiskDisclosure) {
    lines.push('⚠️  MUST INCLUDE: Investment risk disclosure (returns not guaranteed)');
  }
  lines.push('Prohibited phrases:');
  context.responseProfile.prohibitedPhrases.forEach((p) => lines.push(`  ✗ ${p}`));

  // ── Section 4: Trust Policy (NEVER COMPRESS) ────────────────────────────────
  if (context.trustPolicy.trustConcernActive || context.trustPolicy.leadCaptureAllowed === false) {
    lines.push('\n=== TRUST POLICY (Priority 1 — Protected) ===');
    lines.push(`Trust concern active:      ${context.trustPolicy.trustConcernActive}`);
    lines.push(`Lead capture allowed:      ${context.trustPolicy.leadCaptureAllowed}`);
    lines.push(`Trust resolved:            ${context.trustPolicy.trustResolved}`);
    if (context.trustPolicy.turnsSinceTrustConcern !== null) {
      lines.push(`Turns since trust concern: ${context.trustPolicy.turnsSinceTrustConcern}`);
    }
  }

  // ── Section 5: Lead Policy — fields_captured (NEVER COMPRESS) ───────────────
  lines.push('\n=== LEAD POLICY — NEVER ASK AGAIN (Priority 1 — Protected) ===');
  if (context.leadPolicy.knownFields.length > 0) {
    lines.push(`Already captured: ${context.leadPolicy.knownFields.join(', ')}`);
  } else {
    lines.push('(no fields captured yet)');
  }
  lines.push(`Value delivered: ${context.leadPolicy.valueDelivered}`);
  lines.push(`Capture stage:   ${context.leadPolicy.captureStage}`);
  if (context.leadPolicy.fieldBeingAsked) {
    lines.push(`Asking for:      ${context.leadPolicy.fieldBeingAsked}`);
  }

  // ── Section 6: Medical Policy (Priority 2) ────────────────────────────────
  if (context.medicalPolicy.medicalConcernActive || context.medicalPolicy.disclaimerRequired) {
    lines.push('\n=== MEDICAL POLICY (Priority 2) ===');
    lines.push(`Medical concern active: ${context.medicalPolicy.medicalConcernActive}`);
    lines.push(`Disclaimer required:    ${context.medicalPolicy.disclaimerRequired}`);
    if (context.medicalPolicy.conditionsDisclosed.length > 0) {
      lines.push(`Conditions disclosed: ${context.medicalPolicy.conditionsDisclosed.join(', ')}`);
    }
  }

  // ── Section 7: Known Memory Facts (Priority 2) ───────────────────────────
  lines.push('\n=== KNOWN CUSTOMER FACTS (Priority 2) ===');
  if (context.memory.knownFacts.length > 0) {
    context.memory.knownFacts.forEach((f) => lines.push(`  ${f.field}: ${f.value} [${f.source}]`));
  } else {
    lines.push('  (none captured yet)');
  }
  if (context.memory.missingRequired.length > 0) {
    lines.push(`Missing fields: ${context.memory.missingRequired.join(', ')}`);
  }

  // ── Section 8: Capability (Priority 2) ───────────────────────────────────
  lines.push('\n=== CAPABILITY ===');
  lines.push(`Primary: ${context.capability.primary.id} — ${context.capability.primary.name}`);
  lines.push(`ACP: ${context.capability.primary.acpPath}`);
  if (context.capability.overrideReason) {
    lines.push(`Override: ${context.capability.overrideReason}`);
  }

  // ── Section 9: Intent ─────────────────────────────────────────────────────
  lines.push('\n=== INTENT ===');
  lines.push(`Primary: ${context.intent.primary} (confidence: ${(context.intent.confidence * 100).toFixed(0)}%)`);
  const flags: string[] = [];
  if (context.intent.isTrustSignal)          flags.push('TRUST_SIGNAL');
  if (context.intent.isMedicalSignal)        flags.push('MEDICAL_SIGNAL');
  if (context.intent.isEmergency)            flags.push('EMERGENCY');
  if (context.intent.isHumanRequest)         flags.push('HUMAN_REQUEST');
  if (context.intent.isProductIntent)        flags.push('PRODUCT_INTENT');
  if (context.intent.isRecommendationIntent) flags.push('RECOMMENDATION_INTENT');
  if (flags.length > 0) lines.push(`Flags: ${flags.join(', ')}`);

  // ── Section 10: Knowledge Summaries (Priority 3 — compress to key sentences) ─
  if (context.knowledge.sources.length > 0) {
    lines.push('\n=== KNOWLEDGE SUMMARIES (Priority 3) ===');
    context.knowledge.sources.forEach((s) => {
      const excerptPreview = s.excerpt.length > 150
        ? `${s.excerpt.substring(0, 150)}…`
        : s.excerpt;
      lines.push(`[${s.isMandatory ? '★ MANDATORY' : s.sourceId}] ${excerptPreview}`);
    });
  }

  // ── Section 11: Escalation (if needed) ───────────────────────────────────
  if (context.escalation.required) {
    lines.push('\n=== ESCALATION ===');
    lines.push(`Type:   ${context.escalation.type}`);
    lines.push(`Target: ${context.escalation.target}`);
    lines.push(`Reason: ${context.escalation.reason}`);
    if (context.escalation.contextForJirawat) {
      lines.push('Context for Jirawat:');
      lines.push(context.escalation.contextForJirawat);
    }
  }

  // ── Section 12: Soft Restrictions (Priority 3) ───────────────────────────
  if (context.restrictions.softProhibitions.length > 0) {
    lines.push('\n=== SOFT RESTRICTIONS (Priority 3) ===');
    context.restrictions.softProhibitions.forEach((r) => lines.push(`⚠️  ${r}`));
  }

  // ── Section 13: Request context (Priority 4) ──────────────────────────────
  lines.push('\n=== REQUEST ===');
  lines.push(`Input: "${context.request.rawInput.substring(0, 80)}${context.request.rawInput.length > 80 ? '…' : ''}"`);
  lines.push(`Channel: ${context.request.channel}  |  Turn: ${context.request.turnNumber}`);

  return lines.join('\n');
}
