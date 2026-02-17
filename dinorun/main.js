const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const darkToggle = document.getElementById("darkToggle");
const supportBtn = document.getElementById("supportBtn");
const scoreSound = document.getElementById("scoreSound");

let running = false;
let gameOver = false;
let frames = 0;
let gameSpeed = 3;
let nextObstacle = 0;    // cactus spawn
let nextBird = 0;        // bird spawn
let firstRestart = true;
let score = 0;
let highScore = localStorage.getItem("dinoHighScore") || 0;

let lastMilestone = 0;   // لتتبع النقاط 100,200,...

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

let obstacles = [];    // cactus
let birds = [];        // pterodactyls
let clouds = [];

// ===== INIT CLOUDS =====
function initClouds() {
  clouds = [];
  for (let i = 0; i < 4; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * 80,
      width: 50 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.3,
      opacity: 0.3 + Math.random() * 0.2
    });
  }
}
initClouds();

// ===== OBSTACLES =====
function addCactus() {
  obstacles.push({
    x: canvas.width,
    y: 200,
    w: 20,
    h: 40,
    type: 'cactus'
  });
}

function addBird() {
  // bird flies at two possible heights: lower (y=180) or higher (y=150)
  const height = Math.random() > 0.5 ? 150 : 180;
  birds.push({
    x: canvas.width,
    y: height,
    w: 30,
    h: 20,
    type: 'bird'
  });
}

// ===== UPDATE =====
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

  // Score increment
  score += 0.1;
  const intScore = Math.floor(score);
  if (intScore > 0 && intScore % 100 === 0 && intScore > lastMilestone) {
    lastMilestone = intScore;
    // play sound (simple beep using Web Audio)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  // Cactus movement & collision
  obstacles.forEach(o => {
    o.x -= gameSpeed;
    if (
      dino.x < o.x + o.w &&
      dino.x + dino.w > o.x &&
      dino.y < o.y + o.h &&
      dino.y + dino.h > o.y
    ) {
      gameOver = true;
      running = false;
      gameOverScreen.style.display = "flex";
      if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem("dinoHighScore", highScore);
      }
    }
  });
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  // Bird movement & collision
  birds.forEach(b => {
    b.x -= gameSpeed * 1.2; // birds faster
    if (
      dino.x < b.x + b.w &&
      dino.x + dino.w > b.x &&
      dino.y < b.y + b.h &&
      dino.y + dino.h > b.y
    ) {
      gameOver = true;
      running = false;
      gameOverScreen.style.display = "flex";
      if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem("dinoHighScore", highScore);
      }
    }
  });
  birds = birds.filter(b => b.x + b.w > 0);

  // Cloud movement
  clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x + c.width < 0) {
      c.x = canvas.width + Math.random() * 100;
      c.y = 30 + Math.random() * 80;
    }
  });

  // Spawn cactus
  if (frames > nextObstacle) {
    addCactus();
    let randomDelay = 50 + Math.floor(Math.random() * 70);
    nextObstacle = frames + randomDelay;
  }

  // Spawn bird (less frequent)
  if (frames > nextBird) {
    if (Math.random() < 0.3) { // 30% chance each time
      addBird();
    }
    let birdDelay = 80 + Math.floor(Math.random() * 60);
    nextBird = frames + birdDelay;
  }
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // خلفية السماء (موحدة – ناعمة)
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // غيوم
  clouds.forEach(c => {
    ctx.fillStyle = `rgba(255,255,255,${c.opacity})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.width * 0.3, 0, Math.PI * 2);
    ctx.arc(c.x + c.width * 0.3, c.y - 5, c.width * 0.25, 0, Math.PI * 2);
    ctx.arc(c.x + c.width * 0.6, c.y, c.width * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });

  // خط الأرض
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(canvas.width, 240);
  ctx.stroke();

  // رسم العوائق: الصبار
  obstacles.forEach(o => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(o.x, o.y, 12, 40);
    ctx.fillRect(o.x - 6, o.y + 10, 6, 16);
    ctx.fillRect(o.x + 12, o.y + 16, 6, 14);
  });

  // رسم الطيور
  birds.forEach(b => {
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + 10);
    ctx.quadraticCurveTo(b.x + 15, b.y - 5, b.x + 30, b.y + 10);
    ctx.quadraticCurveTo(b.x + 15, b.y + 5, b.x, b.y + 10);
    ctx.fill();
  });

  // رسم الديناصور (أسلوب جوجل)
  ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#020617";
  ctx.fillRect(dino.x, dino.y + 10, 28, 20); // body
  ctx.fillRect(dino.x + 18, dino.y, 18, 18); // head
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(dino.x + 30, dino.y + 6, 3, 3); // eye
  ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#020617";
  ctx.fillRect(dino.x + 6, dino.y + 30, 6, 10); // leg1
  ctx.fillRect(dino.x + 16, dino.y + 30, 6, 10); // leg2
  ctx.fillRect(dino.x - 8, dino.y + 16, 8, 6); // tail

  // النتيجة
  ctx.fillStyle = document.body.classList.contains("dark") ? "#fff" : "#020617";
  ctx.font = "bold 20px 'Inter'";
  ctx.textAlign = "right";
  ctx.fillText("Score: " + Math.floor(score), canvas.width - 20, 30);
  ctx.fillText("High: " + Math.floor(highScore), canvas.width - 20, 55);
}

// ===== GAME OVER =====
function endGame() {
  running = false;
  gameOver = true;
  gameOverScreen.style.display = "flex";
  if (Math.floor(score) > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem("dinoHighScore", highScore);
  }
}

// ===== RESET =====
function resetGame() {
  obstacles = [];
  birds = [];
  dino.y = 200;
  dino.vy = 0;
  dino.onGround = true;
  score = 0;
  lastMilestone = 0;
  frames = 0;
  nextObstacle = 0;
  nextBird = 0;
  gameOver = false;
  running = true;
  gameOverScreen.style.display = "none";
  startScreen.style.display = "none";
  initClouds();
}

// ===== LOOP =====
function loop() {
  if (running) {
    update();
  }
  draw();
  requestAnimationFrame(loop);
}
loop();

// ===== CONTROLS =====
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") e.preventDefault();

  if (!running && !gameOver) {
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
    resetGame();
  } else if (gameOver) {
    resetGame();
  } else if (dino.onGround) {
    dino.vy = dino.jumpPower;
    dino.onGround = false;
  }
});

// ===== RESTART BUTTON (أول نقرة = رابط تابع) =====
restartBtn.onclick = () => {
  if (firstRestart) {
    firstRestart = false;
    window.location.href = "https://omg10.com/4/10595848"; // <-- غيّره لرابطك
  } else {
    resetGame();
  }
};

// ===== DARK MODE =====
darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

// ===== SUPPORT BUTTON =====
supportBtn.onclick = (e) => {
  e.preventDefault();
  window.open("https://ko-fi.com/help_tommy", "_blank");
};

// ===== إظهار شاشة البداية =====
startScreen.style.display = "flex";
