import type { RuntimeInput, ConversationTurnContext } from '../core/types';
import type { IntentDetectorResult } from '../capability/intentDetector';
import type { CapabilityLoaderResult } from '../capability/capabilityLoader';
import { normTH } from '../capability/intentDetector';
import type {
  RuntimeMemoryResolution,
  RuntimeCustomerProfile,
  RuntimeConversationMemory,
  RuntimeLeadMemory,
  RuntimeMedicalMemory,
  RuntimeTrustMemory,
  ExtractedFact,
  MissingMemoryField,
  DeferredMemoryField,
  FieldPriority,
  CaptureStage,
} from './memoryTypes';

// ─── Input type ────────────────────────────────────────────────────────────────

export interface MemoryResolverInput {
  runtimeInput: RuntimeInput;
  intentResult: IntentDetectorResult;
  capabilityResult: CapabilityLoaderResult;
  conversationHistory?: ConversationTurnContext[];  // prior turns from KV (oldest first)
}

// ─── V1 session shape (read-only; frozen V1 schema) ──────────────────────────
// Mirrors lib/session.ts:UserSession without importing from frozen V1 code.

interface V1ExtractedData {
  real_name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  monthly_income?: string;
  purchase_objective?: string;
  product_interest?: string;
  budget?: string;                // V1 uses 'budget'; Gen1 canonical name is 'budget_annual'
  preferred_contact_time?: string;
}

interface V1AwaitingField {
  field: string;
  queue: string[];
  startedAt: number;
  mode: string;
}

interface V1StateMetadata {
  lastState?: string;
  lastIntent?: string;
  stateUpdatedAt?: number;
}

interface V1Session {
  data?: V1ExtractedData;
  awaitingField?: V1AwaitingField;
  awaitingCategory?: { startedAt: number };
  awaitingResume?: { startedAt: number };
  meta?: V1StateMetadata;
  displayName?: string;
  createdAt?: number;
  updatedAt?: number;
}

function safeV1Session(session: unknown): V1Session {
  if (session !== null && typeof session === 'object') return session as V1Session;
  return {};
}

// ─── Thai message extraction ──────────────────────────────────────────────────

// Age: "อายุ 39", "39 ปี", "ผม 39 ปี"
const AGE_PATTERNS: RegExp[] = [
  /อายุ\s*(\d{1,2})/,
  /(\d{1,2})\s*ปี/,
];

// Thai mobile: 0[6-9]X-XXXX-XXXX (10 digits) with optional separators, or +66XXXXXXXXX
// Pattern: 0 + [6-9] + digit + optional-sep + 3-digits + optional-sep + 4-digits
const PHONE_PATTERN = /(?:\+66|0)[6-9]\d[-. ]?\d{3}[-. ]?\d{4}/;

// Budget: "งบ 30000", "ปีละ 30000", "เดือนละ 2500"
const BUDGET_PATTERNS: Array<{ rx: RegExp; isMonthly: boolean }> = [
  { rx: /(?:งบ|งบประมาณ|budget)\s*(\d[\d,]*)/i, isMonthly: false },
  { rx: /ปีละ\s*(\d[\d,]*)/,                      isMonthly: false },
  { rx: /เดือนละ\s*(\d[\d,]*)/,                   isMonthly: true  },
];

// Preferred contact time
const CONTACT_TIME_MAP: Array<{ rx: RegExp; value: string }> = [
  { rx: /สะดวก(?:ช่วง)?เช้า/,    value: 'เช้า' },
  { rx: /สะดวก(?:ช่วง)?เย็น/,    value: 'เย็น' },
  { rx: /สะดวก(?:ช่วง)?กลางวัน/, value: 'กลางวัน' },
  { rx: /สะดวก(?:ช่วง)?ค่ำ/,     value: 'ค่ำ' },
  { rx: /สะดวก(?:ช่วง)?วันหยุด/, value: 'วันหยุด' },
  { rx: /(?:ช่วง|เวลา)\s*(\d{1,2})\s*(?:โมง|น\.)/,  value: '' },
];

