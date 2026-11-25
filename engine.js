import { CASE } from './data.js';

export const records = [...CASE.evidence, ...CASE.newEvidence];
export const recordById = new Map(records.map(record => [record.id, record]));
export const experiments = {
  interviews: {title: 'Interview former members', short: 'Test whether temporary interruption drove their decision.', question: 'When does a temporary interruption become a permanent cancellation?', action: 'Speak with members whose notes mention absence, alongside people who left for other reasons. Ask about their decision before presenting a pause offer.', learn: 'Separate an unmet need from a reaction to an attractive suggestion. Look for accounts that contradict the initial interpretation.'},
  pilot: {title: 'Design a small pause pilot', short: 'Test actual take-up, constraints and return behaviour.', question: 'Would a workable pause option change what a defined group actually does?', action: 'First resolve billing, capacity and return conditions. Then design a limited, voluntary pilot with explicit measures and a suitable comparison.', learn: 'Observe take-up, return behaviour, delivery effort and commercial effects. Expressions of interest alone do not answer these questions.'},
  sample: {title: 'Audit a broader sample', short: 'Check how often this pattern occurs, and where it does not.', question: 'How often does the apparent need occur outside this selected set?', action: 'Review a broader set of cancellations and continuing memberships. Preserve other reasons and record how the sample was chosen.', learn: 'Estimate the reach and limits of the pattern. Track missing information and sampling limitations rather than treating silence as absence.'}
};

const investigationsByHypothesis = {
  pause: experiments,
  price: {
    interviews: {title: 'Interview former members', short: 'Understand affordability, value and other reasons for leaving.', question: 'What did members mean when they said the price was too high?', action: 'Speak with former members who named cost and people who left for other reasons. Explore ongoing affordability, perceived value and changing workspace needs before proposing a different price.', learn: 'Distinguish a persistent budget constraint from dissatisfaction with value or a temporary absence. A lower price may address some reasons and leave others untouched.'},
    pilot: {title: 'Test a viable pricing option', short: 'Test behaviour and commercial effects within workable economics.', question: 'Would a financially workable pricing option change decisions for a defined group?', action: 'First establish the costs and service conditions of a specific offer. Then design a limited, voluntary test with a suitable comparison and explicit measures of take-up, retention and financial contribution.', learn: 'Observe whether behaviour changes enough to justify the commercial effects. Stated interest in a cheaper option does not establish that the offer is sustainable.'},
    sample: {title: 'Audit a broader sample', short: 'Check where price matters and where another explanation fits.', question: 'How widespread is price-related departure beyond these selected records?', action: 'Review a broader set of cancellations and continuing memberships. Distinguish ongoing affordability from temporary absence and other reasons, and document survey non-response and sample selection.', learn: 'Estimate which groups report price concerns without treating every departure as a pricing problem. A reported reason alone does not show that changing the price would change behaviour.'}
  },
  service: {
    interviews: {title: 'Investigate the handoffs', short: 'Trace unresolved requests across teams and hear the member experience.', question: 'Where do handoffs turn a member request into avoidable friction?', action: 'Reconstruct selected requests with the member and the teams involved, including cases that went smoothly. Separate poor communication, unclear ownership and missing service options from dissatisfaction with the workspace itself.', learn: 'Identify which parts of the experience caused frustration and which constraints prevented resolution. A faster response alone may leave the underlying need unresolved.'},
    pilot: {title: 'Design a service flow pilot', short: 'Test clearer ownership and resolution of a defined request type.', question: 'Would a clearer service flow improve resolution for a defined set of requests?', action: 'Choose a request type that the business can fulfil. Design a limited pilot with clear ownership, supported billing steps and a suitable comparison. Set measures for resolution, repeat contacts, member experience and staff effort.', learn: 'Observe whether the revised flow reduces friction without transferring work elsewhere. A smoother process cannot by itself create a service option the business cannot deliver.'},
    sample: {title: 'Audit a broader sample', short: 'Check how often handoff friction occurs beyond these notes.', question: 'How common are frustrating handoffs across the wider service experience?', action: 'Review a broader set of resolved and unresolved requests, including different teams and request types. Examine member feedback alongside handoff counts and resolution outcomes, and record missing information.', learn: 'Estimate where friction occurs and whether it relates to service design, delivery or communication. Do not infer widespread service failure from a few difficult cases.'}
  }
};

