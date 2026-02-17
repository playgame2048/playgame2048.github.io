const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const darkToggle = document.getElementById("darkToggle");

let running = false;
let gameOver = false;
let frames = 0;
let gameSpeed = 3;
let nextSpawn = 0;
let firstRestart = true;
let score = 0;
let highScore = localStorage.getItem("dinoHighScore") || 0;

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

let obstacles = [];

/* =========================
   OBSTACLES
========================= */

function addObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 200,
    w: 20,
    h: 40
  });
}

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

      // حفظ highScore
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("dinoHighScore", highScore);
      }
    }
  });

  // Remove offscreen
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Spawn obstacles
  if (frames > nextSpawn) {
    addObstacle();
    let randomDelay = Math.floor(Math.random() * 100) + (80 - gameSpeed * 5);
    nextSpawn = frames + randomDelay;
  }

  // زيادة score تدريجياً
  score += 0.1;
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
  nextSpawn = 0;
  gameOver = false;
  running = true;
  gameOverScreen.style.display = "none";
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

  // Score
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "right";
  ctx.fillText("Score: " + Math.floor(score), canvas.width - 20, 30);
  ctx.fillText("High: " + Math.floor(highScore), canvas.width - 20, 55);
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
  if (running) {
    update();
  }
  draw();
  requestAnimationFrame(loop);
}

loop();

/* =========================
   CONTROLS
========================= */

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") e.preventDefault();

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

restartBtn.onclick = () => {
  if (firstRestart) {
    firstRestart = false;
    window.location.href = "https://omg10.com/4/10595848";
  } else {
    resetGame();
  }
};

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};
