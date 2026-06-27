// Phase 10.4 — Knowledge Resolver tests
// Coverage: registry, loader (cache + security), resolver rules, runtime trace

import assert from 'node:assert/strict';

// ─── Registry tests ───────────────────────────────────────────────────────────

import {
  KNOWLEDGE_REGISTRY,
  ALWAYS_INCLUDE_SOURCES,
  TRUST_BLOCKED_TYPES,
  getSourcesForIntent,
} from '../../runtime-gen1/knowledge/knowledgeRegistry';

function pass(label: string) { console.log(`  ✓ ${label}`); }
function fail(label: string, err: unknown) { console.error(`  ✗ ${label}: ${err}`); process.exitCode = 1; }

// ── REGISTRY-01: CID-20 is always included ────────────────────────────────────
try {
  const cid20 = ALWAYS_INCLUDE_SOURCES.find((s) =>
    s.path === 'AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md'
  );
  assert.ok(cid20, 'CID-20 must be in ALWAYS_INCLUDE_SOURCES');
  assert.ok(cid20.mandatory, 'CID-20 must be mandatory');
  pass('REGISTRY-01: CID-20 is always included and mandatory');
} catch (e) { fail('REGISTRY-01', e); }

// ── REGISTRY-02: trust_concern has no product docs (SR-SEL-03) ────────────────
try {
  const trustSources = getSourcesForIntent('trust_concern');
  const hasProductDoc = trustSources.some((s) => TRUST_BLOCKED_TYPES.has(s.type));
  assert.ok(!hasProductDoc, 'trust_concern must not contain product/recommendation/sales docs');
  pass('REGISTRY-02: trust_concern contains no product docs (SR-SEL-03)');
} catch (e) { fail('REGISTRY-02', e); }

// ── REGISTRY-03: trust_concern loads ACP-08 Restrictions as first mandatory ───
try {
  const trustSources = getSourcesForIntent('trust_concern');
  const acp08 = trustSources.find((s) => s.path.includes('ACP-08') && s.path.includes('Restrictions'));
  assert.ok(acp08, 'ACP-08 Restrictions must be in trust_concern sources');
  assert.ok(acp08.mandatory, 'ACP-08 Restrictions must be mandatory in trust_concern');
  pass('REGISTRY-03: ACP-08 Restrictions is mandatory in trust_concern (SR-SEL-03)');
} catch (e) { fail('REGISTRY-03', e); }

// ── REGISTRY-04: medical_underwriting loads ACP-04 Restrictions as mandatory ──
try {
  const medSources = getSourcesForIntent('medical_underwriting');
  const acp04 = medSources.find((s) => s.path.includes('ACP-04') && s.path.includes('Restrictions'));
  assert.ok(acp04, 'ACP-04 Restrictions must be in medical_underwriting sources');
  assert.ok(acp04.mandatory, 'ACP-04 Restrictions must be mandatory');
  pass('REGISTRY-04: ACP-04 Restrictions is mandatory in medical_underwriting (SR-SEL-04)');
} catch (e) { fail('REGISTRY-04', e); }

// ── REGISTRY-05: medical_underwriting loads Medical.md and Underwriting.md ────
try {
  const medSources = getSourcesForIntent('medical_underwriting');
  const hasMedical = medSources.some((s) => s.path.includes('Knowledge/Medical.md') && s.mandatory);
  const hasUnderwriting = medSources.some((s) => s.path.includes('Underwriting.md') && s.mandatory);
  assert.ok(hasMedical, 'Medical.md must be mandatory in medical_underwriting');
  assert.ok(hasUnderwriting, 'Underwriting.md must be mandatory in medical_underwriting');
  pass('REGISTRY-05: Medical.md and Underwriting.md are mandatory in medical_underwriting');
} catch (e) { fail('REGISTRY-05', e); }

// ── REGISTRY-06: health_insurance loads Health_Insurance.md (not Cancer) ──────
try {
  const healthSources = getSourcesForIntent('health_insurance');
  const hasHealth = healthSources.some((s) => s.path.includes('Health_Insurance.md') && s.mandatory);
  const hasCancer = healthSources.some((s) => s.path.includes('Cancer_Insurance.md'));
  assert.ok(hasHealth, 'Health_Insurance.md must be in health_insurance sources');
  assert.ok(!hasCancer, 'Cancer_Insurance.md must NOT be in health_insurance sources');
  pass('REGISTRY-06: health_insurance loads Health_Insurance.md, not Cancer_Insurance.md');
} catch (e) { fail('REGISTRY-06', e); }

