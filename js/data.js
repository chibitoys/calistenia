/* Conteúdo do app — baseado em 01_planejamento (rotina V2.0) e nas fontes Yvguo / Leo Wang.
   Tudo aqui é editável. Nada daqui é resultado real do usuário. */

const YV = '1mlN0yuxoLE', LEO = 'vczr0WuYK9g';
const vid = (who, mm, ss, label) => ({ id: who === 'Leo' ? LEO : YV, who, t: mm * 60 + ss, at: `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`, label });

const CATS = {
  push: { n: 'Push', pt: 'Empurrar', c: '#ff7a45' },
  pull: { n: 'Pull', pt: 'Puxar', c: '#4aa8ff' },
  legs: { n: 'Legs', pt: 'Pernas', c: '#5fd38d' },
  core: { n: 'Core', pt: 'Core', c: '#c58bff' },
  warm: { n: 'Aquecer', pt: 'Aquecimento e mobilidade', c: '#ffc247' },
  stretch: { n: 'Alongar', pt: 'Alongamentos', c: '#6fd6d0' },
};

/* pattern → usado no volume semanal */
const PATTERNS = {
  pushH:   { n: 'Empurrar horizontal', t: 5 },
  pushUp:  { n: 'Empurrar acima da cabeça', t: 5 },
  pushDn:  { n: 'Empurrar para baixo (fundos)', t: 5 },
  pullV:   { n: 'Puxar vertical', t: 5 },
  pullH:   { n: 'Puxar horizontal', t: 6 },
  uni:     { n: 'Agachamento unilateral', t: 6 },
  knee:    { n: 'Flexão de joelho (posteriores)', t: 5 },
  bridge:  { n: 'Ponte de glúteos', t: 2 },
  calf:    { n: 'Panturrilhas', t: 4 },
  core:    { n: 'Core', t: 8 },
};

const EX = {};
function ex(id, o) { EX[id] = Object.assign({ id, unit: 'reps', steps: [], err: [], easy: [], hard: [], vars: [], vid: [] }, o); }

/* ───────────── PUSH ───────────── */
ex('incline_pike', {
  en: 'Incline Pike Push-up', pt: 'Flexão Pike facilitada (mãos elevadas)', cat: 'push', pat: 'pushUp',
  mus: ['Ombros (deltoide anterior)', 'Tríceps', 'Peitoral superior', 'Trapézio/serrátil'],
  what: 'Empurrar acima da cabeça com carga menor. É a porta de entrada para a Pike completa e, no futuro, para a flexão de parada de mão.',
  steps: ['Mãos em superfície firme e elevada (banco, degrau, barra baixa), quadril alto em V invertido; joelhos podem dobrar.',
          'Desça levando a cabeça à frente e para baixo, entre as mãos, com cotovelos sem abrir demais (~45°).',
          'Empurre e eleve as escápulas no topo ("empurrar o teto").',
          'Descida de ~2 s. Padronize a distância mãos–pés para comparar sessões.'],
  err: ['Forçar joelhos retos e perder o quadril alto', 'Cotovelos muito abertos', 'Descer reto como flexão normal, sem levar a cabeça à frente', 'Apoio instável'],
  easy: ['Aumentar a altura do apoio', 'Reduzir a amplitude', 'Joelhos dobrados'], hard: ['Pike no chão', 'Pike com pés elevados'],
  vars: ['Apoio alto', 'Apoio médio', 'Joelhos dobrados', 'Amplitude parcial'],
  vid: [vid('Leo', 8, 11, 'Pike Push-up'), vid('Yvguo', 5, 23, 'Pike Push-up')],
});
ex('pike', {
  en: 'Pike Push-up', pt: 'Flexão Pike', cat: 'push', pat: 'pushUp',
  mus: ['Ombros (deltoide anterior)', 'Tríceps', 'Peitoral superior', 'Serrátil/trapézio'],
  what: 'Seu movimento mais técnico e o primeiro da sessão Push A, quando você está mais descansado. Pernas estendidas com quadril flexionado exigem mobilidade dos posteriores de coxa: não force.',
  steps: ['Mãos no chão (ou elevadas se precisar), quadril alto, cabeça entre os braços.',
          'Aproxime os pés das mãos gradualmente, conforme sua mobilidade permitir.',
          'Desça com a cabeça à frente e abaixo; cotovelos sem abrir demais.',
          'No topo, eleve as escápulas (encolher levemente os ombros para o teto).'],
  err: ['Forçar pernas retas com lombar arredondada', 'Posições diferentes a cada série', 'Cotovelos abertos', 'Não elevar escápulas no topo'],
  easy: ['Mãos elevadas', 'Joelhos dobrados', 'Pike facilitada (apoio alto)'], hard: ['Pés elevados', 'Pike com pausa embaixo'],
  vars: ['Mãos elevadas', 'No chão', 'Joelhos dobrados', 'Pés elevados'],
  vid: [vid('Leo', 8, 11, 'Pike Push-up'), vid('Yvguo', 5, 23, 'Pike Push-up')],
});
ex('dips', {
  en: 'Straight Bar Dips', pt: 'Fundos na barra reta', cat: 'push', pat: 'pushDn',
  mus: ['Tríceps', 'Peitoral inferior', 'Ombros anteriores'],
  what: 'Empurrar "para baixo", apoiado acima da barra. As fontes demonstram paralelas; a barra reta é uma adaptação do plano. A barra precisa ser segura e fixa para sua carga.',
  steps: ['Posicione-se acima da barra, braços estendidos, ombros estáveis e longe das orelhas.',
          'Incline levemente o tronco e desça com controle, só até uma amplitude confortável.',
          'Empurre para subir sem balançar.'],
  err: ['Balançar o corpo', 'Descer além do que o ombro tolera', 'Ombros encolhidos junto às orelhas', 'Usar barra instável ou sem acesso seguro'],
  easy: ['Sustentação na barra (Support Hold)', 'Apoio parcial dos pés'], hard: ['Mais repetições', 'Pausa embaixo'],
  vars: ['Estrito', 'Com apoio dos pés', 'Amplitude parcial'],
  vid: [vid('Yvguo', 4, 57, 'Dips (técnica geral — paralelas)'), vid('Leo', 7, 0, 'Dips (técnica geral — paralelas)')],
  note: 'Os vídeos mostram paralelas, não barra reta. Use como referência de técnica geral. Se a barra não for apropriada, omita o movimento — não improvise.',
});
ex('dip_hold', {
  en: 'Straight Bar Support Hold', pt: 'Sustentação na barra reta', cat: 'push', pat: 'pushDn', unit: 's',
  mus: ['Tríceps', 'Depressores da escápula', 'Core'],
  what: 'Ficar sustentado com braços estendidos aprende a "depressão escapular" (ombros longe das orelhas) antes de descer nos fundos.',
  steps: ['Suba com braços estendidos acima da barra.', 'Abaixe os ombros (depressão), afastando-os das orelhas.', 'Sustente, com apoio dos pés se possível; deixe alguns segundos em reserva.'],
  err: ['Ombros encolhidos', 'Segurar até tremer', 'Barra instável'],
  easy: ['Apoio dos pés', 'Menos segundos'], hard: ['Fundos curtos', 'Fundos completos'], vars: ['Com apoio dos pés', 'Sem apoio'],
  vid: [vid('Yvguo', 4, 57, 'Sustentação (paralelas)'), vid('Leo', 7, 0, 'Sustentação (paralelas)')],
});
ex('decline', {
  en: 'Decline Push-up', pt: 'Flexão com pés elevados', cat: 'push', pat: 'pushH',
  mus: ['Peitoral superior', 'Ombros anteriores', 'Tríceps', 'Serrátil'],
  what: 'Flexão com carga maior sobre ombros e peitoral superior. Fica para a fase de reconstrução (não na semana 1).',
  steps: ['Pés em apoio firme, corpo alinhado, abdômen e glúteos ativos.', 'Escápulas retraem na descida e protraem na subida (empurre o chão).', 'Cotovelos sem abrir demais.'],
  err: ['Quadril caído', 'Cabeça projetada à frente', 'Apoio dos pés instável'],
  easy: ['Flexão tradicional', 'Flexão inclinada'], hard: ['Pés mais altos', 'Mais reps / pausa'],
  vars: ['Pés baixos', 'Pés médios', 'Pés altos'],
  vid: [vid('Yvguo', 4, 30, 'Decline Push-up'), vid('Leo', 6, 36, 'Decline Push-up')],
});
ex('pushup', {
  en: 'Push-up', pt: 'Flexão tradicional', cat: 'push', pat: 'pushH',
  mus: ['Peitoral', 'Tríceps', 'Ombros anteriores', 'Serrátil anterior', 'Core'],
  what: 'O padrão de empurrar horizontal. Também é a melhor aula de protração/retração escapular.',
  steps: ['Mãos um pouco mais largas que os ombros; abdômen e glúteos contraídos, corpo em linha reta.', 'Desça com as escápulas se aproximando naturalmente (retração).', 'Suba empurrando o chão e afastando as escápulas (protração).'],
  err: ['Abrir demais os cotovelos', 'Quadril caindo', 'Projetar a cabeça', 'Meia amplitude sem controle'],
  easy: ['Flexão inclinada (mãos elevadas)', 'Joelhos no chão'], hard: ['Flexão declinada', 'Com pausa', 'Archer (futuro)'],
  vars: ['Tradicional', 'Inclinada', 'Joelhos apoiados', 'Declinada'],
  vid: [vid('Leo', 5, 23, 'Push-up e regressões'), vid('Yvguo', 2, 48, 'Push-up')],
});
ex('incline_pushup', {
  en: 'Incline Push-up', pt: 'Flexão inclinada', cat: 'push', pat: 'pushH',
  mus: ['Peitoral', 'Tríceps', 'Ombros anteriores'],
  what: 'Flexão com as mãos elevadas: mesma técnica, menos carga. Boa para ramp-up e regressão.',
  steps: ['Mãos em apoio firme (mesa, banco, barra baixa).', 'Corpo em linha reta; desça e suba controlando as escápulas.'],
  err: ['Apoio que escorrega', 'Quadril empinado ou caído'], easy: ['Apoio mais alto'], hard: ['Apoio mais baixo', 'Flexão tradicional'], vars: ['Apoio alto', 'Apoio médio'],
  vid: [vid('Leo', 5, 23, 'Regressões da flexão')],
});
ex('scap_pushup', {
  en: 'Scapular Push-up', pt: 'Flexão escapular', cat: 'push', pat: null,
  mus: ['Serrátil anterior', 'Trapézio', 'Romboides'],
  what: 'Treina o controle das escápulas com cotovelos estendidos. Ensina protração/retração sem dobrar os braços.',
  steps: ['Em prancha (ou joelhos), braços retos.', 'Deixe o peito "afundar" aproximando as escápulas (retração).', 'Empurre o chão afastando-as (protração). Os cotovelos não dobram.'],
  err: ['Dobrar os cotovelos', 'Mover o quadril em vez das escápulas'], easy: ['Joelhos no chão'], hard: ['Em flexão declinada'], vars: ['Prancha', 'Joelhos'],
  vid: [vid('Yvguo', 3, 17, 'Scapular Push-up')],
});

