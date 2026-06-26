# AIOS Registry — LINE Chatbot Application
### Component Registry — AI Operating System (AIOS)
**Version:** 1.0  
**Effective Date:** 2026-06-26  
**Last Reviewed:** 2026-06-26  
**Status:** Active  
**Authority:** Chief Enterprise Solution Architect  
**Layer:** Foundation — Discovery and Governance (Layer 11)  
**Governed By:** `11_AI_Registry_Standard.md`  

---

> This is the first Registry document in the AIOS system. It catalogs the LINE Chatbot as the first registered AIOS application and inventories all components currently active within it. Components marked `pre-AIOS` are operating but not yet formally AIOS-compliant. Components marked `Active` have passed their AIOS governance review.

---

## Section 1 — Application Registry Entry

| Field | Value |
|---|---|
| **Application Name** | LINE Chatbot — Financial Advisor AI |
| **Application ID** | `app:line-chatbot-financial-advisor` |
| **Version** | 1.9 (current production) |
| **Status** | Active — AIOS Migration in progress (Milestone M1 complete) |
| **Channel** | LINE Messaging API |
| **Runtime Platform** | Vercel (Next.js 14, Node.js 20) |
| **Primary AI Model** | OpenAI GPT-4o |
| **Session Storage** | Vercel KV (Redis) — 30-day TTL |
| **CRM** | Google Sheets |
| **First Deployed** | 2025 (pre-AIOS) |
| **AIOS Registration Date** | 2026-06-26 |
| **AIOS Architect** | Chief Enterprise Solution Architect |
| **Human Owner** | Jirawat Jirapathkraikul |
| **Migration Status** | M1 complete; M2 planned |
| **Migration Plan** | See `AIOS_Modernization_Assessment.md` Part 7 |

---

## Section 2 — Persona Registry

| Persona ID | Document | Status | Version | Domain | AIOS-Compliant |
|---|---|---|---|---|---|
| `persona:financial-advisor` | `Personas/10_Persona_FinancialAdvisor.md` | Draft — Pending Human Approval | 1.0 | Financial/Advisory | Pending — human approval required |
| *(Tax Advisor)* | Planned | Planned | — | Financial/Tax | Not yet created |
| *(Investment Advisor)* | Planned | Planned | — | Financial/Investment | Not yet created |
| *(CMO)* | Planned | Planned | — | Marketing/Content | Not yet created |

**Note:** Until `10_Persona_FinancialAdvisor.md` receives human approval, the production Persona is the behavior defined in `lib/prompt.ts` `buildSystemPrompt()`. These two are aligned in content; only governance status differs.

---

## Section 3 — Knowledge Registry

### Active Knowledge Documents

| Knowledge ID | Document | Status | Category | Review Cycle | Last Reviewed | AIOS-Compliant |
|---|---|---|---|---|---|---|
| `kb:bu-handoff-policy` | `KnowledgeBase/Business/30_KB_BU_HandoffPolicy.md` | Active | Business | Quarterly | 2026-06-26 | Yes |
| `kb:bu-intent-triggers` | `KnowledgeBase/Business/30_KB_BU_IntentTriggers.md` | Active | Business | Quarterly | 2026-06-26 | Yes |
| `kb:bu-confidence-policy` | `KnowledgeBase/Business/30_KB_BU_ConfidencePolicy.md` | Active | Business | Annual | 2026-06-26 | Yes |

### Knowledge Gaps (Planned)

| Knowledge ID | Document | Priority | Milestone |
|---|---|---|---|
| `kb:bu-underwriting-policy` | `30_KB_BU_UnderwritingPolicy.md` | High | M1 |
| `kb:pr-product-catalogue` | `30_KB_PR_ProductCatalogue.md` | High | M5 |
| `kb:pr-tokyo-supertax` | `30_KB_PR_TokyoSuperTax.md` | High | M5 |
| `kb:pr-good-health-prime` | `30_KB_PR_GoodHealthPrime.md` | High | M5 |
| `kb:pr-tokyo-beyond` | `30_KB_PR_TokyoBeyond.md` | Medium | M5 |
| `kb:pr-tokio-cancer-care` | `30_KB_PR_TokioCancerCare.md` | Medium | M5 |
| `kb:cu-salaryman-premium` | `30_KB_CU_SalarymanPremium.md` | Medium | M6 |
| `kb:cu-young-professional` | `30_KB_CU_YoungProfessional.md` | Medium | M6 |
| `kb:cu-working-mom` | `30_KB_CU_WorkingMom.md` | Medium | M6 |
| `kb:cu-sme-owner` | `30_KB_CU_SMEOwner.md` | Medium | M6 |
| `kb:re-oic-regulations` | `30_KB_RE_OICRegulations.md` | Low | M7+ |
| `kb:re-thai-income-tax` | `30_KB_RE_ThaiIncomeTax2026.md` | Low | M7+ |
| `kb:rf-glossary` | `30_KB_RF_Glossary.md` | Medium | M5 |

