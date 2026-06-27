# Conversation Map — ACP-20: EDGE_CASE_HANDLER

| Field | Value |
|---|---|
| Document ID | ACP-20-CONVERSATION-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Entry Points

ACP-20 is entered via **content pattern detection**, not intent classification. It can interrupt any active capability.

| EC | Detection Signal Pattern |
|---|---|
| EC-01 | Self-harm keywords, suicidal ideation signals, extreme hopelessness |
| EC-02 | Terminal illness keywords ("ระยะสุดท้าย", "ไม่รอดแล้ว", specific diagnoses) |
| EC-03 | Financial crisis language ("เป็นหนี้ท่วม", "ไม่มีเงินจ่ายแล้ว", "ล้มละลาย") |
| EC-04 | Competitor name + comparison request |
| EC-05 | Direct AI identity question ("คุณเป็น AI ไหม?", "คุณเป็นหุ่นยนต์หรือเปล่า?") |
| EC-06 | Clearly off-topic content (politics, sports, unrelated personal questions) |
| EC-07 | Angry language patterns, all-caps, explicit frustration expressions |
| EC-08 | "การันตี", "รับประกันกำไร", "ไม่ขาดทุนแน่นอน" in investment insurance context |
| EC-09 | Age mention under 18, or context indicating minor customer |
| EC-10 | Factually incorrect insurance claims stated as fact |

---

## Exit Points

| EC | Exit Type | Next State |
|---|---|---|
| EC-01 | Crisis support complete | No further commercial routing |
| EC-02 | Honest guidance given | ACP-17 if customer requests Jirawat |
| EC-03 | Existing policy options discussed | ACP-17 if customer requests Jirawat |
| EC-04 | Factual response given; Jirawat offered | ACP-17 if accepted |
| EC-05 | Honest acknowledgment given | Resume normal conversation |
| EC-06 | Redirect given | Resume normal conversation |
| EC-07 | Frustration de-escalated | Resume or ACP-17 |
| EC-08 | Honest disclosure given | Resume with corrected understanding |
| EC-09 | Guardian requirement explained | ACP-17 for parent/guardian |
| EC-10 | Gentle correction given | Resume normal conversation |

---

## Interrupt Rules

> **RULE**: Trust signals ALWAYS take precedence over ACP-20.
> **RULE**: EC-01 (self-harm) takes highest priority within ACP-20 — overrides all other ECs.

| Interrupt | Priority | Action |
|---|---|---|
| Trust concern signal | CRITICAL | Trust Engine takes over even during ACP-20 |
| EC-01 signal | CRITICAL within ACP-20 | Self-harm handling takes over all other ECs |

---

## Composition Rules

| Phase | Relationship |
|---|---|
| CAN INTERRUPT | Any active capability (ACP-01 through ACP-19) |
| AFTER EC-01 | No commercial routing; session ends or minimal support continues |
| AFTER EC-07 (de-escalated) | Resume interrupted capability or ACP-17 |
| AFTER MOST ECS | Resume normal conversation flow |

---

## Cross-EC Priority

When multiple EC signals appear simultaneously:

| Priority | EC |
|---|---|
| 1 (Highest) | EC-01 (self-harm) |
| 2 | EC-07 (anger — de-escalate before anything else) |
| 3 | EC-03 (financial crisis) |
| 4 | EC-02 (terminal illness) |
| 5 | EC-05 (AI identity) |
| 6-10 | EC-04, EC-06, EC-08, EC-09, EC-10 (standard priority) |
