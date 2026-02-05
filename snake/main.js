const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const gameOverSound = document.getElementById("gameOverSound");

const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");

const box = 20;
const rows = canvas.width / box;

let intervalId = null;
let snake, direction, food, score;
let gameOver = false;

let firstRestart = true;
const restartLink = "https://otieu.com/4/10557461";

/* ================= INIT ================= */
function initGame(){
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  gameOver = false;
  gameOverScreen.style.display = "none";
}

initGame();

/* ================= CONTROLS ================= */
document.addEventListener("keydown", e => {
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
  }

  if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/* ===== TOUCH (PHONE) ===== */
let sx = 0, sy = 0;

canvas.addEventListener("touchstart", e => {
  sx = e.touches[0].clientX;
  sy = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - sx;
  let dy = e.changedTouches[0].clientY - sy;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if(dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if(dy > 0 && direction !== "UP") direction = "DOWN";
    else if(dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

/* ================= GAME LOOP ================= */
function spawnFood(){
  return {
    x: Math.floor(Math.random() * rows) * box,
    y: Math.floor(Math.random() * rows) * box
  };
}

function draw(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  for(let i=0;i<canvas.width;i+=box){
    ctx.beginPath();
    ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke();
  }

   // Apple 🍎
  ctx.beginPath();
  ctx.arc(food.x+box/2,food.y+box/2,box/2.4,0,Math.PI*2);
  ctx.fillStyle="#e11d48";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(food.x+box/2.6,food.y+box/2.6,4,0,Math.PI*2);
  ctx.fillStyle="rgba(255,255,255,.6)";
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle="#16a34a";
  ctx.ellipse(food.x+box/2+5,food.y+box/2-10,6,3,Math.PI/4,0,Math.PI*2);
  ctx.fill();

// Snake 🐍
  snake.forEach((p,i)=>{
    ctx.beginPath();
    ctx.arc(p.x+box/2,p.y+box/2,i===0?box/2.1:box/2.4,0,Math.PI*2);
    ctx.fillStyle =
  i===0 ? "#22c55e" :
  i===snake.length-1 ? "#14532d" :
  "#16a34a";
    ctx.fill();
    
    // Eyes 👀 (HEAD ONLY)
let head = snake[0];
ctx.fillStyle = "#000";

// left eye
ctx.beginPath();
ctx.arc(head.x + box*0.35, head.y + box*0.35, 3, 0, Math.PI*2);
ctx.fill();

// right eye
ctx.beginPath();
ctx.arc(head.x + box*0.65, head.y + box*0.35, 3, 0, Math.PI*2);
ctx.fill();

     // Tongue 👅
ctx.strokeStyle="#ef4444";
ctx.lineWidth=2;
ctx.beginPath();

if(direction==="UP"){
  ctx.moveTo(head.x+box/2, head.y);
  ctx.lineTo(head.x+box/2, head.y-6);
}
if(direction==="DOWN"){
  ctx.moveTo(head.x+box/2, head.y+box);
  ctx.lineTo(head.x+box/2, head.y+box+6);
}
if(direction==="LEFT"){
  ctx.moveTo(head.x, head.y+box/2);
  ctx.lineTo(head.x-6, head.y+box/2);
}
if(direction==="RIGHT"){
  ctx.moveTo(head.x+box, head.y+box/2);
  ctx.lineTo(head.x+box+6, head.y+box/2);
}
ctx.stroke();
  });

  let head = { ...snake[0] };

  if(direction==="UP") head.y -= box;
  if(direction==="DOWN") head.y += box;
  if(direction==="LEFT") head.x -= box;
  if(direction==="RIGHT") head.x += box;

  // collision
  if(
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    snake.some(p => p.x===head.x && p.y===head.y)
  ){
    gameOver = true;
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = "flex";
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score++;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

intervalId = setInterval(draw, 120);

/* ================= BUTTONS ================= */
restartBtn.onclick = () => {
  if(firstRestart){
    firstRestart = false;
    window.open(restartLink, "_blank");
    return;
  }

  clearInterval(intervalId);   // 🔴 مهم
  initGame();
  intervalId = setInterval(draw, 120); // 🔴 مهم
};

gameOverScreen.addEventListener("click", () => {
  gameOverScreen.style.display = "none";
  // ما كنديرو reset لا والو
});

