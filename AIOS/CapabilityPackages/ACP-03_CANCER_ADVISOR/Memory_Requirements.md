---
Document ID: ACP-03-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-03 Memory Requirements

---

## Required Memory (Must Check Before Responding)

| Field                             | Source          | Purpose                                                     |
|-----------------------------------|-----------------|-------------------------------------------------------------|
| `customer.age`                    | CRM / session   | Required before any premium context                         |
| `customer.cancer_history`         | Session memory  | Check for personal cancer history before coverage guidance  |
| `session.emotional_state`         | Emotion engine  | Determine if empathy-first response is required             |
| `trust.signal_detected`           | Trust Engine    | Suspend lead capture if active                              |
| `session.education_turn_count`    | Session memory  | Ensure education before lead capture                        |

---

## Optional Memory

| Field                              | Source      | Usage if Available                                         |
|------------------------------------|-------------|-------------------------------------------------------------|
| `customer.family_cancer_history`   | Session     | Adjust empathy level; offer information more sensitively   |
| `customer.name`                    | CRM         | Personalize responses                                      |
| `customer.existing_cancer_coverage`| CRM         | Identify gap or overlap                                    |

---

## Working Memory (Maintained During ACP-03 Execution)

| Field                                  | Type      | Description                                                |
|----------------------------------------|-----------|------------------------------------------------------------|
| `cancer.emotional_state`               | Enum      | NEUTRAL / FEARFUL / GRIEVING / ANXIOUS                     |
| `cancer.intent_subtype`                | Enum      | LUMP_SUM / STAGES / WAITING_PERIOD / PREMIUM / GENERAL     |
| `cancer.education_topics_covered`      | List      | Tracks which concepts have been explained                  |
| `cancer.personal_history_flagged`      | Boolean   | Personal cancer history disclosed                          |
| `cancer.family_history_flagged`        | Boolean   | Family cancer history mentioned                            |
| `cancer.lead_eligible`                 | Boolean   | TRUE after education turn, no trust signal, not in grief   |
| `cancer.lead_captured`                 | Boolean   | Whether lead has been captured                             |

---

## Customer Profile Fields

| Field                          | Action     | Notes                                                      |
|--------------------------------|------------|------------------------------------------------------------|
| `customer.age`                 | READ/WRITE | Capture if not known; required for premium context         |
| `customer.cancer_history`      | READ       | Never proactively ask; only record if volunteered          |
| `customer.family_cancer_history`| READ      | Never proactively ask; only record if volunteered          |
| `customer.name`                | READ       | Use if available; never re-ask                             |
| `customer.phone`               | READ/WRITE | Capture only at lead stage                                 |

---

## CRM Fields Written on Completion

| Field                              | Value Written                         | Condition                           |
|------------------------------------|---------------------------------------|-------------------------------------|
| `crm.cancer_interest_confirmed`    | TRUE                                  | Always on ACP-03 completion         |
| `crm.cancer_emotional_state`       | Enum value from working memory        | Always                              |
| `crm.cancer_history_flagged`       | TRUE / FALSE                          | Always                              |
| `crm.family_cancer_flagged`        | TRUE / FALSE                          | Always                              |
| `crm.cancer_lead_captured`         | TRUE / FALSE                          | Always                              |
| `crm.cancer_education_topics`      | List of topics covered                | Always                              |

---

## Conversation Summary Written on Exit

```
Customer inquired about cancer insurance (ประกันมะเร็ง).
Emotional state detected: [NEUTRAL/FEARFUL/GRIEVING/ANXIOUS].
Topics covered: [lump sum / stages / waiting period / premium].
Personal cancer history disclosed: [TRUE/FALSE].
Family cancer history mentioned: [TRUE/FALSE].
Lead captured: [TRUE/FALSE].
Routing: [ACP-04 triggered: TRUE/FALSE].
```

---

## Known Facts (Protected)

| Field                     | Protection Rule                                                         |
|---------------------------|-------------------------------------------------------------------------|
| Cancer history (personal) | Once disclosed, never ask again; treat with sensitivity in all future turns |
| Family cancer history     | Once disclosed, never ask for confirmation again                        |
| Customer age              | If captured this session, never re-ask                                  |

---

## Never Ask Again Fields

- Customer age (once provided)
- Cancer history (never proactively ask; only note if volunteered)
- Family cancer history (never proactively ask)
- Phone number (once captured)
- Customer name (once captured or in CRM)