### Pre-AIOS Knowledge Sources (Not Yet Migrated)

| Source | Content | Current Location | Migration Target | Milestone |
|---|---|---|---|---|
| Google Sheets FAQ | Product Q&A (category, question, answer, keyword) | Runtime — fetched by `lib/sheet.ts` | AIOS Knowledge documents per product | M5 |
| `lib/prompt.ts` XML | Persona rules and constraints | Hard-coded string | `10_Persona_FinancialAdvisor.md` (partial) + KB docs | M6 |
| `lib/leadCapture.ts` arrays | Intent triggers | TypeScript constants | `30_KB_BU_IntentTriggers.md` ✓ | M1 ✓ |

---

## Section 4 — Skill Registry

### Pre-AIOS Skills (Active in Production — Not Yet AIOS-Governed)

| Skill ID | Implementation | Function | AIOS Document Target | Status | Milestone |
|---|---|---|---|---|---|
| `skill:lead-score` | `lib/scorer.ts` | Calculate lead quality score (0–100) | `40_Skill_Calculation_LeadScore.md` | pre-AIOS | M4 |
| `skill:crm-upsert` | `lib/lead.ts` + `lib/leadService.ts` | Write lead data to Google Sheets CRM | `40_Skill_Automation_CRMLeadUpsert.md` | pre-AIOS | M4 |
| `skill:admin-notify` | `lib/adminNotify.ts` | Send LINE push notification to Jirawat | `40_Skill_Communication_AdminNotify.md` | pre-AIOS | M4 |
| `skill:flex-message` | `lib/richMessages.ts` | Render LINE Flex Message profile card | `40_Skill_Creation_FlexMessage.md` | pre-AIOS | M4 |
| `skill:handoff-summary` | Inline in `route.ts` (`buildHandoffSummary`) | Build handoff summary for admin | `40_Skill_Communication_HandoffSummary.md` | pre-AIOS | M4 |

### Planned AIOS Skills (Not Yet Created)

| Skill ID | Document | Function | Milestone |
|---|---|---|---|
| `skill:lead-qualification` | `40_Skill_Analysis_LeadQualification.md` | Assess lead readiness for handoff | M4 |
| `skill:principles-compliance` | `40_Skill_Validation_PrinciplesCompliance.md` | Verify output against all 15 Principles | M7 |

---

## Section 5 — Workflow Registry

### Pre-AIOS Workflows (Active in Production — Not Yet AIOS-Governed)

| Workflow ID | Implementation | Function | AIOS Document Target | Status | Milestone |
|---|---|---|---|---|---|
| `workflow:lead-capture` | State machine in `lib/leadCapture.ts` + `route.ts` Priority E/F/G | Progressive collection of 6 lead fields | `20_Workflow_Ops_LeadCapture.md` | pre-AIOS | M7 |
| `workflow:contact-handoff` | `route.ts` Priority D | 3-field contact collection (name, phone, time) | `20_Workflow_CS_ContactHandoff.md` | pre-AIOS | M7 |
| `workflow:product-selection` | `route.ts` Priority E + category flow | Category → product → quote flow | `20_Workflow_FP_ProductSelection.md` | pre-AIOS | M7 |
| `workflow:underwriting-referral` | `route.ts` Priority C | Medical flag → admin notify → escalate | `20_Workflow_CS_UnderwritingReferral.md` | pre-AIOS | M7 |

### Planned AIOS Workflows (Not Yet Created)

| Workflow ID | Document | Function | Milestone |
|---|---|---|---|
| `workflow:compliance-check` | `20_Workflow_Compliance_RecommendationCheck.md` | Pre-delivery Principles compliance gate | M7 |

---

## Section 6 — Orchestrator Registry

