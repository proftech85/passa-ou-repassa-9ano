// =======================================================
// PASSA OU REPASSA – 9º ANO (Física + Matemática)
// Etapas 1→2→3→4 prontas:
// 1) Menu bonito
// 2) Inserir nomes (equipes ou individual)
// 3) Passar / Repassar / Responder / Pista + tempo + turnos
// 4) Banco de questões 9º ano por tema + teoria + explicação
//
// Requisitos de arquivos:
// - index.html carregando p5 + sketch.js
// - logo.png na RAIZ do repositório (mesmo nível de index.html)
// =======================================================

let W, H;

// Logo (na raiz)
let logoImg;

// Estados
let state = "menu"; // menu | players | topics | round | result | final

// Configurações
let mode = "teams";          // teams | solo
let numPlayers = 3;          // 1 no solo; 2..6 no teams
let timePerQuestion = 30;    // segundos
let totalRounds = 10;        // total de perguntas na partida

// Jogo
let players = [];            // [{name, score}]
let currentPlayerIndex = 0;
let roundIndex = 0;          // 0..totalRounds-1

let selectedSubject = "fisica";      // fisica | matematica
let selectedTopic = "cinematica";    // depende de subject
let currentQ = null;

let timeLeft = timePerQuestion;
let timerRunning = false;

let repassActive = false;
let repassFromIndex = null;  // quem repassou
let hintUsed = false;

// UI (DOM)
let btnStart, btnGoPlayers, btnGoTopics;
let btnModeTeams, btnModeSolo;
let btnAddPlayer, btnRemovePlayer;

let nameInputs = [];

let topicButtons = [];       // botões de tema
let btnSubFis, btnSubMat;

let answerInput, btnAnswer, btnPass, btnRepass, btnHint, btnNext, btnFinish;

// Toast
let toastMsg = "";
let toastT = 0;

