<!-- ===================== script.js (JS FILE) ===================== -->
<script>
const game = document.getElementById("game");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const themeBtn = document.getElementById("themeBtn");

let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let solution = [1, 2, 3, 4, 5, 6, 7, 8, 9];
solution.sort(() => Math.random() - 0.5);

function drawBoard() {
  game.innerHTML = "";

  board.forEach((num, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;

    if (num !== 0) {
      cell.textContent = num;
      cell.classList.add("prefilled");
    } else {
      cell.addEventListener("click", () => selectNumber(i, cell));
    }

    game.appendChild(cell);
  });
}

def selectNumber(i, cell) {
  let value = prompt("Enter a number 1-9:");
  if (!value || isNaN(value) || value < 1 || value > 9) return;

  if (value == solution[i]) {
    cell.textContent = value;
    cell.style.background = "#4caf50";
    board[i] = value;
  } else {
    cell.style.background = "#c0392b";
  }

  checkWin();
}

function checkWin() {
  if (board.every((n, i) => n === solution[i])) {
    message.textContent = "🎉 Perfect! You solved the puzzle!";
  }
}

restartBtn.onclick = () => {
  window.location.href = "https://direct-link.com"; // ← اختر رابطك هنا
};

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

drawBoard();
</script>