| Component | Implementation | Status | AIOS-Compliant |
|---|---|---|---|
| **Orchestrator** | Intent Priority Router A–H, embedded in `app/api/line-webhook/route.ts` | pre-AIOS (embedded) | No — planned extraction to `lib/orchestrator.ts` in M2 |
| **Intent Classifier** | Inline in `route.ts` — trigger array matching | pre-AIOS | No — vocabulary now governed by `30_KB_BU_IntentTriggers.md` |

---

## Section 7 — Runtime Registry

| Component | Implementation | Status | Notes |
|---|---|---|---|
| **Chatbot Interface** | `app/api/line-webhook/route.ts` | Active | Thin adapter target: M2 |
| **Session Layer** | `lib/session.ts` + Vercel KV | Active | AIOS-compatible; no change planned |
| **AI Model Wrapper** | `lib/openai.ts` (GPT-4o + GPT-4o-mini) | Active | AIOS-compatible; Runtime Layer 5 |
| **Admin Commands** | `lib/admin.ts` | Active | Operational tooling; keep |
| **Diagnostics** | `app/api/openai-diag/route.ts` | Active | Operational tooling; keep |

---

## Section 8 — Foundation Layer Status

| Document | Status | Version | AIOS Position |
|---|---|---|---|
| `01_AI_Vision.md` | Active | 2.0 | Layer 1 — Supreme authority |
| `01_AI_Principles.md` | Active | 1.0 | Layer 2 — 15 governing principles |
| `04_AI_Constitution.md` | Active | 1.0 | Layer 3 — Architecture governance |
| `02_AI_Decision_Framework.md` | Active | 1.0 | Layer 4 — 12-stage decision process |
| `03_AI_Context_Framework.md` | Active | 1.0 | Layer 4 — Context assembly standard |
| `Claude.md` | Active | 1.0 | Layer 5 — Runtime configuration |
| `05_AI_Persona_Template.md` | Active | 1.0 | Standard for Persona documents |
| `06_AI_Knowledge_Standard.md` | Active | 1.0 | Standard for Knowledge documents |
| `07_AI_Skill_Standard.md` | Active | 1.0 | Standard for Skill documents |
| `08_AI_Workflow_Standard.md` | Active | 1.0 | Standard for Workflow documents |
| `09_AI_Architecture_Audit.md` | Active | 1.0 | Governance audit standard |
| `10_AI_Orchestrator_Spec.md` | Active | 1.0 | Orchestrator specification |
| `11_AI_Registry_Standard.md` | Active | 1.0 | Registry standard (this document's authority) |

---

## Section 9 — Migration Progress Tracker

| Milestone | Objective | Status | Completion |
|---|---|---|---|
| M1 | Foundation documentation | **In Progress** | 4/5 deliverables complete (Underwriting Policy pending) |
| M2 | Orchestrator extraction | Planned | Not started |
| M3 | Registry population | Planned | Not started |
| M4 | Skill formalization | Planned | Not started |
| M5 | Knowledge migration | Planned | Not started |
| M6 | Persona activation | Planned | Pending M5 + human approval |
| M7 | Workflow activation | Planned | Not started |
| M8 | Legacy removal + Audit 2 | Planned | Not started |

---

## Section 10 — Governance Notes

### Open Governance Items

| Item | Description | Required Action | Owner |
|---|---|---|---|
| GN01 | `10_Persona_FinancialAdvisor.md` requires human approval before Status can be set to Active | Human review and sign-off | Jirawat Jirapathkraikul |
| GN02 | `30_KB_BU_UnderwritingPolicy.md` not yet created — medical query handling has no formal KB document | Create in M1 completion | Knowledge Manager |
| GN03 | No Architecture Audit (AHS score) has been conducted | Conduct Baseline Audit using `09_AI_Architecture_Audit.md` | Governance Auditor |
| GN04 | Named governance role owners not yet assigned | Assign Knowledge Manager, Persona Architect, Process Architect, Governance Auditor | Jirawat Jirapathkraikul |
| GN05 | Google Sheets FAQ has no freshness tracking — Last Reviewed date unknown | Add review date and cycle to Sheets; migrate to KB in M5 | Knowledge Manager |

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief Enterprise Solution Architect | Initial Registry — first AIOS registration of the LINE Chatbot application. Catalogs all components across Personas, Knowledge, Skills, Workflows, Orchestrator, and Runtime. Migration progress tracker included. |

---

*This Registry document is governed by `11_AI_Registry_Standard.md`. It is the authoritative index of all AIOS components within the LINE Chatbot application. Every new component added to the system must be registered here before activation. Every deprecated component must have its status updated here before archiving.*
