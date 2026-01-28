const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");

let score = 0;
let draggedBlock = null;
let previewCells = [];

// create grid cells
for (let i = 0; i < 100; i++) {
  const cell = document.createElement("div");
  cell.dataset.index = i;
  cell.addEventListener("dragover", e => { e.preventDefault(); showPreview(cell); });
  cell.addEventListener("dragleave", clearPreview);
  cell.addEventListener("drop", placeBlock);
  grid.appendChild(cell);
}

// create blocks example
function createBlock(shape) {
  const block = document.createElement("div");
  block.className = "block";
  block.draggable = true;
  block.dataset.shape = shape;
  block.textContent = shape[0].toUpperCase();
  block.style.position = "absolute";  // important for mobile visibility
  block.style.top = "0px";
  block.style.left = `${Math.random()*200}px`;
  block.addEventListener("dragstart", () => { draggedBlock = block; });
  document.body.appendChild(block);
}

// example blocks
createBlock("single");
createBlock("double");
createBlock("triple");

function getCells(shape, index) {
  let cells = [];
  if (shape === "single") cells = [index];
  if (shape === "double" && index % 10 < 9) cells = [index,index+1];
  if (shape === "triple" && index % 10 < 8) cells = [index,index+1,index+2];
  return cells;
}

function showPreview(cell) {
  clearPreview();
  if (!draggedBlock) return;
  const index = Number(cell.dataset.index);
  const shape = draggedBlock.dataset.shape;
  const cells = getCells(shape, index);
  cells.forEach(i => grid.children[i]?.classList.add("preview"));
  previewCells = cells;
}

function clearPreview() {
  previewCells.forEach(i => grid.children[i]?.classList.remove("preview"));
  previewCells = [];
}

function placeBlock(e) {
  if (!draggedBlock) return;
  const index = Number(e.target.dataset.index);
  const shape = draggedBlock.dataset.shape;
  const cells = getCells(shape, index);

  cells.forEach(i => grid.children[i]?.classList.add("filled"));
  score += 10;
  scoreEl.textContent = score;
  messageEl.textContent = "✅ Nice move!";

  draggedBlock.remove();
  draggedBlock = null;
  clearPreview();
  checkLines();
}

function checkLines() {
  for (let r = 0; r < 10; r++) {
    let row = [];
    for (let c = 0; c < 10; c++) row.push(grid.children[r*10+c]);
    if (row.every(cell => cell.classList.contains("filled"))) {
      score += 100;
      scoreEl.textContent = score;
      row.forEach(cell => cell.classList.remove("filled"));
      messageEl.textContent = "🔥 Row cleared!";
    }
  }
}

function restartGame() { location.reload(); }
function toggleDarkMode() { document.body.classList.toggle("dark"); }