// Medical conditions: label is the Gen1 canonical value stored in conditionsDisclosed
const MEDICAL_MAP: Array<{ keywords: string[]; label: string }> = [
  { keywords: ['เบาหวาน', 'น้ำตาลในเลือดสูง'],                label: 'diabetes' },
  { keywords: ['ความดัน', 'ความดันโลหิตสูง', 'ความดันสูง'],   label: 'hypertension' },
  { keywords: ['มะเร็ง', 'cancer'],                            label: 'cancer' },
  { keywords: ['โรคหัวใจ', 'หัวใจ'],                          label: 'heart_disease' },
  { keywords: ['ไขมัน', 'คอเลสเตอรอล'],                       label: 'high_cholesterol' },
  { keywords: ['ก้อนเนื้อ', 'เนื้องอก', 'ซีสต์'],             label: 'tumor_or_cyst' },
  { keywords: ['โรคไต', 'ไตวาย'],                              label: 'kidney_disease' },
  { keywords: ['โรคตับ', 'ตับอักเสบ'],                         label: 'liver_disease' },
  { keywords: ['เก๊าท์'],                                      label: 'gout' },
  { keywords: ['ไทรอยด์'],                                     label: 'thyroid' },
];

// Product interest: map from message keywords to canonical interest_category
const PRODUCT_INTEREST_MAP: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['good health prime', 'good health', 'health prime'], category: 'Good Health Prime' },
  { keywords: ['ประกันสุขภาพ', 'health insurance', 'สุขภาพ'],   category: 'ประกันสุขภาพ' },
  { keywords: ['ประกันมะเร็ง', 'cancer care', 'ci', 'โรคร้าย'], category: 'ประกันมะเร็ง' },
  { keywords: ['ลดหย่อนภาษี', 'ภาษี', 'tax'],                  category: 'วางแผนภาษี' },
  { keywords: ['เกษียณ', 'retirement'],                          category: 'ประกันเกษียณ' },
  { keywords: ['ประกันชีวิต', 'life'],                           category: 'ประกันชีวิต' },
  { keywords: ['unit linked', 'ulip', 'ลงทุน'],                  category: 'ลงทุน' },
];

// Maps Gen1 intent → canonical interest_category (used for inferred facts)
const INTENT_CATEGORY_MAP: Record<string, string> = {
  health_insurance:      'ประกันสุขภาพ',
  cancer_insurance:      'ประกันมะเร็ง',
  tax_planning:          'วางแผนภาษี',
  retirement_insurance:  'ประกันเกษียณ',
  life_insurance:        'ประกันชีวิต',
  investment_linked:     'ลงทุน',
};

// ─── Message-level fact extractor (deterministic, no LLM) ─────────────────────

