---
Document ID: ACP-04-MEMORY-REQUIREMENTS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Memory Requirements

---

## Required Memory (Must Check Before Responding)

| Field                               | Source          | Purpose                                                       |
|-------------------------------------|-----------------|---------------------------------------------------------------|
| `customer.health_conditions`        | Session memory  | List of all conditions already disclosed — never re-ask      |
| `customer.age`                      | CRM / session   | Age context for underwriting                                  |
| `trust.signal_detected`             | Trust Engine    | Suspend lead capture if present                               |
| `session.medical_questions_asked`   | Session memory  | Track which follow-up questions have already been asked       |
| `session.education_turn_count`      | Session memory  | Ensure medical context established before lead capture        |

---

## Optional Memory

| Field                               | Source      | Usage if Available                                          |
|-------------------------------------|-------------|-------------------------------------------------------------|
| `customer.name`                     | CRM         | Personalize responses                                       |
| `customer.medications`              | Session     | Contextual guidance (e.g., insulin-dependent diabetes)      |
| `customer.smoking_status`           | Session     | Relevant underwriting factor if volunteered                 |
| `customer.bmi_range`                | Session     | Relevant for certain conditions if volunteered              |

---

## Working Memory (Maintained During ACP-04 Execution)

| Field                                    | Type      | Description                                              |
|------------------------------------------|-----------|----------------------------------------------------------|
| `medical.conditions_disclosed`           | List      | All conditions mentioned by customer in this session     |
| `medical.conditions_assessed`            | List      | Conditions for which follow-up question was asked        |
| `medical.conditions_pending`             | List      | Conditions disclosed but not yet followed up on          |
| `medical.underwriting_context_ready`     | Boolean   | TRUE when all major conditions have been followed up     |
| `medical.lead_eligible`                  | Boolean   | TRUE when context ready, no trust signal, customer ready |
| `medical.lead_captured`                  | Boolean   | Whether lead was captured this session                   |
| `medical.follow_up_turn_count`           | Integer   | Number of medical follow-up turns completed              |

---

## Customer Profile Fields

| Field                         | Action      | Notes                                                        |
|-------------------------------|-------------|--------------------------------------------------------------|
| `customer.health_conditions`  | READ/WRITE  | Record all disclosed conditions; never ask about same twice  |
| `customer.age`                | READ        | Use if known; ask if needed for context                      |
| `customer.name`               | READ        | Use if available; never re-ask                               |
| `customer.phone`              | READ/WRITE  | Collect only after medical context established               |
| `customer.medications`        | WRITE only  | Record if volunteered; never ask for medication list         |

---

## CRM Fields Written on Completion

| Field                                 | Value Written                          | Condition                               |
|---------------------------------------|----------------------------------------|-----------------------------------------|
| `crm.medical_conditions_list`         | All disclosed conditions               | Always — critical for Jirawat's review  |
| `crm.medical_context_established`     | TRUE / FALSE                           | Always                                  |
| `crm.medical_questions_asked`         | List of follow-up questions asked      | Always                                  |
| `crm.medical_lead_captured`           | TRUE / FALSE                           | Always                                  |
| `crm.jirawat_review_required`         | TRUE                                   | Always (medical cases need human review)|

---

## Conversation Summary Written on Exit

```
Customer disclosed pre-existing condition(s): [list].
Medical follow-up questions asked: [list].
Medical context established: [TRUE/FALSE].
Jirawat review required: TRUE.
Lead captured: [TRUE/FALSE].
Trust signal during session: [TRUE/FALSE].
```

---

## Known Facts (Protected)

| Field                     | Protection Rule                                                           |
|---------------------------|---------------------------------------------------------------------------|
| Disclosed conditions      | Once disclosed, never ask for the same information again                  |
| Medications (if shared)   | Record; never ask for confirmation or re-disclosure                       |
| Customer age              | Once provided, never re-ask                                               |
| Phone/name                | Once provided or in CRM, never re-ask                                     |

---

## Never Ask Again Fields

- Any health condition already disclosed in this session
- Customer age (once provided)
- Medication list (once shared)
- Phone number (once captured)
- Customer name (once captured or in CRM)

**Medical conditions are particularly sensitive — never force a customer to repeat their disclosure.**
