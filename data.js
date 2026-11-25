export const CASE = {
  organisation: 'Northstar Workspace',
  title: 'The Unseen Organisation',
  premise: 'Four teams are meeting their targets. Their notes may be describing one unmet customer need.',
  sampleNotice: 'Fictional company, synthetic records and illustrative metrics. This deliberately selected case demonstrates an interpretation; it does not establish customer demand or measured AI performance.',
  period: 'October 2026 · fictional monthly snapshot',
  departments: [
    { id: 'sales', name: 'Sales', metric: 'New memberships', value: '108', target: 'Target: 100', note: 'Illustrative acquisition target met. This says nothing about why existing members leave.' },
    { id: 'support', name: 'Support', metric: 'Replies within one day', value: '96%', target: 'Target: 95%', note: 'Illustrative response target met. A quick reply can still leave the underlying need unresolved.' },
    { id: 'operations', name: 'Operations', metric: 'Bookings honoured', value: '99%', target: 'Target: 98%', note: 'Illustrative delivery target met. The measure covers booked workspace, not flexibility between subscriptions.' },
    { id: 'finance', name: 'Finance', metric: 'Credits processed in five days', value: '97%', target: 'Target: 95%', note: 'Illustrative processing target met. The reason for repeated adjustments is a separate question.' }
  ],
  evidence: [
    {
      id: 'E01', department: 'sales', source: 'Cancellation call note', date: '2026-10-02',
      title: 'Leaving for now',
      body: 'Member A is working from a client office for six weeks. They said: “I like the space, but I cannot pay for two places while I am away. I would come back if I could stop the membership for a while.” Cancellation processed.',
      excerpt: 'I would come back if I could stop the membership for a while.',
      role: 'support', relationship: 'Temporary absence expressed as a cancellation',
      explanation: 'This individual describes a time-limited need rather than dissatisfaction with the workspace. A pause is a plausible response, not a demonstrated retention outcome.'
    },
    {
      id: 'E02', department: 'support', source: 'Member support ticket', date: '2026-10-04',
      title: 'A resolved ticket, an unresolved need',
      body: 'Member B asked whether billing could stop during eight weeks of family travel. They wrote: “Nothing is wrong with the space or the team. I just will not be in town.” Support confirmed that the current options are to retain or cancel the membership. Ticket resolved within the response target.',
      excerpt: 'Nothing is wrong with the space or the team. I just will not be in town.',
      role: 'support', relationship: 'Service satisfaction coexists with a need to leave temporarily',
      explanation: 'The ticket supports a flexibility hypothesis and challenges a blanket poor-service explanation. Resolving the request procedurally did not create the option the member wanted.'
    },
    {
      id: 'E03', department: 'operations', source: 'Operations handover', date: '2026-10-06',
      title: 'The workaround already exists',
      body: 'For three members on short client placements, staff have arranged informal holds and added calendar reminders to check when they return. There is no standard hold product or shared restart process. These exceptions should be reviewed before anyone promises a reserved desk throughout an absence.',
      excerpt: 'staff have arranged informal holds and added calendar reminders to check when they return.',
      role: 'support', relationship: 'A repeated workaround may reveal a missing service option',
      explanation: 'People are already improvising around temporary absence. That is a signal worth investigating, but the record also raises delivery and capacity questions.'
    },
    {
      id: 'E04', department: 'finance', source: 'Credit review note', date: '2026-10-08',
      title: 'Different ledger, similar story',
      body: 'Three adjustments in this selected review relate to members who were away on temporary assignments and later restarted. The adjustment reasons are recorded as unused period, goodwill and restart correction. These labels do not identify whether the original request was for a temporary pause.',
      excerpt: 'members who were away on temporary assignments and later restarted.',
      role: 'support', relationship: 'Financial exceptions may be another trace of the same need',
      explanation: 'The note connects absence, adjustments and return. It does not establish that every credit was avoidable or that a pause would have been profitable.'
    },
    {
      id: 'E05', department: 'sales', source: 'Win-back conversation', date: '2026-10-09',
      title: 'A return that needed a workaround',
      body: 'Former member C asked to restart after a two-month project elsewhere. They said: “Could I keep the same account next time instead of cancelling and joining again?” They are interested in hearing about a temporary suspension option. No purchase commitment or price preference was recorded.',
      excerpt: 'Could I keep the same account next time instead of cancelling and joining again?',
      role: 'support', relationship: 'Returning demand is expressed in administrative language',
      explanation: 'The request is consistent with a pause need. Interest in an option is not evidence of willingness to pay for it.'
    },
    {
      id: 'E06', department: 'support', source: 'Escalated support note', date: '2026-10-11',
      title: 'The friction is in the boundary',
      body: 'Member D was transferred between billing and the local workspace team while asking for a month away. They described the handoffs as frustrating, but said the workspace itself suited them. Support offered cancellation because there was no agreed hold process.',
      excerpt: 'transferred between billing and the local workspace team while asking for a month away.',
      role: 'support', relationship: 'A service problem may be a symptom of a missing option',
      explanation: 'This supports both a service-friction hypothesis and the need to investigate a pause option. It does not establish which change would resolve the member’s concern.'
    },
    {
      id: 'E07', department: 'sales', source: 'Cancellation call note', date: '2026-10-12',
      title: 'Some members really mean goodbye',
      body: 'Member E cancelled because their ongoing budget no longer covers the monthly fee. They said working from home is cheaper and they do not expect to restart. They declined a discussion about temporarily suspending the membership.',
      excerpt: 'they do not expect to restart.',
      role: 'counter', relationship: 'A genuine price cancellation challenges a universal pause explanation',
      explanation: 'A pause would not necessarily address an ongoing affordability issue. The emerging idea should not be used to reinterpret every cancellation.'
    },
    {
      id: 'E08', department: 'finance', source: 'Evidence selection note', date: '2026-10-13',
      title: 'This is a selected sample',
      body: 'These records were assembled to explore temporary absences and restart activity. They are not a random sample of members or cancellations. The set cannot establish how common the need is, whether a pause would change behaviour, or whether it would be economically sustainable.',
      excerpt: 'They are not a random sample of members or cancellations.',
      role: 'counter', relationship: 'Selection limits what the pattern can establish',
      explanation: 'Several aligned stories can make a useful hypothesis without making it representative. A wider investigation may overturn the initial impression.'
    },
    {
      id: 'E09', department: 'operations', source: 'Member exit handover', date: '2026-10-14',
      title: 'A permanent move',
      body: 'Member F is relocating permanently to a region where Northstar has no workspace. Their local team recorded positive feedback about the service. There is no planned return and no request to retain a membership.',
      excerpt: 'There is no planned return and no request to retain a membership.',
      role: 'counter', relationship: 'A satisfied customer can still leave for a reason a pause cannot solve',
      explanation: 'This challenges both a universal poor-service story and a universal pause story. Different departures can have different causes.'
    }
  ],
  hypotheses: [
    {
      id: 'price', title: 'The price is wrong',
      summary: 'Price explains at least one departure. It is not a complete account of these selected records.',
      supports: ['E07', 'N01'], counters: ['E02', 'E05'],
      rules: [
        { requiresAll: ['N01'], summary: 'The wider fictional survey makes price a more prominent explanation among respondents. Response bias remains possible, and the smaller pause-related cases do not disappear.' },
        { requiresAll: ['E07'], summary: 'One member explicitly describes an ongoing affordability problem. Other records concern temporary absence, so one blanket explanation would erase meaningful differences.' },
        { requiresAll: [], summary: 'A price explanation is possible, but the active evidence has not yet established it.' }
      ]
    },
    {
      id: 'service', title: 'The service is failing',
      summary: 'There is evidence of frustrating handoffs, alongside positive feedback about the workspace itself.',
      supports: ['E06', 'N03'], counters: ['E02', 'E09'],
      rules: [
        { requiresAll: ['E06', 'N03'], summary: 'Frustrating handoffs and an unsupported billing workflow point to operational friction. They do not establish that the core workspace service is broadly failing.' },
        { requiresAll: ['E06'], summary: 'One member describes frustrating handoffs. Positive service comments elsewhere suggest that friction around a missing option deserves separate investigation.' },
        { requiresAll: [], summary: 'Poor service is a possible explanation, but the active evidence does not yet establish it.' }
      ]
    },
    {
      id: 'pause', title: 'Some customers need a pause',
      summary: 'Temporary absence, informal holds, credits and restart requests may be different descriptions of one unmet need.',
      supports: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'N02'], counters: ['E07', 'E08', 'E09', 'N01'],
      rules: [
        { requiresAll: ['N01', 'N02', 'N03'], summary: 'The picture becomes more specific: a selected group expresses interest, wider survey evidence challenges broad demand, and delivery constraints remain. A bounded pause hypothesis survives; a universal solution does not.' },
        { requiresAll: ['N01', 'N03'], summary: 'The wider survey weakens the idea of broad demand. Operational constraints also make the proposed service more complicated. A niche need remains plausible, without establishing feasibility or commercial benefit.' },
        { requiresAll: ['N01', 'N02'], summary: 'Selected customers express interest, while the wider survey suggests this may be a niche rather than the main cause of cancellations. Both observations can be true.' },
        { requiresAll: ['N01'], summary: 'The wider survey challenges the apparent scale of the opportunity. The selected stories still suggest a possible niche, but they should not stand in for the whole customer base.' },
        { requiresAll: ['N02', 'N03'], summary: 'There is additional interest among customers already selected for temporary absences, but the product would need workable billing and capacity rules. Interest has not established viability.' },
        { requiresAll: ['N03'], summary: 'A pause need remains plausible, but the operational note limits what could be promised. Evidence of demand and evidence of a deliverable service are different things.' },
        { requiresAll: ['N02'], summary: 'The follow-up adds interest within a deliberately selected group. It strengthens the case for exploring that group’s need, without establishing market size, take-up or financial benefit.' },
        { requiresAll: ['E01', 'E03', 'E04', 'E05'], summary: 'Several teams may be describing the same temporary-absence need in different language. This is a hypothesis worth investigating, tempered by genuine price and relocation exits and the selected sample.' },
        { requiresAll: [], summary: 'A temporary-pause need is a possibility. Connect relevant records and examine the alternatives before treating it as an opportunity.' }
      ]
    }
  ],
  newEvidence: [
    {
      id: 'N01', department: 'sales', source: 'Wider exit survey', date: '2026-10-21',
      title: 'The wider picture pushes back',
      body: 'In this fictional follow-up, 200 recent cancellations were invited to a survey and 136 replied. Six respondents named temporary absence as their main reason, 81 named ongoing cost and 49 named other reasons. Non-respondents may differ. The survey did not test a specific pause offer or willingness to pay.',
      excerpt: 'Six respondents named temporary absence as their main reason, 81 named ongoing cost and 49 named other reasons.',
      role: 'counter', relationship: 'Broader evidence challenges the apparent prevalence of the pause need',
      explanation: 'This should reduce confidence in a broad pause opportunity. It does not prove that no useful niche exists, and survey response bias remains unresolved.',
      impact: 'Challenges the scale of the pause hypothesis; strengthens price as an explanation among respondents.'
    },
    {
      id: 'N02', department: 'support', source: 'Targeted member follow-up', date: '2026-10-22',
      title: 'Interest, with a selection caveat',
      body: 'In this fictional follow-up, staff contacted 15 members whose notes explicitly mentioned temporary travel or client placements. Eleven asked to hear about a possible pause pilot. No payment was taken and no member committed to participate. This deliberately targeted group is not representative of all customers.',
      excerpt: 'Eleven asked to hear about a possible pause pilot.',
      role: 'support', relationship: 'Targeted interest supports a narrower customer need',
      explanation: 'The record adds evidence of interest in the selected segment. It does not establish take-up, willingness to pay, retention impact or financial return.',
      impact: 'Supports further exploration of a defined segment, without proving a broad opportunity.'
    },
    {
      id: 'N03', department: 'operations', source: 'Feasibility review', date: '2026-10-23',
      title: 'A need is not yet a workable service',
      body: 'The current billing platform does not support automatic suspension and restart. Reserving the same desk throughout an unpaid pause would also constrain capacity. A different offer might allow a member to retain their account and request a new desk on return, subject to availability. No delivery commitment, cost estimate or launch decision has been made.',
      excerpt: 'Reserving the same desk throughout an unpaid pause would also constrain capacity.',
      role: 'context', relationship: 'Operational constraints qualify the proposed response',
      explanation: 'This is a constraint on the solution, not proof against the underlying need. The opportunity would have to be defined and tested within real billing and capacity limits.',
      impact: 'Adds feasibility questions; does not by itself confirm or refute demand.'
    }
  ]
};
