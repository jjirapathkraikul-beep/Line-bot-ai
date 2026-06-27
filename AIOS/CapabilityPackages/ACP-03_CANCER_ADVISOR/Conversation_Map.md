---
Document ID: ACP-03-CONVERSATION-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03 Conversation Map

---

## Entry Points

| Entry Trigger              | Source                    | Condition                                               |
|----------------------------|---------------------------|---------------------------------------------------------|
| `product_cancer` intent    | ACP-01 routing            | Customer expressed cancer insurance interest            |
| `ask_about_cancer` intent  | ACP-01 routing            | Customer asks about cancer coverage                     |
| `fear_cancer` trigger      | Emotion detection         | Customer expresses fear or mentions family cancer       |
| ACP-10 routing             | Need Discovery exit       | Cancer protection identified as primary concern         |
| ACP-02 cross-route         | ACP-02 mid-conversation   | Customer asks about cancer while in health discussion   |

---

## Exit Points

| Exit Type           | Condition                                            | Next State / ACP              |
|---------------------|------------------------------------------------------|-------------------------------|
| Success — Lead      | Lead captured after education                        | CRM write; Jirawat handoff    |
| Success — Informed  | Customer satisfied; not yet ready for lead           | Session open                  |
| Medical Redirect    | Customer discloses personal cancer history           | → ACP-04 MEDICAL_ADVISOR     |
| Trust Override      | Trust signal detected                                | → ACP-08 TRUST_ADVISOR       |
| Recommendation      | Customer ready for specific recommendation           | → ACP-09                     |

---

## Interrupt Rules

| Interrupt Trigger                      | Priority  | Action                                          |
|----------------------------------------|-----------|-------------------------------------------------|
| Trust/fraud signal                     | CRITICAL  | → ACP-08 immediately                           |
| Personal cancer diagnosis disclosed    | HIGH      | Empathy-first; pause all sales activity         |
| Family cancer history mentioned        | HIGH      | Empathy acknowledgment; then gently offer info  |
| Pre-existing cancer history mentioned  | HIGH      | → ACP-04 MEDICAL_ADVISOR                       |

---

## Resume Rules

| Scenario                                  | Resume Allowed | Conditions                                        |
|-------------------------------------------|---------------|---------------------------------------------------|
| After ACP-04 (medical) resolved           | Yes           | Resume with medical context; no re-pitch of lump sum |
| After ACP-08 (trust) resolved             | Yes           | Resume after 2-turn cooling period                |
| After emotional acknowledgment            | Yes           | Resume education only after customer re-engages   |
| Session timeout                           | No            | Restart from greeting                             |

---

## Composition Rules

| Position      | Capability                  | Condition                                               |
|---------------|-----------------------------|---------------------------------------------------------|
| BEFORE ACP-03 | ACP-01 GREETING             | Standard entry                                          |
| BEFORE ACP-03 | ACP-10 NEED_DISCOVERY       | Cancer concern identified through need exploration      |
| BEFORE ACP-03 | ACP-02 HEALTH_ADVISOR       | Customer pivots to cancer mid-health discussion         |
| DURING ACP-03 | ACP-04 MEDICAL_ADVISOR      | Cancer history triggers medical underwriting pathway    |
| DURING ACP-03 | ACP-08 TRUST_ADVISOR        | Always available interrupt                              |
| AFTER ACP-03  | ACP-09 RECOMMENDATION_ENGINE| Customer ready for specific product                     |

---

## Conversation Flow Summary

```
[ACP-03 activated]
        ↓
[Emotional signal check: grief / fear?]
   Yes → [Empathy acknowledgment FIRST → then offer information gently]
   No  ↓
[Answer cancer insurance question FIRST]
        ↓
[Explain coverage model (lump sum vs. treatment-based)]
        ↓
[Cancer history disclosed?]
   Yes → [→ ACP-04 MEDICAL_ADVISOR]
   No  ↓
[Ask ONE discovery question (age, family history awareness, or concern)]
        ↓
[Deliver coverage stage / waiting period explanation]
        ↓
[Customer ready for lead capture?]
   Yes → [Collect name + phone → CRM]
   No  → [Continue education]
```

**Detailed Thai conversation examples are in `Examples.md`.**
