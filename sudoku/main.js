let seconds = 0;
setInterval(() => {
  seconds++;
  let m = String(Math.floor(seconds / 60)).padStart(2, '0');
  let s = String(seconds % 60).padStart(2, '0');
  document.getElementById("timer").textContent = `⏳ ${m}:${s}`;
}, 1000);

// Simple 3x3 Sudoku board (static example)
const puzzle = [
  [5, 3, "", "", 7, "", "", "", ""],
  [6, "", "", 1, 9, 5, "", "", ""],
  ["", 9, 8, "", "", "", "", 6, ""],

  [8, "", "", "", 6, "", "", "", 3],
  [4, "", "", 8, "", 3, "", "", 1],
  [7, "", "", "", 2, "", "", "", 6],

  ["", 6, "", "", "", "", 2, 8, ""],
  ["", "", "", 4, 1, 9, "", "", 5],
  ["", "", "", "", 8, "", "", 7, 9]
];

let selectedCell = null;

// BUILD GRID
function generateGrid() {
  const grid = document.getElementById("sudokuGrid");
  grid.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (puzzle[r][c] !== "") {
        cell.textContent = puzzle[r][c];
        cell.classList.add("fixed");
      }

      cell.addEventListener("click", () => selectCell(cell));
      grid.appendChild(cell);
    }
  }
}

generateGrid();

// CELL SELECTION + HIGHLIGHTING
function selectCell(cell) {
  clearHighlights();

  selectedCell = cell;
  cell.classList.add("active");

  highlightRelated(cell);
}

function clearHighlights() {
  document.querySelectorAll(".cell").forEach(c => {
    c.classList.remove("active", "related");
  });
}

function highlightRelated(cell) {
  let r = Number(cell.dataset.row);
  let c = Number(cell.dataset.col);

  document.querySelectorAll(".cell").forEach(el => {
    let rr = Number(el.dataset.row);
    let cc = Number(el.dataset.col);

    if (rr === r || cc === c || sameBlock(r, c, rr, cc)) {
      el.classList.add("related");
    }
  });
}

function isConflict(cell, value) {
  let r = Number(cell.dataset.row);
  let c = Number(cell.dataset.col);

  value = Number(value);

  let conflict = false;

  document.querySelectorAll(".cell").forEach(el => {
    let rr = Number(el.dataset.row);
    let cc = Number(el.dataset.col);

    if (el === cell) return; // ignore itself

    // Same row or same column or block
    if (rr === r || cc === c || sameBlock(r, c, rr, cc)) {
      if (Number(el.textContent) === value) {
        conflict = true;
      }
    }
  });

  return conflict;
}

function highlightErrorCells(cell, value) {
  clearAllErrorHighlights();

  let r = Number(cell.dataset.row);
  let c = Number(cell.dataset.col);
  value = Number(value);

  document.querySelectorAll(".cell").forEach(el => {
    let rr = Number(el.dataset.row);
    let cc = Number(el.dataset.col);

    if (el === cell) return;

    if (rr === r || cc === c || sameBlock(r, c, rr, cc)) {
      if (Number(el.textContent) === value) {
        el.classList.add("error");
        cell.classList.add("error");
      }
    }
  });
}

function clearAllErrorHighlights() {
  document.querySelectorAll(".cell").forEach(el => el.classList.remove("error"));
}

function sameBlock(r, c, rr, cc) {
  return Math.floor(r/3) === Math.floor(rr/3) &&
         Math.floor(c/3) === Math.floor(cc/3);
}

// NUMBER PAD INPUT + ERROR CHECK
document.querySelectorAll(".num").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!selectedCell) return;
    if (selectedCell.classList.contains("fixed")) return;

    const value = btn.textContent;
    selectedCell.textContent = value;

    clearAllErrorHighlights(); // remove old errors

    if (isConflict(selectedCell, value)) {
      highlightErrorCells(selectedCell, value);
    }
  });
});

// DARK MODE
document.getElementById("darkModeBtn").onclick = () => {
  document.body.classList.toggle("dark");
};

// RESTART BUTTON
document.getElementById("restartBtn").onclick = () => {
  window.location.href = "https://otieu.com/4/10544878";
};