// ===============================
// BANCO 9º ANO — questões para pensar
// ===============================
const QUESTION_BANK_9ANO = {
  matematica: {
    funcao_afim: [
      {
        id: "MFA-01",
        difficulty: 4,
        theory: "Em f(x)=ax+b, 'a' é a taxa de variação (inclinação) e 'b' é f(0).",
        question: "Uma função linear tem f(0)=12 e f(4)=4. Determine a lei da função.",
        answer: "f(x)=-2x+12",
        accept: ["-2x+12","12-2x","f(x)=12-2x","f(x)=-2x+12"],
        explain: "a=(4−12)/(4−0)=−2. b=f(0)=12. Logo f(x)=−2x+12."
      },
      {
        id: "MFA-02",
        difficulty: 3,
        theory: "Modelagem: valor fixo vira b; taxa por unidade vira a.",
        question: "Plano: R$25 + R$0,40 por minuto. Escreva C(m). Calcule C(60). Responda só o valor.",
        answer: "49",
        accept: ["49","49,0","49.0","R$49"],
        explain: "C(m)=25+0,4m. C(60)=25+24=49."
      },
      {
        id: "MFA-03",
        difficulty: 4,
        theory: "Raiz é quando f(x)=0 (onde cruza o eixo x).",
        question: "A função f(x)=3x−15 zera em qual x?",
        answer: "5",
        accept: ["5","x=5"],
        explain: "3x−15=0 → 3x=15 → x=5."
      }
    ],

    sistemas: [
      {
        id: "MSI-01",
        difficulty: 3,
        theory: "Somar/subtrair equações pode eliminar uma variável.",
        question: "Resolva: x+y=11 e x−y=3. Qual é (x,y)?",
        answer: "(7,4)",
        accept: ["(7,4)","(7, 4)","x=7 y=4","x=7, y=4","7 e 4"],
        explain: "Somando: 2x=14 → x=7. Então y=11−7=4."
      },
      {
        id: "MSI-02",
        difficulty: 4,
        theory: "Problema de soma e diferença vira sistema.",
        question: "A soma de dois números é 26 e a diferença é 8. Quais são os números?",
        answer: "17 e 9",
        accept: ["17 e 9","9 e 17","17,9","9,17"],
        explain: "x+y=26 e x−y=8 → 2x=34 → x=17, y=9."
      }
    ],

    proporcionalidade: [
      {
        id: "MPR-01",
        difficulty: 4,
        theory: "Escala 1:n: 1 unidade no mapa representa n unidades reais (mesma unidade).",
        question: "Em escala 1:50.000, a distância no mapa é 3,2 cm. Qual a distância real em km?",
        answer: "1.6",
        accept: ["1,6","1.6","1,60","1.60","1,6 km","1.6 km"],
        explain: "3,2×50.000=160.000 cm. Como 100.000 cm=1 km, então 160.000 cm=1,6 km."
      },
      {
        id: "MPR-02",
        difficulty: 4,
        theory: "Grandezas inversas: produto constante (trabalho fixo).",
        question: "6 operários fazem em 15 dias. Em quantos dias 10 operários fariam (mesma eficiência)?",
        answer: "9",
        accept: ["9","9 dias","9,0","9.0"],
        explain: "6×15=90. Com 10: dias=90/10=9."
      }
    ],

    geometria: [
      {
        id: "MGE-01",
        difficulty: 3,
        theory: "Pitágoras: em triângulo retângulo, a²=b²+c² (hipotenusa ao quadrado).",
        question: "Uma escada está a 2,4 m da parede e alcança 3,2 m de altura. Qual o comprimento da escada?",
        answer: "4",
        accept: ["4","4 m","4,0","4.0"],
        explain: "√(2,4²+3,2²)=√(5,76+10,24)=√16=4 m."
      },
      {
        id: "MGE-02",
        difficulty: 4,
        theory: "Converter área: 1 m² = 10.000 cm² (atenção: é ao quadrado).",
        question: "Um piso mede 3,5 m por 2 m. Qual a área em cm²?",
        answer: "70000",
        accept: ["70000","70.000","70000 cm2","70000 cm²","70000cm2"],
        explain: "Área=7 m². Em cm²: 7×10.000=70.000 cm²."
      }
    ]
  },

  fisica: {
    cinematica: [
      {
        id: "FCI-01",
        difficulty: 5,
        theory: "Velocidade média = distância total / tempo total. Converta minutos para horas.",
        question: "12 km em 30 min e depois 8 km em 20 min. Qual a velocidade média total (km/h)?",
        answer: "24",
        accept: ["24","24 km/h","24km/h","24,0","24.0"],
        explain: "Distância=20 km. Tempo=50 min=5/6 h. v=20 ÷ (5/6)=24 km/h."
      },
      {
        id: "FCI-02",
        difficulty: 3,
        theory: "No MU: s(t)=s0+vt. O coeficiente de t é v.",
        question: "s(t)=2+3t (SI). Qual s(8) e qual v? Responda: 26 e 3",
        answer: "26 e 3",
        accept: ["26 e 3","26,3","26;3","s=26 v=3","26 e v=3"],
        explain: "s(8)=2+24=26 m. v=3 m/s."
      },
      {
        id: "FCI-03",
        difficulty: 4,
        theory: "Em gráfico s×t, v=Δs/Δt. Se desce, v é negativa.",
        question: "Num gráfico s×t: de s=40 m em t=0 para s=10 m em t=5 s. Qual a velocidade (com sinal)?",
        answer: "-6",
        accept: ["-6","-6 m/s","-6m/s"],
        explain: "v=(10−40)/(5−0)=−30/5=−6 m/s."
      }
    ],

    forcas: [
      {
        id: "FFO-01",
        difficulty: 4,
        theory: "Se força resultante é zero, a velocidade pode ser constante (não precisa estar parado).",
        question: "Um corpo se move em linha reta com velocidade constante. A força resultante é (A) zero ou (B) não-zero?",
        answer: "A",
        accept: ["a","A","zero","força resultante zero"],
        explain: "Velocidade constante → aceleração zero → resultante zero (1ª lei/2ª lei)."
      },
      {
        id: "FFO-02",
        difficulty: 4,
        theory: "Massa não muda com o lugar; peso é P=mg e depende de g.",
        question: "Um astronauta tem massa 70 kg. Na Lua (g menor), massa e peso mudam como?",
        answer: "massa igual; peso menor",
        accept: ["massa igual e peso menor","massa igual; peso menor","massa constante; peso diminui","massa mesma, peso menor"],
        explain: "Massa é constante. Peso P=mg diminui porque g é menor na Lua."
      }
    ],

    energia: [
      {
        id: "FEN-01",
        difficulty: 3,
        theory: "Energia potencial gravitacional: Ep=mgh.",
        question: "Um corpo de 2 kg a 5 m (g=10). Qual a energia potencial (J)?",
        answer: "100",
        accept: ["100","100 J","100J"],
        explain: "Ep=2×10×5=100 J."
      },
      {
        id: "FEN-02",
        difficulty: 4,
        theory: "Sem perdas: Em = Ep + Ec. Então Ec=Em−Ep.",
        question: "Em=200 J. Em um ponto, Ep=120 J. Qual Ec (J)?",
        answer: "80",
        accept: ["80","80 J","80J"],
        explain: "Ec=200−120=80 J."
      }
    ],

    ondas: [
      {
        id: "FON-01",
        difficulty: 3,
        theory: "Som é onda mecânica: precisa de meio material. No vácuo não se propaga.",
        question: "Por que não ouvimos explosões no espaço (vácuo), mesmo se víssemos?",
        answer: "som não se propaga no vácuo",
        accept: ["som não se propaga no vácuo","não há meio material","precisa de meio material","porque no vácuo não há som"],
        explain: "Sem partículas, não há como transportar vibrações mecânicas. No vácuo, não há som."
      },
      {
        id: "FON-02",
        difficulty: 5,
        theory: "A luz chega praticamente instantânea; o som demora. Distância ≈ v_som × atraso.",
        question: "Você vê o relâmpago e ouve o trovão 5 s depois. Estime a distância (v_som≈340 m/s).",
        answer: "1700",
        accept: ["1700","1700 m","1,7 km","1.7 km","1700m"],
        explain: "d≈340×5=1700 m≈1,7 km."
      }
    ]
  }
};

