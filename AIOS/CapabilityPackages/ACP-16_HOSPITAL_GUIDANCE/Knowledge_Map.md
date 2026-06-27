# Knowledge Map — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-KNOWLEDGE-MAP |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## NO-DUPLICATE DECLARATION

> This document references knowledge assets by path only. No knowledge content from any domain, dataset, or layer is duplicated or reproduced in this file or anywhere else in ACP-16. All knowledge remains authoritative at its source location.

---

## Domain Knowledge References

| Domain | Path | Usage in ACP-16 |
|---|---|---|
| Insurance Products | `AIOS/Domains/Insurance/` | Hospital network information; cashless admission requirements |
| Claim Process | `AIOS/Domains/Insurance/Claim/` | Emergency notification requirements (24h notification rule) |
| Insurance FAQ | `AIOS/Domains/Insurance/FAQ.md` | Common hospital/network questions |
| Trust Engine | `AIOS/Trust/Trust_Engine.md` | Trust state check (can interrupt after emergency guidance) |

---

## Conversation Dataset References

| CID | Path | Relevance |
|---|---|---|
| CID-15 | `AIOS/ConversationDataset/15_HOSPITAL.md` | Hospital guidance conversation patterns, emergency protocol scripts, admission procedure guidance, network hospital navigation |

---

## Learning Layer References

| Layer | Path | Purpose |
|---|---|---|
| Customer Profile | `AIOS/Memory/CustomerProfile/` | Policy type if known; directs to relevant network |
| Conversation State | `AIOS/Memory/ConversationState/` | Write: hospital_guidance_active, lead_capture_blocked |

---

## Data Flow

```
Hospital intent detected (any severity)
         |
         v
ACP-16 HOSPITAL_GUIDANCE
   |
   |-- reads --> AIOS/Domains/Insurance/ (network info)
   |-- reads --> AIOS/Domains/Insurance/Claim/ (24h notification rule)
   |-- reads --> Trust Engine (trust state)
   |-- writes --> ConversationState (hospital_guidance_active = true)
   |-- writes --> ConversationState (lead_capture_blocked = true)
   |
   |-- blocks --> ACP-11 (Lead Capture — absolutely prohibited)
   |
   v
Post-hospital → ACP-15 (Claim Support)
Complex navigation → ACP-17 (Jirawat)
```
