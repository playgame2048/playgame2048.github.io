const grid=document.getElementById("grid");
const scoreEl=document.getElementById("score");
const messageEl=document.getElementById("message");
let score=0;

// create 10x10 cells
for(let i=0;i<100;i++){
  const cell=document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index=i;
  grid.appendChild(cell);
}

// generate random blocks
function createBlock(){
  const empty=[...grid.children].filter(c=>!c.classList.contains("filled"));
  if(empty.length===0) return;
  const cell=empty[Math.floor(Math.random()*empty.length)];
  cell.classList.add("filled");
  cell.textContent="B";
}

// start blocks
for(let i=0;i<5;i++) createBlock();

// click to clear
grid.addEventListener("click",e=>{
  const cell=e.target;
  if(!cell.classList.contains("filled")) return;
  cell.classList.remove("filled");
  cell.textContent="";
  score+=10;
  scoreEl.textContent=score;
  messageEl.textContent="✅ Block cleared!";
  createBlock();
  checkGameOver();
});

// dark mode
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}

// restart
function restartGame(){
  location.reload();
}

// game over
function checkGameOver(){
  const filled=[...grid.children].filter(c=>c.classList.contains("filled"));
  if(filled.length===0){
    messageEl.textContent="💀 Game Over! Refresh to play again";
  }
}
