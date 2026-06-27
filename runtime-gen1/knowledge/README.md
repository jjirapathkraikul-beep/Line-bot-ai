# Knowledge Resolver

**Sprint**: Phase 10.4  
**Status**: PLANNING

## Purpose

Resolves domain knowledge files from `AIOS/Domains/` based on detected intent and ACP Knowledge_Map references. Returns scored, compressed excerpts for inclusion in ExecutionContext.

## Responsibilities

- Map intent → knowledge paths (per `AIOS/AIRR/Knowledge_Path_Registry.md`)
- Read and parse AIOS markdown knowledge files at runtime
- Score relevance of each excerpt (0.0–1.0)
- Apply mandatory inclusions: medical uncertainty language, investment risk disclosure
- Return excerpts within token budget

## Files to Create (Phase 10.4)

```
runtime-gen1/knowledge/
├── knowledgeResolver.ts    ← Main: intent → knowledge sources → excerpts
├── markdownParser.ts       ← Read AIOS .md files → structured text
├── excerptScorer.ts        ← Relevance scoring per intent signal
└── knowledgeRegistry.ts    ← Path registry (from Knowledge_Path_Registry.md)
```

## Source Spec

- `AIOS/AIRR/Knowledge_Path_Registry.md` — canonical path registry
- `AIOS/ContextEngine/08_KNOWLEDGE_RESOLUTION.md` — intent-to-knowledge mapping
- `AIOS/Execution/04_KNOWLEDGE_RESOLVER.md`

## Key Implementation Note

Knowledge files are read from the `AIOS/` directory at runtime. They are NOT bundled into the application. This means:
- Knowledge is always up-to-date when files are updated
- No build step required for knowledge changes
- File read latency must be managed (cache knowledge for ~5 minutes)
