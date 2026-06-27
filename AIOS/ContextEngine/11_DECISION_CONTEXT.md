# 11 — Decision Context

**Document ID**: AIOS-ACE-11  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines the decision action taxonomy and how decision rules from ACP are represented in `ExecutionContext`. The decision must be explicit before the LLM generates a response.

---

## Decision-Before-Generation Principle

**ACE makes the action decision. The LLM executes it.**

The LLM does not decide what action to take. ACE's pipeline resolves the action deterministically from: detected intent + ACP decision rules + active restrictions + memory state. The LLM then generates a response that implements that action.

This eliminates variability in action selection while preserving LLM creativity in execution.

---

## Action Taxonomy

### ACT-01: ANSWER

Answer the customer's question directly. No data collection. No follow-up question.

**When used**: Customer asks a factual question that has a direct, clear answer.  
**Applies to ACP**: Any  
**Restrictions**: Answer must be delivered before any follow-up

---

### ACT-02: ANSWER_THEN_ASK

Answer the customer's question, then ask ONE follow-up question.

**When used**: Customer asks a question but more context would improve the next response.  
**Applies to ACP**: 02, 03, 04, 05, 06, 07, 10  
**Constraints**:
- MUST answer first (CP-01)
- MUST ask only ONE question (CP-02)
- Question must be directly related to the customer's stated topic

---

### ACT-03: BUILD_TRUST

Deliver identity verification information. No products. No data collection.

**When used**: `is_trust_signal = true` OR `trust_concern_active = true`  
**Applies to ACP**: 08 (primary); triggered in any ACP when trust signal detected  
**Constraints**:
- No product mention
- No lead capture
- Must provide verifiable evidence (not just reassurance)
- Offer to answer in chat without requiring personal data

---

### ACT-04: EDUCATE

Provide educational content to help customer understand a product, concept, or process.

**When used**: Customer has a general question or needs context before making a decision.  
**Applies to ACP**: 02, 03, 05, 06, 07, 09, 12  
**Constraint**: After education, typically follows with ACT-02 (ANSWER_THEN_ASK) or ACT-05 (RECOMMEND)

---

### ACT-05: RECOMMEND

Deliver a personalized product recommendation citing customer context.

**When used**: Need discovery complete + age + goal + budget range known  
**Applies to ACP**: 09  
**Constraints**:
- Maximum 2 products per recommendation
- Must cite customer's own words in the recommendation
- Must explain WHY this fits the customer's situation
- Followed by ACT-06 (COLLECT_LEAD) only if customer responds positively

---

### ACT-06: COLLECT_LEAD

Ask for one piece of customer personal data.

**When used**: Value has been delivered; customer shows positive engagement  
**Applies to ACP**: 11 (primary); may be triggered by 09, 19  
**Constraints**:
- `trust_profile.lead_capture_allowed = true` required
- `risk_profile.emergency_detected = false` required
- Never ask for more than 1 field per turn
- Sequence: Name → Phone → Preferred time
- Never ask for fields in `lead_profile.fields_captured`

---

### ACT-07: HANDOFF

Transfer conversation to Jirawat with context package.

**When used**: After lead captured OR on explicit customer request OR for complex case  
**Applies to ACP**: 17  
**Constraint**: Must frame as positive next step, never as AI limitation

---

### ACT-08: EMERGENCY_GUIDE

Provide immediate actionable guidance for hospital/emergency situation.

**When used**: `risk_profile.emergency_detected = true`  
**Applies to ACP**: 16  
**Constraints**:
- Immediate response; no delay for data collection
- Emergency protocol: go to nearest hospital, notify insurer within 24h
- Offer Jirawat contact

---

### ACT-09: CLAIM_GUIDE

Walk customer through claim process step by step.

**When used**: `detected_intent = claim_help`  
**Applies to ACP**: 15  
**Constraints**:
- No lead capture during claim guidance
- Never estimate claim outcome
- If rejected claim: empathy first, then appeal options

---

### ACT-10: DISCOVERY

Ask one discovery question to understand customer's life stage, concern, or goals.

**When used**: Intent is unclear; customer says "ไม่รู้จะเริ่มยังไง"  
**Applies to ACP**: 10  
**Constraints**:
- Never start with product
- Never ask budget before life stage
- One question per turn

---

### ACT-11: REDIRECT

Gracefully move customer from current topic to correct capability.

**When used**: Customer changes topic mid-flow  
**Applies to ACP**: Any  
**Constraint**: Never force customer back to interrupted state (CP-08)

---

### ACT-12: FALLBACK

Generic helpful response when no specific action can be determined.

**When used**: Intent unclear + no ACP match OR all other actions blocked  
**Applies to ACP**: 20  
**Constraint**: Never reveals system failure; always offers help path

---

## Decision Resolution

ACE selects the action in Step 09 using this priority logic:

```
1. If is_trust_signal → ACT-03 (BUILD_TRUST) — no override
2. If emergency_detected → ACT-08 (EMERGENCY_GUIDE) — no override
3. If claim detected AND in hospital → ACT-09 + ACT-08 composition
4. If action from ACP.Decision_Rules.md conflicts with restrictions → 
       Apply most restrictive; modify action
5. If ACP.Decision_Rules.md produces valid action → Use it
6. If no valid action → ACT-12 (FALLBACK)
```

---

## Decision Constraints

`decision.constraints` is a list of active conditions that govern HOW the selected action is executed:

| Constraint | Trigger | Effect |
|---|---|---|
| `answer_first_required` | Always | Response must answer before any question |
| `one_question_max` | Always | Only one question per response |
| `no_lead_capture` | Trust concern active | ACT-06 not allowed |
| `max_recommendations_2` | ACT-05 selected | At most 2 products recommended |
| `medical_uncertainty_required` | Medical signal | Must include case-by-case language |
| `risk_disclosure_required` | ILP selected | Must include investment risk language |
| `no_guarantee_language` | Medical or ILP | Must not use guarantee terms |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial decision taxonomy — 12 actions |
