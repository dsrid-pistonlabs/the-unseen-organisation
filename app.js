import { CASE, CATEGORY_META } from './data.js';
import { DEFAULT_CONTROLS, runScenario, compareSuite, createBrief, scenarioById } from './engine.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = {controls:{...DEFAULT_CONTROLS}, selected:CASE.openingIds[0], expanded:false, instinct:null, revealed:false};
const tones = {'justified-yes':'good','dangerous-yes':'bad','missed-legitimate':'warn','protective-hold':'neutral'};
const metrics = [
  {key:'justifiedYes',label:'Legitimate, on time',tone:'good'},
  {key:'dangerousYes',label:'Dangerous releases',tone:'bad'},
  {key:'missedLegitimate',label:'Legitimate windows missed',tone:'warn'},
  {key:'protectiveHold',label:'Diversions held',tone:'neutral'}
];
let toastTimer;
const selectedIds = () => state.expanded ? [...CASE.coreIds,...CASE.challengeIds] : CASE.coreIds;
const badge = result => `<span class="outcome-badge ${tones[result.category]}">${esc(CATEGORY_META[result.category].title)}</span>`;
const elapsed = result => result.elapsedMinutes===1440?'1 day':`${result.elapsedMinutes} min`;
const designName = () => Object.values(state.controls).some(Boolean)?'Your selected design':'Existing design';

function traceHtml(result) {
  return `<ol class="trace-list">${result.trace.map(t=>`<li class="trace-step"><span class="trace-status">${t.totalMinutes===1440?'DAY +1':`T+${t.totalMinutes}m`}</span><div class="trace-detail"><strong>${esc(t.title)}</strong><p>${esc(t.detail)}</p></div></li>`).join('')}</ol>`;
}

function initialise() {
  const request=scenarioById.get(CASE.openingIds[0]);
  $('#request-title').textContent='Account change before dispatch';
  $('#request-text').textContent=`“${request.request}”`;
  $('#request-facts').innerHTML=request.publicFacts.map((fact,i)=>`<div class="fact"><span class="fact-label">${['SUPPLIER','RECORDS','APPROVAL','DEADLINE'][i]||'VISIBLE FACT'}</span><strong>${esc(fact)}</strong></div>`).join('');
  $('#request-deadline').textContent=`${request.cutoffMinutes} modelled minutes until the shipment window closes.`;
  $('#control-options').innerHTML='<legend class="sr-only">Select controls for the proposed design</legend>'+CASE.controls.map(c=>`<label class="control-option"><input type="checkbox" data-control="${c.id}"><span class="control-copy"><strong class="control-title">${esc(c.title)}</strong><span>${esc(c.description)}</span><small class="control-cost">${esc(c.tradeoff)}</small></span></label>`).join('');
  $('#model-assumptions').innerHTML='<h3>The chosen assumptions</h3><ul>'+CASE.assumptions.map(value=>`<li>${esc(value)}</li>`).join('')+'</ul>';
  renderResults();
}

function renderTwins() {
  const results=CASE.openingIds.map(id=>runScenario(id,state.controls));
  $('#twin-grid').innerHTML=results.map(r=>`<article class="twin-card ${r.scenario.legitimate?'good':'bad'}"><p class="twin-label">${r.scenario.legitimate?'WORLD A · GENUINE CHANGE':'WORLD B · ATTEMPTED DIVERSION'}</p><h3>${esc(r.scenario.title)}</h3><p>${esc(r.scenario.truth)}</p><div class="twin-outcome">${badge(r)}<span>${esc(designName())} · ${elapsed(r)}</span></div><p>${esc(r.timingNote)}</p><button class="text-button" data-inspect="${r.scenarioId}">Inspect the decision trace</button></article>`).join('');
  const [real,diversion]=results;
  let insight;
  if(real.withinDeadline&&diversion.action==='hold')insight='In this pair, the selected design preserves the legitimate shipment window and holds the diversion. Inspect which evidence made the difference—and then test the other cases.';
  else if(diversion.action==='release')insight='The diversion is still released. More timely processing or another signature cannot supply a distinguishing fact that the selected workflow never obtains.';
  else insight='The diversion is held, but the legitimate shipment window is missed. Protection and the ability to proceed are separate questions in this pair.';
  $('#twin-insight').textContent=insight;
}

