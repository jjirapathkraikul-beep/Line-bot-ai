# AIOS Runtime Gen1

**Status**: PLANNING — Implementation begins Phase 10.1  
**Version**: 1.0-planning  
**Date**: 2026-06-27  
**Feature Flag**: `AI_RUNTIME_MODE=gen1`

---

## What Is Runtime Gen1?

Runtime Gen1 is the first AIOS-native conversation runtime. It replaces the V1 hardcoded intent router and state machine with a fully architecture-driven pipeline that reads from ACP packages, the Context Engine (ACE), and the Domain Knowledge layer.

Gen1 does not replace V1 all at once. It runs alongside V1 behind a feature flag. V1 remains the default until Gen1 passes regression tests.

---

## Architecture

```
LINE Webhook (existing)
        ↓
LINE Adapter (adapters/line/)
        ↓
Runtime Core (core/)
  ├── Intent Detector
  ├── Capability Loader → reads ACP packages
  └── Context Builder → assembles ExecutionContext
        ↓
Context Engine (context/)
  ├── Memory Resolver
  ├── Knowledge Resolver
  └── Decision Resolver
        ↓
LLM Adapter (adapters/line/ → openai client)
        ↓
Response Composer (response/)
        ↓
LINE Adapter → reply to customer
```

---

## Folder Plan

```
runtime-gen1/
├── README.md                    ← This file
│
├── core/                        ← Runtime orchestrator
│   └── README.md                ← Spec: Phase 10.1–10.3
│
├── context/                     ← Context assembly (ACE)
│   └── README.md                ← Spec: Phase 10.6
│
├── capability/                  ← Capability loader (ACP)
│   └── README.md                ← Spec: Phase 10.2
│
├── decision/                    ← Decision engine
│   └── README.md                ← Spec: Phase 10.5
│
├── knowledge/                   ← Knowledge resolver
│   └── README.md                ← Spec: Phase 10.4
│
├── memory/                      ← Memory adapter
│   └── README.md                ← Spec: Phase 10.3
│
├── response/                    ← Response composer
│   └── README.md                ← Spec: Phase 10.7
│
├── analytics/                   ← Audit + event emitter
│   └── README.md                ← Spec: Phase 10.8
│
└── adapters/
    └── line/                    ← LINE-specific adapter
        └── README.md            ← Spec: Phase 10.8
```

Each folder contains a README.md defining what is to be built in that sprint. Implementation files are added during Phase 10.X sprints.

---

## What Gen1 Is NOT

- Not a replacement for `lib/session.ts` — Gen1 wraps it via MemoryAdapter
- Not a replacement for `lib/openai.ts` — Gen1 wraps it via LLMAdapter
- Not a replacement for `lib/lead.ts` — Gen1 wraps it via CRMAdapter
- Not a new LINE API client — Gen1 reuses LINE client from V1 infrastructure
- Not a new Vercel KV client — Gen1 reuses KV from `lib/session.ts`

---

## Feature Flag

Gen1 is enabled by setting the environment variable:

```
AI_RUNTIME_MODE=gen1
```

Default value is `v1`. When set to `gen1`, `route.ts` will route to the Gen1 pipeline instead of the V1 state machine.

The feature flag is checked at the top of `route.ts` POST handler:
```
if (process.env.AI_RUNTIME_MODE === 'gen1') {
  return handleGen1(event, client)
}
// otherwise fall through to V1 handler
```

This requires a single, minimal modification to `route.ts` — adding the flag check + dispatch — without touching any V1 logic.

---

## Implementation Sequence

See `AIOS/AIRR/AIRR_v1.0.md` Phase 10 Roadmap and the planning document `runtime-gen1/IMPLEMENTATION_PLAN.md`.

---

## Version History

| Version | Date | Change |
|---|---|---|
| 1.0-planning | 2026-06-27 | Folder structure created; planning complete |
