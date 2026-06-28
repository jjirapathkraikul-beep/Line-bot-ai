// Learning Processor — Phase 12.0A
// Consumes pending audit records from KV, classifies issues, persists IssueRecords.
// Runs asynchronously — NEVER blocks customer-facing runtime.
// Read-only with respect to conversation flow, prompts, memory, and decisions.

import { getPendingAuditCandidates, markAuditProcessedInKv, type AuditCandidate } from '../observability/auditQueue';
import { createIssue, type IssueRecord, type IssueSeverity } from '../observability/issueDatabase';

// ─── Learning Issue Category ──────────────────────────────────────────────────
// Canonical categories for processor-generated issues.
// Subset of IssueCategory defined in issueDatabase.ts.

export type LearningIssueCategory =
  | 'MEMORY'
  | 'KNOWLEDGE'
  | 'COMMERCIAL'
  | 'CONVERSATION'
  | 'PRODUCT'
  | 'TRUST'
  | 'MEDICAL'
  | 'HANDOFF'
  | 'OTHER';

// ─── Severity Rules ───────────────────────────────────────────────────────────
//
// P0 — Critical: Complete pipeline failure or sensitive-category failure
//   • fallbackUsed AND !validatorPassed (total failure)
//   • MEDICAL or TRUST category with any quality failure
//
// P1 — High: Single significant failure that affects the customer
//   • fallbackUsed only (customer received fallback instead of answer)
//   • !validatorPassed only (response quality gate failed)
//   • TRUST or MEDICAL category with validator passing (elevated by sensitivity)
//
// P2 — Medium: Recoverable quality issue
//   • COMMERCIAL or HANDOFF category (opportunity missed, not catastrophic)
//   • High latency (> 5000ms) with no other quality failure
//
// P3 — Low: Minor or informational
//   • Reserved for future pattern analysis (not generated in MVP)

export interface ProcessingResult {
  processed: number;   // audit records examined
  skipped:   number;   // records that did not meet issue threshold
  issued:    number;   // IssueRecords created
  errors:    number;   // records that threw during processing
}

// ─── Classification ───────────────────────────────────────────────────────────

const TRUST_KEYWORDS   = ['trust', 'scam', 'หลอก', 'ไม่น่าเชื่อ', 'กลัว', 'trust_concern', 'TRUST'];
const MEDICAL_KEYWORDS = ['medical', 'cancer', 'เบาหวาน', 'ก้อน', 'โรค', 'ป่วย', 'แพ้', 'medical_disclosure', 'MEDICAL'];
const HANDOFF_KEYWORDS = ['handoff', 'human', 'advisor', 'ESCALATE', 'ACT-11', 'ACT-12'];
const COMMERCIAL_KEYWORDS = ['lead', 'quote', 'buy', 'ซื้อ', 'สมัคร', 'COLLECT_LEAD', 'ACT-05', 'ACT-09'];

function matchesAny(value: string, keywords: string[]): boolean {
  const lower = value.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export function classifyIssueCategory(candidate: AuditCandidate): LearningIssueCategory {
  const { intent, decision, strategy, fallbackUsed } = candidate;
  const combined = `${intent} ${decision} ${strategy}`.toLowerCase();

  if (matchesAny(combined, MEDICAL_KEYWORDS)) return 'MEDICAL';
  if (matchesAny(combined, TRUST_KEYWORDS))   return 'TRUST';
  if (matchesAny(combined, HANDOFF_KEYWORDS)) return 'HANDOFF';
  if (matchesAny(combined, COMMERCIAL_KEYWORDS)) return 'COMMERCIAL';

  if (fallbackUsed) return 'KNOWLEDGE';

  if (intent.includes('memory') || decision.includes('memory') || intent.includes('re_ask')) {
    return 'MEMORY';
  }

  if (intent.includes('product') || intent.includes('knowledge') || decision.includes('educate')) {
    return 'PRODUCT';
  }

  return 'CONVERSATION';
}

export function assignSeverity(
  candidate: AuditCandidate,
  category: LearningIssueCategory,
): IssueSeverity {
  const { fallbackUsed, validatorPassed } = candidate;
  const isSensitive = category === 'MEDICAL' || category === 'TRUST';

  // P0: total failure or sensitive-category failure
  if (fallbackUsed && !validatorPassed)          return 'P0';
  if (isSensitive && (fallbackUsed || !validatorPassed)) return 'P0';

  // P1: single significant failure or any sensitive-category issue
  if (fallbackUsed)    return 'P1';
  if (!validatorPassed) return 'P1';
  if (isSensitive)     return 'P1';

  // P2: opportunity-related or latency
  if (category === 'COMMERCIAL' || category === 'HANDOFF') return 'P2';
  if (candidate.latency > 5000) return 'P2';

  return 'P3';
}

export function shouldCreateIssue(candidate: AuditCandidate): boolean {
  // Only create issues for records with clear quality signals.
  // Skip records that passed all checks — they are not issues.
  return candidate.fallbackUsed || !candidate.validatorPassed;
}

// ─── Process single audit record ─────────────────────────────────────────────

export async function processAuditRecord(
  candidate: AuditCandidate,
): Promise<IssueRecord | null> {
  if (!shouldCreateIssue(candidate)) return null;

  const category = classifyIssueCategory(candidate);
  const severity = assignSeverity(candidate, category);

  const expectedBehavior = candidate.fallbackUsed
    ? 'System should return a relevant, knowledge-grounded response'
    : 'Response should pass all quality validation checks';

  const actualBehavior = candidate.fallbackUsed && !candidate.validatorPassed
    ? 'Fallback response returned AND validation failed'
    : candidate.fallbackUsed
    ? 'Fallback response returned (knowledge resolver found no match)'
    : 'Response failed quality validation';

  const issue = createIssue({
    conversationId:   candidate.conversationId,
    category,
    severity,
    expectedBehavior,
    actualBehavior,
    rootCause:        null,
    proposedFix:      null,
    owner:            null,
  });

  console.log('[LEARNING_PROCESSOR]', JSON.stringify({
    event:          'issue_created',
    sessionId:      candidate.sessionId,
    conversationId: candidate.conversationId,
    category,
    severity,
    issueId:        issue.issueId,
  }));

  return issue;
}

// ─── Run Learning Processor ───────────────────────────────────────────────────
// Fetches up to `limit` pending audit records, processes each, marks reviewed.
// Returns a ProcessingResult summary.
// All errors are caught — this function never throws.

export async function runLearningProcessor(limit = 50): Promise<ProcessingResult> {
  const result: ProcessingResult = { processed: 0, skipped: 0, issued: 0, errors: 0 };

  let candidates: AuditCandidate[];
  try {
    candidates = await getPendingAuditCandidates(limit);
  } catch (err) {
    console.error('[LEARNING_PROCESSOR]', JSON.stringify({ event: 'fetch_error', error: String(err) }));
    return result;
  }

  for (const candidate of candidates) {
    result.processed++;
    try {
      const issue = await processAuditRecord(candidate);
      if (issue === null) {
        result.skipped++;
      } else {
        result.issued++;
      }
      // Mark as REVIEWED in KV regardless of whether an issue was created
      await markAuditProcessedInKv(candidate.sessionId);
    } catch (err) {
      result.errors++;
      console.error('[LEARNING_PROCESSOR]', JSON.stringify({
        event:     'record_error',
        sessionId: candidate.sessionId,
        error:     String(err),
      }));
    }
  }

  console.log('[LEARNING_PROCESSOR]', JSON.stringify({ event: 'run_complete', ...result }));
  return result;
}
