const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const moveSound = document.getElementById("moveSound");

let board = [];
let score = localStorage.getItem("score2048") || 0;
scoreDisplay.textContent = score;

function startGame(reset = false) {
  if (reset) score = 0;
  board = Array(16).fill(0);
  message.classList.add("hidden");
  scoreDisplay.textContent = score;
  addNumber();
  addNumber();
  draw();
}

function draw() {
  grid.innerHTML = "";
  board.forEach(v => {
    const d = document.createElement("div");
    d.className = "cell";
    if (v) {
      d.textContent = v;
      d.classList.add("cell-" + v);
    }
    grid.appendChild(d);
  });
}

function addNumber() {
  let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
  if (empty.length) board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.9 ? 4 : 2;
}

function slide(row) {
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
  return row;
}

function move(dir) {
  let old = board.toString();

  for (let r = 0; r < 4; r++) {
    let row = [];
    for (let c = 0; c < 4; c++) {
      let i = dir === "left" ? r * 4 + c :
              dir === "right" ? r * 4 + (3 - c) :
              dir === "up" ? c * 4 + r :
              c * 4 + (3 - r);
      row.push(board[i]);
    }

    row = slide(row);

    for (let c = 0; c < 4; c++) {
      let i = dir === "left" ? r * 4 + c :
              dir === "right" ? r * 4 + (3 - c) :
              dir === "up" ? c * 4 + r :
              c * 4 + (3 - r);
      board[i] = row[c];
    }
  }

  if (old !== board.toString()) {
    addNumber();
    localStorage.setItem("score2048", score);
    scoreDisplay.textContent = score;
    moveSound.play();
    draw();
  }

  if (!board.includes(0)) message.classList.remove("hidden");
}

/* PC */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

/* MOBILE */
let x1, y1;
grid.addEventListener("touchstart", e => {
  x1 = e.touches[0].clientX;
  y1 = e.touches[0].clientY;
});

grid.addEventListener("touchend", e => {
  let x2 = e.changedTouches[0].clientX;
  let y2 = e.changedTouches[0].clientY;
  let dx = x2 - x1;
  let dy = y2 - y1;

  if (Math.abs(dx) > Math.abs(dy)) {
    dx > 30 ? move("right") : dx < -30 && move("left");
  } else {
    dy > 30 ? move("down") : dy < -30 && move("up");
  }
});

/* DARK MODE */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

startGame();
