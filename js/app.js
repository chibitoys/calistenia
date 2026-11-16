/* App de calistenia — vanilla JS, dados só neste aparelho (localStorage). */
(() => {
'use strict';
const KEY = 'calistenia.v1';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHECK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const ICON = {
  today: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  lib: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
  prog: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  learn: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z"/>',
  set: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  cardio: '<circle cx="14" cy="4.5" r="2"/><path d="M6 21l3-6 3 2 2-5-3-3-4 1-2 3M12 11l4 3h3"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
};
const TABS = [['today', 'Hoje'], ['cardio', 'Cardio'], ['lib', 'Biblioteca'], ['prog', 'Evolução'], ['more', 'Mais']];
const TABGROUP = { work: 'today', learn: 'more', set: 'more', gallery: 'more', diary: 'more', cstart: 'cardio', track: 'cardio', sum: 'cardio', routine: 'cardio' };
const X = {}, VIEWS = {}, AFTER = [];   /* pontos de extensão (js/cardio-ui.js) */

/* ───────── armazenamento ───────── */
const defaults = () => ({ v: 1, set: { name: '', test: true, phase: 'w1', onboarded: false, dips: false, lowBar: false, theme: 'auto' }, logs: [], morning: {}, walks: {}, active: null, acts: [], notes: [], cardio: { stage: 'r1', runDays: [1, 4], weightKg: null, voice: true, voiceEvery: 'km', runGps: true, walkGps: false } });
const normDB = d => { const b = defaults(); return { ...b, ...d, set: { ...b.set, ...d.set }, cardio: { ...b.cardio, ...(d.cardio || {}) }, acts: Array.isArray(d.acts) ? d.acts : [], notes: Array.isArray(d.notes) ? d.notes : [] }; };
let DB = (() => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v) return normDB(d); } catch (e) {} return defaults(); })();
(function migrate() { const w = DB.walks || {}, ks = Object.keys(w); if (!ks.length) return; ks.forEach(k => { const m = +w[k]; if (m > 0) { const st = new Date(k + 'T08:00:00').getTime(); DB.acts.push({ id: st + Math.floor(Math.random() * 1000), type: 'walk', date: k, start: st, end: st + m * 60000, dur: m * 60, source: 'manual', moving: null, dist: null }); } }); DB.walks = {}; DB.acts.sort((a, b) => a.start - b.start); try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} })();
let storageOk = true;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { if (storageOk) { storageOk = false; toast('Não consegui salvar neste navegador. Exporte um backup.'); } } };
const UI = { fv: {}, hold: { run: false }, tab: 'today', libCat: 'all', libQ: '', progEx: null, ready: 'g', pick: null, ab: null, gloss: '', open: {} };

/* ───────── utilidades ───────── */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const fmtDate = (s, o) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', o || { day: '2-digit', month: 'short' });
const weekStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const phase = () => PHASES.find(p => p.id === DB.set.phase) || PHASES[0];
const isRead = () => ['w1', 'w2'].includes(DB.set.phase);
const nameOf = id => EX[id] ? EX[id].en : id;
const catColor = c => (CATS[c] || {}).c || '#888';
const tile = id => { const e = EX[id]; return `<div class="tile" style="background:${catColor(e.cat)}">${esc((e.en.match(/[A-Z]/g) || ['?']).slice(0, 2).join(''))}</div>`; };
let toastT;
function toast(m) { document.querySelectorAll('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }
const mmss = s => `${Math.floor(s / 60)}:${pad(Math.max(0, Math.round(s % 60)))}`;
const restTxt = s => s >= 120 ? `${(s / 60).toString().replace('.', ',')} min` : `${s} s`;

/* ───────── montagem das sessões ───────── */
const phaseKey = (type, ab) => isRead() ? DB.set.phase : (ab || 'A');
function nextType() { const l = DB.logs[DB.logs.length - 1]; return l ? SESSION_ORDER[(SESSION_ORDER.indexOf(l.type) + 1) % 3] : 'push'; }
function abFor(type) {
  if (isRead()) return null;
  if (UI.ab) return UI.ab;
  const n = DB.logs.filter(l => l.type === type && (l.phase === 'rec' || l.phase === 'str')).length;
  return n % 2 ? 'B' : 'A';
}
function buildPlan(type, ab) {
  const base = PLAN[type][phaseKey(type, ab)];
  const list = [];
  base.ex.forEach(e => {
    e = { ...e };
    if (e.id === 'dips' && !DB.set.dips) return;
    if (e.id === 'inv_row' && !DB.set.lowBar) { e.id = 'band_row'; e.note = ((e.note || '') + ' Versão com elástico: você não marcou barra baixa segura.').trim(); }
    list.push(e);
  });
  return { ...base, ex: list };
}
function newActive(type, ab, ready) {
  const plan = buildPlan(type, ab);
  const cut = ready === 'y';
  return {
    id: Date.now(), date: today(), start: Date.now(), step: 0, sub: 'work', side: 0, val: '', rir: '', type, ab, phase: DB.set.phase, ready, checks: {}, effort: null, notes: '', pain: [],
    ex: plan.ex.map(e => {
      let n = e.sets; if (cut && n > 1) n -= 1;
      return { id: e.id, orig: e.id, reps: e.reps, rest: e.rest, rir: e.rir, note: e.note, alt: e.alt || null, unit: e.unit || EX[e.id].unit, optional: !!e.optional, reduced: cut && e.sets > 1,
        variant: '', sets: Array.from({ length: n }, () => ({ v: '', r: '', d: false })), tech: '', obs: '' };
    }),
  };
}

/* histórico */
function history(id) { const out = []; for (let i = DB.logs.length - 1; i >= 0; i--) { const e = DB.logs[i].ex.find(x => x.id === id && x.sets.some(s => s.d)); if (e) out.push({ log: DB.logs[i], ex: e }); } return out; }
const doneSets = e => e.sets.filter(s => s.d && s.v !== '');
function lastText(id) {
  const h = history(id)[0]; if (!h) return null;
  const u = h.ex.unit === 's' ? ' s' : '';
  const t = { bom: 'técnica boa', regular: 'técnica regular', melhorar: 'técnica a melhorar' }[h.ex.tech];
  return `${fmtDate(h.log.date)}: ${doneSets(h.ex).map(s => s.v).join(' / ')}${u}${h.ex.variant ? ' · ' + h.ex.variant : ''}${t ? ' · ' + t : ''}`;
}
function hintFor(a) {
  const h = history(a.id); if (!h.length) return null;
  const top = parseInt(String(a.reps).split(/[–-]/).pop()); const tmin = parseInt(a.rir);
  const ok = x => { const d = doneSets(x.ex); return d.length >= 2 && d.every(s => +s.v >= top) && x.ex.tech !== 'melhorar'; };
  const ex = EX[a.id];
  if (h[1] && ok(h[0]) && ok(h[1]) && h[0].ex.variant === h[1].ex.variant) {
    return { up: true, t: `Topo da faixa (${top}) em duas sessões seguidas com boa forma. ${ex.hard.length ? 'Pode testar: ' + ex.hard[0] + '.' : 'Pode ampliar a faixa.'} Mude uma coisa de cada vez.` };
  }
  const l = h[0].ex; const rs = l.sets.filter(s => s.d && s.r !== '').map(s => +s.r);
  if (l.tech === 'melhorar') return { up: false, t: `Última técnica: a melhorar. ${ex.easy.length ? 'Considere: ' + ex.easy[0] + '.' : 'Reduza a dificuldade.'}` };
  if (!isNaN(tmin) && rs.length && rs.reduce((x, y) => x + y, 0) / rs.length <= tmin - 2) return { up: false, t: `Na última vez você terminou perto da falha (RIR médio ${(rs.reduce((x, y) => x + y, 0) / rs.length).toFixed(1).replace('.', ',')}, previsto ${a.rir}). Facilite ou encurte a série.` };
  return null;
}

/* ───────── cronômetro de descanso ───────── */
let TM = null, tInt = null, actx = null;
function beep() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); [0, .22, .44].forEach(d => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(actx.destination); o.start(actx.currentTime + d); o.stop(actx.currentTime + d + .14); }); } catch (e) {} try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} }
function startTimer(sec, label) { TM = { end: Date.now() + sec * 1000, total: sec, label, fin: false }; clearInterval(tInt); tInt = setInterval(tick, 250); tick(); }
function tick() {
  const el = $('#timer'); if (!TM) { el.classList.remove('show', 'end'); return; }
  const hide = DB.active && DB.active.sub === 'rest' && UI.tab === 'work';
  const left = (TM.end - Date.now()) / 1000, rt = $('#rt'), rr = $('#rring');
  if (left <= 0) {
    if (!TM.fin) { TM.fin = true; beep(); }
    $('#tt').textContent = '0:00'; $('#tl').textContent = 'Pronto! Pode seguir.'; el.classList.add('end'); el.classList.toggle('show', !hide);
    if (rt) { rt.textContent = 'Pronto!'; rt.classList.add('go'); } if (rr) rr.setAttribute('stroke-dashoffset', 0); if (left < -90) stopTimer(); return;
  }
  el.classList.remove('end'); el.classList.toggle('show', !hide); $('#tt').textContent = mmss(Math.ceil(left)); $('#tl').textContent = TM.label;
  if (rt) { rt.textContent = mmss(Math.ceil(left)); rt.classList.remove('go'); } if (rr) rr.setAttribute('stroke-dashoffset', 440 * (1 - left / TM.total));
}
function stopTimer() { TM = null; clearInterval(tInt); tick(); }
let wl = null;
async function wake(on) { try { if (on && 'wakeLock' in navigator) wl = await navigator.wakeLock.request('screen'); else if (wl) { wl.release(); wl = null; } } catch (e) {} }

/* ───────── confirmação dentro do app (o confirm() do navegador é bloqueado em alguns ambientes) ───────── */
let ASKFN = null;
function ask(title, text, okLabel, fn) { ASKFN = fn; openSheet(`<h2>${title}</h2><p class="sm">${text}</p><button class="btn big gap" style="background:var(--bad);color:#fff" data-act="ask-ok">${okLabel}</button><button class="btn ghost big gap" data-act="sheet-close">Cancelar</button>`); }

