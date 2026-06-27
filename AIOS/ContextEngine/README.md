# AIOS Context Engine (ACE)

**Layer**: ACE — AI Context Engine  
**Position**: Orchestration kernel between AEE and LLM  
**Version**: 1.0  
**Status**: Active  
**Last Updated**: 2026-06-27

---

## What Is ACE?

The AI Context Engine (ACE) is the **context orchestration kernel** of AIOS.

ACE receives a selected Capability Package from the AI Execution Engine, then assembles, compresses, and validates the exact `ExecutionContext` that is sent to the LLM.

**ACE is NOT**:
- A prompt
- A knowledge base
- A chatbot flow
- A product database
- A channel adapter

**ACE IS**:
- The layer that decides WHAT information the LLM receives
- The layer that ensures decision-critical facts are always present
- The layer that enforces restrictions before LLM call
- The layer that compresses large context into a usable window

---

## Architecture Position

```
Customer Message
      ↓
Application Adapter (LINE, Web, etc.)
      ↓
AI Execution Engine (AEE)
      ↓
ACP Selection
      ↓
ACE ← THIS LAYER
  ├── Context Assembly Pipeline
  ├── Knowledge Resolution
  ├── Memory Resolution
  ├── Compression
  └── Validation
      ↓
ExecutionContext
      ↓
LLM (Claude / OpenAI)
      ↓
Response Validator
      ↓
Application Adapter
```

---

## Document Map

| # | Document | Purpose |
|---|---|---|
| README.md | This file | Layer overview |
| 01 | CONTEXT_ENGINE_OVERVIEW | What ACE is and why it exists |
| 02 | EXECUTION_CONTEXT_SCHEMA | Canonical schema for ExecutionContext |
| 03 | CONTEXT_ASSEMBLY_PIPELINE | 15-step pipeline for building context |
| 04 | CONTEXT_SOURCE_REGISTRY | All sources ACE may read from |
| 05 | CONTEXT_SELECTION_RULES | What to include and exclude |
| 06 | CONTEXT_COMPRESSION_RULES | How to fit context into LLM window |
| 07 | MEMORY_RESOLUTION | Memory layers and selection rules |
| 08 | KNOWLEDGE_RESOLUTION | Knowledge selection by intent |
| 09 | CAPABILITY_CONTEXT | How ACP feeds into context |
| 10 | CONVERSATION_DATASET_CONTEXT | How ConversationDataset feeds into context |
| 11 | DECISION_CONTEXT | How decision rules are represented |
| 12 | RESPONSE_CONTEXT | How response profile is built |
| 13 | CONTEXT_VALIDATION | Pre-LLM validation rules |
| 14 | CONTEXT_FAILURE_HANDLING | Fallback behavior |
| 15 | CONTEXT_EXAMPLES | Full ExecutionContext examples |

---

## Architecture Boundary

ACE does NOT own:
- Business knowledge (Domain)
- Sales rules (ACP)
- Trust rules (ACP-08)
- Medical rules (ACP-04)
- Channel rendering (Application Adapter)
- Webhook/API logic (Application layer)
- LLM API calls (AEE)

ACE ONLY:
- Selects from available sources
- Assembles selected fragments
- Compresses to fit LLM window
- Validates completeness and safety
- Produces `ExecutionContext`

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-27 | Initial release |
