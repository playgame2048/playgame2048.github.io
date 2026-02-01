// ===== VARIABLES =====
const grid = document.getElementById("grid");
const numbersPanel = document.getElementById("numbersPanel");
const gameOverEl = document.getElementById("gameOver");
let selectedNumber = null;
let selectedCell = null;
let errors = 0;
let paused = false;
let time = 0;
let timerInterval;

// 🔹 monetag مرة وحدة
let monetagOnce = false;

// ===== TIMER =====
function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(!paused){
      time++;
      let m = String(Math.floor(time/60)).padStart(2,"0");
      let s = String(time%60).padStart(2,"0");
      document.getElementById("timer").textContent=`${m}:${s}`;
    }
  },1000);
}
startTimer();

// ===== PAUSE =====
document.getElementById("pauseBtn").onclick=()=>{
  paused = !paused;
  document.getElementById("pauseBtn").textContent = paused ? "▶️" : "⏸";
};

// ===== DARK MODE =====
document.getElementById("darkModeBtn").onclick=()=>{
  document.body.classList.toggle("dark");
};

// ===== RESTART (Monetag مرة وحدة) =====
document.getElementById("restartBtn").onclick=()=>{
  if(!monetagOnce){
    monetagOnce = true;
    window.open("https://MONETAG-LINK-DYALK","_blank");
  }else{
    location.reload();
  }
};

// ===== NUMBERS PANEL =====
function buildNumbersPanel(){
  numbersPanel.innerHTML="";
  for(let i=1;i<=9;i++){
    const btn=document.createElement("button");
    btn.className="num-btn";
    btn.textContent=i;
    btn.onclick=()=>{
      document.querySelectorAll(".num-btn").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedNumber=i;
      if(selectedCell) placeNumber(i);
    };
    numbersPanel.appendChild(btn);
  }
}
buildNumbersPanel();

// ===== SUDOKU PUZZLES =====
const puzzles = [
  [5,3,"","",7,"","","",""],
  [6,"","",1,9,5,"","",""],
  ["",9,8,"","","","","",6,""],
  [8,"","","",6,"","","",3],
  [4,"",8,"",3,"","","",1],
  [7,"","","",2,"","","",6],
  ["",6,"","","","","",2,8,""],
  ["","","",4,1,9,"","","5"],
  ["","","","","8","","",7,9]
];

// ===== GENERATE =====
function generatePuzzle(){
  grid.innerHTML="";
  errors=0;

  const puzzle = puzzles.map(row=>[...row]);

  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell=document.createElement("div");
      cell.className="cell";
      cell.dataset.row=r;
      cell.dataset.col=c;

      if(puzzle[r][c]!==""){
        cell.textContent=puzzle[r][c];
        cell.classList.add("fixed");
      }

      if(r%3===0) cell.classList.add("block-border-top");
      if(c%3===0) cell.classList.add("block-border-left");
      if(r===8) cell.classList.add("block-border-bottom");
      if(c===8) cell.classList.add("block-border-right");

      cell.onclick=()=>selectCell(cell);
      grid.appendChild(cell);
    }
  }
}
generatePuzzle();

// ===== SELECT CELL =====
function selectCell(cell){
  if(selectedCell) selectedCell.classList.remove("active");
  selectedCell=cell;
  if(!cell.classList.contains("fixed")) cell.classList.add("active");
}

// ===== PLACE NUMBER =====
function placeNumber(num){
  if(!selectedCell || selectedCell.classList.contains("fixed")) return;

  selectedCell.textContent=num;
  selectedCell.classList.remove("error");

  if(isConflict(selectedCell,num)){
    selectedCell.classList.add("error");
    errors++;
    if(errors>=4){
      paused=true;
      gameOverEl.style.display="flex";
    }
  }
}

// ===== CHECK CONFLICT =====
function isConflict(cell,value){
  const r=Number(cell.dataset.row);
  const c=Number(cell.dataset.col);
  let conflict=false;
  document.querySelectorAll(".cell").forEach(el=>{
    const rr=Number(el.dataset.row);
    const cc=Number(el.dataset.col);
    if(el===cell) return;
    if(rr===r||cc===c||sameBlock(r,c,rr,cc)){
      if(Number(el.textContent)===Number(value)) conflict=true;
    }
  });
  return conflict;
}
function sameBlock(r,c,rr,cc){
  return Math.floor(r/3)===Math.floor(rr/3)&&Math.floor(c/3)===Math.floor(cc/3);
}
