// ===== script.js =====
'use strict';

// ----- DOM elements -----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const highScoreSpan = document.getElementById('highScore');
const livesSpan = document.getElementById('lives');
const levelSpan = document.getElementById('level');
const restartBtn = document.getElementById('restartBtn');
const themeToggle = document.getElementById('themeToggle');
const supportBtn = document.getElementById('supportBtn');

// ----- constants & settings (adjusted for 720x540) -----
const ROWS = 5;
const COLS = 8;
const BRICK_HEIGHT = 22;
const PADDLE_BASE_WIDTH = 110;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 3.5;
const MAX_LEVEL = 5;

// power‑up types
const POWERUP_EXPAND = 0;
const POWERUP_MULTIBALL = 1;
const POWERUP_SLOWMO = 2;
const POWERUP_SIZE = 22;
const POWERUP_FALL_SPEED = 2.0;
const POWERUP_DURATION = 6000; // ms

// ----- game state -----
let gameState = 'active';        // 'active', 'gameover', 'win'
let score = 0;
let highScore = 0;
let lives = 3;
let level = 1;
let bricks = [];
let balls = [];
let powerups = [];
let particles = [];
let paddle = { x: 310, y: 500, width: PADDLE_BASE_WIDTH, height: PADDLE_HEIGHT };

// power‑up timers
let slowMoEnd = 0;
let expandEnd = 0;
let slowMoFactor = 1.0;

// keyboard control flags
let leftPressed = false;
let rightPressed = false;
const PADDLE_SPEED = 7;

// high score from localStorage
try {
  const saved = localStorage.getItem('breakout_high');
  if (saved) highScore = parseInt(saved) || 0;
} catch (e) { /* ignore */ }
highScoreSpan.textContent = highScore;

// ----- audio (web audio API, unlocked on first interaction) -----
let audioCtx = null;
let audioAllowed = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playSound(type) {
  if (!audioAllowed || !audioCtx || audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  switch (type) {
    case 'bounce': osc.frequency.value = 280; break;
    case 'brick': osc.frequency.value = 540; break;
    case 'gameover': osc.frequency.value = 130; break;
    case 'win': osc.frequency.value = 720; break;
    default: osc.frequency.value = 400;
  }
  osc.start(now);
  osc.stop(now + 0.12);
}
function unlockAudioOnInteraction() {
  if (audioAllowed) return;
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => {
      audioAllowed = true;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(0.01);
    }).catch(() => {});
  } else {
    audioAllowed = true;
  }
}
['mousemove', 'touchstart', 'click', 'keydown'].forEach(ev => 
  document.addEventListener(ev, unlockAudioOnInteraction, { once: true, passive: true })
);

// ----- helper: canvas relative coordinates -----
function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  return { x, y };
}

// ----- mouse/touch move -----
function handlePaddleMove(e) {
  e.preventDefault();
  if (gameState !== 'active') return;
  const { x } = getCanvasCoords(e);
  let newX = x - paddle.width / 2;
  newX = Math.max(0, Math.min(canvas.width - paddle.width, newX));
  paddle.x = newX;
}
canvas.addEventListener('mousemove', handlePaddleMove);
canvas.addEventListener('touchmove', handlePaddleMove, { passive: false });
canvas.addEventListener('mouseleave', () => {});

// ----- keyboard controls -----
function handleKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = true;
    e.preventDefault();
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = true;
    e.preventDefault();
  }
}
function handleKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    leftPressed = false;
    e.preventDefault();
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    rightPressed = false;
    e.preventDefault();
  }
}
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// ----- bricks generation (based on canvas width) -----
function generateBricks() {
  const newBricks = [];
  const cols = COLS;
  const rows = ROWS;
  const totalWidth = canvas.width - 40;
  const brickW = Math.floor(totalWidth / cols);
  const startX = (canvas.width - brickW * cols) / 2;
  const colors = ['#f94144','#f3722c','#f8961e','#f9c74f','#90be6d','#43aa8b','#577590'];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      newBricks.push({
        x: startX + c * brickW,
        y: 50 + r * (BRICK_HEIGHT + 8),
        w: brickW - 4,
        h: BRICK_HEIGHT,
        active: true,
        color: colors[(r + level) % colors.length],
        row: r
      });
    }
  }
  bricks = newBricks;
}

