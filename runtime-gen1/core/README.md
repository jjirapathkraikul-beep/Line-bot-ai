# Runtime Core

**Sprint**: Phase 10.1  
**Status**: PLANNING  
**Owner**: Senior Software Architect

## Purpose

The Runtime Core is the entry point for Gen1 execution. It receives a normalized input from the LINE Adapter and orchestrates the full execution pipeline.

## Responsibilities

- Accept `ExecutionInput` from LINE Adapter
- Call Intent Detector → Capability Loader → Context Builder in sequence
- Return `ExecutionOutput` to LINE Adapter
- Handle all pipeline failures gracefully (never throw to LINE webhook)

## Files to Create (Phase 10.1)

```
runtime-gen1/core/
├── aiosRuntime.ts          ← Main entry: handleGen1(event, client)
├── executionInput.ts       ← ExecutionInput builder from LINE event
├── executionOutput.ts      ← ExecutionOutput → LINE reply mapper
└── types.ts                ← ExecutionInput, ExecutionOutput, ExecutionContext types
```

## Interfaces

```typescript
// Entry point called by route.ts when AI_RUNTIME_MODE=gen1
export async function handleGen1(
  event: MessageEvent,
  client: Client
): Promise<void>

// Internal pipeline
export interface ExecutionInput {
  session_id: string
  customer_id: string
  message: string
  message_type: 'TEXT' | 'POSTBACK'
  domain: 'INSURANCE'
  language: 'th'
  timestamp: string
}
```

## Dependencies

- `lib/session.ts` — read/write session (via MemoryAdapter wrapper)
- `runtime-gen1/capability/` — ACP loader
- `runtime-gen1/context/` — ACE context assembler
- `runtime-gen1/adapters/line/` — LINE-specific translations

## Source Spec

`AIOS/Execution/09_EXECUTION_CONTRACT.md` — ExecutionInput and ExecutionOutput contracts
