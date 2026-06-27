# Conversation Map — ACP-14: EXISTING_POLICY

| Field | Value |
|---|---|
| Document ID | ACP-14-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

| Entry Type | Trigger |
|---|---|
| Direct intent | "ผมมีประกันอยู่แล้วครับ ต้องซื้อเพิ่มไหม?" |
| Gap concern | "กังวลว่าความคุ้มครองไม่พอ" |
| Coverage question | "ที่มีอยู่คุ้มครองพอไหมสำหรับ..." |
| Pre-emptive objection | "ผมมีประกันอยู่แล้วนะครับ" (said to avoid a sales pitch) |

---

## Exit Points

| Exit Type | Condition | Next State |
|---|---|---|
| SUCCESS — Gap Found | Genuine gap identified; customer interested | ACP-09 or ACP-11 |
| SUCCESS — Sufficient | Coverage assessed as sufficient for stated needs | Honest close; no further sales action |
| HANDOFF | Portfolio too complex for AI assessment | ACP-17 |
| INTERRUPT — Trust | Trust signal detected | ACP-08 |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS interrupt this capability regardless of review stage.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Suspend; activate ACP-08 |
| Emergency signal | CRITICAL | Suspend; activate ACP-16 |

---

## Resume Rules

| After Interrupt | Resume Possible? |
|---|---|
| After ACP-08 (Trust resolved) | Yes |
| After ACP-16 (Hospital) | No |

---

## Composition Rules

| Phase | Capability |
|---|---|
| BEFORE (common) | ACP-10 Need Discovery often provides context |
| AFTER (gap found, interest shown) | ACP-11 Lead Capture |
| AFTER (gap found, needs recommendation) | ACP-09 Recommendation Engine |
| AFTER (sufficient) | No further sales capability — close session |
| AFTER (complex portfolio) | ACP-17 Human Handoff |

---

## Conversation Flow Summary

```
[Existing policy mentioned or review requested]
         |
         v
  [Ask what they have — ONE question]
  "ตอนนี้มีประกันประเภทไหนบ้างครับ?"
         |
         v
  [Customer describes existing coverage]
         |
         v
  [Evaluate against customer's needs]
  (Use need discovery context if available)
         |
         |-- SUFFICIENT → "จากที่คุณบอก ดูเหมือนว่าความคุ้มครองที่มีอยู่ตอบโจทย์ดีครับ"
         |                 Close warmly; no product push
         |
         |-- GAP FOUND → Name the gap specifically
                          Give a concrete scenario example
                          Ask if customer wants to know about options
                          |
                          v
                     [Interest expressed → ACP-11 / ACP-09]
```
