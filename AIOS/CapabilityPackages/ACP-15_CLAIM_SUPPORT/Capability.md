# Claim Support Capability

| Field | Value |
|---|---|
| Document ID | ACP-15-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-15  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Provide immediate, empathetic, and accurate guidance to customers navigating the insurance claim process — supporting them at a stressful moment without introducing any commercial activity.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Demonstrate Jirawat's commitment to being a true advisor at the moments that matter most. Excellent claim support leads to policy renewals, referrals, and long-term loyalty even from non-buying interactions.

---

## Customer Goal

Know exactly what to do to make their claim successfully, what documents to prepare, and who to contact — with minimal confusion and no delays.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-15-01 | claim_help | "อยากเคลมประกันครับ ต้องทำยังไง?" |
| INT-15-02 | จะเคลมยังไง | "จะเคลมยังไงครับ?" |
| INT-15-03 | claim_question | "เอกสารที่ต้องใช้คืออะไรบ้างครับ?" |
| INT-15-04 | claim_timeline | "ใช้เวลานานไหมกว่าจะได้เงิน?" |
| INT-15-05 | claim_contact | "ต้องติดต่อใครเพื่อเคลมครับ?" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Stressed / anxious | Acknowledge stress immediately; lead with empathy |
| Confused about process | Simplify step-by-step |
| Frustrated (prior claim difficulty) | Validate frustration; do not promise outcomes |
| Urgent (needs claim now) | Prioritize immediate action steps |

---

## Conversation Dataset References

- **CID-14**: `AIOS/ConversationDataset/14_CLAIM.md`

---

## Knowledge Dependencies

- `AIOS/Domains/Insurance/Claim/` — claim process documentation, required documents, timelines
- `AIOS/Domains/Insurance/` — cashless vs. reimbursement claim types
- `AIOS/Trust/Trust_Engine.md` — trust state check

---

## Decision Rules (Summary)

1. Lead ALWAYS with empathy acknowledgment in claim support context
2. Explain cashless vs. reimbursement distinction when relevant
3. Provide specific actionable steps, not general statements
4. NEVER estimate claim approval outcome
5. For complex/disputed claims → activate ACP-17 for Jirawat's personal support

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: trust state, customer's policy type if known
- Write: claim_support_session flag; claim_type_discussed
- NEVER write lead data during claim support

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

**ABSOLUTELY PROHIBITED**: No lead data collection whatsoever during a claim support session. The customer is in a support context; commercial activity is inappropriate and harmful to trust.

---

## Trust Policy

Trust concern from Trust Engine immediately suspends ACP-15. ACP-08 takes control.

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer describes a disputed or complex claim | Activate ACP-17 for Jirawat's direct support |
| Claim involves a hospital emergency currently in progress | Activate ACP-16 for hospital guidance |
| Trust concern detected | Activate ACP-08 |

---

## Response Style (Summary)

- Empathy first, always
- Clear, numbered steps where applicable
- No commercial language in claim context

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER estimate claim approval outcomes
- NEVER say "จะได้เงินแน่นอนครับ"
- NEVER collect lead data
- NEVER delay guidance for any commercial purpose

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| Customer's claim type is unknown | Ask ONE question (cashless or reimbursement? hospital or outpatient?) |
| Customer has complex multi-claim situation | Activate ACP-17; Jirawat handles directly |
| Customer's policy is from a different insurer | Acknowledge limitation; direct to their insurer's claim line; offer Jirawat for guidance |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Customer understands next steps | Customer acknowledges or confirms understanding |
| No commercial interruption of claim guidance | Zero instances of lead capture or product mentions during claim session |
| Empathy acknowledged in claim opening | 100% of claim sessions begin with empathy acknowledgment |

---

## Metrics

| Metric | Description |
|---|---|
| claim_guidance_completion_rate | % of claim sessions where guidance was fully provided |
| escalation_to_jirawat_rate | % of complex claims escalated to ACP-17 |
| commercial_interruption_count | Number of times lead capture was incorrectly activated during claim (should be zero) |

---

## Future Extensions (Summary)

- Claim status tracker integration
- Document checklist generator
- Direct claim notification to Jirawat

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
