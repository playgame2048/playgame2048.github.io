const grid = document.getElementById("grid");
const blocks = document.querySelectorAll(".block");

let draggedBlock = null;
let previewCells = [];

// create grid
for (let i = 0; i < 100; i++) {
  const cell = document.createElement("div");
  cell.dataset.index = i;

  cell.addEventListener("dragover", e => {
    e.preventDefault();
    showPreview(cell);
  });

  cell.addEventListener("dragleave", clearPreview);
  cell.addEventListener("drop", placeBlock);

  grid.appendChild(cell);
}

// drag
blocks.forEach(block => {
  block.addEventListener("dragstart", () => {
    draggedBlock = block;
  });
});

function getCells(shape, index) {
  let cells = [];
  if (shape === "single") cells = [index];
  if (shape === "double" && index % 10 < 9) cells = [index, index + 1];
  if (shape === "triple" && index % 10 < 8) cells = [index, index + 1, index + 2];
  return cells;
}

function showPreview(cell) {
  clearPreview();
  if (!draggedBlock) return;

  const shape = draggedBlock.dataset.shape;
  const index = Number(cell.dataset.index);
  const cells = getCells(shape, index);

  if (cells.length === 0) return;

  cells.forEach(i => {
    grid.children[i]?.classList.add("preview");
    previewCells.push(i);
  });
}

function clearPreview() {
  previewCells.forEach(i => {
    grid.children[i]?.classList.remove("preview");
  });
  previewCells = [];
}

function placeBlock(e) {
  if (!draggedBlock) return;

  const shape = draggedBlock.dataset.shape;
  const index = Number(e.target.dataset.index);
  const cells = getCells(shape, index);

  if (cells.length === 0) return;

  cells.forEach(i => {
    grid.children[i].classList.add("filled");
  });

  draggedBlock.remove();
  draggedBlock = null;
  clearPreview();
}

function restartGame() {
  location.reload();
}
