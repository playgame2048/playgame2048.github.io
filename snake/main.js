const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [{x:180,y:180}];
let direction = "RIGHT";
let food = spawnFood();
let score = 0;

let firstRestart = true;
const restartLink = "PUT_YOUR_LINK_HERE";

// Controls
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowUp" && direction!=="DOWN") direction="UP";
  if(e.key==="ArrowDown" && direction!=="UP") direction="DOWN";
  if(e.key==="ArrowLeft" && direction!=="RIGHT") direction="LEFT";
  if(e.key==="ArrowRight" && direction!=="LEFT") direction="RIGHT";
});

// Restart
document.getElementById("restartBtn").onclick=()=>{
  if(firstRestart){
    firstRestart=false;
    window.open(restartLink,"_blank");
  }
  resetGame();
};

// Dark mode
document.getElementById("darkBtn").onclick=()=>{
  document.body.classList.toggle("dark");
};

function resetGame(){
  snake=[{x:180,y:180}];
  direction="RIGHT";
  food=spawnFood();
  score=0;
}

function spawnFood(){
  return{
    x:Math.floor(Math.random()*18)*box,
    y:Math.floor(Math.random()*18)*box
  };
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Grid
  ctx.strokeStyle="rgba(255,255,255,.05)";
  for(let i=0;i<canvas.width;i+=box){
    ctx.beginPath();
    ctx.moveTo(i,0);ctx.lineTo(i,canvas.height);ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i);ctx.lineTo(canvas.width,i);ctx.stroke();
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
    ctx.fillStyle=i===0?"#22c55e":"#16a34a";
    ctx.fill();
  });

  let head={...snake[0]};
  if(direction==="UP") head.y-=box;
  if(direction==="DOWN") head.y+=box;
  if(direction==="LEFT") head.x-=box;
  if(direction==="RIGHT") head.x+=box;

  // Collision
  if(
    head.x<0||head.y<0||
    head.x>=canvas.width||
    head.y>=canvas.height||
    snake.some(p=>p.x===head.x&&p.y===head.y)
  ){
    resetGame();
    return;
  }

  snake.unshift(head);

  if(head.x===food.x&&head.y===food.y){
    score++;
    food=spawnFood();
  }else{
    snake.pop();
  }
}

setInterval(draw,120);
