// =============================================
//  SPACE WAVES - FULL GAME with DARK MODE + BLOG
//  CHANGE THESE LINKS TO YOUR OWN URLs
// =============================================
const FIRST_RESTART_LINK = 'https://your-link-here.com';   // 🔁 first restart click
const SUPPORT_LINK = 'https://your-support-page.com';      // 💙 support button

// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreValue');
const highScoreEl = document.getElementById('highScoreValue');

// ===== GAME STATE =====
let gameActive = false;
let gameOver = false;
let playerX = canvas.width / 2;
const playerRadius = 16;
const playerY = canvas.height - 55;

let enemies = [];
let score = 0;
let highScore = localStorage.getItem('spaceWavesHighScore') || 0;
highScoreEl.textContent = highScore;

// Enemy settings
const ENEMY_RADIUS = 12;
const ENEMY_SPEED = 1.8;
const SPAWN_RATE = 28; // frames between spawns
let frameCounter = 0;

// ===== RESTART BUTTON DUAL BEHAVIOR =====
let firstRestartClick = true;
const restartBtn = document.getElementById('restartBtn');

function handleRestart() {
    if (firstRestartClick) {
        // FIRST CLICK → go to your custom link
        window.location.href = FIRST_RESTART_LINK;
        firstRestartClick = false;
    } else {
        // LATER CLICKS → restart game normally
        resetGame();
    }
}
restartBtn.addEventListener('click', handleRestart);

// ===== RESET GAME (keep high score) =====
function resetGame() {
    gameActive = true;
    gameOver = false;
    enemies = [];
    score = 0;
    playerX = canvas.width / 2;
    frameCounter = 0;
    scoreEl.textContent = '0';
}

// ===== DARK MODE TOGGLE =====
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkToggle.textContent = isDark ? '☀️ LIGHT' : '🌙 DARK';
});

// ===== SUPPORT BUTTON LINK =====
document.getElementById('supportLinkBtn').href = SUPPORT_LINK;

// ===== MOUSE / TOUCH CONTROL =====
function handleMove(e) {
    if (!gameActive && gameOver) return;
    e.preventDefault(); // for touch
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;   // canvas physical size vs CSS
    let clientX;
    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    let canvasRelativeX = (clientX - rect.left) * scaleX;
    // clamp
    playerX = Math.min(Math.max(canvasRelativeX, playerRadius + 5), canvas.width - playerRadius - 5);
}

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchstart', handleMove, { passive: false });

// ===== SPAWN ENEMY =====
function spawnEnemy() {
    const x = Math.random() * (canvas.width - 2 * ENEMY_RADIUS) + ENEMY_RADIUS;
    enemies.push({
        x: x,
        y: -ENEMY_RADIUS,
        radius: ENEMY_RADIUS,
        speed: ENEMY_SPEED + Math.random() * 0.6
    });
}

// ===== COLLISION DETECTION =====
function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dx = e.x - playerX;
        const dy = e.y - playerY;
        const dist = Math.hypot(dx, dy);
        if (dist < e.radius + playerRadius) {
            gameActive = false;
            gameOver = true;
            // update high score
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('spaceWavesHighScore', highScore);
                highScoreEl.textContent = highScore;
            }
            return true;
        }
    }
    return false;
}

// ===== DRAW =====
function draw() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ---- background stars ----
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) continue; // lazy random
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`;
        ctx.beginPath();
        ctx.arc((i * 23) % canvas.width, (i * 9) % canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ---- player (spaceship) ----
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -playerRadius * 1.6);
    ctx.lineTo(-playerRadius, playerRadius * 0.8);
    ctx.lineTo(playerRadius, playerRadius * 0.8);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---- enemies (waves) ----
    enemies.forEach(e => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#0ea5e9';
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(e.x - 2, e.y - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // ---- score on canvas (backup) ----
    ctx.font = 'bold 22px "Segoe UI"';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ea5e9';
    ctx.fillText(`⚡${score}`, 30, 70);
    ctx.shadowBlur = 0;

    // ---- game over message ----
    if (gameOver && !gameActive) {
        ctx.font = 'bold 36px "Segoe UI"';
        ctx.fillStyle = '#facc15';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fillText('GAME OVER', canvas.width/2-140, canvas.height/2-20);
        ctx.font = '22px "Segoe UI"';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('click RESTART', canvas.width/2-90, canvas.height/2+40);
    }
}

// ===== UPDATE =====
function update() {
    if (gameActive && !gameOver) {
        // move enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            if (enemies[i].y > canvas.height + ENEMY_RADIUS) {
                enemies.splice(i, 1);
            }
        }

        // spawn enemies
        frameCounter++;
        if (frameCounter % SPAWN_RATE === 0) {
            spawnEnemy();
        }

        // increase score
        score += 0.1;
        scoreEl.textContent = Math.floor(score);

        // collision
        checkCollisions();
    }
    draw();
    requestAnimationFrame(update);
}

// ===== INIT & START =====
resetGame(); // sets gameActive = true
update();

// ===== Prevent context menu on canvas =====
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
