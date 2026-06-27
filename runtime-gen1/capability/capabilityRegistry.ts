export type CapabilityPriority = 'CRITICAL' | 'HIGH' | 'STANDARD';

export interface CapabilityEntry {
  capId: string;
  name: string;
  acpPath: string;               // relative to AIOS/CapabilityPackages/
  priority: CapabilityPriority;
  supportedIntents: string[];
  canInterruptLeadCapture: boolean;
  requiresHumanEscalation: boolean;
  description: string;
}

// ─── Capability Registry ──────────────────────────────────────────────────────
// Source of truth: AIOS/AIRR/Capability_Registry_Reconciliation.md (Option B)
// CAP-NNN = runtime selector; ACP-NN = specification package
// Phase 10.2 expands CAP-004 FAQEngine into per-product capabilities

export const CAPABILITY_REGISTRY: Record<string, CapabilityEntry> = {

  'CAP-001': {
    capId:                    'CAP-001',
    name:                     'Greeting',
    acpPath:                  'ACP-01_GREETING',
    priority:                 'STANDARD',
    supportedIntents:         ['greeting', 'unknown'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Initial greeting and conversation opening; routes to appropriate capability.',
  },

  'CAP-002': {
    capId:                    'CAP-002',
    name:                     'TrustEngine',
    acpPath:                  'ACP-08_TRUST_ADVISOR',
    priority:                 'CRITICAL',
    supportedIntents:         ['trust_concern', 'fraud_concern'],
    canInterruptLeadCapture:  true,
    requiresHumanEscalation:  false,
    description:              'Handles trust/fraud concerns. CRITICAL priority — suspends all other capabilities until resolved.',
  },

  'CAP-003': {
    capId:                    'CAP-003',
    name:                     'MedicalAdvisor',
    acpPath:                  'ACP-04_MEDICAL_ADVISOR',
    priority:                 'HIGH',
    supportedIntents:         ['medical_underwriting'],
    canInterruptLeadCapture:  true,
    requiresHumanEscalation:  true,
    description:              'Handles medical underwriting questions. Case-by-case; never guarantees approval.',
  },

  'CAP-004': {
    capId:                    'CAP-004',
    name:                     'HealthAdvisor',
    acpPath:                  'ACP-02_HEALTH_ADVISOR',
    priority:                 'STANDARD',
    supportedIntents:         ['health_insurance'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Advises on health insurance products (Good Health Prime and related).',
  },

  'CAP-005': {
    capId:                    'CAP-005',
    name:                     'CancerAdvisor',
    acpPath:                  'ACP-03_CANCER_ADVISOR',
    priority:                 'STANDARD',
    supportedIntents:         ['cancer_insurance'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Advises on cancer and critical illness insurance (Tokio Cancer Care).',
  },

  'CAP-006': {
    capId:                    'CAP-006',
    name:                     'TaxAdvisor',
    acpPath:                  'ACP-05_TAX_ADVISOR',
    priority:                 'STANDARD',
    supportedIntents:         ['tax_planning'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Advises on tax-deductible insurance products (Tokyo SuperTax).',
  },

  'CAP-007': {
    capId:                    'CAP-007',
    name:                     'RecommendationEngine',
    acpPath:                  'ACP-09_RECOMMENDATION_ENGINE',
    priority:                 'STANDARD',
    supportedIntents:         ['recommendation_request'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Produces personalised insurance recommendations from customer context.',
  },

  'CAP-008': {
    capId:                    'CAP-008',
    name:                     'LeadCapture',
    acpPath:                  'ACP-11_LEAD_CAPTURE',
    priority:                 'STANDARD',
    supportedIntents:         [],   // activated by completion conditions, not a single intent
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Handles progressive lead data collection. Requires trust safe and value delivered.',
  },

  'CAP-009': {
    capId:                    'CAP-009',
    name:                     'RetirementAdvisor',
    acpPath:                  'ACP-06_RETIREMENT_ADVISOR',
    priority:                 'STANDARD',
    supportedIntents:         ['retirement_planning'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Advises on retirement savings insurance products.',
  },

  'CAP-010': {
    capId:                    'CAP-010',
    name:                     'InvestmentAdvisor',
    acpPath:                  'ACP-07_INVESTMENT_ADVISOR',
    priority:                 'STANDARD',
    supportedIntents:         ['investment_linked'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Advises on unit-linked and investment-linked insurance (Tokyo Beyond).',
  },

  'CAP-011': {
    capId:                    'CAP-011',
    name:                     'ClaimSupport',
    acpPath:                  'ACP-15_CLAIM_SUPPORT',
    priority:                 'HIGH',
    supportedIntents:         ['claim_question'],
    canInterruptLeadCapture:  true,
    requiresHumanEscalation:  true,
    description:              'Handles claims filing questions, documentation, and status queries.',
  },

  'CAP-012': {
    capId:                    'CAP-012',
    name:                     'HospitalGuidance',
    acpPath:                  'ACP-16_HOSPITAL_GUIDANCE',
    priority:                 'HIGH',
    supportedIntents:         ['hospital_question'],
    canInterruptLeadCapture:  true,
    requiresHumanEscalation:  false,
    description:              'Answers hospital network, coverage area, and treatment cost questions.',
  },

  'CAP-013': {
    capId:                    'CAP-013',
    name:                     'HumanHandoff',
    acpPath:                  'ACP-17_HUMAN_HANDOFF',
    priority:                 'HIGH',
    supportedIntents:         ['human_handoff'],
    canInterruptLeadCapture:  true,
    requiresHumanEscalation:  true,
    description:              'Executes warm handoff to Jirawat. Frames handoff as a positive next step.',
  },

  'CAP-014': {
    capId:                    'CAP-014',
    name:                     'PriceObjection',
    acpPath:                  'ACP-13_PRICE_OBJECTION',
    priority:                 'STANDARD',
    supportedIntents:         ['price_objection', 'premium_question'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Handles price objections and premium questions with context-aware reframing.',
  },

  'CAP-015': {
    capId:                    'CAP-015',
    name:                     'ExistingPolicy',
    acpPath:                  'ACP-14_EXISTING_POLICY',
    priority:                 'STANDARD',
    supportedIntents:         ['existing_policy'],
    canInterruptLeadCapture:  false,
    requiresHumanEscalation:  false,
    description:              'Handles customers who already have insurance coverage — review, upgrade, gap analysis.',
  },
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getCapabilityByIntent(intent: string): CapabilityEntry | null {
  for (const entry of Object.values(CAPABILITY_REGISTRY)) {
    if (entry.supportedIntents.includes(intent)) return entry;
  }
  return null;
}

export function getCapabilityById(capId: string): CapabilityEntry | null {
  return CAPABILITY_REGISTRY[capId] ?? null;
}

export function getCriticalCapabilities(): CapabilityEntry[] {
  return Object.values(CAPABILITY_REGISTRY).filter((e) => e.priority === 'CRITICAL');
}

export function getHighCapabilities(): CapabilityEntry[] {
  return Object.values(CAPABILITY_REGISTRY).filter((e) => e.priority === 'HIGH');
}