/* ───────────── PULL ───────────── */
ex('pullup', {
  en: 'Pull-up', pt: 'Barra fixa pronada', cat: 'pull', pat: 'pullV',
  mus: ['Latíssimo do dorso', 'Bíceps', 'Deltoide posterior', 'Romboides/trapézio inferior'],
  what: 'Puxar vertical. Braços estendidos embaixo, queixo acima da barra em cima, sem impulso.',
  steps: ['Comece com braços estendidos e ombros ativos (active hang).', 'Puxe levando o peito à barra; queixo acima sem projetar o pescoço.', 'Desça controlando até os braços estendidos.'],
  err: ['Balançar/kipping', 'Não estender totalmente embaixo', 'Projetar o queixo', 'Descer solto'],
  easy: ['Barra assistida com elástico', 'Negativas', 'Pull-up Hold'], hard: ['Com pausa', 'Chin-up / lastro (futuro)'],
  vars: ['Estrita', 'Com elástico', 'Negativa'],
  vid: [vid('Leo', 9, 51, 'Pull-up'), vid('Yvguo', 6, 50, 'Pull-up')],
});
ex('band_pullup', {
  en: 'Band-assisted Pull-up', pt: 'Barra assistida com elástico', cat: 'pull', pat: 'pullV',
  mus: ['Latíssimo do dorso', 'Bíceps', 'Deltoide posterior'],
  what: 'A mesma barra, com ajuda do elástico. Use o elástico para manter boa técnica, não para ganhar impulso.',
  steps: ['Fixe o elástico com segurança na barra e apoie joelho ou pé no laço.', 'Braços estendidos embaixo; puxe controlando as escápulas.', 'Não "quique" no elástico: desça com controle.'],
  err: ['Usar o rebote do elástico', 'Elástico mal fixado', 'Meia amplitude'], easy: ['Elástico mais forte', 'Puxada escapular'], hard: ['Elástico mais leve', 'Barra estrita'],
  vars: ['Elástico forte', 'Elástico médio', 'Elástico leve'],
  vid: [vid('Leo', 11, 24, 'Pull-up Hold e Band-assisted')],
});
ex('inv_row', {
  en: 'Inverted Row', pt: 'Remada invertida', cat: 'pull', pat: 'pullH',
  mus: ['Costas (dorsais, romboides)', 'Deltoide posterior', 'Bíceps'],
  what: 'Puxar horizontal. Exige uma barra baixa e segura: no seu caso isso não é garantido, por isso há alternativa com elástico.',
  steps: ['Embaixo de uma barra baixa e firme, corpo em linha reta, calcanhares no chão.', 'Puxe o peito em direção à barra, cotovelos para trás, retraindo as escápulas.', 'Retorno controlado, protraindo no final.'],
  err: ['Quadril caído', 'Puxar com o pescoço', 'Barra instável'], easy: ['Pés mais para trás / corpo mais vertical', 'Remada com elástico'], hard: ['Pés elevados', 'Pegada supinada'],
  vars: ['Joelhos dobrados', 'Pernas estendidas', 'Pés elevados'],
  vid: [vid('Leo', 11, 46, 'Inverted Row'), vid('Yvguo', 6, 18, 'Inverted Row')],
});
ex('band_row', {
  en: 'Seated Band Row', pt: 'Remada sentada com elástico', cat: 'pull', pat: 'pullH',
  mus: ['Costas', 'Deltoide posterior', 'Bíceps'],
  what: 'Alternativa quando não há barra baixa segura. Mesma intenção: cotovelos para trás e escápulas controladas.',
  steps: ['Sentado, elástico passado nos pés (confirme que não escapa).', 'Puxe cotovelos para trás retraindo as escápulas.', 'Retorne devagar, sem deixar o elástico "puxar" você.'],
  err: ['Elástico escapando', 'Inclinar o tronco para trás', 'Encolher os ombros'], easy: ['Elástico mais leve'], hard: ['Elástico mais forte', 'Remada invertida'], vars: ['Elástico leve', 'Elástico médio', 'Elástico forte'],
  note: 'Não há demonstração verificada nos vídeos originais; procure a variante nas bibliotecas complementares (aba Aprender → Fontes).',
});
ex('scap_pullup', {
  en: 'Scapular Pull-up', pt: 'Puxada escapular', cat: 'pull', pat: null,
  mus: ['Trapézio inferior', 'Latíssimo', 'Serrátil'],
  what: 'Controle das escápulas pendurado, sem dobrar os cotovelos. Base da barra fixa.',
  steps: ['Pendure-se com braços estendidos.', 'Abaixe as escápulas (afastar dos ouvidos) elevando o corpo poucos centímetros.', 'Volte controlando. Cotovelos permanecem estendidos.'],
  err: ['Dobrar os cotovelos', 'Balançar'], easy: ['Apoio parcial dos pés', 'Menos repetições'], hard: ['Pull-up com elástico'], vars: ['Estrita', 'Com apoio dos pés'],
  vid: [vid('Leo', 10, 39, 'Scapular Pull-up')],
});
ex('active_hang', {
  en: 'Active Hang', pt: 'Suspensão ativa', cat: 'pull', pat: null, unit: 's',
  mus: ['Trapézio inferior', 'Latíssimo', 'Pegada/antebraços'],
  what: 'Pendurado com ombros ativos (afastados das orelhas). Prepara a barra fixa e a pegada.',
  steps: ['Pendure-se na barra, braços estendidos.', 'Abaixe levemente os ombros, sem dobrar os cotovelos.', 'Respire e sustente 5–10 s.'],
  err: ['Ombros soltos nas orelhas (isso é o dead hang)', 'Segurar até perder a pegada'], easy: ['Apoio dos pés'], hard: ['Mais tempo', 'Pull-up Hold'], vars: ['Estrita', 'Com apoio dos pés'],
  vid: [vid('Yvguo', 7, 19, 'Dead/Active Hang'), vid('Leo', 10, 39, 'Suspensões')],
});
ex('dead_hang', {
  en: 'Dead Hang', pt: 'Suspensão passiva', cat: 'pull', pat: null, unit: 's',
  mus: ['Antebraços/pegada', 'Ombros (descompressão)'],
  what: 'Suspensão relaxada e confortável. Trabalha pegada e é um acessório opcional.',
  steps: ['Pendure-se confortavelmente, braços estendidos.', 'Respire normalmente. 10–20 s.'], err: ['Forçar além do conforto'], easy: ['Apoio dos pés'], hard: ['Mais tempo'], vars: ['Estrita', 'Com apoio dos pés'],
  vid: [vid('Yvguo', 7, 19, 'Dead Hang')],
});
ex('neg_pullup', {
  en: 'Negative Pull-up', pt: 'Barra negativa', cat: 'pull', pat: null,
  mus: ['Latíssimo', 'Bíceps'],
  what: 'Só a descida controlada (3–5 s). Acessório opcional para ganhar força na barra.',
  steps: ['Suba até o queixo acima da barra (degrau/pulo).', 'Desça devagar, 3–5 s, até os braços estendidos.'], err: ['Cair rápido', 'Pular demais e fadigar'], easy: ['Descida mais curta'], hard: ['Descida mais lenta'], vars: ['3 s', '5 s'],
  vid: [vid('Leo', 11, 2, 'Negative Pull-up'), vid('Yvguo', 7, 46, 'Negativa')],
});
ex('pullup_hold', {
  en: 'Pull-up Hold', pt: 'Sustentação no topo da barra', cat: 'pull', pat: null, unit: 's',
  mus: ['Latíssimo', 'Bíceps'],
  what: 'Sustentar o topo da puxada: reforça a posição final. Acessório opcional.',
  steps: ['Suba (degrau) até o queixo acima da barra.', 'Segure 5–10 s com escápulas controladas.'], err: ['Projetar o pescoço', 'Segurar até a falha'], easy: ['Menos segundos'], hard: ['Mais segundos'], vars: ['Queixo acima', 'Braços a 90°'],
  vid: [vid('Leo', 11, 24, 'Pull-up Hold')],
});

