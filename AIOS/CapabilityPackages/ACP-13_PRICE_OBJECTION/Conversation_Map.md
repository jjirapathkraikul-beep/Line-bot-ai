# Conversation Map — ACP-13: PRICE_OBJECTION

| Field | Value |
|---|---|
| Document ID | ACP-13-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Direct intent | Customer explicitly says price is too high |
| Mid-comparison | Price objection during ACP-12 comparison |
| Post-recommendation | Customer receives recommendation and objects to price |
| Unprompted budget question | "มีแบบถูกกว่านี้ไหมครับ?" |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Solution Found | Budget-matched product identified and customer shows interest | ACP-11 Lead Capture |
| SUCCESS — No Product | No product at budget; honest disclosure made | ACP-17 Handoff or graceful close |
| HANDOFF | Customer wants Jirawat to find a custom solution | ACP-17 |
| INTERRUPT — Trust | Trust signal detected | ACP-08 |
| GRACEFUL CLOSE | Customer in genuine hardship; no product push | End session warmly |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability regardless of state.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern | CRITICAL | Suspend; activate ACP-08 |
| Emergency / hospital signal | CRITICAL | Suspend; activate ACP-16 |
| Customer expresses genuine financial crisis | HIGH | De-escalate; do not push product; graceful close |

---

## Resume Rules

| After Interrupt | Resume Possible? |
|---|---|
| After ACP-08 (Trust resolved) | Yes |
| After ACP-16 (Hospital) | No |
| After graceful close | No (same session) |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE | ACP-12 (comparison) or ACP-09 (recommendation) often precedes price objection |
| AFTER (solution found) | ACP-11 Lead Capture |
| AFTER (needs personalization) | ACP-17 Human Handoff |

---

## Conversation Flow Summary

```
[Price objection detected]
         |
         v
  [Step 1: Acknowledge]
  Validate concern without defending price
         |
         v
  [Step 2: Discover budget]
  If not stated: ask ONE question about budget range
  If stated: confirm understanding
         |
         v
  [Step 3: Redirect]
  Show what IS available at customer's budget
  Use tax framing if applicable
         |
         v
  [Check outcome]
  - Interest shown → ACP-11 Lead Capture
  - Complex need → ACP-17 Handoff
  - No products at budget → honest disclosure + ACP-17
```
