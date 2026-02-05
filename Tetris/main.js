const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ROWS = 10;
const COLS = 10;
const SIZE = canvas.width / COLS;

let grid, current, score = 0;

const scoreEl = document.getElementById("score");
const sound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-click-1114.mp3");

const SHAPES = [
  [[1,1],[1,1]],
  [[1,1,1,1]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]],
  [[1,1,0],[0,1,1]]
];

function emptyGrid() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

function randomBlock() {
  return {
    x: 3,
    y: 0,
    shape: SHAPES[Math.floor(Math.random()*SHAPES.length)]
  };
}

function drawGrid() {
  for (let y=0;y<ROWS;y++) {
    for (let x=0;x<COLS;x++) {
      ctx.fillStyle = grid[y][x] ? "#4caf50" : "#bbb";
      ctx.fillRect(x*SIZE,y*SIZE,SIZE-1,SIZE-1);
    }
  }
}

function drawBlock() {
  ctx.fillStyle = "#2196f3";
  current.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        ctx.fillRect((current.x+x)*SIZE,(current.y+y)*SIZE,SIZE-1,SIZE-1);
      }
    });
  });
}

function collide() {
  return current.shape.some((row,y)=>
    row.some((v,x)=>{
      if(!v) return false;
      let ny=current.y+y;
      let nx=current.x+x;
      return ny>=ROWS || nx<0 || nx>=COLS || grid[ny][nx];
    })
  );
}

function merge() {
  current.shape.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v) grid[current.y+y][current.x+x]=1;
    });
  });
  sound.play();
}

function clearLines() {
  let cleared = 0;
  grid = grid.filter(row => {
    if(row.every(c=>c)){
      cleared++;
      return false;
    }
    return true;
  });
  while(grid.length<ROWS) grid.unshift(Array(COLS).fill(0));
  score += cleared*10;
  scoreEl.textContent = "Score: "+score;
}

function drop() {
  current.y++;
  if(collide()){
    current.y--;
    merge();
    clearLines();
    current = randomBlock();
    if(collide()) start();
  }
}

function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();
  drawBlock();
}

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") current.x--;
  if(e.key==="ArrowRight") current.x++;
  if(e.key==="ArrowDown") drop();
  if(collide()){
    if(e.key==="ArrowLeft") current.x++;
    if(e.key==="ArrowRight") current.x--;
  }
});

document.getElementById("left").onclick=()=>{current.x--; if(collide()) current.x++;};
document.getElementById("right").onclick=()=>{current.x++; if(collide()) current.x--;};
document.getElementById("down").onclick=drop;

document.getElementById("restart").onclick=start;
document.getElementById("darkMode").onclick=()=>document.body.classList.toggle("dark");

function start(){
  grid = emptyGrid();
  current = randomBlock();
  score = 0;
  scoreEl.textContent="Score: 0";
}

start();
setInterval(drop,700);
setInterval(update,100);