/* ───────── sheet ───────── */
function openSheet(html) { $('#sheet-in').innerHTML = html; $('#sheet').classList.add('show'); $('#sheet .pane').scrollTop = 0; }
function closeSheet() { $('#sheet').classList.remove('show'); $('#sheet-in').innerHTML = ''; }

function videoBlock(e) {
  if (!e.vid.length) return '';
  const first = e.vid[0];
  return `<div class="gap"><div class="vid" id="vp"><button class="play" data-act="vid" data-id="${first.id}" data-t="${first.t}">▶ Carregar vídeo (YouTube)</button></div>
   <p class="xs mut">Tempos estimados pela transcrição (±5 s): se cair um pouco antes ou depois, ajuste no vídeo. O vídeo só é carregado quando você toca. Sem internet ou se o autor bloquear a incorporação, abra no YouTube.</p>
   ${e.vid.map(v => `<div class="row between" style="padding:6px 0"><div class="sm"><b>${v.who}</b> · ${v.at} — ${esc(v.label)}</div><div class="row"><button class="btn ghost sm" data-act="vid" data-id="${v.id}" data-t="${v.t}">Ver aqui</button><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${v.id}&t=${v.t}s">YouTube ↗</a></div></div>`).join('')}</div>`;
}
function exSheet(id) {
  const e = EX[id]; const h = history(id); const best = h.length ? Math.max(...h.flatMap(x => doneSets(x.ex).map(s => +s.v))) : null;
  openSheet(`
   <div class="row"><div class="grow"><h2>${esc(e.en)}</h2><div class="mut">${esc(e.pt)}</div></div></div>${demo(id)}
   <div class="chips gap"><span class="chip"><i class="dot" style="background:${catColor(e.cat)}"></i>${CATS[e.cat].pt}</span>${(e.mus || []).map(m => `<span class="chip">${esc(m)}</span>`).join('')}</div>
   ${e.what ? `<p>${esc(e.what)}</p>` : ''}
   ${videoBlock(e)}
   ${e.note ? `<div class="hint down">${esc(e.note)}</div>` : ''}
   ${e.steps.length ? `<h3 class="gap">Como fazer</h3><ol class="steps">${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
   ${e.err.length ? `<h3 class="gap">Erros comuns</h3><ul class="plain">${e.err.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
   ${(e.easy.length || e.hard.length) ? `<div class="row gap" style="align-items:stretch"><div class="card flat grow" style="margin:0"><div class="eyebrow">Mais fácil</div><ul class="plain sm">${e.easy.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="mut">—</li>'}</ul></div><div class="card flat grow" style="margin:0"><div class="eyebrow">Mais difícil</div><ul class="plain sm">${e.hard.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="mut">—</li>'}</ul></div></div>` : ''}
   ${h.length ? `<div class="card flat gap"><div class="eyebrow">Seu histórico</div><p class="sm">${h.length} sessão(ões) · melhor série: <b>${best}${e.unit === 's' ? ' s' : ' reps'}</b><br>Última: ${esc(lastText(id))}</p></div>` : ''}
   ${(!e.vid.length && !e.mini) ? `<p class="xs mut">Sem demonstração verificada nos vídeos originais. Procure a variante correta nas bibliotecas (aba Aprender → Fontes).</p>` : ''}
   <button class="btn ghost big gap" data-act="sheet-close">Fechar</button>`);
}

/* ───────── views ───────── */
function checkRow(key, id, dose, on) {
  const e = EX[id];
  return `<div class="check ${on ? 'on' : ''}" data-act="chk" data-k="${key}"><div class="box">${CHECK}</div><div class="grow"><div class="t">${esc(e ? e.en : id)}</div><div class="xs mut">${e ? esc(e.pt) + ' · ' : ''}${esc(dose)}</div></div>${e ? `<button class="link" data-act="ex" data-id="${id}">como?</button>` : ''}</div>`;
}
const ago = s => { const d = Math.round((new Date(today() + 'T12:00') - new Date(s + 'T12:00')) / 864e5); return d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`; };

function vToday() {
  const ph = phase(), a = DB.active;
  const type = UI.pick || nextType(), ab = abFor(type), plan = buildPlan(type, ab), meta = SESSION_META[type];
  const ws = weekStart(), wk = DB.logs.filter(l => new Date(l.date + 'T12:00') >= ws);
  const last = DB.logs[DB.logs.length - 1];
  const todayDone = DB.logs.some(l => l.date === today());
  const mDone = DB.morning[today()] || {};
  const colors = { push: ['#e8562a', '#ff9a5a'], pull: ['#2f6fe0', '#5ab0ff'], legs: ['#1f8f5a', '#6fd38d'] }[type];
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
  const soft = isRead() && last && (last.date === today() || ago(last.date) === 'ontem') && !a;
  return `
  <div class="top"><div><div class="sub">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>${greet}, ${esc(DB.set.name || 'atleta')} 👋</h1></div></div>
  ${DB.set.test ? `<div class="hint down" style="margin:0 0 8px"><b>Modo teste:</b> treinos concluídos não entram no histórico nem na evolução. <button class="link" data-act="tog" data-k="test">Desligar</button></div>` : ''}
  <div class="chips"><span class="chip sel">${ph.n} · ${ph.sub}</span><span class="chip">RIR ${ph.rir}</span><span class="chip">Séries: ${ph.sets}</span></div>
  ${X.todayMorning ? X.todayMorning() : ''}
  <div class="eyebrow" style="margin:16px 2px 0">🌤 Tarde · Calistenia</div>
  ${a ? `<div class="hero" style="--c1:#1c1b19;--c2:#3a3833"><div class="eyebrow" style="color:#ffffffaa">Em andamento</div><h2>${SESSION_META[a.type].n}${a.ab ? ' ' + a.ab : ''}</h2><p class="sm">Iniciado às ${new Date(a.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Tudo foi salvo.</p><button class="btn gap" data-act="go-work">Continuar treino</button></div>` : `
  <div class="hero" style="--c1:${colors[0]};--c2:${colors[1]}">
    <div class="eyebrow" style="color:#ffffffcc">${UI.pick ? 'Sessão escolhida' : 'Próxima sessão sugerida'}</div>
    <h2>${meta.n}${ab ? ' ' + ab : isRead() ? ' · readaptação' : ''}</h2>
    <p class="sm" style="margin:2px 0 10px">${meta.focus}</p>
    <div class="row wrap"><span class="chip">⏱ ${plan.min} min</span><span class="chip">${plan.ex.length} exercícios</span><span class="chip">RIR ${isRead() ? ph.rir : plan.ex[0].rir}</span></div>
    <div class="gap">${plan.ex.map(e => `<div class="row between sm" style="padding:3px 0;gap:10px"><div class="th" style="width:64px;background:#ffffff33">${window.Anim && Anim.has(e.id) ? Anim.svg(e.id, { still: true }) : ''}</div><span class="grow">${esc(nameOf(e.id))}</span><b>${e.sets === (e.setsMin || e.sets) ? e.sets : e.setsMin + '–' + e.sets}×${e.reps}${(e.unit || EX[e.id].unit) === 's' ? ' s' : ''}</b></div>`).join('')}</div>
  </div>
  ${soft ? `<div class="hint down">Na readaptação, prefira intercalar os treinos com descanso ou caminhada (ex.: dias 1, 3 e 5). Se sentir-se recuperado, tudo bem.</div>` : ''}
  ${X.legsHint ? X.legsHint(type) : ''}
  ${plan.derived ? `<div class="hint">Esta sessão de readaptação foi derivada do plano V2 (menos séries, RIR alto). O plano só detalha o Push da semana 1.</div>` : ''}
  <div class="card"><div class="eyebrow">Como você está hoje?</div>
    <div class="ready gap">${[['g', '🟢', 'Bem', 'g'], ['y', '🟡', 'Cansado', 'y'], ['r', '🔴', 'Algo errado', 'r']].map(([k, e, t, c]) => `<button class="${c} ${UI.ready === k ? 'on' : ''}" data-act="ready" data-k="${k}"><span class="e">${e}</span><span>${t}</span></button>`).join('')}</div>
    ${UI.ready === 'y' ? `<p class="sm mut gap">Sono ruim, fadiga alta ou dor muscular que atrapalha a técnica: o treino começa com <b>uma série a menos</b> nos exercícios, ou regrida.</p>` : ''}
    ${UI.ready === 'r' ? `<p class="sm gap" style="color:var(--bad)"><b>Dor aguda/articular, tontura, perda incomum de força ou mal-estar:</b> não treine força hoje. Caminhada leve ou descanso. Se persistir, procure orientação profissional.</p>` : ''}
    <button class="btn big gap" data-act="start" ${UI.ready === 'r' ? 'disabled' : ''}>Começar ${meta.n}${ab ? ' ' + ab : ''}</button>
    <div class="row gap wrap"><span class="xs mut">Trocar:</span>${SESSION_ORDER.map(t => `<button class="chip ${type === t ? 'sel' : ''}" data-act="pick" data-t="${t}">${SESSION_META[t].n}</button>`).join('')}${!isRead() ? `<span class="xs mut" style="margin-left:6px">Versão:</span>${['A', 'B'].map(x => `<button class="chip ${ab === x ? 'sel' : ''}" data-act="ab" data-k="${x}">${x}</button>`).join('')}` : ''}</div>
  </div>`}
  ${todayDone && !a ? `<div class="hint up">✔ Você já treinou hoje. Não compense sessões acumulando volume.</div>` : ''}

  <div class="card"><div class="row between"><h3>Esta semana</h3><span class="xs mut">${wk.length} sessão(ões) de força${X.weekSummary ? ' · ' + X.weekSummary() : ''}</span></div>
    <div class="row gap" style="justify-content:space-between">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => { const dt = new Date(ws); dt.setDate(dt.getDate() + i); const k = ymd(dt); const l = wk.find(x => x.date === k); const w = X.weekMark ? X.weekMark(k) : ''; const isT = k === today();
      return `<div style="text-align:center;flex:1"><div class="xs mut">${d}</div><div class="tile" style="margin:4px auto;width:36px;height:36px;border-radius:50%;background:${l ? catColor(l.type) : w ? 'var(--surf2)' : 'transparent'};border:2px solid ${isT ? 'var(--acc)' : 'var(--line)'};color:${w && !l ? 'var(--mut)' : '#fff'};font-size:12px">${l ? SESSION_META[l.type].n[0] : w}</div></div>`; }).join('')}</div>
    <p class="xs mut">Dias extras são opcionais. Corrida e caminhada aparecem como 🏃 e 🚶. Domingo é descanso.</p>
  </div>

  <details class="card" data-d="morning" ${(UI.open.morning ?? Object.keys(mDone).length) ? 'open' : ''}><summary>Rotina matinal opcional · 6–10 min · esforço 2–3/10 <span class="xs mut">(${Object.keys(mDone).length}/${MORNING.length})</span></summary>
    <p class="xs mut">Sem fadigar para o resto do dia. Não é treino de força.</p>
    ${MORNING.map(([k, d], i) => EX[k] ? checkRow('m:' + i, k, d, mDone[i]) : `<div class="check ${mDone[i] ? 'on' : ''}" data-act="chk" data-k="m:${i}"><div class="box">${CHECK}</div><div class="grow"><div class="t">${esc(k)}</div><div class="xs mut">${d}</div></div></div>`).join('')}
  </details>

  ${advanceCard()}
  ${last ? `<div class="card flat"><div class="eyebrow">Última sessão · ${ago(last.date)}</div><p class="sm" style="margin-bottom:0"><b>${SESSION_META[last.type].n}${last.ab ? ' ' + last.ab : ''}</b> · esforço ${last.effort ?? '—'}/10 ${last.notes ? '· “' + esc(last.notes.slice(0, 80)) + '”' : ''}</p></div>` : `<div class="card flat"><p class="sm mut" style="margin:0">Ainda não há treinos registrados. O primeiro é o Push, independentemente do dia da semana. Sem testes de máximo — o objetivo é reaprender e voltar à regularidade.</p></div>`}`;
}
function advanceCard() {
  const i = PHASES.findIndex(p => p.id === DB.set.phase); if (i >= PHASES.length - 1) return '';
  const n = PHASES[i + 1];
  return `<details class="card"><summary>Pronto para avançar para “${n.n}”?</summary>
   <p class="sm">Avance quando as sessões estiverem controladas, <b>sem</b> dor articular, queda persistente de rendimento ou fadiga que comprometa trabalho/estudos. Se necessário, estenda a readaptação para 3–4 semanas ou mais. Não há pressa nem data fixa.</p>
   <button class="btn ghost sm" data-act="phase" data-p="${n.id}">Avançar para ${n.n}</button></details>`;
}

/* ───────── demonstração (ilustração animada, mídia própria ou vídeo) ───────── */
function demo(id, cls) {
  const e = EX[id]; const has = window.Anim && Anim.has(id), both = has && Anim.hasSide(id) && Anim.hasFront(id);
  const front = UI.fv[id] !== undefined ? UI.fv[id] : (has && Anim.pref(id));
  const m = window.MEDIA && MEDIA[id], med = !m ? '' : /\.(mp4|webm)$/i.test(m) ? `<video class="media" src="media/${m}" autoplay loop muted playsinline></video>` : `<img class="media" src="media/${m}" alt="Execução de ${esc(e.en)}">`;
  return `<div class="demo ${cls || ''}">${has ? Anim.svg(id, { view: front ? 'f' : 's' }) : `<div class="demo-fb">${tile(id)}<div class="sm mut">Sem ilustração — veja “como fazer”${e.vid.length ? ' ou o vídeo' : ''}.</div></div>`}${med}
   ${has ? `<span class="demo-tag">ilustração · ${front ? 'de frente' : 'de lado'}</span>` : ''}${both ? `<button class="demo-view" data-act="fview" data-id="${id}">⟲ ${front ? 'De lado' : 'De frente'}</button>` : ''}${e.vid.length ? `<button class="demo-vid" data-act="ex" data-id="${id}">▶ Execução real</button>` : ''}</div>`;
}
const thumb = id => (window.Anim && Anim.has(id)) ? `<div class="th">${Anim.svg(id, { still: true, view: Anim.pref(id) ? 'f' : 's' })}</div>` : tile(id);

/* ───────── player de treino ───────── */
const UNI = new Set(['assisted_pistol', 'shrimp', 'split_squat', 'seated_pike_lift']);
const SEC = { warm: 'Aquecimento', ramp: 'Ramp-up de força', ex: 'Treino principal', stretch: 'Alongamento', end: 'Final' };
const secsOf = dose => { const m = String(dose).match(/(\d+)(?:[–-](\d+))?\s*s\b/); return m ? +(m[2] || m[1]) : 0; };
function buildSteps(a) {
  const meta = SESSION_META[a.type], warm = meta.warm === 'upper' ? WARM_UP : WARM_LEGS, ramp = RAMP[a.type], st = [];
  warm.filter(([k]) => !(a.phase === 'w1' && k === 'rev_wrist_pushup')).forEach(([k, d]) => st.push({ t: 'warm', id: k, dose: d, key: 'w:' + k }));
  ramp.forEach(([k, d]) => st.push({ t: 'ramp', id: k, dose: d, key: 'r:' + k }));
  if (!ramp.length && a.ex[0]) st.push({ t: 'ramp', id: a.ex[0].id, dose: '3–5 repetições fáceis', key: 'r:first' });
  a.ex.forEach((e, i) => st.push({ t: 'ex', i }));
  STRETCH[a.type].forEach(([k, d]) => st.push({ t: 'stretch', id: k, dose: d, key: 's:' + k }));
  st.push({ t: 'end' });
  return st;
}
function defVal(e, j) {
  const prev = e.sets.slice(0, j).reverse().find(s => s.v !== ''); if (prev) return String(prev.v);
  const h = history(e.id)[0]; if (h) { const d = doneSets(h.ex)[0]; if (d) return String(d.v); }
  const lo = parseInt(e.reps); return isNaN(lo) ? '' : String(lo);
}
function enterStep(a) {
  stopTimer(); const st = buildSteps(a)[a.step]; a.sub = 'work'; a.side = 0; a.rir = ''; UI.hold = { run: false };
  if (st && st.t === 'ex') { const e = a.ex[st.i], j = e.sets.findIndex(s => !s.d); if (j < 0) a.sub = 'rate'; else a.val = defVal(e, j); }
  save();
}
const stepDone = (a, s) => s.t === 'ex' ? a.ex[s.i].sets.every(x => x.d) : s.t === 'end' ? false : !!a.checks[s.key];

function vWork() {
  const a = DB.active; if (!a) { UI.tab = 'today'; return vToday(); }
  const steps = buildSteps(a); a.step = Math.max(0, Math.min(a.step || 0, steps.length - 1)); const s = steps[a.step];
  const total = a.ex.reduce((n, e) => n + e.sets.length, 0), done = a.ex.reduce((n, e) => n + e.sets.filter(x => x.d).length, 0);
  const secIdx = steps.filter((x, i) => x.t === s.t && i <= a.step).length, secTot = steps.filter(x => x.t === s.t).length;
  const top = `<div class="pl-top"><button class="icon-btn" data-act="pmenu" aria-label="Menu">✕</button>
    <div class="grow"><div class="eyebrow">${SEC[s.t]}${s.t !== 'end' ? ` · ${secIdx}/${secTot}` : ''}</div><div class="xs mut"><span id="el">${mmss((Date.now() - a.start) / 1000)}</span> · ${done}/${total} séries</div></div>
    <button class="icon-btn" data-act="plist" aria-label="Lista">☰</button></div>
    <div class="segs">${steps.map((x, i) => `<i class="${i < a.step ? 'd' : i === a.step ? 'n' : ''} ${x.t}"></i>`).join('')}</div>`;
  let body = '';
  if (s.t === 'warm' || s.t === 'ramp' || s.t === 'stretch') body = plStatic(a, s, steps);
  else if (s.t === 'ex') body = plEx(a, s);
  else body = plEnd(a);
  return `<div class="player">${top}${body}</div>`;
}
function howTo(e) {
  return `<details class="card flat" style="margin:10px 0 0"><summary>Como fazer e erros comuns</summary>${e.what ? `<p class="sm">${esc(e.what)}</p>` : ''}${e.note ? `<div class="hint down">${esc(e.note)}</div>` : ''}${e.steps.length ? `<ol class="steps sm">${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}${e.err.length ? `<div class="eyebrow">Evite</div><ul class="plain sm">${e.err.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</details>`;
}
function plStatic(a, s, steps) {
  const e = EX[s.id], sec = secsOf(s.dose);
  return `${demo(s.id)}
   <div class="pl-name"><h1>${esc(e.en)}</h1><div class="mut">${esc(e.pt)}</div></div>
   <div class="dose">${esc(s.dose)}</div>
   ${s.t === 'ramp' ? `<p class="sm mut center">Leve, sem fadigar. Só prepara o corpo.</p>` : ''}
   ${howTo(e)}
   ${s.t === 'stretch' && sec ? `<button class="btn ghost big gap" data-act="stimer" data-s="${sec}" data-n="${esc(e.en)}">⏱ Cronômetro de ${sec} s</button>` : ''}
   <div class="row gap"><button class="btn ghost" data-act="pprev" ${a.step ? '' : 'disabled'}>←</button><button class="btn big grow" data-act="pnext">Feito ✓</button><button class="btn ghost" data-act="pskip">Pular</button></div>`;
}
function plEx(a, s) {
  const e = a.ex[s.i], ex = EX[e.id];
  if (a.sub === 'rest') return plRest(a, e, s);
  if (a.sub === 'rate') return plRate(a, e, s);
  const j = e.sets.findIndex(x => !x.d), uni = UNI.has(e.id), hold = e.unit === 's';
  const lt = lastText(e.id), hint = hintFor(e);
  return `${demo(e.id)}
   <div class="pl-name"><h1>${esc(ex.en)}</h1><div class="mut">${esc(ex.pt)}</div></div>
   <div class="chips" style="justify-content:center"><span class="chip"><b>${e.sets.length}×${e.reps}${hold ? ' s' : ''}</b></span><span class="chip">⏱ ${restTxt(e.rest)}</span><span class="chip">RIR ${e.rir}</span>${uni ? '<span class="chip">por lado</span>' : ''}${e.optional ? '<span class="chip">opcional</span>' : ''}</div>
   <div class="dots">${e.sets.map((x, k) => `<i class="${x.d ? 'd' : k === j ? 'n' : ''}"></i>`).join('')}</div>
   <div class="center eyebrow" style="margin-top:6px">Série ${j + 1} de ${e.sets.length}${uni ? ` · ${a.side === 0 ? 'lado 1 (o mais fraco primeiro)' : 'lado 2 — iguale as repetições'}` : ''}</div>
   ${e.note ? `<p class="sm center" style="margin:8px 0 0">${esc(e.note)}</p>` : ''}
   ${hold ? holdUi(a, e) : `<div class="stepper"><button data-act="vdec" aria-label="Menos">−</button><div><div class="val" id="val">${esc(a.val || 0)}</div><div class="xs mut center">repetições</div></div><button data-act="vinc" aria-label="Mais">+</button></div>`}
   <div class="eyebrow center">RIR (quantas ainda caberiam)? <span class="mut">opcional</span></div>
   <div class="rirs">${[0, 1, 2, 3, 4, 5].map(n => `<button class="${String(a.rir) === String(n) ? 'on' : ''}" data-act="rir" data-n="${n}">${n === 5 ? '5+' : n}</button>`).join('')}</div>
   <button class="btn xl gap" data-act="sdone">Concluir série ✓</button>
   ${lt ? `<div class="hint">Última vez — ${esc(lt)}</div>` : '<div class="hint">Primeira vez: comece pela versão fácil e com RIR alto. Não teste máximos.</div>'}
   ${hint ? `<div class="hint ${hint.up ? 'up' : 'down'}">${hint.up ? '⬆ ' : '⬇ '}${esc(hint.t)}</div>` : ''}
   ${howTo(ex)}
   <div class="row gap wrap"><select class="field" style="width:auto;text-align:left;padding:9px" data-var="${s.i}"><option value="">Variação usada…</option>${ex.vars.map(v => `<option ${e.variant === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
    ${e.alt && EX[e.alt] ? `<button class="chip" data-act="swap" data-i="${s.i}">↔ ${esc(EX[e.alt].pt)}</button>` : ''}${e.orig !== e.id ? `<button class="chip" data-act="unswap" data-i="${s.i}">↩ voltar</button>` : ''}
    <button class="chip" data-act="addset" data-i="${s.i}">+ série</button>${e.sets.length > 1 ? `<button class="chip" data-act="delset" data-i="${s.i}">− série</button>` : ''}</div>
   <div class="row gap"><button class="btn ghost" data-act="pprev" ${a.step ? '' : 'disabled'}>←</button><button class="btn ghost grow" data-act="pskip">Pular exercício</button></div>`;
}
function holdUi(a, e) {
  const run = UI.hold && UI.hold.run;
  return `<div class="stepper hold"><div class="center"><div class="val" id="hv">${run ? Math.floor((Date.now() - UI.hold.t0) / 1000) : (a.val || 0)}<span class="u"> s</span></div><div class="xs mut">${run ? `segurando… meta ${e.reps} s` : 'sustentação'}</div></div></div>
   <div class="row">${run ? `<button class="btn xl grow" style="background:var(--bad);color:#fff" data-act="hstop">Parar</button>` : `<button class="btn ghost grow" data-act="vdec">−1 s</button><button class="btn big grow" data-act="hstart">▶ Iniciar</button><button class="btn ghost grow" data-act="vinc">+1 s</button>`}</div>`;
}
function plRest(a, e, s) {
  const j = e.sets.findIndex(x => !x.d), left = TM ? Math.max(0, Math.ceil((TM.end - Date.now()) / 1000)) : 0, tot = TM ? TM.total : e.rest;
  return `<div class="rest"><div class="eyebrow center">Descanso</div>
   <div class="ring"><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--surf2)" stroke-width="10"/><circle id="rring" cx="80" cy="80" r="70" fill="none" stroke="var(--acc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="440" stroke-dashoffset="${440 * (1 - left / tot)}" transform="rotate(-90 80 80)"/></svg><div class="rt" id="rt">${mmss(left)}</div></div>
   <div class="row" style="justify-content:center"><button class="btn ghost" data-act="t-less">−15 s</button><button class="btn ghost" data-act="t-add">+15 s</button></div>
   <div class="card" style="margin-top:16px"><div class="eyebrow">A seguir</div><div class="row gap">${thumb(e.id)}<div class="grow"><b>${esc(EX[e.id].en)}</b><div class="sm mut">Série ${j + 1} de ${e.sets.length} · ${e.reps}${e.unit === 's' ? ' s' : ' reps'}${UNI.has(e.id) ? ' por lado' : ''}</div></div></div></div>
   <p class="sm mut center">Respire e sacuda braços e pernas. Quando estiver pronto, siga.</p>
   <button class="btn xl gap" data-act="rnext">Próxima série</button></div>`;
}
function plRate(a, e, s) {
  const ex = EX[e.id], nxt = a.ex[s.i + 1];
  return `<div class="center"><div class="eyebrow">Exercício concluído</div><h1>${esc(ex.en)}</h1></div>
   <div class="card"><div class="chips" style="justify-content:center">${e.sets.filter(x => x.d).map(x => `<span class="chip sel">${x.v}${UNI.has(e.id) && x.v2 !== undefined ? '/' + x.v2 : ''}${e.unit === 's' ? ' s' : ''}${x.r !== '' ? ` · RIR ${x.r}` : ''}</span>`).join('') || '<span class="mut sm">Nenhuma série registrada</span>'}</div></div>
   <div class="eyebrow">Como foi a técnica?</div>
   <div class="row tech" style="margin-top:6px;gap:6px">${[['bom', '🟢 Boa'], ['regular', '🟡 Regular'], ['melhorar', '🔴 Melhorar']].map(([k, t]) => `<button class="${e.tech === k ? 'on' : ''}" data-act="tech" data-i="${s.i}" data-k="${k}">${t}</button>`).join('')}</div>
   <select class="field gap" style="text-align:left" data-var="${s.i}"><option value="">Variação usada…</option>${ex.vars.map(v => `<option ${e.variant === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
   <input class="field gap" style="text-align:left" placeholder="Nota deste exercício (opcional)" value="${esc(e.obs)}" data-obs="${s.i}">
   ${nxt ? `<div class="hint gap">Próximo exercício: <b>${esc(EX[nxt.id].en)}</b> · ${nxt.sets.length}×${nxt.reps}</div>` : ''}
   <button class="btn xl gap" data-act="enext">${nxt ? 'Próximo exercício' : 'Seguir'} ▸</button>
   <div class="row gap"><button class="btn ghost grow" data-act="redo" data-i="${s.i}">+ mais uma série</button></div>`;
}
function plEnd(a) {
  const n = a.ex.reduce((x, e) => x + e.sets.filter(y => y.d).length, 0);
  return `<div class="center"><div class="eyebrow">Quase lá</div><h1>Como foi, ${esc(DB.set.name || 'atleta')}?</h1><p class="mut sm">${n} séries registradas.</p></div>
  <div class="card"><div class="eyebrow">Esforço geral (1–10)</div>
    <div class="row wrap" style="gap:6px;margin-top:6px">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="chip ${a.effort === n ? 'sel' : ''}" style="min-width:38px;justify-content:center;padding:9px" data-act="effort" data-n="${n}">${n}</button>`).join('')}</div>
    <div class="eyebrow gap">Algo a registrar?</div>
    <div class="row wrap" style="gap:6px;margin-top:6px">${['Dor articular', 'Punhos', 'Ombros', 'Pouca mobilidade', 'Recuperação ruim'].map(k => `<button class="chip ${a.pain.includes(k) ? 'sel' : ''}" data-act="pain" data-k="${k}">${k}</button>`).join('')}</div>
    <textarea class="field gap" id="notes" placeholder="Observações: dor, mobilidade, recuperação, o que sentiu…">${esc(a.notes)}</textarea>
    <p class="xs mut">Dica: filme uma série por exercício de vez em quando (de lado e/ou diagonal) para revisar a forma.</p></div>
  <button class="btn xl" data-act="finish">Concluir treino</button>
  <div class="row gap"><button class="btn ghost" data-act="pprev">←</button><button class="btn ghost grow" style="color:var(--bad)" data-act="cancel">Descartar treino</button></div>`;
}

/* biblioteca */
function vLib() {
  const q = UI.libQ.trim().toLowerCase();
  const list = Object.values(EX).filter(e => (UI.libCat === 'all' || e.cat === UI.libCat) && (!q || (e.en + ' ' + e.pt + ' ' + e.mus.join(' ')).toLowerCase().includes(q)));
  list.sort((a, b) => Object.keys(CATS).indexOf(a.cat) - Object.keys(CATS).indexOf(b.cat) || a.en.localeCompare(b.en));
  return `<div class="top"><div><h1>Biblioteca</h1><div class="sub">${Object.keys(EX).length} movimentos · nome em inglês, tradução e como fazer · <a href="#" data-act="tab" data-k="gallery">ver galeria</a></div></div></div>
  <input class="search" id="q" type="search" placeholder="Buscar: pike, punho, tríceps…" value="${esc(UI.libQ)}">
  <div class="chips gap"><button class="chip ${UI.libCat === 'all' ? 'sel' : ''}" data-act="cat" data-k="all">Todos</button>${Object.entries(CATS).map(([k, c]) => `<button class="chip ${UI.libCat === k ? 'sel' : ''}" data-act="cat" data-k="${k}"><i class="dot" style="background:${c.c}"></i>${c.n}</button>`).join('')}</div>
  <div class="card" id="liblist">${libItems(list)}</div>
  <p class="xs mut">▶ = tem demonstração em vídeo dos autores com marcação de tempo. Os demais usam as bibliotecas complementares (aba Aprender).</p>`;
}
const libItems = list => list.length ? list.map(e => `<div class="li" data-act="ex" data-id="${e.id}">${thumb(e.id)}<div class="grow"><div style="font-weight:650">${esc(e.en)}</div><div class="xs mut">${esc(e.pt)}</div></div>${e.vid.length ? '<span class="chip">▶</span>' : ''}</div>`).join('') : '<p class="mut">Nada encontrado.</p>';

/* evolução */
function chart(pts, unit) {
  if (pts.length < 2) return `<p class="sm mut">Registre ao menos 2 sessões para ver a evolução.</p>`;
  const W = 320, H = 120, p = 22, ys = pts.map(x => x.y), mn = Math.min(...ys), mx = Math.max(...ys), r = (mx - mn) || 1;
  const X = i => p + i * (W - 2 * p) / (pts.length - 1), Y = y => H - p - (y - mn) / r * (H - 2 * p);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline fill="none" stroke="var(--acc)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${pts.map((q, i) => X(i) + ',' + Y(q.y)).join(' ')}"/>
  ${pts.map((q, i) => `<circle cx="${X(i)}" cy="${Y(q.y)}" r="4.5" fill="var(--acc)"/><text x="${X(i)}" y="${Y(q.y) - 9}" font-size="11" text-anchor="middle" fill="var(--ink)">${q.y}</text><text x="${X(i)}" y="${H - 4}" font-size="9.5" text-anchor="middle" fill="var(--mut)">${q.d}</text>`).join('')}</svg>`;
}
const progSeg = () => `<div class="seg" style="margin-bottom:6px"><button class="${UI.progSeg !== 'cardio' ? 'on' : ''}" data-act="pseg" data-k="forca">Força</button><button class="${UI.progSeg === 'cardio' ? 'on' : ''}" data-act="pseg" data-k="cardio">Cardio</button></div>`;
function vProg() { if (UI.progSeg === 'cardio' && X.progCardio) return `<div class="top"><div><h1>Evolução</h1><div class="sub">Corrida e caminhada · só o que você registrou</div></div></div>${progSeg()}${X.progCardio()}`; return vProgForca(); }
function vProgForca() {
  const logs = DB.logs, ws = weekStart();
  const wk = logs.filter(l => new Date(l.date + 'T12:00') >= ws).length;
  const weeks = new Set(logs.map(l => ymd(weekStart(new Date(l.date + 'T12:00'))))); let streak = 0; const c = weekStart(); if (!weeks.has(ymd(c))) c.setDate(c.getDate() - 7); while (weeks.has(ymd(c))) { streak++; c.setDate(c.getDate() - 7); }
  const since = new Date(); since.setDate(since.getDate() - 7);
  const vol = {}; logs.filter(l => new Date(l.date + 'T12:00') > since).forEach(l => l.ex.forEach(e => { const p = EX[e.id] && EX[e.id].pat; if (p) vol[p] = (vol[p] || 0) + e.sets.filter(s => s.d).length; }));
  const exIds = [...new Set(logs.flatMap(l => l.ex.filter(e => e.sets.some(s => s.d)).map(e => e.id)))].filter(id => EX[id]);
  if (!UI.progEx || !exIds.includes(UI.progEx)) UI.progEx = exIds[0] || null;
  const pts = UI.progEx ? history(UI.progEx).reverse().map(h => ({ y: Math.max(...doneSets(h.ex).map(s => +s.v)), d: fmtDate(h.log.date, { day: '2-digit', month: '2-digit' }) })).filter(p => isFinite(p.y)) : [];
  const techs = UI.progEx ? history(UI.progEx).reverse().map(h => h.ex.tech).filter(Boolean) : [];
  const goals = GOALS.map(g => { let b = 0; g.ids.forEach(id => history(id).forEach(h => { if (!g.variants.includes(h.ex.variant) && h.ex.variant !== '') return; if (h.ex.variant === '' && id !== 'pushup') return; doneSets(h.ex).forEach(s => { b = Math.max(b, +s.v || 0); }); })); return { ...g, b }; });
  return `<div class="top"><div><h1>Evolução</h1><div class="sub">Só o que você registrou, sem números inventados</div></div></div>${progSeg()}
  <div class="row"><div class="stat"><b>${logs.length}</b><span class="xs mut">sessões</span></div><div class="stat"><b>${wk}</b><span class="xs mut">nesta semana</span></div><div class="stat"><b>${streak}</b><span class="xs mut">sem. seguidas</span></div></div>
  <div class="card"><h3>Volume — últimos 7 dias</h3><p class="xs mut">Séries feitas por padrão. Alvo = referência da <b>reconstrução</b>; na readaptação o volume é menor de propósito. Séries unilaterais contam por lado.</p>
   ${Object.entries(PATTERNS).map(([k, p]) => { const v = vol[k] || 0; return `<div class="gap"><div class="row between sm"><span>${p.n}</span><b>${v}<span class="mut">/${p.t}</span></b></div><div class="bar"><i style="width:${Math.min(100, v / p.t * 100)}%;${v > p.t ? 'background:var(--warn)' : ''}"></i></div></div>`; }).join('')}</div>
  <div class="card"><h3>Evolução por exercício</h3>
   ${exIds.length ? `<select class="field gap" style="text-align:left" id="progex">${exIds.map(id => `<option value="${id}" ${id === UI.progEx ? 'selected' : ''}>${esc(EX[id].en)}</option>`).join('')}</select>
   <p class="xs mut gap">Melhor série por sessão (${EX[UI.progEx].unit === 's' ? 'segundos' : 'repetições'}). Compare só variações iguais.</p>${chart(pts)}
   ${techs.length ? `<p class="xs mut">Técnica registrada: ${techs.map(t => ({ bom: '🟢', regular: '🟡', melhorar: '🔴' }[t])).join(' ')}</p>` : ''}` : '<p class="sm mut">Conclua uma sessão para ver gráficos aqui.</p>'}</div>
  <div class="card"><h3>Metas de longo prazo</h3><p class="xs mut">Referências motivacionais dos autores, não requisitos nem testes. Não teste máximos no retorno.</p>
   ${goals.map(g => `<div class="gap"><div class="row between sm"><span>${g.n}</span><b>${g.b}<span class="mut"> / ${g.t}</span></b></div><div class="bar"><i style="width:${Math.min(100, g.b / g.t * 100)}%"></i></div><div class="xs mut">${g.who}</div></div>`).join('')}</div>
  <div class="card"><h3>Histórico</h3>${logs.length ? [...logs].reverse().map(l => `<div class="li" data-act="log" data-id="${l.id}"><div class="tile" style="background:${catColor(l.type)}">${SESSION_META[l.type].n[0]}</div><div class="grow"><div style="font-weight:650">${SESSION_META[l.type].n}${l.ab ? ' ' + l.ab : ''} · ${fmtDate(l.date, { day: '2-digit', month: 'short', year: 'numeric' })}</div><div class="xs mut">esforço ${l.effort ?? '—'}/10 · ${l.ex.reduce((s, e) => s + e.sets.filter(x => x.d).length, 0)} séries${l.pain && l.pain.length ? ' · ⚠ ' + l.pain.join(', ') : ''}</div></div></div>`).join('') : '<p class="sm mut">Nenhum treino ainda.</p>'}</div>`;
}
function logSheet(id) {
  const l = DB.logs.find(x => x.id == id); if (!l) return;
  openSheet(`<h2>${SESSION_META[l.type].n}${l.ab ? ' ' + l.ab : ''} · ${fmtDate(l.date, { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
  <p class="sm mut">${PHASES.find(p => p.id === l.phase).n} · esforço ${l.effort ?? '—'}/10 · duração ${l.dur ? l.dur + ' min' : '—'} · ${{ g: 'se sentia bem', y: 'estava cansado', r: '' }[l.ready] || ''}</p>
  ${l.ex.filter(e => e.sets.some(s => s.d)).map(e => `<div class="card flat"><b>${esc(nameOf(e.id))}</b>${e.variant ? ` <span class="chip">${esc(e.variant)}</span>` : ''}<div class="sm">${e.sets.filter(s => s.d).map(s => `${s.v}${e.unit === 's' ? ' s' : ''}${s.r !== '' ? ` <span class="mut">(RIR ${s.r})</span>` : ''}`).join(' · ')}</div><div class="xs mut">${e.tech ? 'técnica ' + { bom: 'boa', regular: 'regular', melhorar: 'a melhorar' }[e.tech] : ''} ${e.obs ? '· ' + esc(e.obs) : ''}</div></div>`).join('')}
  ${l.pain && l.pain.length ? `<p class="sm">⚠ ${esc(l.pain.join(', '))}</p>` : ''}${l.notes ? `<p class="sm">“${esc(l.notes)}”</p>` : ''}
  <button class="btn ghost big gap" data-act="dellog" data-id="${l.id}" style="color:var(--bad)">Apagar este treino</button><button class="btn big gap" data-act="sheet-close">Fechar</button>`);
}

/* menu Mais */
function vMore() {
  const item = (k, ico, t, d) => `<div class="card li" style="margin:10px 0" data-act="tab" data-k="${k}"><div class="tile" style="background:var(--surf2);color:var(--ink);font-size:22px">${ico}</div><div class="grow"><div style="font-weight:700">${t}</div><div class="xs mut">${d}</div></div><span class="mut">›</span></div>`;
  return `<div class="top"><div><h1>Mais</h1><div class="sub">Diário, aprendizado e ajustes</div></div></div>
  ${item('diary', '📓', 'Diário', 'Pensamentos, ideias e aprendizados')}${item('learn', '💡', 'Aprender', 'RIR, escápulas, corrida, glossário e fontes')}${item('gallery', '🖼', 'Galeria de ilustrações', 'Todos os bonequinhos, início e fim de cada movimento')}${item('set', '⚙️', 'Ajustes', 'Fase, equipamento, cardio, backup e aparência')}
  <p class="xs mut">${DB.logs.length} treinos de força · ${DB.acts.length} atividades de cardio salvos neste aparelho.</p>`;
}

/* galeria: todos os desenhos, quadro inicial e final (para conferir) */
function vGallery() {
  const ids = Object.keys(EX), nA = ids.filter(id => Anim.has(id)).length;
  const blocks = Object.entries(CATS).map(([k, c]) => {
    const list = ids.filter(id => EX[id].cat === k).sort((a, b) => EX[a].en.localeCompare(EX[b].en));
    return `<h3 style="margin:18px 2px 6px"><i class="dot" style="background:${c.c};display:inline-block;width:10px;height:10px;border-radius:50%"></i> ${c.pt}</h3>` + list.map(id => {
      const v = Anim.has(id) && Anim.pref(id) ? 'f' : 's';
      return `<div class="gcard" data-act="ex" data-id="${id}"><div class="gfr">${Anim.has(id) ? Anim.svg(id, { key: 0, view: v }) + Anim.svg(id, { key: 1, view: v }) : '<div class="demo-fb" style="grid-column:1/3;padding:20px"><span class="sm mut">Sem ilustração</span></div>'}</div><div class="row between"><b>${esc(EX[id].en)}</b><span class="xs mut">${esc(EX[id].pt)}</span></div></div>`;
    }).join('');
  }).join('');
  return `<div class="top"><button class="icon-btn" data-act="tab" data-k="more">←</button><div class="grow" style="padding:0 12px"><h1>Galeria</h1><div class="sub">${nA} de ${ids.length} com ilustração · início e fim de cada movimento · toque para ver animado</div></div></div>${blocks}`;
}

/* aprender */
function vLearn() {
  const q = UI.gloss.toLowerCase();
  return `<div class="top"><div><h1>Aprender</h1><div class="sub">O quê, como e por quê — não só contar repetições</div></div></div>
  <div class="card"><h3>3 ideias para guiar tudo</h3><ol class="steps"><li><b>Técnica antes de números.</b> Se a forma cai, regrida. Não existe obrigação de progredir em data fixa.</li><li><b>Pare antes da falha.</b> Use o RIR: termine cada série com repetições sobrando.</li><li><b>Recuperação faz parte do treino.</b> Sono (≥ 7 h), comida suficiente (referência ~1,6 g de proteína/kg/dia para adultos saudáveis), água e dias leves.</li></ol></div>
  <details class="card"><summary>Como estimar o RIR</summary><p class="sm">RIR = repetições corretas que ainda caberiam. Série de 8 que você poderia ter feito 11 → RIR 3. Nas sustentações (isometrias), deixe <b>alguns segundos em reserva</b>. Na dúvida, subestime: no retorno é melhor sobrar do que faltar. Seus números de RIR são estimativas — vão melhorar com o tempo.</p></details>
  <details class="card"><summary>Escápulas: 4 movimentos</summary><ul class="plain sm"><li><b>Protração</b> — afastar (empurrar o chão na flexão)</li><li><b>Retração</b> — aproximar (puxar na remada)</li><li><b>Elevação</b> — subir os ombros (topo da Pike)</li><li><b>Depressão</b> — descer os ombros (sustentação nos fundos, active hang)</li></ul><p class="xs mut">Aprenda a reconhecer cada um; não force posições extremas nem “prenda” as escápulas.</p></details>
  <details class="card"><summary>Semáforo de recuperação</summary><ul class="plain sm"><li>🟢 <b>Verde:</b> recuperado, sem dor articular, treino normal.</li><li>🟡 <b>Amarelo:</b> sono ruim, fadiga alta ou dor muscular que prejudica a técnica → reduza uma série ou regrida.</li><li>🔴 <b>Vermelho:</b> dor aguda/articular, tontura, perda incomum de força, mal-estar → interrompa; procure orientação profissional se persistir.</li></ul><p class="sm">Deload (se a fadiga acumular): reduza as séries em ~30–50% por uma semana, longe da falha. Não é obrigatório a cada 4 semanas.</p></details>
  ${X.learnHtml ? X.learnHtml() : ''}
  <details class="card"><summary>Como o app sugere progredir</summary><p class="sm">Comece na faixa baixa de repetições, com boa técnica. Quando bater o <b>topo da faixa em todas as séries em duas sessões comparáveis</b>, com boa forma e recuperação, teste uma variação um pouco mais difícil — uma coisa por vez. Exemplo (barra): 6/6/5 → 6/6/6 → 7/6/6 → 7/7/6 → 8/7/7 → 8/8/8. Exemplo, não previsão.</p><p class="sm"><b>Cadeias possíveis</b> (a ordem não é universal): Pike mãos elevadas → chão → pés elevados · flexão inclinada → tradicional → declinada · barra assistida → estrita → com pausa · unilateral no banco → pistola assistida → pistola · joelhos na barra → uma perna estendida → pernas estendidas → L-sit suspenso.</p></details>
  <details class="card"><summary>Por que o plano é assim</summary>${DECISIONS.map(([a, b]) => `<p class="sm"><b>${a}.</b> ${b}</p>`).join('')}<p class="xs mut">As notas do plano são adaptações nossas (feitas com ChatGPT), distintas do que Yvguo e Leo Wang afirmam.</p></details>
  <details class="card"><summary>Fases do plano</summary>${PHASES.map(p => `<p class="sm"><b>${p.n} — ${p.sub}.</b> RIR ${p.rir}. ${p.d}</p>`).join('')}</details>
  <details class="card" ${q ? 'open' : ''}><summary>Glossário</summary><input class="search gap" id="gq" type="search" placeholder="Buscar termo…" value="${esc(UI.gloss)}"><div id="gl">${glossHtml()}</div></details>
  <details class="card"><summary>Vídeos originais e capítulos</summary>${VIDEOS.map(v => `<div class="gap"><b>${v.who}</b><div class="xs mut">${esc(v.title)}</div><div class="chips">${v.ch.map(([n, t]) => `<a class="chip" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${v.id}&t=${t}s">${mmss(t)} ${n}</a>`).join('')}</div></div>`).join('')}<p class="xs mut">Vídeos externos de seus autores, abertos no YouTube. Têm trechos de opinião pessoal e publicidade; não são evidência científica por si só. As transcrições podem ter erros automáticos.</p></details>
  ${PRINTS.leo + PRINTS.yvguo > 0 ? `<details class="card"><summary>Templates dos autores (prints)</summary><p class="xs mut">Seções de programação ao final dos vídeos. São fontes de estudo, não prescrições para copiar.</p>
   <div class="eyebrow gap">Leo Wang</div><div class="imgs">${Array.from({ length: PRINTS.leo }, (_, i) => `<img loading="lazy" src="assets/leo/${pad(i + 1)}.png" alt="Leo Wang print ${i + 1}" data-act="img">`).join('')}</div>
   <div class="eyebrow gap">Yvguo</div><div class="imgs">${Array.from({ length: PRINTS.yvguo }, (_, i) => `<img loading="lazy" src="assets/yvguo/${pad(i + 1)}.png" alt="Yvguo print ${i + 1}" data-act="img">`).join('')}</div></details>` : ''}
  <details class="card"><summary>Fontes e bibliotecas</summary><div class="eyebrow gap">Literatura de treino resistido</div>${SCIENCE.map(([n, u]) => `<p class="sm"><a target="_blank" rel="noopener" href="${u}">${n} ↗</a></p>`).join('')}<p class="xs mut">O plano é uma proposta inicial; não valida cada exercício nem prevê resultados individuais. Leia as fontes antes de repetir afirmações específicas.</p>
   <div class="eyebrow gap">Bibliotecas de exercícios</div>${LIBRARIES.map(([n, u]) => `<p class="sm"><a target="_blank" rel="noopener" href="${u}">${n} ↗</a></p>`).join('')}<p class="xs mut">Pontos de partida; não garantem cobertura de todos os movimentos. Confira se a variante é a correta.</p></details>
  <p class="xs mut" style="padding:8px 2px">Este app não substitui avaliação profissional. Dor aguda ou articular, tontura ou mal-estar: pare e procure orientação.</p>`;
}
const glossHtml = () => { const q = UI.gloss.toLowerCase(); return GLOSSARY.filter(([a, b]) => !q || (a + b).toLowerCase().includes(q)).map(([a, b]) => `<p class="sm"><b>${a}.</b> ${b}</p>`).join('') || '<p class="mut sm">Nada encontrado.</p>'; };

/* ajustes */
function vSet() {
  const s = DB.set;
  const tog = (k, t, d) => `<div class="check ${s[k] ? 'on' : ''}" data-act="tog" data-k="${k}"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">${t}</div><div class="xs mut">${d}</div></div></div>`;
  return `<div class="top"><div><h1>Ajustes</h1><div class="sub">Seus dados ficam só neste aparelho</div></div></div>
  <div class="card"><h3>Seu nome</h3><input class="field gap" style="text-align:left" id="nm" value="${esc(s.name)}" placeholder="Como devo te chamar?"></div>
  <div class="card"><h3>Fase atual</h3><p class="xs mut">Você escolhe quando avançar — o app não muda a fase por data.</p>${PHASES.map(p => `<div class="check ${s.phase === p.id ? 'on' : ''}" data-act="phase" data-p="${p.id}"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">${p.n} · ${p.sub}</div><div class="xs mut">RIR ${p.rir} · séries ${p.sets}</div></div></div>`).join('')}</div>
  <div class="card"><h3>Meu equipamento</h3><p class="xs mut">Tenho barra fixa reta e elástico. O que não estiver marcado é adaptado ou omitido, nunca improvisado.</p>
   ${tog('dips', 'Barra segura e fixa para fundos', 'Desmarcado: fundos/sustentação são omitidos.')}${tog('lowBar', 'Barra baixa segura para remada invertida', 'Desmarcado: usa remada sentada com elástico.')}</div>
  ${X.settingsHtml ? X.settingsHtml() : ''}
  <div class="card"><h3>Ilustrações</h3><p class="xs mut">Veja todos os bonequinhos de uma vez (início e fim de cada movimento) para conferir.</p><button class="btn ghost sm" data-act="tab" data-k="gallery">Abrir galeria de ilustrações</button></div>
  <div class="card"><h3>Aparência</h3><div class="seg gap">${[['auto', 'Auto'], ['light', 'Claro'], ['dark', 'Escuro']].map(([k, t]) => `<button class="${s.theme === k ? 'on' : ''}" data-act="theme" data-k="${k}">${t}</button>`).join('')}</div></div>
  <div class="card"><h3>Modo teste</h3><p class="xs mut">Ligado: você pode treinar à vontade no app sem nada ir para o histórico ou a evolução.</p>${tog('test', 'Modo teste ligado', 'Desligue quando for começar a registrar de verdade.')}<button class="btn ghost sm gap" style="color:var(--bad)" data-act="zero">Zerar progresso (mantém ajustes)</button></div>
  <div class="card"><h3>Backup</h3><p class="xs mut">Guarde uma cópia de vez em quando (e para levar os dados a outro aparelho).</p><div class="row gap wrap"><button class="btn ghost sm" data-act="export">Exportar JSON</button><button class="btn ghost sm" data-act="import">Importar</button></div><input type="file" id="imp" accept="application/json" hidden></div>
  <div class="card"><h3>Mais</h3><div class="row wrap gap"><button class="btn ghost sm" data-act="welcome">Rever introdução</button><button class="btn ghost sm" style="color:var(--bad)" data-act="reset">Apagar todos os dados</button></div></div>
  <p class="xs mut">${DB.logs.length} treinos e ${DB.acts.length} atividades salvos · v2</p>`;
}
function vWelcome() {
  const s = DB.set;
  return `<div class="top"><div><h1>Seu treino de calistenia</h1><div class="sub">Treinador, diário, biblioteca e manual — no seu bolso</div></div></div>
  <div class="card"><div class="eyebrow">Como devo te chamar?</div><input class="field gap" style="text-align:left" id="nm" value="${esc(s.name)}"><div class="gap"></div><p>Antes de começar, algumas perguntas rápidas para o plano se ajustar ao que você realmente tem. <b>Você pode mudar tudo depois em Ajustes.</b></p>
   <div class="eyebrow gap">Equipamento</div>
   <div class="check ${s.dips ? 'on' : ''}" data-act="tog" data-k="dips"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">Minha barra é segura para fundos</div><div class="xs mut">Fixa, estável e com acesso seguro. Se não, os fundos são omitidos.</div></div></div>
   <div class="check ${s.lowBar ? 'on' : ''}" data-act="tog" data-k="lowBar"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">Tenho uma barra baixa segura para remada invertida</div><div class="xs mut">Se não, uso remada sentada com elástico.</div></div></div>
   <div class="eyebrow gap">Onde começar</div>
   <div class="seg gap">${PHASES.slice(0, 3).map(p => `<button class="${s.phase === p.id ? 'on' : ''}" data-act="phase" data-p="${p.id}">${p.n}</button>`).join('')}</div>
   <p class="xs mut">Recomendado: Semana 1 (readaptação), com versões fáceis e RIR alto. Os números antigos (20 flexões, 10 barras…) não são testes atuais.</p>
   <button class="btn big gap" data-act="start-app">Vamos começar</button></div>`;
}

/* ───────── render ───────── */
function render(keepScroll = true) {
  const y = window.scrollY;
  const working = UI.tab === 'work';
  const v = !DB.set.onboarded ? vWelcome() : ({ today: vToday, work: vWork, lib: vLib, prog: vProg, learn: vLearn, set: vSet, gallery: vGallery, more: vMore, ...VIEWS }[UI.tab] || vToday)();
  $('#app').innerHTML = v;
  $('#tabs').innerHTML = TABS.map(([k, t]) => `<button class="${(TABGROUP[UI.tab] || UI.tab) === k ? 'on' : ''}" data-act="tab" data-k="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>${t}</button>`).join('');
  document.querySelector('nav.tabs').style.display = DB.set.onboarded && UI.tab !== 'track' ? '' : 'none';
  AFTER.forEach(f => { try { f(); } catch (e) {} });
  const th = DB.set.theme; if (th === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', th);
  if (keepScroll) window.scrollTo(0, y);
}
const go = (tab) => { UI.tab = tab; render(false); window.scrollTo(0, 0); wake(tab === 'work' || tab === 'track' || !!(X.keepAwake && X.keepAwake())); };

/* ───────── ações ───────── */
const A = {
  tab: d => go(d.k), 'sheet-close': closeSheet, ex: d => exSheet(d.id), back: () => go('today'),
  'go-work': () => go('work'),
  ready: d => { UI.ready = d.k; render(); },
  pick: d => { UI.pick = d.t; UI.ab = null; render(); },
  ab: d => { UI.ab = d.k; render(); },
  start: () => { if (UI.ready === 'r') return; const type = UI.pick || nextType(); DB.active = newActive(type, abFor(type), UI.ready); enterStep(DB.active); UI.pick = null; go('work'); },
  chk: d => {
    const [t, k] = d.k.split(/:(.*)/);
    if (t === 'm') { const m = DB.morning[today()] = DB.morning[today()] || {}; m[k] ? delete m[k] : m[k] = true; } else if (DB.active) { DB.active.checks[d.k] = !DB.active.checks[d.k]; }
    save(); render();
  },
  fview: d => { const cur = UI.fv[d.id] !== undefined ? UI.fv[d.id] : Anim.pref(d.id); UI.fv[d.id] = !cur; if ($('#sheet').classList.contains('show')) exSheet(d.id); else render(); },
  vinc: () => { const a = DB.active; a.val = String((parseInt(a.val) || 0) + 1); save(); const v = $('#val') || $('#hv'); if (v) v.firstChild.textContent = a.val; else render(); },
  vdec: () => { const a = DB.active; a.val = String(Math.max(0, (parseInt(a.val) || 0) - 1)); save(); const v = $('#val') || $('#hv'); if (v) v.firstChild.textContent = a.val; else render(); },
  rir: d => { const a = DB.active; a.rir = String(a.rir) === d.n ? '' : d.n; save(); render(); },
  hstart: () => { UI.hold = { run: true, t0: Date.now(), beeped: false }; render(); },
  hstop: () => { const a = DB.active; a.val = String(Math.round((Date.now() - UI.hold.t0) / 1000)); UI.hold = { run: false }; save(); render(); },
  sdone: () => {
    const a = DB.active, st = buildSteps(a)[a.step], e = a.ex[st.i], j = e.sets.findIndex(x => !x.d); if (j < 0) return;
    const s = e.sets[j], v = a.val === '' ? String(parseInt(e.reps) || 0) : a.val;
    if (UNI.has(e.id)) {
      if (a.side === 0) { s.v = v; s.r = a.rir; a.side = 1; a.rir = ''; save(); render(); window.scrollTo(0, 0); toast('Agora o outro lado'); return; }
      s.v2 = v; if (a.rir !== '') s.r = a.rir;
    } else { s.v = v; s.r = a.rir; }
    s.d = true; a.side = 0; a.rir = ''; UI.hold = { run: false };
    const k = e.sets.findIndex(x => !x.d);
    if (k >= 0) { a.sub = 'rest'; a.val = defVal(e, k); startTimer(e.rest || 60, 'Descanso · ' + EX[e.id].en); } else { a.sub = 'rate'; stopTimer(); }
    save(); render(); window.scrollTo(0, 0);
  },
  rnext: () => { const a = DB.active; stopTimer(); a.sub = 'work'; save(); render(); window.scrollTo(0, 0); },
  enext: () => { const a = DB.active; a.step++; enterStep(a); render(); window.scrollTo(0, 0); },
  redo: d => { const a = DB.active, e = a.ex[d.i]; e.sets.push({ v: '', r: '', d: false }); enterStep(a); render(); window.scrollTo(0, 0); },
  pnext: () => { const a = DB.active, st = buildSteps(a)[a.step]; if (st.key) a.checks[st.key] = true; a.step++; enterStep(a); render(); window.scrollTo(0, 0); },
  pskip: () => { const a = DB.active; a.step++; enterStep(a); render(); window.scrollTo(0, 0); },
  pprev: () => { const a = DB.active; a.step = Math.max(0, a.step - 1); enterStep(a); render(); window.scrollTo(0, 0); },
  stimer: d => startTimer(+d.s, 'Alongamento · ' + d.n),
  pmenu: () => openSheet(`<h2>Treino em andamento</h2><p class="sm mut">Tudo o que você registrou já está salvo.</p><button class="btn big gap" data-act="sheet-close">Continuar</button><button class="btn ghost big gap" data-act="exitwork">Sair e continuar depois</button><button class="btn ghost big gap" style="color:var(--bad)" data-act="cancel">Descartar treino</button>`),
  exitwork: () => { closeSheet(); go('today'); },
  plist: () => {
    const a = DB.active, steps = buildSteps(a); let last = '';
    openSheet(`<h2>Etapas do treino</h2>${steps.map((s, i) => { const h = s.t !== last ? `<div class="eyebrow" style="margin-top:12px">${SEC[s.t]}</div>` : ''; last = s.t; const nm = s.t === 'ex' ? a.ex[s.i].id : s.t === 'end' ? null : s.id; return h + `<div class="li" data-act="pgo" data-s="${i}"><div class="box" style="${stepDone(a, s) ? 'background:var(--ok);border-color:var(--ok);color:#fff' : ''}">${CHECK}</div><div class="grow"><div style="font-weight:${i === a.step ? 800 : 600}">${nm ? esc(EX[nm].en) : 'Finalizar treino'}</div></div>${i === a.step ? '<span class="chip">aqui</span>' : ''}</div>`; }).join('')}`);
  },
  pgo: d => { const a = DB.active; closeSheet(); a.step = +d.s; enterStep(a); render(); window.scrollTo(0, 0); },
  addset: d => { const a = DB.active; DB.active.ex[d.i].sets.push({ v: '', r: '', d: false }); save(); render(); },
  delset: d => { const a = DB.active, e = a.ex[d.i]; if (e.sets.length > 1 && !e.sets[e.sets.length - 1].d) e.sets.pop(); save(); render(); },
  tech: d => { const e = DB.active.ex[d.i]; e.tech = e.tech === d.k ? '' : d.k; save(); render(); },
  swap: d => { const e = DB.active.ex[d.i]; e.id = e.alt; if (e.id === 'dip_hold') { e.reps = '10–15'; e.unit = 's'; e.rest = 90; } else { e.unit = EX[e.id].unit; } e.variant = ''; enterStep(DB.active); render(); },
  unswap: d => { const e = DB.active.ex[d.i], p = buildPlan(DB.active.type, DB.active.ab).ex.find(x => x.id === e.orig || x.alt === e.orig) || {}; e.id = e.orig; e.reps = p.reps || e.reps; e.unit = p.unit || EX[e.id].unit; e.rest = p.rest || e.rest; e.variant = ''; enterStep(DB.active); render(); },
  't-less': () => { if (TM) { TM.end -= 15000; tick(); } },
  effort: d => { DB.active.effort = +d.n; save(); render(); },
  pain: d => { const p = DB.active.pain, i = p.indexOf(d.k); i < 0 ? p.push(d.k) : p.splice(i, 1); save(); render(); },
  finish: () => {
    const a = DB.active; a.notes = ($('#notes') || {}).value || a.notes;
    const n = a.ex.reduce((s, e) => s + e.sets.filter(x => x.d).length, 0);
    if (!n) { ask('Nenhuma série concluída', 'Salvar mesmo assim?', 'Salvar', () => A.finish2()); return; }
    A.finish2();
  },
  finish2: () => {
    const a = DB.active, n = a.ex.reduce((s, e) => s + e.sets.filter(x => x.d).length, 0);
    const log = { id: a.id, date: a.date, type: a.type, ab: a.ab, phase: a.phase, ready: a.ready, effort: a.effort, notes: a.notes, pain: a.pain, dur: Math.round((Date.now() - a.start) / 60000), ex: a.ex.map(e => ({ id: e.id, variant: e.variant, unit: e.unit, tech: e.tech, obs: e.obs, sets: e.sets.map(s => ({ v: s.v, v2: s.v2, r: s.r, d: s.d })) })).filter(e => e.sets.some(s => s.d)) };
    if (!DB.set.test) { DB.logs.push(log); DB.logs.sort((x, y) => x.date.localeCompare(y.date) || x.id - y.id); } DB.active = null; save(); stopTimer(); UI.ab = null; go('today');
    if (DB.set.test) { openSheet(`<h2>Treino de teste concluído</h2><p>Nada foi salvo no histórico, porque o <b>modo teste</b> está ligado. Quando for treinar de verdade, desligue em Ajustes.</p><button class="btn big gap" data-act="sheet-close">Fechar</button>`); return; }
    openSheet(`<h2>Treino salvo 💪</h2><p>${n} séries registradas em ${log.dur} min.</p>${a.pain.length || a.ready === 'y' ? `<div class="hint down">Você marcou ${a.pain.length ? esc(a.pain.join(', ')).toLowerCase() : 'cansaço'}. Reduza uma série ou regrida na próxima sessão se persistir. Dor articular que não passa merece orientação profissional.</div>` : `<p class="mut">Descanse, coma bem e durma. A próxima sessão sugerida já está na tela inicial.</p>`}<button class="btn big gap" data-act="sheet-close">Fechar</button>`);
  },
  cancel: () => ask('Descartar este treino?', 'As séries registradas nesta sessão serão perdidas. Não dá para desfazer.', 'Descartar treino', () => { DB.active = null; save(); stopTimer(); UI.tab = 'today'; go('today'); toast('Treino descartado'); }),
  'ask-ok': () => { const f = ASKFN; ASKFN = null; closeSheet(); if (f) f(); },
  cat: d => { UI.libCat = d.k; render(); },
  pseg: d => { UI.progSeg = d.k; render(); },
  log: d => logSheet(d.id),
  dellog: d => ask('Apagar este treino?', 'Ele sai do histórico e da evolução. Não dá para desfazer.', 'Apagar', () => { DB.logs = DB.logs.filter(l => l.id != d.id); save(); render(); }),
  phase: d => { DB.set.phase = d.p; UI.ab = null; save(); render(); toast('Fase: ' + phase().n); },
  tog: d => { DB.set[d.k] = !DB.set[d.k]; save(); render(); },
  theme: d => { DB.set.theme = d.k; save(); render(); },
  'start-app': () => { DB.set.onboarded = true; save(); UI.tab = 'today'; render(false); },
  zero: () => ask('Zerar progresso?', 'Apaga treinos, corridas, caminhadas, diário e rotina matinal. Seus ajustes ficam. Não dá para desfazer.', 'Zerar progresso', () => { DB.logs = []; DB.morning = {}; DB.walks = {}; DB.acts = []; DB.notes = []; DB.active = null; save(); stopTimer(); if (window.Store) Store.clearAll(); if (window.CARDIO) { CARDIO.live = null; CARDIO.sum = null; } UI.tab = 'today'; render(false); toast('Progresso zerado'); }),
  welcome: () => { DB.set.onboarded = false; render(false); },
  img: d => { openSheet(`<img src="${d.el.src}" style="width:100%;border-radius:12px" alt=""><button class="btn big gap" data-act="sheet-close">Fechar</button>`); },
  vid: d => { const box = $('#vp'); if (!box) { window.open(`https://www.youtube.com/watch?v=${d.id}&t=${d.t}s`, '_blank'); return; } box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${d.id}?start=${d.t}&autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Demonstração"></iframe>`; },
  export: () => { const b = new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `calistenia-backup-${today()}.json`; a.click(); toast('Backup exportado'); },
  import: () => $('#imp').click(),
  reset: () => ask('Apagar todos os dados?', 'Treinos e ajustes deste aparelho serão apagados. Considere exportar um backup antes. Não dá para desfazer.', 'Apagar tudo', () => { DB = defaults(); save(); UI.tab = 'today'; if (window.Store) Store.clearAll(); if (window.CARDIO) { CARDIO.live = null; CARDIO.sum = null; } render(false); }),
  't-add': () => { if (TM) { TM.end += 15000; TM.fin = false; tick(); } },
  't-skip': stopTimer,
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (fn) { e.preventDefault(); fn(Object.assign({ el }, el.dataset)); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.in && DB.active) { const [i, j, f] = t.dataset.in.split(','); DB.active.ex[i].sets[j][f] = t.value; save(); }
  else if (t.dataset.obs !== undefined && DB.active) { DB.active.ex[t.dataset.obs].obs = t.value; save(); }
  else if (t.id === 'nm') { DB.set.name = t.value.trim(); save(); }
  else if (t.id === 'notes' && DB.active) { DB.active.notes = t.value; save(); }
  else if (t.id === 'q') { UI.libQ = t.value; $('#liblist').innerHTML = libItems(Object.values(EX).filter(x => (UI.libCat === 'all' || x.cat === UI.libCat) && (!t.value.trim() || (x.en + ' ' + x.pt + ' ' + x.mus.join(' ')).toLowerCase().includes(t.value.trim().toLowerCase())))); }
  else if (t.id === 'gq') { UI.gloss = t.value; $('#gl').innerHTML = glossHtml(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.var !== undefined && DB.active) { DB.active.ex[t.dataset.var].variant = t.value; save(); }
  else if (t.dataset.in && DB.active) { const [i, j, f] = t.dataset.in.split(','); DB.active.ex[i].sets[j][f] = t.value; save(); }
  else if (t.id === 'progex') { UI.progEx = t.value; render(); }
  else if (t.id === 'imp') { const f = t.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.v || !Array.isArray(d.logs)) throw 0; ask('Importar backup?', 'Substitui os dados atuais pelos do arquivo.', 'Importar', () => { DB = normDB(d); save(); render(); toast('Backup importado'); }); return; } catch (x) { toast('Arquivo inválido'); } }; r.readAsText(f); }
});
setInterval(() => { const el = $('#el'); if (el && DB.active) el.textContent = mmss((Date.now() - DB.active.start) / 1000); }, 1000);
setInterval(() => { if (UI.hold && UI.hold.run) { const h = $('#hv'); const sec = Math.floor((Date.now() - UI.hold.t0) / 1000); if (h) h.firstChild.textContent = sec; const a = DB.active, e = a && buildSteps(a)[a.step]; const hi = e && e.t === 'ex' ? parseInt(String(a.ex[e.i].reps).split(/[–-]/).pop()) : 0; if (hi && sec >= hi && !UI.hold.beeped) { UI.hold.beeped = true; beep(); } } }, 250);
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.d) UI.open[d.dataset.d] = d.open; }, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden && (UI.tab === 'work' || UI.tab === 'track')) wake(true); tick(); });

window.APP = { get DB() { return DB; }, set DB(v) { DB = v; }, UI, A, VIEWS, ext: X, after: AFTER, save, render, go, esc, $, pad, ymd, today, fmtDate, weekStart, mmss, toast, ask, openSheet, closeSheet, beep, wake, startTimer, CHECK, demo, thumb, tile, phase, isRead, ago, keepAwake: null };
(window.__ext || []).forEach(f => { try { f(window.APP); } catch (e) { console.error('extensão', e); } });
if (DB.active) UI.tab = 'work';
render(false);
if (UI.tab === 'work') wake(true);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
