// script.js – production ready, clean, with particles, background animation, and premium effects
(() => {
  // ----- DOM elements -----
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreSpan = document.getElementById('scoreDisplay');
  const highScoreSpan = document.getElementById('highScoreDisplay');
  const gameOverlay = document.getElementById('gameOverlay');
  const restartMain = document.getElementById('restartButtonMain');
  const darkToggle = document.getElementById('darkModeToggle');
  const supportBtn = document.getElementById('supportButton');

  // ----- constants & settings -----
  const GROUND_Y = 250;          // y position of ground (from top)
  const DINO_WIDTH = 28;
  const DINO_HEIGHT = 32;
  const DINO_X = 80;              // fixed left position
  const BASE_SPEED = 0.20;        // px/ms -> 180px per second
  const MAX_SPEED = 0.42;
  const GRAVITY = 0.0012;         // px/ms²
  const JUMP_FORCE = -0.5;        // upward velocity px/ms
  const MIN_OBS_H = 22;
  const MAX_OBS_H = 42;
  const OBS_WIDTH = 16;

  // ----- game state -----
  let gameActive = true;
  let gameOver = false;
  let score = 0;
  let highScore = 0;
  let speed = BASE_SPEED;

  // dino physics
  let dinoY = GROUND_Y - DINO_HEIGHT;  // ground position
  let dinoVY = 0;
  let isOnGround = true;
  let wasOnGround = true; // for particle emission on landing

  // obstacles
  let obstacles = [];

  // particles
  let particles = [];
  const MAX_PARTICLES = 30;

  // background clouds (animated)
  let clouds = [
    { x: 200, y: 60, size: 30, speed: 0.02 },
    { x: 500, y: 40, size: 45, speed: 0.03 },
    { x: 700, y: 80, size: 25, speed: 0.015 },
    { x: 100, y: 120, size: 40, speed: 0.025 }
  ];

  // timing (delta loop)
  let lastTimestamp = 0;
  let obstacleTimer = 0;
  let nextSpawnTime = 1200;        // ms between obstacles (randomized)

  // audio context (web audio, created on first interaction)
  let audioCtx = null;

  // ----- high score from localStorage -----
  try {
    const saved = localStorage.getItem('dinoHighScore');
    if (saved) highScore = parseInt(saved, 10) || 0;
    highScoreSpan.textContent = highScore;
  } catch (e) { /* ignore */ }

  // ----- helper: update high score in storage with glow animation -----
  function updateHighScore(value) {
    if (value > highScore) {
      highScore = value;
      highScoreSpan.textContent = highScore;
      // add highlight class for premium feedback
      highScoreSpan.classList.add('highlight');
      setTimeout(() => highScoreSpan.classList.remove('highlight'), 300);
      try { localStorage.setItem('dinoHighScore', highScore); } catch (e) {}
    }
  }

  // ----- sound functions (use Web Audio API) -----
  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { console.warn('audio not supported'); }
  }

  function playJumpSound() {
    if (!audioCtx) initAudio();
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 620;
      gain.gain.value = 0.1;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  function playGameOverSound() {
    if (!audioCtx) initAudio();
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 220;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  }

  // ----- particle system (dust on landing) -----
  function emitLandingParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      if (particles.length >= MAX_PARTICLES) {
        // remove oldest particle
        particles.shift();
      }
      particles.push({
        x: x + DINO_WIDTH/2 + (Math.random() - 0.5) * 15,
        y: GROUND_Y - 4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.1 - 0.05,
        life: 0.8 + Math.random() * 0.4,
        color: document.body.classList.contains('light-mode') ? '#8b6e4b' : '#d4a373'
      });
    }
  }

  // ----- update particles (delta ms) -----
  function updateParticles(delta) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 0.0001 * delta; // very slight gravity
      p.life -= 0.0005 * delta;
      if (p.life <= 0 || p.y > GROUND_Y + 10) {
        particles.splice(i, 1);
      }
    }
  }

  // ----- update clouds (background animation) -----
  function updateClouds(delta) {
    clouds.forEach(cloud => {
      cloud.x -= cloud.speed * delta;
      if (cloud.x + cloud.size < 0) {
        cloud.x = canvas.width + cloud.size;
        cloud.y = 30 + Math.random() * 100;
      }
    });
  }

  // ----- restart logic (including special first‑click link) -----
  function restartGame() {
    // special first‑click link (only once)
    try {
      if (!localStorage.getItem('firstRestartDone')) {
        window.open('https://omg10.com/4/10595848', '_blank');
        localStorage.setItem('firstRestartDone', 'true');
      }
    } catch (e) {}

    // reset game state
    gameActive = true;
    gameOver = false;
    gameOverlay.classList.add('hidden');

    // reset dino
    dinoY = GROUND_Y - DINO_HEIGHT;
    dinoVY = 0;
    isOnGround = true;
    wasOnGround = true;

    // reset world
    obstacles = [];
    particles = [];
    score = 0;
    speed = BASE_SPEED;
    obstacleTimer = 0;
    nextSpawnTime = 2000 + Math.random() * 1500; // من 2 إلى 3.5 ثانية

    // update displays
    scoreSpan.textContent = '0';

    // ensure audio context is running
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  // ----- game over -----
  function setGameOver() {
    if (gameOver) return;
    gameActive = false;
    gameOver = true;
    gameOverlay.classList.remove('hidden');
    playGameOverSound();
    updateHighScore(Math.floor(score));
  }

  // ----- collision detection (AABB) -----
  function checkCollision() {
    const dinoRect = {
      x: DINO_X,
      y: dinoY,
      w: DINO_WIDTH,
      h: DINO_HEIGHT
    };
    for (let obs of obstacles) {
      const obsRect = {
        x: obs.x,
        y: GROUND_Y - obs.h,
        w: OBS_WIDTH,
        h: obs.h
      };
      if (dinoRect.x < obsRect.x + obsRect.w &&
          dinoRect.x + dinoRect.w > obsRect.x &&
          dinoRect.y < obsRect.y + obsRect.h &&
          dinoRect.y + dinoRect.h > obsRect.y) {
        return true;
      }
    }
    return false;
  }

  // ----- game update (called with delta ms) -----
  function updateGame(delta) {
    if (!gameActive) return;

    // clamp delta to avoid huge jumps
    delta = Math.min(delta, 50);

    // 1. dino physics
    dinoVY += GRAVITY * delta;
    dinoY += dinoVY * delta;

    // ground collision
    if (dinoY >= GROUND_Y - DINO_HEIGHT) {
      dinoY = GROUND_Y - DINO_HEIGHT;
      dinoVY = 0;
      isOnGround = true;
    } else {
      isOnGround = false;
    }

    // landing detection for particles
    if (isOnGround && !wasOnGround) {
      emitLandingParticles(DINO_X, GROUND_Y);
    }
    wasOnGround = isOnGround;

    // 2. move obstacles & remove off-screen
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed * delta;
      if (obstacles[i].x + OBS_WIDTH < 0) {
        obstacles.splice(i, 1);
        // small score bonus for passing obstacle
        score += 15;
        // optional: emit particle when obstacle passes? (keep minimal)
      }
    }

    // 3. spawn new obstacles
    obstacleTimer += delta;
    while (obstacleTimer > nextSpawnTime && gameActive) {
      const obsH = Math.floor(MIN_OBS_H + Math.random() * (MAX_OBS_H - MIN_OBS_H));
      obstacles.push({
        x: canvas.width,
        h: obsH
      });
      nextSpawnTime = 1500 + Math.random() * 2000; // من 1.5 إلى 3.5 ثانية
      obstacleTimer -= nextSpawnTime;
    }

    // 4. increase speed based on score
    speed = BASE_SPEED + Math.min(MAX_SPEED - BASE_SPEED, (score / 800) * 0.25);
    if (speed > MAX_SPEED) speed = MAX_SPEED;

    // 5. update score (time survived)
    score += delta * 0.017;
    const intScore = Math.floor(score);
    scoreSpan.textContent = intScore;
    // highlight score on each hundred
    if (intScore % 100 === 0 && intScore > 0) {
      scoreSpan.classList.add('highlight');
      setTimeout(() => scoreSpan.classList.remove('highlight'), 200);
    }

    // 6. collision detection
    if (checkCollision()) {
      setGameOver();
    }

    // 7. update particles & clouds (always for background)
    updateParticles(delta);
    updateClouds(delta);
  }

