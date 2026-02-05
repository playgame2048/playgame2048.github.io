const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let bird, pipes, frames, gameRunning, gravity, gameSpeed;
const box = 20;
const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
let firstRestart = true;
const restartLink = "https://otieu.com/4/10557461";

// === INIT FUNCTION ===
function init(){
    canvas.width = 360; 
    canvas.height = 400;

    bird = { x:60, y:canvas.height/2, size:14, velocity:0 };
    pipes = [];
    frames = 0;
    gameRunning = true;
    gravity = 0.25;
    gameSpeed = 2;
    gameOverScreen.style.display = "none";
}

// ===== CONTROLS =====
function flap(){ bird.velocity = -6; }

document.addEventListener("keydown", e=>{
    if(e.code==="Space"||e.code==="ArrowUp") flap();
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

    // Pipes move
    pipes.forEach(p => p.x -= gameSpeed * deltaTime);

    // Spawn pipes
    if(frames % 120 === 0) addPipe();

    // Collision
    if(bird.y < 0 || bird.y + bird.size > canvas.height || checkPipeCollision()){
        gameOver();
    }
}

// ===== DRAW =====
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Bird
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(bird.x + bird.size/2, bird.y + bird.size/2, bird.size, 0, Math.PI*2);
    ctx.fill();

    // Pipes
    ctx.fillStyle = "#16a34a";
    pipes.forEach(p=>{
        ctx.fillRect(p.x,0,p.width,p.top);
        ctx.fillRect(p.x,canvas.height - p.bottom,p.width,p.bottom);
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
    const deltaTime = (timeStamp - lastTime)/16;
    lastTime = timeStamp;

    if(gameRunning){
        update(deltaTime);
        draw();
        frames += deltaTime;
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
;

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

