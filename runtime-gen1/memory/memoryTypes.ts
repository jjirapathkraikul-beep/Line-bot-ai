// Technology-independent memory types for Gen1 runtime.
// No Vercel KV, Google Sheet, or LINE dependencies.

export type FactSource = 'customer_stated' | 'session' | 'crm' | 'inferred' | 'display_name';

export type CaptureStage = 'IDLE' | 'NAME' | 'PHONE' | 'TIME' | 'COMPLETE';

export type FieldPriority = 'REQUIRED' | 'HIGH' | 'STANDARD';

// ─── Core fact unit ───────────────────────────────────────────────────────────

export interface KnownCustomerFact {
  field: string;
  value: string;
  source: FactSource;
  turnNumber: number;   // turn index when fact was captured (0 = current turn or unknown)
  confidence: number;   // 0.0 – 1.0
}

// ─── Customer profile ─────────────────────────────────────────────────────────
// All known demographics + lead fields.
// Canonical field names follow Lead_Data_Model.md.

export interface RuntimeCustomerProfile {
  // Identity
  real_name: string | null;
  display_name: string | null;
  // Demographic
  age: number | null;
  gender: string | null;
  // Contact
  phone: string | null;
  preferred_contact_time: string | null;
  // Financial
  budget_annual: number | null;
  monthly_income: string | null;
  // Interest
  interest_category: string | null;
  product_interest: string | null;
  // Health summary
  health_status: string | null;
  // CRM status
  crm_saved: boolean;
  // Fields that are known — never re-ask (union of session + extracted this turn)
  fields_captured: string[];
}

// ─── Conversation memory ──────────────────────────────────────────────────────

export interface RuntimeConversationMemory {
  turnCount: number;                    // approximated; V1 does not track turns explicitly
  currentState: string;                 // e.g. 'idle', 'awaiting_field:phone', 'awaiting_category'
  priorState: string | null;
  lastIntent: string | null;
  unresolvedQuestion: string | null;
}

// ─── Medical memory ───────────────────────────────────────────────────────────

export interface RuntimeMedicalMemory {
  medicalConcernActive: boolean;
  conditionsDisclosed: string[];        // e.g. ['diabetes', 'hypertension']
  conditionsAssessed: string[];         // conditions for which follow-up was asked
  conditionsPending: string[];          // disclosed but not yet followed up
  underwritingContextReady: boolean;
  followUpTurnCount: number;
}

// ─── Lead capture memory ──────────────────────────────────────────────────────

export interface RuntimeLeadMemory {
  captureStage: CaptureStage;
  nameRequested: boolean;
  phoneRequested: boolean;
  timeRequested: boolean;
  nameDeclined: boolean;
  phoneDeclined: boolean;
  timeDeclined: boolean;
  interruptedAtStage: CaptureStage | null;
  valueDelivered: boolean;   // education guard: must be true before lead capture
}

// ─── Trust memory ─────────────────────────────────────────────────────────────

export interface RuntimeTrustMemory {
  trustConcernActive: boolean;
  trustConcernTurn: number | null;          // session turn when concern was raised
  turnsSinceTrustConcern: number | null;    // null = unknown (V1 does not persist trust turns)
  leadCaptureAllowed: boolean;              // false when trustConcernActive AND turns < 2
  trustResolved: boolean;
  credentialsDelivered: boolean;
  suspendedAcp: string | null;              // ACP active when trust fired
}

// ─── Field ask decision ───────────────────────────────────────────────────────

export interface MissingMemoryField {
  field: string;
  priority: FieldPriority;
  reason: string;
}

export interface DeferredMemoryField {
  field: string;
  deferReason: string;   // e.g. 'trust_concern_active', 'medical_in_progress', 'intent_unclear'
}

// ─── Message-extracted facts ──────────────────────────────────────────────────

export interface ExtractedFact {
  field: string;
  value: string;
  rawMatch: string;     // the substring/pattern that triggered extraction
  confidence: number;   // 0.0 – 1.0
}

// ─── Full resolution output ───────────────────────────────────────────────────

export interface RuntimeMemoryResolution {
  // Typed memory objects
  customerProfile: RuntimeCustomerProfile;
  conversationMemory: RuntimeConversationMemory;
  leadMemory: RuntimeLeadMemory;
  medicalMemory: RuntimeMedicalMemory;
  trustMemory: RuntimeTrustMemory;

  // Field classifications
  knownFields: string[];                  // non-null fields — never re-ask
  missingFields: MissingMemoryField[];    // fields needed but not yet captured
  deferredFields: DeferredMemoryField[];  // missing fields blocked by current intent
  neverAskAgainFields: string[];          // permanent list = knownFields

  // Current-turn field ask decision
  shouldAskField: boolean;
  nextBestFieldToAsk: string | null;

  // Facts extracted from current message this turn
  extractedFacts: ExtractedFact[];

  // Human-readable decision reason
  memoryDecisionReason: string;

  // Audit trace
  memoryTrace: {
    fieldsFromSession: string[];
    fieldsFromMessage: string[];
    fieldsBlocked: string[];
    leadCaptureAllowed: boolean;
    trustActive: boolean;
    medicalActive: boolean;
  };
}
