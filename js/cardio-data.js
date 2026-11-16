/* Conteúdo de cardio: estágios de corrida, preparação, desaquecimento, escalas de percepção e textos.
   Faixas são SUGESTÕES de referência (plano inicial), não metas obrigatórias. */

CATS.cardio = { n: 'Cardio', pt: 'Corrida e caminhada', c: '#ff5d8f' };

/* ───── exercícios novos (aparecem na Biblioteca e na Galeria) ───── */
ex('ankle_rot', {
  en: 'Ankle Rotations', pt: 'Rotações de tornozelo', cat: 'cardio', pat: null, mini: true,
  mus: ['Tornozelos', 'Panturrilha'],
  what: 'Mobilidade leve de tornozelo antes de correr. Faz parte da preparação de referência do plano.',
  steps: ['Em pé, com apoio na parede ou numa cadeira, apoie a ponta de um pé no chão.', 'Faça círculos lentos com o tornozelo, 8–10 em cada direção.', 'Troque de pé. Movimento solto, sem forçar.'],
  err: ['Girar a perna toda em vez do tornozelo', 'Forçar amplitude'], easy: [], hard: [], vars: [],
});
ex('brisk_walk', {
  en: 'Brisk Walking', pt: 'Caminhada acelerada', cat: 'cardio', pat: null, mini: true,
  mus: ['Pernas', 'Sistema cardiorrespiratório'],
  what: 'Última etapa da preparação: 3–5 minutos de caminhada em passo firme, para elevar aos poucos a frequência cardíaca antes do trote.',
  steps: ['Passos firmes, um pouco mais rápidos que o normal.', 'Respiração um pouco mais funda, mas ainda dá para conversar.', 'Postura alta, braços soltos balançando de forma natural.'],
  err: ['Começar o trote sem transição', 'Passos longos demais'], easy: [], hard: [], vars: [],
});
ex('easy_jog', {
  en: 'Easy Jog', pt: 'Trote leve', cat: 'cardio', pat: null, mini: true,
  mus: ['Pernas', 'Sistema cardiorrespiratório'],
  what: 'Ritmo de trote confortável: esforço leve a moderado (~3–4/10). Teste da fala: você consegue conversar em frases completas. Se não consegue, diminua o ritmo ou alterne com caminhada.',
  steps: ['Passada curta e relaxada; os pés caem perto de baixo do corpo.', 'Tronco ereto, olhar à frente, ombros soltos.', 'Respire de forma natural; sem forçar o ritmo.'],
  err: ['Começar rápido demais', 'Passos longos que "freiam" o corpo', 'Ignorar dor: dor aguda ou articular → pare'], easy: ['Alternar trote e caminhada'], hard: [], vars: [],
});
ex('cool_walk', {
  en: 'Cooldown Walk', pt: 'Caminhada de desaceleração', cat: 'cardio', pat: null, mini: true,
  mus: ['Pernas', 'Sistema cardiorrespiratório'],
  what: 'Depois da corrida, 3–5 minutos de caminhada leve ajudam a respiração e os batimentos a voltarem ao normal de forma gradual.',
  steps: ['Reduza o ritmo aos poucos até uma caminhada tranquila.', 'Respire fundo e solte os ombros.'], err: ['Parar de repente e sentar'], easy: [], hard: [], vars: [],
});

/* ───── preparação e desaquecimento da corrida ───── */
const RUN_PREP = [
  ['ankle_rot', '8–10 por direção, cada pé'], ['hip_circles', '8–10 por direção'], ['hip_openers', '6–8 por perna'],
  ['leg_swing', '10 por perna'], ['lat_leg_swing', '10 por perna'], ['brisk_walk', '3–5 min'],
];
const RUN_COOL = [
  ['cool_walk', '3–5 min leves'], ['calf_stretch', '20–30 s por perna · opcional'], ['quad_stretch', '20–30 s por perna · opcional'],
  ['hip_flexor', '20–30 s por lado · opcional'], ['seated_ham', '20–30 s por perna · opcional'],
];
const RUN_PREP_NOTE = 'Os primeiros 5 minutos do trote também são aquecimento: comece bem leve. Nenhuma preparação deve cansar.';
const RUN_COOL_NOTE = 'Alongar é para conforto e mobilidade. Não há prova forte de que evite dor ou lesão; faça só se for agradável, sem dor.';

