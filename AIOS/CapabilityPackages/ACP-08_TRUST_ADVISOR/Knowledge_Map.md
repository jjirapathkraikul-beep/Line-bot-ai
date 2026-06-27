---
Document ID: ACP-08-KNOWLEDGE-MAP
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-08 Knowledge Map

## NO-DUPLICATE DECLARATION
This file contains REFERENCES ONLY to knowledge stored in canonical AIOS knowledge paths. No knowledge content is duplicated here. All knowledge must be read from the referenced source files.

---

## Domain Knowledge References

| Reference Path                      | Usage in ACP-08                                                     |
|-------------------------------------|---------------------------------------------------------------------|
| `AIOS/Trust/Trust_Engine.md`        | Core trust signal patterns; verification credential data; OIC references |
| `AIOS/Domains/Insurance/FAQ.md`     | Legitimacy FAQ responses                                            |

---

## Conversation Dataset References

| Dataset ID | File Path                                        | Usage                                                            |
|------------|--------------------------------------------------|------------------------------------------------------------------|
| CID-08     | `AIOS/ConversationDataset/08_TRUST_AND_SCAM.md`  | Trust concern conversation patterns; ideal resolution examples   |

---

## Key Information Referenced (Not Duplicated Here)

| Information Item                       | Canonical Location              |
|----------------------------------------|---------------------------------|
| Jirawat's full name                    | `AIOS/Trust/Trust_Engine.md`    |
| Jirawat's insurance agent license ID  | `AIOS/Trust/Trust_Engine.md`    |
| Tokio Marine Thailand OIC registration | `AIOS/Trust/Trust_Engine.md`    |
| OIC website for verification           | `AIOS/Trust/Trust_Engine.md`    |
| Tokio Marine Thailand official website | `AIOS/Trust/Trust_Engine.md`    |
| Trust signal keyword list             | `AIOS/Trust/Trust_Engine.md`    |

---

## Learning Layer References

| Learning Source                              | Purpose                                                          |
|----------------------------------------------|------------------------------------------------------------------|
| `AIOS/Learning/Trust_Signal_Log.md`          | Emerging trust signal patterns; new scam-related keywords        |
| `AIOS/Learning/Trust_Resolution_Log.md`      | Resolution patterns that successfully restored customer trust    |

---

## Knowledge Dependency Graph

```
ACP-08_TRUST_ADVISOR
    ├── READS: AIOS/Trust/Trust_Engine.md                [primary — credential and signal data]
    ├── READS: AIOS/Domains/Insurance/FAQ.md             [legitimacy FAQ]
    └── READS: AIOS/ConversationDataset/08_TRUST_AND_SCAM.md
```

---

## Critical Note
ACP-08 is the ONLY capability that reads `AIOS/Trust/Trust_Engine.md` as its PRIMARY knowledge source (not just as a monitoring reference). This capability owns the trust resolution response. All other ACPs only read the Trust Engine for signal detection.
