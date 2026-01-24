const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const msg = document.getElementById("message");
const lbEl = document.getElementById("leaderboard");
const sound = document.getElementById("moveSound");

let board = JSON.parse(localStorage.getItem("board2048")) || Array(16).fill(0);
let score = Number(localStorage.getItem("score2048")) || 0;

scoreEl.textContent = score;

function saveState() {
  localStorage.setItem("board2048", JSON.stringify(board));
  localStorage.setItem("score2048", score);
}

function draw() {
  grid.innerHTML = "";
  board.forEach(v => {
    const d = document.createElement("div");
    d.className = "cell";
    if (v) {
      d.textContent = v;
      d.classList.add("cell-" + v);
    }
    grid.appendChild(d);
  });
}

function addNumber() {
  let empty = board.map((v,i)=>v===0?i:null).filter(v=>v!==null);
  if (empty.length) board[empty[Math.floor(Math.random()*empty.length)]] = Math.random()>0.9?4:2;
}

function slide(arr) {
  arr = arr.filter(v=>v);
  for (let i=0;i<arr.length-1;i++) {
    if (arr[i]===arr[i+1]) {
      arr[i]*=2;
      score+=arr[i];
      arr[i+1]=0;
    }
  }
  arr = arr.filter(v=>v);
  while (arr.length<4) arr.push(0);
  return arr;
}

function move(dir) {
  let old = board.toString();

  for (let i=0;i<4;i++) {
    let line=[];
    for (let j=0;j<4;j++) {
      let idx =
        dir==="left"  ? i*4+j :
        dir==="right" ? i*4+(3-j) :
        dir==="up"    ? j*4+i :
                        (3-j)*4+i;
      line.push(board[idx]);
    }
    line = slide(line);
    for (let j=0;j<4;j++) {
      let idx =
        dir==="left"  ? i*4+j :
        dir==="right" ? i*4+(3-j) :
        dir==="up"    ? j*4+i :
                        (3-j)*4+i;
      board[idx]=line[j];
    }
  }

  if (old!==board.toString()) {
    addNumber();
    sound.play();
    saveState();
    scoreEl.textContent=score;
    draw();
  }
}

document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft")move("left");
  if(e.key==="ArrowRight")move("right");
  if(e.key==="ArrowUp")move("up");
  if(e.key==="ArrowDown")move("down");
});

/* Swipe */
let x1,y1;
grid.addEventListener("touchstart",e=>{
  x1=e.touches[0].clientX;
  y1=e.touches[0].clientY;
});
grid.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX-x1;
  let dy=e.changedTouches[0].clientY-y1;
  if(Math.abs(dx)>Math.abs(dy)){
    dx>30?move("right"):dx<-30&&move("left");
  }else{
    dy>30?move("down"):dy<-30&&move("up");
  }
});

/* Leaderboard */
function updateLeaderboard() {
  let lb = JSON.parse(localStorage.getItem("lb2048")) || [];
  lb.push(score);
  lb = lb.sort((a,b)=>b-a).slice(0,5);
  localStorage.setItem("lb2048", JSON.stringify(lb));
  lbEl.innerHTML = lb.map(s=>`<li>${s}</li>`).join("");
}

function restartGame() {
  updateLeaderboard();
  board = Array(16).fill(0);
  score = 0;
  saveState();
  scoreEl.textContent = 0;
  msg.classList.add("hidden");
  addNumber(); addNumber();
  draw();
}

/* Dark */
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}

/* Fullscreen */
function enterFullscreen(){
  if(document.documentElement.requestFullscreen){
    document.documentElement.requestFullscreen();
  }
}

draw();