// ===============================
// p5 lifecycle
// ===============================
function preload() {
  // logo na raiz (funcionou no seu teste)
  logoImg = loadImage("logo.png", () => {}, () => {});
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  W = width;
  H = height;

  textFont("system-ui");
  setupUI();
  goMenu();
}

function draw() {
  background(7, 11, 24);
  drawHeader();

  if (state === "menu") drawMenu();
  else if (state === "players") drawPlayers();
  else if (state === "topics") drawTopics();
  else if (state === "round") drawRound();
  else if (state === "result") drawResult();
  else if (state === "final") drawFinal();

  drawToast();
}

// ===============================
// Header + HUD
// ===============================
function drawHeader() {
  noStroke();
  fill(10, 18, 40, 230);
  rect(0, 0, W, 60);

  fill(235);
  textAlign(LEFT, CENTER);
  textSize(16);
  text("PASSA OU REPASSA – 9º ano (Física + Matemática)", 18, 30);

  if (logoImg) image(logoImg, W - 56, 8, 44, 44);
}

// ===============================
// Toast
// ===============================
function toast(msg, seconds = 2) {
  toastMsg = msg;
  toastT = seconds;
}

function drawToast() {
  if (toastT <= 0) return;
  toastT -= deltaTime / 1000;

  const pad = 14;
  textSize(14);
  const tw = textWidth(toastMsg) + pad * 2;

  fill(0, 0, 0, 140);
  rectMode(CENTER);
  rect(W / 2, H - 32, tw, 34, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  text(toastMsg, W / 2, H - 32);
  rectMode(CORNER);
}

// ===============================
// UI DOM (criada uma vez)
// ===============================
function setupUI() {
  // Menu
  btnStart = createButton("JOGAR");
  btnStart.position(18, 420);
  btnStart.style("font-size", "18px");
  btnStart.style("padding", "10px 18px");
  btnStart.mousePressed(() => goPlayers());

  // Players
  btnModeTeams = createButton("Modo: Equipes");
  btnModeTeams.position(18, 78);
  btnModeTeams.mousePressed(() => {
    mode = "teams";
    numPlayers = max(2, numPlayers);
    rebuildNameInputs();
    toast("Modo equipes.");
  });

  btnModeSolo = createButton("Modo: Individual");
  btnModeSolo.position(140, 78);
  btnModeSolo.mousePressed(() => {
    mode = "solo";
    numPlayers = 1;
    rebuildNameInputs();
    toast("Modo individual.");
  });

  btnAddPlayer = createButton("+");
  btnAddPlayer.position(18, 120);
  btnAddPlayer.mousePressed(() => {
    if (mode === "solo") return;
    numPlayers = min(6, numPlayers + 1);
    rebuildNameInputs();
  });

  btnRemovePlayer = createButton("−");
  btnRemovePlayer.position(50, 120);
  btnRemovePlayer.mousePressed(() => {
    if (mode === "solo") return;
    numPlayers = max(2, numPlayers - 1);
    rebuildNameInputs();
  });

  btnGoTopics = createButton("PRÓXIMO: TEMAS");
  btnGoTopics.position(18, 420);
  btnGoTopics.style("font-size", "16px");
  btnGoTopics.style("padding", "8px 14px");
  btnGoTopics.mousePressed(() => {
    players = nameInputs.map((inp, i) => ({
      name: normalizeName(inp.value(), i),
      score: 0
    }));
    goTopics();
  });

  // Topics
  btnSubFis = createButton("Física");
  btnSubFis.position(18, 92);
  btnSubFis.mousePressed(() => {
    selectedSubject = "fisica";
    selectedTopic = Object.keys(QUESTION_BANK_9ANO.fisica)[0];
    rebuildTopicButtons();
    toast("Física selecionada.");
  });

  btnSubMat = createButton("Matemática");
  btnSubMat.position(90, 92);
  btnSubMat.mousePressed(() => {
    selectedSubject = "matematica";
    selectedTopic = Object.keys(QUESTION_BANK_9ANO.matematica)[0];
    rebuildTopicButtons();
    toast("Matemática selecionada.");
  });

  btnGoPlayers = createButton("← Voltar");
  btnGoPlayers.position(18, 420);
  btnGoPlayers.mousePressed(() => goPlayers());

  btnFinish = createButton("COMEÇAR PARTIDA");
  btnFinish.position(120, 420);
  btnFinish.style("font-size", "16px");
  btnFinish.style("padding", "8px 14px");
  btnFinish.mousePressed(() => startMatch());

  // Round
  answerInput = createInput("");
  answerInput.position(18, 470);
  answerInput.size(260);

  btnAnswer = createButton("Responder");
  btnAnswer.position(290, 470);
  btnAnswer.mousePressed(() => submitAnswer());

  btnPass = createButton("Passar");
  btnPass.position(380, 470);
  btnPass.mousePressed(() => doPass());

  btnRepass = createButton("Repassar");
  btnRepass.position(450, 470);
  btnRepass.mousePressed(() => doRepass());

  btnHint = createButton("Pista (−50)");
  btnHint.position(540, 470);
  btnHint.mousePressed(() => useHint());

  btnNext = createButton("Próxima");
  btnNext.position(650, 470);
  btnNext.mousePressed(() => nextAfterResult());
  btnNext.hide();

  rebuildNameInputs();
  rebuildTopicButtons();

  hideAllUI();
}

// ===============================
// UI helpers
// ===============================
function hideAllUI() {
  // menu
  btnStart.hide();

  // players
  btnModeTeams.hide();
  btnModeSolo.hide();
  btnAddPlayer.hide();
  btnRemovePlayer.hide();
  btnGoTopics.hide();
  for (const inp of nameInputs) inp.hide();

  // topics
  btnSubFis.hide();
  btnSubMat.hide();
  btnGoPlayers.hide();
  btnFinish.hide();
  for (const b of topicButtons) b.hide();

  // round/result
  answerInput.hide();
  btnAnswer.hide();
  btnPass.hide();
  btnRepass.hide();
  btnHint.hide();
  btnNext.hide();
}

function rebuildNameInputs() {
  for (const inp of nameInputs) inp.remove();
  nameInputs = [];

  const y0 = 165;
  for (let i = 0; i < numPlayers; i++) {
    const placeholder = (mode === "teams") ? `Equipe ${i + 1}` : `Jogador ${i + 1}`;
    const inp = createInput(placeholder);
    inp.position(18, y0 + i * 32);
    inp.size(260);
    nameInputs.push(inp);
  }
}

function rebuildTopicButtons() {
  for (const b of topicButtons) b.remove();
  topicButtons = [];

  const topics = Object.keys(QUESTION_BANK_9ANO[selectedSubject]);

  let x = 18, y = 140;
  for (const t of topics) {
    const b = createButton(t);
    b.position(x, y);
    b.mousePressed(() => {
      selectedTopic = t;
      toast(`Tema: ${t}`);
    });
    topicButtons.push(b);
    y += 32;
  }
}

// ===============================
// Navigation
// ===============================
function goMenu() {
  state = "menu";
  hideAllUI();
  btnStart.show();
}

function goPlayers() {
  state = "players";
  hideAllUI();

  btnModeTeams.show();
  btnModeSolo.show();
  btnAddPlayer.show();
  btnRemovePlayer.show();
  btnGoTopics.show();
  for (const inp of nameInputs) inp.show();
}

function goTopics() {
  state = "topics";
  hideAllUI();

  btnSubFis.show();
  btnSubMat.show();
  btnGoPlayers.show();
  btnFinish.show();
  for (const b of topicButtons) b.show();
}

function startMatch() {
  // reset partida
  roundIndex = 0;
  currentPlayerIndex = 0;
  repassActive = false;
  repassFromIndex = null;

  state = "round";
  hideAllUI();
  showRoundUI();
  startRound();
}

function showRoundUI() {
  answerInput.show();
  btnAnswer.show();
  btnPass.show();
  btnRepass.show();
  btnHint.show();
  btnNext.hide();
}

// ===============================
// Screens (Canvas)
// ===============================
function drawMenu() {
  // painel central
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 330, 18);

  fill(240);
  textAlign(CENTER, TOP);
  textSize(34);
  text("PASSA OU REPASSA", W / 2, 110);

  textSize(18);
  fill(200);
  text("Física + Matemática • 9º Ano\nPerguntas por tema, com teoria e explicação.", W / 2, 165);

  // regras rápidas
  textSize(14);
  fill(220);
  text(
    "Regras:\n• Acerto: + (dificuldade × 100)\n• Erro: −50\n• Passar: 0\n• Repassar: outro responde a mesma pergunta\n• Pista: revela teoria (−50)",
    W / 2,
    240
  );

  // logo maior
  if (logoImg) image(logoImg, W / 2 - 60, 330, 120, 120);

  fill(200);
  textSize(12);
  text("Clique em JOGAR para começar.", W / 2, 400);
}

