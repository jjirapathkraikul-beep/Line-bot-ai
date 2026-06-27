---
Document ID: ACP-01-CAPABILITY
Version: 1.0
Status: Active
Last Updated: 2026-06-27
---

# Greeting Capability

**Capability ID**: ACP-01
**Version**: 1.0
**Status**: Active

---

## Purpose
Deliver a warm, professional first-contact experience that makes the customer feel welcomed and understood. Identify initial intent through a single, open-ended invitation — without assumptions, pitches, or data collection.

---

## Owner
Jirawat Jirapathkraikul — Tokio Marine Life Insurance Agent, Thailand

---

## Business Goal
Create a positive first impression that builds trust and encourages the customer to share their actual need, enabling accurate routing to the correct advisory capability.

---

## Customer Goal
Feel welcomed, understood, and safe to ask anything — without pressure to buy or to share personal information.

---

## Supported Intents

| Intent Token      | Description                                       |
|-------------------|---------------------------------------------------|
| `greeting`        | Any greeting word or phrase                       |
| `first_message`   | First message in a new conversation session       |
| `สวัสดี`          | Explicit Thai greeting (keyword match)            |
| `unclear_opening` | Message that opens conversation without topic     |

---

## Supported Emotions

| Emotion        | Handling Approach                                              |
|----------------|----------------------------------------------------------------|
| Neutral        | Warm, welcoming tone; invite them to share their interest      |
| Curious        | Acknowledge curiosity; invite them to ask anything             |
| Cautious       | Reassure that no data is needed to get answers                 |
| Anxious        | Empathize; emphasize that there is no pressure                 |
| Trust Concern  | INTERRUPT immediately → ACP-08 TRUST_ADVISOR                  |

---

## Conversation Dataset References
- **CID-01**: `AIOS/ConversationDataset/01_GREETING.md`

---

## Knowledge Dependencies
- `AIOS/Domains/Insurance/FAQ.md` — general FAQ for basic questions at greeting stage
- `AIOS/Trust/Trust_Engine.md` — trust signal detection rules (always active)

---

## Decision Rules (Summary)
- Activate on any greeting intent or session-start event
- Deliver one warm welcome message
- Ask ONE open-ended question: "มีอะไรให้ช่วยได้บ้างครับ?" or equivalent
- Detect intent from customer's reply and route accordingly
- If trust signal appears at any time → INTERRUPT to ACP-08

Full rules: see `Decision_Rules.md`

---

## Memory Requirements (Summary)
- Read: session_start flag, any prior greeting state
- Write: `intent_detected`, `conversation_start_timestamp`
- Never Ask Again: any field previously captured in this session

Full requirements: see `Memory_Requirements.md`

---

## Lead Policy
**NO lead capture during greeting.**
Name, phone, and any personal data collection is strictly prohibited until intent is discovered and value is delivered. Lead capture begins only after the customer has received a substantive answer in an advisory capability.

---

## Trust Policy
Trust signal detection is ALWAYS active. If any trust or fraud concern signal appears — even mid-greeting — immediately activate ACP-08 TRUST_ADVISOR. Do not complete the greeting sequence first.

---

## Escalation Rules

| Trigger                               | Action                                  |
|---------------------------------------|-----------------------------------------|
| Trust/fraud signal detected           | INTERRUPT → ACP-08 (immediate)          |
| Customer explicitly asks for Jirawat  | Provide contact info; offer to continue |
| Customer indicates emergency/urgency  | Acknowledge; fast-track to relevant ACP |
| Customer is confused after 2 turns    | Offer a simple menu of topics           |

---

## Response Style (Summary)
- Tone: Warm, friendly, non-pressuring
- Length: Short (2-4 sentences maximum)
- Empathy: Medium
- Language: Thai
- Questions per turn: Exactly one open-ended question

Full profile: see `Response_Profile.md`

---

## Restrictions (Summary)
- NEVER pitch a product in the greeting
- NEVER ask for name, phone, or personal data
- NEVER ask multiple questions
- NEVER assume the customer wants to buy

Full restrictions: see `Restrictions.md`

---

## Failure Modes

| Failure Mode                     | Risk   | Mitigation                                  |
|----------------------------------|--------|---------------------------------------------|
| Premature product pitch          | High   | Hard restriction; no product mention in ACP-01 |
| Data collection before value     | High   | Lead policy enforcement                     |
| Multiple questions at once       | Medium | One-question-per-turn rule                  |
| Missed trust signal              | High   | Trust Engine always active                  |
| Routing to wrong ACP             | Medium | Intent confirmation before routing          |

---

## Success Criteria
1. Customer feels welcomed (no complaints about pressure in first 2 turns)
2. Intent correctly identified from first customer reply (>90% accuracy)
3. Correct ACP activated based on intent
4. Zero data collection before intent discovery
5. Zero product pitches during greeting phase

---

## Regression Tests (Summary)
5 core test cases covering: basic greeting, unclear opening, trust signal at greeting, product inquiry trigger, and multi-topic opener.

Full test cases: see `Regression.md`

---

## Metrics

| Metric                          | Target   |
|---------------------------------|----------|
| Intent detection accuracy       | ≥ 90%    |
| Lead capture violations         | 0        |
| Product pitch violations        | 0        |
| Trust signal miss rate          | 0        |
| Average turns to intent clarity | ≤ 2      |

---

## Future Extensions (Summary)
- Returning customer recognition (personalized re-greeting)
- Time-of-day greeting variation
- Multi-language support (English greeting option)

Full roadmap: see `Future_Extensions.md`

---

## Version History

| Version | Date       | Author   | Notes           |
|---------|------------|----------|-----------------|
| 1.0     | 2026-06-27 | Jirawat  | Initial release |
