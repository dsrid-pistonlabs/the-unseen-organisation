import { CASE, CATEGORY_META } from './data.js';

export const DEFAULT_CONTROLS = Object.freeze({independentCheck: false, deputy: false, extraApproval: false, blanketHold: false});
export const scenarioById = new Map(CASE.scenarios.map(scenario => [scenario.id, scenario]));

export function normaliseControls(input = {}) {
  return Object.fromEntries(Object.keys(DEFAULT_CONTROLS).map(id => [id, input[id] === true]));
}

function resolveScenario(value) {
  const scenario = typeof value === 'string' ? scenarioById.get(value) : value;
  if (!scenario || !scenario.id || !Number.isFinite(scenario.cutoffMinutes) || scenario.cutoffMinutes < 0 || typeof scenario.legitimate !== 'boolean' || typeof scenario.changedBank !== 'boolean' || typeof scenario.approverAvailable !== 'boolean' || !['match','mismatch','unavailable'].includes(scenario.verification?.outcome) || !Number.isFinite(scenario.verification.minutes) || scenario.verification.minutes < 0) {
    throw new Error('Unknown or invalid scenario');
  }
  return scenario;
}

export function runScenario(value, selectedControls = DEFAULT_CONTROLS) {
  const scenario = resolveScenario(value);
  const controls = normaliseControls(selectedControls);
  const trace = [];
  let elapsedMinutes = 0;
  const step = (stage, title, detail, minutes = 0) => {
    elapsedMinutes += minutes;
    trace.push({stage, title, detail, minutes, totalMinutes: elapsedMinutes});
  };
  step('request', 'A consistent-looking request arrives', 'The invoice and request records agree. That agreement is available to the workflow; the scenario’s hidden label is not.');

  let action = 'release';
  let reason = '';
  let verified = false;
  if (controls.blanketHold && scenario.changedBank) {
    step('blanket-hold', 'Account change deferred to tomorrow', 'The blanket policy holds this changed-bank request for 1,440 modelled minutes. No release occurs in this case, and the other selected steps do not override this hold.', 1440);
    action = 'hold';
    reason = 'The blanket rule holds every changed-bank request, regardless of its authenticity.';
  } else {
    const approvalMinutes = scenario.approverAvailable || controls.deputy ? 10 : 90;
    const usesDeputy = !scenario.approverAvailable && controls.deputy;
    step('approval', usesDeputy ? 'Pre-authorised deputy reviews the request' : scenario.approverAvailable ? 'Usual approver reviews the request' : 'Wait for the usual approver', usesDeputy ? 'The authorised deputy accepts the same consistent-looking records. This restores the short approval step; it does not authenticate the account change.' : scenario.approverAvailable ? 'The approver accepts the consistent-looking records in this deliberately simplified baseline process.' : 'The approver is unavailable. After the modelled wait, they accept the consistent-looking records.', approvalMinutes);

    if (controls.independentCheck && scenario.changedBank) {
      const check = scenario.verification;
      step('verification', check.outcome === 'match' ? 'A matching confirmation is obtained' : check.outcome === 'mismatch' ? 'Independent confirmation conflicts' : 'Required confirmation is unavailable', check.detail, check.minutes);
      verified = check.outcome === 'match';
      if (!verified) {
        action = 'hold';
        reason = check.outcome === 'mismatch' ? 'The independently obtained response conflicts with the requested payment or bank details.' : 'The required independent confirmation cannot be obtained. The workflow holds instead of treating missing evidence as approval.';
      }
    } else {
      step('verification', scenario.changedBank ? 'No independent account check required' : 'The account has not changed', scenario.changedBank ? 'The selected design relies on the original records. It obtains no additional evidence that could distinguish the two opening realities.' : 'The changed-bank verification rule does not apply to this unchanged-account request.');
    }

    if (action === 'release' && controls.extraApproval) {
      step('extra-approval', 'Another approver reviews the same records', 'The second approver accepts the same record set. This model gives that step no independent distinguishing evidence.', 25);
    }
    if (action === 'release') {
      reason = scenario.changedBank && controls.independentCheck
        ? 'The required check returned a matching confirmation and the selected approvals completed. That confirmation can still depend on a failed trust assumption.'
        : 'The selected approvals completed without a required conflicting or missing confirmation.';
      step('release', 'Payment released in the model', 'Release is the workflow action. Its authenticity and timing are classified separately below.');
    } else {
      step('hold', 'Payment held in the model', 'No payment is released. Any later escalation or recovery route lies outside this bounded scenario.');
    }
  }

  const withinDeadline = action === 'release' && elapsedMinutes <= scenario.cutoffMinutes;
  const category = scenario.legitimate
    ? withinDeadline ? 'justified-yes' : 'missed-legitimate'
    : action === 'release' ? 'dangerous-yes' : 'protective-hold';
  return {
    scenarioId: scenario.id,
    scenario,
    action,
    elapsedMinutes,
    withinDeadline,
    category,
    title: CATEGORY_META[category].title,
    reason,
    trace,
    controls,
    verified,
    timingNote: action === 'hold' && controls.blanketHold && scenario.changedBank ? 'Modelled policy deferral; payment remains held.' : action === 'hold' ? 'Time until this modelled hold decision; payment remains held.' : withinDeadline ? 'Released within the modelled cutoff.' : 'Released after the modelled cutoff.'
  };
}

