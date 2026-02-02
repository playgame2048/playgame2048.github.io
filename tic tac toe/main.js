const boardEl=document.getElementById("board");
const statusEl=document.getElementById("status");

let board=["","","","","","","","",""];
let current="X";
let gameOver=false;
let mode=null;

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
    statusEl.textContent = mode==="pvp"
      ? (current==="X"?"Person 1 Wins":"Person 2 Wins")
      : (current==="X"?"You Win":"AI Wins");
    gameOver=true;
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

draw();
