# AIOS Capability Packages

**Layer**: ACP — AI Capability Package Layer  
**Position**: Layer 2.5 between Conversation Intelligence and Execution Engine  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## What Is This Layer?

The AI Capability Package (ACP) Layer is the **executable capability specification** consumed by the AI Execution Engine (AEE).

It is NOT a Knowledge Base. It does NOT store facts about insurance products.  
It is NOT a Prompt. It does NOT contain LLM instructions.  
It is NOT a Conversation Dataset. It does NOT describe how conversations unfold.  

**ACP is the unit that the Execution Engine loads dynamically to instantiate a capability at runtime.**

Each ACP defines:
- WHAT the AI is allowed to do in this context
- HOW it makes decisions
- WHAT it knows (by reference)
- WHAT it must never do
- HOW it hands off to other capabilities

---

## Architecture Position

```
AIOS Architecture Stack
═══════════════════════════════════════════════════════
Layer 4  Applications          LINE Chatbot, Web, etc.
───────────────────────────────────────────────────────
Layer 3  AI Execution Engine   Intent → Capability → Response
───────────────────────────────────────────────────────
Layer 2.5  ACP Layer  ◄── THIS FOLDER
           Capability Packages loaded dynamically
───────────────────────────────────────────────────────
Layer 2  Domain Knowledge      Insurance, Medical, Tax
───────────────────────────────────────────────────────
Layer 1  Foundation            Principles, Vision, Core
═══════════════════════════════════════════════════════
```

---

## Folder Structure

```
AIOS/CapabilityPackages/
│
├── README.md                        ← This file
├── 00_CAPABILITY_STANDARD.md        ← Canonical specification for all ACPs
│
├── 01_GREETING/
├── 02_HEALTH_ADVISOR/
├── 03_CANCER_ADVISOR/
├── 04_MEDICAL_ADVISOR/
├── 05_TAX_ADVISOR/
├── 06_RETIREMENT_ADVISOR/
├── 07_INVESTMENT_ADVISOR/
├── 08_TRUST_ADVISOR/
├── 09_RECOMMENDATION_ENGINE/
├── 10_NEED_DISCOVERY/
├── 11_LEAD_CAPTURE/
├── 12_PRODUCT_COMPARISON/
├── 13_PRICE_OBJECTION/
├── 14_EXISTING_POLICY/
├── 15_CLAIM_SUPPORT/
├── 16_HOSPITAL_GUIDANCE/
├── 17_HUMAN_HANDOFF/
├── 18_FOLLOW_UP/
├── 19_CLOSING/
└── 20_EDGE_CASE_HANDLER/
```

---

## Capability Inventory

| ID | Package | Primary Intent | Priority |
|---|---|---|---|
| ACP-01 | GREETING | First contact, welcome | Standard |
| ACP-02 | HEALTH_ADVISOR | Health insurance inquiry | Standard |
| ACP-03 | CANCER_ADVISOR | Cancer insurance inquiry | Standard |
| ACP-04 | MEDICAL_ADVISOR | Medical underwriting | Standard |
| ACP-05 | TAX_ADVISOR | Tax planning | Standard |
| ACP-06 | RETIREMENT_ADVISOR | Retirement planning | Standard |
| ACP-07 | INVESTMENT_ADVISOR | Investment-linked insurance | Standard |
| ACP-08 | TRUST_ADVISOR | Trust / fraud concern | **CRITICAL** |
| ACP-09 | RECOMMENDATION_ENGINE | Product recommendation | Standard |
| ACP-10 | NEED_DISCOVERY | Unstructured need exploration | Standard |
| ACP-11 | LEAD_CAPTURE | Personal data collection | Standard |
| ACP-12 | PRODUCT_COMPARISON | Product comparison | Standard |
| ACP-13 | PRICE_OBJECTION | Budget constraint handling | Standard |
| ACP-14 | EXISTING_POLICY | Coverage review | Standard |
| ACP-15 | CLAIM_SUPPORT | Claim guidance | HIGH |
| ACP-16 | HOSPITAL_GUIDANCE | Hospital navigation | HIGH |
| ACP-17 | HUMAN_HANDOFF | Jirawat handoff | Standard |
| ACP-18 | FOLLOW_UP | Re-engagement | Standard |
| ACP-19 | CLOSING | Commitment and close | Standard |
| ACP-20 | EDGE_CASE_HANDLER | Unusual and sensitive scenarios | Standard |

---

## Capability Priority Hierarchy

```
Priority Level 1 — CRITICAL (Override all states)
  ACP-08  TRUST_ADVISOR

Priority Level 2 — HIGH (Override lead capture states)
  ACP-16  HOSPITAL_GUIDANCE
  ACP-15  CLAIM_SUPPORT

Priority Level 3 — ELEVATED (Override conversation state)
  ACP-20  EDGE_CASE_HANDLER

Priority Level 4 — STANDARD (Normal execution)
  All others
```

---

## Each Package Contains

| File | Purpose |
|---|---|
| `README.md` | Package overview and quick reference |
| `Capability.md` | Core capability definition — ID, purpose, goals, intents |
| `Knowledge_Map.md` | Knowledge references (no duplication) |
| `Conversation_Map.md` | Entry, exit, interrupt, composition rules |
| `Decision_Rules.md` | When and how to act |
| `Memory_Requirements.md` | What to store and recall |
| `Response_Profile.md` | Tone, length, strategy |
| `Restrictions.md` | What AI must NEVER do in this capability |
| `Examples.md` | Good and bad conversation examples |
| `Regression.md` | Test cases for this capability |
| `Future_Extensions.md` | Planned improvements |

---

## Composition Examples

Capabilities can be composed (run together). Key compositions:

```
Medical Inquiry:
  ACP-04 (Medical) → ACP-11 (Lead) → ACP-17 (Handoff)

Trust Recovery:
  ACP-08 (Trust) → [2 turns] → ACP-10 (Need Discovery) → ACP-09 (Recommendation)

Claim Escalation:
  ACP-15 (Claim) → ACP-17 (Handoff)

Full Sales Flow:
  ACP-01 (Greeting) → ACP-10 (Need Discovery) → ACP-09 (Recommendation) 
  → ACP-13 (Price) → ACP-19 (Closing) → ACP-11 (Lead) → ACP-17 (Handoff)
```

---

## Architecture Boundaries

This layer MUST NOT:
- Contain insurance product facts (belongs in Domain Knowledge)
- Contain LLM prompt text (belongs in Execution Engine)
- Duplicate conversation examples (belongs in ConversationDataset)
- Duplicate learning patterns (belongs in Learning Layer)
- Contain runtime code

This layer MUST:
- Reference Domain Knowledge by path
- Reference ConversationDataset documents by ID
- Reference Learning patterns by ID
- Define the interface between Execution Engine and knowledge sources
- Define capability composition and priority rules

---

## Canonical Standard

Before creating or modifying any capability package, read:
`AIOS/CapabilityPackages/00_CAPABILITY_STANDARD.md`

All packages must conform to this standard. Any violation is an architecture defect.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release — 20 capability packages |
