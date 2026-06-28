// Gen1 Context Types — Phase 10.6
// Canonical ExecutionContext schema and builder I/O types.
// Technology-independent: no LINE fields, no OpenAI fields.
// Source: AIOS-ACE-02 (schema), AIOS-ACE-12 (response profile), AIOS-ACE-13 (validation).

import type { RuntimeInput } from '../core/types';
import type { IntentDetectorResult } from '../capability/intentDetector';
import type { CapabilityLoaderResult } from '../capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../memory/memoryTypes';
import type { KnowledgeSelectionResult } from '../knowledge/knowledgeTypes';
import type { RuntimeDecisionResult } from '../decision/decisionTypes';
import type { ConversationStrategyResult } from '../conversation/strategyTypes';

// ─── Builder I/O ─────────────────────────────────────────────────────────────

export interface ContextBuilderInput {
  runtimeInput: RuntimeInput;
  intentResult: IntentDetectorResult;
  capabilityResult: CapabilityLoaderResult;
  memoryResult: RuntimeMemoryResolution;
  knowledgeResult: KnowledgeSelectionResult;
  decisionResult: RuntimeDecisionResult;
  strategyResult: ConversationStrategyResult;
}

export interface ContextBuilderResult {
  executionContext: ExecutionContext;
  compressedContext: string;
  validation: ContextValidationResult;
  warnings: string[];
  contextTrace: ContextTrace;
}

// ─── Request section ─────────────────────────────────────────────────────────

export interface ContextRequest {
  rawInput: string;
  normalizedInput: string;    // NFC-normalized, trimmed
  channel: string;            // 'line' | 'web' | 'test'
  timestamp: string;          // ISO8601
  turnNumber: number;
  sessionId: string;
}

// ─── User section ─────────────────────────────────────────────────────────────

export interface ContextUser {
  userId: string;             // Platform-agnostic identifier (masked)
  displayName: string | null;
  language: 'th' | 'en' | 'mixed';
  isReturning: boolean;
}

// ─── Session section ──────────────────────────────────────────────────────────

export interface ContextSession {
  sessionId: string;
  turnCount: number;
  activeState: string | null;
  priorState: string | null;
}

// ─── Message section ──────────────────────────────────────────────────────────
// Compressed conversation context (no raw history in Gen1 — stub).

export interface ContextMessage {
  summary: string;             // Compressed prior turn summary (empty in Gen1)
  lastAiAction: string | null; // Last AI action taken
  unresolvedQuestion: string | null;
}

// ─── Intent section ───────────────────────────────────────────────────────────

export interface ContextIntent {
  primary: string;
  confidence: number;
  secondary: string | null;
  isTrustSignal: boolean;
  isMedicalSignal: boolean;
  isEmergency: boolean;
  isHumanRequest: boolean;
  isProductIntent: boolean;
  isRecommendationIntent: boolean;
}

// ─── Capability section ───────────────────────────────────────────────────────

export interface ContextCapabilityRef {
  id: string;                 // e.g. 'CAP-001'
  name: string;
  acpPath: string;
  priority: string;
}

export interface ContextCapability {
  primary: ContextCapabilityRef;
  secondary: ContextCapabilityRef[];
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD' | 'LOW';
  overrideReason: string | null;
}

// ─── Memory section ───────────────────────────────────────────────────────────

export interface KnownContextFact {
  field: string;
  value: string;
  source: string;
}

export interface ContextMemory {
  requiredFieldsPresent: boolean;
  knownFacts: KnownContextFact[];
  missingRequired: string[];
}

// ─── Knowledge section ────────────────────────────────────────────────────────

export interface ContextKnowledgeFragment {
  sourceId: string;
  relevance: number;
  excerpt: string;
  fullPath: string;
  isMandatory: boolean;
}

export interface ContextKnowledge {
  sources: ContextKnowledgeFragment[];
  totalChars: number;
  compressed: boolean;
  mandatoryFragmentsIncluded: string[];
}

// ─── Decision section ─────────────────────────────────────────────────────────

export interface ContextDecision {
  action: string;
  priority: string;
  reason: string;
  constraints: string[];
  shouldCollectLead: boolean;
  shouldEscalate: boolean;
  askField: string | null;
}

// ─── Response profile ─────────────────────────────────────────────────────────
// Source: AIOS-ACE-12