/* ───────────── LEGS ───────────── */
ex('assisted_pistol', {
  en: 'Assisted Pistol Squat', pt: 'Agachamento pistola assistido', cat: 'legs', pat: 'uni',
  mus: ['Quadríceps', 'Glúteos', 'Core/equilíbrio'],
  what: 'Agachamento unilateral com apoio das mãos. Comece pelo lado mais fraco e iguale as repetições no outro.',
  steps: ['Segure um apoio firme (batente, poste) ou sente em um banco alto.', 'Perna livre à frente; desça em amplitude parcial controlando.', 'Suba empurrando o pé inteiro no chão. Joelho alinhado com o pé.'],
  err: ['Joelho caindo para dentro', 'Calcanhar saindo do chão', 'Usar demais os braços'], easy: ['Banco mais alto', 'Menos amplitude'], hard: ['Menos apoio', 'Pistola completa'],
  vars: ['Banco alto', 'Banco médio', 'Segurando apoio'],
  vid: [vid('Leo', 16, 31, 'Pistol Squat'), vid('Yvguo', 11, 52, 'Pistol/Shrimp')],
});
ex('shrimp', {
  en: 'Shrimp Squat', pt: 'Agachamento shrimp', cat: 'legs', pat: 'uni',
  mus: ['Quadríceps', 'Glúteos', 'Equilíbrio'],
  what: 'Unilateral com a perna livre dobrada atrás. Quadríceps e equilíbrio.',
  steps: ['Perna livre para trás, pé na mão ou apoiada; apoio se precisar.', 'Desça até o joelho de trás tocar de leve o chão/almofada.', 'Suba controlando.'],
  err: ['Perder o equilíbrio e cair no joelho', 'Tronco colapsando'], easy: ['Split squat (agachamento dividido)', 'Com apoio'], hard: ['Sem apoio', 'Mais amplitude'], vars: ['Com apoio', 'Sem apoio'],
  vid: [vid('Yvguo', 11, 52, 'Shrimp Squat')],
});
ex('slide_curl', {
  en: 'Sliding Hamstring Curl', pt: 'Flexão deslizante de posteriores', cat: 'legs', pat: 'knee',
  mus: ['Posteriores da coxa', 'Glúteos'],
  what: 'Calcanhares deslizando em piso liso. Fortalece os posteriores sem equipamento.',
  steps: ['Deitado, calcanhares sobre panos em piso liso.', 'Eleve o quadril e flexione/estenda os joelhos de forma controlada.', 'Mantenha o quadril alto durante toda a série.'],
  err: ['Quadril caindo', 'Soltar rápido na extensão'], easy: ['Ponte de glúteos', 'Menor amplitude'], hard: ['Unilateral', 'Nordic Curl (futuro)'], vars: ['Duas pernas', 'Amplitude parcial', 'Uma perna'],
  vid: [vid('Leo', 18, 29, 'Sliding Hamstring Curl')],
});
ex('glute_bridge', {
  en: 'Glute Bridge', pt: 'Ponte de glúteos', cat: 'legs', pat: 'bridge',
  mus: ['Glúteos', 'Posteriores'],
  what: 'Eleve o quadril com glúteos, sem arquear a lombar.',
  steps: ['Deitado, joelhos dobrados, pés no chão.', 'Eleve o quadril apertando os glúteos.', 'Costelas para baixo, sem arquear lombar.'], err: ['Hiperextensão lombar', 'Empurrar com a ponta dos pés'], easy: ['Menos repetições'], hard: ['Unilateral'], vars: ['Duas pernas', 'Uma perna'],
  note: 'Sem demonstração nos vídeos originais; consulte as bibliotecas complementares.',
});
ex('split_squat', {
  en: 'Split Squat', pt: 'Agachamento dividido', cat: 'legs', pat: 'uni',
  mus: ['Quadríceps', 'Glúteos'],
  what: 'Regressão do shrimp: afundo estático.', steps: ['Um pé à frente, outro atrás.', 'Desça na vertical e suba empurrando o pé da frente.'], err: ['Joelho da frente desabando'], easy: ['Menos amplitude'], hard: ['Pé de trás elevado', 'Shrimp'], vars: ['Estático'],
});
ex('calf', {
  en: 'Calf Raise', pt: 'Elevação de panturrilha', cat: 'legs', pat: 'calf',
  mus: ['Gastrocnêmio', 'Sóleo'],
  what: 'Panturrilha, uma lacuna do plano antigo.', steps: ['Em pé, apoio para equilíbrio.', 'Suba nas pontas dos pés, pause no topo e desça controlando.'], err: ['Rebote', 'Sem pausa no topo'], easy: ['Bilateral'], hard: ['Unilateral', 'Em degrau (amplitude maior)'], vars: ['Bilateral', 'Unilateral', 'Em degrau'],
  vid: [vid('Leo', 18, 51, 'Calf Raise')],
});
ex('bw_squat', { en: 'Bodyweight Squat', pt: 'Agachamento livre', cat: 'legs', pat: null, mus: ['Quadríceps', 'Glúteos'], what: 'Aquecimento leve.', steps: ['Pés na largura dos ombros, desça até o confortável e suba.'], err: ['Calcanhares saindo'], easy: [], hard: [] });

