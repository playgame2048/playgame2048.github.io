// script.js - upgraded with particles, animations, and ad placeholder
/************************************
 * MODERN MINESWEEPER
 * pure JS, dark/light, sounds, high scores, timer, particle effects
 ************************************/

// -------- state & config ----------
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const mineCountEl = document.getElementById('mine-count');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const supportBtn = document.getElementById('support-btn');
const particleCanvas = document.getElementById('particle-canvas');
let ctx = particleCanvas.getContext('2d');

let board = [];
let rows, cols, mineCount;
let gameActive = false;         // true after first click (board generated)
let gameWon = false;
let gameOver = false;
let flagsPlaced = 0;
let revealedCount = 0;
let timerInterval = null;
let timerSeconds = 0;
let firstClick = true;          // board generation after first click
let currentDifficulty = 'medium';

// scores: score = revealedCells * 10 (simple)
let score = 0;
let highScores = {
  easy: localStorage.getItem('ms_high_easy') || 0,
  medium: localStorage.getItem('ms_high_medium') || 0,
  hard: localStorage.getItem('ms_high_hard') || 0
};

// sound context (will be activated after first user gesture)
let audioCtx = null;
const sounds = {
  click: null,
  explosion: null,
  win: null
};

// difficulty presets
const difficulties = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 20 },
  hard: { rows: 16, cols: 16, mines: 40 }
};

// particle system
let particles = [];
const PARTICLE_COUNT = 100;
let animationFrame = null;

// first restart link flag (like in dino game)
let firstRestartClicked = false;
const RESTART_LINK = "https://example.com"; // Replace with your Monetag or desired link

// ---------- helper functions ----------
function formatTime(sec) {
  return String(sec).padStart(3, '0').slice(0, 3);
}

function updateMineCounter() {
  let remaining = mineCount - flagsPlaced;
  mineCountEl.textContent = String(remaining).padStart(3, '0');
}

function updateScore() {
  score = revealedCount * 10;
  scoreEl.textContent = String(score).padStart(4, '0');
}

function updateHighScoreDisplay() {
  let hs = highScores[currentDifficulty];
  highScoreEl.textContent = String(hs).padStart(4, '0');
}

// save high score for current difficulty if beaten
function checkHighScore() {
  if (score > highScores[currentDifficulty]) {
    highScores[currentDifficulty] = score;
    localStorage.setItem(`ms_high_${currentDifficulty}`, score);
    updateHighScoreDisplay();
  }
}

// stop timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// start timer (only if not already running and game active)
function startTimer() {
  if (timerInterval || !gameActive || gameWon || gameOver) return;
  timerSeconds = 0;
  timerEl.textContent = formatTime(0);
  timerInterval = setInterval(() => {
    if (gameActive && !gameWon && !gameOver) {
      timerSeconds++;
      timerEl.textContent = formatTime(timerSeconds);
    } else {
      if (gameWon || gameOver) stopTimer();
    }
  }, 1000);
}

