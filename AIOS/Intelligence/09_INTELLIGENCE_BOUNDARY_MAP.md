# 09 — Intelligence Boundary Map

**Document ID**: AIOS-INT-09  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect

---

## Purpose

This document maps each intelligence domain to the existing AIOS folder structure — specifying exactly which folders, files, and runtime modules each intelligence owns and which it consumes.

This is the reference document for answering: "If I want to change X, which intelligence domain should I talk to?"

---

## Reading This Document

Each intelligence entry contains:
- **Owns**: Folders and files this intelligence is responsible for. Changes require this intelligence's owner to approve.
- **Consumes**: Folders and files this intelligence reads or depends on. Changes to these may affect this intelligence's behavior.
- **Does not own**: Explicit boundaries to prevent scope creep.

---

## Intelligence 1 — Conversation Intelligence

### Owns

```
AIOS/
  ConversationDataset/
    01_GREETING.md through 20_CONVERSATION_PATTERNS.md
    (20 conversation scenario documents)

  CapabilityPackages/
    ACP-01_GREETING/         (entry point routing)
    ACP-10_NEED_DISCOVERY/   (discovering customer goals)
    ACP-20_EDGE_CASE_HANDLER/ (out-of-scope and edge cases)

runtime-gen1/
  capability/
    intentDetector.ts        (SSI-02: intent classification)
    capabilityLoader.ts      (capability selection and ACP routing)
    capabilityRegistry.ts    (ACP-to-CAP mapping)

  conversation/
    strategyEngine.ts        (10 conversation strategies)
    strategyRegistry.ts      (strategy definitions)
    strategyTypes.ts         (type definitions)
```

### Future Owns (when implemented)

```
runtime-gen1/
  capability/
    emotionDetector.ts       (P1-01 — not yet exists)
    goalDetector.ts          (P1-02 — not yet exists)
```

### Consumes

```
AIOS/
  Execution/
    02_EXECUTION_PIPELINE.md   (AEE steps 1-5 specification)
    05_DECISION_PIPELINE.md    (decision taxonomy for strategy selection)

  ContextEngine/
    03_CONTEXT_ASSEMBLY_PIPELINE.md

  Learning/
    04_PATTERN_LIBRARY.md      (approved conversation patterns)

runtime-gen1/
  memory/memoryResolver.ts   (reads trust, medical, lead state for strategy selection)
  decision/decisionEngine.ts (receives strategy recommendation)
```

### Does Not Own

- Memory state (owned by Customer Intelligence)
- Product knowledge (owned by Product Intelligence)
- Decision rules (owned by Capability Packages)
- Lead scoring logic (owned by Commercial Intelligence)

---

## Intelligence 2 — Customer Intelligence

### Owns

```
AIOS/
  ContextEngine/
    07_MEMORY_RESOLUTION.md    (memory layer definitions and priority)

  Execution/
    07_MEMORY_ENGINE.md        (5-layer memory architecture)

  Domains/Insurance/
    Trust/                     (Trust_Engine.md, Fraud_Handling.md, License_Verification.md,
                                Professional_Credibility.md)

runtime-gen1/
  memory/
    memoryResolver.ts          (SSI-01: conversation memory; SSI-06: trust logic)
    memoryTypes.ts             (RuntimeMemoryResolution, memory type definitions)

  observability/
    conversationLogger.ts      (turn logging + KV persistence + history loader)
    kvClient.ts                (KV abstraction layer)
```

### Partial Owns (requires migration to complete)

```
V1 session (lib/session.ts → target: CustomerSession type in Gen1)

AIOS/Execution/07_MEMORY_ENGINE.md Layers 3-5:
  - Customer Profile (Layer 3) — partial (profile rebuilt from history, no persistent profile)
  - Long-term Memory (Layer 4) — NOT YET IMPLEMENTED (P1-05)
  - CRM Memory (Layer 5) — NOT YET IMPLEMENTED in Gen1 (lib/sheet.ts is V1 CRM)
```

### Consumes

```
AIOS/
  CapabilityPackages/
    ACP-08_TRUST_ADVISOR/      (trust behavior specification)
    ACP-11_LEAD_CAPTURE/       (lead capture rules)

  Domains/Insurance/
    Lead/                      (Lead_Capture.md, Lead_Scoring.md, Lead_Status.md)

runtime-gen1/
  capability/intentDetector.ts (intent flags that drive memory state changes)
```

### Does Not Own

- Intent classification (owned by Conversation Intelligence)
- Lead scoring algorithm definition (owned by Commercial Intelligence)
- Product knowledge content (owned by Product Intelligence)
- Handoff context format (owned by Advisor Intelligence)

---

## Intelligence 3 — Commercial Intelligence

### Owns

```
AIOS/
  CapabilityPackages/
    ACP-09_RECOMMENDATION_ENGINE/
    ACP-11_LEAD_CAPTURE/         (lead capture ACP; data stored by Customer Intelligence)
    ACP-13_PRICE_OBJECTION/
    ACP-14_EXISTING_POLICY/
    ACP-19_CLOSING/

  Domains/Insurance/
    Sales/                       (Consultative_Selling.md, Need_Discovery.md,
                                  Closing_Framework.md, Buying_Signal.md)
    Recommendation/              (Recommendation_Framework.md, Product_Selection_Rules.md,
                                  Budget_Optimization.md)
    Lead/                        (Lead_Capture.md — process; Lead_Scoring.md — algorithm definition)
```

