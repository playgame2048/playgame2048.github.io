const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
let board = [];
let score = 0;

function startGame() {
  grid.innerHTML = "";
  board = Array(16).fill(0);
  score = 0;
  scoreDisplay.textContent = score;

  addNumber();
  addNumber();
  drawBoard();
}

function drawBoard() {
  grid.innerHTML = "";
  board.forEach(value => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (value !== 0) {
      cell.textContent = value;
      cell.classList.add(`cell-${value}`);
    }
    grid.appendChild(cell);
  });
}

function addNumber() {
  let empty = board
    .map((v, i) => v === 0 ? i : null)
    .filter(v => v !== null);

  if (empty.length === 0) return;

  let index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() > 0.9 ? 4 : 2;
}

function moveLeft() {
  for (let r = 0; r < 4; r++) {
    let row = board.slice(r * 4, r * 4 + 4);
    row = row.filter(v => v);
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
  }
}

function rotate() {
  const newBoard = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 3; j >= 0; j--) {
      newBoard.push(board[j * 4 + i]);
    }
  }
  board = newBoard;
}

document.addEventListener("keydown", e => {
  let oldBoard = [...board];

  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowUp") { rotate(); moveLeft(); rotate(); rotate(); rotate(); }
  if (e.key === "ArrowRight") { rotate(); rotate(); moveLeft(); rotate(); rotate(); }
  if (e.key === "ArrowDown") { rotate(); rotate(); rotate(); moveLeft(); rotate(); }

  if (oldBoard.toString() !== board.toString()) {
    addNumber();
    drawBoard();
    scoreDisplay.textContent = score;
  }
});

startGame();
