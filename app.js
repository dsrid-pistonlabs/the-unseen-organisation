import { CASE } from './data.js';
import { analyse, createBrief, getExperiment, recordById } from './engine.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const department = id => CASE.departments.find(d => d.id === id)?.name || id;
const state = {active: new Set(CASE.evidence.map(r => r.id)), department: 'all', hypothesis: 'pause', guess: null, revealed: false, experiment: 'interviews'};
const deptIcons = {sales: '↗', support: '↔', operations: '◎', finance: '≋'};
let toastTimer;

function sourceButton(record, label = record.id, className = 'evidence-chip') {
  return `<button class="${className}" data-source="${esc(record.id)}" aria-label="Inspect ${esc(record.id)}: ${esc(record.title)}">${esc(label)}</button>`;
}

function renderDashboards() {
  $('#dashboards').innerHTML = CASE.departments.map(d => `<article class="department-card"><h3><span class="dept-icon" aria-hidden="true">${deptIcons[d.id]}</span>${esc(d.name)}</h3><div class="metric">${esc(d.value)}</div><div class="metric-label">${esc(d.metric)}</div><div class="metric-foot"><span class="status-dot" aria-hidden="true"></span>${esc(d.target)} · Met</div><p class="metric-note">${esc(d.note)}</p></article>`).join('');
  $('#sample-notice').textContent = CASE.sampleNotice;
}

function renderEvidence() {
  const teams = [{id:'all', name:'All departments'}, ...CASE.departments];
  $('#team-tabs').innerHTML = teams.map(d => `<button role="tab" class="tab" data-team="${d.id}" aria-selected="${state.department === d.id}" tabindex="${state.department === d.id ? '0' : '-1'}" aria-controls="evidence-grid">${esc(d.name)}</button>`).join('');
  const visible = CASE.evidence.filter(r => state.department === 'all' || r.department === state.department);
  $('#evidence-count').textContent = `${visible.length} of ${CASE.evidence.length} original records · ${CASE.evidence.filter(r=>state.active.has(r.id)).length} included`;
  $('#evidence-grid').setAttribute('role','tabpanel');
  $('#evidence-grid').setAttribute('aria-label', `${state.department === 'all' ? 'All departments' : department(state.department)} evidence`);
  $('#evidence-grid').innerHTML = visible.map(r => `<article class="evidence-card ${state.active.has(r.id)?'':'excluded'}"><div class="evidence-meta"><span>${esc(department(r.department))}</span><span class="evidence-id">${r.id}</span></div><p class="evidence-source">${esc(r.source)}</p><h3>${esc(r.title)}</h3><blockquote class="evidence-body">“${esc(r.excerpt)}”</blockquote><div class="evidence-card-actions">${sourceButton(r,'Read source ↗','text-button evidence-read')}<label class="evidence-toggle"><input type="checkbox" data-include="${r.id}" ${state.active.has(r.id)?'checked':''}><span>Include<span class="sr-only"> ${r.id}</span></span></label></div></article>`).join('');
}

function renderGuesses() {
  $('#guess-options').innerHTML = '<legend class="sr-only">Your first hypothesis</legend>' + CASE.hypotheses.map(h => `<label class="guess-option ${state.guess === h.id?'selected':''}"><input type="radio" name="guess" value="${h.id}" ${state.guess === h.id?'checked':''}><span>${esc(h.title)}</span></label>`).join('');
}

