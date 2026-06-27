# LINE Adapter

**Sprint**: Phase 10.8  
**Status**: PLANNING

## Purpose

Bridges the LINE webhook event format and the Gen1 `ExecutionInput`/`ExecutionOutput` contracts. This is the only component that knows about LINE-specific types.

## Responsibilities

- Translate LINE `MessageEvent` → Gen1 `ExecutionInput`
- Translate Gen1 `ExecutionOutput` → LINE `replyMessage()` call
- Handle LINE-specific types: TEXT, POSTBACK, Flex Message, Quick Reply
- Map LINE `userId` → AIOS `customer_id` (stable, deterministic mapping)
- Map LINE session token → AIOS `session_id`

## Files to Create (Phase 10.8)

```
runtime-gen1/adapters/line/
├── lineAdapter.ts          ← Main adapter: LINE event → handleGen1 → LINE reply
├── inputMapper.ts          ← MessageEvent/PostbackEvent → ExecutionInput
├── outputMapper.ts         ← ExecutionOutput → TextMessage / QuickReply
└── types.ts                ← LINE-specific adapter types
```

## Key Mappings

### LINE Event → ExecutionInput

```
LINE userId             → customer_id (stable across sessions)
LINE replyToken         → not passed to AEE (LINE-specific; used only for reply)
LINE message.text       → message
event.type='message'    → message_type='TEXT'
event.type='postback'   → message_type='POSTBACK'
postback.data           → postback_data
timestamp (LINE)        → timestamp
session_id              → generated: hash(userId + date) for daily session boundary
domain                  → 'INSURANCE' (hardcoded for this application)
language                → 'th' (hardcoded for this application)
```

### ExecutionOutput → LINE Reply

```
ExecutionOutput.responses[0].content    → replyMessage text
ExecutionOutput.responses[0].type=QUESTION → append quickReply items
ExecutionOutput.handoff.triggered=true  → send handoff message + notify admin
ExecutionOutput.lead_update.fields_captured → passed to CRM adapter
```

## Reused V1 Infrastructure

The LINE Adapter wraps (not replaces) these V1 components:
- `lib/session.ts` — via MemoryAdapter in `runtime-gen1/memory/`
- `@line/bot-sdk` Client — same instance as V1
- Rate limiting (currently in `route.ts`) — stays in `route.ts`, before Gen1 dispatch

## Source Spec

- `AIOS/AIRR/Knowledge_Path_Registry.md` — adapter bridge spec (reference for field mapping)
- `AIOS/Execution/09_EXECUTION_CONTRACT.md` — ExecutionInput/Output contracts
- `AIOS/Applications/Line_Chatbot_AI/Integrations/LINE_API.md`