// ── REGISTRY-07: cancer_insurance loads Cancer_Insurance.md (not Health) ──────
try {
  const cancerSources = getSourcesForIntent('cancer_insurance');
  const hasCancer = cancerSources.some((s) => s.path.includes('Cancer_Insurance.md') && s.mandatory);
  const hasHealth = cancerSources.some((s) => s.path.includes('Health_Insurance.md'));
  assert.ok(hasCancer, 'Cancer_Insurance.md must be in cancer_insurance sources');
  assert.ok(!hasHealth, 'Health_Insurance.md must NOT be in cancer_insurance sources');
  pass('REGISTRY-07: cancer_insurance loads Cancer_Insurance.md, not Health_Insurance.md');
} catch (e) { fail('REGISTRY-07', e); }

// ── REGISTRY-08: investment_linked has ACP-07 Restrictions as mandatory ───────
try {
  const invSources = getSourcesForIntent('investment_linked');
  const acp07 = invSources.find((s) => s.path.includes('ACP-07') && s.path.includes('Restrictions'));
  assert.ok(acp07, 'ACP-07 Restrictions must be in investment_linked sources');
  assert.ok(acp07.mandatory, 'ACP-07 Restrictions must be mandatory (risk disclosure required)');
  pass('REGISTRY-08: ACP-07 Restrictions mandatory in investment_linked');
} catch (e) { fail('REGISTRY-08', e); }

// ── REGISTRY-09: claim_question loads Claim.md and ACP-15 Restrictions ────────
try {
  const claimSources = getSourcesForIntent('claim_question');
  const hasClaim = claimSources.some((s) => s.path.includes('Claim.md') && s.mandatory);
  const hasAcp15 = claimSources.some((s) => s.path.includes('ACP-15') && s.path.includes('Restrictions'));
  assert.ok(hasClaim, 'Claim.md must be mandatory in claim_question');
  assert.ok(hasAcp15, 'ACP-15 Restrictions must be in claim_question');
  pass('REGISTRY-09: claim_question loads Claim.md and ACP-15 Restrictions');
} catch (e) { fail('REGISTRY-09', e); }

// ── REGISTRY-10: unknown intent falls back to need_discovery sources ───────────
try {
  const unknownSources = getSourcesForIntent('unknown');
  const hasNeedDiscovery = unknownSources.some((s) => s.path.includes('ACP-10_NEED_DISCOVERY'));
  assert.ok(hasNeedDiscovery, 'unknown intent must fall back to ACP-10 Need Discovery');
  pass('REGISTRY-10: unknown intent returns Need Discovery sources');
} catch (e) { fail('REGISTRY-10', e); }

// ── REGISTRY-11: getSourcesForIntent falls back to unknown for unrecognised ───
try {
  const sources = getSourcesForIntent('completely_unknown_xyz');
  const hasNeedDiscovery = sources.some((s) => s.path.includes('ACP-10_NEED_DISCOVERY'));
  assert.ok(hasNeedDiscovery, 'Unrecognised intent must fall back to unknown/need_discovery');
  pass('REGISTRY-11: getSourcesForIntent falls back to unknown for unrecognised intents');
} catch (e) { fail('REGISTRY-11', e); }

// ── REGISTRY-12: all registry entries have valid AIOS/ prefix ─────────────────
try {
  let invalidPaths: string[] = [];
  for (const [intent, sources] of Object.entries(KNOWLEDGE_REGISTRY)) {
    for (const src of sources) {
      if (!src.path.startsWith('AIOS/')) {
        invalidPaths.push(`${intent}: ${src.path}`);
      }
    }
  }
  for (const src of ALWAYS_INCLUDE_SOURCES) {
    if (!src.path.startsWith('AIOS/')) invalidPaths.push(`ALWAYS_INCLUDE: ${src.path}`);
  }
  assert.equal(invalidPaths.length, 0, `Invalid paths found: ${invalidPaths.join(', ')}`);
  pass('REGISTRY-12: all registry paths start with AIOS/');
} catch (e) { fail('REGISTRY-12', e); }