/* ───────────── CORE ───────────── */
ex('knee_raise', {
  en: 'Hanging Knee Raise', pt: 'Elevação de joelhos na barra', cat: 'core', pat: 'core',
  mus: ['Abdômen', 'Flexores do quadril'],
  what: 'Primeira etapa rumo ao L-sit suspenso.', steps: ['Pendurado, braços estendidos.', 'Eleve os joelhos e faça uma leve retroversão da pelve.', 'Desça sem balançar.'],
  err: ['Balançar', 'Só flexionar o quadril sem a pelve'], easy: ['Versão deitada'], hard: ['Uma perna estendida', 'Pernas estendidas', 'L-sit suspenso'], vars: ['Joelhos dobrados', 'Deitado', 'Uma perna estendida'],
  vid: [vid('Leo', 13, 26, 'Hanging Knee Raise'), vid('Yvguo', 9, 52, 'Knee Raise / L-sit')],
});
ex('hollow', {
  en: 'Hollow Body Hold', pt: 'Sustentação corporal hollow', cat: 'core', pat: 'core', unit: 's',
  mus: ['Abdômen profundo', 'Flexores do quadril'],
  what: 'Lombar colada ao chão, base de várias skills.', steps: ['Deitado, lombar apoiada.', 'Eleve ombros e pernas mantendo a lombar no chão.', 'Se precisar: joelhos dobrados e braços ao lado.'],
  err: ['Lombar arqueando', 'Segurar até perder a forma'], easy: ['Joelhos dobrados', 'Braços ao lado'], hard: ['Pernas estendidas', 'Braços acima da cabeça'], vars: ['Joelhos dobrados', 'Pernas estendidas'],
  vid: [vid('Leo', 15, 21, 'Hollow Body Hold')],
});
ex('seated_pike_lift', {
  en: 'Seated Pike Lift', pt: 'Elevação de compressão sentado', cat: 'core', pat: 'core',
  mus: ['Flexores do quadril', 'Abdômen', 'Compressão (L-sit)'],
  what: 'Treina a compressão: base do L-sit.', steps: ['Sentado, mãos no chão ao lado do quadril (mais atrás facilita).', 'Eleve uma perna por vez sem embalo, glúteos no chão.'],
  err: ['Embalo', 'Perder o apoio dos glúteos'], easy: ['Mãos mais atrás', 'Joelho dobrado'], hard: ['Mãos mais à frente', 'Duas pernas'], vars: ['Mãos atrás', 'Mãos ao lado'],
  vid: [vid('Leo', 14, 13, 'Seated Pike Lifts'), vid('Yvguo', 10, 52, 'Compressão')],
});

/* ───────────── AQUECIMENTO ───────────── */
function w(id, en, pt, mus, how, extra) { ex(id, Object.assign({ en, pt, cat: 'warm', mus: mus || [], steps: [how], pat: null, mini: true }, extra || {})); }
w('shoulder_rot', 'Shoulder Rotations', 'Rotações de ombro', ['Ombros'], 'Círculos suaves com os braços, aumentando a amplitude aos poucos.');
w('elbow_rot', 'Elbow Rotations', 'Rotações de cotovelo', ['Cotovelos'], 'Círculos de antebraços, sem forçar.');
w('banded_pass', 'Banded Shoulder Passes', 'Passadas de ombro com elástico', ['Ombros'], 'Pegada ampla no elástico; passe por cima e atrás do corpo sem dor, 5–8 s por repetição.', { vid: [vid('Leo', 3, 41, 'Banded Shoulder Passes')] });
w('int_rot', 'Internal Rotations', 'Rotações internas de ombro', ['Manguito rotador'], 'Cotovelo junto ao corpo; antebraço para dentro com elástico leve ancorado com segurança.');
w('ext_rot', 'External Rotations', 'Rotações externas de ombro', ['Manguito rotador'], 'Cotovelo junto ao corpo; antebraço para fora.');
w('wrist_rot', 'Wrist Rotations', 'Rotações de punho', ['Punhos'], 'Sem carga, círculos nos dois sentidos.', { vid: [vid('Leo', 3, 15, 'Preparação de punhos'), vid('Yvguo', 1, 52, 'Punhos')] });
w('wrist_clock', 'Wrist Clocks', 'Relógio de punho', ['Punhos'], 'Em quatro apoios, mude a orientação das mãos e transfira o peso levemente.', { note: 'A nomenclatura das variantes de punho não é padronizada; confira a demonstração original.' });
w('wrist_circle', 'Wrist Circles', 'Círculos de punho apoiados', ['Punhos'], 'Pequenos círculos com o corpo sobre as mãos, em quatro apoios.');
w('wrist_pushup', 'Wrist Push-ups', 'Flexões de punho', ['Punhos'], 'Joelhos apoiados; eleve a base das palmas com os dedos no chão.');
w('rev_wrist_pushup', 'Reverse Wrist Push-ups', 'Flexões invertidas de punho', ['Punhos'], 'Dorso das mãos, carga mínima. Omitir na readaptação.');
w('cat_cow', 'Cat-Cow', 'Gato-vaca', ['Coluna'], 'Em quatro apoios, alterne arredondar e arquear a coluna com a respiração.');
w('thoracic_rot', 'Thoracic Rotations', 'Rotações torácicas', ['Coluna torácica'], 'Em quatro apoios, mão atrás da cabeça, gire o tronco abrindo o cotovelo.');
w('neck_rot', 'Neck Rotations', 'Rotações de pescoço', ['Pescoço'], 'Movimentos suaves, 5 por lado. Sem círculos forçados.');
w('hip_circles', 'Hip Circles', 'Rotações de quadril', ['Quadris'], 'Círculos amplos com o quadril, nos dois sentidos.');
w('hip_openers', 'Hip Openers', 'Aberturas de quadril', ['Quadris'], 'Eleve o joelho e abra lateralmente.');
w('leg_swing', 'Leg Swings', 'Balanços frontais', ['Posteriores', 'Quadris'], 'Apoio firme para equilíbrio, balance a perna à frente e atrás.');
w('lat_leg_swing', 'Lateral Leg Swings', 'Balanços laterais', ['Adutores', 'Quadris'], 'Apoio firme, balance a perna de um lado ao outro.');
w('ankle_mob', 'Ankle Mobility', 'Mobilidade de tornozelo', ['Tornozelos'], 'Joelho à frente, calcanhar apoiado.');
w('cossack', 'Cossack Squats', 'Agachamentos laterais', ['Adutores', 'Quadris'], 'Amplitude confortável, de um lado a outro.');

/* ───────────── ALONGAMENTOS ───────────── */
function s(id, en, pt, mus, how, extra) { ex(id, Object.assign({ en, pt, cat: 'stretch', mus: mus || [], steps: [how], pat: null, mini: true }, extra || {})); }
s('chest_stretch', 'Behind-the-Back Chest Stretch', 'Alongamento de peitoral (mãos atrás)', ['Peitoral'], 'Mãos entrelaçadas atrás, abra o peito suavemente.');
s('triceps_stretch', 'Overhead Triceps Stretch', 'Alongamento de tríceps', ['Tríceps'], 'Mão atrás da cabeça; a outra auxilia suavemente.');
s('crossbody', 'Cross-Body Shoulder Stretch', 'Alongamento de ombro posterior', ['Ombro posterior'], 'Braço cruzado à frente do corpo.');
s('childs_pose', "Child's Pose", 'Postura da criança', ['Dorsais'], 'Braços estendidos à frente, quadril em direção aos calcanhares.');
s('biceps_stretch', 'Seated Biceps Stretch', 'Alongamento de bíceps sentado', ['Bíceps'], 'Mãos atrás do corpo, avanço suave do quadril.', { note: 'Omitir se incomodar os punhos.' });
s('quad_stretch', 'Standing Quad Stretch', 'Alongamento de quadríceps em pé', ['Quadríceps'], 'Segure o pé atrás do corpo.');
s('seated_ham', 'Seated Hamstring Stretch', 'Alongamento de posteriores sentado', ['Posteriores'], 'Incline-se pelo quadril, sem arredondar a lombar nem forçar.', { vid: [vid('Leo', 4, 6, 'Posteriores (versão em pé)')] });
s('standing_pike_stretch', 'Standing Pike Stretch', 'Inclinação em pé pelo quadril', ['Posteriores'], 'Inclinação pelo quadril, joelhos levemente dobrados se necessário. Prioritário para Pike/L-sit.');
s('calf_stretch', 'Towel Calf Stretch', 'Alongamento de panturrilha com toalha', ['Panturrilha'], 'Puxe a ponta do pé suavemente com a toalha.');
s('hip_flexor', 'Half-Kneeling Hip Flexor Stretch', 'Alongamento de flexores do quadril', ['Flexores do quadril'], 'Meio-ajoelhado, contraia o glúteo da perna de trás.');

