// File-system loader for AIOS knowledge documents.
// File I/O happens ONLY inside async function bodies — never at module import.
// Paths must start with 'AIOS/' (relative to project root) or the load is rejected.

import { promises as fs } from 'fs';
import path from 'path';
import type { KnowledgeSnippet, KnowledgeTrustLevel, KnowledgeFreshness } from './knowledgeTypes';

// ─── In-memory cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  content: string;
  title: string;
  cachedAt: number;
}

// Module-level cache — safe (empty Map, no I/O)
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearKnowledgeCache(): void {
  cache.clear();
}

export function getKnowledgeCacheSize(): number {
  return cache.size;
}

// ─── Path validation ──────────────────────────────────────────────────────────

function isValidPath(relativePath: string): boolean {
  // Only allow reads under AIOS/ (relative to project root)
  // Prevent directory traversal via '..' or absolute paths
  if (!relativePath.startsWith('AIOS/')) return false;
  const normalized = path.normalize(relativePath);
  return normalized.startsWith('AIOS/') && !normalized.includes('..');
}

// ─── Title extraction ─────────────────────────────────────────────────────────

function extractTitle(content: string, filePath: string): string {
  const firstH1 = content.match(/^#\s+(.+)$/m);
  if (firstH1) return firstH1[1].trim();
  return path.basename(filePath, '.md').replace(/_/g, ' ');
}

// ─── Trust level inference from path ─────────────────────────────────────────

function inferTrustLevel(filePath: string): KnowledgeTrustLevel {
  if (filePath.includes('CapabilityPackages/')) return 'AUTHORITATIVE';
  return 'HIGH';
}

function inferFreshness(filePath: string): KnowledgeFreshness {
  if (filePath.includes('/Products/') || filePath.includes('/Knowledge/Medical') || filePath.includes('/Knowledge/Underwriting') || filePath.includes('/Knowledge/Hospital') || filePath.includes('/Knowledge/Claim')) return 'REVIEW_QUARTERLY';
  if (filePath.includes('/Knowledge/Tax') || filePath.includes('/Products/Tax')) return 'REVIEW_ANNUALLY';
  return 'STABLE';
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loadKnowledgeFile(
  relativePath: string,
  options: { mandatory?: boolean } = {},
): Promise<KnowledgeSnippet | null> {
  // Security: reject paths outside AIOS/
  if (!isValidPath(relativePath)) {
    return null;
  }

  // Check cache
  const cached = cache.get(relativePath);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      sourcePath:   relativePath,
      title:        cached.title,
      content:      cached.content,
      charCount:    cached.content.length,
      trustLevel:   inferTrustLevel(relativePath),
      freshness:    inferFreshness(relativePath),
      loadedAt:     cached.cachedAt,
      isMandatory:  options.mandatory ?? false,
      isCacheHit:   true,
    };
  }

  // Load from disk (I/O only here, never at module level)
  try {
    const absPath = path.resolve(process.cwd(), relativePath);
    const content = await fs.readFile(absPath, 'utf8');
    const title = extractTitle(content, relativePath);
    const now = Date.now();
    cache.set(relativePath, { content, title, cachedAt: now });
    return {
      sourcePath:  relativePath,
      title,
      content,
      charCount:   content.length,
      trustLevel:  inferTrustLevel(relativePath),
      freshness:   inferFreshness(relativePath),
      loadedAt:    now,
      isMandatory: options.mandatory ?? false,
      isCacheHit:  false,
    };
  } catch {
    // Missing file — graceful null; caller adds to missingSources
    return null;
  }
}
