---
Document ID: ACP-04-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Conversation Map

---

## Entry Points

| Entry Trigger                        | Source               | Condition                                             |
|--------------------------------------|----------------------|-------------------------------------------------------|
| `medical_question` intent            | ACP-01 routing       | Customer asks about pre-existing conditions directly  |
| `ask_health_condition` intent        | ACP-01 routing       | Customer asks about eligibility                       |
| Pre-existing condition disclosure    | ACP-02 mid-session   | Customer mentions health condition during health talk |
| Cancer history disclosure            | ACP-03 mid-session   | Customer mentions cancer history during cancer talk   |
| Any ACP pre-existing condition hit   | Any ACP              | Cross-ACP trigger for medical underwriting questions  |

---

## Exit Points

| Exit Type              | Condition                                             | Next State / ACP              |
|------------------------|-------------------------------------------------------|-------------------------------|
| Medical Context Ready  | Conditions documented; customer ready for Jirawat     | Lead capture → Jirawat handoff |
| No Lead — Informed     | Customer satisfied with information; not ready        | Session open; return to origin ACP |
| Trust Override         | Trust signal detected                                 | → ACP-08 TRUST_ADVISOR       |
| Insufficient Context   | Customer unwilling to share medical detail            | Summarize what is possible; offer Jirawat call |

---

## Interrupt Rules

| Interrupt Trigger               | Priority   | Action                                          |
|---------------------------------|------------|-------------------------------------------------|
| Trust/fraud signal              | CRITICAL   | → ACP-08 immediately                           |
| Multiple conditions at once     | HIGH       | Take one condition per turn; ask about the next in the following turn |
| Emergency health signal         | HIGH       | Acknowledge; recommend they consult a doctor; do not pitch |

---

## Resume Rules

| Scenario                              | Resume Allowed | Conditions                                        |
|---------------------------------------|---------------|---------------------------------------------------|
| Returning from ACP-08 (trust)         | Yes           | Resume after 2-turn delay                         |
| Return to origin ACP (ACP-02/03)      | Yes           | After medical context established                 |
| Session timeout                       | No            | Restart from greeting                             |

---

## Composition Rules

| Position      | Capability                  | Condition                                              |
|---------------|-----------------------------|--------------------------------------------------------|
| BEFORE ACP-04 | ACP-01 GREETING             | Direct entry via medical intent                        |
| BEFORE ACP-04 | ACP-02 HEALTH_ADVISOR       | Cross-triggered when health condition mentioned        |
| BEFORE ACP-04 | ACP-03 CANCER_ADVISOR       | Cross-triggered when cancer history mentioned          |
| DURING ACP-04 | ACP-08 TRUST_ADVISOR        | Always available interrupt                             |
| AFTER ACP-04  | ACP-02 / ACP-03             | Return to origin ACP after medical context established |
| AFTER ACP-04  | ACP-09 RECOMMENDATION       | When customer ready for product recommendation         |

---

## Conversation Flow Summary

```
[ACP-04 activated — medical question or condition disclosed]
        ↓
[Answer underwriting question FIRST: "case-by-case review"]
        ↓
[Identify condition(s) mentioned]
        ↓
[Ask ONE medical follow-up question about the first condition]
        ↓
[Customer provides context]
        ↓
[More conditions to explore?]
   Yes → [Ask ONE follow-up about next condition in NEXT turn]
   No  ↓
[Medical context established]
        ↓
[Explain what happens next: Jirawat will review and advise]
        ↓
[Customer ready for lead capture?]
   Yes → [Collect name + phone → CRM → Jirawat handoff]
   No  → [Leave door open; provide Jirawat's contact]
```

**Detailed Thai conversation examples are in `Examples.md`.**
