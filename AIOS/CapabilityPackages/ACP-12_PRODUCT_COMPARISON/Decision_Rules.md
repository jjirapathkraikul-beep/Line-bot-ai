# Decision Rules — ACP-12: PRODUCT_COMPARISON

| Field | Value |
|---|---|
| Document ID | ACP-12-DECISION-RULES |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Priority Level

**HIGH** — Product comparison is a core pre-sales activity directly tied to purchase decisions.

---

## Activation Conditions

| Condition | Check |
|---|---|
| Customer intent matches comparison intents (INT-12-01 to INT-12-05) | Intent classifier output |
| No active trust concern | `trust_engine.concern_active == false` |
| Session is not in ACP-15 or ACP-16 restricted context | `active_capability != ACP-15 AND != ACP-16` |

---

## Preconditions

| Precondition | Rule |
|---|---|
| Products to compare must be identifiable | Either named by customer or inferable from context |
| If products unclear | Ask ONE clarifying question before proceeding |
| Customer's priority dimension | Use if known from need discovery; ask ONE question if unknown and critical |

---

## Execution Conditions

### Dimension Selection Rule
- Select the 2-3 dimensions most relevant to the customer's stated priority
- Default dimensions if priority is unknown: (1) coverage scope, (2) premium range, (3) key exclusions
- Never exceed 3 dimensions in a single comparison turn

### "Which is Better?" Rule
- NEVER answer "which is better" with a direct product declaration without context
- Always respond with a context-conditional answer:
  - "ขึ้นอยู่กับว่าคุณให้ความสำคัญกับอะไรครับ..."
  - Then provide a personalized recommendation based on known customer context

### Competitor Products Rule
- If a named competitor product is requested in a comparison, acknowledge the request
- Provide general category-level information if publicly known
- Do NOT make specific claims about competitor pricing, coverage, or reputation
- Redirect to Jirawat for full market comparison

### Simplification Rule
- If customer shows signs of overwhelm ("งงครับ", "มีเยอะเกินไป"), immediately reduce to 1-2 most critical dimensions
- Ask: "สิ่งที่สำคัญที่สุดสำหรับคุณคืออะไรครับ?" and rebuild comparison around that

---

## Exit Conditions

| Condition | Exit Type |
|---|---|
| Customer states a preference | SUCCESS → route to ACP-09 or ACP-19 |
| Customer understands and needs time | SUCCESS → route to ACP-11 if appropriate |
| Customer raises price objection | PRICE OBJECTION → route to ACP-13 |
| Customer requests detailed quote | HANDOFF → route to ACP-17 |
| Trust concern detected | INTERRUPT → activate ACP-08 |
| Emergency signal detected | INTERRUPT → activate ACP-16 |

---

## Interrupt Conditions

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern | CRITICAL | Suspend; activate ACP-08 |
| Emergency / hospital | CRITICAL | Suspend; activate ACP-16 |
| Price objection | HIGH | Activate ACP-13; return if customer re-engages comparison |
| Explicit request for Jirawat | HIGH | Activate ACP-17 |

---

## Recovery Conditions

| Scenario | Recovery |
|---|---|
| Customer asks about unlisted product | Acknowledge; offer closest known equivalent; offer Jirawat for full answer |
| Customer re-asks the same comparison | Simplify further; use a different framing or angle |
| Customer contradicts prior preference | Acknowledge the change; do not challenge; re-frame comparison around new preference |

---

## Fallback Rules

| Situation | Fallback |
|---|---|
| Product data insufficient for comparison | "ขอให้คุณจิรวัฒน์ช่วยเปรียบเทียบละเอียดๆ ให้ได้เลยครับ" → ACP-17 |
| Customer asks for more than 3 products | "เพื่อให้ชัดที่สุด ขอถามว่าตอนนี้สนใจระหว่างสองแบบไหนมากที่สุดครับ?" |
| No preference after 3 rounds | Activate ACP-17; comparison has reached productive limit |

---

## Conflict Resolution

| Conflict | Resolution |
|---|---|
| ACP-09 and ACP-12 both want to respond to same turn | ACP-12 completes comparison first; ACP-09 activates in next turn when customer signals preference |
| Customer asks for comparison AND price in same message | Answer comparison first (Answer Before Asking principle); then address price |
| Prior need discovery context conflicts with current comparison request | Use current comparison request as primary signal; note the discrepancy for Jirawat |