// ── REGISTRY-13: human_handoff loads Human_Handoff.md and Escalation_Rules.md ─
try {
  const humanSources = getSourcesForIntent('human_handoff');
  const hasHandoff = humanSources.some((s) => s.path.includes('Human_Handoff.md') && s.mandatory);
  const hasEscalation = humanSources.some((s) => s.path.includes('Escalation_Rules.md') && s.mandatory);
  assert.ok(hasHandoff, 'Human_Handoff.md must be mandatory in human_handoff');
  assert.ok(hasEscalation, 'Escalation_Rules.md must be mandatory in human_handoff');
  pass('REGISTRY-13: human_handoff includes mandatory Human_Handoff.md and Escalation_Rules.md');
} catch (e) { fail('REGISTRY-13', e); }

// ─── Loader tests (async) ─────────────────────────────────────────────────────

import {
  loadKnowledgeFile,
  clearKnowledgeCache,
  getKnowledgeCacheSize,
} from '../../runtime-gen1/knowledge/knowledgeLoader';

async function runLoaderTests() {
  // ── LOADER-01: no cache at module import ─────────────────────────────────────
  try {
    clearKnowledgeCache();
    assert.equal(getKnowledgeCacheSize(), 0, 'Cache must be empty after clear');
    pass('LOADER-01: cache is empty after clearKnowledgeCache (no I/O at module import)');
  } catch (e) { fail('LOADER-01', e); }

  // ── LOADER-02: loads existing AIOS file ──────────────────────────────────────
  try {
    clearKnowledgeCache();
    const snippet = await loadKnowledgeFile('AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md');
    assert.ok(snippet !== null, 'CID-20 must load successfully');
    assert.ok(snippet!.content.length > 0, 'Content must not be empty');
    assert.ok(snippet!.charCount > 0, 'charCount must be > 0');
    assert.equal(snippet!.isCacheHit, false, 'First load must not be a cache hit');
    pass('LOADER-02: loads existing AIOS file successfully');
  } catch (e) { fail('LOADER-02', e); }

  // ── LOADER-03: cache hit on second load ──────────────────────────────────────
  try {
    clearKnowledgeCache();
    const first = await loadKnowledgeFile('AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md');
    assert.equal(first?.isCacheHit, false, 'First load must not be cache hit');
    const second = await loadKnowledgeFile('AIOS/ConversationDataset/20_CONVERSATION_PATTERNS.md');
    assert.equal(second?.isCacheHit, true, 'Second load must be a cache hit');
    assert.equal(second?.content, first?.content, 'Cached content must match original');
    assert.equal(getKnowledgeCacheSize(), 1, 'Cache must have exactly 1 entry');
    pass('LOADER-03: second load returns cache hit with identical content');
  } catch (e) { fail('LOADER-03', e); }

  // ── LOADER-04: missing file returns null (graceful) ───────────────────────────
  try {
    const result = await loadKnowledgeFile('AIOS/Domains/Insurance/Overview.md');
    assert.equal(result, null, 'Missing file must return null without throwing');
    pass('LOADER-04: missing file returns null gracefully');
  } catch (e) { fail('LOADER-04', e); }

  // ── LOADER-05: path outside AIOS/ is rejected ────────────────────────────────
  try {
    const r1 = await loadKnowledgeFile('../etc/passwd');
    const r2 = await loadKnowledgeFile('/etc/passwd');
    const r3 = await loadKnowledgeFile('lib/session.ts');
    const r4 = await loadKnowledgeFile('../../package.json');
    assert.equal(r1, null, '../etc/passwd must be rejected');
    assert.equal(r2, null, '/etc/passwd must be rejected');
    assert.equal(r3, null, 'lib/session.ts must be rejected (not under AIOS/)');
    assert.equal(r4, null, '../../package.json must be rejected');
    pass('LOADER-05: paths outside AIOS/ are rejected (security)');
  } catch (e) { fail('LOADER-05', e); }

  // ── LOADER-06: AIOS/CapabilityPackages path loads correctly ──────────────────
  try {
    clearKnowledgeCache();
    const snippet = await loadKnowledgeFile('AIOS/CapabilityPackages/ACP-08_TRUST_ADVISOR/Restrictions.md');
    assert.ok(snippet !== null, 'ACP-08 Restrictions.md must load');
    assert.equal(snippet!.trustLevel, 'AUTHORITATIVE', 'ACP paths must have AUTHORITATIVE trust level');
    pass('LOADER-06: ACP capability package files load with AUTHORITATIVE trust level');
  } catch (e) { fail('LOADER-06', e); }

  // ── LOADER-07: title extracted from first H1 ──────────────────────────────────
  try {
    clearKnowledgeCache();
    const snippet = await loadKnowledgeFile('AIOS/Domains/Insurance/Trust/Trust_Engine.md');
    assert.ok(snippet !== null, 'Trust_Engine.md must load');
    assert.ok(snippet!.title.length > 0, 'Title must be non-empty');
    pass(`LOADER-07: title extracted correctly: "${snippet!.title}"`);
  } catch (e) { fail('LOADER-07', e); }

  // ── LOADER-08: mandatory flag is passed through ───────────────────────────────
  try {
    clearKnowledgeCache();
    const mandatory = await loadKnowledgeFile(
      'AIOS/Domains/Insurance/Knowledge/Medical.md',
      { mandatory: true },
    );
    assert.ok(mandatory !== null, 'Medical.md must load');
    assert.equal(mandatory!.isMandatory, true, 'mandatory flag must be true');
    const optional = await loadKnowledgeFile(
      'AIOS/Domains/Insurance/Knowledge/Medical.md',
      { mandatory: false },
    );
    assert.equal(optional!.isMandatory, false, 'mandatory flag must be false');
    pass('LOADER-08: mandatory flag is correctly passed through to snippet');
  } catch (e) { fail('LOADER-08', e); }
}

