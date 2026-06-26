# AI Execution Engine (AEE)
### AIOS Layer 3 — The Thinking Layer
**Version:** 1.0
**Effective Date:** 2026-06-26
**Status:** Active
**Authority:** Chief AI System Architect

---

## What This Is

The AI Execution Engine (AEE) is the cognitive core of AIOS. It is the layer that defines **how AI thinks** — not how LINE works, not how OpenAI works, not how prompts are assembled.

It is the processing pipeline that every AI application built on AIOS must use. The LINE Chatbot uses it. A future Facebook AI uses it. A voice AI uses it. A CRM Copilot uses it. All of them execute through the same engine.

The AEE is channel-agnostic, technology-agnostic, and provider-agnostic.

---

## Where It Sits in AIOS

```
Layer 0  ─────  Vision + Principles          (frozen)
Layer 1  ─────  General Intelligence         (frozen)
Layer 2  ─────  Domain Knowledge             (frozen)
Layer 3  ─────  AI Execution Engine          ← this folder
Layer 4  ─────  Application Adapters         (LINE, Facebook, Voice...)
```

Applications do not execute independently. They feed normalized inputs into the AEE and render normalized outputs from it. The AEE never knows which application is calling it.

---

## Documents in This Folder

| # | Document | What It Defines |
|---|---|---|
| 01 | [01_EXECUTION_OVERVIEW.md](01_EXECUTION_OVERVIEW.md) | End-to-end execution flow with diagram |
| 02 | [02_EXECUTION_PIPELINE.md](02_EXECUTION_PIPELINE.md) | Every step in the pipeline with full specifications |
| 03 | [03_CAPABILITY_LOADER.md](03_CAPABILITY_LOADER.md) | How capabilities are dynamically selected and loaded |
| 04 | [04_KNOWLEDGE_RESOLVER.md](04_KNOWLEDGE_RESOLVER.md) | How domain knowledge is selected and resolved |
| 05 | [05_DECISION_PIPELINE.md](05_DECISION_PIPELINE.md) | How the engine decides the next action |
| 06 | [06_RESPONSE_COMPOSER.md](06_RESPONSE_COMPOSER.md) | How responses are structured and expressed |
| 07 | [07_MEMORY_ENGINE.md](07_MEMORY_ENGINE.md) | How memory works across time horizons |
| 08 | [08_ANALYTICS_ENGINE.md](08_ANALYTICS_ENGINE.md) | What is measured and why |
| 09 | [09_EXECUTION_CONTRACT.md](09_EXECUTION_CONTRACT.md) | Formal interface definitions for all integrations |
| 10 | [10_EXECUTION_SEQUENCE.md](10_EXECUTION_SEQUENCE.md) | Sequence diagrams for key scenarios |

---

## What the AEE Does NOT Own

The following are Application concerns — they are never referenced inside `AIOS/Execution/`:

- LINE API, LINE Messaging SDK, LINE webhooks
- Facebook Messenger, Meta APIs
- OpenAI API, GPT models, prompt engineering
- Google Sheets, Apps Script, Vercel KV
- Session persistence implementation
- Channel-specific message formats (Flex Message, Carousel, etc.)

These belong to Layer 4 Application Adapters.

---

## Key Design Principles

1. **Channel neutrality** — The engine receives normalized input. It does not know or care what channel produced it.
2. **Deterministic decisions** — Given the same context, the Decision Pipeline always produces the same action.
3. **Capability composition** — The engine dynamically selects and composes capabilities. It does not hardcode behavior paths.
4. **Memory separation** — Working memory, session memory, and long-term memory are distinct layers with different TTLs and ownership.
5. **Observable by design** — Every step emits analytics events. Nothing happens silently.

---

## Reading Order

For a new contributor, read in this order:

1. `01_EXECUTION_OVERVIEW.md` — understand the big picture
2. `09_EXECUTION_CONTRACT.md` — understand the interfaces
3. `02_EXECUTION_PIPELINE.md` — understand each step
4. `10_EXECUTION_SEQUENCE.md` — see it working on real scenarios
5. Remaining documents for depth on each subsystem

---

## Version History

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | 2026-06-26 | Chief AI System Architect | Initial creation — AIOS Phase 4 AI Execution Engine |