### Partial Owns (score computed in runtime, definition in domain)

```
runtime-gen1/
  memory/memoryResolver.ts       (computes knownFields used for scoring)
  decision/decisionRules.ts      (contains commercial decision logic — P1-07 migration target)
```

### Consumes

```
AIOS/
  Domains/Insurance/
    Lead/Lead_Status.md         (status taxonomy for lifecycle transitions)

runtime-gen1/
  memory/memoryResolver.ts      (reads CustomerProfile, trust state)
  knowledge/knowledgeResolver.ts (reads product knowledge for recommendations)
```

### Does Not Own

- Customer profile fields (owned by Customer Intelligence)
- Product knowledge content (owned by Product Intelligence)
- Trust logic gate (owned by Customer Intelligence — trust OVERRIDES commercial actions)
- Handoff context (owned by Advisor Intelligence)

---

## Intelligence 4 — Product Intelligence

### Owns

```
AIOS/
  Domains/Insurance/
    Products/                    (Health_Insurance.md, Cancer_Insurance.md, Life_Insurance.md,
                                  Investment_Linked.md, Retirement.md, Tax_Planning.md)
    Knowledge/                   (Medical.md, Underwriting.md, Tax.md, Claim.md, Hospital.md, FAQ.md)

  AIRR/
    Knowledge_Path_Registry.md   (canonical paths for all domain knowledge)

  KnowledgeBase/
    30_KB_Glossary.md            (P0-06 — not yet exists)

  CapabilityPackages/
    ACP-02_HEALTH_ADVISOR/
    ACP-03_CANCER_ADVISOR/
    ACP-04_MEDICAL_ADVISOR/
    ACP-05_TAX_ADVISOR/
    ACP-06_RETIREMENT_ADVISOR/
    ACP-07_INVESTMENT_ADVISOR/
    ACP-12_PRODUCT_COMPARISON/

runtime-gen1/
  knowledge/
    knowledgeResolver.ts         (knowledge selection and loading)
    knowledgeRegistry.ts         (intent-to-knowledge-path mapping)
    knowledgeLoader.ts           (file loading with fallback)
    knowledgeTypes.ts            (KnowledgeSnippet, KnowledgeTrace types)
```

### Synthetic (computed, not file-based)

```
runtime-gen1/knowledge/knowledgeResolver.ts:
  MEDICAL_UNCERTAINTY_FRAGMENT   (mandatory for all medical/underwriting responses)
  INVESTMENT_RISK_FRAGMENT       (mandatory for all ILP/investment responses)
```

### Consumes

```
runtime-gen1/
  capability/intentDetector.ts  (intent determines which knowledge to load)
  memory/memoryResolver.ts      (customer age, health, budget guides product selection)
```

### Does Not Own

- Customer profile (owned by Customer Intelligence)
- Product recommendation logic (owned by Commercial Intelligence — which product fits)
- Lead capture (owned by Commercial Intelligence)

---

## Intelligence 5 — Learning Intelligence

### Owns — Governance Documents

```
AIOS/
  Learning/
    01_LEARNING_PHILOSOPHY.md
    02_CONVERSATION_AUDIT.md
    03_IMPROVEMENT_DATABASE.md
    04_PATTERN_LIBRARY.md
    05_ROOT_CAUSE_ANALYSIS.md
    06_CHANGE_PROPOSAL.md
    07_ACCEPTANCE_PROCESS.md
    08_LEARNING_METRICS.md
    09_RELEASE_NOTES.md
    10_CONTINUOUS_IMPROVEMENT.md

  Learning/PatternLibrary/       (P0-03 — to be created)
```

### Owns — Runtime (observability layer)

```
runtime-gen1/
  observability/
    auditQueue.ts                (async post-turn audit records — KV persisted)
    issueDatabase.ts             (quality issue registry — KV persistence P0-01)
    conversationLogger.ts        (consumed as read source for pattern matching)
```

### Does Not Own (but reads)

```
runtime-gen1/
  observability/conversationLogger.ts   (owned by Customer Intelligence; LI reads for audit)

AIOS/
  CapabilityPackages/*/Decision_Rules.md  (LI may propose changes; ACPs own the content)
  Domains/Insurance/                      (LI may propose knowledge changes; Domain owns content)
```

### Consumes

```
All analytics events from Business Intelligence
All conversation logs from Customer Intelligence
Human approval (Human Product Owner) for all Change Proposals
```

### Does Not Own

- Conversation flow or strategy (owned by Conversation Intelligence)
- Product knowledge (owned by Product Intelligence)
- Decision rules content (owned by Capability Packages, governed by Human Product Owner)

---

## Intelligence 6 — Business Intelligence

### Owns

