/* Animações próprias (ilustrações originais): boneco articulado em vista lateral, com cinemática inversa.
   Coordenadas: x → direita, u = altura acima do chão (cm "de desenho"). Ângulos em graus, anti-horário, 0 = direita. */
(() => {
'use strict';
const W = 320, H = 210, G = 192;                  // tela e linha do chão (y = G - u)
const L = { T: 52, N: 10, HR: 10, UA: 30, FA: 28, TH: 44, SH: 42 };
const RAD = Math.PI / 180;
const ANIM = {};

/* ───────── cinemática ───────── */
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
/* sentido correto da dobra (anatomia): cotovelo: cruz(braço, antebraço) > 0; joelho: cruz(coxa, canela) < 0. */
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
const flexOk = (P, J, E, kind) => kind === 'e' ? cross(P, J, E) : -cross(P, J, E);
function ik(P, T, l1, l2, kind, sa) {
  const dx = T[0] - P[0], dy = T[1] - P[1], d = Math.hypot(dx, dy), th = Math.atan2(dy, dx), sum = l1 + l2;
  let k = 1;
  if (d > sum * .999) k = Math.min(d / sum * 1.001, 1.12);                 // estica um pouco para alcançar o apoio
  else if (sa > 0) k = 1 + (Math.max(d / sum, .8) - 1) * Math.min(1, sa);  // braço travado: encurta para ficar reto
  const A = l1 * k, B = l2 * k, mx = A + B - .01, mn = Math.abs(A - B) + .01, dd = Math.min(mx, Math.max(mn, d));
  const al = Math.acos(Math.max(-1, Math.min(1, (A * A + dd * dd - B * B) / (2 * A * dd))));
  const end = d > mx ? [P[0] + dx / d * mx, P[1] + dy / d * mx] : T;
  const J = s => { const e = th + s * al; return [P[0] + A * Math.cos(e), P[1] + A * Math.sin(e)]; };
  let j = J(1); if (typeof kind === 'number') { const b = J(-1); if (Math.abs(b[0] - kind) > Math.abs(j[0] - kind)) j = b; } else if (flexOk(P, j, end, kind) < 0) j = J(-1);
  return { j, end, k, d, sum };
}

/* normaliza um keyframe do autor para valores absolutos */
function norm(k, prev) {
  const o = Object.assign({}, prev || {}, k);
  if (k.rigid) {                                // corpo reto apoiado nos pés: [pé, altura do ombro]
    const [f, su] = k.rigid, R = L.T + L.TH + L.SH, dy = su - f[1], dx = Math.sqrt(Math.max(1, R * R - dy * dy));
    o.foot = f; o.a = Math.atan2(dy, dx) / RAD; o.hip = [f[0] + (dx / R) * (L.TH + L.SH), f[1] + (dy / R) * (L.TH + L.SH)];
    delete o.sh; o.rigidSh = [f[0] + dx, su];
  }
  const dir = a => [Math.cos(a * RAD), Math.sin(a * RAD)];
  if (k.sh && !k.rigid) { const d = dir(o.a); o.hip = [k.sh[0] - L.T * d[0], k.sh[1] - L.T * d[1]]; } else if (k.hip) o.hip = k.hip;
  else if (k.a !== undefined && !k.rigid && prev && !k.sh) o.hip = prev.hip;
  const d = dir(o.a), sh = [o.hip[0] + L.T * d[0], o.hip[1] + L.T * d[1]];
  const rel = (spec, base) => spec && spec.rel ? add(base, spec.rel) : spec;
  Object.entries({ fr: 'foot', fr2: 'foot2', hr: 'hand', hr2: 'hand2' }).forEach(([n, t]) => { if (k[t] && !k[n]) delete o[n]; if (o[n]) o[t] = add(n[0] === 'f' ? o.hip : sh, o[n]); });
  o.sh = sh;
  return o;
}
function build(frames) { const out = []; frames.forEach((f, i) => out.push(norm(f, out[i - 1] || null))); return out; }

/* pose em t∈[0,1) do ciclo */
function mix(A, B, t) {
  const o = { hip: lerp2(A.hip, B.hip, t), a: lerp(A.a, B.a, t), h: lerp(A.h || 0, B.h || 0, t) };
  ['hand', 'foot', 'hand2', 'foot2', 'knee', 'knee2'].forEach(n => { const a = A[n] || B[n], b = B[n] || A[n]; o[n] = a && b ? lerp2(a, b, t) : null; });
  const near = t < .5 ? A : B; o.eb = near.eb ?? 1; o.kb = near.kb ?? 1; o.kb2 = near.kb2 ?? near.kb ?? 1; o.eb2 = near.eb2 ?? near.eb ?? 1; o.sa = lerp(A.sa || 0, B.sa || 0, t);
  return o;
}
function figure(p) {
  const d = [Math.cos(p.a * RAD), Math.sin(p.a * RAD)], hd = [Math.cos((p.a + p.h) * RAD), Math.sin((p.a + p.h) * RAD)];
  const sh = [p.hip[0] + L.T * d[0], p.hip[1] + L.T * d[1]], neck = [sh[0] + L.N * hd[0], sh[1] + L.N * hd[1]], head = [sh[0] + (L.N + L.HR) * hd[0], sh[1] + (L.N + L.HR) * hd[1]];
  const face = [Math.sin((p.a + p.h) * RAD), -Math.cos((p.a + p.h) * RAD)];
  const tgtH = p.hand || add(sh, [7, -50]), off = [-6, 0];
  const arm = (T, s, sa) => { const r = ik(sh, T, L.UA, L.FA, 'e', sa); return { pts: [sh, r.j, r.end], r }; };
  const leg = (T, s, K) => { if (K) return { pts: [p.hip, K, T], r: { k: 1, d: 0, sum: 1 } }; const r = ik(p.hip, T, L.TH, L.SH, 'k', 0); return { pts: [p.hip, r.j, r.end], r }; };
  const A1 = arm(tgtH, p.eb, p.sa), A2 = arm(p.hand2 || add(tgtH, off), p.eb2, p.sa);
  const L1 = p.foot ? leg(p.foot, p.kb, p.knee) : null;
  const L2 = p.foot2 ? leg(p.foot2, p.kb2, p.knee2) : p.foot ? (p.knee ? leg(add(p.foot, off), 1, add(p.knee, off)) : leg(add(p.foot, off), p.kb)) : null;
  const fdir = c => { if (!c) return null; const s = [c.pts[2][0] - c.pts[1][0], c.pts[2][1] - c.pts[1][1]], n = Math.hypot(s[0], s[1]) || 1; let f = [-s[1] / n, s[0] / n]; if (f[0] < -.01 || (Math.abs(f[0]) <= .01 && f[1] > 0)) f = [-f[0], -f[1]]; return f; };
  return { sh, neck, head, face, arm: A1.pts, arm2: A2.pts, leg: L1 && L1.pts, leg2: L2 && L2.pts, fd: fdir(L1), fd2: fdir(L2), q: { arm: A1.r, arm2: A2.r, leg: L1 && L1.r, leg2: L2 && L2.r } };
}

/* ───────── autoria dos exercícios ───────── */
/* shorthand: pts [x,u]; eb/kb = lado da dobra (±1); hl = partes em destaque */
const BAR = (x, u) => ({ t: 'bar', x, u });
const BOX = (x, w, h) => ({ t: 'box', x, w, h });
function def(id, o) { ANIM[id] = Object.assign({ props: [], hl: [], period: 0 }, o); ANIM[id].K = build(o.keys); }

/* ——— PUSH ——— */
const PU_F = [52, 4], PU_HX = 52 + Math.sqrt(138 * 138 - 56 * 56);
def('pushup', {
  keys: [{ rigid: [PU_F, 60], hand: [PU_HX, 2], eb: 1, kb: 1, h: -8, d: 1.3, hold: .3 },
         { rigid: [PU_F, 32], hand: [PU_HX, 2], d: 1.1, hold: .25 }],
  hl: ['arm', 'torso'],
});
const DF = [48, 52];
def('decline', {
  keys: [{ rigid: [DF, 60], hand: [PU_HX + 4, 2], eb: 1, kb: 1, h: -8, d: 1.3, hold: .3 }, { rigid: [DF, 28], hand: [PU_HX + 4, 2], d: 1.1, hold: .25 }],
  props: [BOX(18, 60, 48)], hl: ['arm', 'torso'],
});
const IF = [52, 4];
def('incline_pushup', {
  keys: [{ rigid: [IF, 117], hand: [131, 60], eb: 1, kb: 1, h: -8, d: 1.2, hold: .3 }, { rigid: [IF, 96], hand: [131, 60], d: 1, hold: .25 }],
  props: [BOX(112, 50, 56)], hl: ['arm', 'torso'],
});
def('scap_pushup', {
  keys: [{ rigid: [PU_F, 60], hand: [PU_HX, 2], sa: 1, h: -8, d: 1.2, hold: .5 }, { rigid: [PU_F, 52], hand: [PU_HX, 2], sa: 1, d: 1.2, hold: .5 }],
  hl: ['torso'],
});
def('pike', {
  keys: [{ hip: [118, 82], a: -38, hand: [190, 2], foot: [82, 4], eb: 1, kb: -1, h: -30, d: 1.5, hold: .35 },
         { hip: [126, 76], a: -55, hand: [190, 2], foot: [82, 4], h: -30, d: 1.3, hold: .3 }],
  hl: ['arm', 'torso'],
});
def('incline_pike', {
  keys: [{ hip: [112, 83], a: -42, hand: [204, 70], foot: [78, 4], eb: 1, kb: -1, h: -30, d: 1.4, hold: .35 },
         { hip: [136, 64], a: -40, hand: [204, 70], foot: [78, 4], h: -30, d: 1.3, hold: .3 }],
  props: [BOX(186, 60, 68)], hl: ['arm', 'torso'],
});
const DIPH = [150, 98];
def('dips', {
  keys: [{ sh: [152, 156], a: 74, hand: DIPH, fr: [-20, -50], eb: 1, kb: -1, h: -4, d: 1.3, hold: .3 },
         { sh: [162, 114], a: 58, hand: DIPH, fr: [-34, -42], h: -4, d: 1.3, hold: .3 }],
  props: [BAR(150, 98)], hl: ['arm', 'torso'],
});
def('dip_hold', {
  keys: [{ sh: [152, 156], a: 74, hand: DIPH, fr: [-20, -50], sa: 1, h: -4, d: 1, hold: .6 }, { sh: [152, 150], a: 74, hand: DIPH, fr: [-22, -52], sa: 1, d: 1, hold: .6 }],
  props: [BAR(150, 98)], hl: ['torso'],
});

/* ——— PULL ——— */
const PB = [160, 182];
const hangKey = (shU, extra) => Object.assign({ sh: [150, shU], a: 92, hand: PB, fr: [-14, -66], sa: 1, h: 6 }, extra);
def('pullup', {
  keys: [hangKey(124, { sa: 0, eb: 1, d: 1.3, hold: .2 }), { sh: [148, 152], a: 100, hand: PB, fr: [-26, -56], eb: 1, h: 14, d: 1.3, hold: .35 }].map((k, i) => i ? k : Object.assign(k, { sa: 0 })),
  props: [BAR(160, 182)], hl: ['arm', 'torso'],
});
def('band_pullup', {
  keys: [hangKey(124, { sa: 0, eb: 1, d: 1.4, hold: .2 }), { sh: [148, 152], a: 100, hand: PB, fr: [-26, -56], eb: 1, h: 14, d: 1.4, hold: .35 }],
  props: [BAR(160, 182), { t: 'band', from: 'hand', to: 'foot' }], hl: ['arm', 'torso'],
});
def('neg_pullup', {
  keys: [{ sh: [148, 152], a: 100, hand: PB, fr: [-26, -56], eb: 1, h: 14, d: 3, hold: .3 }, hangKey(124, { sa: 0, eb: 1, d: .5, hold: .6 })],
  props: [BAR(160, 182)], hl: ['arm', 'torso'],
});
def('pullup_hold', {
  keys: [hangKey(124, { sa: 0, eb: 1, d: .9, hold: .2 }), { sh: [148, 152], a: 100, hand: PB, fr: [-26, -56], eb: 1, h: 14, d: .9, hold: 1.6 }],
  props: [BAR(160, 182)], hl: ['arm', 'torso'],
});
def('scap_pullup', {
  keys: [hangKey(124, { d: 1.1, hold: .5 }), hangKey(131, { d: 1.1, hold: .5 })], props: [BAR(160, 182)], hl: ['torso'],
});
def('active_hang', {
  keys: [hangKey(127, { d: 1, hold: .8 }), hangKey(131, { d: 1, hold: .8 })], props: [BAR(160, 182)], hl: ['torso'],
});
def('dead_hang', {
  keys: [hangKey(123, { d: 1.2, hold: .8 }), hangKey(121, { d: 1.2, hold: .8 })], props: [BAR(160, 182)], hl: ['arm'],
});
const IRH = 96;
def('inv_row', {
  keys: [{ rigid: [[44, 4], 38], hand: [168, IRH], eb: 1, kb: 1, h: 4, d: 1.3, hold: .2 }, { rigid: [[44, 4], 80], hand: [168, IRH], d: 1.3, hold: .35 }],
  props: [BAR(168, IRH)], hl: ['arm', 'torso'],
});
def('band_row', {
  keys: [{ hip: [96, 8], a: 88, hand: [152, 50], foot: [182, 6], eb: -1, kb: 1, h: 0, d: 1.3, hold: .2 }, { hip: [96, 8], a: 84, hand: [118, 54], foot: [182, 6], d: 1.3, hold: .35 }],
  props: [{ t: 'band', from: 'hand', to: 'foot' }], hl: ['arm', 'torso'],
});

/* ——— LEGS ——— */
def('assisted_pistol', {
  keys: [{ hip: [128, 90], a: 92, hand: [170, 100], foot: [128, 4], foot2: [208, 72], kb: 1, kb2: 1, eb: 1, h: 0, d: 1.5, hold: .3 },
         { hip: [100, 50], a: 62, hand: [170, 100], foot: [128, 4], foot2: [208, 62], d: 1.5, hold: .35 }],
  props: [{ t: 'post', x: 170, h: 130 }], hl: ['leg'],
});
def('shrimp', {
  keys: [{ hip: [128, 90], a: 90, hr: [38, -30], foot: [128, 4], foot2: [102, 78], h: 0, d: 1.6, hold: .3 },
         { hip: [114, 52], a: 64, hand: [96, 58], foot: [128, 4], foot2: [96, 58], d: 1.6, hold: .45 }],
  hl: ['leg'],
});
def('split_squat', {
  keys: [{ hip: [109, 84], a: 92, hand: [124, 84], foot: [140, 4], foot2: [78, 4], kb: 1, kb2: -1, eb: 1, d: 1.4, hold: .25 },
         { hip: [109, 50], a: 90, hand: [124, 84], foot: [140, 4], foot2: [78, 4], d: 1.4, hold: .3 }],
  hl: ['leg'],
});
def('bw_squat', {
  keys: [{ hip: [128, 90], a: 90, hr: [48, -8], foot: [128, 4], kb: 1, eb: 1, d: 1.4, hold: .25 }, { hip: [96, 48], a: 62, hr: [48, -6], foot: [128, 4], d: 1.4, hold: .3 }],
  hl: ['leg'],
});
def('calf', {
  keys: [{ hip: [128, 92], a: 90, hand: [166, 104], foot: [128, 6], kb: 1, eb: 1, d: .9, hold: .3 }, { hip: [128, 106], a: 90, hand: [166, 114], foot: [128, 20], d: .9, hold: .6 }],
  props: [{ t: 'post', x: 166, h: 120 }], hl: ['leg'],
});
def('slide_curl', {
  keys: [{ hip: [124, 46], a: 215, hand: [136, 3], sa: 1, foot: [196, 4], kb: 1, eb: -1, h: 0, d: 1.5, hold: .3 }, { hip: [124, 46], a: 215, hand: [136, 3], foot: [152, 4], d: 1.5, hold: .3 }],
  hl: ['leg'],
});
def('glute_bridge', {
  keys: [{ hip: [126, 8], a: 180, hand: [132, 3], sa: 1, foot: [170, 4], kb: 1, eb: -1, h: 0, d: 1.2, hold: .25 }, { hip: [126, 46], a: 214, hand: [132, 3], foot: [170, 4], d: 1.2, hold: .5 }],
  hl: ['leg', 'torso'],
});

/* ——— CORE ——— */
def('knee_raise', {
  keys: [{ sh: [150, 124], a: 92, hand: [160, 182], fr: [-12, -70], sa: 1, h: 6, d: 1.3, hold: .3 }, { sh: [150, 124], a: 100, hand: [160, 182], fr: [34, -40], sa: 1, h: 6, d: 1.3, hold: .5 }],
  props: [BAR(160, 182)], hl: ['torso'],
});
def('hollow', {
  keys: [{ hip: [150, 8], a: 180, hand: [42, 3], sa: 1, foot: [234, 4], kb: 1, eb: -1, h: 0, d: 1.4, hold: .4 }, { hip: [150, 14], a: 160, hand: [46, 40], foot: [232, 34], d: 1.4, hold: .9 }],
  hl: ['torso'],
});
def('seated_pike_lift', {
  keys: [{ hip: [106, 10], a: 88, hand: [122, 4], foot: [192, 6], foot2: [190, 6], kb: 1, kb2: 1, eb: 1, d: 1, hold: .3 }, { hip: [106, 10], a: 78, hand: [122, 4], foot: [192, 6], foot2: [192, 44], d: 1, hold: .5 }],
  hl: ['torso', 'leg'],
});

/* ——— AQUECIMENTO / MOBILIDADE / ALONGAMENTO ——— */
const ST = { hip: [128, 90], a: 90, foot: [128, 4], kb: 1, eb: 1, h: 0 };
const QD = { hip: [120, 46], a: 8, sa: 1, hand: [172, 2], hand2: [172, 2], foot: [78, 4], kb: 1, eb: 1, h: -10 };
const SEAT = { hip: [100, 10], a: 88, foot: [186, 6], kb: 1, eb: 1, h: 0 };
const ring = (n, r, off = 0) => Array.from({ length: n }, (_, i) => { const t = off + 2 * Math.PI * i / n; return [r * Math.cos(t), r * Math.sin(t)]; });
const seq = (base, list) => list.map((o, i) => Object.assign({}, i ? {} : base, o));

def('shoulder_rot', { keys: ring(8, 58, Math.PI / 2).map((p, i) => Object.assign(i ? {} : Object.assign({ sa: 1 }, ST), { hr: p, d: .26, hold: 0 })), hl: ['arm'] });
def('elbow_rot', { keys: ring(6, 18).map((p, i) => Object.assign(i ? {} : Object.assign({ eb: -1 }, ST), { hr: [30 + p[0], p[1]], d: .3, hold: 0 })), hl: ['arm'] });
def('banded_pass', { keys: seq(Object.assign({ sa: 1 }, ST), [{ hr: [58, 0], d: .7, hold: .2 }, { hr: [41, 41], d: .6, hold: 0 }, { hr: [0, 58], d: .6, hold: .1 }, { hr: [-41, 41], d: .6, hold: 0 }, { hr: [-58, 0], d: .7, hold: .3 }, { hr: [-41, 41], d: .6, hold: 0 }, { hr: [0, 58], d: .6, hold: 0 }, { hr: [41, 41], d: .6, hold: 0 }]), hl: ['arm'] });
def('int_rot', { keys: seq(Object.assign({ eb: 1 }, ST), [{ hr: [30, -28], d: 1, hold: .3 }, { hr: [8, -36], d: 1, hold: .3 }]), hl: ['arm'] });
def('ext_rot', { keys: seq(Object.assign({ eb: 1 }, ST), [{ hr: [8, -36], d: 1, hold: .3 }, { hr: [30, -28], d: 1, hold: .3 }]), hl: ['arm'] });
def('wrist_rot', { keys: ring(6, 7).map((p, i) => Object.assign(i ? {} : Object.assign({ sa: 1 }, ST), { hr: [48 + p[0], -8 + p[1]], d: .3, hold: 0 })), hl: ['arm'] });
def('wrist_clock', { keys: seq(QD, [{ d: 1.1, hold: .2 }, { hip: [130, 44], d: 1.1, hold: .2 }, { hip: [112, 46], d: 1.1, hold: .2 }]), hl: ['arm'] });
def('wrist_circle', { keys: ring(6, 8).map((p, i) => Object.assign(i ? {} : QD, { hip: [120 + p[0], 46 + p[1] * .4], d: .4, hold: 0 })), hl: ['arm'] });
def('wrist_pushup', { keys: seq(QD, [{ hand: [172, 2], d: .8, hold: .2 }, { hip: [132, 44], hand: [172, 2], d: .8, hold: .2 }]), hl: ['arm'] });
def('rev_wrist_pushup', { keys: seq(QD, [{ d: .8, hold: .2 }, { hip: [132, 44], d: .8, hold: .2 }]), hl: ['arm'] });
def('cat_cow', { keys: seq(QD, [{ a: 16, h: 32, d: 1.5, hold: .3 }, { a: -10, h: -36, d: 1.5, hold: .3 }]), hl: ['torso'] });
def('thoracic_rot', { keys: seq(QD, [{ hand: [166, 66], d: 1.3, hold: .3 }, { hand: [172, 110], d: 1.3, hold: .5 }]), hl: ['torso'] });
def('neck_rot', { keys: seq(Object.assign({ sa: 1, hr: [4, -56] }, ST), [{ h: -28, d: .8, hold: .2 }, { h: 0, d: .6, hold: 0 }, { h: 28, d: .8, hold: .2 }, { h: 0, d: .6, hold: 0 }]), hl: [] });
def('hip_circles', { keys: ring(6, 7).map((p, i) => Object.assign(i ? {} : Object.assign({ hr: [22, -24], sa: 1 }, ST), { hip: [128 + p[0], 82 + p[1]], d: .35, hold: 0 })), hl: ['leg'] });
def('hip_openers', { keys: seq(Object.assign({ foot2: [128, 4], kb2: 1, hr: [22, -24], sa: 1 }, ST), [{ d: .9, hold: .2 }, { foot2: [156, 50], d: .9, hold: .4 }]), hl: ['leg'] });
def('leg_swing', { keys: seq(Object.assign({ hand: [168, 100], foot2: [196, 56], kb2: 1 }, ST), [{ d: 1, hold: 0 }, { foot2: [64, 50], d: 1, hold: 0 }]), props: [{ t: 'post', x: 168, h: 118 }], hl: ['leg'] });
def('ankle_mob', { keys: seq({ hip: [118, 86], a: 90, hr: [22, -24], sa: 1, foot: [130, 4], foot2: [80, 4], kb: 1, kb2: -1, h: 0 }, [{ d: 1.2, hold: .3 }, { hip: [146, 72], d: 1.2, hold: .5 }]), hl: ['leg'] });
def('chest_stretch', { keys: seq(Object.assign({ sa: 1 }, ST), [{ hr: [-26, -46], a: 90, d: 1.3, hold: .3 }, { hr: [-40, -30], a: 98, d: 1.3, hold: .8 }]), hl: ['torso'] });
def('triceps_stretch', { keys: seq(Object.assign({ eb: 1 }, ST), [{ hr: [-8, 18], d: 1.2, hold: .5 }, { hr: [-14, 10], d: 1.2, hold: .8 }]), hl: ['arm'] });
def('crossbody', { keys: seq(Object.assign({ sa: 1 }, ST), [{ hr: [50, -2], hr2: [26, -2], d: 1.2, hold: .5 }, { hr: [54, -4], hr2: [30, -2], d: 1.2, hold: .8 }]), hl: ['arm'] });
def('childs_pose', { keys: seq({ hip: [62, 18], a: -9, hand: [170, 3], sa: 1, foot: [56, 4], knee: [100, 4], kb: 1, h: -12 }, [{ d: 1.8, hold: .4 }, { a: -14, hand: [172, 3], d: 1.8, hold: .8 }]), hl: ['torso'] });
def('biceps_stretch', { keys: seq(Object.assign({ hand: [98, 3], sa: 1 }, SEAT), [{ d: 1.2, hold: .3 }, { hip: [104, 12], a: 90, d: 1.2, hold: .8 }]), hl: ['arm'] });
def('quad_stretch', { keys: seq(Object.assign({ foot2: [104, 86], hand: [104, 88], sa: 1, kb2: -1 }, ST), [{ d: 1.2, hold: .5 }, { foot2: [98, 88], hand: [100, 90], d: 1.2, hold: .8 }]), hl: ['leg'] });
def('seated_ham', { keys: seq(Object.assign({ hand: [140, 22], sa: 1 }, SEAT), [{ d: 1.5, hold: .3 }, { a: 45, hand: [176, 10], d: 1.5, hold: .8 }]), hl: ['leg'] });
def('standing_pike_stretch', { keys: seq(Object.assign({ hr: [4, -52], sa: 1 }, ST, { hip: [118, 89], foot: [124, 4] }), [{ d: 1.6, hold: .3 }, { a: -70, hr: [12, -34], d: 1.6, hold: .9 }]), hl: ['leg'] });
def('calf_stretch', { keys: seq(Object.assign({ hand: [196, 24], sa: 1 }, SEAT), [{ a: 40, foot: [186, 6], d: 1.2, hold: .4 }, { a: 40, foot: [182, 22], d: 1.2, hold: .8 }]), hl: ['leg'] });
def('hip_flexor', { keys: seq({ hip: [100, 44], a: 90, hr: [22, -24], sa: 1, foot: [146, 4], foot2: [44, 6], knee2: [74, 4], kb: 1, kb2: -1, h: 0 }, [{ d: 1.4, hold: .4 }, { hip: [114, 41], d: 1.4, hold: .9 }]), hl: ['leg'] });


/* ——— extras citados nos vídeos ——— */
def('knee_pushup', {
  keys: [{ sh: [186, 58], a: 35, hand: [186, 2], foot: [66, 4], knee: [110, 4], eb: 1, h: -8, d: 1.2, hold: .3 }, { sh: [194, 30], a: 17, hand: [186, 2], foot: [66, 4], knee: [110, 4], d: 1.1, hold: .25 }],
  hl: ['arm', 'torso'],
});
const KN = [112, 4], thk = t => ({ hip: [KN[0] + 44 * Math.sin(t * RAD), KN[1] + 44 * Math.cos(t * RAD)], a: 90 - t });
def('nordic_curl', {
  keys: [Object.assign(thk(0), { hr: [24, -26], foot: [66, 4], knee: KN, eb: 1, h: 0, d: 1.6, hold: .4 }), Object.assign(thk(45), { hr: [26, -22], d: 1.4, hold: 0 }), Object.assign(thk(72), { hand: [226, 2], d: .9, hold: .5 })],
  hl: ['leg'],
});
def('reverse_nordic', {
  keys: [Object.assign(thk(0), { hr: [24, -26], foot: [66, 4], knee: KN, eb: 1, h: 0, d: 1.6, hold: .4 }), Object.assign(thk(-40), { hr: [24, -26], d: 1.6, hold: .6 })],
  hl: ['leg'],
});
def('l_sit', {
  keys: [{ sh: [132, 60], a: 90, hand: [132, 2], sa: 1, foot: [218, 6], kb: 1, h: 0, d: 1.2, hold: .4 }, { sh: [132, 62], a: 90, hand: [132, 2], sa: 1, foot: [218, 24], d: 1.2, hold: 1 }],
  hl: ['leg', 'torso'],
});
def('pistol', {
  keys: [{ hip: [128, 90], a: 92, hr: [52, -6], foot: [128, 4], foot2: [210, 70], kb: 1, kb2: 1, eb: 1, h: 0, d: 1.6, hold: .3 },
         { hip: [94, 38], a: 56, hr: [54, -8], foot: [128, 4], foot2: [214, 40], d: 1.6, hold: .4 }],
  hl: ['leg'],
});
const alias = (nw, base, o = {}) => { ANIM[nw] = Object.assign({}, ANIM[base], o); };
alias('wide_pushup', 'pushup'); alias('diamond_pushup', 'pushup'); alias('chin_up', 'pullup'); alias('banded_dip', 'dips'); alias('neg_dip', 'dips');

/* ——— extras de lado ——— */
def('box_step', {
  keys: [{ hip: [136, 126], a: 90, hr: [44, -26], foot: [140, 40], foot2: [156, 62], h: 0, d: 1.4, hold: .3 }, { hip: [132, 94], a: 86, hr: [44, -24], foot: [140, 40], foot2: [156, 6], d: 1.4, hold: .35 }],
  props: [BOX(104, 72, 40)], hl: ['leg'],
});
def('single_leg_calf', {
  keys: [{ hip: [128, 92], a: 90, hand: [166, 104], foot: [128, 6], foot2: [102, 48], h: 0, d: .9, hold: .3 }, { hip: [128, 106], a: 90, hand: [166, 114], foot: [128, 20], foot2: [102, 62], d: .9, hold: .7 }],
  props: [{ t: 'post', x: 166, h: 120 }], hl: ['leg'],
});
def('reverse_plank', {
  keys: [{ hip: [176, 10], a: 178, hand: [146, 3], foot: [262, 4], h: 0, d: 1.2, hold: .3 }, { hip: [166, 23], a: 167, hand: [140, 3], foot: [250, 4], d: 1.2, hold: 1 }],
  hl: ['torso', 'leg'],
});

/* ——— VISÃO DE FRENTE ———
   Pose: sc = centro dos ombros, pv = pelve, st = inclinação dos ombros (°, + = direito mais baixo), hd = cabeça relativa a sc,
   hl/hr/fl/fr = mãos e pés (esquerda/direita da tela), hs = mãos simétricas relativas a sc ([dx, du]). */
const ANIMF = {};
const SWF = 20, HWF = 12;
function resolveF(k) {
  const r = { sc: k.sc, pv: k.pv, st: k.st || 0, hd: k.hd || [0, 22], fl: k.fl, fr: k.fr };
  r.hl = k.hl || (k.hs ? [k.sc[0] - k.hs[0], k.sc[1] + k.hs[1]] : [k.sc[0] - 30, k.sc[1] - 50]);
  r.hr = k.hr || (k.hs ? [k.sc[0] + k.hs[0], k.sc[1] + k.hs[1]] : [k.sc[0] + 30, k.sc[1] - 50]);
  return r;
}
function defF(id, o) { ANIMF[id] = Object.assign({ props: [], hl: [], band: false, straightLegs: false, pref: false }, o); ANIMF[id].K = o.keys.map(k => Object.assign({ d: 1, hold: .3 }, resolveF(k), { d: k.d || 1, hold: k.hold ?? .3 })); }
function mixF(A, B, t) {
  const o = {}; ['sc', 'pv', 'hd', 'hl', 'hr', 'fl', 'fr'].forEach(n => { o[n] = lerp2(A[n], B[n], t); }); o.st = lerp(A.st, B.st, t); return o;
}
function figF(p, a) {
  const c = Math.cos(p.st * RAD), s = Math.sin(p.st * RAD), mid = p.sc[0];
  const SL = [p.sc[0] - SWF * c, p.sc[1] + SWF * s], SR = [p.sc[0] + SWF * c, p.sc[1] - SWF * s];
  const HL = [p.pv[0] - HWF, p.pv[1]], HR = [p.pv[0] + HWF, p.pv[1]], head = add(p.sc, p.hd);
  const limb = (P, T, l1, l2) => { const r = ik(P, T, l1, l2, mid, 0); return [P, r.j, r.end]; };
  return { SL, SR, HL, HR, head, aL: limb(SL, p.hl, L.UA, L.FA), aR: limb(SR, p.hr, L.UA, L.FA), lL: a.straightLegs ? [HL, HL, p.fl] : limb(HL, p.fl, L.TH, L.SH), lR: a.straightLegs ? [HR, HR, p.fr] : limb(HR, p.fr, L.TH, L.SH) };
}
const FP = { x: 160, hip: 90, sh: 142 };
/* de pé: tronco reto, 2 braços e 2 pernas simétricos */
const stand = { sc: [160, 142], pv: [160, 90], fl: [148, 4], fr: [172, 4] };

defF('cossack', {
  keys: [Object.assign({}, stand, { sc: [146, 132], pv: [146, 80], fl: [92, 4], fr: [200, 4], hs: [8, -24], d: 1.1, hold: .2 }),
         { sc: [108, 90], pv: [112, 38], fl: [92, 4], fr: [200, 4], hs: [8, -24], d: 1.1, hold: .4 },
         { sc: [146, 132], pv: [146, 80], fl: [92, 4], fr: [200, 4], hs: [8, -24], d: 1.1, hold: .2 },
         { sc: [184, 90], pv: [180, 38], fl: [92, 4], fr: [200, 4], hs: [8, -24], d: 1.1, hold: .4 }],
  hl: ['leg'],
});
defF('lat_leg_swing', {
  keys: [Object.assign({}, stand, { fr: [236, 50], hs: [32, -46], d: 1, hold: .1 }), Object.assign({}, stand, { fr: [112, 42], hs: [32, -46], d: 1, hold: .1 })],
  hl: ['leg'],
});
const PRONE = (sc, st, hl, hr) => ({ sc, pv: [sc[0], sc[1] - 20], st, hd: [0, 16], hl, hr, fl: [sc[0] - 10, 3], fr: [sc[0] + 10, 3] });
defF('archer_pushup', {
  straightLegs: true,
  keys: [Object.assign(PRONE([160, 40], 0, [104, 2], [216, 2]), { d: 1.1, hold: .2 }), Object.assign(PRONE([182, 28], 7, [104, 2], [216, 2]), { d: 1.1, hold: .4 }),
         Object.assign(PRONE([160, 40], 0, [104, 2], [216, 2]), { d: 1.1, hold: .2 }), Object.assign(PRONE([138, 28], -7, [104, 2], [216, 2]), { d: 1.1, hold: .4 })],
  hl: ['arm'],
});
defF('wide_pushup', { straightLegs: true, keys: [Object.assign(PRONE([160, 40], 0, [96, 2], [224, 2]), { d: 1.2, hold: .3 }), Object.assign(PRONE([160, 18], 0, [96, 2], [224, 2]), { d: 1.1, hold: .3 })], hl: ['arm'] });
defF('diamond_pushup', { straightLegs: true, keys: [Object.assign(PRONE([160, 58], 0, [154, 2], [166, 2]), { d: 1.2, hold: .3 }), Object.assign(PRONE([160, 26], 0, [154, 2], [166, 2]), { d: 1.1, hold: .3 })], hl: ['arm'] });
defF('banded_pass', { band: true, keys: [Object.assign({}, stand, { hl: [112, 100], hr: [208, 100], d: 1.6, hold: .3 }), Object.assign({}, stand, { hl: [110, 190], hr: [210, 190], d: 1.6, hold: .4 })], hl: ['arm'], pref: true });
defF('int_rot', { band: true, keys: [Object.assign({}, stand, { hl: [150, 112], hr: [170, 112], d: 1, hold: .4 }), Object.assign({}, stand, { hl: [106, 112], hr: [214, 112], d: 1, hold: .4 })], hl: ['arm'], pref: true });
defF('ext_rot', { band: true, keys: [Object.assign({}, stand, { hl: [106, 112], hr: [214, 112], d: 1, hold: .4 }), Object.assign({}, stand, { hl: [150, 112], hr: [170, 112], d: 1, hold: .4 })], hl: ['arm'], pref: true });
/* cossack e lat_leg_swing: só existem de frente */
['cossack', 'lat_leg_swing', 'archer_pushup'].forEach(id => { ANIMF[id].pref = true; });

/* ───────── desenho ───────── */
const Y = u => G - u, f1 = n => Math.round(n * 10) / 10;
const pts = a => a.map(p => `${f1(p[0])},${f1(Y(p[1]))}`).join(' ');
const NS = 'http://www.w3.org/2000/svg';
function propsSvg(list) {
  return list.map(p => {
    if (p.t === 'box') return `<rect x="${p.x}" y="${Y(p.h)}" width="${p.w}" height="${p.h}" rx="3" fill="var(--surf2)" stroke="var(--line)" stroke-width="2"/>`;
    if (p.t === 'bar') return `<line x1="${p.x + 34}" y1="${Y(p.u)}" x2="${p.x + 34}" y2="${G}" stroke="var(--line)" stroke-width="5" stroke-linecap="round"/><line x1="${p.x - 16}" y1="${Y(p.u)}" x2="${p.x + 34}" y2="${Y(p.u)}" stroke="var(--line)" stroke-width="5" stroke-linecap="round"/><circle cx="${p.x}" cy="${Y(p.u)}" r="5" fill="var(--mut)"/>`;
    if (p.t === 'post') return `<line x1="${p.x}" y1="${Y(p.h)}" x2="${p.x}" y2="${G}" stroke="var(--line)" stroke-width="8" stroke-linecap="round"/>`;
    return '';
  }).join('');
}
const VB = {};
function bounds(id) {
  if (VB[id]) return VB[id];
  const a = ANIM[id]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const add1 = p => { if (!p) return; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, Y(p[1])); y1 = Math.max(y1, Y(p[1])); };
  a.K.forEach(k => { const F = figure(mix(k, k, 0)); [F.head, F.sh, k.hip].forEach(add1); add1([F.head[0] - 12, F.head[1] + 12]); add1([F.head[0] + 12, F.head[1] - 12]); [F.arm, F.arm2, F.leg, F.leg2].forEach(c => c && c.forEach(add1)); });
  a.props.forEach(p => { if (p.t === 'box') { add1([p.x, p.h]); add1([p.x + p.w, 0]); } if (p.t === 'bar') { add1([p.x - 16, p.u]); add1([p.x + 34, 0]); } if (p.t === 'post') { add1([p.x, p.h]); add1([p.x, 0]); } });
  add1([x0, -2]);
  const pad = 22; x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
  let w = x1 - x0, h = y1 - y0; const R = 1.6;
  if (w / h < R) { const nw = h * R; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / R; y0 -= (nh - h) / 2; h = nh; }
  return VB[id] = [x0, y0, w, h];
}
const WID = { ua: 8.6, fa: 7.2, th: 11.5, sh: 9.2, torso: 17, neck: 6 };
function svgS(id, o = {}) {
  const a = ANIM[id]; if (!a) return '';
  const [vx, vy, vw, vh] = bounds(id), sw = Math.sqrt(vw / 320);
  const ln = (c, w, extra = '') => `<line class="${c}" stroke-width="${f1(w * sw)}" stroke-linecap="round" ${extra} x1="0" y1="0" x2="0" y2="0"/>`;
  const limb = (k, w1, w2) => `<g class="${k}">${ln('o1', w1 + 3.4, 'stroke="var(--surf)"')}${ln('o2', w2 + 3.4, 'stroke="var(--surf)"')}${ln('f1', w1)}${ln('f2', w2)}</g>`;
  const hand = k => `<g class="${k}h"><circle class="o" r="${f1(7.4 * sw)}" fill="var(--surf)"/><circle class="f" r="${f1(4.6 * sw)}"/></g>`;
  const foot = k => `<g class="${k}f">${ln('o', 8.6 + 3.4, 'stroke="var(--surf)"')}${ln('f', 7.6)}</g>`;
  return `<svg class="anim" data-anim="${id}" ${o.still ? `data-still="1"` : ''} ${o.key !== undefined ? `data-key="${o.key}"` : ''} viewBox="${f1(vx)} ${f1(vy)} ${f1(vw)} ${f1(vh)}" role="img" aria-label="Ilustração da execução" style="--far:color-mix(in srgb,var(--ink) 38%,var(--surf))">
   <line x1="${f1(vx + 8)}" y1="${G + 4}" x2="${f1(vx + vw - 8)}" y2="${G + 4}" stroke="var(--line)" stroke-width="${f1(3 * sw)}" stroke-linecap="round"/>
   <ellipse class="shadow" cx="0" cy="${G + 4}" rx="${f1(54 * sw)}" ry="${f1(4.5 * sw)}" fill="var(--line)" opacity=".55"/>
   ${propsSvg(a.props)}
   <polyline class="band" fill="none" stroke="var(--acc)" stroke-width="${f1(2.6 * sw)}" stroke-dasharray="6 4" opacity=".85" points=""/>
   ${limb('leg2', WID.th, WID.sh)}${foot('leg2')}${limb('arm2', WID.ua, WID.fa)}${hand('arm2')}
   ${ln('torso-o', WID.torso + 3.4, 'stroke="var(--surf)"')}${ln('torso', WID.torso)}
   ${limb('leg', WID.th, WID.sh)}${foot('leg')}${limb('arm', WID.ua, WID.fa)}${hand('arm')}
   ${ln('neck', WID.neck)}
   <circle class="head" r="${f1(10.5 * sw)}" fill="var(--surf)" stroke="var(--ink)" stroke-width="${f1(4.4 * sw)}"/>
   <circle class="eye" r="${f1(2.1 * sw)}" fill="var(--ink)"/>
  </svg>`;
}
function paint(el, p) {
  const a = ANIM[el.dataset.anim], F = figure(p), hl = a.hl, R = el._r || (el._r = {});
  const g = s => R[s] || (R[s] = el.querySelector('.' + s));
  const setL = (n, x1, y1, x2, y2) => { const e = g(n); e.setAttribute('x1', f1(x1)); e.setAttribute('y1', f1(Y(y1))); e.setAttribute('x2', f1(x2)); e.setAttribute('y2', f1(Y(y2))); };
  const col = (base, far) => far ? 'var(--far)' : hl.includes(base) ? 'var(--acc)' : 'var(--ink)';
  const limb = (k, pts, far, base) => {
    const gp = g(k); if (!pts) { gp.style.display = 'none'; return; } gp.style.display = '';
    setL(k + ' .o1', pts[0][0], pts[0][1], pts[1][0], pts[1][1]); setL(k + ' .f1', pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
    setL(k + ' .o2', pts[1][0], pts[1][1], pts[2][0], pts[2][1]); setL(k + ' .f2', pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
    g(k + ' .f1').setAttribute('stroke', col(base, far)); g(k + ' .f2').setAttribute('stroke', col(base, far));
  };
  // seletores compostos: cache por string
  const sel = (k, c) => { const key = k + c; return R[key] || (R[key] = el.querySelector('.' + k + ' ' + c)); };
  const limb2 = (k, pts, far, base) => {
    const gp = el.querySelector('.' + k); if (!pts) { gp.style.display = 'none'; return; } gp.style.display = '';
    const S = (c, i, j) => { const e = sel(k, c); e.setAttribute('x1', f1(pts[i][0])); e.setAttribute('y1', f1(Y(pts[i][1]))); e.setAttribute('x2', f1(pts[j][0])); e.setAttribute('y2', f1(Y(pts[j][1]))); return e; };
    S('.o1', 0, 1); S('.o2', 1, 2); S('.f1', 0, 1).setAttribute('stroke', col(base, far)); S('.f2', 1, 2).setAttribute('stroke', col(base, far));
  };
  limb2('leg2', F.leg2, true, 'leg'); limb2('arm2', F.arm2, true, 'arm'); limb2('leg', F.leg, false, 'leg'); limb2('arm', F.arm, false, 'arm');
  const hnd = (k, pts, far) => { const e = el.querySelector('.' + k + 'h'); if (!pts) { e.style.display = 'none'; return; } e.style.display = ''; const c = pts[2]; e.querySelectorAll('circle').forEach(x => { x.setAttribute('cx', f1(c[0])); x.setAttribute('cy', f1(Y(c[1]))); }); e.querySelector('.f').setAttribute('fill', col('arm', far)); };
  hnd('arm2', F.arm2, true); hnd('arm', F.arm, false);
  const fut = (k, pts, fd, far) => { const e = el.querySelector('.' + k + 'f'); if (!pts || !fd) { e.style.display = 'none'; return; } e.style.display = ''; const c = pts[2], t = [c[0] + fd[0] * 11, c[1] + fd[1] * 11]; e.querySelectorAll('line').forEach(l => { l.setAttribute('x1', f1(c[0])); l.setAttribute('y1', f1(Y(c[1]))); l.setAttribute('x2', f1(t[0])); l.setAttribute('y2', f1(Y(t[1]))); }); e.querySelector('.f').setAttribute('stroke', col('leg', far)); };
  fut('leg2', F.leg2, F.fd2, true); fut('leg', F.leg, F.fd, false);
  const T = (c) => { const e = el.querySelector('.' + c); e.setAttribute('x1', f1(p.hip[0])); e.setAttribute('y1', f1(Y(p.hip[1]))); e.setAttribute('x2', f1(F.sh[0])); e.setAttribute('y2', f1(Y(F.sh[1]))); return e; };
  T('torso-o'); T('torso').setAttribute('stroke', col('torso', false));
  const nk = el.querySelector('.neck'); nk.setAttribute('x1', f1(F.sh[0])); nk.setAttribute('y1', f1(Y(F.sh[1]))); nk.setAttribute('x2', f1(F.head[0])); nk.setAttribute('y2', f1(Y(F.head[1]))); nk.setAttribute('stroke', 'var(--ink)');
  const h = el.querySelector('.head'); h.setAttribute('cx', f1(F.head[0])); h.setAttribute('cy', f1(Y(F.head[1])));
  const ey = el.querySelector('.eye'); ey.setAttribute('cx', f1(F.head[0] + F.face[0] * 4.2)); ey.setAttribute('cy', f1(Y(F.head[1] + F.face[1] * 4.2 + 1)));
  const sd = el.querySelector('.shadow'); sd.setAttribute('cx', f1((p.hip[0] + F.sh[0]) / 2));
  const bd = a.props.find(x => x.t === 'band'), b = el.querySelector('.band');
  if (bd) { const from = F.arm && F.arm[2], to = F.leg && F.leg[2]; const anchor = a.props.find(x => x.t === 'bar'); b.setAttribute('points', from && to ? pts([anchor ? [anchor.x, anchor.u] : from, to]) : ''); } else b.setAttribute('points', '');
}
/* auditoria: quadros em que o apoio fica fora do alcance (membro esticaria demais) ou o cotovelo/joelho dobra demais */
function audit() {
  const out = [];
  Object.keys(ANIM).forEach(id => { const K = ANIM[id].K; for (let i = 0; i < K.length; i++) for (const t of [0, .25, .5, .75]) { const F = figure(mix(K[i], K[(i + 1) % K.length], t)); [['joelho', F.leg], ['joelho(2)', F.leg2]].forEach(([n, c]) => { if (c && flexOk(c[0], c[1], c[2], 'k') < -60) out.push(`${id}[${i}+${t}] ${n} DOBRA PARA O LADO ERRADO`); }); [['cotovelo', F.arm], ['cotovelo(2)', F.arm2]].forEach(([n, c]) => { if (c && flexOk(c[0], c[1], c[2], 'e') < -60) out.push(`${id}[${i}+${t}] ${n} DOBRA PARA O LADO ERRADO`); }); } });
  Object.keys(ANIM).forEach(id => ANIM[id].K.forEach((k, i) => {
    const F = figure(mix(k, k, 0));
    [['braço', F.q.arm], ['perna', F.q.leg]].forEach(([n, r]) => { if (r && r.k > 1.04) out.push(`${id}[${i}] ${n} esticado x${r.k.toFixed(2)} (d=${r.d.toFixed(0)} / ${r.sum})`); if (r && r.sum > 1 && r.d < r.sum * .22) out.push(`${id}[${i}] ${n} dobrado demais (d=${r.d.toFixed(0)})`); });
  }));
  return out;
}

/* ───────── desenho: visão de frente ───────── */
function fitBox(x0, x1, y0, y1) {
  const pad = 22; x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
  let w = x1 - x0, h = y1 - y0; const R = 1.6;
  if (w / h < R) { const nw = h * R; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / R; y0 -= (nh - h) / 2; h = nh; }
  return [x0, y0, w, h];
}
const VBF = {};
function boundsF(id) {
  if (VBF[id]) return VBF[id];
  const a = ANIMF[id]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  const add1 = p => { if (!p) return; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, Y(p[1])); y1 = Math.max(y1, Y(p[1])); };
  a.K.forEach(k => { const F = figF(k, a); [F.SL, F.SR, F.head, [F.head[0] - 12, F.head[1] + 12], [F.head[0] + 12, F.head[1] - 12]].forEach(add1); (a.straightLegs ? [F.aL, F.aR] : [F.aL, F.aR, F.lL, F.lR]).forEach(c => c.forEach(add1)); if (!a.straightLegs) [F.HL, F.HR].forEach(add1); });
  add1([x0, -2]);
  return VBF[id] = fitBox(x0, x1, y0, y1);
}
function svgF(id, o = {}) {
  const a = ANIMF[id]; if (!a) return '';
  const [vx, vy, vw, vh] = boundsF(id), sw = Math.sqrt(vw / 320);
  const ln = (c, w, extra = '') => `<line class="${c}" stroke-width="${f1(w * sw)}" stroke-linecap="round" ${extra} x1="0" y1="0" x2="0" y2="0"/>`;
  const limb = (k, w1, w2) => `<g class="${k}">${ln('o1', w1 + 3.4, 'stroke="var(--surf)"')}${ln('o2', w2 + 3.4, 'stroke="var(--surf)"')}${ln('f1', w1)}${ln('f2', w2)}</g>`;
  const hand = k => `<g class="${k}h"><circle class="o" r="${f1(7.4 * sw)}" fill="var(--surf)"/><circle class="f" r="${f1(4.6 * sw)}"/></g>`;
  const foot = k => `<g class="${k}f">${ln('o', 12, 'stroke="var(--surf)"')}${ln('f', 7.6)}</g>`;
  const bar = (c, w) => ln(c + '-o', w + 3.4, 'stroke="var(--surf)"') + ln(c, w);
  return `<svg class="anim" data-anim="${id}" data-view="f" ${o.still ? `data-still="1"` : ''} ${o.key !== undefined ? `data-key="${o.key}"` : ''} viewBox="${f1(vx)} ${f1(vy)} ${f1(vw)} ${f1(vh)}" role="img" aria-label="Ilustração da execução (de frente)" style="--far:color-mix(in srgb,var(--ink) 38%,var(--surf))">
   <line x1="${f1(vx + 8)}" y1="${G + 4}" x2="${f1(vx + vw - 8)}" y2="${G + 4}" stroke="var(--line)" stroke-width="${f1(3 * sw)}" stroke-linecap="round"/>
   <ellipse class="shadow" cx="160" cy="${G + 4}" rx="${f1(54 * sw)}" ry="${f1(4.5 * sw)}" fill="var(--line)" opacity=".55"/>
   <polyline class="band" fill="none" stroke="var(--acc)" stroke-width="${f1(2.8 * sw)}" stroke-dasharray="6 4" opacity=".9" points=""/>
   ${limb('lL', WID.th, WID.sh)}${foot('lL')}${limb('lR', WID.th, WID.sh)}${foot('lR')}
   ${bar('hips', 13)}${bar('torso', 17)}${bar('shoulders', 13)}
   ${limb('aL', WID.ua, WID.fa)}${hand('aL')}${limb('aR', WID.ua, WID.fa)}${hand('aR')}
   ${ln('neck', WID.neck)}
   <circle class="head" r="${f1(10.5 * sw)}" fill="var(--surf)" stroke="var(--ink)" stroke-width="${f1(4.4 * sw)}"/>
   <circle class="eyeL" r="${f1(2 * sw)}" fill="var(--ink)"/><circle class="eyeR" r="${f1(2 * sw)}" fill="var(--ink)"/>
  </svg>`;
}
function paintF(el, p) {
  const a = ANIMF[el.dataset.anim], F = figF(p, a), hl = a.hl, R = el._r || (el._r = {});
  const q = (k, c) => { const key = k + c; return R[key] || (R[key] = el.querySelector('.' + k + (c ? ' ' + c : ''))); };
  const setLn = (e, A, B) => { e.setAttribute('x1', f1(A[0])); e.setAttribute('y1', f1(Y(A[1]))); e.setAttribute('x2', f1(B[0])); e.setAttribute('y2', f1(Y(B[1]))); };
  const col = base => hl.includes(base) ? 'var(--acc)' : 'var(--ink)';
  const limb = (k, pts, base) => { setLn(q(k, '.o1'), pts[0], pts[1]); setLn(q(k, '.o2'), pts[1], pts[2]); setLn(q(k, '.f1'), pts[0], pts[1]); setLn(q(k, '.f2'), pts[1], pts[2]); q(k, '.f1').setAttribute('stroke', col(base)); q(k, '.f2').setAttribute('stroke', col(base)); };
  const hide = !!a.straightLegs; ['lL', 'lR', 'lLf', 'lRf', 'hips', 'hips-o'].forEach(k => { const e = el.querySelector('.' + k); if (e) e.style.display = hide ? 'none' : ''; });
  limb('lL', F.lL, 'leg'); limb('lR', F.lR, 'leg'); limb('aL', F.aL, 'arm'); limb('aR', F.aR, 'arm');
  [['aL', F.aL], ['aR', F.aR]].forEach(([k, pts]) => { const e = q(k + 'h', ''); e.querySelectorAll('circle').forEach(c => { c.setAttribute('cx', f1(pts[2][0])); c.setAttribute('cy', f1(Y(pts[2][1]))); }); q(k + 'h', '.f').setAttribute('fill', col('arm')); });
  [['lL', F.lL, -1], ['lR', F.lR, 1]].forEach(([k, pts, dir]) => { const e = q(k + 'f', ''); const c = pts[2], t = [c[0] + dir * 10, c[1]]; e.querySelectorAll('line').forEach(l => setLn(l, c, t)); q(k + 'f', '.f').setAttribute('stroke', col('leg')); });
  setLn(q('hips-o', ''), F.HL, F.HR); setLn(q('hips', ''), F.HL, F.HR); q('hips', '').setAttribute('stroke', col('leg'));
  const mid = [(F.SL[0] + F.SR[0]) / 2, (F.SL[1] + F.SR[1]) / 2], pm = [(F.HL[0] + F.HR[0]) / 2, (F.HL[1] + F.HR[1]) / 2];
  setLn(q('torso-o', ''), pm, mid); setLn(q('torso', ''), pm, mid); q('torso', '').setAttribute('stroke', col('torso'));
  setLn(q('shoulders-o', ''), F.SL, F.SR); setLn(q('shoulders', ''), F.SL, F.SR); q('shoulders', '').setAttribute('stroke', col('arm'));
  setLn(q('neck', ''), mid, F.head); q('neck', '').setAttribute('stroke', 'var(--ink)');
  const h = q('head', ''); h.setAttribute('cx', f1(F.head[0])); h.setAttribute('cy', f1(Y(F.head[1])));
  [['eyeL', -3.8], ['eyeR', 3.8]].forEach(([c, dx]) => { const e = q(c, ''); e.setAttribute('cx', f1(F.head[0] + dx)); e.setAttribute('cy', f1(Y(F.head[1] + 1.5))); });
  q('shadow', '').setAttribute('cx', f1(pm[0]));
  const b = q('band', ''); if (a.band) b.setAttribute('points', pts([F.aL[2], F.aR[2]])); else b.setAttribute('points', '');
}

function frame(K, tSec, mx) {
  const n = K.length; let total = 0; K.forEach(k => total += (k.d || 1) + (k.hold || .2));
  let t = tSec % total;
  for (let i = 0; i < n; i++) {
    const k = K[i], hold = k.hold || .2, d = k.d || 1;
    if (t < hold) return mx(k, k, 0); t -= hold;
    if (t < d) return mx(k, K[(i + 1) % n], ease(t / d)); t -= d;
  }
  return mx(K[0], K[0], 0);
}
let raf = 0; const t0 = performance.now(); const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop() {
  const t = (performance.now() - t0) / 1000;
  document.querySelectorAll('svg[data-anim]').forEach(el => {
    const id = el.dataset.anim, fr = el.dataset.view === 'f', a = fr ? ANIMF[id] : ANIM[id]; if (!a) return;
    const mx = fr ? mixF : mix, pt = fr ? paintF : paint;
    if (el.dataset.ok && (el.dataset.still || reduce)) return;
    if (el.dataset.key !== undefined) { const k = a.K[+el.dataset.key]; pt(el, mx(k, k, 0)); el.dataset.ok = 1; return; }
    pt(el, el.dataset.still || reduce ? mx(a.K[0], a.K[0], 0) : frame(a.K, t, mx)); el.dataset.ok = 1;
  });
  raf = requestAnimationFrame(loop);
}
const svg = (id, o = {}) => { const f = (o.view === 'f' || !ANIM[id]) && ANIMF[id]; return f ? svgF(id, o) : svgS(id, o); };
window.Anim = {
  audit, svg, ids: () => Object.keys(Object.assign({}, ANIM, ANIMF)),
  has: id => !!ANIM[id] || !!ANIMF[id], hasSide: id => !!ANIM[id], hasFront: id => !!ANIMF[id],
  pref: id => !!ANIMF[id] && (!ANIM[id] || ANIMF[id].pref),
  start() { if (!raf) loop(); },
};
Anim.start();
})();