export function getExperiment(hypothesisId, experimentId) {
  if (!Object.hasOwn(investigationsByHypothesis, hypothesisId)) throw new Error('Unknown hypothesis');
  const investigations = investigationsByHypothesis[hypothesisId];
  if (!Object.hasOwn(investigations, experimentId)) throw new Error('Unknown investigation');
  return investigations[experimentId];
}

export function analyse(activeIds, hypothesisId = 'pause') {
  const active = new Set([...activeIds].filter(id => recordById.has(id)));
  const hypothesis = CASE.hypotheses.find(h => h.id === hypothesisId);
  if (!hypothesis) throw new Error('Unknown hypothesis');
  const supports = hypothesis.supports.filter(id => active.has(id)).map(id => recordById.get(id));
  const counters = hypothesis.counters.filter(id => active.has(id)).map(id => recordById.get(id));
  const context = [...active].filter(id => !hypothesis.supports.includes(id) && !hypothesis.counters.includes(id)).map(id => recordById.get(id));
  const matched = hypothesis.rules.find(rule => rule.requiresAll.every(id => active.has(id)));
  let summary = matched?.summary || hypothesis.summary;
  if (active.size === 0) summary = 'No records are included. There is no active evidence here from which to assess this interpretation.';
  else if (supports.length === 0) summary = 'None of the included records is marked as supporting this interpretation. Examine the challenges and context before drawing a conclusion.';
  else if (hypothesisId === 'price' && active.has('N01')) summary = 'The wider fictional survey identifies ongoing cost as the most commonly reported main reason among respondents. Non-respondents may differ, and the survey does not establish whether changing price would change their decisions.';
  else if (hypothesisId === 'price' && !active.has('N01')) summary = 'An included member account explicitly describes an ongoing affordability problem. That supports price as an explanation for that member; it does not establish a general cause of departures.';
  else if (hypothesisId === 'service' && !active.has('E06')) summary = 'The feasibility note describes an unsupported billing workflow. That is an operational constraint, not evidence that the workspace service is broadly failing.';
  else if (hypothesisId === 'service' && !active.has('N03')) summary = 'An included member account describes frustrating handoffs around a requested absence. It supports investigating that experience, without establishing widespread service failure.';
  else if (hypothesisId === 'pause' && !CASE.newEvidence.some(r => active.has(r.id))) {
    summary = supports.length >= 3
      ? 'Several included records describe temporary absence, workarounds or a return. They may point to a shared need for a pause option. The evidence establishes neither how widespread that need is nor whether a viable service would meet it.'
      : 'A small number of included records suggests a temporary-absence need. That is a starting point for investigation, without establishing a broader pattern or a viable service.';
  }
  return {hypothesis, supports, counters, context, active, summary, departments: [...new Set(supports.map(r => r.department))]};
}

export function createBrief(activeIds, hypothesisId, experimentId) {
  const result = analyse(activeIds, hypothesisId);
  const experiment = getExperiment(hypothesisId, experimentId);
  const section = (title, items) => `${title}\n${items.length ? items.map(r => `${r.id} | ${r.source} | ${r.date}\n“${r.excerpt}”`).join('\n\n') : 'None included.'}`;
  return ['THE UNSEEN ORGANISATION — INVESTIGATION BRIEF',
    'Fictional case: Northstar Workspace. Prepared AI-assisted analysis; no live model calls. This is an illustrative exercise, not a demand forecast or performance evaluation.',
    `WORKING HYPOTHESIS\n${result.hypothesis.title}\n${result.summary}`,
    section('SUPPORTING RECORDS', result.supports), section('CHALLENGING RECORDS', result.counters), section('OTHER INCLUDED CONTEXT', result.context),
    `EXCLUDED ORIGINAL RECORDS\n${CASE.evidence.filter(r => !result.active.has(r.id)).map(r => r.id).join(', ') || 'None.'}`,
    `NEXT INVESTIGATION\n${experiment.title}\nQuestion: ${experiment.question}\nAction: ${experiment.action}\nWhat to learn: ${experiment.learn}`,
    'LIMITS\nSelected synthetic records cannot establish prevalence, causation, commercial viability or AI accuracy. Source counts are not confidence scores. Interpretations and evidence relationships were prepared in advance.',
    'A thought experiment by Dharshun Sri Dharan · AI4U\n#ThinkBeforeYouAI'
  ].join('\n\n');
}