/* ───────────── EXERCÍCIOS EXTRAS (aparecem nos vídeos, fora da rotina V2) ───────────── */
ex('knee_pushup', {
  en: 'Knee Push-up', pt: 'Flexão com joelhos apoiados', cat: 'push', pat: null,
  mus: ['Peitoral', 'Tríceps', 'Ombros anteriores'],
  what: 'Primeira regressão da flexão. Leo cita como degrau antes da inclinada e da tradicional; também serve de aquecimento.',
  steps: ['Joelhos no chão (use um apoio macio), mãos um pouco mais largas que os ombros.', 'Corpo em linha reta dos joelhos à cabeça, abdômen e glúteos ativos.', 'Desça até o peito chegar perto do chão e suba sem abrir os cotovelos.'],
  err: ['Quadril dobrado (ponta para cima)', 'Cotovelos muito abertos'], easy: ['Flexão inclinada'], hard: ['Flexão tradicional'], vars: ['Joelhos apoiados'],
});
ex('wide_pushup', { en: 'Wide Push-up', pt: 'Flexão com mãos afastadas', cat: 'push', pat: null, mus: ['Peitoral'], what: 'Variação em que abrir mais as mãos alonga mais o peitoral (Yvguo).', steps: ['Mãos bem além da largura dos ombros; mesma técnica da flexão.'], err: ['Cotovelos a 90° do tronco', 'Quadril caído'], easy: ['Flexão tradicional'], hard: ['Flexão unilateral/archer'], vars: ['Mãos afastadas'] });
ex('diamond_pushup', { en: 'Diamond Push-up', pt: 'Flexão diamante', cat: 'push', pat: null, mus: ['Tríceps', 'Peitoral interno'], what: 'Mãos próximas enfatizam o tríceps (Yvguo) e a parte interna do peitoral (Leo).', steps: ['Mãos juntas sob o peito, formando um losango.', 'Cotovelos junto ao corpo na descida.'], err: ['Punhos desconfortáveis: afaste um pouco as mãos', 'Quadril caído'], easy: ['Flexão tradicional'], hard: [], vars: ['Mãos juntas'] });
ex('archer_pushup', { en: 'Archer Push-up', pt: 'Flexão archer', cat: 'push', pat: null, mus: ['Peitoral', 'Tríceps'], what: 'Treina cada braço separadamente e corrige desequilíbrios (Leo). Avançado: não é para a readaptação.', steps: ['Mãos bem afastadas; desça sobre um braço enquanto o outro fica estendido.'], err: ['Girar o tronco', 'Fazer cedo demais'], easy: ['Flexão tradicional'], hard: ['Flexão unilateral'], vars: [] });
ex('banded_dip', { en: 'Banded Dip', pt: 'Fundos com elástico', cat: 'push', pat: null, mus: ['Tríceps', 'Peitoral inferior'], what: 'Reduz a carga dos fundos; elástico mais grosso = mais fácil (Leo).', steps: ['Prenda o elástico com segurança e apoie joelhos/pés no laço.', 'Mesma técnica dos fundos.'], err: ['Elástico mal fixado', 'Usar o rebote para subir'], easy: [], hard: ['Elástico mais fino', 'Fundos estritos'], vars: ['Elástico grosso', 'Elástico fino'], note: 'Com barra reta, confirme que a fixação do elástico é segura.' });
ex('neg_dip', { en: 'Negative Dip', pt: 'Fundos negativos', cat: 'push', pat: null, mus: ['Tríceps', 'Peitoral inferior'], what: 'Só a descida controlada, na parte em que você mais sofre (Leo).', steps: ['Comece em cima, braços estendidos e ombros baixos.', 'Desça lentamente (3–5 s).'], err: ['Cair solto'], easy: [], hard: ['Fundos completos'], vars: ['3 s', '5 s'], note: 'Com barra reta, só se ela for segura para sua carga.' });
ex('chin_up', { en: 'Chin-up', pt: 'Barra supinada', cat: 'pull', pat: null, mus: ['Bíceps', 'Latíssimo'], what: 'Pegada com palmas para você: carrega mais o bíceps. Leo recomenda dominar a pronada, que é a mais difícil. Opção futura no Pull B.', steps: ['Mãos na largura dos ombros, palmas para você.', 'Mesma técnica da barra fixa: braços estendidos embaixo, queixo acima.'], err: ['Balançar', 'Projetar o pescoço'], easy: ['Barra com elástico'], hard: ['Com pausa'], vars: ['Estrita', 'Com elástico'] });
ex('reverse_plank', { en: 'Elbow Reverse Plank', pt: 'Prancha reversa com apoio nos cotovelos', cat: 'pull', pat: null, unit: 's', mus: ['Costas', 'Glúteos', 'Posteriores'], what: 'Yvguo cita como opção de puxar no chão se você não tem barra. Ele a descreve como muito intensa: vá com cautela.', steps: ['Sentado, cotovelos apoiados atrás do corpo.', 'Eleve o quadril até o corpo ficar em linha reta.'], err: ['Quadril caído', 'Tentar muito tempo'], easy: [], hard: [], vars: [], note: 'Sem demonstração específica; veja o trecho do vídeo.' });
ex('l_sit', { en: 'L-sit', pt: 'L-sit (sustentação em L)', cat: 'core', pat: null, unit: 's', mus: ['Flexores do quadril', 'Abdômen', 'Tríceps'], what: 'Skill-alvo: braços estendidos, pernas à frente na horizontal. Yvguo: comece nas elevações de joelho, estenda a alavanca aos poucos e passe da dinâmica para a isometria. Leo: ser capaz de segurar um L é um bom objetivo.', steps: ['Mãos no chão/paralelas ao lado do quadril, braços estendidos, ombros baixos.', 'Eleve as pernas retas à frente, joelhos travados.', 'Segure; comece pelas progressões.'], err: ['Ombros encolhidos', 'Joelhos dobrados sem querer'], easy: ['Elevação de joelhos', 'Uma perna estendida'], hard: ['L-sit suspenso'], vars: ['Joelhos dobrados', 'Uma perna', 'Pernas estendidas'] });
ex('pistol', { en: 'Pistol Squat', pt: 'Agachamento pistola', cat: 'legs', pat: 'uni', mus: ['Quadríceps', 'Glúteos', 'Equilíbrio'], what: 'Todo o peso em uma perna. Leo: braços à frente para equilíbrio; a coxa fica paralela ao chão. Exige mobilidade dos posteriores.', steps: ['Pés na largura do quadril; estenda uma perna à frente.', 'Desça na outra perna com as costas retas e o core ativo, braços à frente.', 'Suba até a posição inicial.'], err: ['Calcanhar saindo do chão', 'Cair para trás'], easy: ['Pistola assistida', 'Degrau com uma perna'], hard: ['Pistola completa sem apoio'], vars: ['Completa', 'Em superfície elevada'] });
ex('box_step', { en: 'Single-leg Box Step', pt: 'Subida em degrau com uma perna', cat: 'legs', pat: null, mus: ['Quadríceps', 'Glúteos'], what: 'Leo cita como primeiro degrau para a pistola quando os posteriores limitam.', steps: ['Um pé em uma caixa estável; desça devagar a outra perna e suba.'], err: ['Impulso com a perna de baixo'], easy: [], hard: ['Pistola assistida'], vars: [] });
ex('nordic_curl', { en: 'Nordic Curl', pt: 'Nordic curl (posteriores)', cat: 'legs', pat: null, mus: ['Posteriores da coxa'], what: 'Exercício muito intenso. Leo foca na fase negativa: descer o tronco controlando com os posteriores. Opção futura; não é o Nordic reverso.', steps: ['Ajoelhado em superfície macia, pés presos (sofá/cama/parceiro).', 'Desça o tronco devagar, reto e com core ativo.', 'Ampare-se com as mãos e use a flexão para voltar.'], err: ['Quebrar o quadril cedo', 'Soltar rápido'], easy: ['Sliding hamstring curl', 'Com leve flexão de quadril'], hard: ['Retorno sem ajuda das mãos'], vars: ['Negativa'] });
ex('reverse_nordic', { en: 'Kneeling Quad Extension', pt: 'Extensão de quadríceps ajoelhado (Nordic reverso)', cat: 'legs', pat: null, mus: ['Quadríceps'], what: 'Yvguo: comece com o corpo ereto e se incline para trás aos poucos. Opcional, não obrigatório no plano.', steps: ['Ajoelhado, corpo ereto.', 'Incline-se para trás mantendo o corpo em linha, sem arquear a lombar.', 'Volte com controle.'], err: ['Quebrar na cintura', 'Ir longe demais'], easy: ['Inclinar menos'], hard: ['Inclinar mais'], vars: ['Pouca inclinação', 'Mais inclinação'] });
ex('single_leg_calf', { en: 'Single-leg Calf Raise', pt: 'Panturrilha unilateral', cat: 'legs', pat: null, mus: ['Panturrilha'], what: 'Leo: em uma perna, mãos num apoio para estabilizar; segure 1–2 s no topo (alongamento) e desça devagar.', steps: ['Em uma perna, mãos na parede/apoio.', 'Suba na ponta do pé, segure 1–2 s e desça devagar.'], err: ['Rebote'], easy: ['Panturrilha nas duas pernas'], hard: ['Em degrau, com pausa embaixo'], vars: ['No chão', 'No degrau'] });

