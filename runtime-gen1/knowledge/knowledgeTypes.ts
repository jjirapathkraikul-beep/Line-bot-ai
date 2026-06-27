// Technology-independent knowledge types for Gen1 runtime.
// No Vercel KV, Google Sheet, LINE, or OpenAI dependencies.

import type { IntentDetectorResult } from '../capability/intentDetector';
import type { CapabilityLoaderResult } from '../capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../memory/memoryTypes';

export type KnowledgeSourceType =
  | 'acp_restriction'
  | 'acp_response_profile'
  | 'acp_decision_rules'
  | 'acp_capability'
  | 'domain_product'
  | 'domain_knowledge'
  | 'domain_trust'
  | 'domain_recommendation'
  | 'domain_sales'
  | 'domain_human'
  | 'domain_objection'
  | 'conversation_dataset'
  | 'mandatory_fragment';   // synthetic — not a file; injected directly

export type KnowledgeTrustLevel = 'AUTHORITATIVE' | 'HIGH' | 'MEDIUM';

export type KnowledgeFreshness =
  | 'STABLE'            // architecture/pattern docs — rarely change
  | 'REVIEW_QUARTERLY'  // product/medical — review every 3 months
  | 'REVIEW_ANNUALLY'   // tax deduction limits — review yearly
  | 'SYNTHETIC';        // generated fragment — never stale

// ─── Source definition (registry entry) ──────────────────────────────────────

export interface KnowledgeSource {
  id: string;                    // unique identifier (derived from path)
  path: string;                  // relative to project root, e.g. 'AIOS/Domains/...'
  type: KnowledgeSourceType;
  trustLevel: KnowledgeTrustLevel;
  freshness: KnowledgeFreshness;
  mandatory: boolean;            // must include regardless of token budget
  relevanceScore: number;        // 0.0–1.0 for this intent context
  description: string;           // what this source provides
}

// ─── Loaded content ───────────────────────────────────────────────────────────

export interface KnowledgeSnippet {
  sourcePath: string;
  title: string;
  content: string;               // full content (Phase 10.6 context engine handles compression)
  charCount: number;
  trustLevel: KnowledgeTrustLevel;
  freshness: KnowledgeFreshness;
  loadedAt: number;              // epoch ms (0 for synthetic fragments)
  isMandatory: boolean;
  isCacheHit: boolean;
}

// ─── Loader result ────────────────────────────────────────────────────────────

export interface KnowledgeLoadResult {
  path: string;
  snippet: KnowledgeSnippet | null;
  loaded: boolean;
  error: string | null;
}

// ─── Resolver input ───────────────────────────────────────────────────────────

export interface KnowledgeSelectionInput {
  intentResult: IntentDetectorResult;
  capabilityResult: CapabilityLoaderResult;
  memoryResult: RuntimeMemoryResolution;
}

// ─── Resolver output ──────────────────────────────────────────────────────────

export interface KnowledgeSelectionResult {
  selectedSources: KnowledgeSource[];   // sources chosen for this turn
  loadedSnippets: KnowledgeSnippet[];   // successfully loaded content
  mandatorySources: string[];           // paths that must be included
  optionalSources: string[];            // paths included but not mandatory
  missingSources: string[];             // paths that couldn't be loaded (graceful)
  warnings: string[];                   // e.g. "File not found: ..."
  knowledgeTrace: KnowledgeTrace;
}

// ─── Trace ────────────────────────────────────────────────────────────────────

export interface KnowledgeTrace {
  intentUsed: string;
  sourcesConsidered: number;
  sourcesSelected: number;
  sourcesLoaded: number;
  sourcesMissing: number;
  mandatoryIncluded: boolean;
  mandatoryMissing: string[];           // mandatory paths that couldn't be loaded
  cacheHits: number;
  blockedProductDocs: boolean;          // trust-first: product docs blocked
  mandatoryFragmentsAdded: string[];    // synthetic fragment IDs added
  knowledgeDecisionReason: string;
}
