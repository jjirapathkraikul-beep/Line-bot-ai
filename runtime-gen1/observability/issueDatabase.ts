// Issue Database — Beta Release Sprint + KV Persistence (Phase 12.0A)
// Registry for audit findings from manual and automated conversation review.
// Sync in-memory API is preserved for backward compatibility.
// KV persistence is fire-and-forget: failures never affect runtime.

import { getKvClient } from './kvClient';

export const ISSUE_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export type IssueSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX' | 'DUPLICATE';

// Original categories (maintained for backward compatibility) + Learning Processor categories
export type IssueCategory =
  | 'conversation_flow'
  | 'intent_detection'
  | 'recommendation_quality'
  | 'memory_continuity'
  | 'lead_capture'
  | 'trust_flow'
  | 'medical_flow'
  | 'language_quality'
  | 'fallback_triggered'
  | 'latency'
  | 'other'
  // Learning Processor canonical categories (Phase 12.0A)
  | 'MEMORY'
  | 'KNOWLEDGE'
  | 'COMMERCIAL'
  | 'CONVERSATION'
  | 'PRODUCT'
  | 'TRUST'
  | 'MEDICAL'
  | 'HANDOFF';

export interface IssueRecord {
  issueId:           string;           // auto: ISSUE-0001, ISSUE-0002, ...
  conversationId:    string;
  category:          IssueCategory;
  severity:          IssueSeverity;
  expectedBehavior:  string;
  actualBehavior:    string;
  rootCause:         string | null;
  proposedFix:       string | null;
  status:            IssueStatus;
  owner:             string | null;
  regressionTested:  boolean;
  createdAt:         string;
  updatedAt:         string;
}

const _issues: IssueRecord[] = [];
let _counter = 1;

// ─── KV persistence (fire-and-forget — never blocks sync API) ─────────────────

async function persistIssueToKv(issue: IssueRecord): Promise<void> {
  const kv = getKvClient();
  await kv.set(`issue:byId:${issue.issueId}`, JSON.stringify(issue), { ex: ISSUE_TTL_SECONDS });
  await kv.lpush(`issue:status:${issue.status}`, issue.issueId);
  await kv.expire(`issue:status:${issue.status}`, ISSUE_TTL_SECONDS);
  await kv.lpush(`issue:category:${issue.category}`, issue.issueId);
  await kv.expire(`issue:category:${issue.category}`, ISSUE_TTL_SECONDS);
  await kv.lpush(`issue:severity:${issue.severity}`, issue.issueId);
  await kv.expire(`issue:severity:${issue.severity}`, ISSUE_TTL_SECONDS);
  await kv.lpush('issue:recent', issue.issueId);
  await kv.expire('issue:recent', ISSUE_TTL_SECONDS);
}

// ─── Sync in-memory API (unchanged — backward compatible) ─────────────────────

export function createIssue(
  fields: Omit<IssueRecord, 'issueId' | 'status' | 'regressionTested' | 'createdAt' | 'updatedAt'>,
): IssueRecord {
  const now = new Date().toISOString();
  const issue: IssueRecord = {
    ...fields,
    issueId:          `ISSUE-${String(_counter++).padStart(4, '0')}`,
    status:           'OPEN',
    regressionTested: false,
    createdAt:        now,
    updatedAt:        now,
  };
  _issues.push(issue);
  console.log('[ISSUE_CREATED]', JSON.stringify({
    issueId:        issue.issueId,
    conversationId: issue.conversationId,
    category:       issue.category,
    severity:       issue.severity,
    status:         issue.status,
  }));
  // fire-and-forget KV write — never blocks runtime
  persistIssueToKv(issue).catch((err) => console.error('[ISSUE_PERSIST_ERROR]', String(err)));
  return issue;
}

export function getIssues(): ReadonlyArray<IssueRecord> {
  return _issues;
}

export function getIssueById(issueId: string): IssueRecord | undefined {
  return _issues.find((i) => i.issueId === issueId);
}

export function updateIssue(
  issueId: string,
  updates: Partial<Pick<IssueRecord, 'status' | 'rootCause' | 'proposedFix' | 'owner' | 'regressionTested'>>,
): boolean {
  const issue = _issues.find((i) => i.issueId === issueId);
  if (!issue) return false;
  Object.assign(issue, updates, { updatedAt: new Date().toISOString() });
  console.log('[ISSUE_UPDATE]', JSON.stringify({ issueId, updates }));
  // fire-and-forget KV update
  persistIssueToKv(issue).catch((err) => console.error('[ISSUE_PERSIST_ERROR]', String(err)));
  return true;
}

export function clearIssues(): void {
  _issues.length = 0;
  _counter = 1;
}

// ─── Async KV read helpers (used by Learning Processor and Report) ────────────

export async function getIssueByIdFromKv(issueId: string): Promise<IssueRecord | null> {
  try {
    const raw = await getKvClient().get(`issue:byId:${issueId}`);
    return raw ? (JSON.parse(raw) as IssueRecord) : null;
  } catch (err) {
    console.error('[ISSUE_READ_ERROR]', String(err));
    return null;
  }
}

export async function getOpenIssueIds(limit = 50): Promise<string[]> {
  try {
    return await getKvClient().lrange('issue:status:OPEN', 0, limit - 1);
  } catch (err) {
    console.error('[ISSUE_READ_ERROR]', String(err));
    return [];
  }
}

export async function getIssueIdsByCategory(category: IssueCategory, limit = 50): Promise<string[]> {
  try {
    return await getKvClient().lrange(`issue:category:${category}`, 0, limit - 1);
  } catch (err) {
    console.error('[ISSUE_READ_ERROR]', String(err));
    return [];
  }
}

export async function getIssueIdsBySeverity(severity: IssueSeverity, limit = 50): Promise<string[]> {
  try {
    return await getKvClient().lrange(`issue:severity:${severity}`, 0, limit - 1);
  } catch (err) {
    console.error('[ISSUE_READ_ERROR]', String(err));
    return [];
  }
}

export async function getRecentIssueIds(limit = 20): Promise<string[]> {
  try {
    return await getKvClient().lrange('issue:recent', 0, limit - 1);
  } catch (err) {
    console.error('[ISSUE_READ_ERROR]', String(err));
    return [];
  }
}

async function fetchIssuesByIds(ids: string[]): Promise<IssueRecord[]> {
  const results = await Promise.all(ids.map((id) => getIssueByIdFromKv(id)));
  return results.filter((r): r is IssueRecord => r !== null);
}

export async function getOpenIssuesFromKv(limit = 50): Promise<IssueRecord[]> {
  const ids = await getOpenIssueIds(limit);
  return fetchIssuesByIds(ids);
}

export async function getIssuesByCategoryFromKv(category: IssueCategory, limit = 50): Promise<IssueRecord[]> {
  const ids = await getIssueIdsByCategory(category, limit);
  return fetchIssuesByIds(ids);
}

export async function getIssuesBySeverityFromKv(severity: IssueSeverity, limit = 50): Promise<IssueRecord[]> {
  const ids = await getIssueIdsBySeverity(severity, limit);
  return fetchIssuesByIds(ids);
}

export async function getRecentIssuesFromKv(limit = 20): Promise<IssueRecord[]> {
  const ids = await getRecentIssueIds(limit);
  return fetchIssuesByIds(ids);
}
