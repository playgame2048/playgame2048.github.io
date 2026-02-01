const grid = document.getElementById("grid");
const numbersPanel = document.getElementById("numbersPanel");
const gameOverEl = document.getElementById("gameOver");

let selectedCell = null;
let errors = 0;
let paused = false;
let time = 0;
let timerInterval;
let monetagOnce = false;

// TIMER
function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(!paused){
      time++;
      let m = String(Math.floor(time/60)).padStart(2,"0");
      let s = String(time%60).padStart(2,"0");
      timer.textContent = `${m}:${s}`;
    }
  },1000);
}
startTimer();

// BUTTONS
pauseBtn.onclick = ()=>{
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️" : "⏸";
};

darkModeBtn.onclick = ()=>{
  document.body.classList.toggle("dark");
};

restartBtn.onclick = ()=>{
  if(!monetagOnce){
    monetagOnce = true;
    window.open("https://MONETAG-LINK","_blank");
  }else{
    location.reload();
  }
};

// NUMBERS
for(let i=1;i<=9;i++){
  let btn=document.createElement("button");
  btn.className="num-btn";
  btn.textContent=i;
  btn.onclick=()=>placeNumber(i);
  numbersPanel.appendChild(btn);
}

// PUZZLES (نفس structure)
const puzzles = {
  easy:[[
    [5,3,"","",7,"","","",""],
    [6,"","",1,9,5,"","",""],
    ["",9,8,"","","","","",6,""],
    [8,"","","",6,"","","",3],
    [4,"",8,"",3,"","","",1],
    [7,"","","",2,"","","",6],
    ["",6,"","","","","",2,8,""],
    ["","","",4,1,9,"","","5"],
    ["","","","","8","","",7,9]
  ]],
  medium:[[
    ["",2,"",6,"","","",9,""],
    ["","","",1,9,"","","",""],
    ["",9,8,"","","","","",6,""],
    [8,"","","",6,"","","",3],
    ["","","",8,"",3,"","",""],
    [7,"","","",2,"","","",6],
    ["",6,"","","","","",2,8,""],
    ["","","",4,1,9,"","","5"],
    ["","","","","8","","",7,9]
  ]],
  hard:[[
    ["","","","","","","","",""],
    ["","","",1,"","","","",""],
    ["",9,"","","","","",6,""],
    ["","","","","","","","",3],
    ["","","",8,"",3,"","",""],
    [7,"","","","","","","",6],
    ["",6,"","","","","",2,""],
    ["","","",4,"","","","",""],
    ["","","","","8","","","",""]
  ]]
};

// RANDOM PUZZLE
function generatePuzzle(){
  grid.innerHTML="";
  errors=0;

  let all = [
    ...puzzles.easy,
    ...puzzles.medium,
    ...puzzles.hard
  ];

  const puzzle = all[Math.floor(Math.random()*all.length)]
    .map(r=>[...r]);

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

      cell.onclick=()=>selectCell(cell);
      grid.appendChild(cell);
    }
  }
}
generatePuzzle();

function selectCell(cell){
  if(selectedCell) selectedCell.classList.remove("active");
  if(cell.classList.contains("fixed")) return;
  selectedCell = cell;
  cell.classList.add("active");
}

function placeNumber(num){
  if(!selectedCell || selectedCell.classList.contains("fixed")) return;
  selectedCell.textContent = num;
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

function isConflict(cell,value){
  const r=cell.dataset.row;
  const c=cell.dataset.col;
  return [...document.querySelectorAll(".cell")].some(el=>{
    if(el===cell) return false;
    return (el.dataset.row===r || el.dataset.col===c) && el.textContent==value;
  });
}

goRestart.onclick=()=>location.reload();