export function extractFactsFromMessage(text: string): ExtractedFact[] {
  const norm = normTH(text);
  const facts: ExtractedFact[] = [];

  // Age
  for (const rx of AGE_PATTERNS) {
    const m = norm.match(rx);
    if (m?.[1]) {
      const age = parseInt(m[1], 10);
      if (age >= 1 && age <= 99) {
        facts.push({ field: 'age', value: String(age), rawMatch: m[0], confidence: 0.90 });
        break;
      }
    }
  }

  // Gender — explicit keywords only
  const maleKws = ['เป็นชาย', 'ผู้ชาย', 'ชาย'];
  const malePronouns = ['ผม'];
  const femaleKws = ['เป็นผู้หญิง', 'ผู้หญิง', 'หญิง'];
  const femalePronouns = ['หนู', 'ฉัน'];

  const foundMale = maleKws.find((kw) => norm.includes(normTH(kw)));
  const foundMalePronoun = !foundMale && malePronouns.find((kw) => norm.includes(normTH(kw)));
  const foundFemale = femaleKws.find((kw) => norm.includes(normTH(kw)));
  const foundFemalePronoun = !foundFemale && femalePronouns.find((kw) => norm.includes(normTH(kw)));

  if (foundMale) {
    facts.push({ field: 'gender', value: 'ชาย', rawMatch: foundMale, confidence: 0.92 });
  } else if (foundMalePronoun) {
    facts.push({ field: 'gender', value: 'ชาย', rawMatch: foundMalePronoun, confidence: 0.72 });
  } else if (foundFemale) {
    facts.push({ field: 'gender', value: 'หญิง', rawMatch: foundFemale, confidence: 0.92 });
  } else if (foundFemalePronoun) {
    facts.push({ field: 'gender', value: 'หญิง', rawMatch: foundFemalePronoun, confidence: 0.72 });
  }

  // Phone
  const phoneMatch = text.match(PHONE_PATTERN);
  if (phoneMatch) {
    const cleaned = phoneMatch[0].replace(/[-. ]/g, '');
    facts.push({ field: 'phone', value: cleaned, rawMatch: phoneMatch[0], confidence: 0.95 });
  }

  // Budget
  for (const { rx, isMonthly } of BUDGET_PATTERNS) {
    const m = norm.match(rx);
    if (m?.[1]) {
      const raw = parseInt(m[1].replace(/,/g, ''), 10);
      if (!isNaN(raw) && raw > 0) {
        const annual = isMonthly ? raw * 12 : raw;
        facts.push({ field: 'budget_annual', value: String(annual), rawMatch: m[0], confidence: 0.88 });
        break;
      }
    }
  }

  // Preferred contact time
  for (const { rx, value } of CONTACT_TIME_MAP) {
    const m = norm.match(rx);
    if (m) {
      const resolved = value || m[1] || '';
      if (resolved) {
        facts.push({ field: 'preferred_contact_time', value: resolved, rawMatch: m[0], confidence: 0.85 });
        break;
      }
    }
  }

  // Medical conditions
  for (const { keywords, label } of MEDICAL_MAP) {
    for (const kw of keywords) {
      if (norm.includes(normTH(kw))) {
        if (!facts.some((f) => f.field === 'medical_condition' && f.value === label)) {
          facts.push({ field: 'medical_condition', value: label, rawMatch: kw, confidence: 0.88 });
        }
        break;
      }
    }
  }

  // Product interest (explicit from message text)
  for (const { keywords, category } of PRODUCT_INTEREST_MAP) {
    for (const kw of keywords) {
      if (norm.includes(normTH(kw))) {
        if (!facts.some((f) => f.field === 'interest_category')) {
          facts.push({ field: 'interest_category', value: category, rawMatch: kw, confidence: 0.85 });
          facts.push({ field: 'product_interest',  value: category, rawMatch: kw, confidence: 0.85 });
        }
        break;
      }
    }
  }

  return facts;
}

// ─── Session → field capture list ────────────────────────────────────────────

// Maps V1 session field names to Gen1 canonical field names.
// V1 uses 'budget'; Gen1 Lead Data Model uses 'budget_annual'.
const V1_TO_GEN1_FIELD: Record<string, string> = {
  real_name:             'real_name',
  age:                   'age',
  gender:                'gender',
  phone:                 'phone',
  monthly_income:        'monthly_income',
  purchase_objective:    'purchase_objective',
  product_interest:      'product_interest',
  budget:                'budget_annual',
  preferred_contact_time: 'preferred_contact_time',
};

function sessionFieldsFromV1Data(data: V1ExtractedData): string[] {
  const captured: string[] = [];
  for (const [v1Key, gen1Key] of Object.entries(V1_TO_GEN1_FIELD)) {
    if (data[v1Key as keyof V1ExtractedData]) captured.push(gen1Key);
  }
  return captured;
}

function deriveCurrentState(sess: V1Session): string {
  if (sess.awaitingField?.field) return `awaiting_field:${sess.awaitingField.field}`;
  if (sess.awaitingCategory)     return 'awaiting_category';
  if (sess.awaitingResume)       return 'awaiting_resume';
  return sess.meta?.lastState ?? 'idle';
}

// ─── Profile builder ──────────────────────────────────────────────────────────

