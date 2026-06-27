---
Document ID: ACP-10-CAPABILITY
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# Need Discovery Capability

**Capability ID**: ACP-10
**Version**: 1.0
**Status**: Active

---

## Purpose
Guide customers through a structured but conversational exploration of their insurance need, using a sequential discovery path: life stage → concern → budget → existing coverage → goal. One question per turn. No product pitching. No lead capture. Exit by routing to the appropriate advisory ACP.

---

## Owner
Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent, Thailand

---

## Business Goal
Qualify unstructured customer interest into a specific, identified need before routing to an advisory ACP, ensuring that advisory ACPs receive high-quality context and that customers receive personally relevant conversations.

---

## Customer Goal
Understand what type of insurance protection makes sense for them, without feeling overwhelmed by choices or pushed into a product before their need is understood.

---

## Supported Intents

| Intent Token          | Description                                                     |
|-----------------------|-----------------------------------------------------------------|
| `unclear_intent`      | Customer has no stated product interest                         |
| `ask_general_advice`  | Customer asks for general insurance advice                      |
| `ไม่รู้จะเริ่มยังไง`  | Explicit "don't know where to start" signal                     |
| `general_inquiry`     | Product-unspecified insurance interest                          |
| `all_products`        | Customer says they want to know about "all" insurance           |

---

## Supported Emotions

| Emotion               | Handling Approach                                                          |
|-----------------------|----------------------------------------------------------------------------|
| Overwhelmed           | Reassure; take it one step at a time; short responses                     |
| Curious               | Educational and exploratory; let the customer discover their own need     |
| Uncertain             | Patient; no judgment; one question at a time                              |
| Anxious               | Acknowledge anxiety; frame discovery as low-pressure exploration          |
| Trust Concern         | INTERRUPT immediately → ACP-08                                            |

---

## Conversation Dataset References
- **CID-10**: `AIOS/ConversationDataset/10_NEED_DISCOVERY.md`

---

## Knowledge Dependencies
- `AIOS/Domains/Insurance/FAQ.md` — general insurance overview for life stage anchoring
- `AIOS/Trust/Trust_Engine.md` — trust signal detection
- All advisory ACP routing targets (ACP-02 through ACP-07)

---

## Decision Rules (Summary)
- Activate on unclear or general intent
- NEVER start with a product pitch
- Follow discovery sequence: life stage → concern → budget → existing coverage → goal
- Ask ONE question per turn
- NEVER ask about budget before life stage and concern are known
- Lead capture is prohibited throughout ACP-10
- Route to advisory ACP after primary need identified

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)
- Read: session intent classification, any context from ACP-01
- Write: `life_stage`, `primary_concern`, `budget_range`, `existing_coverage`, `primary_need`
- CRM: pass all discovered context to the receiving advisory ACP

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy
**NO lead capture during Need Discovery.** Name and phone are collected only in the advisory ACP after substantive educational value is delivered. ACP-10 is a preparation phase, not a conversion phase.

---

## Trust Policy
Trust Engine always active. Trust signals trigger ACP-08 immediately.

---

## Escalation Rules

| Trigger                                  | Action                                           |
|------------------------------------------|--------------------------------------------------|
| Trust signal detected                    | → ACP-08 TRUST_ADVISOR (immediate)              |
| Customer reveals specific product intent | Exit ACP-10 early; route directly to that ACP   |
| Customer wants to speak to Jirawat       | Provide contact; offer to continue              |
| Customer overwhelmed after 4 turns       | Offer simple topic menu; let them choose         |

---

## Response Style (Summary)
- Tone: Warm, curious, patient, non-pressuring
- Length: Short to Medium (discovery questions are brief)
- Empathy: Medium to High (customer is uncertain)
- Language: Thai; conversational; no insurance jargon

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)
- NEVER start with a product pitch
- NEVER ask about budget before life stage and concern
- NEVER collect lead data during discovery
- NEVER ask multiple questions in one turn
- NEVER route to ACP-09 directly (advisory ACP first)

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode                              | Risk   | Mitigation                                        |
|-------------------------------------------|--------|---------------------------------------------------|
| Product pitch at start of discovery       | High   | Hard restriction H1                               |
| Budget before life stage                  | High   | Hard restriction H2 (sequence enforced)           |
| Lead capture during discovery             | High   | Lead policy enforced                              |
| Multiple questions per turn               | Medium | One-question-per-turn rule                        |
| Direct route to ACP-09 without advisory   | High   | ACP-09 requires age + goal + context — ACP-10 provides context; advisory ACP provides education |

---

## Success Criteria
1. Primary need identified within 4-5 turns
2. Life stage, concern, and at least one of (budget/existing coverage) captured
3. Customer routed to appropriate advisory ACP
4. Zero product pitches during discovery
5. Zero lead capture during discovery
6. Customer feels they were listened to (not interrogated)

---

## Regression Tests (Summary)
6 test cases: general inquiry entry, budget-before-life-stage violation check, trust signal, specific product pivot, multi-turn discovery completion, early exit on product mention.

Full test cases: see `Regression.md`

---

## Metrics

| Metric                                     | Target    |
|--------------------------------------------|-----------|
| Primary need identification rate           | ≥ 90%     |
| Product pitch violation rate               | 0%        |
| Budget-before-life-stage violation         | 0%        |
| Lead capture during discovery              | 0%        |
| Average turns to need identification       | ≤ 5       |

---

## Future Extensions (Summary)
- Life stage recognition from conversational cues (not explicit question)
- Need Discovery summary card for Jirawat
- Multi-need prioritization logic

Full roadmap: see `Future_Extensions.md`

---

## Version History

| Version | Date       | Author   | Notes           |
|---------|------------|----------|-----------------|
| 1.0     | 2026-06-27 | Jirawat  | Initial release |
