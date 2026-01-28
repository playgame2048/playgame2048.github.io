const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");

let score = 0;
let draggedBlock = null;

// create 10x10 grid cells
for (let i=0;i<100;i++){
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index=i;
  grid.appendChild(cell);
}

// create initial blocks
function createBlock() {
  const block = document.createElement("div");
  block.className = "block";
  block.draggable = true;
  block.textContent = "B";
  block.style.top="0px";
  block.style.left=Math.random()*200+"px";

  block.addEventListener("dragstart", ()=>{ draggedBlock = block; });
  document.body.appendChild(block);
}

for(let i=0;i<5;i++) createBlock();

// drag/drop logic
grid.addEventListener("dragover", e=>e.preventDefault());
grid.addEventListener("drop", e=>{
  if(!draggedBlock) return;
  const rect = grid.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  // snap to grid 40px blocks
  x = Math.floor(x/40)*40;
  y = Math.floor(y/40)*40;

  draggedBlock.style.left = rect.left + x + "px";
  draggedBlock.style.top = rect.top + y + "px";

  score += 10;
  scoreEl.textContent = score;
  messageEl.textContent="✅ Nice move!";
  draggedBlock.remove();
  draggedBlock = null;

  checkRows();
});

function checkRows(){
  // optional: add row clear logic
}

function restartGame(){
  location.reload();
}

function toggleDarkMode(){
  document.body.classList.toggle("dark");
}
