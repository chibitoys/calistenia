/* Cálculos de percurso (GPS): funções puras, sem DOM — testáveis em Node.
   Nada aqui inventa medidas: pontos ruins são descartados e buracos de sinal viram "lacunas" (distância não contada). */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.Geo = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const R = 6371008.8, rad = d => d * Math.PI / 180;
  function haversine(a, b) {
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon), la1 = rad(a.lat), la2 = rad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  const DEFAULTS = { maxAcc: 30, minStep: 5, maxSpeed: 12, gapSec: 20, pauseSpeed: 0.6, kmSize: 1000, altWin: 5, altStep: 3, altMaxAcc: 30, kfQ: 9, kfAccDiv: 1.5 };

  function newTrack(opts) {
    return { o: Object.assign({}, DEFAULTS, opts), last: null, kf: null, org: null, pts: [], dist: 0, moving: 0, stopped: 0, splits: [], gaps: [], rej: { acc: 0, speed: 0, time: 0 },
      gain: 0, loss: 0, _alt: [], _ref: null, _splitMov: 0 };
  }
  /* filtro de Kalman 2D (posição) em metros locais: suaviza o ruído do GPS antes de somar a distância */
  const toM = (o, p) => ({ x: R * rad(p.lon - o.lon) * o.k, y: R * rad(p.lat - o.lat) });
  const fromM = (o, m) => ({ lat: o.lat + (m.y / R) * 180 / Math.PI, lon: o.lon + (m.x / (R * o.k)) * 180 / Math.PI });
  function kfInit(T, p) { T.org = { lat: p.lat, lon: p.lon, k: Math.cos(rad(p.lat)) }; T.kf = { x: 0, y: 0, v: Math.max(p.acc || 10, 5) ** 2, t: p.t }; }
  function kfStep(T, p) {
    const o = T.o, dt = (p.t - T.kf.t) / 1000; let { x, y, v } = T.kf; v += o.kfQ * dt;
    const m = toM(T.org, p), r = ((p.acc || 10) / o.kfAccDiv) ** 2, K = v / (v + r);
    x += K * (m.x - x); y += K * (m.y - y); v = (1 - K) * v; T.kf = { x, y, v, t: p.t };
    return Object.assign({}, p, fromM(T.org, { x, y }));
  }

  /* p = { t (ms), lat, lon, acc (m), alt (m), altAcc (m) } → { ok, why? } */
  function addPoint(T, p) {
    const o = T.o;
    if (p.acc != null && p.acc > o.maxAcc) { T.rej.acc++; return { ok: false, why: 'acc' }; }
    if (!T.kf) { kfInit(T, p); T.last = p; T.pts.push(pt(T, p, 0)); altitude(T, p); return { ok: true, first: true }; }
    const dtk = (p.t - T.kf.t) / 1000;
    if (dtk <= 0) { T.rej.time++; return { ok: false, why: 'time' }; }
    if (dtk > o.gapSec) {                                          // sinal perdido (ex.: tela bloqueada): não conta a distância do buraco
      const last = T.last; T.gaps.push({ t0: last.t, t1: p.t, sec: Math.round((p.t - last.t) / 1000), jump: Math.round(haversine(last, p)) });
      kfInit(T, p); T.last = p; T.pts.push(pt(T, p, 0, true)); altitude(T, p); return { ok: true, gap: true };
    }
    const kp = fromM(T.org, T.kf);
    if (haversine(kp, p) / dtk > o.maxSpeed) { T.rej.speed++; return { ok: false, why: 'speed' }; }
    const f = kfStep(T, p), last = T.last, dt = (f.t - last.t) / 1000, d = haversine(last, f);
    const need = Math.max(o.minStep, (p.acc || 0) * 0.4);
    if (d < need) return { ok: false, why: 'jitter' };             // parado/ruído: a referência fica e a distância se acumula
    const v = d / dt, mov = v >= o.pauseSpeed ? dt : 0, d0 = T.dist, m0 = T.moving;
    T.dist += d; T.moving += mov; T.stopped += dt - mov;
    while (T.dist >= (T.splits.length + 1) * o.kmSize) {           // cruzou um km: interpola o instante do cruzamento
      const k = T.splits.length + 1, fr = (k * o.kmSize - d0) / d, atMov = m0 + fr * mov;
      T.splits.push({ km: k, sec: Math.round(atMov - T._splitMov), at: Math.round(atMov) }); T._splitMov = atMov;
    }
    T.last = f; T.pts.push(pt(T, f, 0)); altitude(T, p);
    return { ok: true };
  }
  function pt(T, p, _x, gap) { return { t: p.t, lat: +p.lat.toFixed(6), lon: +p.lon.toFixed(6), d: Math.round(T.dist), m: Math.round(T.moving), a: p.alt != null ? Math.round(p.alt * 10) / 10 : null, g: gap ? 1 : 0 }; }
  function altitude(T, p) {
    const o = T.o; if (p.alt == null || (p.altAcc != null && p.altAcc > o.altMaxAcc)) return;
    T._alt.push(p.alt); if (T._alt.length > o.altWin) T._alt.shift();
    const s = T._alt.reduce((a, b) => a + b, 0) / T._alt.length;
    if (T._ref == null) { T._ref = s; return; }
    if (s - T._ref >= o.altStep) { T.gain += s - T._ref; T._ref = s; } else if (T._ref - s >= o.altStep) { T.loss += T._ref - s; T._ref = s; }
  }
  /* pace instantâneo: média dos últimos N segundos (sec/km) ou null se não há dado confiável */
  function currentPace(T, nowMs, win) {
    win = win || 30; const P = T.pts; if (P.length < 2) return null;
    const last = P[P.length - 1]; if ((nowMs - last.t) / 1000 > 15) return null;
    let i = P.length - 1; while (i > 0 && (last.t - P[i - 1].t) / 1000 <= win && !P[i].g) i--;
    const first = P[i], dd = last.d - first.d, mm = last.m - first.m;
    if (dd < 5 || mm < 5) return null; return mm / (dd / 1000);
  }
  function summary(T) {
    return { dist: Math.round(T.dist), moving: Math.round(T.moving), stopped: Math.round(T.stopped), avgPace: T.dist >= 50 && T.moving > 0 ? T.moving / (T.dist / 1000) : null,
      splits: T.splits.slice(), gaps: T.gaps.slice(), gain: Math.round(T.gain), loss: Math.round(T.loss), rejected: Object.assign({}, T.rej), points: T.pts.length };
  }

  /* Ramer–Douglas–Peucker (em metros) para guardar/desenhar o percurso sem milhares de pontos */
  function simplify(pts, tol) {
    if (pts.length < 3) return pts.slice();
    const lat0 = rad(pts[0].lat), kx = R * Math.cos(lat0), ky = R, X = p => rad(p.lon) * kx, Y = p => rad(p.lat) * ky, keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    const st = [[0, pts.length - 1]];
    while (st.length) {
      const [a, b] = st.pop(); let md = 0, mi = -1; const ax = X(pts[a]), ay = Y(pts[a]), bx = X(pts[b]), by = Y(pts[b]), dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      for (let i = a + 1; i < b; i++) { const px = X(pts[i]), py = Y(pts[i]); let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); if (d > md) { md = d; mi = i; } }
      if (md > tol && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
    }
    return pts.filter((_, i) => keep[i]);
  }
  /* percurso em SVG (apenas a forma — sem mapa, sem rede, sem vazar localização) */
  function routePath(pts, w, h, pad) {
    pad = pad == null ? 8 : pad; if (pts.length < 2) return '';
    const lat0 = rad(pts.reduce((s, p) => s + p.lat, 0) / pts.length), xs = pts.map(p => rad(p.lon) * Math.cos(lat0)), ys = pts.map(p => -rad(p.lat));
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), sw = x1 - x0 || 1e-9, sh = y1 - y0 || 1e-9, s = Math.min((w - 2 * pad) / sw, (h - 2 * pad) / sh);
    const ox = (w - sw * s) / 2, oy = (h - sh * s) / 2; let out = '', brk = true;
    pts.forEach((p, i) => { const x = ox + (xs[i] - x0) * s, y = oy + (ys[i] - y0) * s; out += (brk || p.g ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); brk = false; });
    return out;
  }

  /* formatação */
  const pad2 = n => String(n).padStart(2, '0');
  function paceStr(sec) { if (!sec || !isFinite(sec) || sec > 3600) return '—'; const s = Math.round(sec); return Math.floor(s / 60) + ':' + pad2(s % 60); }
  function distStr(m) { return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(2).replace('.', ',') + ' km'; }
  function durStr(sec) { sec = Math.round(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`; }

  /* Gasto energético: ESTIMATIVA (equações metabólicas do ACSM para andar/correr em terreno plano; varia muito entre pessoas). Só com peso informado. */
  function kcal(kg, seconds, kmh) {
    if (!kg || !seconds || !kmh) return null; const mpm = kmh * 1000 / 60;
    const vo2 = (kmh >= 7.5 ? 0.2 * mpm : 0.1 * mpm) + 3.5;      // ml/kg/min
    return Math.round(vo2 * kg * (seconds / 60) / 200);
  }
  return { haversine, newTrack, addPoint, currentPace, summary, simplify, routePath, paceStr, distStr, durStr, kcal, DEFAULTS };
});