function buildCustomerProfile(
  sess: V1Session,
  extractedFacts: ExtractedFact[],
  displayName: string,
): RuntimeCustomerProfile {
  const d = sess.data ?? {};
  const fields_captured: string[] = [];

  // Priority 2 — session data
  const real_name             = d.real_name             ?? null;
  const gender                = d.gender                ?? null;
  const phone                 = d.phone                 ?? null;
  const preferred_contact_time = d.preferred_contact_time ?? null;
  const product_interest      = d.product_interest      ?? null;
  const monthly_income        = d.monthly_income        ?? null;
  const health_status         = null; // V1 doesn't persist health_status in ExtractedData

  // V1 stores age as string; parse to number
  let age: number | null = d.age ? parseInt(d.age, 10) : null;
  if (age !== null && isNaN(age)) age = null;

  // V1 uses 'budget'; parse to number
  let budget_annual: number | null = null;
  if (d.budget) {
    const raw = parseInt(d.budget.replace(/,/g, ''), 10);
    if (!isNaN(raw)) budget_annual = raw;
  }

  let interest_category: string | null = d.product_interest ?? null;

  // Priority 1 — explicit statement this turn: override session values
  let newAge              = age;
  let newGender           = gender;
  let newPhone            = phone;
  let newBudget           = budget_annual;
  let newContactTime      = preferred_contact_time;
  let newInterestCategory = interest_category;
  let newProductInterest  = product_interest;

  for (const fact of extractedFacts) {
    switch (fact.field) {
      case 'age':                 newAge              = parseInt(fact.value, 10); break;
      case 'gender':              newGender           = fact.value; break;
      case 'phone':               newPhone            = fact.value; break;
      case 'budget_annual':       newBudget           = parseInt(fact.value, 10); break;
      case 'preferred_contact_time': newContactTime   = fact.value; break;
      case 'interest_category':   newInterestCategory = fact.value; break;
      case 'product_interest':    newProductInterest  = fact.value; break;
    }
  }

  // Build fields_captured — all non-null fields
  const profile: RuntimeCustomerProfile = {
    real_name:              real_name ?? null,
    display_name:           displayName || null,
    age:                    newAge,
    gender:                 newGender,
    phone:                  newPhone,
    preferred_contact_time: newContactTime,
    budget_annual:          newBudget,
    monthly_income:         monthly_income,
    interest_category:      newInterestCategory,
    product_interest:       newProductInterest,
    health_status:          health_status,
    crm_saved:              !!(phone), // V1 saves to CRM when phone is captured
    fields_captured,
  };

  // Populate fields_captured from the final profile
  const captureCheckList: Array<[keyof RuntimeCustomerProfile, string]> = [
    ['real_name',              'real_name'],
    ['display_name',           'display_name'],
    ['age',                    'age'],
    ['gender',                 'gender'],
    ['phone',                  'phone'],
    ['preferred_contact_time', 'preferred_contact_time'],
    ['budget_annual',          'budget_annual'],
    ['monthly_income',         'monthly_income'],
    ['interest_category',      'interest_category'],
    ['product_interest',       'product_interest'],
  ];
  for (const [key, fieldName] of captureCheckList) {
    if (profile[key] !== null && profile[key] !== undefined) {
      fields_captured.push(fieldName);
    }
  }

  // display_name from LINE is not a "captured" field (we don't ask for it)
  // but it IS known. Keep it in fields_captured so we never ask for name if display_name exists.

  return profile;
}

// ─── Trust memory builder ─────────────────────────────────────────────────────

function buildTrustMemory(
  intentResult: IntentDetectorResult,
  capabilityResult: CapabilityLoaderResult,
): RuntimeTrustMemory {
  // V1 does not persist trust state across turns. For Gen1 Phase 10.3, we detect
  // trust only in the current turn. Cross-turn trust suspension will be persisted
  // properly in Phase 10.8 when the LINE adapter manages Gen1 session state.
  const trustConcernActive = intentResult.flags.isTrustSignal;
  const leadCaptureAllowed = !trustConcernActive;

  return {
    trustConcernActive,
    trustConcernTurn:       trustConcernActive ? 0 : null, // 0 = current turn (turn count unavailable)
    turnsSinceTrustConcern: trustConcernActive ? 0 : null,
    leadCaptureAllowed,
    trustResolved:          !trustConcernActive,
    credentialsDelivered:   false, // will be set by ACE in Phase 10.6
    suspendedAcp:           trustConcernActive
      ? (capabilityResult.primaryCapability.capId !== 'CAP-002'
          ? capabilityResult.primaryCapability.capId
          : null)
      : null,
  };
}

