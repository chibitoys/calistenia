/* Corrida e caminhada: sessão (cronômetro por horário), GPS com tela ligada, voz, resumo, registro manual, memo de áudio.
   Tudo local: nada de mapas/rede. Plugado no app por window.__ext (veja app.js). */
(window.__ext = window.__ext || []).push(APP => {
'use strict';
const { A, UI, esc, $, pad, ymd, today, toast, openSheet, closeSheet, save, render, go, fmtDate } = APP;
const DB = () => APP.DB, cfg = () => APP.DB.cardio;
const C = window.CARDIO = { live: null, sum: null, start: null, man: null, eco: false, rec: null, watch: null, lastPersist: 0 };
const TYPE = { run: { n: 'Corrida', ico: '🏃', c: '#ff7a45' }, walk: { n: 'Caminhada', ico: '🚶', c: '#4aa8ff' } };
C.TYPE = TYPE;

/* ───────── tempo (por horário: continua certo com a tela bloqueada) ───────── */
const elapsed = (l, now = Date.now()) => l.segs.reduce((s, g) => s + ((g.e == null ? now : g.e) - g.s), 0) / 1000;
const isPaused = l => l.segs.length > 0 && l.segs[l.segs.length - 1].e != null;
C.elapsed = elapsed;
const fmtT = s => Geo.durStr(s);
const clock = ms => new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const stageNow = () => RUN_STAGES.find(s => s.id === cfg().stage) || RUN_STAGES[0];
C.stageNow = stageNow;

/* ───────── persistência da sessão em andamento (sobrevive a reload/fechamento) ───────── */
function persist(force) {
  const l = C.live; if (!l) return; const now = Date.now();
  if (!force && now - C.lastPersist < 8000) return;
  C.lastPersist = now; l.hb = now; Store.put('live', 'cur', l);
}
window.addEventListener('pagehide', () => persist(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) persist(true); else if (C.live && !isPaused(C.live)) { APP.wake(true); updateDom(); } });

/* ───────── voz e avisos (local, sem nuvem) ───────── */
function speak(text) {
  if (!cfg().voice) return;
  try {
    if (!('speechSynthesis' in window)) { APP.beep(); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR'; u.rate = 1;
    const v = speechSynthesis.getVoices().find(x => /^pt/i.test(x.lang)); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { APP.beep(); }
}
C.speak = speak;
const spokenDur = s => { s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return (m ? m + (m === 1 ? ' minuto' : ' minutos') : '') + (m && r ? ' e ' : '') + (r || !m ? r + (r === 1 ? ' segundo' : ' segundos') : ''); };
const spokenPace = sec => { const m = Math.floor(sec / 60), r = Math.round(sec % 60); return m + ' e ' + r + ' por quilômetro'; };
function announceKm() {
  const l = C.live; if (!l || !l.track || cfg().voiceEvery === 'off') return; const S = l.track.splits;
  while (l.ann.km < S.length) { const sp = S[l.ann.km], tot = elapsed(l); l.ann.km++; if (cfg().voiceEvery === 'km') speak(`Quilômetro ${sp.km}. Tempo ${spokenDur(tot)}. Pace deste quilômetro: ${spokenPace(sp.sec)}.`); else APP.beep(); }
}
function announceTime() {
  const l = C.live; if (!l || isPaused(l)) return; const e = elapsed(l);
  const g = l.goal; if (g && !l.ann.goal && ((g.kind === 'time' && e >= g.val * 60) || (g.kind === 'dist' && l.track && l.track.dist >= g.val * 1000))) {
    l.ann.goal = true; APP.beep(); speak(g.kind === 'time' ? 'Meta de tempo atingida.' : 'Meta de distância atingida.'); toast('Meta atingida 🎉 — siga se quiser');
  }
  const useTime = (!l.track || cfg().voiceEvery === 'min5') && cfg().voiceEvery !== 'off';
  if (useTime && Math.floor(e / 300) > l.ann.min && e >= 300) { l.ann.min = Math.floor(e / 300); speak(spokenDur(l.ann.min * 300) + ' de atividade.'); }
}

/* ───────── GPS (só com o app aberto e a tela ligada — limite da web) ───────── */
function startGps() {
  const l = C.live; if (!l || !l.track) return;
  if (!navigator.geolocation) { l.gpsErr = 'este aparelho não oferece GPS ao navegador'; return; }
  stopGps();
  C.watch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
}
function stopGps() { if (C.watch != null) { try { navigator.geolocation.clearWatch(C.watch); } catch (e) {} C.watch = null; } }
function onPos(pos) {
  const l = C.live; if (!l || !l.track || isPaused(l)) return; const c = pos.coords;
  l.gpsErr = null; l.fix = { t: Date.now(), acc: Math.round(c.accuracy) };
  Geo.addPoint(l.track, { t: pos.timestamp || Date.now(), lat: c.latitude, lon: c.longitude, acc: c.accuracy, alt: c.altitude, altAcc: c.altitudeAccuracy });
  announceKm(); updateDom();
}
function onErr(e) { const l = C.live; if (!l) return; l.gpsErr = e.code === 1 ? 'permissão de localização negada' : e.code === 2 ? 'sem sinal de GPS' : 'o GPS demorou a responder'; if (e.code === 1) { stopGps(); toast('Sem permissão de localização: só o cronômetro será usado'); } updateDom(); }
const gpsChip = l => {
  if (!l.track) return { t: 'GPS desligado · só tempo', c: 'mut' };
  if (l.gpsErr) return { t: 'GPS: ' + l.gpsErr, c: 'bad' };
  if (!l.fix) return { t: 'Buscando sinal de GPS…', c: 'warn' };
  const age = (Date.now() - l.fix.t) / 1000;
  if (age > 20) return { t: `Sem sinal há ${Math.round(age)} s (tela ligada?)`, c: 'warn' };
  return l.fix.acc <= 15 ? { t: `GPS bom (±${l.fix.acc} m)`, c: 'ok' } : { t: `GPS fraco (±${l.fix.acc} m)`, c: 'warn' };
};

/* ───────── iniciar / pausar / retomar / finalizar ───────── */
A['cstart'] = d => {                                                      // abre a tela de preparo
  if (C.live) { go('track'); return; }
  C.start = { type: d.t, goal: { kind: 'free', val: 0 }, gps: d.t === 'run' ? cfg().runGps : cfg().walkGps, pre: {} };
  go('cstart');
};
A['cgoal'] = d => { const g = C.start.goal; if (d.k === 'free') C.start.goal = { kind: 'free', val: 0 }; else C.start.goal = { kind: d.k, val: +d.v }; render(); };
A['cgpsopt'] = () => { C.start.gps = !C.start.gps; render(); };
A['cbegin'] = () => {
  const s = C.start; if (!s) return; const now = Date.now();
  C.live = { id: now, type: s.type, start: now, segs: [{ s: now, e: null }], goal: s.goal, gps: !!s.gps, pre: s.pre, track: s.gps ? Geo.newTrack() : null, ann: { km: 0, min: 0, goal: false }, fix: null, hb: now };
  C.start = null; if (C.live.gps) startGps(); persist(true); go('track');
  if (C.live.gps && 'permissions' in navigator) navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state === 'denied') toast('Localização bloqueada para este site: só o cronômetro será usado'); }).catch(() => {});
};
A['cpause'] = () => { const l = C.live; if (!l || isPaused(l)) return; l.segs[l.segs.length - 1].e = Date.now(); persist(true); render(); };
A['cresume'] = () => { const l = C.live; if (!l || !isPaused(l)) return; l.segs.push({ s: Date.now(), e: null }); if (l.track) l.track.kf = null; /* não conta o deslocamento da pausa */ persist(true); APP.wake(true); render(); };
A['cfin'] = () => openSheet(`<h2>Finalizar ${TYPE[C.live.type].n.toLowerCase()}?</h2><p class="sm mut">Você revisa, anota e só depois salva.</p><button class="btn big gap" data-act="cfin-ok">Finalizar e revisar</button><button class="btn ghost big gap" data-act="sheet-close">Continuar</button>`);
A['cfin-ok'] = () => { closeSheet(); finish(); };
function finish() {
  const l = C.live; if (!l) return; const now = Date.now(); if (!isPaused(l)) l.segs[l.segs.length - 1].e = now; stopGps();
  const S = l.track ? Geo.summary(l.track) : null, dur = Math.round(elapsed(l, now));
  C.sum = { id: l.id, type: l.type, date: ymd(new Date(l.start)), start: l.start, end: l.segs[l.segs.length - 1].e, dur, moving: S ? S.moving : null, dist: S && S.dist >= 50 ? S.dist : null, source: l.track ? 'gps' : 'timer',
    splits: S ? S.splits : [], gain: S ? S.gain : 0, gaps: S ? S.gaps : [], rejected: S ? S.rejected : null, track: l.track ? l.track.pts : null, goal: l.goal, pre: l.pre || {}, post: {}, note: '', adj: null, audioBlob: null };
  C.live = null; C.eco = false; Store.del('live', 'cur'); Store.put('live', 'draft', C.sum); APP.wake(false); go('sum');
}
C.finish = finish;

