// Issue Database — Beta Release Sprint
// Registry for audit findings from manual conversation review.
// Tracks all fields from the Beta Release spec issue schema.

export type IssueSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WONT_FIX' | 'DUPLICATE';

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
  | 'other';

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
  console.log('[ISSUE_CREATE]', JSON.stringify({
    issueId:        issue.issueId,
    conversationId: issue.conversationId,
    category:       issue.category,
    severity:       issue.severity,
    status:         issue.status,
  }));
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
  return true;
}

export function clearIssues(): void {
  _issues.length = 0;
  _counter = 1;
}
