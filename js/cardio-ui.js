/* Telas de cardio: aba Cardio, preparo, rastreador, resumo, rotina de preparação, diário, evolução de cardio, ajustes. */
(window.__ext = window.__ext || []).push(APP => {
'use strict';
const { A, UI, esc, $, pad, ymd, today, toast, openSheet, closeSheet, save, render, go, fmtDate, weekStart, CHECK } = APP;
const DB = () => APP.DB, cfg = () => APP.DB.cardio, C = window.CARDIO, TYPE = C.TYPE, X = APP.ext;
const fmtT = Geo.durStr, mmin = s => Math.round(s / 60);
const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const acts = () => DB().acts;
const inRange = (a, d0, d1) => a.start >= d0.getTime() && a.start < d1.getTime();
const weekRange = (off = 0) => { const s = weekStart(); s.setDate(s.getDate() + off * 7); const e = new Date(s); e.setDate(e.getDate() + 7); return [s, e]; };
const actsWeek = off => { const [s, e] = weekRange(off); return acts().filter(a => inRange(a, s, e)); };
const sum = (l, f) => l.reduce((s, a) => s + (f(a) || 0), 0);
const paceOf = a => a.dist && a.dist >= 500 && (a.moving || a.dur) ? (a.moving || a.dur) / (a.dist / 1000) : null;
const actTitle = a => `${TYPE[a.type].ico} ${TYPE[a.type].n}`;
const actLine = a => `${fmtDate(new Date(a.start).toISOString().slice(0, 10), { day: '2-digit', month: 'short' })} · ${mmin(a.dur)} min${a.dist ? ' · ' + Geo.distStr(a.dist) : ''}${a.post && a.post.rpe != null ? ' · esforço ' + a.post.rpe : ''}`;
const testBanner = () => DB().set.test ? `<div class="hint down" style="margin:0 0 8px"><b>Modo teste:</b> atividades concluídas não são salvas no histórico. <button class="link" data-act="tog" data-k="test">Desligar</button></div>` : '';
const scaleRows = C.scaleRows;

/* ───────── aba Cardio ───────── */
function vCardio() {
  const st = C.stageNow(), live = C.live, wk = actsWeek(0), runs = wk.filter(a => a.type === 'run'), walks = wk.filter(a => a.type === 'walk'), rd = cfg().runDays.length;
  const recent = [...acts()].reverse().slice(0, 5);
  return `<div class="top"><div><h1>Cardio</h1><div class="sub">Corrida e caminhada · sem cobranças</div></div></div>${testBanner()}
  ${live ? `<div class="hero" style="--c1:#1c1b19;--c2:#3a3833"><div class="eyebrow" style="color:#ffffffaa">Em andamento</div><h2>${TYPE[live.type].ico} ${TYPE[live.type].n}</h2><p class="sm">Iniciada às ${new Date(live.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Tudo foi salvo.</p><button class="btn gap" data-act="cstart" data-t="${live.type}">Voltar para a atividade</button></div>` : ''}
  ${C.sum ? `<div class="hint down">Você tem um resumo pendente de ${TYPE[C.sum.type].n.toLowerCase()}. <button class="link" data-act="tab" data-k="sum">Revisar e salvar</button></div>` : ''}
  <div class="hero" style="--c1:#e8562a;--c2:#ff9a5a"><div class="eyebrow" style="color:#ffffffcc">Corrida · estágio ${st.n}</div><h2>${st.min[0]}–${st.min[1]} min · ${st.freq}</h2>
    <p class="sm" style="margin:2px 0 10px">Trote leve (~3–4 de 10): dá para conversar. Sugestão, não meta.${APP.isRead() ? ' Na readaptação da calistenia, comece pelo mínimo da faixa.' : ''}</p>
    <button class="btn" data-act="cstart" data-t="run" ${live ? 'disabled' : ''}>🏃 Começar corrida</button></div>
  <div class="hero" style="--c1:#2f6fe0;--c2:#5ab0ff"><div class="eyebrow" style="color:#ffffffcc">Caminhada · livre</div><h2>Sem meta, no seu ritmo</h2>
    <p class="sm" style="margin:2px 0 10px">Para clarear a cabeça. De 10 a 40 min, esforço bem leve (1–3 de 10). Pode bloquear a tela.</p>
    <button class="btn" data-act="cstart" data-t="walk" ${live ? 'disabled' : ''}>🚶 Começar caminhada</button></div>
  <div class="card"><h3>Esta semana</h3><div class="row gap"><div class="stat"><b>${runs.length}<span class="mut" style="font-size:14px">/${rd}</span></b><span class="xs mut">corridas sugeridas</span></div><div class="stat"><b>${mmin(sum(runs, a => a.dur))}</b><span class="xs mut">min correndo</span></div><div class="stat"><b>${mmin(sum(walks, a => a.dur))}</b><span class="xs mut">min andando</span></div></div>
   <p class="xs mut gap">As corridas por semana são só uma referência. Caminhar quando der vontade já conta como recuperação ativa.</p></div>
  <div class="card"><h3>Antes e depois da corrida</h3><div class="row gap wrap"><button class="btn ghost" data-act="rtstart" data-k="prep">🔥 Preparação (5–8 min)</button><button class="btn ghost" data-act="rtstart" data-k="cool">🧊 Desaquecimento</button></div></div>
  <div class="card"><div class="row between"><h3>Últimas atividades</h3><button class="link" data-act="tab" data-k="prog" data-seg="cardio">ver evolução</button></div>
   ${recent.length ? recent.map(a => `<div class="li" data-act="cdetail" data-id="${a.id}"><div class="tile" style="background:${TYPE[a.type].c}">${TYPE[a.type].ico}</div><div class="grow"><div style="font-weight:650">${TYPE[a.type].n}</div><div class="xs mut">${actLine(a)}</div></div></div>`).join('') : '<p class="sm mut">Nenhuma atividade ainda. Quando fizer a primeira, ela aparece aqui.</p>'}
   <button class="btn ghost sm gap" data-act="cmanual" data-t="walk">+ Adicionar registro manual</button></div>
  <p class="xs mut">Dor aguda ou articular, tontura ou mal-estar: pare. Se persistir, procure orientação profissional.</p>`;
}

/* ───────── preparo da atividade ───────── */
function vCstart() {
  const s = C.start; if (!s) { UI.tab = 'cardio'; return vCardio(); } const run = s.type === 'run', st = C.stageNow();
  const chip = (on, act, t, extra = '') => `<button class="chip ${on ? 'sel' : ''}" data-act="${act}" ${extra}>${t}</button>`;
  const g = s.goal;
  return `<div class="top"><button class="icon-btn" data-act="tab" data-k="cardio">←</button><div class="grow" style="padding:0 12px"><h1>${TYPE[s.type].ico} ${TYPE[s.type].n}</h1><div class="sub">${run ? `Estágio ${st.n}: ${st.min[0]}–${st.min[1]} min sugeridos` : 'Sem meta. Do jeito que estiver bom hoje.'}</div></div></div>
  ${run ? `<div class="card"><div class="eyebrow">Meta (opcional)</div><div class="chips gap">${chip(g.kind === 'free', 'cgoal', 'Livre', 'data-k="free"')}${[20, 30, 40].map(m => chip(g.kind === 'time' && g.val === m, 'cgoal', m + ' min', `data-k="time" data-v="${m}"`)).join('')}${[3, 5, 8].map(k => chip(g.kind === 'dist' && g.val === k, 'cgoal', k + ' km', `data-k="dist" data-v="${k}"`)).join('')}</div>
    <p class="xs mut">Ao atingir a meta o app avisa, mas não para: você decide.</p></div>
   <div class="hint">🗣 <b>Teste da fala:</b> se você consegue conversar em frases completas, o ritmo está bom. Se não, diminua ou alterne com caminhada.</div>` : ''}
  <div class="card"><div class="check ${s.gps ? 'on' : ''}" data-act="cgpsopt"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">Registrar percurso e distância (GPS)</div><div class="xs mut">${s.gps ? 'Deixe o app aberto com a tela ligada (baixe o brilho): na web, o GPS para quando a tela bloqueia. O percurso fica só neste aparelho.' : 'Só o tempo, por horário: você pode bloquear a tela e o cronômetro continua certo.'}</div></div></div></div>
  <button class="btn xl" data-act="cbegin">Começar ${run ? 'corrida' : 'caminhada'}</button>
  <details class="card" style="margin-top:12px"><summary>Antes de sair <span class="xs mut">(opcional, 10 segundos)</span></summary>${scaleRows(run ? PERC.runPre : PERC.walkPre, s.pre, 'sp')}<p class="xs mut">Serve só para você comparar depois. Pode pular.</p></details>
  ${run ? `<button class="btn ghost big gap" data-act="rtstart" data-k="prep">🔥 Fazer a preparação antes</button>` : ''}`;
}

/* ───────── rastreador ───────── */
function vTrack() {
  const l = C.live; if (!l) { UI.tab = 'cardio'; return vCardio(); }
  const run = l.type === 'run', paused = C.elapsed && l.segs[l.segs.length - 1].e != null, gps = !!l.track, chip = { t: gps ? 'Buscando sinal de GPS…' : 'GPS desligado · só tempo', c: gps ? 'warn' : 'mut' };
  const eco = C.eco ? `<div class="eco" data-act="ceco"><div class="eco-in"><div id="eco-time" class="eco-t">0:00</div>${gps ? '<div id="eco-dist" class="eco-d">0 m</div>' : ''}<div class="eco-h">toque para acordar</div></div></div>` : '';
  return `${eco}<div class="top"><button class="icon-btn" data-act="tab" data-k="today" aria-label="Minimizar">⌄</button><div class="grow" style="padding:0 12px"><div class="eyebrow">${TYPE[l.type].ico} ${TYPE[l.type].n}${paused ? ' · em pausa' : ''}</div><div id="c-gps" class="gpschip ${chip.c}">${chip.t}</div></div><button class="icon-btn" data-act="cvoice" aria-label="Voz">${cfg().voice ? '🔊' : '🔈'}</button></div>
  <div class="bigtime" id="c-time">0:00</div><div class="center mut sm" id="c-moving">${gps ? 'em movimento 0:00' : paused ? 'em pausa' : 'a contar por horário'}</div>
  ${l.goal && l.goal.kind !== 'free' ? `<div class="gap"><div class="bar"><i id="c-goalbar" style="width:0%"></i></div><div class="xs mut center" id="c-goaltxt"></div></div>` : ''}
  ${gps ? `<div class="statgrid"><div><b id="c-dist">0,00</b><span>km</span></div><div><b id="c-pace">—</b><span>pace atual /km</span></div><div><b id="c-avg">—</b><span>pace médio /km</span></div><div><b id="c-speed">—</b><span>km/h</span></div></div>
   <div class="center sm mut" id="c-km">—</div><div class="center xs mut" style="margin-top:2px">elevação (aprox.): <span id="c-elev">—</span></div>` : `<div class="hint gap">${run ? 'Sem GPS: só o tempo. ' : ''}Você pode <b>bloquear a tela</b>: o tempo continua contando certo.</div>`}
  <div class="row gap" style="margin-top:18px">${paused ? `<button class="btn xl grow" data-act="cresume">▶ Retomar</button>` : `<button class="btn ghost xl grow" data-act="cpause">⏸ Pausar</button>`}<button class="btn xl grow" style="background:var(--ink);color:var(--bg)" data-act="cfin">⏹ Finalizar</button></div>
  ${gps ? `<button class="btn ghost big gap" data-act="ceco">🌙 Modo economia (tela escura)</button><p class="xs mut center">Baixe o brilho do celular. O app mantém a tela ligada para o GPS funcionar.</p>` : ''}`;
}
A['ceco'] = () => { C.eco = !C.eco; render(); };
A['cvoice'] = () => { cfg().voice = !cfg().voice; save(); render(); if (cfg().voice) C.speak('Voz ligada.'); };

/* ───────── resumo da atividade ───────── */
function routeSvg(pts, h) { if (!pts || pts.length < 2) return ''; const sp = Geo.simplify(pts.map(p => ({ lat: p.lat, lon: p.lon, g: p.g })), 4); const d = Geo.routePath(sp, 320, h || 150, 12); return d ? `<svg viewBox="0 0 320 ${h || 150}" class="route"><path d="${d}" fill="none" stroke="var(--acc)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''; }
function splitsTable(sp) { return sp && sp.length ? `<div class="eyebrow gap">Parciais por km</div>${sp.map(s => `<div class="row between sm" style="padding:3px 0"><span>km ${s.km}</span><b>${Geo.paceStr(s.sec)}</b></div>`).join('')}` : ''; }
function vSum() {
  const s = C.sum; if (!s) { UI.tab = 'cardio'; return vCardio(); } const run = s.type === 'run', dist = s.adj != null ? s.adj : s.dist, kcal = cfg().weightKg && dist ? Geo.kcal(cfg().weightKg, s.moving || s.dur, dist / (s.moving || s.dur) * 3.6) : null;
  const pace = dist && dist >= 500 ? (s.moving || s.dur) / (dist / 1000) : null;
  return `<div class="top"><div><div class="eyebrow">${TYPE[s.type].ico} Concluída</div><h1>${TYPE[s.type].n} · ${mmin(s.dur)} min</h1></div></div>${testBanner()}
  <div class="card"><div class="statgrid flat"><div><b>${fmtT(s.dur)}</b><span>tempo total</span></div>${s.moving != null ? `<div><b>${fmtT(s.moving)}</b><span>em movimento</span></div>` : ''}${dist ? `<div><b>${(dist / 1000).toFixed(2).replace('.', ',')}</b><span>km${s.adj != null ? ' (ajustado)' : ''}</span></div>` : ''}${pace ? `<div><b>${Geo.paceStr(pace)}</b><span>pace médio /km</span></div>` : ''}${s.gain ? `<div><b>+${s.gain} m</b><span>elevação aprox.</span></div>` : ''}${kcal ? `<div><b>~${kcal}</b><span>kcal (estimativa)</span></div>` : ''}</div>
   ${routeSvg(s.track)}${splitsTable(s.splits)}
   ${s.gaps && s.gaps.length ? `<div class="hint down gap">Houve ${s.gaps.length} trecho(s) sem sinal de GPS (${s.gaps.map(g => mmin(g.sec) || '<1').join(', ')} min) — provavelmente a tela bloqueou. A distância desses trechos <b>não foi contada</b>. Se souber, ajuste abaixo.</div>` : ''}
   ${s.source === 'timer' ? '<p class="xs mut gap">Atividade só com tempo (sem GPS), então não há distância medida.</p>' : ''}
   <div class="eyebrow gap">${s.source === 'gps' ? 'Ajustar distância (km)' : 'Distância (km), se souber'} <span class="mut">opcional</span></div><input class="field" inputmode="decimal" id="cs-adj" placeholder="${dist ? (dist / 1000).toFixed(2).replace('.', ',') : 'ex.: 3,2'}" value="${s.adj != null ? (s.adj / 1000).toFixed(2).replace('.', ',') : ''}"></div>
  <div class="card"><h3>Como foi?</h3><p class="xs mut">Tudo opcional. Pule o que não quiser.</p>
   ${run ? `<div class="eyebrow gap">Esforço (RPE 0–10)${s.post.rpe != null ? ' · ' + RPE_TXT[s.post.rpe] : ''}</div><div class="rpes">${[...Array(11).keys()].map(n => `<button class="${s.post.rpe === n ? 'on' : ''}" data-act="crpe" data-w="sum" data-v="${n}">${n}</button>`).join('')}</div>
     <div class="eyebrow gap">Consegui conversar (teste da fala)?</div><div class="row" style="gap:6px;margin-top:6px">${[['sim', '✔ Sim'], ['quase', '〰 Quase'], ['nao', '✘ Não']].map(([v, t]) => `<button class="chip ${s.post.talk === v ? 'sel' : ''}" data-act="ctalk" data-w="sum" data-v="${v}">${t}</button>`).join('')}</div>
     ${scaleRows(PERC.runPost, s.post, 'sum')}<div class="eyebrow gap">Algum desconforto?</div><div class="row wrap" style="gap:6px;margin-top:6px">${DISCOMFORT.map(k => `<button class="chip ${(s.post.disc || []).includes(k) ? 'sel' : ''}" data-act="cdisc" data-w="sum" data-k="${k}">${k}</button>`).join('')}</div>`
     : `${scaleRows(PERC.walkPost.slice(0, 3), s.post, 'sum')}<button class="link" data-act="cmore">${UI.open.cmore ? '− menos' : '+ clareza, concentração, motivação…'}</button>${UI.open.cmore ? scaleRows(PERC.walkPost.slice(3), s.post, 'sum') : ''}
     ${Object.keys(s.pre).length ? `<p class="xs mut">Antes: ${Object.entries(s.pre).map(([k, v]) => `${WALK_FIELDS[k] || k} ${v}`).join(' · ')}</p>` : ''}`}</div>
  <div class="card"><h3>Pensamentos e ideias</h3><textarea class="field" id="cs-note" placeholder="O que passou pela cabeça? Ideias, aprendizados, observações… (dica: use o 🎤 do teclado do celular para ditar)">${esc(s.note)}</textarea>${C.memoUi(s.audioBlob, 'cmemodel')}<p class="xs mut">O memo de voz fica só neste aparelho.</p></div>
  <button class="btn xl" data-act="csave">${DB().set.test ? 'Concluir (modo teste: não salva)' : 'Salvar atividade'}</button><button class="btn ghost big gap" style="color:var(--bad)" data-act="cdiscard">Descartar</button>`;
}

/* ───────── rotina guiada (preparação / desaquecimento) ───────── */
const RT = { prep: { n: 'Preparação para correr', list: RUN_PREP, note: RUN_PREP_NOTE, ico: '🔥' }, cool: { n: 'Desaquecimento', list: RUN_COOL, note: RUN_COOL_NOTE, ico: '🧊' } };
A['rtstart'] = d => { UI.rt = { kind: d.k, i: 0 }; go('routine'); };
A['rtnext'] = () => { UI.rt.i++; render(); window.scrollTo(0, 0); };
A['rtprev'] = () => { UI.rt.i = Math.max(0, UI.rt.i - 1); render(); window.scrollTo(0, 0); };
A['rttimer'] = d => APP.startTimer(+d.s, d.n);
function vRoutine() {
  const r = UI.rt; if (!r) { UI.tab = 'cardio'; return vCardio(); } const R = RT[r.kind], list = R.list;
  if (r.i >= list.length) return `<div class="top"><div><h1>${R.ico} ${R.n}</h1></div></div><div class="card center"><h2>Pronto ✔</h2><p class="mut">${r.kind === 'prep' ? 'Agora comece o trote bem leve.' : 'Bom trabalho. Hidrate-se e descanse.'}</p></div><p class="xs mut">${R.note}</p><button class="btn xl" data-act="${r.kind === 'prep' ? 'cstart' : 'tab'}" ${r.kind === 'prep' ? 'data-t="run"' : 'data-k="cardio"'}>${r.kind === 'prep' ? '🏃 Começar corrida' : 'Voltar ao Cardio'}</button><button class="btn ghost big gap" data-act="tab" data-k="cardio">Voltar</button>`;
  const [id, dose] = list[r.i], e = EX[id], secs = (String(dose).match(/(\d+)(?:[–-](\d+))?\s*s\b/) || [])[0] ? +(String(dose).match(/(\d+)(?:[–-](\d+))?\s*s\b/)[2] || String(dose).match(/(\d+)(?:[–-](\d+))?\s*s\b/)[1]) : 0;
  const mins = (String(dose).match(/(\d+)(?:[–-](\d+))?\s*min/) || null);
  return `<div class="top"><button class="icon-btn" data-act="tab" data-k="cardio">✕</button><div class="grow" style="padding:0 12px"><div class="eyebrow">${R.n} · ${r.i + 1}/${list.length}</div></div></div>
  <div class="segs">${list.map((x, i) => `<i class="${i < r.i ? 'd' : i === r.i ? 'n' : ''}"></i>`).join('')}</div>
  ${APP.demo(id)}<div class="pl-name"><h1>${esc(e.en)}</h1><div class="mut">${esc(e.pt)}</div></div><div class="dose" style="font-size:${dose.length > 16 ? 24 : 34}px">${esc(dose)}</div>
  <details class="card flat"><summary>Como fazer</summary>${e.what ? `<p class="sm">${esc(e.what)}</p>` : ''}<ol class="steps sm">${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>
  ${secs ? `<button class="btn ghost big gap" data-act="rttimer" data-s="${secs}" data-n="${esc(e.en)}">⏱ Cronômetro de ${secs} s</button>` : ''}${mins && !secs ? `<button class="btn ghost big gap" data-act="rttimer" data-s="${(+mins[2] || +mins[1]) * 60}" data-n="${esc(e.en)}">⏱ Cronômetro de ${(+mins[2] || +mins[1])} min</button>` : ''}
  <div class="row gap"><button class="btn ghost" data-act="rtprev" ${r.i ? '' : 'disabled'}>←</button><button class="btn big grow" data-act="rtnext">Feito ✓</button><button class="btn ghost" data-act="rtnext">Pular</button></div>
  ${r.i === 0 ? `<p class="xs mut gap">${R.note}</p>` : ''}`;
}

/* ───────── detalhe de uma atividade salva ───────── */
function fillAudio(root) {
  (root || document).querySelectorAll('[data-aid]:not([data-ok])').forEach(el => { el.dataset.ok = 1; Store.get('audio', el.dataset.aid).then(b => { if (b) el.innerHTML = `<audio controls src="${C.audioUrl(b)}" style="width:100%"></audio>`; else el.innerHTML = '<span class="xs mut">(áudio não encontrado neste aparelho)</span>'; }); });
}
A['cdetail'] = d => {
  const a = acts().find(x => x.id == d.id); if (!a) return; const pace = paceOf(a), kcal = cfg().weightKg && a.dist ? Geo.kcal(cfg().weightKg, a.moving || a.dur, a.dist / (a.moving || a.dur) * 3.6) : null;
  const perc = (o, F) => o ? Object.entries(o).filter(([k]) => k !== 'rpe' && k !== 'disc' && k !== 'talk').map(([k, v]) => `${F[k] || k}: <b>${v}</b>`).join(' · ') : '';
  const F = Object.assign({}, WALK_FIELDS, { legs: 'Pernas', energy: 'Energia', breath: 'Respiração', fatigue: 'Fadiga', easy: 'Facilidade', recov: 'Recuperação' });
  openSheet(`<h2>${actTitle(a)}</h2><p class="sm mut">${new Date(a.start).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${a.source === 'manual' ? ' · registro manual' : a.source === 'gps' ? ' · com GPS' : ' · só tempo'}${a.edited ? ' · editado' : ''}</p>
   <div class="statgrid flat"><div><b>${fmtT(a.dur)}</b><span>tempo total</span></div>${a.moving ? `<div><b>${fmtT(a.moving)}</b><span>em movimento</span></div>` : ''}${a.dist ? `<div><b>${(a.dist / 1000).toFixed(2).replace('.', ',')}</b><span>km${a.distAdj ? ' (ajustado)' : ''}</span></div>` : ''}${pace ? `<div><b>${Geo.paceStr(pace)}</b><span>pace médio /km</span></div>` : ''}${a.gain ? `<div><b>+${a.gain} m</b><span>elevação aprox.</span></div>` : ''}${kcal ? `<div><b>~${kcal}</b><span>kcal (estimativa)</span></div>` : ''}</div>
   <div id="det-route"></div>${splitsTable(a.splits)}${a.gaps ? `<p class="xs mut">${a.gaps} trecho(s) sem sinal de GPS (distância deles não contada).</p>` : ''}
   ${a.pre ? `<p class="sm"><span class="mut">Antes:</span> ${perc(a.pre, F)}</p>` : ''}${a.post ? `<p class="sm"><span class="mut">Depois:</span> ${a.post.rpe != null ? `esforço <b>${a.post.rpe}</b> (${RPE_TXT[a.post.rpe]}) · ` : ''}${a.post.talk ? `fala: <b>${{ sim: 'consegui', quase: 'quase', nao: 'não consegui' }[a.post.talk]}</b> · ` : ''}${perc(a.post, F)}${a.post.disc && a.post.disc.length ? ` · desconforto: ${a.post.disc.join(', ')}` : ''}</p>` : ''}
   ${a.note ? `<div class="card flat"><p class="sm" style="margin:0;white-space:pre-wrap">${esc(a.note)}</p></div>` : ''}${a.audioId ? `<div data-aid="${a.audioId}"></div>` : ''}
   <button class="btn ghost big gap" data-act="cedit" data-id="${a.id}">Editar</button><button class="btn big gap" data-act="sheet-close">Fechar</button>`);
  fillAudio($('#sheet-in')); if (a.trackId) Store.get('tracks', a.trackId).then(p => { const el = document.getElementById('det-route'); if (el && p) el.innerHTML = routeSvg(p); });
};

/* ───────── diário ───────── */
const TAGS = ['Ideia', 'Reflexão', 'Aprendizado', 'Observação'];
function diaryItems() {
  const items = [];
  acts().forEach(a => { if (a.note || a.audioId) items.push({ kind: 'act', id: a.id, ts: a.start, text: a.note || '', audioId: a.audioId, tag: TYPE[a.type].ico + ' ' + TYPE[a.type].n }); });
  DB().notes.forEach(n => items.push({ kind: 'note', id: n.id, ts: n.ts, text: n.text, audioId: n.audioId, tags: n.tags || [] }));
  return items.sort((a, b) => b.ts - a.ts);
}
function vDiary() {
  const q = (UI.diaryQ || '').toLowerCase(), tag = UI.diaryTag, items = diaryItems().filter(i => (!q || i.text.toLowerCase().includes(q)) && (!tag || (i.tags || []).includes(tag)));
  return `<div class="top"><button class="icon-btn" data-act="tab" data-k="more">←</button><div class="grow" style="padding:0 12px"><h1>Diário</h1><div class="sub">Pensamentos, ideias e aprendizados</div></div></div>
  <button class="btn big" data-act="dnew">+ Nova anotação</button>
  <input class="search gap" id="dq" type="search" placeholder="Buscar nas anotações…" value="${esc(UI.diaryQ || '')}">
  <div class="chips gap"><button class="chip ${!tag ? 'sel' : ''}" data-act="dtag" data-k="">Todas</button>${TAGS.map(t => `<button class="chip ${tag === t ? 'sel' : ''}" data-act="dtag" data-k="${t}">${t}</button>`).join('')}</div>
  ${items.length ? items.map(i => `<div class="card" ${i.kind === 'note' ? `data-act="dedit" data-id="${i.id}"` : `data-act="cdetail" data-id="${i.id}"`}><div class="row between"><span class="xs mut">${new Date(i.ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span class="xs">${i.kind === 'act' ? esc(i.tag) : (i.tags || []).map(t => `<span class="chip">${t}</span>`).join(' ')}</span></div>${i.text ? `<p class="sm" style="white-space:pre-wrap;margin:6px 0 0">${esc(i.text.length > 280 ? i.text.slice(0, 280) + '…' : i.text)}</p>` : ''}${i.audioId ? `<div data-aid="${i.audioId}" onclick="event.stopPropagation()" style="margin-top:6px"></div>` : ''}</div>`).join('') : '<div class="card flat"><p class="sm mut" style="margin:0">Ainda não há anotações. Elas aparecem aqui quando você escreve numa caminhada/corrida ou cria uma nova.</p></div>'}
  <p class="xs mut">Seu diário fica só neste aparelho (e no backup que você exportar). Nada é enviado para fora.</p>`;
}
A['dtag'] = d => { UI.diaryTag = d.k || ''; render(); };
A['dnew'] = () => { C.dn = { id: null, text: '', tags: [], blob: null, audioId: null }; noteSheet(); };
A['dedit'] = d => { const n = DB().notes.find(x => x.id == d.id); if (!n) return; C.dn = { id: n.id, text: n.text, tags: [...(n.tags || [])], blob: null, audioId: n.audioId || null }; noteSheet(); };
function noteSheet() {
  const n = C.dn; openSheet(`<h2>${n.id ? 'Editar anotação' : 'Nova anotação'}</h2>
   <textarea class="field" id="dn-text" style="min-height:140px" placeholder="Escreva (ou use o 🎤 do teclado para ditar)…">${esc(n.text)}</textarea>
   <div class="chips gap">${TAGS.map(t => `<button class="chip ${n.tags.includes(t) ? 'sel' : ''}" data-act="dntag" data-k="${t}">${t}</button>`).join('')}</div>
   ${C.rec ? `<button class="btn big gap" style="background:var(--bad);color:#fff" data-act="dnstop">⏹ Parar gravação <span id="rec-t">0:00</span></button>` : n.blob ? `<audio controls src="${C.audioUrl(n.blob)}" style="width:100%;margin-top:8px"></audio><button class="btn ghost sm gap" data-act="dnmemodel">Apagar memo</button>` : n.audioId ? `<div data-aid="${n.audioId}" style="margin-top:8px"></div><button class="btn ghost sm gap" data-act="dnmemodel">Apagar memo</button>` : `<button class="btn ghost big gap" data-act="dnmemo">🎙 Gravar memo de voz</button>`}
   <button class="btn big gap" data-act="dnsave">Salvar</button>${n.id ? `<button class="btn ghost big gap" style="color:var(--bad)" data-act="dndel">Apagar</button>` : ''}<button class="btn ghost big gap" data-act="sheet-close">Cancelar</button>`);
  fillAudio($('#sheet-in'));
}
const syncDn = () => { const t = document.getElementById('dn-text'); if (t && C.dn) C.dn.text = t.value; };
A['dntag'] = d => { syncDn(); const t = C.dn.tags, i = t.indexOf(d.k); i < 0 ? t.push(d.k) : t.splice(i, 1); noteSheet(); };
A['dnmemo'] = () => { syncDn(); C.recStart(b => { C.dn.blob = b; C.dn.audioId = null; setTimeout(noteSheet, 0); }); setTimeout(noteSheet, 50); };
A['dnstop'] = () => { syncDn(); if (C.rec) C.rec.mr.stop(); };
A['dnmemodel'] = () => { syncDn(); C.dn.blob = null; C.dn.audioId = null; noteSheet(); };
A['dnsave'] = () => {
  syncDn(); const n = C.dn; if (!n.text.trim() && !n.blob && !n.audioId) { toast('Escreva algo ou grave um memo'); return; }
  if (DB().set.test) { closeSheet(); toast('Modo teste: nada foi salvo'); return; }
  let aid = n.audioId; if (n.blob) { aid = 'n' + (n.id || Date.now()); Store.put('audio', aid, n.blob); }
  if (n.id) { const o = DB().notes.find(x => x.id == n.id); Object.assign(o, { text: n.text.trim(), tags: n.tags, audioId: aid || undefined }); } else DB().notes.push({ id: Date.now(), ts: Date.now(), text: n.text.trim(), tags: n.tags, audioId: aid || undefined });
  save(); closeSheet(); C.dn = null; render(); toast('Anotação salva ✔');
};
A['dndel'] = () => APP.ask('Apagar esta anotação?', 'Não dá para desfazer.', 'Apagar', () => { const o = DB().notes.find(x => x.id == C.dn.id); if (o && o.audioId) Store.del('audio', o.audioId); DB().notes = DB().notes.filter(x => x.id != C.dn.id); save(); C.dn = null; render(); });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'dq') { UI.diaryQ = t.value; render(); const i = document.getElementById('dq'); if (i) { i.focus(); i.setSelectionRange(t.value.length, t.value.length); } }
  else if (t.id === 'cs-note' && C.sum) { C.sum.note = t.value; Store.put('live', 'draft', C.sum); }
  else if (t.id === 'cs-adj' && C.sum) { const v = parseFloat(String(t.value).replace(',', '.')); C.sum.adj = isNaN(v) || v <= 0 ? null : Math.round(v * 1000); Store.put('live', 'draft', C.sum); }
  else if (t.id === 'cset-w') { const v = parseFloat(String(t.value).replace(',', '.')); cfg().weightKg = isNaN(v) || v < 20 || v > 300 ? null : v; save(); }
});

/* ───────── Evolução: cardio ───────── */
function lineChart(pts, fmt) {
  if (pts.length < 2) return '<p class="sm mut">Registre ao menos 2 corridas com distância para ver a evolução.</p>';
  const W = 320, H = 120, p = 24, ys = pts.map(x => x.y), mn = Math.min(...ys), mx = Math.max(...ys), r = (mx - mn) || 1, X = i => p + i * (W - 2 * p) / (pts.length - 1), Y = y => p + (y - mn) / r * (H - 2 * p - 8);   // pace menor = melhor (sobe)
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline fill="none" stroke="var(--acc)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${pts.map((q, i) => X(i) + ',' + Y(q.y)).join(' ')}"/>${pts.map((q, i) => `<circle cx="${X(i)}" cy="${Y(q.y)}" r="4.5" fill="var(--acc)"/><text x="${X(i)}" y="${Y(q.y) - 9}" font-size="10.5" text-anchor="middle" fill="var(--ink)">${fmt(q.y)}</text><text x="${X(i)}" y="${H - 3}" font-size="9" text-anchor="middle" fill="var(--mut)">${q.d}</text>`).join('')}</svg>`;
}
function weekBars() {
  const W = 320, H = 130, p = 20, n = 8, data = []; for (let i = n - 1; i >= 0; i--) { const w = actsWeek(-i), s = weekRange(-i)[0]; data.push({ run: mmin(sum(w.filter(a => a.type === 'run'), a => a.dur)), walk: mmin(sum(w.filter(a => a.type === 'walk'), a => a.dur)), d: pad(s.getDate()) + '/' + pad(s.getMonth() + 1) }); }
  const mx = Math.max(30, ...data.map(d => d.run + d.walk)), bw = (W - 2 * p) / n - 8, Y = v => H - 22 - v / mx * (H - 44);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${data.map((d, i) => { const x = p + i * ((W - 2 * p) / n) + 4; return `<rect x="${x}" y="${Y(d.run)}" width="${bw}" height="${H - 22 - Y(d.run)}" rx="3" fill="var(--acc)"/><rect x="${x}" y="${Y(d.run + d.walk)}" width="${bw}" height="${Y(d.run) - Y(d.run + d.walk)}" rx="3" fill="${'#4aa8ff'}"/>${d.run + d.walk ? `<text x="${x + bw / 2}" y="${Y(d.run + d.walk) - 4}" font-size="10" text-anchor="middle" fill="var(--ink)">${d.run + d.walk}</text>` : ''}<text x="${x + bw / 2}" y="${H - 6}" font-size="9" text-anchor="middle" fill="var(--mut)">${d.d}</text>`; }).join('')}</svg><div class="row xs mut" style="gap:14px"><span><i class="dot" style="background:var(--acc);display:inline-block;width:9px;height:9px;border-radius:50%"></i> corrida</span><span><i class="dot" style="background:#4aa8ff;display:inline-block;width:9px;height:9px;border-radius:50%"></i> caminhada</span><span>minutos por semana</span></div>`;
}
const avg = l => l.length ? l.reduce((a, b) => a + b, 0) / l.length : null;
const f1 = v => v == null ? '—' : v.toFixed(1).replace('.', ',');
function progCardio() {
  const all = acts(), runs = all.filter(a => a.type === 'run'), walks = all.filter(a => a.type === 'walk'), d30 = Date.now() - 30 * 864e5, r30 = runs.filter(a => a.start > d30), w30 = walks.filter(a => a.start > d30);
  const gpsRuns = runs.filter(a => a.dist && a.dist >= 1000), pts = gpsRuns.slice(-8).map(a => ({ y: paceOf(a), d: pad(new Date(a.start).getDate()) + '/' + pad(new Date(a.start).getMonth() + 1) })).filter(p => p.y);
  const rpes = runs.filter(a => a.post && a.post.rpe != null).slice(-8);
  const longest = runs.reduce((m, a) => !m || a.dur > m.dur ? a : m, null), far = runs.reduce((m, a) => a.dist && (!m || a.dist > m.dist) ? a : m, null);
  const bestKm = runs.filter(a => a.splits && a.splits.length && a.source === 'gps').flatMap(a => a.splits.map(s => ({ s: s.sec, a }))).reduce((m, x) => !m || x.s < m.s ? x : m, null);
  const best = gpsRuns.filter(a => a.dist >= 2000).reduce((m, a) => !m || paceOf(a) < paceOf(m) ? a : m, null);
  const wp = walks.filter(a => a.pre && a.post), diffs = k => wp.filter(a => a.pre[k] != null && a.post[k] != null).map(a => a.post[k] - a.pre[k]);
  const k5 = ['mood', 'energy', 'stress'], postOnly = k => avg(walks.filter(a => a.post && a.post[k] != null).map(a => a.post[k]));
  const logsLegs = DB().logs.filter(l => l.type === 'legs'), legsAfter = logsLegs.filter(l => { const t = new Date(l.date + 'T15:00:00').getTime(); return acts().some(a => a.type === 'run' && t - a.start > 0 && t - a.start < 30 * 36e5); });
  return `<div class="row"><div class="stat"><b>${r30.length}</b><span class="xs mut">corridas (30 d)</span></div><div class="stat"><b>${w30.length}</b><span class="xs mut">caminhadas (30 d)</span></div><div class="stat"><b>${Math.round(sum(r30.concat(w30), a => a.dur) / 60 * 10) / 10}</b><span class="xs mut">horas (30 d)</span></div></div>
  <div class="card"><h3>Tempo por semana</h3>${all.length ? weekBars() : '<p class="sm mut">Sem atividades ainda.</p>'}</div>
  <div class="card"><h3>Corrida</h3><p class="xs mut">Duração média: <b>${runs.length ? mmin(avg(runs.map(a => a.dur)) * 1) + ' min' : '—'}</b> · distância total (com distância registrada): <b>${Geo.distStr(sum(runs, a => a.dist))}</b></p>
   <div class="eyebrow gap">Pace médio (corridas com distância ≥ 1 km)</div>${lineChart(pts, v => Geo.paceStr(v))}<p class="xs mut">Pace do GPS tem margem de erro. Compare tendências, não segundos soltos. Mudanças podem vir de terreno, clima ou sono, não só do condicionamento.</p>
   ${rpes.length ? `<div class="eyebrow gap">Esforço percebido (RPE) das últimas corridas</div><div class="row wrap" style="gap:6px">${rpes.map(a => `<span class="chip">${pad(new Date(a.start).getDate())}/${pad(new Date(a.start).getMonth() + 1)} · <b>${a.post.rpe}</b></span>`).join('')}</div><p class="xs mut">Mesmo pace com RPE menor costuma indicar que ficou mais fácil.</p>` : ''}</div>
  <div class="card"><h3>Recordes pessoais</h3>${runs.length ? `<div class="sm"><p>⏱ Maior duração: <b>${longest ? mmin(longest.dur) + ' min' : '—'}</b></p><p>📏 Maior distância: <b>${far ? Geo.distStr(far.dist) : '—'}</b></p><p>⚡ Melhor km (GPS): <b>${bestKm ? Geo.paceStr(bestKm.s) + ' /km' : '—'}</b></p><p>🏁 Melhor pace em ≥ 2 km: <b>${best ? Geo.paceStr(paceOf(best)) + ' /km' : '—'}</b></p></div><p class="xs mut">Recordes são curiosidade, não meta. Nenhuma cobrança.</p>` : '<p class="sm mut">Aparecem depois das primeiras corridas.</p>'}</div>
  <div class="card"><h3>Caminhadas e mente</h3>${wp.length >= 3 ? `<p class="sm">Média da mudança de <b>antes → depois</b> em ${wp.length} caminhadas:</p>${[...k5, 'clarity', 'focus'].map(k => { const d = diffs(k); return d.length ? `<div class="row between sm"><span>${WALK_FIELDS[k]}</span><b>${avg(d) > 0 ? '+' : ''}${f1(avg(d))}</b></div>` : ''; }).join('')}<p class="xs mut">Isto <b>não prova</b> que caminhar causa a mudança: pode refletir o horário, o descanso ou ter tempo livre. Os valores são suas notas de 1 a 5.</p>` : `<p class="sm mut">Registre o “antes” e o “depois” em pelo menos 3 caminhadas para ver como você se sente. É sempre opcional.</p>`}
   ${walks.filter(a => a.post && a.post.focus != null).length >= 3 ? `<p class="xs mut">Concentração média depois da caminhada: <b>${f1(postOnly('focus'))}</b> · clareza: <b>${f1(postOnly('clarity'))}</b> · disposição: <b>${f1(postOnly('ready'))}</b></p>` : ''}</div>
  <div class="card"><h3>Corrida e calistenia</h3>${logsLegs.length ? `<p class="sm">Dos seus ${logsLegs.length} treinos de pernas, ${legsAfter.length} ocorreram até ~30 h depois de uma corrida.</p>${logsLegs.length >= 6 && legsAfter.length >= 3 ? `<p class="sm">Esforço médio nos de pernas: <b>${f1(avg(legsAfter.filter(l => l.effort != null).map(l => l.effort)))}</b> (depois de corrida) vs <b>${f1(avg(logsLegs.filter(l => !legsAfter.includes(l) && l.effort != null).map(l => l.effort)))}</b> (sem corrida antes).</p>` : '<p class="xs mut">Quando houver mais treinos, comparo o esforço com e sem corrida antes.</p>'}<p class="xs mut">É só um registro de coincidências, não uma explicação.</p>` : '<p class="sm mut">Quando você tiver treinos de pernas registrados, cruzo com as corridas.</p>'}</div>
  <div class="card"><h3>Histórico</h3>${all.length ? [...all].reverse().map(a => `<div class="li" data-act="cdetail" data-id="${a.id}"><div class="tile" style="background:${TYPE[a.type].c}">${TYPE[a.type].ico}</div><div class="grow"><div style="font-weight:650">${TYPE[a.type].n}</div><div class="xs mut">${actLine(a)}</div></div></div>`).join('') : '<p class="sm mut">Nenhuma atividade ainda.</p>'}<button class="btn ghost sm gap" data-act="cmanual" data-t="walk">+ Adicionar registro manual</button></div>`;
}

/* ───────── ganchos no Hoje, Ajustes e Aprender ───────── */
X.progCardio = progCardio;
X.weekMark = k => { const a = acts().filter(x => ymd(new Date(x.start)) === k); return a.some(x => x.type === 'run') ? '🏃' : a.length ? '🚶' : ''; };
X.todayMorning = () => {
  const D = DB(), now = new Date(), key = today(), todays = acts().filter(a => ymd(new Date(a.start)) === key), ranToday = todays.some(a => a.type === 'run'), isRunDay = cfg().runDays.includes(now.getDay()), st = C.stageNow(), live = C.live;
  const wk = actsWeek(0).filter(a => a.type === 'run').length;
  let body;
  if (live) body = `<p class="sm">${TYPE[live.type].ico} ${TYPE[live.type].n} em andamento.</p><button class="btn" data-act="cstart" data-t="${live.type}">Voltar para a atividade</button>`;
  else if (ranToday) body = `<p class="sm">✔ Corrida de hoje feita. Caminhar depois, só se der vontade.</p><div class="row gap wrap"><button class="btn ghost sm" data-act="cstart" data-t="walk">🚶 Caminhar</button></div>`;
  else if (isRunDay) body = `<p class="sm"><b>Corrida sugerida:</b> ${st.min[0]}–${st.min[1]} min, trote leve (${st.n}). ${wk ? wk + ' corrida(s) esta semana.' : ''}</p><div class="row gap wrap"><button class="btn" data-act="cstart" data-t="run">🏃 Correr</button><button class="btn ghost" data-act="cstart" data-t="walk">🚶 Caminhar</button></div><p class="xs mut">É uma sugestão. Se o corpo pedir, troque por caminhada ou mobilidade.</p>`;
  else body = `<p class="sm">Dia de <b>mobilidade ou caminhada livre</b>. Sem meta.</p><div class="row gap wrap"><button class="btn ghost" data-act="cstart" data-t="walk">🚶 Caminhar</button><button class="btn ghost" data-act="rtstart" data-k="prep">🔥 Preparar p/ correr</button></div>`;
  return `<div class="card"><div class="eyebrow">☀️ Manhã</div>${body}</div>`;
};
X.legsHint = type => {
  if (type !== 'legs') return '';
  const t = Date.now(), r = acts().filter(a => a.type === 'run' && t - a.start < 24 * 36e5 && t - a.start > 0).filter(a => (a.post && ((a.post.rpe || 0) >= 6 || (a.post.legs || 0) >= 4)) || a.dur >= 40 * 60);
  return r.length ? `<div class="hint down">🏃 Você correu forte ou por bastante tempo nas últimas 24 h. Se as pernas estiverem pesadas, comece o Legs com <b>uma série a menos</b> (marque 🟡). É uma sugestão.</div>` : '';
};
X.settingsHtml = () => {
  const c = cfg(), tog = (k, t, d, on) => `<div class="check ${on ? 'on' : ''}" data-act="${k}"><div class="box">${CHECK}</div><div class="grow"><div class="t" style="text-decoration:none;color:var(--ink)">${t}</div><div class="xs mut">${d}</div></div></div>`;
  return `<div class="card"><h3>Corrida e caminhada</h3>
   <div class="eyebrow">Estágio da corrida</div><div class="chips gap">${RUN_STAGES.map(s => `<button class="chip ${c.stage === s.id ? 'sel' : ''}" data-act="cset-stage" data-k="${s.id}">${s.n} · ${s.min[0]}–${s.min[1]} min</button>`).join('')}</div>
   <p class="xs mut">${RUN_ADVANCE}</p>
   <div class="eyebrow gap">Dias sugeridos para correr</div><div class="chips gap">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="chip ${c.runDays.includes(d) ? 'sel' : ''}" data-act="cset-day" data-k="${d}">${WD[d]}</button>`).join('')}</div>
   <p class="xs mut">Padrão: segunda e quinta (dias de Push, longe do Legs).</p>
   ${tog('cset-gpsrun', 'GPS na corrida por padrão', 'Distância, pace, parciais e percurso (tela ligada).', c.runGps)}${tog('cset-gpswalk', 'GPS na caminhada por padrão', 'Normalmente desligado: só o tempo, e a tela pode bloquear.', c.walkGps)}
   ${tog('cset-voice', 'Avisos por voz', 'Fala o km e o tempo (voz do próprio aparelho, offline).', c.voice)}
   <div class="chips gap">${[['km', 'A cada km'], ['min5', 'A cada 5 min'], ['off', 'Só metas']].map(([k, t]) => `<button class="chip ${c.voiceEvery === k ? 'sel' : ''}" data-act="cset-vevery" data-k="${k}">${t}</button>`).join('')}</div>
   <button class="btn ghost sm gap" data-act="cvoice-test">🔊 Testar voz</button>
   <div class="eyebrow gap">Peso (kg) <span class="mut">opcional</span></div><input class="field" inputmode="decimal" id="cset-w" value="${c.weightKg || ''}" placeholder="só para estimar gasto de energia"><p class="xs mut">Sem peso, o app não mostra calorias. Com peso, é só uma estimativa (varia muito de pessoa para pessoa).</p>
   <button class="btn ghost sm gap" style="color:var(--bad)" data-act="cclear-media">Apagar percursos e áudios (mantém os resumos)</button></div>`;
};
A['cset-stage'] = d => { cfg().stage = d.k; save(); render(); };
A['cset-day'] = d => { const r = cfg().runDays, k = +d.k, i = r.indexOf(k); i < 0 ? r.push(k) : r.splice(i, 1); save(); render(); };
A['cset-gpsrun'] = () => { cfg().runGps = !cfg().runGps; save(); render(); };
A['cset-gpswalk'] = () => { cfg().walkGps = !cfg().walkGps; save(); render(); };
A['cset-voice'] = () => { cfg().voice = !cfg().voice; save(); render(); };
A['cset-vevery'] = d => { cfg().voiceEvery = d.k; save(); render(); };
A['cvoice-test'] = () => { const was = cfg().voice; cfg().voice = true; C.speak('Quilômetro 1. Tempo 5 minutos e 30 segundos. Pace 5 e 30 por quilômetro.'); cfg().voice = was; };
A['cclear-media'] = () => APP.ask('Apagar percursos e áudios?', 'Os resumos das atividades ficam. Percursos e memos de voz serão apagados deste aparelho.', 'Apagar', () => { Store.clear('tracks'); Store.clear('audio'); DB().acts.forEach(a => { delete a.trackId; delete a.audioId; }); DB().notes.forEach(n => delete n.audioId); save(); toast('Percursos e áudios apagados'); render(); });
X.learnHtml = () => `<details class="card"><summary>Corrida e caminhada: como usar</summary>
  <p class="sm"><b>Caminhada livre.</b> Para clarear a cabeça, pensar, aliviar o estresse e se recuperar. 10–40 min, esforço 1–3 de 10, sem meta. Não caminhar num dia não é falha.</p>
  <p class="sm"><b>Corrida leve.</b> Esforço ~3–4 de 10. <b>Teste da fala:</b> se dá para conversar em frases completas, está bom. Sugestão inicial: ${RUN_STAGES.map(s => `${s.n} ${s.min[0]}–${s.min[1]} min`).join(' → ')}; quem decide quando avançar é você.</p>
  <p class="sm"><b>RPE (esforço percebido, 0–10).</b> 0 repouso · 2–3 leve · 4–5 moderado · 7–8 forte · 10 máximo. Anote depois da corrida; vira sua “bússola” sem precisar de relógio.</p>
  <p class="sm"><b>Corrida + calistenia.</b> Manhã de corrida e tarde de força é uma boa separação. Corra mais leve nos dias antes de pernas, e reduza o volume quando dormir mal ou a calistenia estiver pesada. O app só sugere; nada é bloqueado.</p>
  <p class="sm"><b>Limites do app.</b> O GPS na web só funciona com o app aberto e a tela ligada; passos/cadência e frequência cardíaca não são medidos (sem sensor). Distância e pace do GPS têm margem de erro.</p></details>`;

A['tab'] = (old => d => { if (d.seg) UI.progSeg = d.seg; old(d); })(A['tab']);
Object.assign(APP.VIEWS, { cardio: vCardio, cstart: vCstart, track: vTrack, sum: vSum, routine: vRoutine, diary: vDiary });
APP.after.push(() => fillAudio());
APP.after.push(() => { if (C.live) C.updateDom(); });
X.weekSummary = () => { const w = actsWeek(0); return `${w.filter(a => a.type === 'run').length} corrida(s) · ${mmin(sum(w.filter(a => a.type === 'walk'), a => a.dur))} min de caminhada`; };
APP.keepAwake = () => !!C.live;
});