function summaryColumn(title,suite) {
  return `<div class="summary-column"><h3 class="summary-title">${title}</h3><div class="summary-values">${metrics.map(m=>`<div class="summary-cell ${m.tone}"><span class="summary-number">${suite.counts[m.key]}</span><span class="summary-label">${m.label}</span></div>`).join('')}</div></div>`;
}

function comparisonText(comparison) {
  const before=comparison.baseline.counts,after=comparison.current.counts;
  const timely=after.justifiedYes-before.justifiedYes;
  const dangerous=after.dangerousYes-before.dangerousYes;
  if(!Object.values(state.controls).some(Boolean))return 'Both columns currently use the existing design. Select a control to examine what changes in these same cases.';
  return `Compared with the existing design: ${Math.abs(timely)} ${timely>=0?'more':'fewer'} legitimate ${Math.abs(timely)===1?'request reaches its window':'requests reach their windows'}; ${Math.abs(dangerous)} ${dangerous<=0?'fewer':'more'} ${Math.abs(dangerous)===1?'diversion is':'diversions are'} released. These are counts within this selected set, not estimated real-world effects.`;
}

function renderResults() {
  const comparison=compareSuite(state.controls,selectedIds());
  renderTwins();
  $('#comparison-grid').innerHTML=summaryColumn('Existing design',comparison.baseline)+summaryColumn('Your selected design',comparison.current);
  $('#summary-explainer').textContent=comparisonText(comparison);
  $('#scenario-list').innerHTML='<div class="scenario-row scenario-table-head"><span>Prepared scenario</span><span>Existing</span><span>Selected</span></div>'+comparison.current.results.map((r,i)=>`<button class="scenario-row ${state.selected===r.scenarioId?'selected':''}" data-case="${r.scenarioId}" aria-pressed="${state.selected===r.scenarioId}" aria-controls="scenario-detail"><span><strong class="scenario-name">${esc(r.scenario.title)}</strong><small class="scenario-meta">${r.scenarioId} · ${r.scenario.legitimate?'Legitimate request':'Attempted diversion'} · ${r.scenario.cutoffMinutes} min window${r.scenario.group==='challenge'?' · Added challenge':''}</small></span><span>${badge(comparison.baseline.results[i])}</span><span>${badge(r)}</span></button>`).join('');
  $('#suite-note').textContent=`${comparison.current.total} deliberately selected cases: ${comparison.current.legitimateCount} legitimate requests and ${comparison.current.diversionCount} diversions. Outcomes are classified using the fictional truth after the workflow runs. “Legitimate, on time” does not by itself prove the decision was well-founded.`;
  $('#challenge-button').textContent=state.expanded?'Return to the initial six cases':'Test the uncomfortable cases';
  $('#challenge-button').setAttribute('aria-expanded',String(state.expanded));
  $('#challenge-note').textContent=state.expanded?'The two added cases challenge a missing contact route and a corrupted trusted contact record. They were prepared in advance, not generated live.':'Two further prepared scenarios will test assumptions behind an apparently successful design.';
  renderDetail();
  renderFindings(comparison);
}

function renderDetail() {
  const scenario=scenarioById.get(state.selected),before=runScenario(scenario,DEFAULT_CONTROLS),after=runScenario(scenario,state.controls);
  $('#scenario-detail').innerHTML=`<div class="detail-header"><div><p class="section-kicker">INSPECT THE DECISION · ${scenario.id}</p><h3 id="detail-heading" tabindex="-1">${esc(scenario.title)}</h3></div><span>${scenario.cutoffMinutes} min cutoff</span></div><div class="detail-facts"><div><h4>What the team can see</h4><p>${esc(scenario.request)}</p><ul>${scenario.publicFacts.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></div><div><h4>Underlying truth, revealed for this exercise</h4><p>${esc(scenario.truth)}</p><p>${esc(scenario.impact)}</p></div></div><div class="trace-compare">${[[before,'Existing design'],[after,'Your selected design']].map(([result,label])=>`<div class="trace-column"><h4>${label}</h4>${badge(result)}<p>${elapsed(result)} · ${esc(result.timingNote)}</p>${traceHtml(result)}<p class="suite-note">${esc(result.reason)}</p></div>`).join('')}</div>`;
}

