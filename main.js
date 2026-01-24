const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const moveSound = document.getElementById("moveSound");

let board = [];
let score = 0;
let startX, startY;

function startGame() {
  board = Array(16).fill(0);
  score = 0;
  scoreDisplay.textContent = score;
  message.classList.add("hidden");
  addNumber();
  addNumber();
  drawBoard();
}

function drawBoard() {
  grid.innerHTML = "";
  board.forEach(v => {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (v) {
      cell.textContent = v;
      cell.classList.add(`cell-${v}`);
    }
    grid.appendChild(cell);
  });
}

function addNumber() {
  let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
  if (!empty.length) return;
  board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.9 ? 4 : 2;
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < 4; r++) {
    let row = board.slice(r * 4, r * 4 + 4).filter(v => v);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row[i + 1] = 0;
      }
    }
    row = row.filter(v => v);
    while (row.length < 4) row.push(0);
    board.splice(r * 4, 4, ...row);
    moved = true;
  }
  return moved;
}

function rotate() {
  const newBoard = [];
  for (let i = 0; i < 4; i++)
    for (let j = 3; j >= 0; j--)
      newBoard.push(board[j * 4 + i]);
  board = newBoard;
}

function canMove() {
  if (board.includes(0)) return true;
  for (let i = 0; i < 16; i++) {
    if ((i % 4 !== 3 && board[i] === board[i + 1]) ||
        (i < 12 && board[i] === board[i + 4])) return true;
  }
  return false;
}

function handleMove(action) {
  let old = board.toString();

  action();

  if (old !== board.toString()) {
    addNumber();
    drawBoard();
    scoreDisplay.textContent = score;
    moveSound.currentTime = 0;
    moveSound.play();
  }

  if (!canMove()) {
    message.classList.remove("hidden");
  }
}

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") handleMove(moveLeft);
  if (e.key === "ArrowUp") handleMove(() => { rotate(); moveLeft(); rotate(); rotate(); rotate(); });
  if (e.key === "ArrowRight") handleMove(() => { rotate(); rotate(); moveLeft(); rotate(); rotate(); });
  if (e.key === "ArrowDown") handleMove(() => { rotate(); rotate(); rotate(); moveLeft(); rotate(); });
});

/* SWIPE */
grid.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

grid.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) handleMove(() => { rotate(); rotate(); moveLeft(); rotate(); rotate(); });
    else if (dx < -30) handleMove(moveLeft);
  } else {
    if (dy > 30) handleMove(() => { rotate(); rotate(); rotate(); moveLeft(); rotate(); });
    else if (dy < -30) handleMove(() => { rotate(); moveLeft(); rotate(); rotate(); rotate(); });
  }
});

/* DARK MODE */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

startGame();
