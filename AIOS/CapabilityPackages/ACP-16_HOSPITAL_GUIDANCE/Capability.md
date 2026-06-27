# Hospital Guidance Capability

| Field | Value |
|---|---|
| Document ID | ACP-16-CAPABILITY |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-06-27 |

---

**Capability ID**: ACP-16  
**Version**: 1.0  
**Status**: Active

---

## Purpose

Provide immediate, actionable guidance for customers navigating hospital visits — with zero delay for data collection or sales activity — and always communicate the emergency protocol clearly.

---

## Owner

Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent

---

## Business Goal

Be genuinely useful at the most critical moments of a customer's life. Customers who receive excellent support during health crises become lifetime advocates.

---

## Customer Goal

Know exactly what to do when they need to go to the hospital — which hospital to go to, what to say, what to bring, and what happens with their insurance — immediately, without friction.

---

## Supported Intents

| Intent ID | Intent Name | Example |
|---|---|---|
| INT-16-01 | hospital_question | "โรงพยาบาลไหนเข้าได้บ้างครับ?" |
| INT-16-02 | โรงพยาบาลไหนเข้าได้ | "มีโรงพยาบาลในเครือข่ายแถวบ้านไหมครับ?" |
| INT-16-03 | in_hospital | "อยู่โรงพยาบาลอยู่ครับ ต้องทำอะไร?" |
| INT-16-04 | admission_procedure | "ต้องแจ้งโรงพยาบาลว่าอะไรบ้างครับ?" |
| INT-16-05 | emergency | "ฉุกเฉินครับ / กำลังไปโรงพยาบาลครับ" |

---

## Supported Emotions

| Emotion | Handling Strategy |
|---|---|
| Panicked (emergency) | Immediate calm reassurance + emergency protocol first |
| Anxious (planned visit) | Calm, clear step-by-step guidance |
| Confused (don't know process) | Simple numbered steps |
| Frustrated (network confusion) | Acknowledge; prioritize emergency protocol; clarify network second |

---

## Conversation Dataset References

- **CID-15**: `AIOS/ConversationDataset/15_HOSPITAL.md`

---

## Knowledge Dependencies

- `AIOS/Domains/Insurance/` — hospital network information, cashless admission process
- `AIOS/Domains/Insurance/Claim/` — emergency notification requirements
- `AIOS/Trust/Trust_Engine.md` — trust state check

---

## Decision Rules (Summary)

1. IMMEDIATE guidance — no gating questions before providing hospital guidance
2. ALWAYS communicate emergency protocol: nearest hospital first; notify within 24h
3. NEVER confirm specific hospital network without verified data
4. NEVER delay for data collection
5. Emergency signal = highest priority in entire AIOS system (excluding trust)

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)

- Read: trust state, policy type if known
- Write: hospital_guidance_active flag (blocks lead capture for session)
- NEVER write lead data

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy

**ABSOLUTELY PROHIBITED**: Lead data collection is completely prohibited during any active hospital situation. The `lead_capture_blocked` flag is set and enforced for the entire session.

---

## Trust Policy

Trust concern from Trust Engine can interrupt even ACP-16 at CRITICAL level — but ONLY after emergency guidance has been given. Emergency guidance takes absolute priority over all other states including trust investigation.

---

## Escalation Rules

| Condition | Action |
|---|---|
| Customer needs specific hospital in their area | Direct to Tokio Marine's hospital finder tool; offer Jirawat assistance |
| Customer is in an active emergency | Emergency protocol first; everything else second |
| Customer has claim questions post-hospital | Transition to ACP-15 after hospital situation is resolved |

---

## Response Style (Summary)

- Calm and immediate
- Numbered steps for clarity
- Emergency protocol always visible

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)

- NEVER delay guidance
- NEVER confirm specific hospitals without verified data
- NEVER collect any data during hospital situation
- NEVER discourage emergency hospital visits due to network concerns

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode | Recovery |
|---|---|
| Customer's specific hospital network unknown | Give general guidance; suggest calling Tokio Marine's line; do not guess |
| Customer in emergency with very short messages | Prioritize emergency protocol; assume emergency; do not slow down for clarification |

---

## Success Criteria

| Criterion | Target |
|---|---|
| Emergency protocol communicated | 100% of hospital sessions include emergency protocol |
| No data collection during hospital session | Zero lead capture events during ACP-16 sessions |
| Customer receives actionable guidance | Guidance includes at least 2-3 specific action steps |

---

## Metrics

| Metric | Description |
|---|---|
| emergency_protocol_communication_rate | % of hospital sessions where emergency protocol was stated |
| hospital_guidance_response_time | Speed of initial response (should be immediate) |
| lead_capture_blocked_count | Number of times ACP-11 was correctly blocked during ACP-16 |

---

## Future Extensions (Summary)

- Real-time hospital network lookup
- Emergency contact quick-dial integration
- Location-based network hospital finder

Full extensions: see `Future_Extensions.md`

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-27 | Architecture Team | Initial release |
