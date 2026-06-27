# Memory Adapter

**Sprint**: Phase 10.3  
**Status**: PLANNING

## Purpose

Wraps `lib/session.ts` (V1 KV store) with the AIOS `MemoryInterface` contract. Gen1 reads and writes session memory through this adapter — it does not call `lib/session.ts` directly.

## Responsibilities

- Implement `MemoryInterface` (from `AIOS/Execution/09_EXECUTION_CONTRACT.md`)
- Map V1 session schema → Gen1 SessionMemory schema
- Manage known-field protection (`fields_captured` — never re-ask)
- Manage trust profile persistence (`trust_concern_active`, `turns_since_trust_concern`)
- Manage lead_profile across turns

## Files to Create (Phase 10.3)

```
runtime-gen1/memory/
├── memoryAdapter.ts        ← Implements MemoryInterface; wraps lib/session.ts
├── sessionMapper.ts        ← V1 session schema → Gen1 SessionMemory
├── leadProfileStore.ts     ← lead_profile CRUD with fields_captured protection
└── trustProfileStore.ts    ← trust_profile state management
```

## V1 → Gen1 Session Schema Migration

The V1 session (via `lib/session.ts`) stores a mixed object with display name, state machine state, and lead fields combined. Gen1 separates these:

| V1 Session Field | Gen1 Location |
|---|---|
| `displayName` | `SessionMemory.customer_name` |
| `currentState` (AWAITING_*) | `SessionMemory.current_mode` |
| `lastIntent` | `SessionMemory.last_intent` |
| `leadData.*` (name, phone, age...) | `lead_profile.fields_captured` |
| `trustState` | `trust_profile` (new structure) |

## Source Spec

- `AIOS/Execution/07_MEMORY_ENGINE.md`
- `AIOS/Execution/09_EXECUTION_CONTRACT.md` — MemoryInterface
- `AIOS/ContextEngine/07_MEMORY_RESOLUTION.md` — Known-field protection