// ─── Resolver tests (async) ───────────────────────────────────────────────────

import { resolveKnowledge } from '../../runtime-gen1/knowledge/knowledgeResolver';
import type { KnowledgeSelectionInput } from '../../runtime-gen1/knowledge/knowledgeTypes';
import type { IntentDetectorResult } from '../../runtime-gen1/capability/intentDetector';
import type { CapabilityLoaderResult, CapabilityEntry } from '../../runtime-gen1/capability/capabilityLoader';
import type { RuntimeMemoryResolution } from '../../runtime-gen1/memory/memoryTypes';

function makeIntent(
  intent: string,
  overrides: Partial<IntentDetectorResult['flags']> = {},
): IntentDetectorResult {
  return {
    intent,
    confidence: 0.9,
    matchedKeywords: [],
    flags: {
      isTrustSignal: false,
      isMedicalSignal: false,
      isEmergency: false,
      isHumanRequest: false,
      ...overrides,
    },
  };
}

const STUB_CAP_ENTRY: CapabilityEntry = {
  capId: 'CAP-001', acpId: 'ACP-01', name: 'Greeting', description: 'Greeting', tier: 'STANDARD',
};

function makeCapability(overrides: Partial<CapabilityLoaderResult> = {}): CapabilityLoaderResult {
  return {
    primaryCapability: STUB_CAP_ENTRY,
    secondaryCapabilities: [],
    selectedAcpPaths: [],
    priority: 'STANDARD',
    shouldInterruptCurrentState: false,
    reason: 'test',
    ...overrides,
  };
}

const STUB_MEMORY: RuntimeMemoryResolution = {
  customerProfile: {
    real_name: null, display_name: null, age: null, gender: null, phone: null,
    preferred_contact_time: null, budget_annual: null, monthly_income: null,
    interest_category: null, product_interest: null, health_status: null,
    crm_saved: false, fields_captured: [],
  },
  trustMemory: {
    trustConcernActive: false, trustConcernTurn: null, turnsSinceTrustConcern: null,
    leadCaptureAllowed: true, trustResolved: false, credentialsDelivered: false, suspendedAcp: null,
  },
  medicalMemory: {
    medicalConcernActive: false, conditionsDisclosed: [], conditionsAssessed: [],
    conditionsPending: [], underwritingContextReady: false, followUpTurnCount: 0,
  },
  leadMemory: {
    captureStage: 'IDLE', nameRequested: false, phoneRequested: false, timeRequested: false,
    nameDeclined: false, phoneDeclined: false, timeDeclined: false, interruptedAtStage: null, valueDelivered: false,
  },
  conversationMemory: {
    turnCount: 1, currentState: 'idle', priorState: null, lastIntent: null, unresolvedQuestion: null,
  },
  knownFields: [],
  missingFields: [],
  deferredFields: [],
  neverAskAgainFields: [],
  shouldAskField: false,
  nextBestFieldToAsk: null,
  extractedFacts: [],
  memoryDecisionReason: 'test stub',
  memoryTrace: { blocked: null, priorityListUsed: 'LEAD_FIELD_PRIORITY', fieldsEvaluated: [] },
};

