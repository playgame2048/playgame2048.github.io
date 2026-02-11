const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const darkToggle = document.getElementById("darkToggle");

let running = false;
let gameOver = false;
let score = 0;
let frames = 0;
let gameSpeed = 3;
let nextSpawn = 0;

/* =========================
   DINO
========================= */

const dino = {
  x: 50,
  y: 200,
  w: 28,
  h: 28,
  vy: 0,
  gravity: 0.6,
  jumpPower: -12,
  onGround: true
};

/* =========================
   OBSTACLES
========================= */

let obstacles = [];

function addObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 200,
    w: 20,
    h: 40
  });
}

/* =========================
   RESET
========================= */

function resetGame() {
  obstacles = [];
  dino.y = 200;
  dino.vy = 0;
  dino.onGround = true;
  score = 0;
  frames = 0;
  gameOver = false;
  running = true;
  gameOverScreen.style.display = "none";
}

/* =========================
   UPDATE
========================= */

function update() {
  if (!running) return;

  frames++;

  // Gravity
  dino.vy += dino.gravity;
  dino.y += dino.vy;

  if (dino.y >= 200) {
    dino.y = 200;
    dino.vy = 0;
    dino.onGround = true;
  }

  // Obstacles movement
  obstacles.forEach(o => {
    o.x -= gameSpeed;

    // Collision
    if (
      dino.x < o.x + o.w &&
      dino.x + dino.w > o.x &&
      dino.y < o.y + o.h &&
      dino.y + dino.h > o.y
    ) {
      gameOver = true;
      running = false;
      gameOverScreen.style.display = "flex";
    }
  });

  // Remove offscreen
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Spawn obstacles
if (frames > nextSpawn) {
  addObstacle();

  // Random distance between 80 و 200 frames
  let randomDelay = Math.floor(Math.random() * 100) + (80 - gameSpeed * 5);

  nextSpawn = frames + randomDelay;
}

   if (frames % 500 === 0) {
  gameSpeed += 0.25;
}

  score++;
  scoreEl.textContent = score;
}

/* =========================
   DRAW
========================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground line
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(canvas.width, 240);
  ctx.stroke();

  drawDino(dino.x, dino.y);

  obstacles.forEach(o => drawCactus(o));
}

/* =========================
   DINO DRAW
========================= */

function drawDino(x, y) {
  ctx.fillStyle = "#e5e7eb";

  ctx.fillRect(x, y + 10, 28, 20); // body
  ctx.fillRect(x + 18, y, 18, 18); // head

  ctx.fillStyle = "#020617";
  ctx.fillRect(x + 30, y + 6, 3, 3); // eye

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(x + 6, y + 30, 6, 10); // leg1
  ctx.fillRect(x + 16, y + 30, 6, 10); // leg2
  ctx.fillRect(x - 8, y + 16, 8, 6); // tail
}

/* =========================
   CACTUS DRAW
========================= */

function drawCactus(o) {
  ctx.fillStyle = "#22c55e";

  ctx.fillRect(o.x, o.y, 12, 40);
  ctx.fillRect(o.x - 6, o.y + 10, 6, 16);
  ctx.fillRect(o.x + 12, o.y + 16, 6, 14);
}

/* =========================
   LOOP
========================= */

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

/* =========================
   CONTROLS
========================= */

document.addEventListener("keydown", (e) => {

  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
  }

  if (!running && !gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
    startScreen.style.display = "none";
    resetGame();
    return;
  }

  if (gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
    resetGame();
    return;
  }

  if (running && dino.onGround && (e.code === "Space" || e.code === "ArrowUp")) {
    dino.vy = dino.jumpPower;
    dino.onGround = false;
  }
});

document.addEventListener("click", () => {
  if (!running && !gameOver) {
    startScreen.style.display = "none";
    resetGame();
  } else if (gameOver) {
    resetGame();
  } else if (dino.onGround) {
    dino.vy = dino.jumpPower;
    dino.onGround = false;
  }
});

/* =========================
   RESTART LINK
========================= */

restartBtn.onclick = () => {
  window.location.href = "https://omg10.com/4/10595848";
};

/* =========================
   DARK MODE
========================= */

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};