/* Tempos nos vídeos: estimados cruzando a transcrição com o tempo dentro de cada trecho (±5 s). Confira no vídeo. */
const _L = (m, s, l) => vid('Leo', m, s, l), _Y = (m, s, l) => vid('Yvguo', m, s, l);
const VT = {
  wrist_rot: [_L(3, 20, 'Preparação de punhos'), _Y(1, 55, 'Punhos: por que condicionar')],
  wrist_clock: [_L(3, 20, 'Preparação de punhos')], wrist_circle: [_L(3, 20, 'Preparação de punhos')], wrist_pushup: [_L(3, 20, 'Preparação de punhos')],
  shoulder_rot: [_Y(2, 20, 'Círculos com os braços')],
  banded_pass: [_L(3, 49, 'Passadas de ombro com elástico/bastão')],
  standing_pike_stretch: [_L(4, 21, 'Alongamento de posteriores em pé')], seated_ham: [_L(4, 21, 'Posteriores (versão em pé)')],
  pushup: [_L(5, 28, 'Como fazer a flexão'), _L(5, 46, 'Escápulas na flexão'), _Y(2, 40, 'Flexão: o básico'), _Y(3, 46, 'Postura: quadril baixo e cotovelos')],
  knee_pushup: [_L(6, 5, 'Começar de joelhos → inclinada'), _L(4, 52, 'Flexão de joelhos no aquecimento')],
  incline_pushup: [_Y(2, 53, 'Flexão em superfície elevada'), _L(6, 5, 'Regressões da flexão')],
  scap_pushup: [_Y(3, 24, 'Flexão escapular (serrátil anterior)')],
  wide_pushup: [_Y(4, 12, 'Mãos mais abertas')], diamond_pushup: [_Y(4, 30, 'Flexão diamante')], archer_pushup: [_L(6, 46, 'Archer push-up')],
  decline: [_Y(4, 30, 'Flexão com pés elevados'), _L(6, 53, 'Flexão declinada')],
  dips: [_Y(4, 57, 'Mergulho: sustentar e descer (paralelas)'), _Y(5, 21, 'Ombros para baixo'), _L(7, 1, 'Mergulho (paralelas)'), _L(7, 26, 'Descer até ~90°')],
  dip_hold: [_Y(4, 58, 'Sustentação com braços estendidos'), _L(7, 19, 'Deprimir os ombros')],
  banded_dip: [_L(7, 54, 'Fundos com elástico')], neg_dip: [_L(8, 4, 'Fundos negativos')],
  pike: [_L(8, 24, 'Como fazer a Pike'), _L(8, 34, 'Elevar as escápulas'), _L(9, 0, 'Mãos mais perto dos pés'), _L(9, 9, 'Pike com pés elevados'), _Y(5, 47, 'Flexão Pike'), _Y(5, 52, 'Pés perto dos pulsos, cotovelos junto')],
  incline_pike: [_Y(6, 10, 'Facilitar: aproximar os pés aos poucos'), _L(8, 24, 'Como fazer a Pike'), _L(8, 34, 'Elevar as escápulas')],
  pullup: [_L(9, 59, 'Como fazer a barra fixa'), _Y(7, 33, 'Forma na barra fixa'), _L(10, 8, 'Escápulas deprimidas')],
  chin_up: [_L(10, 20, 'Pegadas: neutra, supinada, pronada')],
  band_pullup: [_L(11, 39, 'Barra com elástico'), _Y(7, 57, 'Elástico, reduzindo aos poucos')],
  neg_pullup: [_L(11, 7, 'Barra negativa'), _Y(8, 5, 'Saltar e descer devagar')],
  pullup_hold: [_L(11, 28, 'Isometria no topo'), _Y(8, 11, 'Isometrias')],
  scap_pullup: [_L(10, 57, 'Scapular shrugs'), _Y(7, 25, 'Da suspensão estática à ativa')],
  active_hang: [_Y(7, 25, 'Suspensão estática → ativa'), _L(10, 57, 'Estabilidade escapular')],
  dead_hang: [_L(10, 48, 'Dead hang'), _Y(7, 9, 'Pendurar-se na barra')],
  inv_row: [_L(11, 50, 'Remada invertida'), _Y(6, 28, 'Remadas na barra baixa/mesa'), _L(12, 13, 'Anéis ou mesa'), _L(12, 23, 'Pernas dobradas (mais fácil)'), _L(12, 29, 'Pés elevados (mais difícil)')],
  reverse_plank: [_Y(9, 23, 'Prancha reversa nos cotovelos')],
  knee_raise: [_L(13, 44, 'Hanging knee raise'), _L(14, 12, 'Pernas estendidas / L'), _Y(10, 17, 'Elevações de joelho → L-sit')],
  l_sit: [_Y(10, 12, 'Progressão do L-sit'), _L(14, 12, 'L-sit como objetivo')],
  seated_pike_lift: [_L(14, 48, 'Como fazer'), _L(15, 26, 'Uma perna de cada vez (mais fácil)'), _Y(10, 53, 'Compressão: mãos mais atrás = mais fácil')],
  hollow: [_L(15, 36, 'Hollow body hold'), _L(15, 44, 'Braços atrás / ao lado'), _L(16, 3, 'Arm circles (mais difícil)')],
  assisted_pistol: [_L(16, 43, 'Pistola e variações'), _L(17, 5, 'Subida em degrau (com uma perna)'), _L(17, 22, 'Pistola em superfície elevada'), _Y(12, 9, 'Agachamento unilateral')],
  pistol: [_L(16, 43, 'Pistol squat'), _Y(12, 9, 'Agachamento unilateral')],
  box_step: [_L(17, 5, 'Single-leg box steps')],
  shrimp: [_Y(12, 9, 'Shrimp squat / pistola'), _Y(12, 18, 'Lado mais fraco primeiro')],
  reverse_nordic: [_Y(11, 42, 'Extensão de quadríceps ajoelhado')],
  nordic_curl: [_L(17, 28, 'Nordic curl (negativa)')],
  slide_curl: [_L(18, 29, 'Sliding hamstring curl')],
  calf: [_L(18, 54, 'Panturrilha unilateral')], single_leg_calf: [_L(18, 54, 'Panturrilha unilateral')],
};
Object.entries(VT).forEach(([id, v]) => { if (EX[id]) EX[id].vid = v; });

