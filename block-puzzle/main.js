const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ROWS = 10;
const COLS = 10;
const SIZE = canvas.width / COLS;

let grid, current;

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomBlock() {
  return {
    x: 4,
    y: 0,
    shape: [
      [1, 1],
      [1, 1]
    ]
  };
}

function drawGrid() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = grid[y][x] ? "#4caf50" : "#ccc";
      ctx.fillRect(x * SIZE, y * SIZE, SIZE - 1, SIZE - 1);
    }
  }
}

function drawBlock() {
  ctx.fillStyle = "#2196f3";
  current.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillRect(
          (current.x + x) * SIZE,
          (current.y + y) * SIZE,
          SIZE - 1,
          SIZE - 1
        );
      }
    });
  });
}

function collide() {
  return current.shape.some((row, y) =>
    row.some((val, x) => {
      if (!val) return false;
      let ny = current.y + y;
      let nx = current.x + x;
      return ny >= ROWS || nx < 0 || nx >= COLS || grid[ny][nx];
    })
  );
}

function merge() {
  current.shape.forEach((row, y) =>
    row.forEach((val, x) => {
      if (val) grid[current.y + y][current.x + x] = 1;
    })
  );
}

function drop() {
  current.y++;
  if (collide()) {
    current.y--;
    merge();
    clearLines();
    current = randomBlock();
  }
}

function clearLines() {
  grid = grid.filter(row => row.some(cell => !cell));
  while (grid.length < ROWS) {
    grid.unshift(Array(COLS).fill(0));
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawBlock();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") current.x--;
  if (e.key === "ArrowRight") current.x++;
  if (e.key === "ArrowDown") drop();
  if (collide()) {
    if (e.key === "ArrowLeft") current.x++;
    if (e.key === "ArrowRight") current.x--;
  }
});

document.getElementById("restart").onclick = start;
document.getElementById("darkMode").onclick = () =>
  document.body.classList.toggle("dark");

function start() {
  grid = emptyGrid();
  current = randomBlock();
}

start();
setInterval(drop, 700);
setInterval(update, 100);