/* ───── estágios de corrida (você escolhe; o app só sugere avançar) ───── */
const RUN_STAGES = [
  { id: 'r1', n: 'R1', min: [15, 25], freq: '2× por semana', d: 'Reencontrar o ritmo com folga.' },
  { id: 'r2', n: 'R2', min: [20, 30], freq: '2–3× por semana', d: 'Um pouco mais de tempo, mesmo esforço.' },
  { id: 'r3', n: 'R3', min: [25, 35], freq: '2–3× por semana', d: 'Construindo resistência.' },
  { id: 'r4', n: 'R4', min: [30, 40], freq: '2–3× por semana', d: 'Base aeróbica consolidada.' },
];
const RUN_ADVANCE = 'Avance quando as últimas corridas forem fáceis (esforço 4 ou menos, teste da fala ok), as pernas estiverem bem, sem dor e sem comprometer os treinos de calistenia, o trabalho e os estudos. Não há data: só avance se fizer sentido.';
const RUN_RULES = [
  'Esforço leve a moderado (~3–4 de 10): dá para conversar em frases completas.',
  'Aumente só uma coisa por vez (tempo OU frequência), e aos poucos.',
  'Dor aguda ou articular, tontura ou mal-estar: pare. Se persistir, procure orientação profissional.',
  'Quando a calistenia estiver pesada ou você dormir mal, corra mais curto/leve ou caminhe. Não é falha.',
];

/* ───── escalas de percepção (todas opcionais) ───── */
const SC5 = { mood: ['😞', '😕', '😐', '🙂', '😄'], energy: ['🪫', '🔋', '⚡', '⚡', '⚡'], stress: ['😌', '🙂', '😐', '😟', '😣'], lvl: ['1', '2', '3', '4', '5'] };
const PERC = {
  walkPre: [['mood', 'Humor', SC5.mood], ['energy', 'Energia', ['1', '2', '3', '4', '5']], ['stress', 'Estresse', ['1', '2', '3', '4', '5']]],
  walkPost: [['mood', 'Humor', SC5.mood], ['energy', 'Energia', ['1', '2', '3', '4', '5']], ['stress', 'Estresse', ['1', '2', '3', '4', '5']],
    ['clarity', 'Clareza mental', ['1', '2', '3', '4', '5']], ['focus', 'Concentração', ['1', '2', '3', '4', '5']], ['motivation', 'Motivação', ['1', '2', '3', '4', '5']], ['ready', 'Disposição p/ trabalhar e estudar', ['1', '2', '3', '4', '5']]],
  runPre: [['legs', 'Pernas hoje (1 leves · 5 pesadas)', ['1', '2', '3', '4', '5']], ['energy', 'Energia', ['1', '2', '3', '4', '5']]],
  runPost: [['legs', 'Cansaço nas pernas', ['1', '2', '3', '4', '5']], ['breath', 'Respiração (1 fácil · 5 ofegante)', ['1', '2', '3', '4', '5']], ['fatigue', 'Fadiga geral', ['1', '2', '3', '4', '5']], ['easy', 'Facilidade (1 difícil · 5 fácil)', ['1', '2', '3', '4', '5']], ['recov', 'Sensação de recuperação', ['1', '2', '3', '4', '5']]],
};
const WALK_FIELDS = { mood: 'Humor', energy: 'Energia', stress: 'Estresse', clarity: 'Clareza', focus: 'Concentração', motivation: 'Motivação', ready: 'Disposição' };
const DISCOMFORT = ['Joelho', 'Tornozelo', 'Canela', 'Panturrilha', 'Quadril', 'Lombar', 'Pé', 'Outro'];
const RPE_TXT = ['Repouso', 'Muito leve', 'Leve', 'Leve+', 'Moderado−', 'Moderado', 'Moderado+', 'Forte', 'Muito forte', 'Quase máximo', 'Máximo'];

const CARDIO_SCIENCE = []; /* referências só entram aqui depois de verificadas (links reais). */
