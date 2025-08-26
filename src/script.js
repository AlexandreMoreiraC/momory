const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const rankingScreen = document.getElementById("ranking-screen");
const playerNameInput = document.getElementById("player-name");
const difficultyButtons = document.querySelectorAll("#difficulty button");
const timerEl = document.getElementById("timer");
const board = document.getElementById("game-board");

const backToStartBtn = document.getElementById("back-to-start");
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
const homeScreen = document.getElementById("home-screen");

const idadeSelect = document.getElementById("idade");
const temaSelect = document.getElementById("tema");

let cards = [];
let flippedCards = [];
let lockBoard = false;
let timeLeft = 0;
let initialTime = 60;
let countdownInterval;
let playerName = "";

// Sons
const flipSound = new Audio("/assets/flip.mp3");
const matchSound = new Audio("/assets/match.mp3");
const winSound = new Audio("/assets/win.mp3");
const loseSound = new Audio("/assets/lose.mp3");

// Conteúdo educativo (emojis)
const conteudos = {
  cores: {
    "4": ["🔴", "🔵", "🟢", "🟡"],
    "6": ["🟣", "🟠", "⚪", "⚫", "🟤", "🟥"],
    "8": ["🌈", "🎨", "💠", "🔶", "🔷", "🟪", "🟩", "🟦"]
  },
  animais: {
    "4": ["🐶", "🐱", "🐭", "🐹"],
    "6": ["🐰", "🦊", "🐻", "🐼", "🦄", "🐨"],
    "8": ["🦁", "🐯", "🐨", "🦉", "🐸", "🐵", "🐷", "🐔"]
  },
  matematica: {
    "4": ["1️⃣", "2️⃣", "3️⃣", "4️⃣"],
    "6": ["5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "0️⃣"],
    "8": ["➕", "➖", "✖️", "➗", "=", "1️⃣", "2️⃣", "3️⃣"]
  }
  
};

// Navegação home -> start
goToStartBtn.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// Seleção de dificuldade e início do jogo
difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    playerName = playerNameInput.value.trim() || "Jogador";
    initialTime = parseInt(btn.dataset.time);
    timeLeft = initialTime;
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    startGame();
  });
});

// Ver ranking
goToRankingBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  rankingScreen.classList.remove("hidden");
  updateRankingList();
});

function startGame(){
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

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCards() {
  winModal.classList.add("hidden");
  loseModal.classList.add("hidden");
  flippedCards = [];
  lockBoard = false;

  // Seleciona conteúdo baseado na idade e tema
  const idade = idadeSelect.value || "4";
  const tema = temaSelect.value || "cores";
  const conteudoEscolhido = conteudos[tema][idade];
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
    setTimeout(()=>{
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

// Botões modais
closeWinBtn.addEventListener("click", () => {
  winModal.classList.add("hidden");
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

closeLoseBtn.addEventListener("click", () => {
  loseModal.classList.add("hidden");
  gameScreen.classList.add("hidden");
  rankingScreen.classList.remove("hidden");
  updateRankingList();
});

// Botões de voltar/reiniciar
backToStartBtn.addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;
});

restartRankingBtn.addEventListener("click", () => {
  rankingScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  clearInterval(countdownInterval);
  flippedCards = [];
  lockBoard = false;
  board.innerHTML = "";
  timeLeft = initialTime;
});
