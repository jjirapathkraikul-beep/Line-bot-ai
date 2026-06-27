# Future Extensions — EDGE_CASE_HANDLER

**Document ID**: AIOS-ACP-20-FUTURE  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## Planned v1.1 Improvements

### FE-20-01: EC-11: Elderly Customer Scenario
Currently: No dedicated handling for elderly customers (70+) who have limited product eligibility.  
Target: Detect age signals and explain eligibility constraints empathetically before product discussion.  
Value: Prevents frustration when products are not available for age group.

### FE-20-02: EC-12: OFW / Overseas Customer
Currently: Overseas customers are treated as standard customers.  
Target: Detect overseas residency signal; explain that Thai insurance typically requires Thai residency; route to Jirawat for exceptions.  
Value: Reduces false expectations for non-eligible customers.

### FE-20-03: Confidence Scoring for Edge Case Detection
Currently: Edge cases are detected by keyword pattern matching.  
Target: Confidence-scored detection with fallback to standard capability if edge case signal is weak.  
Value: Reduces false positive edge case activations for ambiguous messages.

### FE-20-04: EC-13: Corporate / Group Insurance Inquiry
Currently: No dedicated corporate handling.  
Target: Detect corporate/group insurance signals; route to specialized Jirawat consultation immediately.  
Value: Corporate leads are high-value; appropriate routing matters.

---

## Known Gaps

| Gap | Impact | Priority |
|---|---|---|
| No handling for customer who may have dependent with mental health crisis (not self) | May respond with wrong framing | HIGH |
| No EC for customer asking to record / screenshot the conversation | Privacy and consent | MEDIUM |
| No EC for customer asking about policy for non-Thai nationals | Could give wrong eligibility info | MEDIUM |

---

## Integration Opportunities

- **Crisis Support DB**: Integrate official Thai mental health crisis hotline reference (1323)
- **OIC Database**: When EC-05 (competitor comparison) triggers, link to OIC license lookup
- **Learning Layer**: Each resolved edge case should generate a learning proposal for improvement

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