// ─── Medical memory builder ───────────────────────────────────────────────────

function buildMedicalMemory(
  intentResult: IntentDetectorResult,
  extractedFacts: ExtractedFact[],
): RuntimeMedicalMemory {
  const conditions = extractedFacts
    .filter((f) => f.field === 'medical_condition')
    .map((f) => f.value);

  const medicalConcernActive = intentResult.flags.isMedicalSignal || conditions.length > 0;

  return {
    medicalConcernActive,
    conditionsDisclosed:      conditions,
    conditionsAssessed:       [],    // populated in Phase 10.6 (ACE/Decision Engine)
    conditionsPending:        conditions, // all new conditions are pending follow-up
    underwritingContextReady: false, // set by ACE after follow-up questions asked
    followUpTurnCount:        0,
  };
}

// ─── Lead memory builder ──────────────────────────────────────────────────────

function buildLeadMemory(sess: V1Session, profile: RuntimeCustomerProfile): RuntimeLeadMemory {
  let captureStage: CaptureStage = 'IDLE';
  const state = deriveCurrentState(sess);

  if (state === 'awaiting_field:real_name') captureStage = 'NAME';
  else if (state === 'awaiting_field:phone')  captureStage = 'PHONE';
  else if (state === 'awaiting_field:preferred_contact_time') captureStage = 'TIME';
  else if (
    profile.real_name !== null &&
    profile.phone !== null &&
    profile.preferred_contact_time !== null
  ) {
    captureStage = 'COMPLETE';
  }

  return {
    captureStage,
    nameRequested:         captureStage === 'NAME',
    phoneRequested:        captureStage === 'PHONE',
    timeRequested:         captureStage === 'TIME',
    nameDeclined:          false,   // V1 doesn't persist decline state
    phoneDeclined:         false,
    timeDeclined:          false,
    interruptedAtStage:    null,    // will be set by interrupt logic in Phase 10.5
    valueDelivered:        !!(sess.meta?.lastIntent && sess.meta.lastIntent !== 'none'),
  };
}

// ─── Conversation memory builder ──────────────────────────────────────────────

function buildConversationMemory(sess: V1Session): RuntimeConversationMemory {
  return {
    turnCount:           0,          // V1 does not track turn count
    currentState:        deriveCurrentState(sess),
    priorState:          sess.meta?.lastState ?? null,
    lastIntent:          sess.meta?.lastIntent ?? null,
    unresolvedQuestion:  null,       // populated by ACE in Phase 10.6
  };
}

// ─── Lead field priority ──────────────────────────────────────────────────────
// Fields ordered by how important they are for completing a product recommendation.

const LEAD_FIELD_PRIORITY: Array<{ field: string; priority: FieldPriority }> = [
  { field: 'age',                  priority: 'HIGH'     },
  { field: 'interest_category',    priority: 'HIGH'     },
  { field: 'budget_annual',        priority: 'HIGH'     },
  { field: 'gender',               priority: 'STANDARD' },
  { field: 'real_name',            priority: 'STANDARD' },
  { field: 'phone',                priority: 'HIGH'     },
  { field: 'preferred_contact_time', priority: 'STANDARD' },
];

// For human handoff, phone is the most critical field to collect.
const HUMAN_HANDOFF_PRIORITY: Array<{ field: string; priority: FieldPriority }> = [
  { field: 'phone',                priority: 'REQUIRED' },
  { field: 'real_name',            priority: 'HIGH'     },
  { field: 'preferred_contact_time', priority: 'STANDARD' },
];