function makeInput(intent: string, flagOverrides: Partial<IntentDetectorResult['flags']> = {}): KnowledgeSelectionInput {
  return {
    intentResult: makeIntent(intent, flagOverrides),
    capabilityResult: makeCapability(),
    memoryResult: STUB_MEMORY,
  };
}

async function runResolverTests() {
  // ── RESOLVER-01: health_insurance loads Health_Insurance.md ──────────────────
  try {
    const result = await resolveKnowledge(makeInput('health_insurance'));
    const hasHealth = result.loadedSnippets.some((s) => s.sourcePath.includes('Health_Insurance.md'));
    assert.ok(hasHealth, 'health_insurance must load Health_Insurance.md');
    pass('RESOLVER-01: health_insurance loads Health_Insurance.md');
  } catch (e) { fail('RESOLVER-01', e); }

  // ── RESOLVER-02: CID-20 always loaded ────────────────────────────────────────
  try {
    const result = await resolveKnowledge(makeInput('greeting'));
    const hasCid20 = result.loadedSnippets.some((s) =>
      s.sourcePath.includes('20_CONVERSATION_PATTERNS.md')
    );
    assert.ok(hasCid20, 'CID-20 must always be loaded (SR-SEL-09)');
    pass('RESOLVER-02: CID-20 always loaded regardless of intent');
  } catch (e) { fail('RESOLVER-02', e); }

  // ── RESOLVER-03: trust signal blocks product docs ────────────────────────────
  try {
    const result = await resolveKnowledge(makeInput('health_insurance', { isTrustSignal: true }));
    const hasProduct = result.loadedSnippets.some((s) =>
      s.sourcePath.includes('/Products/')
    );
    assert.ok(!hasProduct, 'Trust signal must block product docs (SR-SEL-03)');
    assert.ok(result.knowledgeTrace.blockedProductDocs, 'blockedProductDocs must be true');
    const hasTrustEngine = result.selectedSources.some((s) =>
      s.path.includes('Trust_Engine.md')
    );
    assert.ok(hasTrustEngine, 'Trust_Engine.md must be selected when trust signal active');
    pass('RESOLVER-03: trust signal overrides intent and blocks product docs (SR-SEL-03)');
  } catch (e) { fail('RESOLVER-03', e); }

  // ── RESOLVER-04: medical_underwriting adds uncertainty fragment ───────────────
  try {
    const result = await resolveKnowledge(makeInput('medical_underwriting', { isMedicalSignal: true }));
    const hasFragment = result.loadedSnippets.some((s) =>
      s.sourcePath === 'AIOS/Mandatory/medical_uncertainty_language'
    );
    assert.ok(hasFragment, 'Medical underwriting must include uncertainty language fragment');
    assert.ok(
      result.knowledgeTrace.mandatoryFragmentsAdded.includes('medical_uncertainty_language'),
      'mandatoryFragmentsAdded must include medical_uncertainty_language',
    );
    pass('RESOLVER-04: medical_underwriting injects uncertainty language fragment (mandatory)');
  } catch (e) { fail('RESOLVER-04', e); }

  // ── RESOLVER-05: medical flag on non-medical intent also injects fragment ─────
  try {
    const result = await resolveKnowledge(makeInput('health_insurance', { isMedicalSignal: true }));
    const hasFragment = result.loadedSnippets.some((s) =>
      s.sourcePath === 'AIOS/Mandatory/medical_uncertainty_language'
    );
    assert.ok(hasFragment, 'Medical signal must inject uncertainty fragment even for non-medical intent');
    pass('RESOLVER-05: isMedicalSignal=true injects uncertainty fragment for any intent');
  } catch (e) { fail('RESOLVER-05', e); }

  // ── RESOLVER-06: investment_linked adds risk disclosure fragment ──────────────
  try {
    const result = await resolveKnowledge(makeInput('investment_linked'));
    const hasFragment = result.loadedSnippets.some((s) =>
      s.sourcePath === 'AIOS/Mandatory/investment_risk_disclosure'
    );
    assert.ok(hasFragment, 'investment_linked must include risk disclosure fragment');
    assert.ok(
      result.knowledgeTrace.mandatoryFragmentsAdded.includes('investment_risk_disclosure'),
      'mandatoryFragmentsAdded must include investment_risk_disclosure',
    );
    pass('RESOLVER-06: investment_linked injects risk disclosure fragment (mandatory)');
  } catch (e) { fail('RESOLVER-06', e); }

  // ── RESOLVER-07: unknown intent loads need discovery without crashing ─────────
  try {
    const result = await resolveKnowledge(makeInput('unknown'));
    assert.ok(result.loadedSnippets.length > 0, 'unknown intent must load at least one snippet');
    // Overview.md is missing — it must appear in missingSources, not crash
    const overviewIsMissing = result.missingSources.includes('AIOS/Domains/Insurance/Overview.md');
    assert.ok(overviewIsMissing, 'Missing Overview.md must appear in missingSources (graceful)');
    const hasWarning = result.warnings.some((w) => w.includes('Overview.md'));
    assert.ok(hasWarning, 'Missing file must produce a warning');
    pass('RESOLVER-07: unknown intent loads gracefully; missing Overview.md in missingSources');
  } catch (e) { fail('RESOLVER-07', e); }

  // ── RESOLVER-08: mandatorySources and optionalSources are populated ───────────
  try {
    const result = await resolveKnowledge(makeInput('trust_concern'));
    assert.ok(result.mandatorySources.length > 0, 'mandatorySources must not be empty for trust_concern');
    assert.ok(result.knowledgeTrace.sourcesConsidered > 0, 'sourcesConsidered must be > 0');
    assert.ok(result.knowledgeTrace.sourcesSelected > 0, 'sourcesSelected must be > 0');
    pass('RESOLVER-08: mandatorySources/optionalSources populated for trust_concern');
  } catch (e) { fail('RESOLVER-08', e); }

  // ── RESOLVER-09: trust_concern does not load Health_Insurance.md ─────────────
  try {
    const result = await resolveKnowledge(makeInput('trust_concern'));
    const hasHealthProduct = result.loadedSnippets.some((s) =>
      s.sourcePath.includes('Health_Insurance.md')
    );
    assert.ok(!hasHealthProduct, 'trust_concern must NOT load Health_Insurance.md');
    pass('RESOLVER-09: trust_concern does not load Health_Insurance.md');
  } catch (e) { fail('RESOLVER-09', e); }

  // ── RESOLVER-10: tax_planning loads Tax.md and Tax_Planning.md ───────────────
  try {
    const result = await resolveKnowledge(makeInput('tax_planning'));
    const hasTaxKnowledge = result.loadedSnippets.some((s) =>
      s.sourcePath.includes('Knowledge/Tax.md')
    );
    const hasTaxProduct = result.loadedSnippets.some((s) =>
      s.sourcePath.includes('Products/Tax_Planning.md')
    );
    assert.ok(hasTaxKnowledge, 'tax_planning must load Knowledge/Tax.md');
    assert.ok(hasTaxProduct, 'tax_planning must load Products/Tax_Planning.md');
    pass('RESOLVER-10: tax_planning loads both Knowledge/Tax.md and Products/Tax_Planning.md');
  } catch (e) { fail('RESOLVER-10', e); }

  // ── RESOLVER-11: knowledgeDecisionReason is non-empty ────────────────────────
  try {
    const result = await resolveKnowledge(makeInput('health_insurance'));
    assert.ok(
      result.knowledgeTrace.knowledgeDecisionReason.length > 0,
      'knowledgeDecisionReason must be non-empty',
    );
    assert.ok(
      result.knowledgeTrace.knowledgeDecisionReason.includes('intent=health_insurance'),
      'knowledgeDecisionReason must include intent',
    );
    pass('RESOLVER-11: knowledgeDecisionReason includes intent in trace');
  } catch (e) { fail('RESOLVER-11', e); }
}

