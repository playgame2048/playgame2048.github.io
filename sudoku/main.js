let selectedCell = null;

const grid = document.getElementById("sudoku-grid");

// SIMPLE PUZZLE (you can replace later with generator)
const puzzle = [
    "530070000",
    "600195000",
    "098000060",
    "800060003",
    "400803001",
    "700020006",
    "060000280",
    "000419005",
    "000080079",
];

function loadGrid() {
    grid.innerHTML = "";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            const val = puzzle[r][c];
            if (val !== "0") {
                cell.textContent = val;
                cell.classList.add("fixed");
            }

            cell.onclick = () => selectCell(cell);
            grid.appendChild(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) selectedCell.classList.remove("selected");
    selectedCell = cell;
    selectedCell.classList.add("selected");
}

// NUMBER PAD
const nums = document.querySelectorAll(".num");
nums.forEach(n => {
    n.onclick = () => {
        if (!selectedCell || selectedCell.classList.contains("fixed")) return;
        if (n.classList.contains("erase")) selectedCell.textContent = "";
        else selectedCell.textContent = n.textContent;
        checkWin();
    };
});

// CHECK WIN
function checkWin() {
    const cells = document.querySelectorAll(".cell");
    for (let c of cells) {
        if (c.textContent === "") return;
    }
    document.getElementById("message").textContent = "🎉 You Completed the Puzzle!";
}

// DARK MODE
const darkBtn = document.getElementById("darkModeBtn");
darkBtn.onclick = () => {
    document.body.classList.toggle("dark");
};

// RESTART
const restartBtn = document.getElementById("restartBtn");
restartBtn.onclick = () => {
    window.location.href = "https://otieu.com/4/10544878"; // change USERNAME
};

loadGrid();