function selectedScenarios(ids) {
  const values = ids === undefined ? CASE.scenarios.map(s => s.id) : [...new Set(ids)];
  return values.map(resolveScenario);
}

export function runSuite(controls = DEFAULT_CONTROLS, ids) {
  const scenarios = selectedScenarios(ids);
  const results = scenarios.map(scenario => runScenario(scenario, controls));
  const counts = {justifiedYes: 0, dangerousYes: 0, missedLegitimate: 0, protectiveHold: 0};
  const keys = {'justified-yes': 'justifiedYes', 'dangerous-yes': 'dangerousYes', 'missed-legitimate': 'missedLegitimate', 'protective-hold': 'protectiveHold'};
  for (const result of results) counts[keys[result.category]] += 1;
  return {results, counts, total: results.length, legitimateCount: scenarios.filter(s => s.legitimate).length, diversionCount: scenarios.filter(s => !s.legitimate).length};
}

export function compareSuite(controls = DEFAULT_CONTROLS, ids) {
  const baseline = runSuite(DEFAULT_CONTROLS, ids);
  const current = runSuite(controls, ids);
  const changes = current.results.map((result, index) => ({scenarioId: result.scenarioId, before: baseline.results[index].category, after: result.category, changed: baseline.results[index].category !== result.category, beforeMinutes: baseline.results[index].elapsedMinutes, afterMinutes: result.elapsedMinutes}));
  return {baseline, current, changes};
}

export function createBrief(selectedControls = DEFAULT_CONTROLS, ids) {
  const controls = normaliseControls(selectedControls);
  const comparison = compareSuite(controls, ids);
  const enabled = CASE.controls.filter(c => controls[c.id]);
  const describeCounts = counts => `Legitimate release on time: ${counts.justifiedYes}\nDangerous yes: ${counts.dangerousYes}\nLegitimate opportunity missed: ${counts.missedLegitimate}\nProtective hold: ${counts.protectiveHold}`;
  return [
    'MAKE YES SAFER — CONTROL STRESS TEST',
    `${CASE.organisation}: a fictional payment workflow. Prepared AI-assisted scenarios, deterministic model, no live model calls and no real payments.`,
    `SELECTED DESIGN\n${enabled.length ? enabled.map(c => `${c.title}\n${c.description}\nTradeoff: ${c.tradeoff}`).join('\n\n') : 'Baseline process only.'}`,
    `SCOPE\n${comparison.current.total} selected prepared cases: ${comparison.current.legitimateCount} legitimate requests and ${comparison.current.diversionCount} diversions.\nThese are deliberately selected examples, not estimates of event frequency or control effectiveness.`,
    `BASELINE OUTCOMES\n${describeCounts(comparison.baseline.counts)}`,
    `SELECTED DESIGN OUTCOMES\n${describeCounts(comparison.current.counts)}`,
    `CASE RESULTS\n${comparison.current.results.map(result => `${result.scenarioId} | ${result.scenario.title}\n${result.title}. Action: ${result.action}. Modelled elapsed time: ${result.elapsedMinutes} minutes. Cutoff: ${result.scenario.cutoffMinutes} minutes.\n${result.reason}\nHidden reality: ${result.scenario.truth}\nTrace:\n${result.trace.map(t => `- ${t.title} (+${t.minutes} min; total ${t.totalMinutes} min): ${t.detail}`).join('\n')}`).join('\n\n')}`,
    'WHAT TO CHALLENGE NEXT\nWhich real evidence distinguishes a justified yes from a dangerous one? Which trust assumptions could fail? Which legitimate requests would the design delay or block? What additional evidence would support a justified change?',
    `MODEL ASSUMPTIONS AND LIMITS\n${CASE.assumptions.map(value => `- ${value}`).join('\n')}`,
    'The exercise can expose assumptions in the chosen design. It does not establish real-world safety, saved revenue, reduced loss, comprehensive scenario coverage or an optimal control design. Opportunity costs are illustrated, not valued.',
    'A thought experiment by Dharshun Sri Dharan · AI4U\n#ThinkBeforeYouAI'
  ].join('\n\n');
}

