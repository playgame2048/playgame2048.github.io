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
let gameStarted = false;
let frames = 0;

const restartLink = "https://otieu.com/4/10557461";

// ===== INIT =====
function init() {
  bird = {
    x: 60,
    y: canvas.height / 2,
    size: 14,
    velocity: 0
  };

  pipes = [];
  score = 0;
  gameSpeed = 2;
  gravity = 0.25;
  frames = 0;

  gameRunning = true;
  gameStarted = false;
  gameOverScreen.style.display = "none";
  lastTime = 0; // ✅ مهم
}

// ===== CONTROLS =====
function flap() {
  if (!gameStarted) {
    gameStarted = true;
    bird.velocity = -6;
    return;
  }
  if (!gameRunning) return;
  bird.velocity = -6;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  flap();
});

// ===== PIPES =====
function addPipe() {
  const gap = 140;
  const topHeight = Math.random() * 200 + 40;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - gap,
    passed: false
  });
}

// ===== UPDATE =====
function update(delta) {
  if (!gameRunning || !gameStarted) return;

  frames++;

  bird.velocity += gravity * delta;
  bird.velocity = Math.min(bird.velocity, 6);
  bird.y += bird.velocity * delta;

  // ceiling
  if (bird.y - bird.size < 0) {
    bird.y = bird.size;
    bird.velocity = 0;
  }

  // ground
  if (bird.y + bird.size > canvas.height) {
    endGame();
    return;
  }

  pipes.forEach(p => {
    p.x -= gameSpeed * delta;

    const pipeWidth = 40;

    // collision
    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.size > p.x &&
      (bird.y < p.top || bird.y + bird.size > canvas.height - p.bottom)
    ) {
      endGame();
    }

    // ✅ SCORE FIX
    if (!p.passed && p.x + pipeWidth < bird.x) {
      p.passed = true;
      score++;
    }
  });

  pipes = pipes.filter(p => p.x > -60);

  if (frames % 160 === 0) addPipe();
}

// ===== DRAW BIRD =====
function drawBird() {
  const x = bird.x;
  const y = bird.y;
  const r = bird.size;

  const angle = Math.max(Math.min(bird.velocity / 8, 0.5), -0.4);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // body
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.ellipse(0, 0, r + 4, r + 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // wing
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.ellipse(-5, 2, r - 1.5, r - 3, Math.sin(Date.now()/120)*0.4, 0, Math.PI*2);
  ctx.fill();

  // tail
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(-r - 4, 0);
  ctx.lineTo(-r - 12, -5);
  ctx.lineTo(-r - 10, 0);
  ctx.lineTo(-r - 12, 5);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(3, -2, 2, 0, Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(r + 4, -1);
  ctx.quadraticCurveTo(r + 10, 0, r + 4, 2);
  ctx.fill();

  ctx.restore();
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawBird();

  pipes.forEach(p => {
    const bodyW = 40;
    const headW = 50;
    const headH = 14;
    const offset = (headW - bodyW) / 2;

    ctx.fillStyle = "#16a34a";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 3;

    // top pipe
    ctx.fillRect(p.x, 0, bodyW, p.top);
    ctx.strokeRect(p.x, 0, bodyW, p.top);

    roundRect(ctx, p.x - offset, p.top - headH, headW, headH, 6);
    ctx.fill();
    ctx.stroke();

    // bottom pipe
    ctx.fillRect(p.x, canvas.height - p.bottom, bodyW, p.bottom);
    ctx.strokeRect(p.x, canvas.height - p.bottom, bodyW, p.bottom);

    roundRect(ctx, p.x - offset, canvas.height - p.bottom, headW, headH, 6);
    ctx.fill();
    ctx.stroke();
  });

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
  if (!lastTime) lastTime = time; // ✅ أهم سطر

  const delta = (time - lastTime) / 16.67;
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
