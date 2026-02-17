const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");
const supportBtn = document.getElementById("supportBtn");
const balloonsEl = document.getElementById("balloons");

let board = ["","","","","","","","",""];
let current = "X";
let gameOver = false;
let mode = null; // 'ai' أو 'pvp'

// النتائج المحفوظة
let score1 = localStorage.getItem("tic_score1") ? parseInt(localStorage.getItem("tic_score1")) : 0;
let score2 = localStorage.getItem("tic_score2") ? parseInt(localStorage.getItem("tic_score2")) : 0;

score1El.textContent = score1;
score2El.textContent = score2;

// رابط التابع (أول نقرة على Restart)
let firstRestart = true;
const affiliateLink = "https://otieu.com/4/10553939"; // <-- ضع رابطك هنا

// حالات الفوز
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ================= تحديد الوضع ================= */
function setMode(m) {
  mode = m;
  restart();
  statusEl.textContent = mode === "ai" ? "❌ You vs AI ⭕" : "👥 Player 1 (X) turn";
}

/* ================= إعادة تشغيل اللعبة ================= */
function restart() {
  board = ["","","","","","","","",""];
  current = "X";
  gameOver = false;
  drawBoard();
  balloonsEl.innerHTML = "";
}

/* ================= رسم اللوحة ================= */
function drawBoard() {
  boardEl.innerHTML = "";
  board.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = val;
    cell.onclick = () => play(idx);
    boardEl.appendChild(cell);
  });
}

/* ================= اللعب ================= */
function play(index) {
  if (board[index] !== "" || gameOver) return;

  board[index] = current;
  drawBoard();

  if (checkWin()) {
    gameOver = true;
    showWinner(current);
    celebrate();

    // تحديث النتائج
    if (current === "X") {
      score1++;
      localStorage.setItem("tic_score1", score1);
      score1El.textContent = score1;
    } else {
      score2++;
      localStorage.setItem("tic_score2", score2);
      score2El.textContent = score2;
    }
    return;
  }

  if (!board.includes("")) {
    gameOver = true;
    statusEl.textContent = "🤝 Draw!";
    return;
  }

  // تبديل الدور
  current = current === "X" ? "O" : "X";

  if (mode === "ai" && current === "O" && !gameOver) {
    setTimeout(aiMove, 400);
  } else if (mode === "pvp") {
    statusEl.textContent = current === "X" ? "👤 Player 1 (X) turn" : "👥 Player 2 (O) turn";
  }
}

/* ================= التحقق من الفوز ================= */
function checkWin() {
  return wins.some(combo => combo.every(i => board[i] === current));
}

/* ================= عرض الفائز ================= */
function showWinner(winner) {
  if (mode === "pvp") {
    statusEl.textContent = winner === "X" ? "🏆 Player 1 wins!" : "🏆 Player 2 wins!";
  } else {
    statusEl.textContent = winner === "X" ? "🎉 You win!" : "🤖 AI wins!";
  }
}

/* ================= حركة AI (عشوائية) ================= */
function aiMove() {
  if (gameOver) return;
  const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  if (empty.length === 0) return;
  const randomIndex = empty[Math.floor(Math.random() * empty.length)];
  play(randomIndex);
}

/* ================= احتفال بالبالونات ================= */
function celebrate() {
  for (let i = 0; i < 30; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    const colors = ["#ef4444", "#3b82f6", "#eab308", "#a855f7", "#ec4899"];
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.left = Math.random() * window.innerWidth + "px";
    balloon.style.bottom = "-50px";
    balloonsEl.appendChild(balloon);

    // تحريك البالونة
    const duration = 4000 + Math.random() * 2000;
    balloon.animate([
      { transform: "translateY(0px)", opacity: 0.9 },
      { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0.5 }
    ], {
      duration: duration,
      iterations: 1,
      easing: "linear"
    });

    setTimeout(() => balloon.remove(), duration);
  }
}

/* ================= الوضع الليلي ================= */
function toggleDark() {
  document.body.classList.toggle("dark");
}

darkBtn.onclick = toggleDark;

/* ================= زر Restart الذكي ================= */
restartBtn.onclick = () => {
  if (firstRestart) {
    firstRestart = false;
    window.open(affiliateLink, "_blank");
  } else {
    restart();
  }
};

/* ================= زر الدعم ================= */
supportBtn.onclick = () => {
  window.open("https://ko-fi.com/help_tommy", "_blank");
};

// بدء اللعبة
drawBoard();
