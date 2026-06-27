export type RuntimeMode = 'v1' | 'gen1' | 'shadow';

export interface RuntimeInput {
  userId: string;
  message: string;
  session: unknown;       // V1 session from hydrateAll — fully typed in Phase 10.3
  displayName: string;
  replyToken: string;
  timestamp: string;
}

export interface RuntimeOutput {
  text: string;
  quickReplies?: Array<{ label: string; text: string }>;
  decision: string;
  runtimeVersion: string;
  trace: RuntimeTrace;
}

export interface RuntimeSession {
  displayName?: string;
  lastIntent?: string;
  currentState?: string;
  leadData?: Record<string, string>;
  trustState?: Record<string, unknown>;
}

export interface RuntimeMemory {
  session_id: string;
  customer_id: string;
  turn_number: number;
  fields_captured: string[];
  lead_capture_allowed: boolean;
  trust_concern_active: boolean;
  turns_since_trust_concern: number;
  last_intent?: string;
}

export interface RuntimeTrace {
  mode: RuntimeMode;
  userId_masked: string;
  message_preview: string;
  runtimeVersion: string;
  decision: string;
  timestamp: string;
  // Phase 10.2 additions — intent detector + capability loader
  detectedIntent?: string;
  confidence?: number;
  isTrustSignal?: boolean;
  isMedicalSignal?: boolean;
  isEmergency?: boolean;
  isHumanRequest?: boolean;
  selectedCapabilities?: string[];
  selectedAcpPaths?: string[];
  shouldInterruptCurrentState?: boolean;
  interruptReason?: string;
}

export interface RuntimeDecision {
  action: string;           // ACT-01 through ACT-12
  rationale: string;
  constraints: string[];
  lead_capture_allowed: boolean;
}

export interface RuntimeCapability {
  cap_id: string;           // e.g. 'CAP-002'
  acp_id: string;           // e.g. 'ACP-08'
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  name: string;
}

export interface RuntimeKnowledge {
  source_path: string;
  excerpt: string;
  relevance_score: number;  // 0.0 – 1.0
  mandatory: boolean;
}

export interface RuntimeContext {
  session_id: string;
  customer_id: string;
  message: string;
  detected_intent: string;
  capability: RuntimeCapability;
  decision: RuntimeDecision;
  knowledge: RuntimeKnowledge[];
  memory: RuntimeMemory;
  response_profile: {
    tone: string;
    length: 'short' | 'medium' | 'long';
    empathy: 'none' | 'low' | 'medium' | 'high' | 'critical';
    question_strategy: 'one_per_turn' | 'none';
  };
}

export interface RuntimeAnalyticsEvent {
  audit_id: string;
  session_id: string;
  customer_id_masked: string;
  timestamp: string;
  turn_number: number;
  detected_intent: string;
  selected_acp: string;
  decision_action: string;
  trust_signal_detected: boolean;
  lead_capture_allowed: boolean;
  fields_captured_this_turn: string[];
  handoff_triggered: boolean;
  knowledge_sources_used: string[];
  response_length_words: number;
  validation_passed: boolean;
  soft_failures: string[];
}
