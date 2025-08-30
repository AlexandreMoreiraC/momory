// ------------------------
// Elementos do DOM
// ------------------------
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const ticScreen = document.getElementById("tic-screen");
const rankingScreen = document.getElementById("ranking-screen");
const playerNameInput = document.getElementById("player-name");
const difficultyButtons = document.querySelectorAll("#difficulty button");
const timerEl = document.getElementById("timer");
const board = document.getElementById("game-board");

const exitGameBtn = document.getElementById("exit-game");
const exitModal = document.getElementById("exit-modal");
const exitYesBtn = document.getElementById("exit-yes");
const exitNoBtn = document.getElementById("exit-no");

const winModal = document.getElementById("win-modal");
const winMessage = document.getElementById("win-message");
const closeWinBtn = document.getElementById("close-win");

const loseModal = document.getElementById("lose-modal");
const loseMessage = document.getElementById("lose-message");
const closeLoseBtn = document.getElementById("close-lose");

const rankingList = document.getElementById("ranking-list");
const restartRankingBtn = document.getElementById("restart-ranking");
const goToRankingBtn = document.getElementById("go-to-ranking");
const goToStartBtn = document.getElementById("go-to-start");
const goToTicBtn = document.getElementById("go-to-tic");
const homeScreen = document.getElementById("home-screen");
const temaSelect = document.getElementById("tema");


// ------------------------
// Jogo da Velha 1 jogador
// ------------------------
const ticBoard = document.getElementById("tic-board");
const ticCells = document.querySelectorAll(".tic-cell");
const ticTurn = document.getElementById("tic-turn");
const ticRestartBtn = document.getElementById("tic-restart");
const ticExitBtn = document.getElementById("tic-exit");

let ticCurrentPlayer = "X";
let ticBoardState = ["","","","","","","","",""];
let ticGameOver = false;
let ticDifficulty = "facil"; // fácil, medio, dificil


// ------------------------
// Sons do jogo
// ------------------------
const flipSound = new Audio("/assets/flip.mp3");
const matchSound = new Audio("/assets/match.mp3");
const winSound = new Audio("/assets/win.mp3");
const loseSound = new Audio("/assets/lose.mp3");



// Música de fundo
const bgMusic = document.getElementById("bg-music");
bgMusic.volume = 0.5;

const homeButtons = document.querySelectorAll("#home-screen button");

homeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    bgMusic.play().catch(() => {
      console.log("Usuário precisa interagir para tocar música.");
    });
  });
});



// ------------------------
// Variáveis Jogo da Memória
// ------------------------
let cards = [];
let flippedCards = [];
let lockBoard = false;
let timeLeft = 0;
let initialTime = 60;
let countdownInterval;
let playerName = "";

// Conteúdos educativos
const conteudos = {

  animais: {
    "10": [
      "🦁","🐯","🐼","🐨","🐸","🐵","🐧","🦉","🦄","🦋",
      "🐙","🦈","🐬","🦅","🦊","🦝","🦖","🦒","🦩","🦦"
    ]
  }
};

// ------------------------
// Controle de jogo atual
// ------------------------
let currentGame = "memory";

// ------------------------
// Navegação Home
// ------------------------
goToStartBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  currentGame = "memory";

  // Mostra categoria quando for Memória
  document.getElementById("education-options").style.display = "block";
});

goToTicBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  currentGame = "tic";

  // Esconde categoria quando for Velha
  document.getElementById("education-options").style.display = "none";
});

// ------------------------
// Seleção de dificuldade
// ------------------------
difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim() || "Jogador";
    let dificuldade = btn.dataset.difficulty;

    if(currentGame === "memory"){
      if(dificuldade === "facil") initialTime = 180;
      if(dificuldade === "medio") initialTime = 150;
      if(dificuldade === "dificil") initialTime = 120;

      timeLeft = initialTime;
      startScreen.classList.add("hidden");
      gameScreen.classList.remove("hidden");
      startMemoryGame();
    } else if(currentGame === "tic"){
      ticDifficulty = dificuldade;
      startScreen.classList.add("hidden");
      ticScreen.classList.remove("hidden");
      startTicGame();
    }
  });
});

// ------------------------
// Funções Jogo da Memória
// ------------------------
function startMemoryGame(){
  createCards();
  startTimer();
}

