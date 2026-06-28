# 03 — Commercial Learning

**Document ID**: AIOS-BETA-03  
**Version**: 1.0  
**Date**: 2026-06-29  
**Status**: Active  
**Authority**: Commercial Intelligence Owner + Human Product Owner  
**Reference**: `AIOS/Intelligence/02_INTELLIGENCE_TAXONOMY.md` (Commercial Intelligence), `04_SHARED_STATE_MACHINE.md`

---

## Purpose

Define what AIOS must learn about the commercial dimension of every conversation — how customers move through the advisory journey, where commercial opportunities arise, and how to improve conversion quality over time.

---

## 1. Customer Journey Intelligence

AIOS must learn how customers actually move through the lifecycle states defined in `AIOS/Intelligence/04_SHARED_STATE_MACHINE.md`. Theory says one thing; real conversations say another.

### Learning by State

---

#### UNKNOWN

**Learn**: How do customers first arrive? Which entry point (Rich Menu button, direct message, referral)?  
**Measure**: Entry point distribution; first-message intent distribution  
**Action**: Optimize ACP-01 GREETING routing based on most common entry intents

---

#### AWARE

**Learn**: How long (in turns) do customers stay in AWARE before asking a meaningful question?  
**Measure**: AWARE→INTERESTED transition rate; average turns in AWARE  
**Action**: If AWARE dwell is high (>3 turns), audit greeting strategy for engagement failure

---

#### INTERESTED

**Learn**: What product categories generate the most interest? What questions are most commonly asked at this stage?  
**Measure**: Product interest distribution (CoS-01 signal frequency by product)  
**Action**: Prioritize knowledge document completeness for highest-interest products

---

#### CONSIDERING

**Learn**: What objections appear most in CONSIDERING? Which objections are resolved vs. which cause drop-off?  
**Measure**: Objection type frequency; objection resolution rate; CONSIDERING→QUALIFIED conversion  
**Action**: Improve ACP-13 (price objection), ACP-14 (existing policy) based on observed objection patterns

---

#### QUALIFIED

**Learn**: What profile completeness is typical when a customer qualifies? Which missing fields are most common?  
**Measure**: Average lead score at qualification; most-missing field at qualification  
**Action**: Adjust need discovery flow to surface the highest-value missing fields earlier

---

#### READY

**Learn**: What triggers the transition from QUALIFIED to READY? Which buying signals are most reliable?  
**Measure**: Buying signal type distribution; QUALIFIED→READY conversion rate  
**Action**: Update Buying_Signal.md and ACP-19 decision rules based on actual signal patterns

---

#### HANDOFF

**Learn**: Are handoffs happening at the right moment? Too early = low lead score; too late = frustrated customer  
**Measure**: Lead score at handoff; turn count at handoff; READY→HANDOFF_PENDING conversion lag  
**Action**: Calibrate handoff trigger threshold in ACP-17 Decision_Rules

---

#### CUSTOMER (Post-purchase)

**Learn**: Do existing customers return? With what intent (claim, referral, additional product)?  
**Measure**: Returning customer rate; post-purchase intent distribution  
**Action**: Optimize ACP-18 FOLLOW_UP for returning customer journeys

---

#### ADVOCATE

**Learn**: Do satisfied customers refer others? How?  
**Measure**: Referral signal detection rate (future, requires explicit tracking)  
**Action**: Design referral conversation flow in future ACP

---

## 2. Buying Signals

AIOS must learn which signals reliably predict purchase intent, and which are false positives.

| Signal | Definition | How to Detect | Learning Question |
|---|---|---|---|
| Explicit purchase statement | "อยากซื้อ", "สมัครได้เลย" | Intent keywords | How often does this NOT convert to handoff? Why? |
| Callback request | "โทรหา", "นัด", "เบอร์" | CoS-04 signal | How quickly after callback request does handoff fire? |
| Quotation request | "ขอใบเสนอราคา", "เสนอราคา" | CoS-05 signal | Does a quote request always justify handoff? |
| Question about next steps | "ต้องทำอะไรต่อ", "เริ่มได้เลย" | Closing intent | Does this signal READY state reliably? |
| Budget acceptance | Customer accepts stated premium range | Response to price | How often does budget acceptance precede close? |
| Specific coverage request | Customer names exact benefit needed | Product specificity | Is this a better handoff trigger than QUALIFIED threshold? |

**Learning Action**: After 50+ conversations, analyze which signals have the highest conversion-to-handoff correlation. Update `AIOS/Domains/Insurance/Sales/Buying_Signal.md` based on real data.

---

## 3. Objection Types

AIOS must catalog every objection type observed and measure resolution effectiveness.

| Objection Type | ACP | Expected Response | Learn: Resolution Rate |
|---|---|---|---|
| Price too high | ACP-13 | Budget optimization + alternative product | What % of price objections resolve to qualification? |
| Already have insurance | ACP-14 | Complement existing coverage + gap analysis | What % of existing-policy customers stay in consideration? |
| Trust/scam concern | ACP-08 | BUILD_TRUST_FIRST before any commercial action | What % of trust concerns recover to INTERESTED? |
| Spouse/partner must decide | — | Acknowledge; offer to involve + set follow-up | What % become dead-end vs. nurtured? |
| Not the right time | — | Acknowledge; offer educational content; nurture | What % return? |
| Need to think | — | Acknowledge; summarize benefits; leave door open | What % follow up within 7 days? |

