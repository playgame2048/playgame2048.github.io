const board = document.getElementById("sudoku-board");
const message = document.getElementById("message");
let firstRestart = true;

// Generate 3x3 Sudoku Board
function generateBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    const input = document.createElement("input");
    input.maxLength = 1;

    input.addEventListener("input", checkWin);

    cell.appendChild(input);
    board.appendChild(cell);
  }
}

function checkWin() {
  const values = [...document.querySelectorAll(".cell input")].map(i => i.value);

  if (values.every(v => v >= 1 && v <= 9)) {
    message.textContent = "🎉 You solved it!";
  }
}

document.getElementById("restartBtn").addEventListener("click", () => {
  if (firstRestart) {
    document.getElementById("directLink").click();
    firstRestart = false;
  }
  message.textContent = "";
  generateBoard();
});

// DARK MODE
document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Init
generateBoard();
