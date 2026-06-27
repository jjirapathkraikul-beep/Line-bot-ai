---
Document ID: ACP-04-FUTURE-EXTENSIONS
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# ACP-04 Future Extensions

---

## Planned v1.1 Improvements

| Enhancement                          | Description                                                                                       | Priority |
|--------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Common Condition Quick Reference     | Reference guide (not for customer-facing display) mapping common conditions to typical underwriting approaches | High |
| Pre-Assessment Questionnaire         | Structured data collection form to pass complete medical context to Jirawat after ACP-04          | High     |
| Underwriting Outcome Types Explainer | Explain the four possible outcomes (approval / exclusion / loading / postponement) when customer asks | Medium |
| Condition Severity Classifier        | Classify disclosed conditions as mild/moderate/severe to triage Jirawat's review priority        | Medium   |

---

## Planned v1.2 Improvements

| Enhancement                          | Description                                                                                       | Priority |
|--------------------------------------|---------------------------------------------------------------------------------------------------|----------|
| Multi-Condition Parallel Tracking    | Track multiple conditions simultaneously; intelligently sequence follow-up questions across turns | Medium   |
| Medication Cross-Reference           | Understand medication names to infer condition severity (e.g., insulin vs. oral medication)       | Low      |
| Waiting Period Calculator for Conditions | Show how waiting periods apply to coverage of specific conditions                             | Low      |

---

## Known Gaps in v1.0

| Gap                                              | Impact                                                            | Planned Fix |
|--------------------------------------------------|-------------------------------------------------------------------|-------------|
| No condition-specific underwriting guidance      | AI cannot explain what typically happens for common conditions    | v1.1        |
| No structured handoff form for Jirawat           | Medical context passed in free text only                          | v1.1        |
| Multi-condition prioritization is manual         | AI does not intelligently prioritize which condition to ask about first | v1.1   |
| No explanation of underwriting outcome types     | Customers don't know what "exclusion" or "loading" means          | v1.1        |

---

## Integration Opportunities

| Integration                                   | Value                                                             | Dependency               |
|-----------------------------------------------|-------------------------------------------------------------------|--------------------------|
| Underwriting pre-screen API                   | Real-time triage signal for Jirawat (high/medium/low complexity) | Underwriting API         |
| CRM auto-flagging for Jirawat review          | Jirawat receives immediate alert when medical case lead captured  | CRM connector + alerts   |
| Medical condition knowledge base update       | Keep common condition handling up to date with product changes    | Product team maintenance |

---

## Notes
- The pre-assessment questionnaire (v1.1) is the most impactful improvement — it eliminates information re-collection by Jirawat during follow-up calls
- Condition severity classification would allow ACP-04 to set appropriate customer expectations without violating restriction H1/H2
