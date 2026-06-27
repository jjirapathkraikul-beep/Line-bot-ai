# Context Engine (ACE)

**Sprint**: Phase 10.6  
**Status**: PLANNING

## Purpose

Assembles the complete `ExecutionContext` sent to the LLM. Implements the 15-step pipeline from `AIOS/ContextEngine/03_CONTEXT_ASSEMBLY_PIPELINE.md`.

## Responsibilities

- Normalize input, load memory, summarize conversation
- Detect intent fast-path flags (is_trust_signal, is_emergency, is_medical_signal)
- Load ACP fragments (restrictions, decision rules, response profile)
- Load ConversationDataset (CID by intent + CID-20 always)
- Resolve domain knowledge by intent
- Build decision.action deterministically
- Build response_profile (tone, length, empathy, question_strategy)
- Apply restrictions (always last before LLM)
- Compress to token budget
- Validate (28 rules) and produce final ExecutionContext

## Files to Create (Phase 10.6)

```
runtime-gen1/context/
├── contextEngine.ts        ← Main: 15-step pipeline orchestrator
├── acpLoader.ts            ← Reads ACP markdown files → typed fragments
├── cidLoader.ts            ← Reads CID markdown files → behavioral patterns
├── compressionEngine.ts    ← Token budget enforcement per priority rules
├── contextValidator.ts     ← 28 validation rules (HARD + SOFT)
└── types.ts                ← ExecutionContext schema (from ACE-02)
```

## Source Spec

- `AIOS/ContextEngine/02_EXECUTION_CONTEXT_SCHEMA.md` — full schema
- `AIOS/ContextEngine/03_CONTEXT_ASSEMBLY_PIPELINE.md` — 15-step pipeline
- `AIOS/ContextEngine/06_CONTEXT_COMPRESSION_RULES.md` — compression priority
- `AIOS/ContextEngine/13_CONTEXT_VALIDATION.md` — 28 rules
- `AIOS/ContextEngine/15_CONTEXT_EXAMPLES.md` — 8 worked examples (test targets)
