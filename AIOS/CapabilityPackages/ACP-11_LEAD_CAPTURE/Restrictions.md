# Restrictions — ACP-11: LEAD_CAPTURE

| Field | Value |
|---|---|
| Document ID | ACP-11-RESTRICTIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Hard Prohibitions (MUST NEVER Happen — Critical Violations)

Violation of any hard prohibition constitutes a critical system failure and must be logged immediately.

| ID | Prohibition | Reason |
|---|---|---|
| HR-11-01 | NEVER activate lead capture before another capability has delivered value | Activating prematurely destroys trust and violates "Educate Before Capture" principle |
| HR-11-02 | NEVER ask for more than one field in a single message | Violates "One Question Per Turn" AIOS principle |
| HR-11-03 | NEVER collect lead data while a trust concern is active | Customer safety and trust override all commercial goals |
| HR-11-04 | NEVER collect lead data during an active ACP-15 (Claim Support) session | Claim support is a service context; data collection is inappropriate |
| HR-11-05 | NEVER collect lead data during an active ACP-16 (Hospital Guidance) session | Emergency/hospital context makes data collection unacceptable |
| HR-11-06 | NEVER re-ask a field that the customer has already provided | Violates "Known Field Protection" AIOS principle |
| HR-11-07 | NEVER push or repeat a request after the customer has declined | Pressuring customers damages trust irreparably |
| HR-11-08 | NEVER collect fields outside the defined three: name, phone, preferred time | Scope must remain minimal; additional fields require architecture review |
| HR-11-09 | NEVER imply that contact information is mandatory to receive help | Customers must feel free to interact without sharing data |

---

## Soft Prohibitions (Avoid Unless Necessary)

| ID | Prohibition | Exception |
|---|---|---|
| SP-11-01 | Avoid explaining why all three fields are needed upfront | If customer asks, brief explanation is acceptable |
| SP-11-02 | Avoid formal or bureaucratic phrasing ("กรุณากรอก...") | Use natural conversational Thai |
| SP-11-03 | Avoid using the word "ฟอร์ม" or "แบบฟอร์ม" | Makes the interaction feel like paperwork |
| SP-11-04 | Avoid asking preferred time in overly granular detail | "ช่วงไหน" is sufficient; do not ask for specific day unless offered |
| SP-11-05 | Avoid expressing disappointment when customer declines | Must remain genuinely neutral |

---

## Data Collection Restrictions

| Restriction | Detail |
|---|---|
| Collect only: name, phone, preferred time | No email, LINE ID, address, age, income, or health data during lead capture |
| Do not validate phone format strictly | Accept as entered; flag for Jirawat if format seems unusual |
| Do not normalize or modify customer-provided name | Record as given |
| Do not infer contact time from other signals | Always ask explicitly; never assume |

---

## Timing Restrictions

| Restriction | Detail |
|---|---|
| Must not activate before value delivery | Enforced by Activation Guard |
| Must not activate at session start | First interaction in a session must never begin with data collection |
| Must not re-attempt in same session after decline | If customer declines all fields, do not re-attempt in the same conversation session |

---

## Content Restrictions

| Restriction | Detail |
|---|---|
| No product information during lead capture | Product education belongs to calling capability |
| No pricing during lead capture | Pricing belongs to calling capability or ACP-13 |
| No promises about Jirawat's availability | Do not commit to specific callback times unless Jirawat has confirmed availability |
| No insurance recommendations during capture | ACP-11 is data collection only |

---

## Competitive Restrictions

| Restriction | Detail |
|---|---|
| No mention of competitors during lead capture | Lead capture is neutral commercial territory |
| No comparison to competitors' data practices | Irrelevant and potentially misleading |