export interface ResponseProfile {
  tone: string;
  length: 'short' | 'medium' | 'long';
  empathyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  questionStrategy: 'one_question' | 'no_question' | 'clarifying_only';
  answerFirst: boolean;
  maxRecommendations: number;
  thaiResponse: boolean;
  prohibitedPhrases: string[];
  ctaAllowed: boolean;
  mustIncludeDisclaimer: boolean;     // ACP-04 medical uncertainty language
  mustIncludeRiskDisclosure: boolean; // ACP-07 investment risk disclosure
}

// ─── Restrictions section ────────────────────────────────────────────────────
// Source: AIOS-ACE-02 + AIOS-ACE-13

export interface ContextRestriction {
  id: string;          // e.g. 'R-ACP08-01'
  rule: string;        // One-line rule
  severity: 'HARD' | 'SOFT';
  source: string;      // Which ACP or pattern owns this restriction
}

export interface ContextRestrictions {
  active: ContextRestriction[];
  hardProhibitions: string[];   // Absolute — LLM must always see these in full
  softProhibitions: string[];   // Avoid unless necessary
}

// ─── Escalation section ───────────────────────────────────────────────────────

export interface ContextEscalation {
  required: boolean;
  type: 'immediate' | 'warm' | 'scheduled' | null;
  reason: string | null;
  target: 'jirawat' | null;
  contextForJirawat: string | null;  // Compressed handoff summary
}

// ─── Policy sections ──────────────────────────────────────────────────────────

export interface ContextLeadPolicy {
  captureAllowed: boolean;
  fieldBeingAsked: string | null;
  knownFields: string[];            // Never ask again
  valueDelivered: boolean;          // CP-03 education guard
  captureStage: string;
}

export interface ContextTrustPolicy {
  trustConcernActive: boolean;
  trustConcernTurn: number | null;
  turnsSinceTrustConcern: number | null;
  leadCaptureAllowed: boolean;
  trustResolved: boolean;
}

export interface ContextMedicalPolicy {
  medicalConcernActive: boolean;
  conditionsDisclosed: string[];
  disclaimerRequired: boolean;
}

// ─── Conversation strategy section ───────────────────────────────────────────
// Phase Pre-10.9: strategy engine output, inserted before response profile in context.

export interface ContextConversationStrategy {
  strategyId: string;
  strategyGoal: string;
  orderedSteps: string[];
  topicShiftDetected: boolean;
  leadCaptureAllowedByStrategy: boolean;
  mustAnswerFirst: boolean;
  mustEducate: boolean;
  mustRecommendBeforeCapture: boolean;
  strategyWarnings: string[];
}

// ─── Analytics section ────────────────────────────────────────────────────────

export interface ContextAnalytics {
  auditId: string;
  acpSelected: string;
  intentConfidence: number;
  charCount: number;
  compressionApplied: boolean;
  assemblyTimeMs: number;
  validationPassed: boolean;
  restrictionsActive: number;
}

// ─── Context trace (builder audit) ───────────────────────────────────────────

export interface ContextTrace {
  assemblyTimeMs: number;
  stepsCompleted: number;
  compressedCharCount: number;
  validationPassed: boolean;
  validationHardFailures: string[];
  validationSoftFailures: string[];
  auditId: string;
}

// ─── Validation result ────────────────────────────────────────────────────────
// Source: AIOS-ACE-13

export interface ContextValidationIssue {
  ruleId: string;
  message: string;
  severity: 'HARD' | 'SOFT';
}

export interface ContextValidationResult {
  passed: boolean;
  safeToSendToLlm: boolean;
  hardFailures: string[];
  softFailures: string[];
  issues: ContextValidationIssue[];
  action: 'proceed' | 'fix_and_retry' | 'safe_fallback';
}

// ─── ExecutionContext (canonical) ─────────────────────────────────────────────
// Channel-independent. No LINE fields.

export interface ExecutionContext {
  request: ContextRequest;
  user: ContextUser;
  session: ContextSession;
  message: ContextMessage;
  intent: ContextIntent;
  capability: ContextCapability;
  memory: ContextMemory;
  knowledge: ContextKnowledge;
  decision: ContextDecision;
  conversationStrategy: ContextConversationStrategy;
  responseProfile: ResponseProfile;
  restrictions: ContextRestrictions;
  escalation: ContextEscalation;
  leadPolicy: ContextLeadPolicy;
  trustPolicy: ContextTrustPolicy;
  medicalPolicy: ContextMedicalPolicy;
  analytics: ContextAnalytics;
  trace: ContextTrace;
}
