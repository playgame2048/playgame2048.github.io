const boardEl=document.getElementById("board");
const statusEl=document.getElementById("status");
const score1El=document.getElementById("score1");
const score2El=document.getElementById("score2");
const restartBtn=document.getElementById("restartBtn");
const supportBtn=document.getElementById("supportBtn");
const balloonsEl=document.getElementById("balloons");

let board=["","","","","","","","",""];
let current="X";
let gameOver=false;
let mode=null;
let score1=localStorage.getItem("score1")?parseInt(localStorage.getItem("score1")):0;
let score2=localStorage.getItem("score2")?parseInt(localStorage.getItem("score2")):0;

score1El.textContent=score1;
score2El.textContent=score2;

const wins=[
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function setMode(m){
  mode=m;
  restart();
  statusEl.textContent = mode==="ai" ? "You (X) vs AI (O)" : "Person 1 (X) turn";
}

function restart(){
  board=["","","","","","","","",""];
  current="X";
  gameOver=false;
  draw();
  balloonsEl.innerHTML="";
}

function draw(){
  boardEl.innerHTML="";
  board.forEach((v,i)=>{
    const c=document.createElement("div");
    c.className="cell";
    c.textContent=v;
    c.onclick=()=>play(i);
    boardEl.appendChild(c);
  });
}

function play(i){
  if(board[i] || gameOver) return;
  board[i]=current;
  if(checkWin()){
    gameOver=true;
    celebrate();
    if(current==="X"){
      score1++;
      localStorage.setItem("score1",score1);
      score1El.textContent=score1;
    }else{
      score2++;
      localStorage.setItem("score2",score2);
      score2El.textContent=score2;
    }

    statusEl.textContent = mode==="pvp"
      ? (current==="X"?"Person 1 Wins":"Person 2 Wins")
      : (current==="X"?"You Win":"AI Wins");

    draw();
    return;
  }

  if(!board.includes("")){
    statusEl.textContent="Draw!";
    gameOver=true;
    return;
  }

  current = current==="X"?"O":"X";
  draw();

  if(mode==="ai" && current==="O"){
    setTimeout(aiMove,300);
  }else if(mode==="pvp"){
    statusEl.textContent = current==="X"?"Person 1 turn":"Person 2 turn";
  }
}

function aiMove(){
  let empty=board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  let move=empty[Math.floor(Math.random()*empty.length)];
  play(move);
}

function checkWin(){
  return wins.some(w=>w.every(i=>board[i]===current));
}

function toggleDark(){
  document.body.classList.toggle("dark");
}

restartBtn.onclick=()=>{
  window.location.href="YOUR_DIRECT_LINK_HERE"; // حطي اللينك ديالك هنا
};

// simple support button placeholder
supportBtn.onclick=()=>{
  window.open("YOUR_SUPPORT_LINK_HERE","_blank");
};

// Balloons animation
function celebrate(){
  for(let i=0;i<30;i++){
    const b=document.createElement("div");
    b.className="balloon";
    b.style.left=Math.random()*window.innerWidth+"px";
    b.style.background=['red','blue','yellow','green','orange'][Math.floor(Math.random()*4)];
    balloonsEl.appendChild(b);
    setTimeout(()=>b.remove(),4000);
  }
}

draw();
