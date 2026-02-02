const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 16;
let snake, direction, food, score, game;
let restartFirstTime = true;

const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

// 🔗 CHANGE THIS LINK
const RESTART_LINK = "https://your-link-here.com";

function init(){
  snake = [{x:10*box,y:10*box}];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  scoreEl.textContent = score;
}

function spawnFood(){
  return {
    x: Math.floor(Math.random()*19)*box,
    y: Math.floor(Math.random()*19)*box
  };
}

document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && direction!=="DOWN") direction="UP";
  if(e.key==="ArrowDown" && direction!=="UP") direction="DOWN";
  if(e.key==="ArrowLeft" && direction!=="RIGHT") direction="LEFT";
  if(e.key==="ArrowRight" && direction!=="LEFT") direction="RIGHT";
});

ctx.strokeStyle="rgba(255,255,255,0.05)";
for(let i=0;i<canvas.width;i+=box){
  ctx.beginPath();
  ctx.moveTo(i,0);
  ctx.lineTo(i,canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0,i);
  ctx.lineTo(canvas.width,i);
  ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  snake.forEach((s,i)=>{
    ctx.fillStyle = i===0 ? "#22c55e" : "#16a34a";
    ctx.beginPath();
ctx.arc(
  s.x + box/2,
  s.y + box/2,
  box/2.2,
  0,
  Math.PI * 2
);
ctx.fill();
  });

  ctx.beginPath();
ctx.arc(
  food.x + box/2,
  food.y + box/2,
  box/2.3,
  0,
  Math.PI*2
);
ctx.fillStyle = "#ef4444";
ctx.shadowColor = "#ef4444";
ctx.shadowBlur = 15;
ctx.fill();
ctx.shadowBlur = 0;

  let headX = snake[0].x;
  let headY = snake[0].y;

  if(direction==="UP") headY-=box;
  if(direction==="DOWN") headY+=box;
  if(direction==="LEFT") headX-=box;
  if(direction==="RIGHT") headX+=box;

  // Game Over
  if(
    headX<0 || headY<0 ||
    headX>=canvas.width || headY>=canvas.height ||
    snake.some((s,i)=>i>0 && s.x===headX && s.y===headY)
  ){
    clearInterval(game);
    alert("Game Over! Score: "+score);
    return;
  }

  if(headX===food.x && headY===food.y){
    score++;
    scoreEl.textContent = score;
    food = spawnFood();
  }else{
    snake.pop();
  }

  snake.unshift({x:headX,y:headY});
}

restartBtn.addEventListener("click",()=>{
  if(restartFirstTime){
    restartFirstTime=false;
    window.location.href = RESTART_LINK;
    return;
  }
  clearInterval(game);
  init();
  game = setInterval(draw,120);
});

darkModeBtn.addEventListener("click",()=>{
  document.body.classList.toggle("dark");
});

init();
game = setInterval(draw,120);