// ─── Runtime trace integration tests (async) ─────────────────────────────────

import { execute } from '../../runtime-gen1/core/runtime';
import type { RuntimeInput } from '../../runtime-gen1/core/types';

function makeRuntimeInput(message: string): RuntimeInput {
  return {
    userId:      'test-user-gen1-phase104',
    message,
    session:     {},
    displayName: 'Test User',
    replyToken:  'tok_test',
    timestamp:   new Date().toISOString(),
  };
}

async function runRuntimeTraceTests() {
  // ── TRACE-01: runtime trace includes Phase 10.4 knowledge fields ──────────────
  try {
    const output = await execute(makeRuntimeInput('สนใจประกันสุขภาพครับ'));
    const { trace } = output;
    assert.ok(trace.selectedKnowledgePaths !== undefined, 'trace.selectedKnowledgePaths must exist');
    assert.ok(trace.loadedKnowledgeCount !== undefined, 'trace.loadedKnowledgeCount must exist');
    assert.ok(trace.missingKnowledgePaths !== undefined, 'trace.missingKnowledgePaths must exist');
    assert.ok(trace.knowledgeDecisionReason !== undefined, 'trace.knowledgeDecisionReason must exist');
    assert.ok(trace.mandatoryKnowledgeIncluded !== undefined, 'trace.mandatoryKnowledgeIncluded must exist');
    pass('TRACE-01: runtime trace includes all Phase 10.4 knowledge fields');
  } catch (e) { fail('TRACE-01', e); }

  // ── TRACE-02: runtime version bumped to v0.4.0 ────────────────────────────────
  try {
    const output = await execute(makeRuntimeInput('สวัสดีครับ'));
    assert.equal(output.runtimeVersion, 'gen1-stub-0.4.0', 'runtimeVersion must be gen1-stub-0.4.0');
    pass('TRACE-02: runtimeVersion is gen1-stub-0.4.0');
  } catch (e) { fail('TRACE-02', e); }

  // ── TRACE-03: selectedKnowledgePaths is an array of AIOS/ paths ──────────────
  try {
    const output = await execute(makeRuntimeInput('ผมเป็นเบาหวาน จะซื้อประกันได้ไหม'));
    const { trace } = output;
    assert.ok(Array.isArray(trace.selectedKnowledgePaths), 'selectedKnowledgePaths must be an array');
    for (const p of trace.selectedKnowledgePaths!) {
      assert.ok(p.startsWith('AIOS/'), `Path must start with AIOS/: ${p}`);
    }
    assert.ok((trace.loadedKnowledgeCount ?? 0) > 0, 'loadedKnowledgeCount must be > 0');
    pass('TRACE-03: selectedKnowledgePaths contains only AIOS/ paths and loadedKnowledgeCount > 0');
  } catch (e) { fail('TRACE-03', e); }

  // ── TRACE-04: trust signal in runtime injects trust knowledge sources ─────────
  try {
    const output = await execute(makeRuntimeInput('คุณเป็นมิจฉาชีพหรือเปล่า?'));
    const { trace } = output;
    const hasTrustPath = (trace.selectedKnowledgePaths ?? []).some((p) =>
      p.includes('Trust')
    );
    assert.ok(hasTrustPath, 'Trust signal must select trust knowledge paths');
    pass('TRACE-04: trust signal in runtime message selects trust knowledge paths');
  } catch (e) { fail('TRACE-04', e); }
}

// ─── Run all tests ────────────────────────────────────────────────────────────

console.log('\n=== Phase 10.4 — Knowledge Resolver Tests ===\n');
console.log('--- Registry tests ---');
// Registry tests are synchronous (already ran above)

(async () => {
  console.log('\n--- Loader tests ---');
  await runLoaderTests();

  console.log('\n--- Resolver tests ---');
  await runResolverTests();

  console.log('\n--- Runtime trace tests ---');
  await runRuntimeTraceTests();

  const code = process.exitCode ?? 0;
  console.log(`\n=== ${code === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===\n`);
  if (code !== 0) process.exit(1);
})();