function drawPlayers() {
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 380, 18);

  fill(235);
  textAlign(LEFT, TOP);
  textSize(22);
  text("Etapa 2: Jogadores / Equipes", 30, 100);

  fill(200);
  textSize(14);
  text(
    "Digite os nomes abaixo. No modo Equipes você pode usar nomes tipo: Equipe Azul, Equipe Verde.\n" +
    "Dica: 3 equipes costuma ficar bem dinâmico.",
    30, 140
  );

  // preview
  fill(220);
  textSize(12);
  text("Prévia:", 320, 170);
  textSize(12);
  fill(210);
  const preview = nameInputs.map(i => i.value().trim()).filter(x => x.length).join(" • ");
  text(preview.length ? preview : "(ainda sem nomes)", 320, 190, W - 360, 80);

  if (logoImg) image(logoImg, W - 180, 320, 140, 140);
}

function drawTopics() {
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 380, 18);

  fill(235);
  textAlign(LEFT, TOP);
  textSize(22);
  text("Etapa 3–4: Disciplina e Tema", 30, 100);

  fill(200);
  textSize(14);
  text(
    "Escolha a disciplina e o tema. As perguntas são de 9º ano e incluem teoria + explicação.\n" +
    "Sugestão: comece com Cinemática ou Função Afim.",
    30, 140
  );

  fill(230);
  textSize(16);
  text(`Disciplina atual: ${selectedSubject.toUpperCase()}`, 320, 110);
  textSize(16);
  text(`Tema atual: ${selectedTopic}`, 320, 140);

  fill(180);
  textSize(12);
  text("Os botões do tema ficam à esquerda. Depois clique em 'COMEÇAR PARTIDA'.", 320, 170);

  // lista de jogadores
  fill(220);
  textSize(12);
  text("Jogadores/Equipes:", 320, 210);
  fill(210);
  text(players.map(p => p.name).join(" • "), 320, 230, W - 360, 80);

  if (logoImg) image(logoImg, W - 180, 320, 140, 140);
}

