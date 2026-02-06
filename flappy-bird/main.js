const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");

let bird, pipes, score, gravity, gameSpeed;
let gameRunning = false;
let firstRestart = true;
let keyLocked = false;
let lastTime = 0;

const restartLink = "https://otieu.com/4/10557461";

// ===== INIT =====
function init() {
bird = {
  x: 60,
  y: canvas.height / 2,
  size: 14,
  velocity: -6
};

  pipes = [];
  score = 0;
  gravity = 0.35;
  gameSpeed = 2;
  frames = 0;

  gameRunning = true;
  gameOverScreen.style.display = "none";
}

// ===== CONTROLS =====
function flap() {
  if (!gameRunning) return;
  bird.velocity = -6;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    flap();
  }
  if (e.code === "ArrowUp") flap();
});

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  flap();
});

// prevent scroll
window.addEventListener("keydown", e => {
  if (["Space","ArrowUp","ArrowDown"].includes(e.code)) {
    e.preventDefault();
  }
});

// ===== PIPES =====
function addPipe() {
  const gap = 120;
  const topHeight = Math.random() * 200 + 40;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - gap
  });
}

// ===== UPDATE =====
function update(delta) {
  if (!gameRunning) return;

  frames++;

  bird.velocity += gravity * delta;
  bird.velocity = Math.min(bird.velocity, 6);
  bird.y += bird.velocity * delta;

  // Ceiling
  if (bird.y - bird.size < 0) {
    bird.y = bird.size;
    bird.velocity = 0;
  }

  // Ground
  if (bird.y + bird.size > canvas.height) {
    endGame();
    return;
  }

  pipes.forEach(p => {
    p.x -= gameSpeed * delta;

    if (
      bird.x + bird.size > p.x &&
      bird.x - bird.size < p.x + 40 &&
      (
        bird.y - bird.size < p.top ||
        bird.y + bird.size > canvas.height - p.bottom
      )
    ) {
      endGame();
    }
  });

  pipes = pipes.filter(p => p.x > -50);

  if (frames % 120 === 0) addPipe();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Bird
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
  ctx.fill();

  // Pipes
  ctx.fillStyle = "#16a34a";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, 40, p.top);
    ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
  });

  // Score
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

// ===== GAME OVER =====
function endGame() {
  gameRunning = false;
  gameOverScreen.style.display = "flex";
}

// ===== LOOP =====
function loop(time) {
  const delta = (time - lastTime) / 16.67; // normalize to 60fps
  lastTime = time;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

// ===== BUTTONS =====
restartBtn.onclick = () => {
  if (firstRestart) {
    firstRestart = false;
    window.open(restartLink, "_blank");
  }
  init();
};

darkBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// START
init();
loop();