/* ───────── atualização por segundo (sem re-render) ───────── */
const setT = (id, t) => { const e = document.getElementById(id); if (e && e.textContent !== t) e.textContent = t; };
function liveStats(l) {
  const S = l.track ? Geo.summary(l.track) : null, now = Date.now(), e = elapsed(l, now);
  const cur = l.track && !isPaused(l) ? Geo.currentPace(l.track, now) : null, kmIn = S ? S.dist % 1000 : 0;
  return { e, S, cur, kmIn, last: S && S.splits.length ? S.splits[S.splits.length - 1] : null };
}
function updateDom() {
  const l = C.live; if (!l) return; if (UI.tab !== 'track' && !C.eco) return;
  const x = liveStats(l), S = x.S, chip = gpsChip(l);
  setT('c-time', fmtT(x.e)); setT('eco-time', fmtT(x.e));
  if (S) {
    setT('c-moving', 'em movimento ' + fmtT(S.moving)); setT('c-dist', (S.dist / 1000).toFixed(2).replace('.', ',')); setT('eco-dist', Geo.distStr(S.dist));
    setT('c-pace', Geo.paceStr(x.cur)); setT('c-avg', Geo.paceStr(S.avgPace)); setT('c-speed', S.moving > 0 && S.dist > 50 ? (S.dist / S.moving * 3.6).toFixed(1).replace('.', ',') : '—');
    setT('c-km', `${Math.round(x.kmIn)} m do km ${S.splits.length + 1}` + (x.last ? ` · último: ${Geo.paceStr(x.last.sec)}` : '')); setT('c-elev', S.gain ? '+' + S.gain + ' m' : '—');
  }
  const g = document.getElementById('c-gps'); if (g) { g.textContent = chip.t; g.className = 'gpschip ' + chip.c; }
  const gb = document.getElementById('c-goalbar'), gt = document.getElementById('c-goaltxt');
  if (gb && l.goal && l.goal.kind !== 'free') { const f = l.goal.kind === 'time' ? x.e / (l.goal.val * 60) : (S ? S.dist / (l.goal.val * 1000) : 0); gb.style.width = Math.min(100, f * 100) + '%'; if (gt) gt.textContent = l.goal.kind === 'time' ? `meta ${l.goal.val} min` : `meta ${String(l.goal.val).replace('.', ',')} km`; }
}
C.updateDom = updateDom;
setInterval(() => { const l = C.live; if (!l) return; announceTime(); updateDom(); persist(false); }, 1000);

