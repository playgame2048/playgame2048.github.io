const board = document.getElementById(“board”);

for(let i = 0; i < 16; i++){
  const tile = document.createElement(“div”);
  tile.className = “tile”;
  board.appendChild(tile);
}
