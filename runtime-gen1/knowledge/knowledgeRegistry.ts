// Canonical knowledge path registry for Gen1 runtime.
// All paths are relative to project root and sourced from AIOS/AIRR/Knowledge_Path_Registry.md.
// File I/O is NOT performed here — this is a pure data registry.

import type { KnowledgeSource, KnowledgeSourceType, KnowledgeTrustLevel, KnowledgeFreshness } from './knowledgeTypes';

function src(
  path: string,
  type: KnowledgeSourceType,
  trustLevel: KnowledgeTrustLevel,
  freshness: KnowledgeFreshness,
  mandatory: boolean,
  relevanceScore: number,
  description: string,
): KnowledgeSource {
  const id = path
    .replace(/^AIOS\//, '')
    .replace(/[/. ]/g, '_')
    .replace(/_md$/, '');
  return { id, path, type, trustLevel, freshness, mandatory, relevanceScore, description };
}

// ─── Always included in every turn (SR-SEL-09) ───────────────────────────────

export const ALWAYS_INCLUDE_SOURCES: KnowledgeSource[] = [
  src(
    'AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md',
    'conversation_dataset',
    'AUTHORITATIVE',
    'STABLE',
    true,
    1.0,
    'Master conversation patterns CP-01 through CP-10 — mandatory per SR-SEL-09',
  ),
];

// ─── Per-intent source registry ───────────────────────────────────────────────

export const KNOWLEDGE_REGISTRY: Record<string, KnowledgeSource[]> = {

  // Trust concern — SR-SEL-03: load ACP-08 Restrictions FIRST; NO product/pricing docs
  trust_concern: [
    src('AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/Restrictions.md',        'acp_restriction',    'AUTHORITATIVE', 'STABLE',           true,  1.0,  'CRITICAL: Hard prohibitions during trust concern (load first)'),
    src('AIOS/Domains/Insurance/Trust/Trust_Engine.md',                         'domain_trust',       'HIGH',          'STABLE',           true,  1.0,  'Verification credentials and identity confirmation info'),
    src('AIOS/Domains/Insurance/Trust/Fraud_Handling.md',                       'domain_trust',       'HIGH',          'STABLE',           true,  0.95, 'Fraud concern handling procedures'),
    src('AIOS/Domains/Insurance/Objection/Scam_Concern.md',                     'domain_objection',   'HIGH',          'STABLE',           true,  0.95, 'Scam concern response patterns'),
    src('AIOS/Domains/Insurance/Trust/License_Verification.md',                 'domain_trust',       'HIGH',          'STABLE',           false, 0.85, 'OIC license and verification details'),
    src('AIOS/Domains/Insurance/Trust/Professional_Credibility.md',             'domain_trust',       'HIGH',          'STABLE',           false, 0.80, 'Professional credibility documentation'),
    src('AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/Response_Profile.md',     'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.90, 'Trust advisor response tone and style'),
    src('AIOS/ConversationDataset/08_TRUST_AND_SCAM.md',                        'conversation_dataset', 'HIGH',         'STABLE',          false, 0.90, 'Trust and scam conversation examples'),
  ],

  // Fraud concern — alias for trust_concern, Fraud_Handling.md mandatory
  fraud_concern: [
    src('AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/Restrictions.md',        'acp_restriction',    'AUTHORITATIVE', 'STABLE',           true,  1.0,  'CRITICAL: Hard prohibitions during trust concern (load first)'),
    src('AIOS/Domains/Insurance/Trust/Fraud_Handling.md',                       'domain_trust',       'HIGH',          'STABLE',           true,  1.0,  'Direct fraud handling guidance'),
    src('AIOS/Domains/Insurance/Trust/Trust_Engine.md',                         'domain_trust',       'HIGH',          'STABLE',           true,  1.0,  'Verification credentials and identity confirmation info'),
    src('AIOS/Domains/Insurance/Objection/Scam_Concern.md',                     'domain_objection',   'HIGH',          'STABLE',           true,  0.95, 'Scam concern response patterns'),
    src('AIOS/Domains/Insurance/Trust/License_Verification.md',                 'domain_trust',       'HIGH',          'STABLE',           false, 0.85, 'OIC license and verification details'),
    src('AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/Response_Profile.md',     'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.90, 'Trust advisor response tone and style'),
    src('AIOS/ConversationDataset/08_TRUST_AND_SCAM.md',                        'conversation_dataset', 'HIGH',         'STABLE',          false, 0.90, 'Trust and scam conversation examples'),
  ],

  // Medical underwriting — SR-SEL-04: load ACP-04 Restrictions FIRST; add uncertainty fragment
  medical_underwriting: [
    src('AIOS/CapabilityPackages/ACP-04_MEDICAL_ADVISOR/Restrictions.md',       'acp_restriction',    'AUTHORITATIVE', 'STABLE',           true,  1.0,  'CRITICAL: Never guarantee acceptance/rejection (load first)'),
    src('AIOS/Domains/Insurance/Knowledge/Medical.md',                          'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Medical underwriting principles and case-by-case approach'),
    src('AIOS/Domains/Insurance/Knowledge/Underwriting.md',                     'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', true,  0.95, 'Underwriting criteria and exclusion principles'),
    src('AIOS/CapabilityPackages/ACP-04_MEDICAL_ADVISOR/Response_Profile.md',   'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.90, 'Medical advisor response tone'),
    src('AIOS/ConversationDataset/04_MEDICAL_UNDERWRITING.md',                  'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Medical underwriting conversation examples'),
  ],

  // Health insurance
  health_insurance: [
    src('AIOS/Domains/Insurance/Products/Health_Insurance.md',                  'domain_product',     'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Health insurance product facts, coverage types, room rates'),
    src('AIOS/CapabilityPackages/ACP-02_HEALTH_ADVISOR/Response_Profile.md',    'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         true,  0.90, 'Health advisor response tone and style'),
    src('AIOS/Domains/Insurance/Knowledge/FAQ.md',                              'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', false, 0.80, 'Health insurance FAQs'),
    src('AIOS/ConversationDataset/02_HEALTH_INSURANCE.md',                      'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Health insurance conversation examples'),
    src('AIOS/CapabilityPackages/ACP-02_HEALTH_ADVISOR/Restrictions.md',        'acp_restriction',    'AUTHORITATIVE', 'STABLE',           false, 0.80, 'Health advisor restrictions'),
  ],

  // Cancer insurance
  cancer_insurance: [
    src('AIOS/Domains/Insurance/Products/Cancer_Insurance.md',                  'domain_product',     'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Cancer insurance types, lump sum, coverage stages'),
    src('AIOS/CapabilityPackages/ACP-03_CANCER_ADVISOR/Response_Profile.md',    'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         true,  0.90, 'Cancer advisor response tone'),
    src('AIOS/ConversationDataset/03_CANCER_INSURANCE.md',                      'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Cancer insurance conversation examples'),
    src('AIOS/CapabilityPackages/ACP-03_CANCER_ADVISOR/Restrictions.md',        'acp_restriction',    'AUTHORITATIVE', 'STABLE',           false, 0.80, 'Cancer advisor restrictions'),
    src('AIOS/Domains/Insurance/Knowledge/FAQ.md',                              'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', false, 0.75, 'General FAQs'),
  ],

  // Tax planning
  tax_planning: [
    src('AIOS/Domains/Insurance/Products/Tax_Planning.md',                      'domain_product',     'HIGH',          'REVIEW_ANNUALLY',  true,  1.0,  'Tax deductible insurance products and strategies'),
    src('AIOS/Domains/Insurance/Knowledge/Tax.md',                              'domain_knowledge',   'HIGH',          'REVIEW_ANNUALLY',  true,  1.0,  'Tax deduction limits (100k life, 25k health)'),
    src('AIOS/ConversationDataset/05_TAX_PLANNING.md',                          'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Tax planning conversation examples'),
    src('AIOS/CapabilityPackages/ACP-05_TAX_ADVISOR/Response_Profile.md',       'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.80, 'Tax advisor response tone'),
  ],

  // Retirement insurance
  retirement_insurance: [
    src('AIOS/Domains/Insurance/Products/Retirement.md',                        'domain_product',     'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Retirement and annuity product details'),
    src('AIOS/Domains/Insurance/Knowledge/Tax.md',                              'domain_knowledge',   'HIGH',          'REVIEW_ANNUALLY',  false, 0.75, 'Tax benefits of retirement products'),
    src('AIOS/ConversationDataset/06_RETIREMENT.md',                            'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Retirement planning conversation examples'),
    src('AIOS/CapabilityPackages/ACP-06_RETIREMENT_ADVISOR/Response_Profile.md', 'acp_response_profile', 'AUTHORITATIVE', 'STABLE',        false, 0.80, 'Retirement advisor response tone'),
  ],

  // Life insurance
  life_insurance: [
    src('AIOS/Domains/Insurance/Products/Life_Insurance.md',                    'domain_product',     'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Life insurance product facts'),
    src('AIOS/CapabilityPackages/ACP-02_HEALTH_ADVISOR/Response_Profile.md',    'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.70, 'General health/life advisory tone'),
  ],

  // Investment-linked product — risk disclosure is mandatory
  investment_linked: [
    src('AIOS/Domains/Insurance/Products/Investment_Linked.md',                 'domain_product',     'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'ILP structure, fund choice, risk profile'),
    src('AIOS/CapabilityPackages/ACP-07_INVESTMENT_ADVISOR/Restrictions.md',    'acp_restriction',    'AUTHORITATIVE', 'STABLE',           true,  0.95, 'Investment restrictions (risk disclosure mandatory — load first)'),
    src('AIOS/ConversationDataset/07_INVESTMENT_LINKED.md',                     'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Investment-linked conversation examples'),
    src('AIOS/CapabilityPackages/ACP-07_INVESTMENT_ADVISOR/Response_Profile.md', 'acp_response_profile', 'AUTHORITATIVE', 'STABLE',        false, 0.80, 'Investment advisor response tone'),
  ],

  // Claim question
  claim_question: [
    src('AIOS/Domains/Insurance/Knowledge/Claim.md',                            'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Claim process steps and document requirements'),
    src('AIOS/CapabilityPackages/ACP-15_CLAIM_SUPPORT/Restrictions.md',         'acp_restriction',    'AUTHORITATIVE', 'STABLE',           true,  0.95, 'Claim support restrictions (no product pitch during claims)'),
    src('AIOS/ConversationDataset/14_CLAIM.md',                                 'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Claim support conversation examples'),
    src('AIOS/CapabilityPackages/ACP-15_CLAIM_SUPPORT/Response_Profile.md',     'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.80, 'Claim support response tone'),
    src('AIOS/Domains/Insurance/Human/Escalation_Rules.md',                     'domain_human',       'HIGH',          'STABLE',           false, 0.75, 'Escalation rules for claim disputes'),
  ],

  // Hospital question
  hospital_question: [
    src('AIOS/Domains/Insurance/Knowledge/Hospital.md',                         'domain_knowledge',   'HIGH',          'REVIEW_QUARTERLY', true,  1.0,  'Hospital network and emergency protocol'),
    src('AIOS/CapabilityPackages/ACP-16_HOSPITAL_GUIDANCE/Response_Profile.md', 'acp_response_profile', 'AUTHORITATIVE', 'STABLE',        false, 0.85, 'Hospital guidance response tone'),
    src('AIOS/ConversationDataset/15_HOSPITAL.md',                              'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Hospital guidance conversation examples'),
    src('AIOS/CapabilityPackages/ACP-16_HOSPITAL_GUIDANCE/Restrictions.md',     'acp_restriction',    'AUTHORITATIVE', 'STABLE',           false, 0.80, 'Hospital guidance restrictions'),
  ],

  // Human handoff
  human_handoff: [
    src('AIOS/Domains/Insurance/Human/Human_Handoff.md',                        'domain_human',       'HIGH',          'STABLE',           true,  1.0,  'Warm handoff rules and process'),
    src('AIOS/Domains/Insurance/Human/Escalation_Rules.md',                     'domain_human',       'HIGH',          'STABLE',           true,  0.95, 'When and how to escalate to Jirawat'),
    src('AIOS/Domains/Insurance/Human/Advisor_Brief.md',                        'domain_human',       'HIGH',          'STABLE',           false, 0.85, 'Advisor briefing format for handoff'),
    src('AIOS/ConversationDataset/16_HUMAN_HANDOFF.md',                         'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Human handoff conversation examples'),
    src('AIOS/CapabilityPackages/ACP-17_HUMAN_HANDOFF/Response_Profile.md',     'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.80, 'Human handoff response tone'),
  ],

  // Recommendation request
  recommendation_request: [
    src('AIOS/Domains/Insurance/Recommendation/Recommendation_Framework.md',    'domain_recommendation', 'HIGH',       'REVIEW_QUARTERLY', true,  1.0,  'Recommendation framework and scoring model'),
    src('AIOS/Domains/Insurance/Recommendation/Product_Selection_Rules.md',     'domain_recommendation', 'HIGH',       'REVIEW_QUARTERLY', true,  0.95, 'Product selection rules by customer profile'),
    src('AIOS/Domains/Insurance/Recommendation/Budget_Optimization.md',         'domain_recommendation', 'HIGH',       'REVIEW_QUARTERLY', false, 0.80, 'Budget optimization for product mix'),
    src('AIOS/ConversationDataset/11_RECOMMENDATION.md',                        'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Recommendation conversation examples'),
    src('AIOS/CapabilityPackages/ACP-09_RECOMMENDATION_ENGINE/Decision_Rules.md', 'acp_decision_rules', 'AUTHORITATIVE', 'STABLE',         false, 0.85, 'Recommendation engine decision rules'),
    src('AIOS/CapabilityPackages/ACP-09_RECOMMENDATION_ENGINE/Response_Profile.md', 'acp_response_profile', 'AUTHORITATIVE', 'STABLE',      false, 0.80, 'Recommendation response tone'),
  ],

  // Price objection
  price_objection: [
    src('AIOS/Domains/Insurance/Objection/Price_Objection.md',                  'domain_objection',   'HIGH',          'STABLE',           true,  1.0,  'Price objection handling strategies'),
    src('AIOS/Domains/Insurance/Objection/Objection_Framework.md',              'domain_objection',   'HIGH',          'STABLE',           false, 0.80, 'General objection handling framework'),
    src('AIOS/ConversationDataset/12_PRICE_OBJECTION.md',                       'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Price objection conversation examples'),
    src('AIOS/CapabilityPackages/ACP-13_PRICE_OBJECTION/Response_Profile.md',   'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.80, 'Price objection response tone'),
  ],

  // Existing policy objection
  existing_policy: [
    src('AIOS/Domains/Insurance/Objection/Already_Have_Insurance.md',           'domain_objection',   'HIGH',          'STABLE',           true,  1.0,  'Handling existing insurance objections'),
    src('AIOS/ConversationDataset/13_EXISTING_INSURANCE.md',                    'conversation_dataset', 'HIGH',         'STABLE',          false, 0.85, 'Existing insurance conversation examples'),
    src('AIOS/CapabilityPackages/ACP-14_EXISTING_POLICY/Response_Profile.md',   'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         false, 0.80, 'Existing policy advisor response tone'),
  ],

  // Greeting
  greeting: [
    src('AIOS/CapabilityPackages/ACP-01_GREETING/Response_Profile.md',          'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         true,  1.0,  'Greeting response tone and first impression'),
    src('AIOS/ConversationDataset/01_GREETING.md',                              'conversation_dataset', 'HIGH',          'STABLE',          false, 0.85, 'Greeting conversation examples'),
  ],

  // Unknown / need discovery
  unknown: [
    src('AIOS/CapabilityPackages/ACP-10_NEED_DISCOVERY/Response_Profile.md',    'acp_response_profile', 'AUTHORITATIVE', 'STABLE',         true,  1.0,  'Need discovery response tone'),
    src('AIOS/ConversationDataset/10_NEED_DISCOVERY.md',                        'conversation_dataset', 'HIGH',          'STABLE',         false, 0.85, 'Need discovery conversation examples'),
    // Overview.md referenced in Knowledge_Path_Registry.md but not yet created — tests graceful missing-file handling
    src('AIOS/Domains/Insurance/Overview.md',                                   'domain_knowledge',   'HIGH',          'STABLE',           false, 0.70, 'Insurance domain overview (pending creation)'),
  ],
};

// ─── Blocked source types when trust signal is active (SR-SEL-03) ─────────────

export const TRUST_BLOCKED_TYPES = new Set<KnowledgeSourceType>([
  'domain_product',
  'domain_recommendation',
  'domain_sales',
  // domain_knowledge and domain_objection remain allowed (general knowledge still relevant)
]);

// ─── Registry lookup with fallback ───────────────────────────────────────────

export function getSourcesForIntent(intent: string): KnowledgeSource[] {
  return KNOWLEDGE_REGISTRY[intent] ?? KNOWLEDGE_REGISTRY['unknown'];
}
