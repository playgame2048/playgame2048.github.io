// =============================================
//  SPACE WAVES - F-16 FIGHTER vs ROCKETS
//  CHANGE THESE LINKS TO YOUR OWN URLs
// =============================================
const FIRST_RESTART_LINK = 'https://omg10.com/4/10599305';   // 🔁 first restart click
const SUPPORT_LINK = 'https://ko-fi.com/help_tommy';      // 💙 support button

// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreValue');
const highScoreEl = document.getElementById('highScoreValue');

// ===== GAME STATE =====
let gameActive = false;
let gameOver = false;
let playerX = canvas.width / 2;
const playerRadius = 16;        // collision radius (unchanged)
const playerY = canvas.height - 55;

let enemies = [];
let score = 0;
let highScore = localStorage.getItem('spaceWavesHighScore') || 0;
highScoreEl.textContent = highScore;

// Enemy settings
const ENEMY_RADIUS = 12;        // collision radius (unchanged)
const ENEMY_SPEED = 1.8;
const SPAWN_RATE = 28;
let frameCounter = 0;

// ===== KEYBOARD CONTROL =====
let leftPressed = false;
let rightPressed = false;
const MOVE_SPEED = 6;

// ===== RESTART BUTTON DUAL BEHAVIOR =====
let firstRestartClick = true;
const restartBtn = document.getElementById('restartBtn');

function handleRestart() {
    if (firstRestartClick) {
        window.location.href = FIRST_RESTART_LINK;
        firstRestartClick = false;
    } else {
        resetGame();
    }
}
restartBtn.addEventListener('click', handleRestart);

// ===== RESET GAME =====
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
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    let clientX;
    if (e.touches) {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    let canvasRelativeX = (clientX - rect.left) * scaleX;
    playerX = Math.min(Math.max(canvasRelativeX, playerRadius + 5), canvas.width - playerRadius - 5);
}

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchstart', handleMove, { passive: false });

// ===== KEYBOARD EVENT LISTENERS =====
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = true;
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        rightPressed = true;
        e.preventDefault();
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        leftPressed = false;
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        rightPressed = false;
        e.preventDefault();
    }
});

// ===== SPAWN ENEMY (ROCKET) =====
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

// ============================================
//  🎨 DRAW PLAYER – F-16 FIGHTER JET
// ============================================
function drawPlayer() {
    ctx.save();
    ctx.translate(playerX, playerY);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';

    // ----- Fuselage (main body) -----
    ctx.fillStyle = '#facc15'; // gold
    ctx.beginPath();
    ctx.moveTo(0, -22);        // nose tip
    ctx.lineTo(-12, 12);       // left rear
    ctx.lineTo(12, 12);        // right rear
    ctx.closePath();
    ctx.fill();

    // ----- Wings -----
    ctx.fillStyle = '#fbbf24'; // lighter gold
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.lineTo(-22, 2);
    ctx.lineTo(-22, -2);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(22, 2);
    ctx.lineTo(22, -2);
    ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();

    // ----- Tail (vertical stabilizers) -----
    ctx.fillStyle = '#f59e0b'; // orange
    // Left tail
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(-10, 20);
    ctx.lineTo(-6, 20);
    ctx.closePath();
    ctx.fill();
    // Right tail
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(10, 20);
    ctx.lineTo(6, 20);
    ctx.closePath();
    ctx.fill();

    // ----- Cockpit -----
    ctx.fillStyle = '#0ea5e9'; // bright blue
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -16, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ============================================
//  🚀 DRAW ENEMY – ROCKET / MISSILE
// ============================================
function drawEnemy(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#0ea5e9';

    // ----- Rocket body (main fuselage) -----
    ctx.fillStyle = '#3b82f6'; // medium blue
    ctx.beginPath();
    ctx.rect(-4, -6, 8, 12);   // width 8, height 12, centered
    ctx.fill();

    // ----- Nose cone (pointing down) -----
    ctx.fillStyle = '#ef4444'; // red
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(4, 6);
    ctx.closePath();
    ctx.fill();

    // ----- Fins (top) -----
    ctx.fillStyle = '#94a3b8'; // gray
    // Left fin
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(-8, -10);
    ctx.lineTo(-4, -10);
    ctx.closePath();
    ctx.fill();
    // Right fin
    ctx.beginPath();
    ctx.moveTo(4, -6);
    ctx.lineTo(8, -10);
    ctx.lineTo(4, -10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// ===== DRAW (overridden) =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ---- Stars background ----
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) continue;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`;
        ctx.beginPath();
        ctx.arc((i * 23) % canvas.width, (i * 9) % canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // ---- Draw enemies (rockets) ----
    enemies.forEach(e => drawEnemy(e.x, e.y));

    // ---- Draw player (F-16) ----
    drawPlayer();

    // ---- Score on canvas ----
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ea5e9';
    ctx.fillText(`⚡${Math.floor(score)}`, 20, 50);
    ctx.shadowBlur = 0;

    // ---- Game Over message ----
    if (gameOver && !gameActive) {
        ctx.font = 'bold 28px "Segoe UI"';
        ctx.fillStyle = '#facc15';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fillText('GAME OVER', canvas.width/2-110, canvas.height/2-15);
        ctx.font = '18px "Segoe UI"';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('click RESTART', canvas.width/2-80, canvas.height/2+30);
    }
}

// ===== UPDATE (unchanged logic) =====
function update() {
    if (gameActive && !gameOver) {
        // Keyboard movement
        if (leftPressed) playerX -= MOVE_SPEED;
        if (rightPressed) playerX += MOVE_SPEED;
        playerX = Math.min(Math.max(playerX, playerRadius + 5), canvas.width - playerRadius - 5);

        // Move enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += enemies[i].speed;
            if (enemies[i].y > canvas.height + ENEMY_RADIUS) {
                enemies.splice(i, 1);
            }
        }
        // Spawn enemies
        frameCounter++;
        if (frameCounter % SPAWN_RATE === 0) spawnEnemy();
        // Increase score
        score += 0.1;
        scoreEl.textContent = Math.floor(score);
        // Collision
        checkCollisions();
    }
    draw();
    requestAnimationFrame(update);
}

// ===== INIT =====
resetGame();
update();

canvas.addEventListener('contextmenu', (e) => e.preventDefault());
