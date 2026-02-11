const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const darkToggle = document.getElementById("darkToggle");

let running = false;
let gameOver = false;
let score = 0;

const dino = {
  x: 50,
  y: 200,
  w: 36,
  h: 36,
  vy: 0,
  jump: -10,
  gravity: 0.5,
  onGround: true
};

let obstacles = [];

function resetGame() {
  obstacles = [];
  dino.y = 200;
  dino.vy = 0;
  score = 0;
  gameOver = false;
  running = true;
  gameOverScreen.style.display = "none";
}

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 210,
    w: 20,
    h: 40
  });
}

function update() {
  // Gravity Dino
  dino.vy += dino.gravity;
  dino.y += dino.vy;

  // الأرض
  if (dino.y > 200) {
    dino.y = 200;
    dino.vy = 0;
  }

  // obstacles move
  obstacles.forEach(o => {
    o.x -= gameSpeed;

    // collision
    if (dino.x + dino.w > o.x &&
        dino.x < o.x + 12 &&
        dino.y + dino.h > o.y) {
      endGame();
    }
  });

  // remove offscreen
  obstacles = obstacles.filter(o => o.x + 20 > 0);

  // إضافة obstacles كل فترة
  if (frames % 120 === 0) addObstacle();
}

// Dino
let dino = {
  x: 50,       // position horizontal
  y: 200,      // position vertical (على الأرض)
  w: 28,       // width
  h: 28,       // height
  vy: 0,       // velocity vertical
  gravity: 0.6,
  jumpPower: -12
};

// obstacles (cactus)
let obstacles = [];
let gameSpeed = 5;

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // الأرض line
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 240);
  ctx.lineTo(canvas.width, 240);
  ctx.stroke();

  // Dino
  drawDino(dino.x, dino.y);

  // obstacles
  obstacles.forEach(o => drawCactus(o));
}

  function drawDino(x, y) {
  ctx.fillStyle = "#e5e7eb"; // light gray like Google Dino

  // body
  ctx.fillRect(x, y + 10, 28, 20);

  // head
  ctx.fillRect(x + 18, y, 18, 18);

  // eye
  ctx.fillStyle = "#020617";
  ctx.fillRect(x + 30, y + 6, 3, 3);

  ctx.fillStyle = "#e5e7eb";

  // legs
  ctx.fillRect(x + 6, y + 30, 6, 10);
  ctx.fillRect(x + 16, y + 30, 6, 10);

  // tail
  ctx.fillRect(x - 8, y + 16, 8, 6);
}

   function drawCactus(o) {
  ctx.fillStyle = "#22c55e";

  // main stem
  ctx.fillRect(o.x, o.y, 12, 40);

  // left arm
  ctx.fillRect(o.x - 6, o.y + 10, 6, 16);

  // right arm
  ctx.fillRect(o.x + 12, o.y + 16, 6, 14);
}
  
  function addObstacle() {
  let cactus = {
    x: canvas.width,
    y: 200,  // الأرض line
    passed: false
  };
  obstacles.push(cactus);
}

    if (
      dino.x < o.x + o.w &&
      dino.x + dino.w > o.x &&
      dino.y < o.y + o.h &&
      dino.y + dino.h > o.y
    ) {
      gameOver = true;
      running = false;
      gameOverScreen.style.display = "flex";
    }
  });

  obstacles = obstacles.filter(o => o.x + o.w > 0);

  score++;
  scoreEl.textContent = score;

  requestAnimationFrame(update);
}

let frames = 0;

function loop() {
  frames++;
  update();
  draw();
  requestAnimationFrame(loop);
}

// Controls
document.addEventListener("keydown", (e) => {

  // حبّس scroll ديال Space و ArrowUp
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
  }

  // Start game
  if (!running && !gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
    startScreen.style.display = "none";
    resetGame();
    update();
    return;
  }

  // Restart after game over
  if (gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
    resetGame();
    update();
    return;
  }

  // Jump
  if (running && dino.onGround && (e.code === "Space" || e.code === "ArrowUp")) {
    dino.vy = dino.jump;
    dino.onGround = false;
  }

});

document.addEventListener("click", () => {
  if (!running && !gameOver) {
    startScreen.style.display = "none";
    resetGame();
    update();
  } else if (gameOver) {
    resetGame();
    update();
  } else if (dino.onGround) {
    dino.vy = dino.jump;
    dino.onGround = false;
  }
});

restartBtn.onclick = () => {
  window.location.href = "https://omg10.com/4/10595848";
};

setInterval(() => {
  if (running) spawnObstacle();
}, 1500);

// Dark mode
darkToggle.onclick = () => {
  document.body.classList.toggle("dark");
};
