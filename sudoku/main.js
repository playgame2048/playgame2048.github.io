const grid=document.getElementById("grid");
const numbersPanel=document.getElementById("numbersPanel");
const gameOverEl=document.getElementById("gameOver");

let selectedCell=null;
let errors=0;
let paused=false;
let time=0;
let monetagShown=false;

const puzzles=[
  [[5,3,"","",7,"","","",""],[6,"","",1,9,5,"","",""],["",9,8,"","","","","",6,""],[8,"","","",6,"","","",3],[4,"",8,"",3,"","","",1],[7,"","","",2,"","","",6],["",6,"","","","","",2,8,""],["","","",4,1,9,"","","5"],["","","","","8","","",7,9]],
  [["",2,"",6,"","","",9,""],["","","",1,9,"","","",""],["",9,8,"","","","","",6,""],[8,"","","",6,"","","",3],["","","",8,"",3,"","",""],[7,"","","",2,"","","",6],["",6,"","","","","",2,8,""],["","","",4,1,9,"","","5"],["","","","","8","","",7,9]],
  [["","","","","","","","",""],["","","",1,"","","","",""],["",9,"","","","","",6,""],["","","","","","","","",3],["","","",8,"",3,"","",""],[7,"","","","","","","",6],["",6,"","","","","",2,""],["","","",4,"","","","",""],["","","","","8","","","",""]]
];

function startTimer(){
  setInterval(()=>{
    if(!paused){
      time++;
      let m=String(Math.floor(time/60)).padStart(2,"0");
      let s=String(time%60).padStart(2,"0");
      timer.textContent=`${m}:${s}`;
    }
  },1000);
}
startTimer();

document.getElementById("pauseBtn").onclick=()=>{
  paused=!paused;
  pauseBtn.textContent=paused?"▶️":"⏸";
};

document.getElementById("darkModeBtn").onclick=()=>{
  document.body.classList.toggle("dark");
};

document.getElementById("restartBtn").onclick=()=>{
  if(!monetagShown){
    monetagShown=true;
    window.open("https://MONETAG-LINK", "_blank");
  }else{
    location.reload();
  }
};

function buildNumbers(){
  for(let i=1;i<=9;i++){
    let b=document.createElement("button");
    b.textContent=i;
    b.className="num-btn";
    b.onclick=()=>placeNumber(i);
    numbersPanel.appendChild(b);
  }
}
buildNumbers();

function generate(){
  const puzzle=puzzles[Math.floor(Math.random()*puzzles.length)];
  puzzle.forEach((row,r)=>{
    row.forEach((val,c)=>{
      let cell=document.createElement("div");
      cell.className="cell";
      cell.dataset.row=r;
      cell.dataset.col=c;
      if(val!==""){
        cell.textContent=val;
        cell.classList.add("fixed");
      }
      cell.onclick=()=>selectCell(cell);
      grid.appendChild(cell);
    });
  });
}
generate();

function selectCell(cell){
  if(selectedCell)selectedCell.classList.remove("active");
  if(cell.classList.contains("fixed"))return;
  selectedCell=cell;
  cell.classList.add("active");
}

function placeNumber(n){
  if(!selectedCell)return;
  selectedCell.textContent=n;
  if(checkConflict(selectedCell,n)){
    selectedCell.classList.add("error");
    errors++;
    if(errors>=4){
      paused=true;
      gameOverEl.style.display="flex";
    }
  }
}

function checkConflict(cell,val){
  let r=cell.dataset.row,c=cell.dataset.col;
  return [...document.querySelectorAll(".cell")].some(el=>{
    if(el===cell)return false;
    return (el.dataset.row===r||el.dataset.col===c)&&el.textContent==val;
  });
}

document.getElementById("goRestart").onclick=()=>location.reload();