/* ───────── resumo, percepções, anotação e salvamento ───────── */
const tgt = w => w === 'sp' ? C.start.pre : w === 'sum' ? C.sum.post : w === 'man' ? C.man.post : w === 'manpre' ? C.man.pre : {};
A['cp'] = d => { const o = tgt(d.w); if (!o) return; const v = +d.v; o[d.k] = o[d.k] === v ? undefined : v; if (o[d.k] === undefined) delete o[d.k]; touch(d.w); render(); };
A['crpe'] = d => { const o = tgt(d.w), v = +d.v; o.rpe = o.rpe === v ? undefined : v; if (o.rpe === undefined) delete o.rpe; touch(d.w); render(); };
A['cdisc'] = d => { const o = tgt(d.w); o.disc = o.disc || []; const i = o.disc.indexOf(d.k); i < 0 ? o.disc.push(d.k) : o.disc.splice(i, 1); touch(d.w); render(); };
A['ctalk'] = d => { const o = tgt(d.w); o.talk = o.talk === d.v ? undefined : d.v; if (o.talk === undefined) delete o.talk; touch(d.w); render(); };
const touch = w => { if (w === 'sum') Store.put('live', 'draft', C.sum); };
A['cmore'] = () => { UI.open.cmore = !UI.open.cmore; render(); };

