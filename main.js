const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const message = document.getElementById("message");

let board = JSON.parse(localStorage.getItem("board2048")) || Array(16).fill(0);
let score = Number(localStorage.getItem("score2048")) || 0;

/* ---------- SAVE ---------- */
function saveState() {
  localStorage.setItem("board2048", JSON.stringify(board));
  localStorage.setItem("score2048", score);
}

/* ---------- DRAW ---------- */
function draw() {
  grid.innerHTML = "";
  board.forEach(v => {
    const d = document.createElement("div");
    d.className = "cell";
    if (v !== 0) {
      d.textContent = v;
      d.classList.add("cell-" + v);
    }
    grid.appendChild(d);
  });
  scoreEl.textContent = score;
}

/* ---------- ADD NUMBER ---------- */
function addNumber() {
  const empty = board
    .map((v, i) => (v === 0 ? i : null))
    .filter(v => v !== null);

  if (empty.length === 0) return;
  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
}

/* ---------- SLIDE ---------- */
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

/* ---------- MOVE ---------- */
function move(dir) {
  let oldBoard = board.toString();

  for (let i = 0; i < 4; i++) {
    let line = [];

    for (let j = 0; j < 4; j++) {
      let index =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;

      line.push(board[index]);
    }

    line = slide(line);

    for (let j = 0; j < 4; j++) {
      let index =
        dir === "left" ? i * 4 + j :
        dir === "right" ? i * 4 + (3 - j) :
        dir === "up" ? j * 4 + i :
        (3 - j) * 4 + i;

      board[index] = line[j];
    }
  }

  if (oldBoard !== board.toString()) {
    addNumber();
    saveState();
    draw();
    checkStatus();
  }
}

/* ---------- GAME STATUS ---------- */
function checkStatus() {
  if (board.includes(2048)) {
    message.textContent = "🎉 You Win!";
    message.classList.remove("hidden");
    return;
  }

  if (isGameOver()) {
    message.textContent = "❌ Game Over";
    message.classList.remove("hidden");
  } else {
    message.classList.add("hidden");
  }
}

function isGameOver() {
  if (board.includes(0)) return false;

  for (let i = 0; i < 16; i++) {
    if (
      board[i] === board[i + 1] ||
      board[i] === board[i + 4]
    ) return false;
  }
  return true;
}

/* ---------- RESTART ---------- */
function restartGame() {
  board = Array(16).fill(0);
  score = 0;
  addNumber();
  addNumber();
  saveState();
  message.classList.add("hidden");
  draw();
}

/* ---------- DARK MODE ---------- */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

/* ---------- KEYBOARD ---------- */
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

/* ---------- SWIPE (MOBILE) ---------- */
let xStart = 0;
let yStart = 0;

grid.addEventListener("touchstart", e => {
  xStart = e.touches[0].clientX;
  yStart = e.touches[0].clientY;
});

grid.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - xStart;
  let dy = e.changedTouches[0].clientY - yStart;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move("right");
    if (dx < -30) move("left");
  } else {
    if (dy > 30) move("down");
    if (dy < -30) move("up");
  }
});

/* ---------- INIT ---------- */
if (!board.some(v => v !== 0)) {
  addNumber();
  addNumber();
}
draw();
checkStatus();
