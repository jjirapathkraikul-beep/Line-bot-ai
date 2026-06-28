# 04 — Shared State Machine

**Document ID**: AIOS-INT-04  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Chief AI Architect

---

## Purpose

This document defines the customer lifecycle states and advisor journey states used across all 7 AIOS intelligence domains.

These states are **domain-independent** — they apply to Insurance, Tax, Investment, Healthcare, and any future advisory vertical. Domain-specific state variations are defined in the relevant `AIOS/Domains/` documents.

---

## 1. Customer Lifecycle States

### State Map

```
         ENTRY POINT
              │
              ▼
         ┌─────────┐
         │ UNKNOWN  │ ─── no prior interaction; first contact
         └─────────┘
              │ First message received
              ▼
         ┌─────────┐
         │  AWARE   │ ─── knows AIOS exists; has not engaged meaningfully
         └─────────┘
              │ Expresses curiosity, asks a question
              ▼
         ┌──────────────┐
         │  INTERESTED  │ ─── asking questions; no need captured yet
         └──────────────┘
              │ Specific need or concern emerges
              ▼
         ┌────────────────┐
         │  CONSIDERING   │ ─── exploring options; comparing; price questions
         └────────────────┘
              │ Profile sufficient for recommendation; budget/age/goal known
              ▼
         ┌─────────────┐
         │  QUALIFIED   │ ─── lead score sufficient; recommendation made
         └─────────────┘
              │ Positive response to recommendation; high buying signal
              ▼
         ┌──────────┐
         │  READY   │ ─── buying intent confirmed; callback requested
         └──────────┘
              │ Handoff triggered (human advisor required)
              ▼
         ┌──────────────────┐
         │ HANDOFF_PENDING  │ ─── awaiting human advisor pickup
         └──────────────────┘
              │ Human advisor contacts customer
              ▼
         ┌────────────────────┐
         │ HANDOFF_COMPLETED  │ ─── conversation handed to human
         └────────────────────┘
              │ Product purchased / enrolled
              ▼
         ┌──────────────┐
         │   CUSTOMER   │ ─── existing customer (post-purchase)
         └──────────────┘
              │ Refers others / gives testimonial
              ▼
         ┌──────────────┐
         │   ADVOCATE   │ ─── promotes the advisor/product to others
         └──────────────┘
```

---

### State Definitions

---

#### UNKNOWN

**Definition**: No interaction history. Customer has not yet initiated a meaningful conversation.

**Entry signals**:
- First webhook received from a new userId
- Customer is not found in KV or CRM

**Exit signals**:
- Customer sends any message → transition to AWARE

**Allowed objectives**:
- Warm greeting
- Route to correct capability
- Begin need discovery

**Forbidden actions**:
- Lead capture (no trust established)
- Product recommendation (no context)
- Handoff (no information to hand off)

---

#### AWARE

**Definition**: Customer has sent at least one message. AIOS has context but no meaningful need or profile yet.

**Entry signals**:
- First message received (from UNKNOWN)
- Returning customer with no recent activity (reset from CUSTOMER/ADVOCATE)

**Exit signals**:
- Customer asks a specific question → INTERESTED
- Customer states a product type → INTERESTED

**Allowed objectives**:
- Greet and orient
- Route intent
- Answer general questions

**Forbidden actions**:
- Lead capture (too early)
- Hard product push

---

#### INTERESTED

**Definition**: Customer has expressed a specific interest or concern. They are asking questions but have not yet disclosed enough context for a meaningful recommendation.

**Entry signals**:
- Product intent detected (isProductIntent = true)
- Medical question detected (isMedicalSignal = true)
- Trust concern detected (isTrustSignal = true)

**Exit signals**:
- Budget, age, or goal captured → CONSIDERING
- Customer expresses frustration or stops → may revert or drop off

**Allowed objectives**:
- Educate
- Answer specific questions
- Begin gentle need discovery (ACT-02 ANSWER_THEN_ASK)

**Forbidden actions**:
- Lead capture before trust is established (if trust signal active)
- Direct product recommendation (insufficient context)

---

#### CONSIDERING

**Definition**: Customer is evaluating options. Core profile fields (age, goal, rough budget) are known. They may be comparing products or asking about price.

**Entry signals**:
- At least 2 core profile fields captured (age + one other)
- Price or comparison question asked

**Exit signals**:
- isRecommendationIntent = true AND sufficient profile → QUALIFIED
- Customer decides to disengage → drop-off

**Allowed objectives**:
- Product education
- Comparison (ACP-12)
- Price objection handling (ACP-13)
- Progressive lead capture (name, phone — if trust safe)

**Forbidden actions**:
- Closing (too early)
- Handoff without lead qualification

---

#### QUALIFIED

**Definition**: Customer profile is sufficient for a specific recommendation. Lead score meets threshold. At least one recommendation has been delivered.

**Entry signals**:
- Lead score ≥ threshold (defined in `Lead_Scoring.md`)
- Recommendation delivered (ACT-05 RECOMMEND)

