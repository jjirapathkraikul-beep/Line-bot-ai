# 10 — Conversation Dataset Context

**Document ID**: AIOS-ACE-10  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how the Conversation Intelligence Dataset (CID) contributes content to `ExecutionContext`. The dataset provides conversation behavioral intelligence — how the AI should THINK and RESPOND, not just what it knows.

---

## Dataset Contribution Principle

**The ConversationDataset provides behavioral intelligence. Knowledge documents provide facts. These are different things and must not be conflated.**

A knowledge document tells the AI: "ประกันชีวิตลดหย่อนได้ 100,000 บาท"  
A dataset document tells the AI: "When a customer asks about tax deduction, educate about the deduction limit FIRST and ask about existing deductions BEFORE asking income range."

ACE loads both — but they serve different roles in `ExecutionContext`.

---

## What Each CID Section Contributes

### Customer Goals

Contributes to `customer_goal.primary` (if not already inferred from intent).

Used by the LLM to frame its response from the customer's perspective, not the product's perspective.

---

### Expected Intent

Cross-referenced against `detected_intent.primary`. If there is a mismatch (e.g., ACP says this CID is for `product_health` but detected intent is `product_cancer`), ACE logs the mismatch but proceeds with detected intent.

---

### Expected Emotion

Contributes to validating `emotion.detected`. If CID expects `SUSPICIOUS` for trust scenarios and intent classifier detected trust signal but emotion shows `NEUTRAL`, ACE flags potential emotion detection gap.

---

### Expected AI Thinking

This is the most valuable section for context assembly.

The "Expected AI Thinking" paragraph from the relevant CID document is loaded as a brief `decision.rationale` supplement. It helps the LLM understand WHY a certain action is appropriate, not just WHAT to do.

Example from CID-08 (Trust):
> "Customer just expressed a fraud concern. This is a CRITICAL moment. If I respond correctly, I may turn a skeptical person into a trusting client..."

ACE injects a compressed version (2–3 sentences) into `decision.rationale`.

---

### Expected AI Reply

ACE does NOT inject example replies verbatim. It extracts the PATTERN of the reply:
- Answer structure (answer first → one question)
- Verification info format (bullet list)
- Tone markers (empathetic, not defensive)

These patterns are used to populate `response_profile` modifiers.

---

### Follow-up Questions

The follow-up question table from each CID is used to populate:
- `memory.working_memory.suggested_followup` (the next appropriate question given customer's last statement)

This does NOT dictate the exact question — it informs the LLM what TYPE of follow-up is appropriate.

---

### When NOT to Ask for Lead

This section is critical. ACE reads it to set:
- `trust_profile.lead_capture_allowed`
- Contributes to `restrictions` if lead capture is prohibited in this scenario

---

### When to Resume Lead Capture

Used to set conditions in `decision.constraints` for when lead capture may be reintroduced.

---

### Good Conversation Examples

ACE loads:
- 1 good example (abbreviated to 3 customer-AI turns)
- Injects into `selected_conversation_patterns.examples[].type = "good"`

LLM uses good examples to understand the QUALITY STANDARD of the expected response.

---

### Bad Conversation Examples

ACE loads:
- 1 bad example with explanation
- Injects into `selected_conversation_patterns.examples[].type = "bad"`

LLM uses bad examples as a negative constraint — "do not produce a response that looks like this."

---

### Lessons Learned

NOT loaded into runtime context. Used by Learning Layer for pattern extraction.

---

## Always-Loaded Dataset: CID-20

`AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md` is **always loaded** regardless of intent or ACP.

ACE extracts the 10 master patterns (CP-01 through CP-10) and populates `selected_conversation_patterns.patterns`.

These patterns are the foundational behavioral rules for ALL responses.

| Pattern | Always Include |
|---|---|
| CP-01: Answer Before Asking | YES |
| CP-02: One Question Per Turn | YES |
| CP-03: Educate Before Capture | YES |
| CP-04: Trust Before Sell | YES |
| CP-05: Known Field Protection | YES |
| CP-06: Empathy Before Information | YES |
| CP-07: Context-First Recommendation | YES |
| CP-08: Graceful Redirect | YES |
| CP-09: Honest Limitation Acknowledgment | YES |
| CP-10: Warm Handoff | YES |

---

## Intent-to-CID Mapping

| Detected Intent | Primary CID | Secondary CID |
|---|---|---|
| `greeting` | CID-01 | — |
| `product_health` | CID-02 | — |
| `product_cancer` | CID-03 | — |
| `medical_question` | CID-04 | — |
| `product_tax` | CID-05 | — |
| `product_retirement` | CID-06 | — |
| `product_investment` | CID-07 | — |
| `trust_concern` | CID-08 | — |
| `ask_comparison` | CID-09 | — |
| `unclear` | CID-10 | — |
| `ask_recommendation` | CID-11 | CID-10 |
| `price_objection` | CID-12 | — |
| `existing_insurance` | CID-13 | — |
| `claim_help` | CID-14 | — |
| `hospital_question` | CID-15 | — |
| `handoff_request` | CID-16 | — |
| `follow_up` | CID-17 | — |
| `ready_to_buy` | CID-18 | — |
| `edge_case` | CID-19 | CID-08 (if trust-adjacent) |

All intents also load CID-20 (always).

---

## CID Fragment Size Budget

| CID Section | Target Size |
|---|---|
| Expected AI Thinking (compressed) | ~100 words |
| Good example (3 turns) | ~150 words |
| Bad example reason | ~30 words |
| Follow-up question guidance | ~50 words |
| CID-20 patterns (10 × 1 line) | ~100 words |
| **Total CID contribution** | **~430 words** |

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial CID context contribution spec |
