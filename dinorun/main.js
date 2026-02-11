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

const dino = {
  x: 50,
  y: 200,
  w: 36,
  h: 36,
  vy: 0,
  jump: -10,
  gravity: 0.5,
  onGround: true
};

let obstacles = [];

function resetGame() {
  obstacles = [];
  dino.y = 200;
  dino.vy = 0;
  score = 0;
  gameOver = false;
  running = true;
  gameOverScreen.style.display = "none";
}

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 210,
    w: 20,
    h: 40
  });
}

function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dino
  dino.vy += dino.gravity;
  dino.y += dino.vy;

  if (dino.y >= 200) {
    dino.y = 200;
    dino.vy = 0;
    dino.onGround = true;
  }

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(dino.x, dino.y, dino.w, dino.h);

  // Obstacles
  obstacles.forEach(o => {
    o.x -= 4;
    ctx.fillStyle = "#facc15";
    ctx.fillRect(o.x, o.y, o.w, o.h);

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

  obstacles = obstacles.filter(o => o.x + o.w > 0);

  score++;
  scoreEl.textContent = score;

  requestAnimationFrame(update);
}

// Controls
document.addEventListener("click", () => {
  if (!running && !gameOver) {
    startScreen.style.display = "none";
    resetGame();
    update();
  } else if (gameOver) {
    resetGame();
    update();
  } else if (dino.onGround) {
    dino.vy = dino.jump;
    dino.onGround = false;
  }
});

restartBtn.onclick = () => {
  window.location.href = "https://omg10.com/4/10595848";
};

setInterval(() => {
  if (running) spawnObstacle();
}, 1500);

// Dark mode
darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};