function startTimer() {
  clearInterval(countdownInterval);
  timerEl.textContent = `Tempo: ${timeLeft}s`;
  countdownInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Tempo: ${timeLeft}s`;
    if(timeLeft <= 0){
      clearInterval(countdownInterval);
      loseSound.play();
      showLoseModal();
    }
  }, 1000);
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function createCards() {
  winModal.classList.add("hidden");
  loseModal.classList.add("hidden");
  flippedCards = [];
  lockBoard = false;

  const tema = temaSelect.value || "cores";
  let conteudoEscolhido = [...conteudos[tema]["10"]];
  let pares = 15;
  while(conteudoEscolhido.length < pares) conteudoEscolhido = conteudoEscolhido.concat(conteudoEscolhido);
  conteudoEscolhido = conteudoEscolhido.slice(0, pares);

  cards = shuffle([...conteudoEscolhido, ...conteudoEscolhido]);
  board.innerHTML = "";

  cards.forEach(value => {
    const card = document.createElement("div");
    card.classList.add("card");

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.textContent = value;

    cardInner.appendChild(front);
    cardInner.appendChild(back);
    card.appendChild(cardInner);
    board.appendChild(card);

    card.addEventListener("click", () => flipCard(card, value));
  });
}

function flipCard(card, value){
  if(lockBoard || card.classList.contains("flipped")) return;
  card.classList.add("flipped");
  flippedCards.push({ card, value });
  flipSound.play();
  if(flippedCards.length === 2) checkMatch();
}

function checkMatch(){
  const [first, second] = flippedCards;
  if(first.value === second.value){
    matchSound.play();
    flippedCards = [];
    checkWin();
  } else {
    lockBoard = true;
    setTimeout(()=> {
      first.card.classList.remove("flipped");
      second.card.classList.remove("flipped");
      flippedCards = [];
      lockBoard = false;
    },1000);
  }
}

function checkWin(){
  const allFlipped = document.querySelectorAll(".card.flipped");
  if(allFlipped.length === cards.length){
    clearInterval(countdownInterval);
    winSound.play();
    saveRanking(timeLeft);
    winMessage.textContent = `🎉 Parabéns ${playerName}! Tempo restante: ${timeLeft}s`;
    confettiEffect();
    winModal.classList.remove("hidden");
  }
}

function confettiEffect() {
  for(let i=0;i<50;i++){
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.backgroundColor = `hsl(${Math.random()*360}, 100%, 50%)`;
    confetti.style.left = Math.random()*window.innerWidth + "px";
    confetti.style.animationDuration = 2 + Math.random()*2 + "s";
    document.body.appendChild(confetti);
    setTimeout(()=> confetti.remove(), 3000);
  }
}

function showLoseModal() {
  loseMessage.textContent = `😢 Tempo esgotado! Você perdeu, ${playerName}!`;
  loseModal.classList.remove("hidden");
}

function saveRanking(score){
  const rankings = JSON.parse(localStorage.getItem("memoryRanking")) || [];
  rankings.push({ name: playerName, time: score });
  rankings.sort((a,b)=> b.time - a.time);
  localStorage.setItem("memoryRanking", JSON.stringify(rankings));
}

function updateRankingList(){
  rankingList.innerHTML = "";
  const rankings = JSON.parse(localStorage.getItem("memoryRanking")) || [];
  rankings.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name} - ${r.time}s`;
    rankingList.appendChild(li);
  });
}

// ------------------------
// Modais e controles gerais
// ------------------------
closeWinBtn.addEventListener("click", () => {
  startScreen.classList.remove("hidden"); // MOSTRA A TELA DE DIFICULDADE
  gameScreen.classList.add("hidden");
  ticScreen.classList.add("hidden");
  rankingScreen.classList.add("hidden");
  winModal.classList.add("hidden");
  
  ticGameOver = true;
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;

  // Mostrar categoria apenas se for memória
  if(currentGame === "memory") {
    document.getElementById("education-options").style.display = "block";
  } else {
    document.getElementById("education-options").style.display = "none";
  }
});

closeLoseBtn.addEventListener("click", () => {
  startScreen.classList.remove("hidden"); // MOSTRA A TELA DE DIFICULDADE
  gameScreen.classList.add("hidden");
  ticScreen.classList.add("hidden");
  rankingScreen.classList.add("hidden");
  loseModal.classList.add("hidden");
  
  ticGameOver = true;
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;

  // Mostrar categoria apenas se for memória
  if(currentGame === "memory") {
    document.getElementById("education-options").style.display = "block";
  } else {
    document.getElementById("education-options").style.display = "none";
  }
});


exitGameBtn.addEventListener("click", () => { exitModal.classList.remove("hidden"); });
exitYesBtn.addEventListener("click", () => {
  exitModal.classList.add("hidden");
  gameScreen.classList.add("hidden");
  ticScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  ticGameOver = true;
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;
});
exitNoBtn.addEventListener("click", () => { exitModal.classList.add("hidden"); });

restartRankingBtn.addEventListener("click", () => {
  homeScreen.classList.remove("hidden");
  startScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  ticScreen.classList.add("hidden");
  rankingScreen.classList.add("hidden");
  ticGameOver = true;
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;
});