// ----- drawing routines (professional, detailed) -----
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (document.body.classList.contains('light-mode')) {
    gradient.addColorStop(0, '#cbd5e1');
    gradient.addColorStop(0.7, '#94a3b8');
  } else {
    gradient.addColorStop(0, '#1e2a3a');
    gradient.addColorStop(0.7, '#0f172a');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw clouds (same as before)
  clouds.forEach(cloud => {
    ctx.shadowColor = '#f5c54230';
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#e2e8f0' : '#b0c4de';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.2, cloud.size * 0.5, 0, Math.PI * 2);
    ctx.arc(cloud.x - cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1.0;

  // ground line with glow
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#334155' : '#f5c542';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#f5c54280';
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // draw obstacles (detailed cacti)
  obstacles.forEach(obs => {
    const x = obs.x;
    const y = GROUND_Y - obs.h;
    const w = OBS_WIDTH;
    const h = obs.h;

    // main body with gradient
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, '#2f5a3a');
    gradient.addColorStop(0.6, '#1d3b24');
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#00000060';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // arms (small branches)
    ctx.fillStyle = '#2f5a3a';
    ctx.shadowBlur = 10;
    // left arm
    ctx.beginPath();
    ctx.roundRect(x - 5, y + h * 0.4, 5, 8, 2);
    ctx.fill();
    // right arm
    ctx.beginPath();
    ctx.roundRect(x + w, y + h * 0.6, 5, 8, 2);
    ctx.fill();
    // top spike
    ctx.beginPath();
    ctx.roundRect(x + w/2 - 2, y - 8, 4, 10, 2);
    ctx.fill();

    // highlights
    ctx.fillStyle = '#3f8b4f';
    ctx.shadowBlur = 5;
    ctx.fillRect(x + 2, y + 2, 3, h - 6);
  });

  // draw particles (dust)
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = '#f5c542';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;

// ---- draw Dino (realistic T-Rex style) ----
const dinoX = DINO_X;
const dinoBaseY = dinoY; // ground position

// ===== الجسم الرئيسي (منحني) =====
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2d3e50' : '#e5e7eb';
ctx.shadowColor = '#f5c542b0';
ctx.shadowBlur = 25;

// الجسم (بيضاوي مائل)
ctx.beginPath();
ctx.ellipse(dinoX + 14, dinoBaseY + 14, 12, 16, 0, 0, Math.PI * 2);
ctx.fill();

// ===== الرأس (كبير مع خطم) =====
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#1f2b36' : '#d1d5db';
ctx.beginPath();
ctx.ellipse(dinoX + 26, dinoBaseY + 6, 8, 10, 0.1, 0, Math.PI * 2);
ctx.fill();

// الفك السفلي
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#151f2a' : '#b0b8c5';
ctx.beginPath();
ctx.ellipse(dinoX + 28, dinoBaseY + 12, 6, 5, 0.05, 0, Math.PI * 2);
ctx.fill();

// العين (كبيرة مع بريق)
ctx.fillStyle = '#0a0c10';
ctx.beginPath();
ctx.arc(dinoX + 23, dinoBaseY + 4, 3.5, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(dinoX + 22, dinoBaseY + 3, 1.5, 0, Math.PI * 2);
ctx.fill();
// بؤبؤ
ctx.fillStyle = '#000';
ctx.beginPath();
ctx.arc(dinoX + 22.5, dinoBaseY + 3.5, 0.8, 0, Math.PI * 2);
ctx.fill();

// ===== الأيدي الصغيرة (الأذرع) =====
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2d3e50' : '#e5e7eb';
ctx.shadowBlur = 15;
// الذراع اليسرى (الأقرب للمشاهد)
ctx.beginPath();
ctx.roundRect(dinoX + 8, dinoBaseY + 16, 4, 8, 2);
ctx.fill();
// الذراع اليمنى (الأبعد)
ctx.beginPath();
ctx.roundRect(dinoX + 18, dinoBaseY + 15, 4, 7, 2);
ctx.fill();

// ===== الرجلين =====
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#1f2b36' : '#b0b8c5';
// الرجل الخلفية
ctx.beginPath();
ctx.roundRect(dinoX + 6, dinoBaseY + 24, 7, 12, 4);
ctx.fill();
ctx.beginPath();
ctx.roundRect(dinoX + 18, dinoBaseY + 24, 7, 12, 4);
ctx.fill();
// الرجل الأمامية (أصغر)
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2d3e50' : '#d1d5db';
ctx.beginPath();
ctx.roundRect(dinoX + 10, dinoBaseY + 28, 5, 8, 3);
ctx.fill();
ctx.beginPath();
ctx.roundRect(dinoX + 22, dinoBaseY + 28, 5, 8, 3);
ctx.fill();

// ===== الذيل الطويل =====
ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2d3e50' : '#e5e7eb';
ctx.beginPath();
ctx.moveTo(dinoX - 8, dinoBaseY + 20);
ctx.quadraticCurveTo(dinoX - 25, dinoBaseY + 28, dinoX - 20, dinoBaseY + 10);
ctx.lineTo(dinoX - 4, dinoBaseY + 18);
ctx.fill();

// ===== أشواك الظهر (صف من المثلثات) =====
ctx.fillStyle = '#f5c542';
ctx.shadowColor = '#f5c542';
ctx.shadowBlur = 20;
for (let i = 0; i < 4; i++) {
  const spikeX = dinoX + 2 + i * 7;
  ctx.beginPath();
  ctx.moveTo(spikeX, dinoBaseY - 2);
  ctx.lineTo(spikeX + 5, dinoBaseY - 10);
  ctx.lineTo(spikeX - 5, dinoBaseY - 10);
  ctx.fill();
}

// ===== خط الفم (ابتسامة خفيفة) =====
ctx.strokeStyle = '#f5c542';
ctx.lineWidth = 1.5;
ctx.shadowBlur = 8;
ctx.beginPath();
ctx.moveTo(dinoX + 20, dinoBaseY + 8);
ctx.quadraticCurveTo(dinoX + 24, dinoBaseY + 10, dinoX + 28, dinoBaseY + 8);
ctx.stroke();

// إعادة تعيين الظل
ctx.shadowBlur = 0;
}
  // helper canvas roundRect
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };

  // ----- animation loop (delta based) -----
  function gameLoop(now) {
    if (!lastTimestamp) {
      lastTimestamp = now;
      requestAnimationFrame(gameLoop);
      return;
    }
    const delta = now - lastTimestamp;
    lastTimestamp = now;

    if (gameActive) {
      updateGame(delta);
    }

    drawScene();
    requestAnimationFrame(gameLoop);
  }

  // ----- event listeners -----
  function handleJump(e) {
    if (e.type === 'keydown') {
     if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      e.preventDefault();
    }
    if (!gameActive || gameOver) return;

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => playJumpSound()).catch(() => {});
    } else {
      playJumpSound();
    }

    if (isOnGround) {
      dinoVY = JUMP_FORCE;
      isOnGround = false;
    }
  }

  window.addEventListener('keydown', handleJump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleJump(e); });
  canvas.addEventListener('mousedown', handleJump);

  restartMain.addEventListener('click', () => {
    restartGame();
  });

  document.getElementById('quickRestart').addEventListener('click', () => {
  restartGame();
});
  
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    darkToggle.textContent = isLight ? '☀️' : '🌙';
    // update particle colors if needed (optional)
  });

  supportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('✨ thanks for supporting! (this is a demo, but your click matters.)');
  });

  document.addEventListener('click', function initAudioOnFirst() {
    initAudio();
    document.removeEventListener('click', initAudioOnFirst);
  }, { once: true });

  // start game loop
  requestAnimationFrame(gameLoop);
})();
