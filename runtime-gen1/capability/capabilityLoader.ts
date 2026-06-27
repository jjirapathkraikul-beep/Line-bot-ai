import type { IntentDetectorResult } from './intentDetector';
import {
  type CapabilityEntry,
  getCapabilityByIntent,
  CAPABILITY_REGISTRY,
} from './capabilityRegistry';

export interface CapabilityLoaderResult {
  primaryCapability: CapabilityEntry;
  secondaryCapabilities: CapabilityEntry[];
  selectedAcpPaths: string[];
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  shouldInterruptCurrentState: boolean;
  reason: string;
}

// Current state shape — matches V1 session state names from lib/leadCapture.ts
export interface LoaderContext {
  currentState: string;   // e.g. 'awaiting_field:phone', 'awaiting_category', 'idle'
  leadData: Record<string, string>;
}

const DEFAULT_CONTEXT: LoaderContext = { currentState: 'idle', leadData: {} };

// ─── Capability Loader ────────────────────────────────────────────────────────

export function loadCapability(
  intentResult: IntentDetectorResult,
  ctx: LoaderContext = DEFAULT_CONTEXT,
): CapabilityLoaderResult {
  const { intent, flags } = intentResult;
  const isInLeadCapture = ctx.currentState.startsWith('awaiting_');

  // ── CRITICAL: trust/fraud always interrupts everything ───────────────────
  if (flags.isTrustSignal) {
    const cap = CAPABILITY_REGISTRY['CAP-002']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'CRITICAL',
      shouldInterruptCurrentState: true,
      reason: 'Trust/fraud signal detected — ACP-08 takes CRITICAL priority over all other capabilities.',
    };
  }

  // ── HIGH: claim support ──────────────────────────────────────────────────
  if (intent === 'claim_question') {
    const cap = CAPABILITY_REGISTRY['CAP-011']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'HIGH',
      shouldInterruptCurrentState: isInLeadCapture,
      reason: 'Claim question detected — ACP-15 CLAIM_SUPPORT provides filing guidance.',
    };
  }

  // ── HIGH: hospital guidance ──────────────────────────────────────────────
  if (intent === 'hospital_question') {
    const cap = CAPABILITY_REGISTRY['CAP-012']!;
    const secondary: CapabilityEntry[] = flags.isEmergency
      ? []
      : [];
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      secondary,
      selectedAcpPaths:           [cap.acpPath, ...secondary.map((c) => c.acpPath)],
      priority:                   'HIGH',
      shouldInterruptCurrentState: isInLeadCapture,
      reason: flags.isEmergency
        ? 'Emergency signal detected — immediate hospital guidance needed.'
        : 'Hospital question detected — ACP-16 provides network and cost guidance.',
    };
  }

  // ── HIGH: medical underwriting (interrupts lead capture) ─────────────────
  if (flags.isMedicalSignal) {
    const cap = CAPABILITY_REGISTRY['CAP-003']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'HIGH',
      shouldInterruptCurrentState: isInLeadCapture,
      reason: 'Medical underwriting question — ACP-04 applies case-by-case handling.',
    };
  }

  // ── HIGH: human handoff ──────────────────────────────────────────────────
  if (flags.isHumanRequest || intent === 'human_handoff') {
    const cap = CAPABILITY_REGISTRY['CAP-013']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'HIGH',
      shouldInterruptCurrentState: true,
      reason: 'Human handoff requested — ACP-17 executes warm handoff to Jirawat.',
    };
  }

  // ── STANDARD: product intents ─────────────────────────────────────────────
  const productCap = getCapabilityByIntent(intent);
  if (productCap) {
    // Add recommendation engine as secondary if product intent is strong
    const secondary: CapabilityEntry[] = flags.isRecommendationIntent
      ? [CAPABILITY_REGISTRY['CAP-007']!]
      : [];
    return {
      primaryCapability:          productCap,
      secondaryCapabilities:      secondary,
      selectedAcpPaths:           [productCap.acpPath, ...secondary.map((c) => c.acpPath)],
      priority:                   'STANDARD',
      shouldInterruptCurrentState: false,
      reason: `Product intent '${intent}' → ${productCap.acpPath}.`,
    };
  }

  // ── STANDARD: price intent ────────────────────────────────────────────────
  if (flags.isPriceIntent || intent === 'premium_question') {
    const cap = CAPABILITY_REGISTRY['CAP-014']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'STANDARD',
      shouldInterruptCurrentState: false,
      reason: 'Premium/price question — ACP-13 handles pricing with contextual reframing.',
    };
  }

  // ── STANDARD: recommendation ──────────────────────────────────────────────
  if (flags.isRecommendationIntent || intent === 'recommendation_request') {
    const cap = CAPABILITY_REGISTRY['CAP-007']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'STANDARD',
      shouldInterruptCurrentState: false,
      reason: 'Recommendation request — ACP-09 produces personalised recommendations.',
    };
  }

  // ── STANDARD: existing policy / price objection / greeting / unknown ──────
  if (intent === 'existing_policy') {
    const cap = CAPABILITY_REGISTRY['CAP-015']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'STANDARD',
      shouldInterruptCurrentState: false,
      reason: 'Customer has existing coverage — ACP-14 handles review and gap analysis.',
    };
  }

  if (intent === 'price_objection') {
    const cap = CAPABILITY_REGISTRY['CAP-014']!;
    return {
      primaryCapability:          cap,
      secondaryCapabilities:      [],
      selectedAcpPaths:           [cap.acpPath],
      priority:                   'STANDARD',
      shouldInterruptCurrentState: false,
      reason: 'Price objection detected — ACP-13 reframes value.',
    };
  }

  // Greeting / unknown — use greeting capability (ACP-01) as default
  const greetingCap = CAPABILITY_REGISTRY['CAP-001']!;
  return {
    primaryCapability:          greetingCap,
    secondaryCapabilities:      [],
    selectedAcpPaths:           [greetingCap.acpPath],
    priority:                   'STANDARD',
    shouldInterruptCurrentState: false,
    reason: intent === 'greeting'
      ? 'Greeting detected — ACP-01 opens conversation.'
      : 'Intent unclear — ACP-01 defaults to need discovery.',
  };
}