function connectionGraphic(result) {
  const locations = [[90,85],[470,85],[90,325],[470,325]];
  const nodes = CASE.departments.map((d,i) => {
    const [x,y] = locations[i];
    const count = result.supports.filter(r=>r.department===d.id).length;
    const challenge = result.counters.filter(r=>r.department===d.id).length;
    return `<path d="M${x} ${y}L280 205" fill="none" stroke="${count?'#b4f5d2':'#40515a'}" stroke-width="${count?2:1}" ${count?'':'stroke-dasharray="5 6"'}/><g><rect x="${x-77}" y="${y-39}" width="154" height="78" rx="10" fill="#1d272e" stroke="${count?'#679c86':'#40515a'}"/><text x="${x}" y="${y-8}" text-anchor="middle" fill="#f6f7f0" font-size="16">${esc(d.name)}</text><text x="${x}" y="${y+15}" text-anchor="middle" fill="#b0bdc4" font-size="12">${count} supporting · ${challenge} challenging</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 560 410" role="img" aria-labelledby="map-title map-description"><title id="map-title">Evidence across departments</title><desc id="map-description">${result.supports.length} supporting records across ${result.departments.length} departments. ${result.counters.length} challenging records. Source counts are not probabilities.</desc>${nodes}<circle cx="280" cy="205" r="65" fill="#183229" stroke="#b4f5d2"/><text x="280" y="193" text-anchor="middle" fill="#b4f5d2" font-size="13">WORKING</text><text x="280" y="214" text-anchor="middle" fill="#b4f5d2" font-size="13">HYPOTHESIS</text><text x="280" y="237" text-anchor="middle" fill="#c5d2d2" font-size="11">Open to challenge</text></svg>`;
}

function renderAnalysis() {
  const result = analyse(state.active,state.hypothesis);
  $('#lens-tabs').innerHTML = CASE.hypotheses.map(h=>`<button class="lens-tab" role="tab" data-lens="${h.id}" aria-selected="${h.id===state.hypothesis}" tabindex="${h.id===state.hypothesis?'0':'-1'}" aria-controls="analysis-content">${esc(h.title)}</button>`).join('');
  $('.analysis-grid').id='analysis-content';
  $('.analysis-grid').setAttribute('role','tabpanel');
  $('.analysis-grid').setAttribute('aria-label',result.hypothesis.title);
  $('#connection-graphic').innerHTML = connectionGraphic(result);
  $('#support-label').textContent = `${result.supports.length} supporting records · ${result.departments.length} departments`;
  $('#insight-title').textContent = result.hypothesis.title;
  $('#insight-summary').textContent = result.summary;
  $('#evidence-chips').innerHTML = result.supports.map(r=>sourceButton(r)).join('');
  $('#counter-box').innerHTML = `<strong>${result.counters.length} challenging records included</strong><p>${result.counters.length?'Different explanations and sampling limits belong in this picture too. Inspect each source below.':'No included record is marked as challenging this interpretation. Absence of a challenge in this selected set is not confirmation.'}</p><small>Counts describe records. They are not confidence scores.</small>`;
  const groups = [['Supporting',result.supports],['Challenging',result.counters],['Other context',result.context]];
  $('#analysis-source-list').innerHTML = groups.flatMap(([label,items])=>items.map(r=>`<div class="source-row"><span class="source-role ${label.toLowerCase().split(' ')[0]}">${label}</span>${sourceButton(r, `${r.id} · ${r.title}`,'text-button')}<span>${esc(department(r.department))}</span></div>`)).join('');
  $('#new-evidence-grid').innerHTML = CASE.newEvidence.map(r=>`<article class="new-evidence-card ${state.active.has(r.id)?'active':''}"><div class="evidence-meta"><span>${r.id} · ${esc(department(r.department))}</span><span>${state.active.has(r.id)?'INCLUDED':'NEW'}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.impact)}</p><div class="evidence-card-actions">${sourceButton(r,'Inspect source','text-button')}<button class="button secondary" data-new="${r.id}" aria-pressed="${state.active.has(r.id)}">${state.active.has(r.id)?'Remove evidence':'Add evidence'}</button></div></article>`).join('');
  const additions=CASE.newEvidence.filter(r=>state.active.has(r.id));
  $('#challenge-status').textContent = additions.length ? `${additions.length} new ${additions.length===1?'record':'records'} included. The interpretation above reflects your current selection.` : 'Start with the wider survey to challenge the size of the apparent opportunity.';
  renderBrief();
}

function renderBrief() {
  const result=analyse(state.active,state.hypothesis), action=getExperiment(state.hypothesis,state.experiment);
  for(const input of document.querySelectorAll('[name="experiment"]')) { const choice=getExperiment(state.hypothesis,input.value); const label=input.closest('label'); label.querySelector('strong').textContent=choice.title; label.querySelector('small').textContent=choice.short || choice.question; }
  $('#brief-output').innerHTML = `<p class="section-kicker">YOUR INVESTIGATION BRIEF</p><h3>${esc(action.question)}</h3><p>${esc(action.action)}</p><p>${esc(action.learn)}</p><div class="brief-evidence-line">Working hypothesis: <strong>${esc(result.hypothesis.title)}</strong><br>${result.supports.length} supporting · ${result.counters.length} challenging · ${result.context.length} other records</div>`;
}

function inspect(id) {
  const r=recordById.get(id); if(!r)return;
  $('#dialog-meta').textContent=`${r.id} · ${department(r.department)} · ${r.source} · ${r.date}`;
  $('#dialog-title').textContent=r.title;
  $('#dialog-body').textContent=r.body;
  $('#dialog-explanation').innerHTML=`<h3>${esc(r.relationship)}</h3><p>${esc(r.explanation)}</p><p class="sample-note">Synthetic record. This explanation was prepared in advance; it is not a live model response.</p>`;
  $('#source-dialog').showModal();
}

function reveal() {
  state.revealed=true;
  state.hypothesis=state.guess||'pause';
  ['connections','challenge','brief'].forEach(id=>$('#'+id).classList.remove('hidden'));
  $('#guess-feedback').textContent='Explore all three interpretations. This is an investigation, not a scored test.';
  $('#reveal-button').textContent='Return to the connections';
  renderAnalysis();
  $('#connections').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}

function notify(message) {
  clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').classList.add('visible');
  toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200);
}

document.addEventListener('click',event=>{
  const source=event.target.closest('[data-source]'); if(source){inspect(source.dataset.source);return;}
  const method=event.target.closest('[data-method]'); if(method){$('#method-dialog').showModal();return;}
  const team=event.target.closest('[data-team]'); if(team){state.department=team.dataset.team;renderEvidence();$(`[data-team="${state.department}"]`).focus({preventScroll:true});return;}
  const lens=event.target.closest('[data-lens]'); if(lens){state.hypothesis=lens.dataset.lens;renderAnalysis();$(`[data-lens="${state.hypothesis}"]`).focus({preventScroll:true});return;}
  const addition=event.target.closest('[data-new]'); if(addition){const id=addition.dataset.new;state.active.has(id)?state.active.delete(id):state.active.add(id);renderAnalysis();$(`[data-new="${id}"]`).focus({preventScroll:true});notify(`${id} ${state.active.has(id)?'included':'removed'}. Interpretation updated.`);return;}
  if(event.target.closest('.dialog-close,.dialog-close-bottom'))event.target.closest('dialog').close();
});

document.addEventListener('change',event=>{
  if(event.target.matches('[data-include]')){const id=event.target.dataset.include;event.target.checked?state.active.add(id):state.active.delete(id);renderEvidence();renderAnalysis();$(`[data-include="${id}"]`)?.focus({preventScroll:true});}
  if(event.target.name==='guess'){state.guess=event.target.value;renderGuesses();$(`[name="guess"][value="${state.guess}"]`).focus({preventScroll:true});$('#guess-feedback').textContent='Your first interpretation is selected. Now test it against the wider picture.';}
  if(event.target.name==='experiment'){state.experiment=event.target.value;renderBrief();}
});

document.addEventListener('keydown',event=>{
  if(!event.target.matches('[role="tab"]') || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const tabs=[...event.target.parentElement.querySelectorAll('[role="tab"]')];const current=tabs.indexOf(event.target);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();
});

$('#reveal-button').addEventListener('click',reveal);
$('#download-brief').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([createBrief(state.active,state.hypothesis,state.experiment)],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='the-unseen-organisation-investigation.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Your investigation brief is ready to save.');
});
$('#reset-case').addEventListener('click',()=>{
  state.active=new Set(CASE.evidence.map(r=>r.id));state.department='all';state.hypothesis='pause';state.guess=null;state.revealed=false;state.experiment='interviews';
  ['connections','challenge','brief'].forEach(id=>$('#'+id).classList.add('hidden'));$('#reveal-button').textContent='Reveal the connections';$('#guess-feedback').textContent='You can explore without choosing.';$('[name="experiment"][value="interviews"]').checked=true;renderEvidence();renderGuesses();renderAnalysis();$('#reveal-button').focus({preventScroll:true});$('#case').scrollIntoView();notify('Case reset to the nine original records.');
});

renderDashboards();renderEvidence();renderGuesses();renderAnalysis();
