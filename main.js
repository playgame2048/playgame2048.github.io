const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

let board = [];
let score = 0;

function startGame() {
  board = Array(16).fill(0);
  score = 0;
  addNumber();
  addNumber();
  draw();
}

function draw() {
  grid.innerHTML = "";
  board.forEach(num => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = num === 0 ? "" : num;
    grid.appendChild(cell);
  });
  scoreEl.textContent = score;
}

function addNumber() {
  const empty = board
    .map((v, i) => (v === 0 ? i : null))
    .filter(v => v !== null);

  if (empty.length === 0) return;

  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  row = row.filter(v => v !== 0);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  row = row.filter(v => v !== 0);
  while (row.length < 4) row.push(0);
  return row;
}

function moveLeft() {
  let old = board.toString();
  for (let i = 0; i < 4; i++) {
    let row = board.slice(i * 4, i * 4 + 4);
    row = slide(row);
    board.splice(i * 4, 4, ...row);
  }
  if (board.toString() !== old) {
    addNumber();
    draw();
  }
}

function moveRight() {
  let old = board.toString();
  for (let i = 0; i < 4; i++) {
    let row = board.slice(i * 4, i * 4 + 4).reverse();
    row = slide(row).reverse();
    board.splice(i * 4, 4, ...row);
  }
  if (board.toString() !== old) {
    addNumber();
    draw();
  }
}

function moveUp() {
  let old = board.toString();
  for (let i = 0; i < 4; i++) {
    let row = [board[i], board[i+4], board[i+8], board[i+12]];
    row = slide(row);
    [board[i], board[i+4], board[i+8], board[i+12]] = row;
  }
  if (board.toString() !== old) {
    addNumber();
    draw();
  }
}

function moveDown() {
  let old = board.toString();
  for (let i = 0; i < 4; i++) {
    let row = [board[i], board[i+4], board[i+8], board[i+12]].reverse();
    row = slide(row).reverse();
    [board[i], board[i+4], board[i+8], board[i+12]] = row;
  }
  if (board.toString() !== old) {
    addNumber();
    draw();
  }
}

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowUp") moveUp();
  if (e.key === "ArrowDown") moveDown();
});

/* TOUCH */
let sx, sy;

document.addEventListener("touchstart", e => {
  sx = e.touches[0].clientX;
  sy = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - sx;
  let dy = e.changedTouches[0].clientY - sy;

  if (Math.abs(dx) > Math.abs(dy)) {
    dx > 0 ? moveRight() : moveLeft();
  } else {
    dy > 0 ? moveDown() : moveUp();
  }
});

restartBtn.addEventListener("click", startGame);

startGame();