function drawRound() {
  // timer
  if (timerRunning) {
    timeLeft -= deltaTime / 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      timerRunning = false;
      finishQuestion(false, "Tempo esgotado!");
    }
  }

  // painel principal
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 370, 18);

  // infos topo
  fill(235);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`Rodada ${roundIndex + 1} / ${totalRounds}`, 30, 95);
  text(`Disciplina: ${selectedSubject.toUpperCase()} • Tema: ${selectedTopic}`, 30, 120);

  // vez
  fill(0, 255, 160);
  textSize(18);
  const turnName = players[currentPlayerIndex].name;
  text(`Vez: ${turnName}${repassActive ? " (REPASSA)" : ""}`, 30, 150);

  // tempo
  textAlign(RIGHT, TOP);
  fill(255);
  textSize(22);
  text(`${Math.ceil(timeLeft)}s`, W - 30, 95);

  // teoria (pista)
  textAlign(LEFT, TOP);
  textSize(14);
  fill(hintUsed ? color(255, 230, 160) : color(170));
  const theoryText = hintUsed ? currentQ.theory : "Pista disponível: clique em 'Pista (−50)' para revelar teoria.";
  text(`Teoria: ${theoryText}`, 30, 190, W - 60, 60);

  // pergunta
  fill(235);
  textSize(18);
  text("Pergunta:", 30, 260);
  fill(235);
  textSize(16);
  text(currentQ.question, 30, 290, W - 60, 120);

  // placar rápido
  drawMiniScore();

  fill(180);
  textSize(12);
  textAlign(LEFT, TOP);
  text("Digite a resposta e clique em Responder. Use vírgula ou ponto (o jogo aceita).", 30, 430);
}