function buildAct(s) {
  const dist = s.adj != null ? s.adj : s.dist;
  return { id: s.id, type: s.type, date: s.date, start: s.start, end: s.end, dur: s.dur, moving: s.moving, dist: dist != null && dist > 0 ? Math.round(dist) : null, distAdj: s.adj != null, source: s.source,
    splits: s.splits && s.splits.length ? s.splits : undefined, gain: s.gain || undefined, gaps: s.gaps && s.gaps.length ? s.gaps.length : undefined, goal: s.goal && s.goal.kind !== 'free' ? s.goal : undefined,
    pre: Object.keys(s.pre || {}).length ? s.pre : undefined, post: Object.keys(s.post || {}).length ? s.post : undefined, note: s.note || undefined, audioId: s.audioBlob ? 'a' + s.id : undefined, trackId: s.track && s.track.length > 1 ? s.id : undefined };
}
A['csave'] = () => {
  const s = C.sum; if (!s) return;
  if (DB().set.test) { discardSum(); toast('Modo teste: nada foi salvo no histórico'); go('cardio'); return; }
  const act = buildAct(s); DB().acts.push(act); DB().acts.sort((a, b) => a.start - b.start); save();
  if (s.track && s.track.length > 1) Store.put('tracks', s.id, s.track);
  if (s.audioBlob) Store.put('audio', 'a' + s.id, s.audioBlob);
  discardSum(); go('cardio'); toast(TYPE[s.type].n + ' salva ✔');
};
function discardSum() { Store.del('live', 'draft'); C.sum = null; C.rec = null; }
A['cdiscard'] = () => ask2('Descartar esta atividade?', 'O que você acabou de fazer não será guardado.', 'Descartar', () => { discardSum(); go('cardio'); toast('Atividade descartada'); });
function ask2(t, x, ok, fn) { APP.ask(t, x, ok, fn); }

/* ───────── memo de áudio (gravado e guardado só neste aparelho) ───────── */
async function recStart(setter) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { toast('Este navegador não grava áudio'); return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true }), mr = new MediaRecorder(st), ch = [];
    mr.ondataavailable = e => { if (e.data.size) ch.push(e.data); };
    mr.onstop = () => { st.getTracks().forEach(t => t.stop()); const b = new Blob(ch, { type: mr.mimeType || 'audio/webm' }); C.rec = null; setter(b); render(); };
    mr.start(); C.rec = { mr, t0: Date.now() }; render();
  } catch (e) { toast('Sem permissão para o microfone'); }
}
C.recStart = recStart;
A['cmemo'] = () => recStart(b => { C.sum.audioBlob = b; touch('sum'); });
A['cmemostop'] = () => { if (C.rec) C.rec.mr.stop(); };
A['cmemodel'] = () => { if (C.sum) { C.sum.audioBlob = null; touch('sum'); render(); } };
C.audioUrl = b => { C._urls = C._urls || new WeakMap(); if (!C._urls.has(b)) C._urls.set(b, URL.createObjectURL(b)); return C._urls.get(b); };
const memoUi = (blob, delAct) => C.rec ? `<button class="btn big gap" style="background:var(--bad);color:#fff" data-act="${C.rec.stopAct || 'cmemostop'}">⏹ Parar gravação <span id="rec-t">0:00</span></button>` :
  (blob ? `<audio controls src="${C.audioUrl(blob)}" style="width:100%;margin-top:8px"></audio><button class="btn ghost sm gap" data-act="${delAct}">Apagar memo</button>` : `<button class="btn ghost big gap" data-act="${C.memoStart || 'cmemo'}">🎙 Gravar memo de voz</button>`);
