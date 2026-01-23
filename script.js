const grid = document.getElementById(“grid”);
let score = 0;

function createGrid() {
  for (let i = 0; i < 16; i++) {
    const tile = document.createElement(“div”);
    tile.classList.add(“tile”);
    tile.textContent = “”;
    grid.appendChild(tile);
  }
}

createGrid();