function drawMiniScore() {
  fill(10, 18, 40, 220);
  rect(18, 460, W - 36, 60, 18);

  textAlign(LEFT, CENTER);
  textSize(12);
  fill(220);
  const line = players.map(p => `${p.name}: ${p.score}`).join("   |   ");
  text(line, 30, 490);
}

function drawResult() {
  // painel
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 370, 18);

  fill(235);
  textAlign(LEFT, TOP);
  textSize(20);
  text("Resultado + Explicação", 30, 95);

  fill(255, 230, 160);
  textSize(14);
  text(`Teoria: ${currentQ.theory}`, 30, 135, W - 60, 60);

  fill(235);
  textSize(14);
  text(`Explicação: ${currentQ.explain}`, 30, 200, W - 60, 160);

  fill(200);
  textSize(12);
  text("Clique em 'Próxima' para continuar a partida.", 30, 420);

  drawMiniScore();
}

function drawFinal() {
  fill(10, 18, 40, 220);
  rect(18, 80, W - 36, 430, 18);

  fill(235);
  textAlign(CENTER, TOP);
  textSize(26);
  text("PLACAR FINAL", W / 2, 95);

  const sorted = [...players].sort((a, b) => b.score - a.score);

  textAlign(LEFT, TOP);
  let y = 160;
  textSize(18);
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    fill(i === 0 ? color(0, 255, 160) : color(235));
    text(`${i + 1}º  ${p.name}  —  ${p.score} pts`, 220, y);
    y += 38;
  }

  if (logoImg) image(logoImg, 60, 170, 140, 140);

  fill(200);
  textAlign(CENTER, TOP);
  textSize(12);
  text("Dica: aperte R para reiniciar (volta ao menu).", W / 2, 470);
}

