const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const gameOverSound = document.getElementById("gameOverSound");

const restartBtn = document.getElementById("restartBtn");
const darkBtn = document.getElementById("darkBtn");

const box = 20;
const rows = canvas.width / box;

let intervalId = null;
let snake, direction, food, score;
let gameOver = false;

let firstRestart = true;
const restartLink = "https://otieu.com/4/10557461"; // <-- غيّره لرابطك

/* ================= INIT ================= */
function initGame(){
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = "RIGHT";
  food = spawnFood();
  score = 0;
  gameOver = false;
  gameOverScreen.style.display = "none";
}

initGame();

/* ================= CONTROLS ================= */
document.addEventListener("keydown", e => {
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
  }

  if(e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if(e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if(e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if(e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/* ===== TOUCH (PHONE) ===== */
let sx = 0, sy = 0;

canvas.addEventListener("touchstart", e => {
  sx = e.touches[0].clientX;
  sy = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - sx;
  let dy = e.changedTouches[0].clientY - sy;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if(dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if(dy > 0 && direction !== "UP") direction = "DOWN";
    else if(dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

/* ================= GAME LOOP ================= */
function spawnFood(){
  return {
    x: Math.floor(Math.random() * rows) * box,
    y: Math.floor(Math.random() * rows) * box
  };
}

function draw(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // خلفية متدرجة خفيفة
  const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0,"#1a2f3f");
  grad.addColorStop(1,"#0e1a26");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // شبكة خافتة
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 0.8;
  for(let i=0;i<=canvas.width;i+=box){
    ctx.beginPath();
    ctx.moveTo(i,0); ctx.lineTo(i,canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i); ctx.lineTo(canvas.width,i);
    ctx.stroke();
  }

  // ======== APPLE (3D, واقعية) ========
  const appleX = food.x + box/2;
  const appleY = food.y + box/2;

  // ظل التفاحة
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  // جسم التفاحة – تدرج كروي
  const appleGrad = ctx.createRadialGradient(
    appleX-4, appleY-4, 3,
    appleX+2, appleY+2, box/1.8
  );
  appleGrad.addColorStop(0,"#f87171");
  appleGrad.addColorStop(0.7,"#b91c1c");
  appleGrad.addColorStop(1,"#7f1d1d");

  ctx.beginPath();
  ctx.arc(appleX, appleY, box/2.2, 0, Math.PI*2);
  ctx.fillStyle = appleGrad;
  ctx.fill();

  // لمعة خفيفة
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(appleX-4, appleY-4, 5, 0, Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fill();

  // الساق (stem)
  ctx.beginPath();
  ctx.moveTo(appleX+2, appleY-12);
  ctx.lineTo(appleX+6, appleY-16);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#5b3e1d";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 1;
  ctx.stroke();

  // الورقة
  ctx.beginPath();
  ctx.ellipse(appleX+8, appleY-20, 5, 2, 0.3, 0, Math.PI*2);
  ctx.fillStyle = "#2e7d32";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.restore();

  // ======== SNAKE (3D) ========
  snake.forEach((p,i)=>{
    const segX = p.x + box/2;
    const segY = p.y + box/2;
    const radius = i===0 ? box/2.1 : box/2.4;
    const isHead = i===0;

    // ظل كل قطعة
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // تدرج لوني ثلاثي الأبعاد
    const gradient = ctx.createRadialGradient(
      segX-4, segY-4, 2,
      segX+2, segY+2, radius+2
    );
    if(isHead){
      gradient.addColorStop(0,"#86efac");
      gradient.addColorStop(0.5,"#22c55e");
      gradient.addColorStop(1,"#15803d");
    } else {
      gradient.addColorStop(0,"#4ade80");
      gradient.addColorStop(0.6,"#16a34a");
      gradient.addColorStop(1,"#14532d");
    }

    ctx.beginPath();
    ctx.arc(segX, segY, radius, 0, Math.PI*2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // لمعة خفيفة على العينين للرأس فقط
    if(isHead){
      // العين اليسرى
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(segX-5, segY-4, 3, 0, Math.PI*2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(segX-6, segY-5, 1.2, 0, Math.PI*2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      // العين اليمنى
      ctx.beginPath();
      ctx.arc(segX+5, segY-4, 3, 0, Math.PI*2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(segX+4, segY-5, 1.2, 0, Math.PI*2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      // لسان أحمر (باتجاه الحركة)
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      if(direction==="UP"){
        ctx.moveTo(segX, segY-radius-2);
        ctx.lineTo(segX-2, segY-radius-8);
        ctx.moveTo(segX, segY-radius-2);
        ctx.lineTo(segX+2, segY-radius-8);
      } else if(direction==="DOWN"){
        ctx.moveTo(segX, segY+radius+2);
        ctx.lineTo(segX-2, segY+radius+8);
        ctx.moveTo(segX, segY+radius+2);
        ctx.lineTo(segX+2, segY+radius+8);
      } else if(direction==="LEFT"){
        ctx.moveTo(segX-radius-2, segY);
        ctx.lineTo(segX-radius-8, segY-2);
        ctx.moveTo(segX-radius-2, segY);
        ctx.lineTo(segX-radius-8, segY+2);
      } else if(direction==="RIGHT"){
        ctx.moveTo(segX+radius+2, segY);
        ctx.lineTo(segX+radius+8, segY-2);
        ctx.moveTo(segX+radius+2, segY);
        ctx.lineTo(segX+radius+8, segY+2);
      }
      ctx.stroke();
    }
    ctx.restore();
  });

  // حركة الثعبان (المنطق)
  let head = { ...snake[0] };

  if(direction==="UP") head.y -= box;
  if(direction==="DOWN") head.y += box;
  if(direction==="LEFT") head.x -= box;
  if(direction==="RIGHT") head.x += box;

  // التحقق من الاصطدام
  if(
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height ||
    snake.some(p => p.x===head.x && p.y===head.y)
  ){
    gameOver = true;
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = "flex";
    if(gameOverSound) {
      gameOverSound.currentTime = 0;
      gameOverSound.play().catch(()=>{});
    }
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score++;
    food = spawnFood();
  } else {
    snake.pop();
  }
}

// ⏬ تم تقليل السرعة (زيادة وقت الفريم) من 120 إلى 150
intervalId = setInterval(draw, 150);

/* ================= BUTTONS ================= */
restartBtn.onclick = () => {
  if(firstRestart){
    firstRestart = false;
    window.open(restartLink, "_blank");
    return;
  }

  clearInterval(intervalId);
  initGame();
  intervalId = setInterval(draw, 150);
};

darkBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// إذا نقرت على خلفية Game Over لا تفعل شيئاً
gameOverScreen.addEventListener("click", (e) => {
  if(e.target === gameOverScreen) gameOverScreen.style.display = "none";
});
