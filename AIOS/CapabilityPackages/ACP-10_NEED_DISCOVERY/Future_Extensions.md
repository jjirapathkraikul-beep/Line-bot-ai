# Future Extensions — NEED_DISCOVERY

**Document ID**: AIOS-ACP-10-FUTURE  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Planned v1.1 Improvements

### FE-10-01: Life Event Auto-Detection
Currently: Life event signals must be explicitly stated by customer ("เพิ่งแต่งงาน").  
Target: NLP pattern to detect life event signals from implicit statements ("ลูกกำลังจะเกิด", "เพิ่งได้งานใหม่").  
Value: Reduces turns needed for discovery.

### FE-10-02: Profile Continuity Across Sessions
Currently: Discovery starts fresh each session.  
Target: Carry known profile facts (life stage, existing coverage) from previous sessions via CRM lookup.  
Value: Returning customers do not need to repeat discovery context.

### FE-10-03: Seasonal Context Awareness
Currently: Discovery ignores time of year.  
Target: In October–December, prioritize tax deduction discovery (customers often want year-end insurance for tax purposes).  
Value: Contextually relevant discovery reduces turns to recommendation.

### FE-10-04: Occupational Discovery
Currently: Occupation is not captured during need discovery.  
Target: Add occupation as an optional discovery field for self-employed and high-risk occupation detection.  
Value: Occupation affects underwriting eligibility for some products.

---

## Known Gaps

| Gap | Impact | Priority |
|---|---|---|
| No detection of customer who has already completed discovery in previous session | Customer repeats discovery journey unnecessarily | HIGH |
| No family profile capture (only primary customer) | Cannot recommend family products accurately | MEDIUM |
| No financial goal alignment (saving vs. protection vs. tax) as explicit discovery dimension | Recommendations may miss primary motivation | MEDIUM |

---

## Integration Opportunities

- **CRM Integration**: Pre-populate known profile fields before discovery begins
- **LINE Rich Menu**: Discovery journey could be partially pre-completed by rich menu selections before entering chat
- **Learning Layer**: Discovery pattern data feeds improvement proposals for better question sequences

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
