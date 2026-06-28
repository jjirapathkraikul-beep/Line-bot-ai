// Learning Report Generator — Phase 12.0A
// Reads issues from KV and produces a structured JSON report.
// No dashboard, no UI, no side effects. Read-only.

import {
  getIssueByIdFromKv,
  getOpenIssuesFromKv,
  getIssuesByCategoryFromKv,
  getIssuesBySeverityFromKv,
  getRecentIssuesFromKv,
  type IssueRecord,
  type IssueCategory,
  type IssueSeverity,
} from '../observability/issueDatabase';
import type { LearningIssueCategory } from './learningProcessor';

// ─── Re-export KV read helpers as the public API ──────────────────────────────
// Consumers import from learningReport — not from issueDatabase directly.

export { getIssueByIdFromKv as getIssueById };
export { getOpenIssuesFromKv as getOpenIssues };
export { getRecentIssuesFromKv as getRecentIssues };

export async function getIssuesByCategory(
  category: LearningIssueCategory,
  limit = 50,
): Promise<IssueRecord[]> {
  return getIssuesByCategoryFromKv(category as IssueCategory, limit);
}

export async function getIssuesBySeverity(
  severity: IssueSeverity,
  limit = 50,
): Promise<IssueRecord[]> {
  return getIssuesBySeverityFromKv(severity, limit);
}

// ─── Report Schema ────────────────────────────────────────────────────────────

export interface LearningReport {
  generatedAt:          string;
  periodDays:           number;
  openIssues:           number;
  issuesByCategory:     Record<string, number>;
  issuesBySeverity:     Record<IssueSeverity, number>;
  topKnowledgeProblems: IssueRecord[];
  topMemoryProblems:    IssueRecord[];
  topCommercialProblems: IssueRecord[];
  recentIssues:         IssueRecord[];
  recommendations:      string[];
}

// ─── Report generation ────────────────────────────────────────────────────────

function buildRecommendations(
  issuesByCategory: Record<string, number>,
  issuesBySeverity: Record<IssueSeverity, number>,
): string[] {
  const recs: string[] = [];

  if ((issuesBySeverity.P0 ?? 0) > 0) {
    recs.push(`URGENT: ${issuesBySeverity.P0} P0 issue(s) require immediate attention`);
  }

  const knowledgeCount = (issuesByCategory['KNOWLEDGE'] ?? 0) + (issuesByCategory['PRODUCT'] ?? 0);
  if (knowledgeCount >= 5) {
    recs.push(`High knowledge gap rate (${knowledgeCount} issues) — review Knowledge Path Registry and create missing documents`);
  }

  if ((issuesByCategory['MEMORY'] ?? 0) >= 3) {
    recs.push(`Memory continuity issues detected (${issuesByCategory['MEMORY']}) — review memoryResolver extraction patterns`);
  }

  if ((issuesByCategory['TRUST'] ?? 0) >= 2) {
    recs.push(`Trust flow issues detected (${issuesByCategory['TRUST']}) — review trust detection keywords and BUILD_TRUST_FIRST strategy`);
  }

  if ((issuesByCategory['MEDICAL'] ?? 0) >= 1) {
    recs.push(`COMPLIANCE: Medical flow issues detected (${issuesByCategory['MEDICAL']}) — verify mandatory uncertainty fragment is always included`);
  }

  if ((issuesByCategory['COMMERCIAL'] ?? 0) >= 3) {
    recs.push(`Commercial conversion issues (${issuesByCategory['COMMERCIAL']}) — review lead capture timing and objection handling ACPs`);
  }

  if (recs.length === 0) {
    recs.push('No critical issues detected — maintain current learning cycle cadence');
  }

  return recs;
}

export async function generateLearningReport(periodDays = 30): Promise<LearningReport> {
  const generatedAt = new Date().toISOString();

  // Fetch all data from KV in parallel
  const [
    openIssues,
    knowledgeIssues,
    memoryIssues,
    commercialIssues,
    conversationIssues,
    productIssues,
    trustIssues,
    medicalIssues,
    handoffIssues,
    otherIssues,
    p0Issues,
    p1Issues,
    p2Issues,
    p3Issues,
    recentIssues,
  ] = await Promise.all([
    getOpenIssuesFromKv(200),
    getIssuesByCategoryFromKv('KNOWLEDGE', 10),
    getIssuesByCategoryFromKv('MEMORY', 10),
    getIssuesByCategoryFromKv('COMMERCIAL', 10),
    getIssuesByCategoryFromKv('CONVERSATION', 10),
    getIssuesByCategoryFromKv('PRODUCT', 10),
    getIssuesByCategoryFromKv('TRUST', 10),
    getIssuesByCategoryFromKv('MEDICAL', 10),
    getIssuesByCategoryFromKv('HANDOFF', 10),
    getIssuesByCategoryFromKv('OTHER', 10),
    getIssuesBySeverityFromKv('P0', 50),
    getIssuesBySeverityFromKv('P1', 50),
    getIssuesBySeverityFromKv('P2', 50),
    getIssuesBySeverityFromKv('P3', 50),
    getRecentIssuesFromKv(10),
  ]);

  const issuesByCategory: Record<string, number> = {
    KNOWLEDGE:    knowledgeIssues.length,
    MEMORY:       memoryIssues.length,
    COMMERCIAL:   commercialIssues.length,
    CONVERSATION: conversationIssues.length,
    PRODUCT:      productIssues.length,
    TRUST:        trustIssues.length,
    MEDICAL:      medicalIssues.length,
    HANDOFF:      handoffIssues.length,
    OTHER:        otherIssues.length,
  };

  const issuesBySeverity: Record<IssueSeverity, number> = {
    P0: p0Issues.length,
    P1: p1Issues.length,
    P2: p2Issues.length,
    P3: p3Issues.length,
  };

  const recommendations = buildRecommendations(issuesByCategory, issuesBySeverity);

  const report: LearningReport = {
    generatedAt,
    periodDays,
    openIssues:           openIssues.length,
    issuesByCategory,
    issuesBySeverity,
    topKnowledgeProblems: [...knowledgeIssues, ...productIssues].slice(0, 10),
    topMemoryProblems:    memoryIssues.slice(0, 10),
    topCommercialProblems: [...commercialIssues, ...handoffIssues].slice(0, 10),
    recentIssues:         recentIssues.slice(0, 10),
    recommendations,
  };

  console.log('[LEARNING_REPORT]', JSON.stringify({
    generatedAt,
    openIssues:   report.openIssues,
    p0:           issuesBySeverity.P0,
    p1:           issuesBySeverity.P1,
    recommendations: recommendations.length,
  }));

  return report;
}