C.memoUi = memoUi;
setInterval(() => { if (C.rec) setT('rec-t', fmtT((Date.now() - C.rec.t0) / 1000)); }, 500);

/* ───────── registro manual e edição ───────── */
const dtLocal = ms => { const d = new Date(ms); return ymd(d); };
A['cmanual'] = d => { C.man = { id: null, type: d.t || 'walk', date: today(), dur: '', dist: '', note: '', post: {}, pre: {} }; manualSheet(); };
A['cedit'] = d => { const a = DB().acts.find(x => x.id == d.id); if (!a) return; C.man = { id: a.id, type: a.type, date: a.date, dur: Math.round(a.dur / 60), dist: a.dist != null ? (a.dist / 1000).toFixed(2) : '', note: a.note || '', post: Object.assign({}, a.post || {}), pre: Object.assign({}, a.pre || {}) }; manualSheet(); };
function manualSheet() {
  const m = C.man, run = m.type === 'run';
  openSheet(`<h2>${m.id ? 'Editar' : 'Adicionar'} registro</h2><p class="xs mut">${m.id ? 'Ajuste o que estiver errado.' : 'Para uma atividade que você fez sem o app. Só o que souber: tudo é opcional, menos o tempo.'}</p>
   <div class="seg gap"><button class="${run ? '' : 'on'}" data-act="cmtype" data-t="walk">🚶 Caminhada</button><button class="${run ? 'on' : ''}" data-act="cmtype" data-t="run">🏃 Corrida</button></div>
   <div class="row gap"><div class="grow"><div class="eyebrow">Data</div><input class="field" type="date" id="cm-date" value="${m.date}" max="${today()}"></div><div class="grow"><div class="eyebrow">Duração (min)</div><input class="field" inputmode="numeric" id="cm-dur" value="${esc(m.dur)}" placeholder="30"></div></div>
   <div class="eyebrow gap">Distância (km) <span class="mut">opcional</span></div><input class="field" inputmode="decimal" id="cm-dist" value="${esc(m.dist)}" placeholder="ex.: 3,2">
   ${run ? `<div class="eyebrow gap">Esforço (RPE 0–10)</div><div class="rpes">${[...Array(11).keys()].map(n => `<button class="${m.post.rpe === n ? 'on' : ''}" data-act="crpe" data-w="man" data-v="${n}">${n}</button>`).join('')}</div>`
     : `<div class="eyebrow gap">Como se sentiu depois? <span class="mut">opcional</span></div>${scaleRows(PERC.walkPost.slice(0, 3), m.post, 'man')}`}
   <div class="eyebrow gap">Nota</div><textarea class="field" id="cm-note" placeholder="Algo que queira lembrar…">${esc(m.note)}</textarea>
   <button class="btn big gap" data-act="cm-save">Salvar</button>${m.id ? `<button class="btn ghost big gap" style="color:var(--bad)" data-act="cm-del" data-id="${m.id}">Apagar atividade</button>` : ''}<button class="btn ghost big gap" data-act="sheet-close">Cancelar</button>`);
}
A['cmtype'] = d => { C.man.type = d.t; C.man.post = {}; manualSheet(); };
const scaleRows = (list, obj, w) => list.map(([k, label, vals]) => `<div class="prow"><div class="sm">${label}</div><div class="p5">${vals.map((v, i) => `<button class="${obj[k] === i + 1 ? 'on' : ''}" data-act="cp" data-w="${w}" data-k="${k}" data-v="${i + 1}">${v}</button>`).join('')}</div></div>`).join('');
C.scaleRows = scaleRows;
const oldCp = A['cp']; A['cp'] = d => { if (d.w === 'man') { const o = C.man.post, v = +d.v; o[d.k] = o[d.k] === v ? undefined : v; if (o[d.k] === undefined) delete o[d.k]; syncMan(); manualSheet(); return; } oldCp(d); };
const oldRpe = A['crpe']; A['crpe'] = d => { if (d.w === 'man') { const o = C.man.post, v = +d.v; o.rpe = o.rpe === v ? undefined : v; if (o.rpe === undefined) delete o.rpe; syncMan(); manualSheet(); return; } oldRpe(d); };
function syncMan() { const g = id => (document.getElementById(id) || {}).value; if (!C.man) return; const d = g('cm-date'), u = g('cm-dur'), k = g('cm-dist'), n = g('cm-note'); if (d !== undefined) { C.man.date = d; C.man.dur = u; C.man.dist = k; C.man.note = n; } }
A['cm-save'] = () => {
  syncMan(); const m = C.man, dur = Math.round(parseFloat(String(m.dur).replace(',', '.')) * 60), km = m.dist === '' ? null : parseFloat(String(m.dist).replace(',', '.'));
  if (!dur || dur < 60) { toast('Informe a duração em minutos'); return; } if (km != null && (isNaN(km) || km < 0 || km > 100)) { toast('Distância inválida'); return; }
  const base = { type: m.type, date: m.date, dur, dist: km != null && km > 0 ? Math.round(km * 1000) : null, note: m.note || undefined, post: Object.keys(m.post).length ? m.post : undefined };
  if (DB().set.test) { closeSheet(); toast('Modo teste: nada foi salvo no histórico'); return; }
  if (m.id) { const a = DB().acts.find(x => x.id == m.id); Object.assign(a, base, { edited: true, distAdj: a.source === 'gps' ? true : a.distAdj }); }
  else { const st = new Date(m.date + 'T08:00:00').getTime(); DB().acts.push(Object.assign({ id: Date.now(), start: st, end: st + dur * 1000, source: 'manual', moving: null }, base)); }
  DB().acts.sort((a, b) => a.start - b.start); save(); closeSheet(); C.man = null; render(); toast('Registro salvo ✔');
};
A['cm-del'] = d => APP.ask('Apagar esta atividade?', 'Ela sai do histórico e da evolução. Não dá para desfazer.', 'Apagar', () => { removeAct(d.id); render(); });
function removeAct(id) { const D = DB(); const a = D.acts.find(x => x.id == id); if (!a) return; D.acts = D.acts.filter(x => x.id != id); save(); Store.del('tracks', a.id); if (a.audioId) Store.del('audio', a.audioId); }
C.removeAct = removeAct;

