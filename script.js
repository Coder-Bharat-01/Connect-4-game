const COLS = 7, ROWS = 6;
let board, currentPlayer, players, gameOver;

const welcomePage = document.getElementById("welcomePage");
const setupPage = document.getElementById("setupPage");
const gamePage = document.getElementById("gamePage");
const startBtn = document.getElementById("startBtn");
const setupForm = document.getElementById("setupForm");
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const player1Box = document.getElementById("player1Box");
const player2Box = document.getElementById("player2Box");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const restartBtn = document.getElementById("restartBtn");
const dropSound = document.getElementById("dropSound");
const winSound = document.getElementById("winSound");
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  page.classList.add("active");
}

startBtn.addEventListener("click", () => showPage(setupPage));

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const p1Name = document.getElementById("player1Name").value || "Player 1";
  const p2Name = document.getElementById("player2Name").value || "Player 2";
  const p1Color = document.getElementById("player1Color").value;
  const p2Color = document.getElementById("player2Color").value;

  if (p1Color === p2Color) {
    alert("Both players cannot have same color!");
    return;
  }

  players = [
    { name: p1Name, color: p1Color },
    { name: p2Name, color: p2Color }
  ];
  currentPlayer = 0;

  startGame();
});

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameOver = false;
  createBoard();
  updateStatus();

  player1Box.innerHTML = `${players[0].name}<br>(<span style="color:${players[0].color}">${players[0].color.toUpperCase()}</span>)`;
  player2Box.innerHTML = `${players[1].name}<br>(<span style="color:${players[1].color}">${players[1].color.toUpperCase()}</span>)`;

  showPage(gamePage);
}

function createBoard() {
  boardEl.innerHTML = "";
  for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleClick(c));
      boardEl.appendChild(cell);
    }
  }
}

function handleClick(col) {
  if (gameOver) return;

  let row = board.findIndex((_, r) => !board[r][col]);
  if (row === -1) return;

  board[row][col] = players[currentPlayer].color;
  addDisc(row, col, players[currentPlayer].color);

  if (checkWin(row, col)) {
    popupMessage.textContent = `${players[currentPlayer].name} Wins! 🎉`;
    popup.classList.add("active");
    winSound.currentTime = 0;
    winSound.play();
    launchConfetti();
    gameOver = true;
    return;
  }

  if (board.every(row => row.every(cell => cell !== null))) {
    popupMessage.textContent = "It's a Draw! 🤝";
    popup.classList.add("active");
    winSound.currentTime = 0;
    winSound.play();
    launchConfetti();
    gameOver = true;
    return;
  }

  currentPlayer = 1 - currentPlayer;
  updateStatus();
}

// Disc drop animation + sound
function addDisc(r, c, color) {
  const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
  const disc = document.createElement("div");
  disc.classList.add("disc", color);
  disc.style.top = "-70px"; 
  cell.appendChild(disc);

  setTimeout(() => {
    disc.style.top = "0px";
    dropSound.currentTime = 0;
    dropSound.play();
  }, 20);
}

function updateStatus() {
  const player = players[currentPlayer];
  statusEl.innerHTML = `${player.name}'s turn (<span style="color:${player.color}">${player.color.toUpperCase()}</span>)`;
}

function checkWin(r, c) {
  return (
    checkDir(r, c, 1, 0) ||
    checkDir(r, c, 0, 1) ||
    checkDir(r, c, 1, 1) ||
    checkDir(r, c, 1, -1)
  );
}

function checkDir(r, c, dr, dc) {
  let color = board[r][c];
  let cells = [[r, c]];

  let rr = r + dr, cc = c + dc;
  while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === color) {
    cells.push([rr, cc]); rr += dr; cc += dc;
  }
  rr = r - dr; cc = c - dc;
  while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === color) {
    cells.push([rr, cc]); rr -= dr; cc -= dc;
  }

  if (cells.length >= 4) {
    highlightWin(cells);
    return true;
  }
  return false;
}

function highlightWin(cells) {
  cells.forEach(([r, c]) => {
    document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`).classList.add("win");
  });
}

restartBtn.addEventListener("click", () => {
  popup.classList.remove("active");
  showPage(welcomePage);
});

// ---------------------- CONFETTI ----------------------
let confettiPieces = [];
let confettiActive = false;
let confettiTimeout;

function launchConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiPieces = Array.from({ length: 200 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    w: 6,
    h: 14,
    color: `hsl(${Math.random()*360},100%,50%)`,
    speed: Math.random() * 3 + 2,
    angle: Math.random() * 360
  }));
  confettiActive = true;
  requestAnimationFrame(updateConfetti);

  // ✅ Stop after 3 seconds
  clearTimeout(confettiTimeout);
  confettiTimeout = setTimeout(() => { confettiActive = false; }, 3000);
}

function updateConfetti() {
  if (!confettiActive) {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.w/2, p.h/2, p.angle, 0, 2 * Math.PI);
    ctx.fill();
    p.y += p.speed;
    p.x += Math.sin(p.angle) * 2;
    if (p.y > confettiCanvas.height) p.y = -10;
  });
  requestAnimationFrame(updateConfetti);
}