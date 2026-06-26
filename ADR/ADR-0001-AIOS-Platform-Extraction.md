# ADR-0001: AIOS Platform Extraction and Application Re-homing

## Status
Proposed

## Context
The repository contains both the LINE Chatbot application and AIOS governance material mixed at the root level. The current root structure made the platform artifacts and runnable application difficult to distinguish.

## Decision
- Move the AIOS platform documents and governance artifacts from `AI-Advisor-OS/` into `AIOS/`
- Move the LINE chatbot application code and app-level docs into `Applications/Line_Chatbot_AI/`
- Create `Shared/` for future shared platform assets and cross-app utilities
- Preserve the app-specific AIOS copy until the platform extraction is validated, but do not commit duplicate platform docs into the app

## Consequences
- AIOS becomes the authoritative platform root for shared AI governance and architecture
- Applications are separated from platform governance, making future apps easier to onboard
- Duplicate nests are removed from the final structure, eliminating confusion about which AIOS source is authoritative
- Future app teams can consume platform documentation without duplicating the platform artifact set

## Notes
- The root repository still retains `.gitignore` as the repo-level ignore file
- Shared assets can now live in `Shared/`
- This ADR documents the structural migration and its rationale