**Exit signals**:
- Positive buying signal (ACT-09 CLOSE) → READY
- Customer requests callback or human contact → HANDOFF_PENDING

**Allowed objectives**:
- Deliver recommendation
- Handle objections
- Progress toward closing or handoff

**Forbidden actions**:
- Restarting need discovery (known fields must not be re-asked — CP-05)

---

#### READY

**Definition**: Customer has confirmed buying intent. They are prepared to take next action (purchase, appointment, callback).

**Entry signals**:
- Buying signal detected (Buying_Signal.md criteria met)
- Customer explicitly requests to proceed

**Exit signals**:
- Handoff triggered → HANDOFF_PENDING
- Self-service path taken (rare in advisory context)

**Allowed objectives**:
- Confirm decision
- Initiate handoff
- Collect any remaining required lead fields

**Forbidden actions**:
- Restart education (disrespects confirmed decision)
- Delay handoff without reason

---

#### HANDOFF_PENDING

**Definition**: Handoff has been triggered; human advisor has not yet made contact. AIOS may still be active in this window.

**Entry signals**:
- ACT-11 HANDOFF_TO_HUMAN executed
- ACP-17 HUMAN_HANDOFF activated

**Exit signals**:
- Human advisor picks up → HANDOFF_COMPLETED
- Customer withdraws → may return to QUALIFIED

**Allowed objectives**:
- Reassure customer that handoff is in progress
- Answer remaining questions while waiting
- Do NOT re-open lead capture or recommendation

**Forbidden actions**:
- Restarting need discovery
- New product recommendation
- Any action that implies the customer should reconsider their decision

---

#### HANDOFF_COMPLETED

**Definition**: Human advisor has taken responsibility for the conversation. AIOS role is secondary or advisory.

**Entry signals**:
- Human advisor confirmation received (when applicable)
- Conversation log closed

**Allowed objectives**:
- Archive conversation
- Feed Learning Intelligence with handoff outcome
- Feed Business Intelligence with conversion event

---

#### CUSTOMER

**Definition**: An existing customer who has purchased a product or enrolled in a service.

**Entry signals**:
- Post-purchase CRM record created
- Returning customer with `crm_saved = true`

**Allowed objectives**:
- Claims support (ACP-15)
- Hospital guidance (ACP-16)
- Follow-up and relationship maintenance (ACP-18)
- Cross-sell and upsell (Commercial Intelligence — Opportunity Detection)

---

#### ADVOCATE

**Definition**: A customer who actively promotes the advisor or product to others.

**Entry signals**:
- Referral given
- Testimonial provided
- Social sharing detected

**Allowed objectives**:
- Acknowledge and reward advocacy
- Provide referral tools
- Deepen relationship

---

## 2. Cold / Warm / Hot Alias Mapping

These aliases are used in operational contexts (admin alerts, sales pipeline, advisor briefs) to summarize customer lifecycle stage.

| Alias | States Included | Commercial Meaning |
|---|---|---|
| **Cold** | UNKNOWN, AWARE | No commercial intent yet; discovery phase |
| **Warm** | INTERESTED, CONSIDERING, QUALIFIED | Active engagement; recommendation in progress |
| **Hot** | READY, HANDOFF_PENDING | High buying intent; human advisor action required |

---

## 3. Forbidden Action Matrix

The following is a summary of key forbidden actions per lifecycle state. For the complete restriction set, see ACP Restrictions documents.

| State | Forbidden Actions |
|---|---|
| UNKNOWN | Lead capture, product recommendation, handoff |
| AWARE | Hard product push, lead capture, handoff |
| INTERESTED (trust active) | Lead capture, phone number request |
| INTERESTED (medical active) | Guarantee of insurance approval, lead capture pressure |
| CONSIDERING | Closing before recommendation delivered |
| QUALIFIED | Re-asking known fields (CP-05) |
| READY | Restarting education, delaying handoff |
| HANDOFF_PENDING | New product recommendations, new need discovery |

---

## 4. State Persistence

| State | Persisted In | TTL |
|---|---|---|
| UNKNOWN | Not persisted | — |
| AWARE through QUALIFIED | KV session memory | Session TTL (24h inactivity) |
| READY through HANDOFF_COMPLETED | KV session memory + CRM (when phone captured) | 30 days |
| CUSTOMER, ADVOCATE | CRM only | Permanent |

---

## 5. State Machine Governance

- **Owner**: Customer Intelligence (tracks and updates stage)
- **Readers**: Conversation Intelligence (strategy), Commercial Intelligence (action), Advisor Intelligence (handoff)
- **Transition authority**: Runtime Decision Engine (based on detected signals + ACP decision rules)
- **Manual override**: Human Product Owner (via Change Proposal) or human advisor (in HANDOFF_PENDING)

State transitions may not skip stages — UNKNOWN cannot jump to READY without passing through intermediate stages. Skipping stages indicates a data integrity problem and must be logged as an issue.
