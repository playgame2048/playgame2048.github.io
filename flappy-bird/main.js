const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");

let bird, pipes, score, gravity, gameSpeed;
let gameRunning = false;
let firstRestart = true;
let lastTime = 0;
let gameStarted = false;
let frames = 0;

// مصفوفات الخلفية
let clouds = [];
let buildings = [];

const restartLink = "https://otieu.com/4/10557461"; // <-- غيّره لرابطك

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

  // إنشاء غيوم واقعية
  clouds = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * canvas.width * 1.5,
      y: Math.random() * canvas.height * 0.5 + 10,
      parts: [
        { size: 30 + Math.random() * 20, offsetX: 0, offsetY: 0 },
        { size: 25 + Math.random() * 15, offsetX: 25, offsetY: -8 },
        { size: 28 + Math.random() * 15, offsetX: -20, offsetY: -5 },
        { size: 20 + Math.random() * 10, offsetX: 40, offsetY: 2 },
        { size: 18 + Math.random() * 10, offsetX: -35, offsetY: 3 }
      ],
      speed: 0.1 + Math.random() * 0.15,
      opacity: 0.5 + Math.random() * 0.3
    });
  }

  // إنشاء مباني واقعية (سكاي لاين)
  buildings = [];
  const buildingCount = 12;
  for (let i = 0; i < buildingCount; i++) {
    const width = 35 + Math.random() * 30;
    const height = 100 + Math.random() * 200;
    const x = i * (canvas.width / buildingCount) + 5;
    const colorVal = 20 + Math.random() * 40;
    const hasAntenna = Math.random() > 0.7;
    const windows = [];
    const windowRows = Math.floor(height / 18);
    const windowCols = Math.floor(width / 12);
    for (let r = 0; r < windowRows; r++) {
      for (let c = 0; c < windowCols; c++) {
        if (Math.random() > 0.3) { // بعض النوافذ فقط
          windows.push({
            x: 5 + c * 12,
            y: height - 15 - r * 18,
            w: 7,
            h: 10,
            lit: Math.random() > 0.5
          });
        }
      }
    }
    buildings.push({
      x: x,
      width: width,
      height: height,
      color: `hsl(0, 0%, ${colorVal}%)`,
      windows: windows,
      hasAntenna: hasAntenna
    });
  }

  gameRunning = true;
  gameStarted = false;
  gameOverScreen.style.display = "none";
  lastTime = 0;
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

    // score
    if (!p.passed && p.x + pipeWidth < bird.x) {
      p.passed = true;
      score++;
    }
  });

  pipes = pipes.filter(p => p.x > -60);

  if (frames % 160 === 0) addPipe();

  // تحريك الغيوم
  clouds.forEach(c => {
    c.x -= c.speed * delta;
    if (c.x + 100 < 0) {
      c.x = canvas.width + Math.random() * 200;
      c.y = Math.random() * canvas.height * 0.5 + 10;
    }
  });
}

// ===== DRAW BUILDINGS – سكاي لاين احترافي =====
function drawBuildings() {
  buildings.forEach(b => {
    // رسم المبنى
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, canvas.height - b.height, b.width, b.height);

    // رسم النوافذ
    b.windows.forEach(w => {
      ctx.fillStyle = w.lit ? "#f1f5f9" : "#334155";
      ctx.fillRect(b.x + w.x, canvas.height - b.height + w.y, w.w, w.h);
    });

    // رسم هوائي إذا وجد
    if (b.hasAntenna) {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x + b.width / 2, canvas.height - b.height - 5);
      ctx.lineTo(b.x + b.width / 2, canvas.height - b.height - 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x + b.width / 2, canvas.height - b.height - 18, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#cbd5e1";
      ctx.fill();
    }

    // خطوط ظل خفيفة
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, canvas.height - b.height, b.width, b.height);
  });
}

// ===== DRAW CLOUDS – غيوم واقعية =====
function drawClouds() {
  clouds.forEach(c => {
    ctx.save();
    ctx.globalAlpha = c.opacity;
    ctx.fillStyle = "#ffffff";
    c.parts.forEach(part => {
      ctx.beginPath();
      ctx.arc(c.x + part.offsetX, c.y + part.offsetY, part.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  });
}

// ===== DRAW BIRD – كلاسيكي 2D =====
function drawBird() {
  const x = bird.x;
  const y = bird.y;
  const r = bird.size;

  // جسم الطائر (دائرة صفراء)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.fill();

  // عين سوداء
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + 3, y - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // منقار برتقالي
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(x + r + 2, y);
  ctx.lineTo(x + r + 8, y - 2);
  ctx.lineTo(x + r + 8, y + 2);
  ctx.closePath();
  ctx.fill();
}

// ===== DRAW PIPES =====
function drawPipes() {
  pipes.forEach(p => {
    const bodyW = 40;
    const headW = 55;
    const headH = 14;
    const offset = (headW - bodyW) / 2;

    ctx.fillStyle = "#16a34a";
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 3;

    // top pipe
    ctx.fillRect(p.x, 0, bodyW, p.top);
    ctx.strokeRect(p.x, 0, bodyW, p.top);
    ctx.fillRect(p.x - offset, p.top - headH, headW, headH);
    ctx.strokeRect(p.x - offset, p.top - headH, headW, headH);

    // bottom pipe
    ctx.fillRect(p.x, canvas.height - p.bottom, bodyW, p.bottom);
    ctx.strokeRect(p.x, canvas.height - p.bottom, bodyW, p.bottom);
    ctx.fillRect(p.x - offset, canvas.height - p.bottom, headW, headH);
    ctx.strokeRect(p.x - offset, canvas.height - p.bottom, headW, headH);
  });
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // تدرج السماء
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#7dd3fc");
  gradient.addColorStop(1, "#bae6fd");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBuildings();   // مباني واقعية
  drawClouds();      // غيوم كثيفة
  drawPipes();       // أنابيب خضراء
  drawBird();        // طائر أصفر

  // النتيجة
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px 'Inter'";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 6;
  ctx.fillText("Score: " + score, 10, 30);
  ctx.shadowBlur = 0;
}

// ===== GAME OVER =====
function endGame() {
  gameRunning = false;
  gameOverScreen.style.display = "flex";
}

// ===== LOOP =====
function loop(time) {
  if (!lastTime) lastTime = time;
  const delta = Math.min((time - lastTime) / 16.67, 2);
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

// ===== START =====
init();
loop();