// ─── Field set computation ────────────────────────────────────────────────────

function computeFieldSets(
  profile: RuntimeCustomerProfile,
  intentResult: IntentDetectorResult,
  capabilityResult: CapabilityLoaderResult,
  trustMemory: RuntimeTrustMemory,
  medicalMemory: RuntimeMedicalMemory,
): {
  missingFields: MissingMemoryField[];
  deferredFields: DeferredMemoryField[];
  nextBestFieldToAsk: string | null;
  shouldAskField: boolean;
  memoryDecisionReason: string;
} {
  const { intent, flags } = intentResult;
  const known = new Set(profile.fields_captured);

  // Choose priority list based on intent
  const isHumanHandoff = flags.isHumanRequest || intent === 'human_handoff';
  const priorityList = isHumanHandoff ? HUMAN_HANDOFF_PRIORITY : LEAD_FIELD_PRIORITY;

  // Compute raw missing fields (regardless of intent blocking)
  const missingFields: MissingMemoryField[] = [];
  for (const { field, priority } of priorityList) {
    if (!known.has(field)) {
      missingFields.push({ field, priority, reason: `${field} not yet captured` });
    }
  }

  // Determine blocking reason
  const blocked =
    flags.isTrustSignal ? 'trust_concern_active' :
    (intent === 'claim_question') ? 'claim_in_progress' :
    (intent === 'hospital_question') ? 'hospital_in_progress' :
    flags.isMedicalSignal ? 'medical_in_progress' :
    intent === 'unknown' ? 'intent_unclear' :
    null;

  // Compute deferred fields (blocked by intent).
  // Human handoff is NOT blocked — it uses a different priority list (HUMAN_HANDOFF_PRIORITY)
  // that asks for contact fields. All other blocking intents defer ALL missing lead fields.
  const deferredFields: DeferredMemoryField[] = [];
  if (blocked) {
    for (const { field } of missingFields) {
      deferredFields.push({ field, deferReason: blocked });
    }
  }

  // Compute nextBestFieldToAsk (first missing field NOT deferred)
  const deferredSet = new Set(deferredFields.map((f) => f.field));
  const askable = missingFields.filter((f) => !deferredSet.has(f.field));
  const nextBestFieldToAsk = askable.length > 0 ? (askable[0]?.field ?? null) : null;
  const shouldAskField = nextBestFieldToAsk !== null && !trustMemory.trustConcernActive;

  let memoryDecisionReason: string;
  if (flags.isTrustSignal) {
    memoryDecisionReason = 'Trust concern active — all lead capture prohibited. ACP-08 takes control.';
  } else if (intent === 'claim_question') {
    memoryDecisionReason = 'Claim in progress — lead fields deferred until claim guidance complete.';
  } else if (intent === 'hospital_question') {
    memoryDecisionReason = 'Hospital guidance active — lead fields deferred.';
  } else if (flags.isMedicalSignal) {
    memoryDecisionReason = 'Medical signal detected — lead fields paused; medical follow-up has priority.';
  } else if (intent === 'human_handoff') {
    memoryDecisionReason = nextBestFieldToAsk
      ? `Human handoff: collecting ${nextBestFieldToAsk} for Jirawat handoff package.`
      : 'Human handoff: all contact fields known. Ready for handoff.';
  } else if (intent === 'unknown') {
    memoryDecisionReason = 'Intent unclear — lead fields deferred; clarifying question needed first.';
  } else if (missingFields.length === 0) {
    memoryDecisionReason = 'All lead fields captured. Lead is complete.';
  } else if (nextBestFieldToAsk) {
    memoryDecisionReason = `Product intent '${intent}' — next field to collect: ${nextBestFieldToAsk}.`;
  } else {
    memoryDecisionReason = 'No field collection needed this turn.';
  }

  return { missingFields, deferredFields, nextBestFieldToAsk, shouldAskField, memoryDecisionReason };
}

// ─── Main resolver ────────────────────────────────────────────────────────────

