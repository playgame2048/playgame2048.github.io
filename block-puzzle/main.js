const grid = document.getElementById("grid");

// create 10x10 grid
for (let i = 0; i < 100; i++) {
  const cell = document.createElement("div");
  grid.appendChild(cell);
}

function restartGame() {
  location.reload();
}