/* ───────── recuperação de sessão interrompida ───────── */
async function recover() {
  const draft = await Store.get('live', 'draft'); if (draft && !C.sum && !C.live) { C.sum = draft; }
  const cur = await Store.get('live', 'cur'); if (!cur || C.live) { render(); return; }
  C.live = cur; const gap = (Date.now() - (cur.hb || cur.start)) / 1000;
  if (!isPaused(cur) && gap > 30) { C.recover = true; } else if (!isPaused(cur) && cur.track) startGps();
  if (C.live && !C.recover) { UI.tab = 'track'; APP.wake(true); }
  render(); if (C.recover) recoverSheet();
}
function recoverSheet() {
  const l = C.live; if (!l) return;
  openSheet(`<h2>${TYPE[l.type].ico} Sessão interrompida</h2><p class="sm">Você iniciou ${TYPE[l.type].n.toLowerCase()} às ${clock(l.start)}. O último sinal do app foi às ${clock(l.hb)}.</p>
   <button class="btn big gap" data-act="crec-cont">Continuar (contar o tempo até agora)</button><button class="btn ghost big gap" data-act="crec-end">Encerrar no último sinal</button><button class="btn ghost big gap" style="color:var(--bad)" data-act="crec-drop">Descartar</button>
   ${l.track ? `<p class="xs mut">Trechos sem GPS aparecem como lacuna: a distância deles não é inventada, e você pode ajustá-la no resumo.</p>` : ''}`);
}
A['crec-cont'] = () => { closeSheet(); C.recover = false; UI.tab = 'track'; if (C.live.track) { C.live.track.kf = null; startGps(); } APP.wake(true); persist(true); render(); };
A['crec-end'] = () => { closeSheet(); C.recover = false; const l = C.live; if (!isPaused(l)) l.segs[l.segs.length - 1].e = l.hb; finish(); };
A['crec-drop'] = () => { closeSheet(); C.recover = false; C.live = null; Store.del('live', 'cur'); render(); };
C.keepAwake = () => !!C.live;
recover();
});
