# Capability Loader

**Sprint**: Phase 10.2  
**Status**: PLANNING

## Purpose

Loads the correct ACP package based on detected intent and fast-path flags. Returns the primary ACP identifier to the Context Engine.

## Responsibilities

- Map detected intent → CAP-NNN → ACP-NN (per `AIOS/AIRR/Capability_Registry_Reconciliation.md`)
- Enforce priority: CAP-002 CRITICAL for trust signals; CAP-007 HIGH for emergency/claim
- Return primary ACP path for ACE to load

## Files to Create (Phase 10.2)

```
runtime-gen1/capability/
├── capabilityLoader.ts     ← Main selector: intent + flags → ACP path
├── capabilityRegistry.ts   ← CAP-to-ACP mapping table
└── intentDetector.ts       ← Thai NFC normalization + keyword/LLM intent classification
```

## Source Spec

- `AIOS/Execution/03_CAPABILITY_LOADER.md`
- `AIOS/AIRR/Capability_Registry_Reconciliation.md`
- `AIOS/CapabilityPackages/00_CAPABILITY_STANDARD.md`
