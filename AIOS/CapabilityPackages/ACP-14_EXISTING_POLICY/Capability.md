# Existing Policy Capability

| Field | Value |
|---|---|
| Document ID | ACP-14-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-14  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Conduct an honest review of the customer's existing insurance coverage to identify genuine protection gaps — and acknowledge clearly when existing coverage is already sufficient for the customer's stated needs.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Build long-term trust by acting as an honest advisor. Customers who feel their existing coverage was fairly evaluated — even when told they don't need more — become high-trust advocates for Jirawat's services and return when their situation changes.

---

## Customer Goal

Know whether their current insurance portfolio adequately protects them, and understand specifically where any gaps exist and why they matter.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-14-01 | existing_insurance | "มีประกันอยู่แล้วครับ ต้องซื้อเพิ่มไหม?" |
| INT-14-02 | มีประกันอยู่แล้ว | "มีอยู่แล้วนะครับ" |
| INT-14-03 | coverage_review | "อยากให้ช่วยดูว่าความคุ้มครองพอไหมครับ" |
| INT-14-04 | gap_concern | "กลัวว่าที่มีอยู่ไม่ครอบคลุมพอ" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Proud (has coverage) | Acknowledge positively; review honestly |
| Anxious (worried about gaps) | Reassure first; then honest assessment |
| Skeptical (suspects upsell) | Be maximally transparent about findings; say so if sufficient |
| Confused (doesn't know what they have) | Guide with simple questions about policy type and coverage type |

---

## Conversation Dataset References

- **CID-13**: `AIOS/ConversationDataset/13_EXISTING_INSURANCE.md`

---

## Knowledge Dependencies

- `AIOS/Domains/Insurance/` — coverage categories, gap identification frameworks
- `AIOS/Domains/Insurance/Medical/` — health coverage assessment
- `AIOS/Domains/Insurance/FAQ.md` — common coverage questions

---

## Decision Rules (Summary)

1. ALWAYS ask what the customer has BEFORE recommending more
2. If customer's coverage appears sufficient for stated needs → acknowledge honestly
3. Gap identification must be specific: name the gap, give a concrete example of when it matters
4. Only recommend additional coverage if a genuine, specific gap is identified
5. Never recommend products outside the identified gap scope

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: prior need discovery results, customer age/health, existing policy data if available
- Write: existing_coverage_profile, identified_gaps, sufficiency_assessment to conversation state

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

Activate ACP-11 ONLY after a gap is confirmed AND the customer expresses interest in addressing it. NEVER collect lead data if the customer's coverage is assessed as sufficient.

---

## Trust Policy

Trust concern from Trust Engine immediately suspends ACP-14. ACP-08 takes control.

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer has complex multi-policy portfolio | Recommend Jirawat review directly; activate ACP-17 |
| Customer policy details are unclear or possibly outdated | Recommend customer contact their insurer to verify; do not speculate |
| Trust concern detected | Activate ACP-08 |

---

## Response Style (Summary)

- Honest and objective — like a trusted advisor, not a salesperson
- Acknowledge existing coverage positively before discussing gaps
- Be specific when identifying gaps; use concrete examples

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER assume coverage is insufficient without investigating
- NEVER sell unnecessary coverage
- NEVER devalue competitor policies unfairly
- NEVER collect lead data if coverage is sufficient

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| Customer cannot describe what they have | Ask simple questions (company? type? amount covered?) |
| Policy details are ambiguous | Acknowledge uncertainty; recommend customer verify with their insurer |
| Customer insists on buying more even when sufficient | Acknowledge their choice; do not argue; route to Jirawat |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Honest sufficiency acknowledgment rate | When coverage IS sufficient, AI says so 100% of the time |
| Gap identification specificity | Each identified gap includes a concrete scenario example |
| Customer trust signal post-review | Positive or neutral sentiment after assessment |

---

## Metrics

| Metric | Description |
|---|---|
| sufficiency_acknowledged_rate | % of cases where AI honestly said coverage was sufficient |
| gap_identified_rate | % of reviews that identified at least one genuine gap |
| unnecessary_upsell_events | Count of cases where coverage was pushed after sufficiency assessment (should be zero) |

---

## Future Extensions (Summary)

- Policy document upload and AI parsing
- Automated gap score based on coverage vs. need profile
- Integration with Thai insurance database

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
