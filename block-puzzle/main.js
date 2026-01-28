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
  const emptyCells = [...grid.children].filter(c=>!c.classList.contains('filled'));
  if(emptyCells.length === 0) return;

  const cell = emptyCells[Math.floor(Math.random()*emptyCells.length)];
  cell.classList.add('filled');
  cell.textContent = "B";
}

for(let i=0;i<5;i++) createBlock();

// drag/drop logic
grid.addEventListener('click', e=>{
  const cell = e.target;
  if(!cell.classList.contains('filled')) return;

  cell.classList.remove('filled');
  cell.textContent = '';
  score += 10;
  scoreEl.textContent = score;
  messageEl.textContent = "✅ Block cleared!";
  createBlock();
});

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
