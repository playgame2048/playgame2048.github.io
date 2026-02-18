// script.js – production ready, clean, commented
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
  const BASE_SPEED = 0.18;        // px/ms -> 180px per second
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

  // obstacles
  let obstacles = [];

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

  // ----- helper: update high score in storage -----
  function updateHighScore(value) {
    if (value > highScore) {
      highScore = value;
      highScoreSpan.textContent = highScore;
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

  // ----- restart logic (including special first‑click link) -----
  function restartGame() {
    // special first‑click link (only once)
    try {
      if (!localStorage.getItem('firstRestartDone')) {
        // open a fun, relevant wiki page about dinosaurs
        window.open('https://en.wikipedia.org/wiki/Dinosaur', '_blank');
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

    // reset world
    obstacles = [];
    score = 0;
    speed = BASE_SPEED;
    obstacleTimer = 0;
    nextSpawnTime = 1200 + Math.random() * 700;

    // update displays
    scoreSpan.textContent = '0';

    // ensure audio context is running (user interaction will resume if needed)
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
    updateHighScore(score);
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

    // clamp delta to avoid huge jumps (tab inactive)
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

    // 2. move obstacles & remove off-screen
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed * delta;
      if (obstacles[i].x + OBS_WIDTH < 0) {
        obstacles.splice(i, 1);
        // small score bonus for passing obstacle
        score += 15;
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
      // random gap between 900ms and 1900ms
      nextSpawnTime = 800 + Math.random() * 1100;
      obstacleTimer -= nextSpawnTime; // subtract to keep irregular spawns
    }

    // 4. increase speed gradually based on score
    speed = BASE_SPEED + Math.min(MAX_SPEED - BASE_SPEED, (score / 800) * 0.25);
    if (speed > MAX_SPEED) speed = MAX_SPEED;

    // 5. update score (time survived)
    score += delta * 0.1;
    scoreSpan.textContent = Math.floor(score);

    // 6. collision detection
    if (checkCollision()) {
      setGameOver();
    }
  }

  // ----- drawing routines (modern, smooth) -----
  function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // sky gradient (dark mode friendly, changes slightly with light mode later)
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

    // ground line with shadow
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#334155' : '#f5c542';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f5c54240';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // draw obstacles (modern 3D-ish blocks)
    obstacles.forEach(obs => {
      const x = obs.x;
      const y = GROUND_Y - obs.h;
      // main block
      ctx.fillStyle = document.body.classList.contains('light-mode') ? '#5f3b1c' : '#cf9f6e';
      ctx.shadowColor = '#00000060';
      ctx.shadowBlur = 12;
      ctx.fillRect(x, y, OBS_WIDTH, obs.h);
      // highlight
      ctx.fillStyle = document.body.classList.contains('light-mode') ? '#b77b46' : '#f5cba0';
      ctx.shadowBlur = 4;
      ctx.fillRect(x + 2, y - 2, OBS_WIDTH - 4, 6);
      ctx.shadowBlur = 0;
    });

    // draw dino (custom stylized)
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#f5c54260';
    // body
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2d3e50' : '#e5e7eb';
    ctx.beginPath();
    ctx.roundRect(DINO_X, dinoY, DINO_WIDTH, DINO_HEIGHT, 8);
    ctx.fill();
    // eye
    ctx.fillStyle = '#0a0c10';
    ctx.beginPath();
    ctx.arc(DINO_X + DINO_WIDTH - 8, dinoY + 8, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(DINO_X + DINO_WIDTH - 9, dinoY + 6, 1.8, 0, 2 * Math.PI);
    ctx.fill();
    // spikes
    ctx.fillStyle = '#f5c542';
    ctx.beginPath();
    ctx.moveTo(DINO_X + 2, dinoY - 4);
    ctx.lineTo(DINO_X + 10, dinoY - 12);
    ctx.lineTo(DINO_X + 18, dinoY - 4);
    ctx.fill();
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
      if (e.code !== 'Space') return;
      e.preventDefault();      // prevent page scroll
    }
    if (!gameActive || gameOver) return;

    // try to resume audio context (user interaction)
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

  // keyboard
  window.addEventListener('keydown', handleJump);
  // touch / click on canvas
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleJump(e); });
  canvas.addEventListener('mousedown', handleJump);

  // restart buttons (main overlay)
  restartMain.addEventListener('click', () => {
    restartGame();
  });

  // also if user clicks "restart" via hidden? but we only have one restart button inside game.
  // we also might want restart on canvas double tap? but fine.

  // dark mode toggle
  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    darkToggle.textContent = isLight ? '☀️' : '🌙';
  });

  // support button (simple alert to simulate support, but keeps design)
  supportBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('✨ thanks for supporting! (this is a demo, but your click matters.)');
  });

  // initialise audio on first user interaction anywhere
  document.addEventListener('click', function initAudioOnFirst() {
    initAudio();
    document.removeEventListener('click', initAudioOnFirst);
  }, { once: true });

  // start game loop
  requestAnimationFrame(gameLoop);

  // expose restart for debugging / additional restart (but we have button already)
})();
