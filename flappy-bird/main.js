const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");

let bird, pipes, score, gravity, gameSpeed;
let gameRunning = false;
let firstRestart = true;

const restartLink = "https://otieu.com/4/10574252";

// ===== INIT =====
function init() {
  bird = {
    x: 60,
    y: canvas.height / 2, // bird يبدأ فوسط الشاشة
    size: 14,
    velocity: 8
  };

  pipes = [];
  score = 0;
  gravity = 0.25;        // ممكن تخفف شوية، مثلا 0.25 فالأول
  gameSpeed = 2;
  gameRunning = true;
  frames = 0;           // إعادة frames
  gameOverScreen.style.display = "none";
}

// ===== CONTROLS =====
function flap(){
  bird.velocity = -6; // bird يرتفع
}
document.addEventListener("keydown", e=>{
  if(e.code==="Space" || e.code==="ArrowUp") flap();
});
canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", e=>{
  e.preventDefault();
  flap();
});


// prevent scroll
window.addEventListener("keydown", e => {
  if (["Space","ArrowUp","ArrowDown"].includes(e.code)) {
    e.preventDefault();
    if (e.code === "ArrowUp") flap();
  }
});

// ===== PIPES =====
function addPipe() {
  const gap = 120;
  const topHeight = Math.random() * 200 + 40;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - gap
  });
}

// ===== UPDATE =====
function update(deltaTime){
  // Gravity
  bird.velocity += gravity * deltaTime;
  if(bird.velocity > 8) bird.velocity = 8;
  if(bird.velocity < -8) bird.velocity = -8;

  bird.y += bird.velocity * deltaTime;

  // Pipes movement
  pipes.forEach(p => p.x -= gameSpeed * deltaTime);

  // Spawn pipes every 120 frames
  if(frames % 120 === 0) addPipe();

  // Collision detection
  if(bird.y < 0 || bird.y + bird.size > canvas.height || checkPipeCollision()){
    gameOver();
  }
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Bird
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
  ctx.fill();

  // Pipes
  ctx.fillStyle = "#16a34a";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, 40, p.top);
    ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
  });

  // Score
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);
}

// ===== GAME OVER =====
function endGame() {
  gameRunning = false;
  gameOverScreen.style.display = "flex";
}

// ===== LOOP =====
let lastTime = 0;

function loop(timeStamp){
  const deltaTime = (timeStamp - lastTime)/16; // normalize fps
  lastTime = timeStamp;

  if(gameRunning){
    update(deltaTime);
    draw();
    frames += deltaTime;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

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

// START
init();
loop();