**Learning Action**: Document each objection type as a Learning Signal (LS-06: Failed recommendation pattern if objection leads to drop-off). Update Pattern Library with objection-specific patterns.

---

## 4. Drop-off Reasons

AIOS must identify why customers disengage. Drop-off is not a failure — it is data.

| Drop-off Pattern | Likely Cause | Detection Method | Learning Action |
|---|---|---|---|
| Drop after first message | Greeting not engaging; routing wrong | AWARE stage, 1 turn, no return | Improve ACP-01 GREETING |
| Drop during need discovery | Too many questions too fast | CS-06 Question Fatigue signal | Reduce discovery questions; lead with education |
| Drop after price mention | Price shock | Price inquiry → no follow-up | Improve price anchoring and budget alternatives |
| Drop during medical flow | Over-questioning; no empathy | Medical signal active; high turn count | Improve medical empathy script |
| Drop after recommendation | Recommendation was irrelevant | Recommendation delivered; no positive signal | Improve ACP-09 decision rules; improve profile completeness |
| Drop at handoff request | Premature handoff; trust not ready | Handoff triggered before trust established | Improve handoff timing logic |

**Learning Action**: After each drop-off, flag the session in issueDatabase with category `conversation_flow` or `recommendation_quality`. Analyze weekly for patterns.

---

## 5. Lost Opportunity Analysis

A lost opportunity occurs when a customer with commercial intent disengages without a handoff.

**Lost Opportunity conditions:**
- Customer reached CONSIDERING or higher stage
- Customer was given a recommendation (ACT-05)
- Customer did not trigger handoff
- Customer has not returned within 7 days

**What to learn from lost opportunities:**
- At which turn did the opportunity signal peak?
- What was the final intent before disengagement?
- Was any objection active?
- Was trust concern ever active in the session?
- Was the recommendation delivered before or after the peak?

**Output**: Weekly lost opportunity count + root cause classification. Feed into Commercial Learning dataset.

---

## 6. Lead Timing Analysis

Lead capture that is too early destroys trust. Lead capture that is too late misses the window.

**Too early signals:**
- `trustConcernActive = true` when lead capture fires (architecture violation — this should be blocked)
- Customer in INTERESTED stage (< 3 turns); lead capture already requested
- Customer confusion signal (CS-04) active when lead capture fires

**Too late signals:**
- Customer expressed buying intent (CoS-07) multiple turns ago; no lead capture initiated
- Customer requested callback (CoS-04) but lead capture stage still IDLE
- Customer in READY state for > 5 turns; no handoff triggered

**Learning Action**: Log `leadCaptureStarted` turn vs. `buyingIntentTurn` (future field). Flag mis-timed lead capture as LS-07 (Handoff Timing Error) pattern.

---

## 7. Recommendation Timing Analysis

A recommendation delivered too early (before the customer trusts or has context) is rejected. Too late, and the customer has already formed their own opinion.

**Optimal recommendation window:**
- Customer has stated age + goal + rough budget (sufficient context)
- Customer has not expressed a pending trust concern
- Customer is in CONSIDERING or QUALIFIED stage
- Recommendation follows at least one educational exchange

**Learning Action**: Measure: turns-to-recommendation vs. acceptance signal correlation. Update ACP-09 decision rules when pattern emerges.

---

## 8. Commercial KPIs

These are the Beta commercial performance metrics tracked weekly. Full definitions in `09_METRIC_DEFINITIONS.md`.

| KPI | Formula | Beta Target | Warning |
|---|---|---|---|
| Lead Capture Rate | engaged leads / new users | ≥ 50% | < 35% |
| Qualification Rate | qualified leads / engaged leads | ≥ 20% | < 12% |
| Handoff Rate | handoffs / qualified leads | ≥ 70% | < 50% |
| Lead Timing Accuracy | turns-to-first-capture in optimal window | ≥ 70% | < 50% |
| Recommendation Delivery Rate | sessions with recommendation / CONSIDERING+ sessions | ≥ 60% | < 40% |
| Objection Resolution Rate | resolved objections / total objections | ≥ 50% | < 30% |
| Drop-off Rate at CONSIDERING | drop-offs at CONSIDERING / total CONSIDERING entries | ≤ 40% | > 60% |
| Lost Opportunity Rate | lost opportunities / total CONSIDERING+ | ≤ 30% | > 50% |

---

## 9. Commercial Learning Dataset

During Beta, AIOS must build a dataset of commercial patterns for future Intelligence improvements.

**Dataset fields (per conversation):**

| Field | Description |
|---|---|
| `entry_stage` | Which state did the customer enter (inferred) |
| `exit_stage` | Which state did the customer exit |
| `turns_to_interested` | Turns from first message to INTERESTED |
| `turns_to_qualified` | Turns from INTERESTED to QUALIFIED |
| `turns_to_handoff` | Turns from QUALIFIED to handoff |
| `objection_types` | List of observed objection types |
| `recommendation_delivered` | Boolean |
| `recommendation_turn` | Which turn recommendation was delivered |
| `buying_signal_type` | Which buying signal triggered READY |
| `handoff_lead_score` | Lead score at handoff |
| `drop_off_stage` | If applicable, which stage the drop-off occurred |
| `drop_off_turn` | If applicable, which turn |

This dataset is built from conversation logs and becomes the evidence base for future Commercial Intelligence improvements via the Change Proposal process.
