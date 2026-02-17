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
  // طائر أكبر (radius 18 بدلاً من 14)
  bird = {
    x: 60,
    y: canvas.height / 2,
    size: 18,            // أكبر
    velocity: 0
  };

  pipes = [];
  score = 0;
  gameSpeed = 2;
  gravity = 0.25;
  frames = 0;

  // غيوم مبسطة قليلاً (عدد أقل من الأجزاء)
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.random() * canvas.width * 1.5,
      y: Math.random() * canvas.height * 0.4 + 20,
      parts: [
        { size: 30 + Math.random() * 15, offsetX: 0, offsetY: 0 },
        { size: 25 + Math.random() * 10, offsetX: 22, offsetY: -5 },
        { size: 22 + Math.random() * 10, offsetX: -18, offsetY: -3 },
        { size: 18 + Math.random() * 8, offsetX: 35, offsetY: 2 }
      ],
      speed: 0.1 + Math.random() * 0.15,
      opacity: 0.6 + Math.random() * 0.3
    });
  }

  // مباني (نفسها مع تحسين بسيط)
  buildings = [];
  const buildingCount = 10;
  for (let i = 0; i < buildingCount; i++) {
    const width = 35 + Math.random() * 25;
    const height = 100 + Math.random() * 180;
    const x = i * (canvas.width / buildingCount) + 5;
    const colorVal = 20 + Math.random() * 30;
    buildings.push({
      x: x,
      width: width,
      height: height,
      color: `hsl(0, 0%, ${colorVal}%)`,
      windows: Math.random() > 0.3 // بعض المباني لها نوافذ
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
      c.y = Math.random() * canvas.height * 0.4 + 20;
    }
  });
}

// ===== DRAW BUILDINGS – سكاي لاين =====
function drawBuildings() {
  buildings.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, canvas.height - b.height, b.width, b.height);

    // نوافذ بسيطة
    if (b.windows) {
      ctx.fillStyle = "#f1f5f9";
      const windowSize = 8;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillRect(
            b.x + 6 + c * 15,
            canvas.height - b.height + 12 + r * 20,
            windowSize,
            windowSize
          );
        }
      }
    }

    // ظل خفيف
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, canvas.height - b.height, b.width, b.height);
  });
}

// ===== DRAW CLOUDS =====
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

// ===== DRAW BIRD – مثل Flappybird.io بالضبط (2D أكبر) =====
function drawBird() {
  const x = bird.x;
  const y = bird.y;
  const r = bird.size;

  // جسم الطائر (دائرة صفراء كبيرة)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // عين سوداء أكبر قليلاً
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // منقار برتقالي واضح
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(x + r + 2, y - 2);
  ctx.lineTo(x + r + 10, y - 1);
  ctx.lineTo(x + r + 2, y + 2);
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

  drawBuildings();   // مباني
  drawClouds();      // غيوم
  drawPipes();       // أنابيب
  drawBird();        // طائر أكبر

  // النتيجة
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px 'Inter'";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 8;
  ctx.fillText("Score: " + score, 10, 35);
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
