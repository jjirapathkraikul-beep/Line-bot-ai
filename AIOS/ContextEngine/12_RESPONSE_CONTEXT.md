# 12 — Response Context

**Document ID**: AIOS-ACE-12  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Purpose

Defines how ACE constructs the `response_profile` section of `ExecutionContext`, which governs the style, structure, tone, and constraints of the LLM's output.

---

## Response Profile Construction

The `response_profile` is assembled from four sources, applied in order (later sources may override earlier):

```
1. ACP Default (Response_Profile.md)
2. Emotion modifier (from emotion.detected)
3. Risk modifier (from risk_profile)
4. Trust modifier (from trust_profile)
```

---

## Tone

Governs the overall register of the response.

| ACP | Default Tone |
|---|---|
| ACP-01 GREETING | Warm, welcoming |
| ACP-02, 03, 05, 06, 07 | Educational, professional |
| ACP-04 MEDICAL | Empathetic, careful |
| ACP-08 TRUST | Empathetic, transparent |
| ACP-09 RECOMMENDATION | Consultative, confident |
| ACP-11 LEAD_CAPTURE | Warm, low-pressure |
| ACP-13 PRICE_OBJECTION | Empathetic, solution-focused |
| ACP-15, 16 CLAIM/HOSPITAL | Empathetic, immediate |
| ACP-17 HANDOFF | Warm, affirming |
| ACP-19 CLOSING | Affirming, clear |
| ACP-20 EDGE_CASE | Adaptive (empathetic for EC-01/03/07; transparent for EC-05) |

**Emotion overrides**:
- `FRUSTRATED` detected → override to empathetic
- `ANXIOUS` detected → override to calm + reassuring
- `SUSPICIOUS` detected → override to transparent + non-defensive

---

## Length

| Length | Approximate Words | When Used |
|---|---|---|
| `short` | 30–80 | Emergency, trust signal, closing affirmation |
| `medium` | 80–200 | Most educational responses, recommendations |
| `long` | 200–400 | Complex comparisons, need discovery synthesis |

**Risk overrides**:
- `emergency_detected = true` → force `short`
- `trust_concern_active = true` → force `short` to `medium` (avoid overwhelming)

---

## Empathy Level

| Level | Behavior |
|---|---|
| `none` | Factual only; no emotional acknowledgment |
| `low` | Brief acknowledgment before information |
| `medium` | Clear emotional recognition before content |
| `high` | Empathy leads response; information follows naturally |
| `critical` | Empathy dominates; content is secondary (EC-01, EC-02, EC-03) |

**Emotion overrides**:
- `empathy_required = true` → minimum `medium`
- `FRUSTRATED` or `ANXIOUS` → minimum `high`
- Self-harm signal (EC-01) → `critical`

---

## Question Strategy

| Strategy | Rule |
|---|---|
| `one_question` | Ask exactly one question per turn (default for most ACPs) |
| `no_question` | No follow-up question (ACT-03 BUILD_TRUST, ACT-07 HANDOFF, ACT-12 FALLBACK) |
| `clarifying_only` | Only ask a question if absolutely necessary for understanding (CLAIM, HOSPITAL) |

**CP-02 enforcement**: `one_question` strategy means exactly one. Never two. Never bundled.

---

## Answer-First Rule

`response_profile.answer_first = true` in all contexts EXCEPT:

| Exception | Condition | Override |
|---|---|---|
| Emergency guide | `emergency_detected = true` | Answer IS the guidance — no pre-question |
| Edge case EC-01 | Self-harm signal | Empathy and resources first, no insurance information |

For all other contexts, the LLM must answer the customer's question BEFORE asking any follow-up (CP-01).

---

## Prohibited Phrases

Global prohibited phrases (always included in `response_profile.prohibited_phrases`):

- "ผมการันตีว่าจะผ่านการพิจารณา" (guarantee of acceptance)
- "ผลตอบแทนเฉลี่ย [X]% ต่อปี" (fabricated return rates)
- "ราคาถูกที่สุด" (cheapest price claim without evidence)
- "บริษัทอื่นด้อยกว่า" (competitor denigration)
- "ต้องตัดสินใจวันนี้เท่านั้น" (urgency pressure tactic)
- "ไม่ใช่มิจฉาชีพครับ" (self-denial without evidence during trust concern)

ACP-specific prohibited phrases are merged in from each ACP's Restrictions.md.

---

## Brand Alignment

Responses must reflect Jirawat Jirapathkraikul's advisory brand:
- **Professional but approachable** — not corporate stiff, not overly casual
- **Thai-first** — customer responses always in Thai
- **Honest limitations** — acknowledge what AI cannot do; route to Jirawat for what needs human judgment
- **Education-first** — help customers understand, then sell
- **No high-pressure tactics** — ever

---

## CTA Policy

`response_profile.cta_allowed` controls whether the response may include a Call to Action (e.g., "ให้คุณจิราวัฒน์ช่วยได้เลยครับ"):

| Condition | cta_allowed |
|---|---|
| Default | true |
| Trust concern active | false (until resolved) |
| Emergency situation | false (guidance only) |
| Claim support | false (support only) |
| After positive closing signal | true (warm handoff CTA) |

---

## Response Structure Guidelines

For `medium` and `long` responses, ACE specifies in `response_profile`:

- **Bullet lists**: Use for comparative information, step-by-step guidance, document checklists
- **Line breaks**: Between major sections of a response
- **Emoji**: Used sparingly — greeting (😊), affirmation (✅), warning (⚠️) — never more than 2 per response
- **Bold**: Not available in LINE plain text; avoid markdown bold in Thai responses
- **Numbers**: Use when giving ordered steps or priority rankings

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial response profile construction spec |