/* ───────────── SESSÕES ───────────── */
const WARM_UP = [
  ['shoulder_rot', '10–15 por direção'], ['elbow_rot', '10–15 por direção'], ['banded_pass', '6–10 · 5–8 s cada'],
  ['int_rot', '10 por braço'], ['ext_rot', '10 por braço'], ['wrist_rot', '10–15 por direção'], ['wrist_clock', '15–20 s'],
  ['wrist_circle', '5–8 por direção'], ['wrist_pushup', '5–8 · opcional'],
];
const WARM_LEGS = [
  ['hip_circles', '8–10 por direção'], ['hip_openers', '6–8 por perna'], ['leg_swing', '10 por perna'], ['lat_leg_swing', '10 por perna'],
  ['ankle_mob', '8–10 por lado'], ['cossack', '5–6 por lado'], ['bw_squat', '8–10 leves'],
];
const RAMP = {
  push: [['scap_pushup', '1×6–8 · 30 s'], ['incline_pushup', '1×5 · 30 s'], ['incline_pike', '1×3–5 · 60 s']],
  pull: [['active_hang', '1×5–10 s · 30 s'], ['scap_pullup', '1×5–6 · 30 s'], ['band_pullup', '1×3–5 · 60 s']],
  legs: [],
};
const STRETCH = {
  push: [['chest_stretch', '1–2×20–30 s'], ['triceps_stretch', '20–30 s por braço'], ['crossbody', '20–30 s por braço'], ['seated_ham', '2×20–30 s por perna'], ['standing_pike_stretch', '2×20–30 s · opcional']],
  pull: [['childs_pose', '1–2×20–30 s'], ['biceps_stretch', '20–30 s'], ['crossbody', '20–30 s por braço']],
  legs: [['quad_stretch', '20–30 s por perna'], ['seated_ham', '2×20–30 s por perna'], ['calf_stretch', '20–30 s por perna'], ['hip_flexor', '20–30 s por lado']],
};
const MORNING = [
  ['Respiração tranquila', '1 min'], ['neck_rot', '5 por lado'], ['shoulder_rot', '10 por direção'], ['cat_cow', '8–10'], ['thoracic_rot', '6 por lado'],
  ['wrist_rot', '10 por direção'], ['hip_circles', '8 por direção'], ['hip_openers', '6 por perna'], ['leg_swing', '8 por direção'], ['ankle_mob', '8 por lado'], ['bw_squat', '8'],
];

const PHASES = [
  { id: 'w1', n: 'Semana 1', sub: 'Readaptação', rir: '4–5', sets: '1–2', cardio: '15–25 min · 3–4 dias',
    d: 'Reaprender os movimentos, escolher regressões, voltar à regularidade. Sem testes de máximo. Prefira intercalar treino com descanso ou caminhada (ex.: dias 1, 3 e 5).' },
  { id: 'w2', n: 'Semana 2', sub: 'Readaptação', rir: '3–4', sets: '2', cardio: '15–25 min · 3–4 dias',
    d: 'Se estiver recuperado da semana 1. Duas séries por exercício, ainda longe da falha.' },
  { id: 'rec', n: 'Semanas 3–6', sub: 'Reconstrução', rir: '2–3 (B: 3–4)', sets: 'conforme ficha', cardio: '20–30 min · 4–5 dias',
    d: 'Sessões A e B alternando. Cada padrão de movimento aparece 2× por semana.' },
  { id: 'str', n: 'Semana 7+', sub: 'Força + volume', rir: '1–3', sets: 'conforme ficha', cardio: '20–30 min · 4–5 dias',
    d: 'Só com técnica e recuperação consolidadas. Em um padrão por sessão, troque 3 séries por 2×4–6 mais difíceis (RIR 2, 3–4 min) + 1×6–10 mais fácil. Não some ao volume existente.' },
];

/* Cada exercício da sessão: [id, séries, reps, descanso(s), RIR, nota, alt] */
function T(id, sets, reps, rest, rir, note, extra) { return Object.assign({ id, sets, reps, rest, rir, note: note || '' }, extra || {}); }

const SESSION_META = {
  push: { n: 'Push', pt: 'Empurrar', focus: 'Peitoral, ombros, tríceps', warm: 'upper' },
  pull: { n: 'Pull', pt: 'Puxar', focus: 'Costas, bíceps, deltoide posterior', warm: 'upper' },
  legs: { n: 'Legs + Core', pt: 'Pernas e core', focus: 'Quadríceps, glúteos, posteriores, panturrilhas e core', warm: 'legs' },
};

const PLAN = {
  push: {
    w1: { min: '30–45', ex: [T('incline_pike', 2, '5–6', 150, '4–5', 'Variante fácil. Padronize a distância mãos–pés.'), T('dips', 2, '5–6', 150, '4–5', 'Pode fazer só 1 série se estiver fácil. Alternativa: sustentação 2×10–15 s.', { alt: 'dip_hold', setsMin: 1 }), T('pushup', 2, '6–10', 120, '4–5', 'Se difícil, use flexão inclinada.')] },
    w2: { min: '30–45', ex: [T('incline_pike', 2, '5–8', 150, '3–4'), T('dips', 2, '5–6', 150, '3–4', '', { alt: 'dip_hold' }), T('pushup', 2, '6–10', 120, '3–4')] },
    A: { min: '40–55', ex: [T('pike', 3, '6–10', 150, '3', 'Mãos elevadas ou joelhos dobrados se necessário.'), T('dips', 3, '5–8', 150, '2–3', 'Assistência ou sustentação se necessário.', { alt: 'dip_hold' }), T('decline', 3, '6–12', 150, '2–3', 'Regrida para tradicional ou inclinada se perder a forma.')] },
    B: { min: '30–45', ex: [T('incline_pike', 2, '8–12', 120, '3–4', 'Apoio elevado e firme.'), T('dips', 2, '6–10', 120, '3–4', '', { alt: 'dip_hold' }), T('pushup', 2, '8–15', 105, '3–4')] },
  },
  pull: {
    w1: { min: '25–35', derived: true, ex: [T('band_pullup', 2, '3–6', 120, '4–5', 'Elástico forte. Pode fazer só 1 série.', { setsMin: 1 }), T('inv_row', 2, '6–10', 120, '4–5', 'Ajuste o ângulo do corpo para ficar fácil.')] },
    w2: { min: '30–40', derived: true, ex: [T('band_pullup', 2, '4–8', 120, '3–4'), T('inv_row', 2, '8–10', 120, '3–4')] },
    A: { min: '35–45', ex: [T('pullup', 3, '5–8', 180, '2–3', 'Elástico se necessário.'), T('inv_row', 3, '8–12', 120, '2–3')] },
    B: { min: '30–40', ex: [T('band_pullup', 2, '8–12', 150, '3–4'), T('inv_row', 3, '8–12', 105, '3–4'), T('scap_pullup', 2, '6–10', 75, '3–4', 'Opcional.', { optional: true, setsMin: 1 })] },
  },
  legs: {
    w1: { min: '30–40', derived: true, ex: [T('assisted_pistol', 2, '5–6', 120, '4–5', 'Por perna. Lado mais fraco primeiro.', { setsMin: 1 }), T('slide_curl', 2, '6–8', 105, '4–5', 'Regrida para ponte de glúteos se difícil.', { setsMin: 1, alt: 'glute_bridge' }), T('calf', 2, '12–15', 75, '3–4'), T('hollow', 2, '10–15', 60, 'alguns s em reserva', 'Joelhos dobrados e braços ao lado se precisar.', { unit: 's', setsMin: 1 })] },
    w2: { min: '35–45', derived: true, ex: [T('assisted_pistol', 2, '5–8', 120, '3–4'), T('slide_curl', 2, '6–10', 105, '3–4', '', { alt: 'glute_bridge' }), T('calf', 2, '12–15', 75, '3'), T('hollow', 2, '10–20', 60, 'alguns s em reserva', '', { unit: 's' })] },
    A: { min: '40–60', ex: [T('assisted_pistol', 3, '5–8', 150, '2–3', 'Por perna. Lado mais fraco primeiro, depois iguale.'), T('slide_curl', 3, '6–12', 105, '3'), T('calf', 2, '12–20', 75, '2–3'), T('knee_raise', 2, '8–12', 75, '2–3', 'Versão deitada se necessário.'), T('hollow', 2, '15–25', 60, 'alguns s em reserva', '', { unit: 's' })] },
    B: { min: '40–55', ex: [T('shrimp', 3, '6–10', 120, '3–4', 'Por perna. Regrida para split squat.', { alt: 'split_squat' }), T('slide_curl', 2, '8–12', 105, '3–4'), T('glute_bridge', 2, '10–15', 75, '3'), T('calf', 2, '12–20', 75, '3'), T('seated_pike_lift', 2, '6–10', 75, '2–3', 'Por perna.'), T('hollow', 2, '15–25', 60, 'alguns s em reserva', '', { unit: 's' })] },
  },
};

