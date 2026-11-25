export const CASE = {
  title: 'Make Yes Safer',
  organisation: 'Northstar Components',
  premise: 'One urgent payment. Two possible realities. Can your controls tell them apart without losing the legitimate opportunity?',
  methodNotice: 'A fictional, deterministic thought experiment with prepared AI-assisted scenarios. No live model calls, real payments or measured risk probabilities.',
  assumptions: [
    'Every request has consistent-looking invoice and email records. The baseline approver accepts those records; this is a chosen weak process, not a claim about all approval controls.',
    'Steps run sequentially: primary approval, any required bank verification, then any extra approval. Real timing and parallel work may differ.',
    'An available approver takes 10 minutes. Waiting for an unavailable approver takes 90 minutes. A pre-authorised deputy restores the 10-minute approval step.',
    'An additional approver takes 25 minutes and reads the same records. In this model they obtain no independent distinguishing evidence.',
    'Independent bank checking uses a separately held, previously validated contact and checks both the specific payment request and the new account details. A matching response is an observation, not guaranteed truth.',
    'A blanket hold defers every changed-bank request by 1,440 minutes. A hold does not release money in this model.',
    'A legitimate request creates the illustrated opportunity only if it is released by the stated cutoff. A diversion released after a cutoff is still a dangerous release.',
    'Scenario labels are known to the exercise author for classifying outcomes. The decision engine cannot use the legitimate/diversion label to decide what to do.',
    'The eight cases are deliberately selected, synthetic and prepared in advance. Counts describe these cases only; they are not real-world probabilities, coverage, assurance or an independent evaluation.'
  ],
  controls: [
    {id: 'independentCheck', title: 'Verify through an established contact', description: 'For a changed account, confirm this request and its bank details through a separately held, previously validated contact. Hold if the response conflicts or cannot be obtained.', tradeoff: 'Adds verification time. It depends on the trusted contact route remaining trustworthy.'},
    {id: 'deputy', title: 'Use a pre-authorised deputy', description: 'When the usual approver is absent, a deputy with the same authority can perform the approval step.', tradeoff: 'Reduces the modelled wait from 90 to 10 minutes. It adds no evidence of authenticity.'},
    {id: 'extraApproval', title: 'Add another approver', description: 'A second person reviews the same email and invoice records after the earlier steps.', tradeoff: 'Adds 25 minutes. More reviewers do not create independent evidence in this model.'},
    {id: 'blanketHold', title: 'Hold every account change', description: 'Defer every changed-bank request until the following day, regardless of the other selected controls.', tradeoff: 'Stops the modelled diversions that change accounts, and also misses every legitimate same-day account-change cutoff.'}
  ],
  openingIds: ['S01', 'S02'],
  coreIds: ['S01', 'S02', 'S03', 'S04', 'S07', 'S08'],
  challengeIds: ['S05', 'S06'],
  scenarios: [
    {
      id: 'S01', title: 'The real supplier', pair: 'same-request', group: 'opening', legitimate: true,
      request: 'Please release payment to our new bank account today. The shipment slot closes in 60 minutes. The invoice and account-change email agree.',
      publicFacts: ['Existing supplier; changed bank details', 'Invoice and email agree', 'Usual approver unavailable', 'Shipment cutoff in 60 minutes'],
      truth: 'The supplier really changed its bank account. The established contact can independently confirm this payment and the new details.',
      impact: 'An on-time release preserves the fictional shipment slot. A late release or hold misses it.',
      cutoffMinutes: 60, approverAvailable: false, changedBank: true,
      verification: {outcome: 'match', minutes: 15, detail: 'The separately held contact confirms this request and the new account details.'}
    },
    {
      id: 'S02', title: 'The lookalike diversion', pair: 'same-request', group: 'opening', legitimate: false,
      request: 'Please release payment to our new bank account today. The shipment slot closes in 60 minutes. The invoice and account-change email agree.',
      publicFacts: ['Existing supplier; changed bank details', 'Invoice and email agree', 'Usual approver unavailable', 'Shipment cutoff in 60 minutes'],
      truth: 'A compromised supplier email account supplied the invoice and change request. The real supplier denies the request when reached through the established contact.',
      impact: 'Releasing the request sends money to the wrong account. A hold prevents this modelled diversion.',
      cutoffMinutes: 60, approverAvailable: false, changedBank: true,
      verification: {outcome: 'mismatch', minutes: 15, detail: 'The separately held contact denies the request and the proposed account.'}
    },
    {
      id: 'S03', title: 'The tight but workable window', group: 'core', legitimate: true,
      request: 'Our confirmed account change is ready. Payment must clear the release desk within 45 minutes to keep today’s dispatch.',
      publicFacts: ['Existing supplier; changed bank details', 'Usual approver available', 'Established contact takes 25 minutes to reach', 'Dispatch cutoff in 45 minutes'],
      truth: 'The change is genuine. The known contact can verify it, but an additional sequential approval consumes the remaining window.',
      impact: 'The shipment slot is preserved only if release occurs within 45 minutes.',
      cutoffMinutes: 45, approverAvailable: true, changedBank: true,
      verification: {outcome: 'match', minutes: 25, detail: 'The known contact confirms the request and account after a 25-minute callback process.'}
    },
    {
      id: 'S04', title: 'Two reviewers, one compromised story', group: 'core', legitimate: false,
      request: 'The invoice and account-change confirmation are attached. Both show the same new bank details. Please approve within 90 minutes.',
      publicFacts: ['Existing supplier; changed bank details', 'Two matching documents from the same email chain', 'Usual approver available', 'Requested cutoff in 90 minutes'],
      truth: 'Both matching documents came from the same compromised source. A second reviewer sees the same convincing story. The established contact rejects the change.',
      impact: 'Releasing the request creates a diversion. A hold prevents it within this case.',
      cutoffMinutes: 90, approverAvailable: true, changedBank: true,
      verification: {outcome: 'mismatch', minutes: 15, detail: 'The established contact reports that neither the request nor the new bank details are theirs.'}
    },
    {
      id: 'S05', title: 'The genuine request nobody can verify in time', group: 'challenge', legitimate: true,
      request: 'The account change is genuine and the shipment closes in an hour, but our authorised contact cannot be reached before the cutoff.',
      publicFacts: ['Existing supplier; changed bank details', 'Usual approver unavailable', 'No reachable established contact during the window', 'Shipment cutoff in 60 minutes'],
      truth: 'The request is legitimate, but the selected process has no reliable independent route available in time. Knowing the exercise label does not give the payment team that evidence.',
      impact: 'A verification-based hold misses a legitimate shipment. This model contains no additional trustworthy route that can resolve the uncertainty in time.',
      cutoffMinutes: 60, approverAvailable: false, changedBank: true,
      verification: {outcome: 'unavailable', minutes: 30, detail: 'After 30 minutes, no confirmation from an established contact can be obtained in the available window.'}
    },
    {
      id: 'S06', title: 'The inherited trust failure', group: 'challenge', legitimate: false,
      request: 'Please use the new account. Your saved contact can confirm this request and the account details before the 60-minute cutoff.',
      publicFacts: ['Existing supplier; changed bank details', 'Usual approver available', 'Separately held contact provides matching confirmation', 'Requested cutoff in 60 minutes'],
      truth: 'The contact record was corrupted after its last validation. The callback reaches an attacker who confirms the request. The control obtains a matching answer through a route it wrongly assumes is still trustworthy.',
      impact: 'The diversion can survive the independent-check design. The case exposes an inherited trust assumption; the supplied controls do not resolve it while preserving all legitimate changed-bank payments.',
      cutoffMinutes: 60, approverAvailable: true, changedBank: true,
      verification: {outcome: 'match', minutes: 15, detail: 'The separately held contact returns a matching confirmation. In this challenge, the stored contact route is no longer trustworthy.'}
    },
    {
      id: 'S07', title: 'The ordinary payment', group: 'core', legitimate: true,
      request: 'Please pay the agreed invoice to the existing approved account within 45 minutes so we can release the shipment.',
      publicFacts: ['Existing supplier; unchanged approved bank details', 'Usual approver available', 'No account change to verify', 'Shipment cutoff in 45 minutes'],
      truth: 'This is a legitimate invoice using unchanged bank details. The changed-bank controls do not apply.',
      impact: 'An on-time payment preserves the shipment. Controls added to every request still consume time.',
      cutoffMinutes: 45, approverAvailable: true, changedBank: false,
      verification: {outcome: 'match', minutes: 0, detail: 'No changed-bank verification is required by the selected rule.'}
    },
    {
      id: 'S08', title: 'Urgency without a reachable contact', group: 'core', legitimate: false,
      request: 'Please process the new account now. Nobody on your established contact list is available, but the invoice is due within three hours.',
      publicFacts: ['Existing supplier; changed bank details', 'Usual approver unavailable', 'No reachable established contact during the window', 'Requested cutoff in 180 minutes'],
      truth: 'The requested change is a diversion. The available evidence cannot obtain confirmation through the established route; a rule requiring that evidence holds the payment.',
      impact: 'A hold prevents this modelled diversion. Having more time does not make an unverified request authentic.',
      cutoffMinutes: 180, approverAvailable: false, changedBank: true,
      verification: {outcome: 'unavailable', minutes: 30, detail: 'No confirmation through the established route is available after the 30-minute attempt.'}
    }
  ]
};

export const CATEGORY_META = {
  'justified-yes': {title: 'Legitimate, on time', description: 'A legitimate request was released within its modelled cutoff. This retrospective outcome is not proof that the decision was well supported.'},
  'dangerous-yes': {title: 'Dangerous yes', description: 'A modelled diversion was released, even if the stated cutoff had passed.'},
  'missed-legitimate': {title: 'Legitimate opportunity missed', description: 'A legitimate request was held or released after its modelled cutoff. This is not automatically an avoidable loss.'},
  'protective-hold': {title: 'Protective hold', description: 'The modelled diversion was not released.'}
};