export function resolveMemory(input: MemoryResolverInput): RuntimeMemoryResolution {
  const { runtimeInput, intentResult, capabilityResult } = input;
  const sess = safeV1Session(runtimeInput.session);

  // Step 1a: Extract facts from current message
  const messageExtracted = extractFactsFromMessage(runtimeInput.message);

  // Step 1b: Extract facts from conversation history (prior turns from KV).
  // History facts use slightly lower confidence so the current message always wins on conflict.
  // Order: history first → current message last → current message overrides.
  const historyExtracted: ExtractedFact[] = [];
  if (input.conversationHistory && input.conversationHistory.length > 0) {
    const seenFields = new Set<string>();
    for (const turn of input.conversationHistory) {
      const turnFacts = extractFactsFromMessage(turn.userMessage);
      for (const fact of turnFacts) {
        if (!seenFields.has(fact.field)) {
          seenFields.add(fact.field);
          historyExtracted.push({ ...fact, confidence: fact.confidence * 0.85 });
        }
      }
    }
  }

  // Step 2: Infer interest_category from intent if not already extracted
  const inferredFacts: ExtractedFact[] = [];
  const hasInterestCategory = messageExtracted.some((f) => f.field === 'interest_category')
    || historyExtracted.some((f) => f.field === 'interest_category');
  const hasSessionInterest  = !!(sess.data?.product_interest);
  if (!hasInterestCategory && !hasSessionInterest) {
    const inferred = INTENT_CATEGORY_MAP[intentResult.intent];
    if (inferred) {
      const hasGoodHealthPrimeContext = [...historyExtracted, ...messageExtracted].some(
        (f) => f.field === 'product_interest' && f.value === 'Good Health Prime',
      );
      const inferredValue = hasGoodHealthPrimeContext ? 'Good Health Prime' : inferred;
      inferredFacts.push({
        field: 'interest_category',
        value: inferredValue,
        rawMatch: intentResult.intent,
        confidence: 0.80,
      });
      inferredFacts.push({
        field: 'product_interest',
        value: inferredValue,
        rawMatch: intentResult.intent,
        confidence: 0.80,
      });
    }
  }

  // History first so current message facts overwrite on the same field
  const extractedFacts = [...historyExtracted, ...messageExtracted, ...inferredFacts];

  // Step 3: Build typed memory objects
  const customerProfile    = buildCustomerProfile(sess, extractedFacts, runtimeInput.displayName);
  const trustMemory        = buildTrustMemory(intentResult, capabilityResult);
  const medicalMemory      = buildMedicalMemory(intentResult, extractedFacts);
  const leadMemory         = buildLeadMemory(sess, customerProfile);
  const conversationMemory = buildConversationMemory(sess);

  // Step 4: Compute field sets and ask decision
  const { missingFields, deferredFields, nextBestFieldToAsk, shouldAskField, memoryDecisionReason } =
    computeFieldSets(customerProfile, intentResult, capabilityResult, trustMemory, medicalMemory);

  const knownFields = [...customerProfile.fields_captured];

  // Field source breakdown for audit trace
  const sessionFieldNames = sessionFieldsFromV1Data(sess.data ?? {});
  const historyFieldNames = historyExtracted.map((f) => f.field);
  const messageFieldNames = messageExtracted.map((f) => f.field);
  const blockedFieldNames = deferredFields.map((f) => f.field);

  return {
    customerProfile,
    conversationMemory,
    leadMemory,
    medicalMemory,
    trustMemory,
    knownFields,
    missingFields,
    deferredFields,
    neverAskAgainFields: knownFields,
    shouldAskField,
    nextBestFieldToAsk,
    extractedFacts,
    memoryDecisionReason,
    memoryTrace: {
      fieldsFromSession:  sessionFieldNames,
      fieldsFromMessage:  messageFieldNames,
      fieldsFromHistory:  historyFieldNames,
      fieldsBlocked:      blockedFieldNames,
      leadCaptureAllowed: trustMemory.leadCaptureAllowed,
      trustActive:        trustMemory.trustConcernActive,
      medicalActive:      medicalMemory.medicalConcernActive,
    },
  };
}