const SESSION_ORDER = ['push', 'pull', 'legs'];

/* Metas de longo prazo (referências motivacionais, não testes) */
const GOALS = [
  { id: 'pushup', n: 'Flexões tradicionais', t: 30, alt: 20, who: 'Yvguo 30 · Leo 20', ids: ['pushup'], variants: ['Tradicional'] },
  { id: 'pullup', n: 'Barras pronadas', t: 15, alt: 12, who: 'Yvguo 15 · Leo 12', ids: ['pullup'], variants: ['Estrita'] },
  { id: 'dips', n: 'Fundos (paralelas)', t: 15, alt: 15, who: 'Ambos 15 — mas em paralelas; sua barra reta é diferente', ids: ['dips'], variants: ['Estrito'] },
];

const GLOSSARY = [
  ['Push / Pull / Legs / Core', 'Empurrar / puxar / pernas / musculatura central de estabilização.'],
  ['RIR (repetições em reserva)', 'Quantas repetições corretas você ainda faria ao terminar a série. RIR 3 = parou com 3 sobrando. RIR 0 = não faria mais nenhuma com boa técnica (não é "tentar e falhar"). Não confundir com esforço percebido (RPE).'],
  ['Protração', 'Escápulas se afastam (empurrar o chão na flexão).'],
  ['Retração', 'Escápulas se aproximam (puxar na remada, descer na flexão).'],
  ['Elevação escapular', 'Ombros sobem em direção às orelhas — desejável no topo da Pike.'],
  ['Depressão escapular', 'Ombros descem, longe das orelhas — a base da sustentação em dips e do active hang.'],
  ['Concêntrica', 'Fase em que o músculo encurta ativamente (em geral, a subida).'],
  ['Excêntrica / negativa', 'Fase em que o músculo alonga sob carga (em geral, a descida).'],
  ['Isometria', 'Sustentação sem movimento visível (hollow, support hold).'],
  ['ROM', 'Amplitude de movimento.'],
  ['Tempo', 'Cadência de execução (ex.: descer em 2 s).'],
  ['Ramp-up', 'Preparação progressiva com séries leves do próprio exercício, sem gerar fadiga.'],
  ['Working sets', 'Séries de trabalho (as que contam para o volume).'],
  ['Sobrecarga progressiva', 'Aumentar gradualmente o desafio: mais repetições, variação mais difícil, menos assistência.'],
  ['Progressão / Regressão', 'Variação mais difícil / mais fácil de um exercício.'],
  ['Deload', 'Redução temporária de carga/volume (~30–50% das séries por uma semana, longe da falha).'],
  ['Strict form', 'Execução estrita, sem compensações nem balanço.'],
  ['Compression strength', 'Força para aproximar pernas e tronco (base do L-sit).'],
  ['Straight arm strength', 'Força com braços estendidos (skills futuras).'],
  ['Hamstrings / Hip flexors', 'Posteriores da coxa / flexores do quadril.'],
  ['Dead hang / Active hang', 'Suspensão relaxada / suspensão com ombros ativos.'],
  ['Incline / Decline push-up', 'Flexão com mãos elevadas (mais fácil) / com pés elevados (mais difícil).'],
  ['Inverted Row (Australian pull-up)', 'Remada invertida.'],
  ['Chin-up', 'Barra fixa com pegada supinada.'],
];

const DECISIONS = [
  ['Pike passou a ser o primeiro exercício do Push', 'Por ser o mais técnico, entra quando você está descansado.'],
  ['Primeira semana com versões fáceis', 'O plano não assume seu desempenho antigo (20 flexões, 10 barras…). Os números antigos não são testes atuais.'],
  ['Posteriores, panturrilhas, pontes e pistola assistida entraram', 'Eram lacunas do plano anterior.'],
  ['Acessórios são opcionais e escolhidos conforme sua fraqueza', 'Negativas, isometrias, suspensões e escapulares extras: no máximo um por sessão, sem fadigar.'],
  ['Punhos antes da carga', 'Preparação de punhos antes de apoiar peso nas mãos.'],
  ['RIR, progressão dupla, registro de técnica e deload são adaptações nossas', 'Não atribua o RIR aos autores (Yvguo e Leo Wang).'],
  ['Alongar para mobilidade, não como promessa', 'Sem parede. Não prometemos evitar dor muscular tardia nem lesões.'],
  ['Sem falha obrigatória', 'Séries de 1–5 reps e cargas muito difíceis ficam para depois da readaptação. Seis dias de força não são "melhores".'],
];

const SCIENCE = [
  ['ACSM — posicionamento 2026 sobre treinamento resistido', 'https://pubmed.ncbi.nlm.nih.gov/41843416/'],
  ['NSCA — retorno seguro após inatividade', 'https://www.nsca.com/about-us/position-statements/safe-return-to-training/'],
  ['Proximidade da falha muscular', 'https://pubmed.ncbi.nlm.nih.gov/38970765/'],
  ['Full Body vs treino dividido', 'https://pubmed.ncbi.nlm.nih.gov/38595233/'],
  ['Intervalos de descanso', 'https://pubmed.ncbi.nlm.nih.gov/39205815/'],
  ['Volume e frequência de treinamento', 'https://pubmed.ncbi.nlm.nih.gov/41343037/'],
];
const LIBRARIES = [
  ['calisthenics.build (pt)', 'https://www.calisthenics.build/pt/exercises'],
  ['Simple Calisthenics', 'https://www.simple-calisthenics.com/exercises'],
  ['ACE Fitness — exercise library', 'https://www.acefitness.org/resources/everyone/exercise-library/'],
  ['calisthenics.pro', 'https://www.calisthenics.pro/'],
];
const VIDEOS = [
  { who: 'Yvguo', id: YV, title: 'Calisthenics for Complete Beginners (Tips, Exercise Form, Programming)',
    ch: [['Aquecimento e mobilidade', 60], ['Push', 155], ['Pull', 383], ['Core', 575], ['Pernas', 681], ['Programação/templates', 785], ['Progressão', 896], ['Recuperação', 981], ['Metas', 1033]] },
  { who: 'Leo Wang', id: LEO, title: 'Calisthenics for Beginners | In Depth Step-by-Step Guide to Building Strength and Muscle',
    ch: [['Aquecimento e mobilidade', 187], ['Push', 309], ['Pull', 584], ['Core', 762], ['Pernas', 971], ['Programação/templates', 1188], ['Progressão', 1419], ['Metas (aprox.)', 1465]] },
];
const PRINTS = { leo: 0, yvguo: 0 }; /* prints dos autores não são publicados */
