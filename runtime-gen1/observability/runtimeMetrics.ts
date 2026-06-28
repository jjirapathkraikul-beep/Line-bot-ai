// Runtime Metrics — Beta Release Sprint
// Accumulates per-process metrics from ConversationLogEntry events.
// getMetrics() emits [RUNTIME_METRICS] structured JSON on demand.
// No dashboards — structured data only.

import type { ConversationLogEntry } from './conversationLogger';

export interface RuntimeMetricsSnapshot {
  totalTurns:              number;
  averageLatencyMs:        number;
  fallbackRate:            number;  // 0.0–1.0
  validationFailureRate:   number;  // 0.0–1.0
  topIntents:              Record<string, number>;
  topCapabilities:         Record<string, number>;
  topDecisions:            Record<string, number>;
  recommendationRate:      number;
  leadCaptureStartRate:    number;
  leadCaptureCompleteRate: number;
  trustConversationRate:   number;
  medicalConversationRate: number;
  snapshotAt:              string;
}

// Accumulator — in-memory, reset on process restart
let _turns     = 0;
let _latency   = 0;
let _fallbacks = 0;
let _valFails  = 0;
let _recs      = 0;
let _lcStart   = 0;
let _lcDone    = 0;
let _trust     = 0;
let _medical   = 0;
const _intents:      Record<string, number> = {};
const _capabilities: Record<string, number> = {};
const _decisions:    Record<string, number> = {};

export function recordMetric(entry: ConversationLogEntry): void {
  _turns++;
  _latency += entry.latency;
  if (entry.fallbackUsed)            _fallbacks++;
  if (!entry.validatorPassed)        _valFails++;
  if (entry.recommendationDelivered) _recs++;
  if (entry.leadCaptureStarted)      _lcStart++;
  if (entry.leadCaptureCompleted)    _lcDone++;
  if (entry.trustFlow)               _trust++;
  if (entry.medicalFlow)             _medical++;
  _intents[entry.intent]           = (_intents[entry.intent]           ?? 0) + 1;
  _capabilities[entry.capability]  = (_capabilities[entry.capability]  ?? 0) + 1;
  _decisions[entry.decision]       = (_decisions[entry.decision]       ?? 0) + 1;
}

export function getMetrics(): RuntimeMetricsSnapshot {
  const n        = _turns;
  const rate     = (count: number) => (n > 0 ? count / n : 0);
  const snapshot: RuntimeMetricsSnapshot = {
    totalTurns:              n,
    averageLatencyMs:        n > 0 ? Math.round(_latency / n) : 0,
    fallbackRate:            rate(_fallbacks),
    validationFailureRate:   rate(_valFails),
    topIntents:              topN(_intents, 10),
    topCapabilities:         topN(_capabilities, 10),
    topDecisions:            topN(_decisions, 10),
    recommendationRate:      rate(_recs),
    leadCaptureStartRate:    rate(_lcStart),
    leadCaptureCompleteRate: rate(_lcDone),
    trustConversationRate:   rate(_trust),
    medicalConversationRate: rate(_medical),
    snapshotAt:              new Date().toISOString(),
  };
  console.log('[RUNTIME_METRICS]', JSON.stringify(snapshot));
  return snapshot;
}

export function resetMetrics(): void {
  _turns = 0; _latency = 0; _fallbacks = 0; _valFails = 0;
  _recs = 0; _lcStart = 0; _lcDone = 0; _trust = 0; _medical = 0;
  for (const k of Object.keys(_intents))      delete _intents[k];
  for (const k of Object.keys(_capabilities)) delete _capabilities[k];
  for (const k of Object.keys(_decisions))    delete _decisions[k];
}

function topN(counts: Record<string, number>, n: number): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, n),
  );
}