// ===============================
// Round mechanics
// ===============================
function startRound() {
  currentQ = pickQuestion(selectedSubject, selectedTopic);

  timeLeft = timePerQuestion;
  timerRunning = true;

  repassActive = false;
  repassFromIndex = null;
  hintUsed = false;

  answerInput.value("");
  toast(`Vez de: ${players[currentPlayerIndex].name}`);
}

function submitAnswer() {
  if (state !== "round") return;

  const user = answerInput.value();
  const ok = checkAnswer(currentQ, user);
  finishQuestion(ok, ok ? "Resposta correta!" : "Resposta incorreta.");
}

function doPass() {
  if (state !== "round") return;
  timerRunning = false;

  toast("Passou a vez.");
  rotateTurn();
  startRound();
}

function doRepass() {
  if (state !== "round") return;
  if (players.length < 2) {
    toast("Repassa precisa de pelo menos 2 equipes/jogadores.");
    return;
  }

  repassActive = true;
  repassFromIndex = currentPlayerIndex;

  toast(`Repassou! Próximo responde a MESMA pergunta.`);
  rotateTurn();

  // tempo menor para repassa (mais tensão)
  timeLeft = Math.min(20, timePerQuestion);
  timerRunning = true;

  answerInput.value("");
}

function useHint() {
  if (state !== "round") return;
  if (hintUsed) return;

  hintUsed = true;
  players[currentPlayerIndex].score -= 50;
  toast("Pista liberada (−50).");
}

function finishQuestion(correct, msg) {
  timerRunning = false;

  if (correct) {
    const pts = currentQ.difficulty * 100;
    players[currentPlayerIndex].score += pts;
    toast(`${msg} (+${pts})`);
  } else {
    players[currentPlayerIndex].score -= 50;

    if (repassActive && repassFromIndex !== null) {
      players[repassFromIndex].score += 100;
      toast(`${msg} (−50). Bônus +100 para ${players[repassFromIndex].name}`);
    } else {
      toast(`${msg} (−50)`);
    }
  }

  // vai para tela de resultado
  state = "result";

  // UI
  answerInput.hide();
  btnAnswer.hide();
  btnPass.hide();
  btnRepass.hide();
  btnHint.hide();
  btnNext.show();
}

function nextAfterResult() {
  // próxima rodada
  btnNext.hide();
  showRoundUI();

  roundIndex++;

  if (roundIndex >= totalRounds) {
    // fim da partida
    state = "final";
    hideAllUI();
    return;
  }

  // após resultado, sempre gira a vez (jogo de turnos)
  rotateTurn();
  state = "round";
  startRound();
}

function rotateTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
}

function pickQuestion(subject, topic) {
  const list = QUESTION_BANK_9ANO[subject][topic];
  return random(list);
}

// ===============================
// Utils
// ===============================
function normalizeName(s, i) {
  const t = (s || "").trim();
  if (t.length) return t;
  return (mode === "teams") ? `Equipe ${i + 1}` : `Jogador ${i + 1}`;
}

function normalizeAnswer(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(",", ".");
}

function checkAnswer(q, user) {
  const u = normalizeAnswer(user);
  const a = normalizeAnswer(q.answer);

  if (u === a) return true;
  if (q.accept && q.accept.some(x => normalizeAnswer(x) === u)) return true;

  // tolerância numérica
  const un = Number(u);
  const an = Number(a);
  if (!Number.isNaN(un) && !Number.isNaN(an)) {
    return Math.abs(un - an) < 1e-6;
  }
  return false;
}

// ===============================
// Keyboard shortcuts
// ===============================
function keyPressed() {
  // R reinicia para o menu
  if (key === "r" || key === "R") {
    goMenu();
  }

  // P: professor encerra e vai para placar
  if (key === "p" || key === "P") {
    state = "final";
    hideAllUI();
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  W = width;
  H = height;
}