// particle effect on win
function spawnParticles() {
  particles = [];
  const w = particleCanvas.width, h = particleCanvas.height;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: w * 0.5,
      y: h * 0.5,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.8) * 10,
      size: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 60 + 200}, 80%, 60%)`,
      life: 1.0,
      decay: 0.01 + Math.random() * 0.02
    });
  }
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animateParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  let alive = false;
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
    p.life -= p.decay;
    if (p.life > 0) {
      alive = true;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (alive) {
    animationFrame = requestAnimationFrame(animateParticles);
  } else {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    animationFrame = null;
  }
}

// resize canvas to match board wrapper
function resizeParticleCanvas() {
  const wrapper = document.querySelector('.board-wrapper');
  if (wrapper) {
    particleCanvas.width = wrapper.clientWidth;
    particleCanvas.height = wrapper.clientHeight;
  }
}
window.addEventListener('resize', resizeParticleCanvas);

// reset board (new empty grid)
function resetBoard() {
  gameActive = false;
  gameWon = false;
  gameOver = false;
  firstClick = true;
  flagsPlaced = 0;
  revealedCount = 0;
  score = 0;
  stopTimer();
  timerSeconds = 0;
  timerEl.textContent = '000';
  updateMineCounter();
  scoreEl.textContent = '0000';

  // clear particles
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  }

  // create empty board
  board = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0
  })));

  renderBoard();
}

// generate mines after first click (exclude first cell)
function generateMines(firstRow, firstCol) {
  let minesToPlace = mineCount;
  while (minesToPlace > 0) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (r === firstRow && c === firstCol) continue;
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minesToPlace--;
    }
  }
  // calculate adjacent numbers
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
        }
      }
      board[r][c].adjacent = count;
    }
  }
}

// flood fill reveal (zero expansion)
function revealCell(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= cols) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  revealedCount++;
  updateScore();

  if (cell.mine) {
    return;
  }

  if (cell.adjacent === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        revealCell(r + dr, c + dc);
      }
    }
  }
}

// check win condition
function checkWin() {
  let correctRevealed = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine && board[r][c].revealed) correctRevealed++;
    }
  }
  const totalSafe = rows * cols - mineCount;
  if (correctRevealed === totalSafe) {
    gameWon = true;
    gameActive = false;
    stopTimer();
    playSound('win');
    checkHighScore();
    spawnParticles(); // 🎉 particle effect
  }
}

// left click handler
function leftClick(r, c) {
  if (gameWon || gameOver) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;

  if (firstClick) {
    generateMines(r, c);
    firstClick = false;
    gameActive = true;
    startTimer();
  }

  if (cell.mine) {
    gameOver = true;
    gameActive = false;
    cell.revealed = true;
    playSound('explosion');
    stopTimer();
    for (let rr = 0; rr < rows; rr++) {
      for (let cc = 0; cc < cols; cc++) {
        if (board[rr][cc].mine && !board[rr][cc].flagged) {
          board[rr][cc].revealed = true;
        }
      }
    }
    renderBoard();
    return;
  }

  playSound('click');
  revealCell(r, c);
  checkWin();
  renderBoard();
}

// right click (flag)
function rightClick(e, r, c) {
  e.preventDefault();
  if (gameWon || gameOver) return;
  const cell = board[r][c];
  if (cell.revealed) return;

  if (!cell.flagged) {
    if (flagsPlaced < mineCount) {
      cell.flagged = true;
      flagsPlaced++;
    } else return;
  } else {
    cell.flagged = false;
    flagsPlaced--;
  }
  updateMineCounter();
  playSound('click');
  renderBoard();
}

// render board from state
function renderBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      if (cell.revealed) {
        cellDiv.classList.add('revealed');
        if (cell.mine) {
          cellDiv.classList.add('mine');
        } else if (cell.adjacent > 0) {
          cellDiv.textContent = cell.adjacent;
          cellDiv.setAttribute('data-value', cell.adjacent);
        } else {
          // empty revealed
        }
      } else if (cell.flagged) {
        cellDiv.classList.add('flagged');
      }

      cellDiv.dataset.row = r;
      cellDiv.dataset.col = c;

      // event listeners
      cellDiv.addEventListener('click', (e) => {
        e.preventDefault();
        const row = parseInt(e.currentTarget.dataset.row);
        const col = parseInt(e.currentTarget.dataset.col);
        leftClick(row, col);
      });

      cellDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const row = parseInt(e.currentTarget.dataset.row);
        const col = parseInt(e.currentTarget.dataset.col);
        rightClick(e, row, col);
      });

      // mobile touch handling
      let touchTimer;
      cellDiv.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchTimer = setTimeout(() => {
          const row = parseInt(e.currentTarget.dataset.row);
          const col = parseInt(e.currentTarget.dataset.col);
          rightClick(e, row, col);
        }, 500);
      });
      cellDiv.addEventListener('touchend', (e) => {
        clearTimeout(touchTimer);
        if (!e.defaultPrevented) {
          const row = parseInt(e.currentTarget.dataset.row);
          const col = parseInt(e.currentTarget.dataset.col);
          leftClick(row, col);
        }
      });
      cellDiv.addEventListener('touchmove', (e) => clearTimeout(touchTimer));
      cellDiv.addEventListener('touchcancel', (e) => clearTimeout(touchTimer));

      boardEl.appendChild(cellDiv);
    }
  }
}

// load difficulty with animation
function setDifficulty(level) {
  // add changing class for fade effect
  boardEl.classList.add('changing');
  setTimeout(() => {
    currentDifficulty = level;
    const cfg = difficulties[level];
    rows = cfg.rows;
    cols = cfg.cols;
    mineCount = cfg.mines;
    updateHighScoreDisplay();
    resetBoard();
    boardEl.classList.remove('changing');
  }, 200);
}

// ---------- sound init ----------
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  sounds.click = (() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx = audioCtx.createGain();
.createGain();
    osc    osc.type = 'sine';
    osc.type = 'sine';
    osc.frequency.value = 800.frequency.value = 800;
   ;
    gain.gain.value = 0.1;
 gain.gain.value = 0.1;
    osc    osc.connect(gain).connect(audioC.connect(gain).connect(audioCtx.destination);
    osc.start();
tx.destination);
    osc.start();
    osc.stop(audioCtx    osc.stop(audioCtx.currentTime + 0.currentTime + 0.05);
  });
  sounds.ex.05);
  });
  sounds.explosion = (() => {
   plosion = (() => {
    const osc = audio const oscCtx.createOscillator = audioCtx.createOscillator();
    const gain = audio();
    const gain = audioCtx.createGain();
Ctx.createGain();
    osc.type = 'sawto    osc.type = 'soth';
    osc.frequency.value = 150awtooth';
    osc.frequency.value = 150;
    gain.g;
    gain.gain.value = ain.value = 0.0.2;
    gain2;
    gain.gain.gain.exponentialRampToValueAtTime.exponentialRampToValueAtTime(0.0001,(0.0001, audioCtx.current audioCtx.currentTime + 0Time + 0.2.2);
    osc.connect(gain);
    osc.connect(gain).connect(audioCtx.destination);
   ).connect(audioCtx.destination);
    osc.start();
    osc.stop osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  });
  sounds.win(audioCtx.currentTime + 0.2);
  });
  sounds.win = ( = (() => {
    const now = audioCtx.currentTime;
    for (let i() => {
    const now = audioCtx.currentTime;
    for (let i =  = 0; i < 30; i < 3; i++) {
      const osc = audioCtx.create; i++) {
      const osc = audioCtx.createOscillator();
      constOscillator();
      const gain = gain = audioCtx.createGain audioCtx.createGain();
      osc.type();
      osc.type = 'triangle';
      osc.frequency = 'triangle';
      osc.frequency.value = 600.value = 600 + i * 100;
      gain + i * 100;
      gain.gain.gain.value = 0.1.value = 0.1;
     ;
      gain.gain.ex gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connectponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain(gain).connect(audioCtx).connect(audioCtx.destination);
      osc.start(now + i.destination);
      osc.start(now + i * 0. * 0.12);
12);
      osc.stop(now + 0      osc.stop(now + 0.3 + i * 0.12);
    }
.3 + i * 0.12);
    }
  });
}

function  });
 playSound(type) {
  if (!}

function playSound(type) {
  if (!audioCtx) {
    initAudio();
    if (audioCtx.state === 'suspendedaudioCtx) {
    initAudio();
    if (audioCtx.state === 'suspended') {
') {
      audioCtx.resume      audioCtx.resume();
    }
  } else if (audioC();
    }
  } else if (audioCtx.statetx.state === 'suspended') {
 === 'suspended') {
      audio      audioCtx.resume();
  }
  if (sounds[typeCtx.resume();
  }
  if (sounds[type]) sounds[type]) sounds[type]();
}

// ---------- event listeners ----------
difficultySelect.addEventListener('change]();
}

// ---------- event listeners ----------
difficultySelect.addEventListener('change', (e) => {
  setDifficulty(e.target.value);
});

// Restart button: first click opens a link (like in dino game),', (e) => {
  setDifficulty(e.target.value);
});

// Restart button: first click opens a link (like in dino game), then res then resets
restartBtn.addEventListener('click', () => {
  if (!firstRestartClicked) {
    firstRestartClicked = true;
ets
restartBtn.addEventListener('click', () => {
  if (!firstRestartClicked) {
    firstRestartClicked = true;
    window.open(RESTART_LINK, '_blank');
  }
  setDifficulty(currentDifficulty); // reset same difficulty
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
});

supportBtn.addEventListener('click', () => {
  window.open('https://ko-fi.com/help_tommy', '_blank');
});

// enable audio on first user interaction
document.body.addEventListener('click', function enableAudio() {
  if (!audioCtx) {
    initAudio();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}, { once: true });

//    window.open(RESTART_LINK, '_blank');
  }
  setDifficulty(currentDifficulty); // reset same difficulty
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
});

supportBtn.addEventListener('click', () => {
  window.open('https://ko-fi.com/help_tommy', '_blank');
});

// enable audio on first user interaction
document.body.addEventListener('click', function enableAudio() {
  if (!audioCtx) {
    initAudio();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}, { once: resize canvas on load and orientation change
window.addEventListener('load', () => {
  resizeParticleCanvas();
  setDifficulty('medium');
});
window.addEventListener('resize', resizeParticleCanvas);

// initial setup
updateHighScoreDisplay();
 true });

// resize canvas on load and orientation change
window.addEventListener('load', () => {
  resizeParticleCanvas();
  setDifficulty('medium');
});
window.addEventListener('resize', resizeParticleCanvas);

// initial setup
updateHighScoreDisplay();