// ----- initial ball(s) -----
function resetBall() {
  balls = [{
    x: canvas.width / 2,
    y: 450,
    dx: (Math.random() > 0.5 ? BASE_BALL_SPEED : -BASE_BALL_SPEED) * 0.9,
    dy: -BASE_BALL_SPEED * 0.9,
    r: BALL_RADIUS
  }];
}
function resetPaddle() {
  paddle.width = PADDLE_BASE_WIDTH;
  paddle.x = (canvas.width - paddle.width) / 2;
  paddle.y = canvas.height - 50;
  expandEnd = 0;
}
function resetGame(lev = 1) {
  gameState = 'active';
  level = Math.min(lev, MAX_LEVEL);
  lives = 3;
  score = 0;
  updateUI();
  resetBall();
  resetPaddle();
  generateBricks();
  powerups = [];
  particles = [];
  slowMoEnd = 0;
  slowMoFactor = 1.0;
  expandEnd = 0;
  leftPressed = false;
  rightPressed = false;
}
restartBtn.addEventListener('click', () => resetGame(1));

// ----- level progression -----
function nextLevel() {
  if (level < MAX_LEVEL) {
    level++;
    levelSpan.textContent = level;
    balls.forEach(b => {
      const sp = Math.hypot(b.dx, b.dy) * 1.1;
      const angle = Math.atan2(b.dy, b.dx);
      b.dx = Math.cos(angle) * sp;
      b.dy = Math.sin(angle) * sp;
    });
    resetPaddle();
    resetBall();
    generateBricks();
    powerups = [];
    particles = [];
    slowMoEnd = 0; slowMoFactor = 1.0;
    expandEnd = 0;
  } else {
    gameState = 'win';
    playSound('win');
  }
}

// ----- apply powerup -----
function applyPowerup(type) {
  playSound('brick');
  if (type === POWERUP_EXPAND) {
    paddle.width = PADDLE_BASE_WIDTH * 1.6;
    expandEnd = performance.now() + POWERUP_DURATION;
  } else if (type === POWERUP_MULTIBALL) {
    if (balls.length < 6) {
      for (let i = 0; i < 2; i++) {
        let base = balls[0] || balls[balls.length-1];
        let angle = Math.atan2(base.dy, base.dx) + (i === 0 ? 0.5 : -0.7);
        let sp = Math.hypot(base.dx, base.dy) * 1.0;
        balls.push({
          x: base.x + (i*10-5),
          y: base.y - 10,
          dx: Math.cos(angle) * sp,
          dy: Math.sin(angle) * sp,
          r: BALL_RADIUS
        });
      }
    }
  } else if (type === POWERUP_SLOWMO) {
    slowMoFactor = 0.45;
    slowMoEnd = performance.now() + POWERUP_DURATION;
  }
}

// ----- update ui -----
function updateUI() {
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  levelSpan.textContent = level;
  if (score > highScore) {
    highScore = score;
    highScoreSpan.textContent = highScore;
    try { localStorage.setItem('breakout_high', highScore); } catch (e) {}
  }
}

// ----- particles on brick break -----
function createParticles(px, py, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: px, y: py,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 2) * 3,
      life: 1.0,
      size: 5 + Math.random() * 6,
      color: color
    });
  }
}

