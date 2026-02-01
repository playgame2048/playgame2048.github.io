const grid=document.getElementById("grid");
const numbers=document.getElementById("numbers");
const noteBtn=document.getElementById("noteBtn");
const hintBtn=document.getElementById("hintBtn");
const hintsLeftEl=document.getElementById("hintsLeft");
const gameOver=document.getElementById("gameOver");

let selectedCell=null;
let notesMode=false;
let hintsLeft=3;
let time=0;
let paused=false;

const solution=[
[5,3,4,6,7,8,9,1,2],
[6,7,2,1,9,5,3,4,8],
[1,9,8,3,4,2,5,6,7],
[8,5,9,7,6,1,4,2,3],
[4,2,6,8,5,3,7,9,1],
[7,1,3,9,2,4,8,5,6],
[9,6,1,5,3,7,2,8,4],
[2,8,7,4,1,9,6,3,5],
[3,4,5,2,8,6,1,7,9]
];

const puzzle=[
[5,3,"","",7,"","","",""],
[6,"","",1,9,5,"","",""],
["",9,8,"","","","","",6,""],
[8,"","","",6,"","","",3],
[4,"",8,"",3,"","","",1],
[7,"","","",2,"","","",6],
["",6,"","","","","",2,8,""],
["","","",4,1,9,"","","5"],
["","","","","8","","",7,9]
];

function buildGrid(){
  grid.innerHTML="";
  puzzle.forEach((row,r)=>{
    row.forEach((val,c)=>{
      const cell=document.createElement("div");
      cell.className="cell";
      cell.dataset.r=r;
      cell.dataset.c=c;

      if(val!==""){
        cell.textContent=val;
        cell.classList.add("fixed");
      }

      cell.onclick=()=>{
        document.querySelectorAll(".cell").forEach(c=>c.classList.remove("active"));
        if(!cell.classList.contains("fixed")){
          selectedCell=cell;
          cell.classList.add("active");
        }
      };

      grid.appendChild(cell);
    });
  });
}
buildGrid();

numbers.querySelectorAll("button").forEach(btn=>{
  btn.onclick=()=>{
    if(!selectedCell) return;
    const r=selectedCell.dataset.r;
    const c=selectedCell.dataset.c;
    const num=Number(btn.dataset.num);

    if(notesMode){
      let notes=selectedCell.querySelector(".notes");
      if(!notes){
        notes=document.createElement("div");
        notes.className="notes";
        selectedCell.textContent="";
        selectedCell.appendChild(notes);
      }
      if(!notes.textContent.includes(num)){
        notes.textContent+=num;
      }
    }else{
      selectedCell.innerHTML=num;
      if(num!==solution[r][c]){
        gameOver.style.display="flex";
        paused=true;
      }
    }
  };
});

noteBtn.onclick=()=>{
  notesMode=!notesMode;
  noteBtn.style.opacity=notesMode?0.6:1;
};

hintBtn.onclick=()=>{
  if(hintsLeft<=0 || !selectedCell) return;
  const r=selectedCell.dataset.r;
  const c=selectedCell.dataset.c;
  selectedCell.textContent=solution[r][c];
  hintsLeft--;
  hintsLeftEl.textContent=hintsLeft;
};

setInterval(()=>{
  if(!paused){
    time++;
    const m=String(Math.floor(time/60)).padStart(2,"0");
    const s=String(time%60).padStart(2,"0");
    document.getElementById("time").textContent=`${m}:${s}`;
  }
},1000);