// ------------------------
// Jogo da Velha Inteligente
// ------------------------
function startTicGame() {
  ticBoardState = ["","","","","","","","",""];
  ticCurrentPlayer = "X";
  ticGameOver = false;
  ticCells.forEach(cell => cell.textContent = "");
  ticTurn.textContent = `Sua vez: ${ticCurrentPlayer}`;
}

ticCells.forEach(cell => {
  cell.addEventListener("click", () => {
    if(ticGameOver || cell.textContent !== "" || ticCurrentPlayer !== "X") return;
    playerMove(cell.dataset.index);
  });
});

function playerMove(index){
  ticBoardState[index] = "X";
  ticCells[index].textContent = "X";
  checkTicWin();
  if(!ticGameOver){
    ticCurrentPlayer = "O";
    ticTurn.textContent = "Kloo jogando...";
    setTimeout(computerMove, 500);
  }
}

function computerMove(){
  if(ticGameOver) return;
  let choice;

  if(ticDifficulty === "facil"){
    // Fácil: aleatório simples
    const emptyIndexes = ticBoardState.map((v,i)=> v===""?i:null).filter(v=>v!==null);
    choice = emptyIndexes[Math.floor(Math.random()*emptyIndexes.length)];
  } else if(ticDifficulty === "medio"){
    // Médio: inteligência básica
    choice = mediumMove();
  } else if(ticDifficulty === "dificil"){
    // Difícil: MiniMax com chance de erro
    choice = minimaxMove();
  }

  ticBoardState[choice] = "O";
  ticCells[choice].textContent = "O";
  checkTicWin();
  if(!ticGameOver){
    ticCurrentPlayer = "X";
    ticTurn.textContent = "Sua vez: X";
  }
}

function checkTicWin() {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for(const combo of winCombos) {
    const [a,b,c] = combo;
    if(ticBoardState[a] && ticBoardState[a] === ticBoardState[b] && ticBoardState[a] === ticBoardState[c]){
      ticGameOver = true;
      if(ticBoardState[a] === "X"){
        winSound.play();
        winMessage.textContent = `🎉 Parabéns ${playerName}! Você venceu o Jogo da Velha!`;
        winModal.classList.remove("hidden");
      } else {
        loseSound.play();
        loseMessage.textContent = `😢 Você perdeu para o Kloo!`;
        loseModal.classList.remove("hidden");
      }
      return;
    }
  }

  if(!ticBoardState.includes("")){
    ticGameOver = true;
    loseSound.play();
    loseMessage.textContent = `🤝 Empate!`;
    loseModal.classList.remove("hidden");
  }
}

// ------------------------
// Inteligência médio
// ------------------------
function mediumMove(){
  const empty = ticBoardState.map((v,i)=> v===""?i:null).filter(v=>v!==null);

  // Bloqueia o jogador ou tenta ganhar
  for(let combo of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]){
    let [a,b,c] = combo;
    const line = [ticBoardState[a],ticBoardState[b],ticBoardState[c]];

    // Tenta ganhar
    if(line.filter(x=>"O"===x).length===2 && line.includes("")) return combo[line.indexOf("")];
    // Bloqueia jogador
    if(line.filter(x=>"X"===x).length===2 && line.includes("")) return combo[line.indexOf("")];
  }

  // Senão, aleatório
  return empty[Math.floor(Math.random()*empty.length)];
}

// ------------------------
// MiniMax (Difícil) Ajustado
// ------------------------
function minimaxMove(){
  function minimax(board, player){
    const empty = board.map((v,i)=> v===""?i:null).filter(v=>v!==null);
    const winner = getWinner(board);
    if(winner === "O") return {score:1};
    if(winner === "X") return {score:-1};
    if(empty.length===0) return {score:0};

    let moves = [];
    for(let i of empty){
      const newBoard = [...board];
      newBoard[i] = player;
      const result = minimax(newBoard, player==="O"?"X":"O");
      moves.push({index:i, score: result.score});
    }

    if(player==="O"){
      const maxScore = Math.max(...moves.map(m => m.score));
      const bestMoves = moves.filter(m => m.score === maxScore);
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      const minScore = Math.min(...moves.map(m => m.score));
      const bestMoves = moves.filter(m => m.score === minScore);
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
  }

  const empty = ticBoardState.map((v,i)=> v===""?i:null).filter(v=>v!==null);

  // 20% de chance de erro proposital (permite ganhar)
  if(Math.random() < 0.2){
    return empty[Math.floor(Math.random() * empty.length)];
  }

  return minimax(ticBoardState,"O").index;
}

function getWinner(board){
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const combo of winCombos){
    const [a,b,c] = combo;
    if(board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
  }
  return null;
}

// ------------------------
// Controles Jogo da Velha
// ------------------------
ticRestartBtn.addEventListener("click", () => startTicGame());
ticExitBtn.addEventListener("click", () => exitModal.classList.remove("hidden"));

// ------------------------
// Inicialização automática do ranking
// ------------------------
updateRankingList();
