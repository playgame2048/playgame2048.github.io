const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const message = document.getElementById("message");
const bestScoreEl = document.getElementById("bestScore");

let board = [];
let score = 0;

const moveSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

function init() {
  const saved = JSON.parse(localStorage.getItem("game2048"));
  if (saved) {
    board = saved.board;
    score = saved.score;
  } else {
    board = Array(16).fill(0);
    addNumber();
    addNumber();
  }

  bestScoreEl.textContent = localStorage.getItem("bestScore") || 0;
  draw();
}

function draw() {
  grid.innerHTML = "";
  board.forEach(n => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = n === 0 ? "" : n;
    grid.appendChild(cell);
  });
  scoreEl.textContent = score;
  saveGame();
}

function addNumber() {
  const empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
  if (empty.length === 0) return;
  board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.1 ? 2 : 4;
}

function slide(row) {
  row = row.filter(v => v);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
      moveSound.play();
    }
  }
  return row.filter(v => v).concat(Array(4 - row.filter(v => v).length).fill(0));
}

function move(dir) {
  let old = board.toString();

  for (let i = 0; i < 4; i++) {
    let row;
    if (dir === "left" || dir === "right") {
      row = board.slice(i * 4, i * 4 + 4);
      if (dir === "right") row.reverse();
      row = slide(row);
      if (dir === "right") row.reverse();
      board.splice(i * 4, 4, ...row);
    } else {
      row = [board[i], board[i+4], board[i+8], board[i+12]];
      if (dir === "down") row.reverse();
      row = slide(row);
      if (dir === "down") row.reverse();
      [board[i], board[i+4], board[i+8], board[i+12]] = row;
    }
  }

  if (board.toString() !== old) {
    addNumber();
    draw();
  }
}

function restartGame() {
  board = Array(16).fill(0);
  score = 0;
  message.classList.add("hidden");
  addNumber();
  addNumber();
  draw();
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

function saveGame() {
  localStorage.setItem("game2048", JSON.stringify({ board, score }));
  const best = Math.max(score, localStorage.getItem("bestScore") || 0);
  localStorage.setItem("bestScore", best);
  bestScoreEl.textContent = best;
}

function goFullscreen() {
  document.documentElement.requestFullscreen();
}

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
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
    dx > 0 ? move("right") : move("left");
  } else {
    dy > 0 ? move("down") : move("up");
  }
});

init();
