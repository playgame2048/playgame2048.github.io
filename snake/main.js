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

  // apple 🍎
  ctx.fillStyle = "#e11d48";
  ctx.beginPath();
  ctx.arc(food.x+box/2, food.y+box/2, box/2.4, 0, Math.PI*2);
  ctx.fill();

  // snake
  snake.forEach((p,i)=>{
    ctx.fillStyle = i===0 ? "#22c55e" : "#16a34a";
    ctx.beginPath();
    ctx.arc(p.x+box/2, p.y+box/2, box/2.2, 0, Math.PI*2);
    ctx.fill();
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