// ----- update game -----
function update() {
  if (gameState !== 'active') return;

  // power‑up timers
  const now = performance.now();
  if (expandEnd && now > expandEnd) {
    paddle.width = PADDLE_BASE_WIDTH;
    expandEnd = 0;
  }
  if (slowMoEnd && now > slowMoEnd) {
    slowMoFactor = 1.0;
    slowMoEnd = 0;
  }

  // keyboard paddle movement
  if (leftPressed) {
    paddle.x = Math.max(0, paddle.x - PADDLE_SPEED);
  }
  if (rightPressed) {
    paddle.x = Math.min(canvas.width - paddle.width, paddle.x + PADDLE_SPEED);
  }

  // move balls (with slowMo)
  balls.forEach(b => {
    b.x += b.dx * slowMoFactor;
    b.y += b.dy * slowMoFactor;
  });

  // wall collisions
  balls.forEach(b => {
    if (b.x - b.r < 0) { b.x = b.r; b.dx *= -1; playSound('bounce'); }
    if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.dx *= -1; playSound('bounce'); }
    if (b.y - b.r < 0) { b.y = b.r; b.dy *= -1; playSound('bounce'); }
  });

  // paddle collision
  balls.forEach(b => {
    if (b.dy > 0 && b.y + b.r > paddle.y && b.x > paddle.x && b.x < paddle.x + paddle.width && b.y - b.r < paddle.y + paddle.height) {
      let offset = (b.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
      let angle = offset * 1.2;
      let speed = Math.hypot(b.dx, b.dy) * 1.02;
      b.dx = Math.sin(angle) * speed;
      b.dy = -Math.cos(angle) * speed;
      b.y = paddle.y - b.r;
      playSound('bounce');
    }
  });

  // brick collision
  for (let i = bricks.length - 1; i >= 0; i--) {
    const br = bricks[i];
    if (!br.active) continue;
    for (let j = balls.length - 1; j >= 0; j--) {
      const b = balls[j];
      const closestX = Math.max(br.x, Math.min(b.x, br.x + br.w));
      const closestY = Math.max(br.y, Math.min(b.y, br.y + br.h));
      const dx = b.x - closestX;
      const dy = b.y - closestY;
      const dist = Math.hypot(dx, dy);
      if (dist < b.r) {
        br.active = false;
        playSound('brick');
        score += 10;
        updateUI();

        createParticles(br.x + br.w/2, br.y + br.h/2, br.color);

        if (Math.random() < 0.15) {
          powerups.push({
            x: br.x + br.w/2 - POWERUP_SIZE/2,
            y: br.y,
            w: POWERUP_SIZE,
            h: POWERUP_SIZE,
            type: Math.floor(Math.random() * 3),
            active: true
          });
        }

        if (Math.abs(dx) > Math.abs(dy)) b.dx *= -1;
        else b.dy *= -1;

        const overlap = b.r - dist;
        if (overlap > 0) {
          if (Math.abs(dx) > Math.abs(dy)) b.x += (dx > 0 ? overlap : -overlap);
          else b.y += (dy > 0 ? overlap : -overlap);
        }
        break;
      }
    }
  }

  bricks = bricks.filter(b => b.active);
  if (bricks.length === 0) nextLevel();

  balls = balls.filter(b => {
    if (b.y + b.r > canvas.height + 20) return false;
    return true;
  });

  if (balls.length === 0 && gameState === 'active') {
    lives--;
    updateUI();
    if (lives <= 0) {
      gameState = 'gameover';
      playSound('gameover');
    } else {
      resetBall();
      resetPaddle();
      powerups = [];
      slowMoEnd = 0; slowMoFactor = 1.0;
      expandEnd = 0;
    }
  }

  // move power‑ups
  powerups.forEach((p, idx) => {
    p.y += POWERUP_FALL_SPEED;
    if (p.y + p.h > paddle.y && p.x < paddle.x + paddle.width && p.x + p.w > paddle.x && p.y < paddle.y + paddle.height) {
      applyPowerup(p.type);
      powerups.splice(idx, 1);
    }
  });
  powerups = powerups.filter(p => p.y < canvas.height + 30);

  // particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= 0.012;
  });
  particles = particles.filter(p => p.life > 0.1 && p.y < canvas.height + 50);
}

// ----- drawing (glow effects) -----
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#09131f');
  grad.addColorStop(1, '#162b38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // bricks
  bricks.forEach(b => {
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 8);
    ctx.fill();
  });

  // power‑ups
  powerups.forEach(p => {
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#fff9cf';
    ctx.fillStyle = p.type === POWERUP_EXPAND ? '#ffb86b' : (p.type === POWERUP_MULTIBALL ? '#c4a1ff' : '#6ed4b0');
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#0e1e2b';
    ctx.fillText(p.type === POWERUP_EXPAND ? '⬌' : (p.type === POWERUP_MULTIBALL ? '🌀' : '⏳'), p.x+3, p.y+18);
  });

  // paddle
  ctx.shadowBlur = 30;
  ctx.shadowColor = '#4f9da6';
  ctx.fillStyle = paddle.width > PADDLE_BASE_WIDTH+1 ? '#ffe48f' : '#b8e1e8';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 16);
  ctx.fill();

  // balls
  balls.forEach(b => {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#e3f2fd';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#f5f9ff';
    ctx.fill();
  });

  // particles
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.shadowBlur = 15 * p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0;

  // overlays
  if (gameState === 'gameover') {
    ctx.fillStyle = '#0b0f17cc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillStyle = '#f4a3a3';
    ctx.shadowBlur = 36;
    ctx.shadowColor = '#ff3366';
    ctx.fillText('GAME OVER', 130, 280);
  }
  if (gameState === 'win') {
    ctx.fillStyle = '#0f242ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 50px Inter';
    ctx.fillStyle = '#c3e88d';
    ctx.shadowBlur = 36;
    ctx.shadowColor = '#a6e22e';
    ctx.fillText('YOU WIN!', 180, 280);
  }
}

// roundRect utility
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

// ----- animation loop -----
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// theme toggle
themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  if (current === 'light') {
    html.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  } else {
    html.setAttribute('data-theme', 'light');
    themeToggle.textContent = '☀️';
  }
});

// support button
supportBtn.addEventListener('click', () => {
  alert('✨ Thanks for your support! (demo)');
});

// start game
resetGame(1);