function renderFindings(comparison) {
  const result=comparison.current,failed=result.results.filter(r=>r.category==='dangerous-yes'),missed=result.results.filter(r=>r.category==='missed-legitimate');
  let frontier;
  if(!state.expanded)frontier='<strong>Your conclusion is bounded by the cases you tried.</strong><p>Use “Test the uncomfortable cases” to challenge the contact route that a successful check depends on. A clean result in six selected cases is not permission to generalise.</p>';
  else if(failed.length)frontier=`<strong>A boundary remains visible.</strong><p>${failed.map(r=>`${esc(r.scenarioId)}: ${esc(r.scenario.title)}`).join('; ')} ${failed.length===1?'still releases a diversion':'still release diversions'} in this design. Inspect the trace and identify the evidence or trust assumption that would need to change.</p>`;
  else if(missed.length)frontier='<strong>Protection still has an operational consequence.</strong><p>No diversion in this selected set is released, but legitimate requests still miss their window. Some may need another evidence route; a deadline alone cannot justify proceeding.</p>';
  else frontier='<strong>This selected set is not the boundary of reality.</strong><p>Examine more scenarios and the actual workflow before drawing conclusions about effectiveness.</p>';
  $('#frontier-note').innerHTML=frontier;
  $('#brief-findings').innerHTML=`<p>${esc(comparisonText(comparison))}</p><p><strong>${failed.length} dangerous ${failed.length===1?'release remains':'releases remain'}; ${missed.length} legitimate ${missed.length===1?'window is':'windows are'} missed.</strong></p><p>${state.expanded?'Both additional challenges are included.':'The two further challenges have not been included in these results.'}</p><p>Which assumption would you test next? What evidence could distinguish the requests without imposing a delay on every legitimate case?</p>`;
}

function openFutures() {
  state.revealed=true;for(const id of ['twins','lab','brief'])$('#'+id).classList.remove('hidden');
  const feedback={approve:'Your first instinct was another signature. Test whether it changes the evidence.',hold:'Your first instinct was to hold. Test what that protects and what it delays.',verify:'You asked for a distinguishing fact. Test which control can produce one.'};
  $('#first-response').textContent=feedback[state.instinct]||'Compare both worlds, then redesign the controls.';
  $('#open-futures').textContent='Return to both worlds';
  $('#twins-heading').setAttribute('tabindex','-1');$('#twins-heading').focus({preventScroll:true});$('#twins').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}

function notify(message) {clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}

document.addEventListener('change',event=>{
  if(event.target.matches('[data-control]')){state.controls[event.target.dataset.control]=event.target.checked;renderResults();}
  if(event.target.name==='instinct'){state.instinct=event.target.value;$('#first-response').textContent='First instinct recorded. Open the two worlds to examine the decision.';}
});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-method]')){$('#method-dialog').showModal();return;}
  if(event.target.closest('.dialog-close,.dialog-close-bottom')){event.target.closest('dialog').close();return;}
  const choice=event.target.closest('[data-case],[data-inspect]');
  if(choice){state.selected=choice.dataset.case||choice.dataset.inspect;renderResults();$('#detail-heading').focus({preventScroll:true});$('#scenario-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
$('#open-futures').addEventListener('click',openFutures);
$('#clear-controls').addEventListener('click',()=>{state.controls={...DEFAULT_CONTROLS};for(const input of document.querySelectorAll('[data-control]'))input.checked=false;renderResults();notify('Controls returned to the existing design.');});
$('#challenge-button').addEventListener('click',()=>{state.expanded=!state.expanded;if(!selectedIds().includes(state.selected))state.selected=CASE.openingIds[0];renderResults();notify(state.expanded?'Two prepared challenges added to both designs.':'Returned to the initial six cases.');});
$('#download-brief').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([createBrief(state.controls,selectedIds())],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='make-yes-safer-rehearsal.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Your rehearsal brief is ready to save.');});
$('#reset-case').addEventListener('click',()=>{Object.assign(state,{controls:{...DEFAULT_CONTROLS},selected:CASE.openingIds[0],expanded:false,instinct:null,revealed:false});for(const input of document.querySelectorAll('[data-control],[name="instinct"]'))input.checked=false;for(const id of ['twins','lab','brief'])$('#'+id).classList.add('hidden');$('#open-futures').textContent='Open both possible worlds';$('#first-response').textContent='You can explore without choosing.';renderResults();$('#open-futures').focus({preventScroll:true});$('#request').scrollIntoView();notify('Rehearsal reset.');});
initialise();
