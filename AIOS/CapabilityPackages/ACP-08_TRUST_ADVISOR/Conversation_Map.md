---
Document ID: ACP-08-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Conversation Map

---

## Entry Points

ACP-08 can be entered from ANY state, at ANY time, from ANY other ACP.

| Entry Trigger                     | Source          | Condition                                              |
|-----------------------------------|-----------------|--------------------------------------------------------|
| Trust signal in any message       | Trust Engine    | Keyword or pattern match: มิจฉาชีพ, โกง, ต้มตุ๋น, etc. |
| `trust_concern` intent            | Any ACP         | NLU classifies intent as trust/fraud concern           |
| Customer requests verification    | Any ACP         | "ตรวจสอบได้ที่ไหน", "ยืนยันตัวตนได้ยังไง"            |
| `fear_data_theft` signal          | Any ACP         | Customer expresses fear about data misuse              |
| Direct first-message trust signal | ACP-01          | Trust signal in very first customer message            |

---

## Exit Points

| Exit Type              | Condition                                              | Next State                           |
|------------------------|--------------------------------------------------------|--------------------------------------|
| Trust Resolved         | Customer explicitly satisfied; 2-turn cooling period passed | Resume suspended ACP; caution mode  |
| Customer Requests Call | Customer wants direct call with Jirawat               | Provide Jirawat contact; session may close |
| Customer Leaves        | Customer ends conversation after trust concern        | Session closed; CRM flag written     |
| Unresolved (timeout)   | Trust never resolved; customer goes silent            | Session closed; CRM flag written     |

---

## Interrupt Rules

ACP-08 itself cannot be interrupted by any other ACP.
The only priority that can affect ACP-08 is a customer request to end the conversation — which must be respected immediately.

| Rule                                    | Action                                              |
|-----------------------------------------|-----------------------------------------------------|
| No other ACP can interrupt ACP-08       | ACP-08 holds until trust resolved or customer leaves|
| Customer requests to end conversation   | Respect immediately; do not retain                  |

---

## Resume Rules

After ACP-08 is resolved:

| Rule                                          | Value              |
|-----------------------------------------------|--------------------|
| Lead capture cooling period                   | 2 full turns       |
| Product mention cooling period                | 2 full turns       |
| Trust signal re-occurrence                    | Restart ACP-08     |
| CRM flag `trust_signal_in_session = TRUE`     | Always remains TRUE regardless of resolution |
| Resume suspended ACP                          | Yes, after 2-turn cooling |

---

## Composition Rules

| Position          | Relationship                                                               |
|-------------------|----------------------------------------------------------------------------|
| OVERRIDES         | ALL ACPs — ACP-08 immediately suspends any active capability               |
| BLOCKED FROM ACP-08 | No ACP can be activated from within ACP-08 during trust concern         |
| AFTER ACP-08      | Any ACP can be resumed after 2-turn cooling period                         |

---

## Conversation Flow Summary

```
[Trust signal detected in ANY message]
        ↓
[ALL other ACPs suspended immediately]
        ↓
[ACP-08 activates]
        ↓
[Response Turn 1: Acknowledge concern + provide credentials + verification channel]
        ↓
[Data collection BLOCKED]
        ↓
[Customer responds]
        ↓
[Is customer satisfied / concern reduced?]
   Yes → [2-turn cooling period before resume]
   No  → [Continue trust resolution; provide additional verification]
        ↓
[3rd turn without resolution → Proactively offer Jirawat direct contact]
        ↓
[Customer chooses to continue OR leaves]
```

**Detailed Thai examples in `Examples.md`.**
