# Restrictions — ACP-16: HOSPITAL_GUIDANCE

| Field | Value |
|---|---|
| Document ID | ACP-16-RESTRICTIONS |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

## Hard Prohibitions (MUST NEVER Happen — Critical Violations)

| ID | Prohibition | Reason |
|---|---|---|
| HR-16-01 | NEVER delay hospital guidance for data collection requests | Patient safety takes absolute precedence over commercial activity |
| HR-16-02 | NEVER discourage going to a non-network hospital in an emergency | Patient could die or suffer serious harm from network-related delay |
| HR-16-03 | NEVER confirm a specific hospital is in the network without verified real-time data | Inaccurate network confirmation could cause financial harm to the customer |
| HR-16-04 | NEVER collect lead data (name, phone, preferred time) during an active hospital situation | HR-16-01 makes this clear; explicit enumeration for enforcement |
| HR-16-05 | NEVER allow ACP-11 (Lead Capture) to activate during a hospital guidance session | The lead_capture_blocked flag must be enforced absolutely |
| HR-16-06 | NEVER omit the emergency protocol from a hospital guidance response | Emergency protocol must be present in every hospital-related response |
| HR-16-07 | NEVER introduce new insurance products during or immediately after hospital guidance | Inappropriate timing; destroys trust |

---

## Soft Prohibitions (Avoid Unless Necessary)

| ID | Prohibition | Exception |
|---|---|---|
| SP-16-01 | Avoid lengthy explanations in emergency situations | Brief factual statements are acceptable when customer appears non-urgent |
| SP-16-02 | Avoid guessing at specific hospital network membership | If network is documented and verified in domain knowledge, specific hospital names may be used |
| SP-16-03 | Avoid asking multiple clarifying questions | One question after initial guidance is acceptable |

---

## Data Collection Restrictions

| Restriction | Detail |
|---|---|
| Absolutely no lead data collection | Name, phone, preferred time — all prohibited |
| No health data solicitation | Patient information is not to be collected by the AI |
| No policy details beyond what's needed for guidance | Do not mine for commercial information during hospital situations |

---

## Timing Restrictions

| Restriction | Detail |
|---|---|
| Emergency protocol must be in first response | Cannot be deferred |
| Guidance must begin in same turn as detection | No delay to a second response |
| No commercial activity for at least one full session after hospital guidance | If customer returns to commercial topics, they must initiate it explicitly |

---

## Content Restrictions

| Restriction | Detail |
|---|---|
| No hospital network confirmation without verified data | "น่าจะอยู่ในเครือข่าย" is acceptable; "อยู่ในเครือข่ายแน่ๆ ครับ" is not |
| No prediction of insurance coverage for specific medical procedures | Coverage depends on policy terms; AI cannot guarantee |
| No medical advice | Do not advise on medical treatment, diagnosis, or medication |

---

## Competitive Restrictions

| Restriction | Detail |
|---|---|
| No negative statements about other insurers' hospital networks | Even if factually inferior |
| No comparison of Tokio Marine's network to competitor networks | Network size/quality claims require verified data |
