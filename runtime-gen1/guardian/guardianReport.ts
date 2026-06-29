// Guardian Report — Phase 12.0D
// Aggregates GuardianReview records into a structured Review Package report.
// Output: JSON only. No runtime modification.

import { getKvClient } from '../observability/kvClient';
import {
  getGuardianReviews,
  getReviewsByDecision,
  type GuardianReview,
  type GuardianDecision,
  type ConflictReport,
} from './guardianReview';

export interface GuardianReportSummary {
  totalReviewed:          number;
  approved:               number;
  approvedWithConditions: number;
  requestRevision:        number;
  rejected:               number;
  escalated:              number;
}

export interface GuardianReport {
  generatedAt:            string;
  summary:                GuardianReportSummary;
  reviewedProposals:      { proposalId: string; decision: GuardianDecision; priority: string; risk: string }[];
  ssiViolations:          { reviewId: string; violations: string[] }[];
  architectureRisks:      { reviewId: string; risk: string; futureImpactScore: number }[];
  conflictsDetected:      ConflictReport[];
  adrRequired:            { reviewId: string; reason: string }[];
  escalations:            { reviewId: string; summary: string }[];
  recommendations:        string[];
  rawReviews:             GuardianReview[];
}

export async function generateGuardianReport(limit = 50): Promise<GuardianReport> {
  const reviews = await getGuardianReviews(limit);
  const now     = new Date().toISOString();

  const summary: GuardianReportSummary = {
    totalReviewed:          reviews.length,
    approved:               reviews.filter((r) => r.decision === 'APPROVE').length,
    approvedWithConditions: reviews.filter((r) => r.decision === 'APPROVE_WITH_CONDITIONS').length,
    requestRevision:        reviews.filter((r) => r.decision === 'REQUEST_REVISION').length,
    rejected:               reviews.filter((r) => r.decision === 'REJECT').length,
    escalated:              reviews.filter((r) => r.decision === 'ESCALATE').length,
  };

  const reviewedProposals = reviews.map((r) => ({
    proposalId: r.proposalIds[0] ?? 'unknown',
    decision:   r.decision,
    priority:   r.gateResults.find((g) => g.gate === 'G5')?.status ?? 'UNKNOWN',
    risk:       r.implementationRisk.split(' ')[0],
  }));

  const ssiViolations = reviews
    .filter((r) => r.ssiValidation.status === 'VIOLATION')
    .map((r) => ({ reviewId: r.reviewId, violations: r.ssiValidation.violations }));

  const architectureRisks = reviews
    .filter((r) => r.futureImpactScore < 70)
    .map((r) => ({ reviewId: r.reviewId, risk: r.implementationRisk, futureImpactScore: r.futureImpactScore }));

  const conflictsDetected = reviews.flatMap((r) => r.conflicts);

  const adrRequired = reviews
    .filter((r) => r.adrRequired)
    .map((r) => ({ reviewId: r.reviewId, reason: r.adrReason }));

  const escalations = reviews
    .filter((r) => r.decision === 'ESCALATE')
    .map((r) => ({ reviewId: r.reviewId, summary: r.reviewSummary }));

  const recommendations = buildGuardianRecommendations(reviews, summary);

  console.log('[GUARDIAN_REPORT]', JSON.stringify({
    event:          'report_generated',
    totalReviewed:  summary.totalReviewed,
    approved:       summary.approved,
    escalated:      summary.escalated,
    adrRequired:    adrRequired.length,
    conflicts:      conflictsDetected.length,
    ssiViolations:  ssiViolations.length,
    architectureRisks: architectureRisks.length,
  }));

  return {
    generatedAt:       now,
    summary,
    reviewedProposals,
    ssiViolations,
    architectureRisks,
    conflictsDetected,
    adrRequired,
    escalations,
    recommendations,
    rawReviews:        reviews,
  };
}

function buildGuardianRecommendations(reviews: GuardianReview[], summary: GuardianReportSummary): string[] {
  const recs: string[] = [];

  if (summary.totalReviewed === 0) {
    recs.push('No proposals pending Guardian review. Learning pipeline is healthy — continue current monitoring cadence.');
    return recs;
  }

  if (summary.escalated > 0) {
    recs.push(`URGENT: ${summary.escalated} proposal(s) escalated to Human Product Owner. These require HPO decision before implementation can proceed.`);
  }

  const criticalConflicts = reviews.flatMap((r) => r.conflicts).filter((c) => c.severity === 'CRITICAL');
  if (criticalConflicts.length > 0) {
    recs.push(`CRITICAL CONFLICT: ${criticalConflicts.length} critical conflict(s) detected. Batch cannot proceed without HPO sequencing decision.`);
  }

  const ssiViolations = reviews.filter((r) => r.ssiValidation.status === 'VIOLATION');
  if (ssiViolations.length > 0) {
    recs.push(`SSI VIOLATION: ${ssiViolations.length} review(s) have SSI violations. Resolve ownership conflicts before implementation.`);
  }

  if (summary.approvedWithConditions > 0) {
    recs.push(`CONDITIONS REQUIRED: ${summary.approvedWithConditions} proposal(s) approved with conditions. All conditions must be met before Architecture Clearance is issued.`);
  }

  const adrReviews = reviews.filter((r) => r.adrRequired);
  if (adrReviews.length > 0) {
    recs.push(`ADR REQUIRED: ${adrReviews.length} proposal(s) require Architecture Decision Records. Create ADRs in AIOS/Architecture-Guardian/ before implementation.`);
  }

  const lowScores = reviews.filter((r) => r.futureImpactScore < 70);
  if (lowScores.length > 0) {
    recs.push(`ARCHITECTURE DEBT: ${lowScores.length} proposal(s) will incur architecture debt. Register in 10_ARCHITECTURE_DEBT_REGISTER.md and schedule remediation.`);
  }

  if (summary.requestRevision > 0) {
    recs.push(`REVISIONS NEEDED: ${summary.requestRevision} proposal(s) returned for revision. Evidence insufficient for Guardian approval. Resubmit when issue count meets MEDIUM confidence threshold.`);
  }

  if (summary.approved > 0 && summary.escalated === 0 && criticalConflicts.length === 0) {
    recs.push(`${summary.approved} proposal(s) approved. Architecture Clearance may be issued after Human Product Owner reviews the Guardian Report.`);
  }

  return recs;
}

// Re-exports for convenience
export {
  getGuardianReviews,
  getReviewsByDecision,
  type GuardianReview,
};
