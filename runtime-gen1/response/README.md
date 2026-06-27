# Response Composer

**Sprint**: Phase 10.7  
**Status**: PLANNING

## Purpose

Takes the validated `ExecutionContext` and sends it to the LLM. Returns the LLM response as a structured `ExecutionOutput`.

## Responsibilities

- Format ExecutionContext as an LLM system prompt (implementation detail; not architecture)
- Call LLM via existing `lib/openai.ts` wrapper
- Parse LLM response into `Response[]`
- Enforce response_profile constraints (length, empathy level, question count)
- Apply prohibited phrase check on LLM output

## Files to Create (Phase 10.7)

```
runtime-gen1/response/
├── responseComposer.ts     ← ExecutionContext → LLM call → ExecutionOutput
├── contextSerializer.ts    ← ExecutionContext → LLM-consumable string format
├── responseParser.ts       ← LLM text → Response[] objects
└── responseValidator.ts    ← Post-LLM check: prohibited phrases, question count
```

## Critical Rules

- Never send raw `lead_profile.phone` to LLM (privacy)
- Response must contain at most ONE question (CP-02 enforcement)
- If LLM output contains a prohibited phrase: regenerate with stronger constraint
- If LLM output exceeds `response_profile.length` target: truncate at sentence boundary

## V1 vs Gen1 Prompt Approach

| V1 (frozen) | Gen1 |
|---|---|
| `buildSystemPrompt(faqs, message, leadData)` | `contextSerializer(executionContext)` |
| Static 112-line prompt | Dynamic from ACP + CID + knowledge excerpts |
| Same prompt for all intents | Different context per ACP capability |

## Source Spec

- `AIOS/ContextEngine/12_RESPONSE_CONTEXT.md`
- `AIOS/Execution/06_RESPONSE_COMPOSER.md`
