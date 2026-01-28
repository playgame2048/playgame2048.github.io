const grid = document.getElementById("grid");
const blocks = document.querySelectorAll(".block");

let draggedBlock = null;

// create grid
for (let i = 0; i < 100; i++) {
  const cell = document.createElement("div");
  cell.dataset.index = i;

  cell.addEventListener("dragover", e => e.preventDefault());
  cell.addEventListener("drop", dropBlock);

  grid.appendChild(cell);
}

// drag events
blocks.forEach(block => {
  block.addEventListener("dragstart", () => {
    draggedBlock = block;
  });
});

function dropBlock(e) {
  if (!draggedBlock) return;

  const shape = draggedBlock.dataset.shape;
  const index = Number(e.target.dataset.index);

  if (shape === "single") {
    e.target.style.background = "#4caf50";
  }

  if (shape === "double" && index % 10 < 9) {
    e.target.style.background = "#4caf50";
    grid.children[index + 1].style.background = "#4caf50";
  }

  if (shape === "triple" && index % 10 < 8) {
    e.target.style.background = "#4caf50";
    grid.children[index + 1].style.background = "#4caf50";
    grid.children[index + 2].style.background = "#4caf50";
  }

  draggedBlock.remove();
  draggedBlock = null;
}

function restartGame() {
  location.reload();
}