```
AIOS/
  Execution/
    08_ANALYTICS_ENGINE.md      (event taxonomy — EVT-P, EVT-L, EVT-T)

runtime-gen1/
  analytics/
    runtimeMetrics.ts           (runtime performance metrics)
  observability/
    eventEmitter.ts             (P0-05 — not yet exists; BI owns this when created)
```

### Partial Owns (to be migrated from Application layer)

```
Applications/Line_Chatbot_AI/
  Analytics/
    KPI.md                      (KPI definitions — to be owned by BI; app layer measures, BI defines)
    Lost_Opportunity.md         (to be integrated into BI)
    Score.md, Journey.md, Audit.md
```

### Consumes

```
All analytics events from all intelligence domains (when event emitter P0-05 is implemented)
Learning Intelligence quality metrics
Runtime metrics from observability layer
```

### Does Not Own

- Individual conversation logging (owned by Customer Intelligence)
- Audit queue (owned by Learning Intelligence)
- Dashboard UI (owned by Application layer)

---

## Intelligence 7 — Advisor Intelligence

### Owns

```
AIOS/
  CapabilityPackages/
    ACP-17_HUMAN_HANDOFF/       (handoff capability specification)
    ACP-15_CLAIM_SUPPORT/       (post-sale support — claim questions)
    ACP-16_HOSPITAL_GUIDANCE/   (post-sale support — hospital queries)
    ACP-18_FOLLOW_UP/           (returning customer re-engagement)

  Domains/Insurance/
    Human/                      (Advisor_Brief.md, Handoff.md, Escalation.md)
```

### Partial Owns (runtime — via conversation strategy and decision rules)

```
runtime-gen1/
  conversation/strategyRegistry.ts   (HANDOFF_WITH_CONTEXT strategy definition)
  decision/decisionRules.ts          (ACT-11 HANDOFF_TO_HUMAN rule)
```

### Does Not Own

- Customer profile (owned by Customer Intelligence — Advisor Intelligence reads it)
- Lead scoring (owned by Commercial Intelligence — Advisor Intelligence receives score)
- Product knowledge (owned by Product Intelligence — Advisor Intelligence uses summary)

---

## Boundary Violation Detection

The following are architecture boundary violations. They should be flagged as issues when found:

| Violation | Description | Correct Action |
|---|---|---|
| Product knowledge in prompt template | Product facts embedded in promptBuilder | Move to knowledge document in Product Intelligence |
| Lead scoring in lib/scorer.ts | V1 duplicate of lead scoring | Deprecate (SSI-04) |
| Trust logic in lib/trustEngine.ts | V1 duplicate of trust logic | Deprecate (SSI-06) |
| Intent classifier in lib/intentClassifier.ts | V1 duplicate of intent detection | Deprecate (SSI-02) |
| Business rules hardcoded in decisionRules.ts | Commercial logic in runtime | Migrate to ACP Decision_Rules (P1-07) |
| Application module defining KPIs | KPI definition in Applications/ | Move KPI definitions to Business Intelligence |
| session: unknown in RuntimeInput | V1 session dependency in Gen1 | Implement CustomerSession type (P1-03) |
| Issues lost on deploy | issueDatabase in-memory | Persist to KV (P0-01) |

---

## Cross-Reference Index

For every major AIOS document, the table below shows which intelligence domain owns it or consumes it.

| Document | Owned By | Consumed By |
|---|---|---|
| `ConversationDataset/20_CONVERSATION_PATTERNS.md` | Conversation Intelligence | Conversation Intelligence (strategy) |
| `ContextEngine/07_MEMORY_RESOLUTION.md` | Customer Intelligence | All intelligences (read customer state) |
| `Execution/07_MEMORY_ENGINE.md` | Customer Intelligence | Customer Intelligence (implements) |
| `Execution/08_ANALYTICS_ENGINE.md` | Business Intelligence | All intelligences (emit events) |
| `CapabilityPackages/ACP-08_TRUST_ADVISOR/` | Customer Intelligence | Conversation Intelligence (strategy), Decision Engine |
| `CapabilityPackages/ACP-09_RECOMMENDATION_ENGINE/` | Commercial Intelligence | Product Intelligence (knowledge), Decision Engine |
| `CapabilityPackages/ACP-17_HUMAN_HANDOFF/` | Advisor Intelligence | Decision Engine, Admin notification |
| `Domains/Insurance/Trust/` | Customer Intelligence | Conversation Intelligence, Commercial Intelligence |
| `Domains/Insurance/Lead/` | Commercial Intelligence | Customer Intelligence (stores fields) |
| `Domains/Insurance/Products/` | Product Intelligence | Commercial Intelligence (recommendations) |
| `Domains/Insurance/Sales/` | Commercial Intelligence | Product Intelligence (context) |
| `Domains/Insurance/Human/` | Advisor Intelligence | Commercial Intelligence (handoff timing) |
| `Learning/` (all 10 docs) | Learning Intelligence | Human Product Owner (approvals), all intelligences |
| `AIRR/Knowledge_Path_Registry.md` | Product Intelligence | Knowledge Loader (runtime) |
| `Architecture-Office/AI_OPERATING_MODEL.md` | Foundation / Chief AI Architect | All intelligences (role authority) |
