const board = document.getElementById(“board”);
let tiles = [];
let size = 4;

function init(){
  board.innerHTML = “”;
  tiles = [];

  for(let i=0;i<size*size;i++){
    tiles.push(0);
    const tile = document.createElement(“div”);
    tile.className = “tile”;
    tile.innerText = “”;
    board.appendChild(tile);
  }
  addTile();
  addTile();
  updateBoard();
}

function addTile(){
  let empty = [];
  tiles.forEach((v,i)=>{ if(v===0) empty.push(i); });
  if(empty.length===0) return;
  let index = empty[Math.floor(Math.random()*empty.length)];
  tiles[index] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard(){
  const children = board.children;
  tiles.forEach((v,i)=>{
    children[i].innerText = v === 0 ? “” : v;
    });
}

function slide(row){
  row = row.filter(v=>v!==0);
  for(let i=0;i<row.length-1;i++){
    if(row[i]===row[i+1]){
      row[i]*=2;
      row[i+1]=0;
    }
  }
  row = row.filter(v=>v!==0);
  while(row.length<4) row.push(0);
  return row;
}

function moveLeft(){
  for(let r=0;r<4;r++){
    let row = tiles.slice(r*4, r*4+4);
    row = slide(row);
    for(let c=0;c<4;c++) tiles[r*4+c]=row[c];
  }
}

function moveRight(){
  for(let r=0;r<4;r++){
    let row = tiles.slice(r*4, r*4+4).reverse();
    row = slide(row);
    row = row.reverse();
    for(let c=0;c<4;c++) tiles[r*4+c]=row[c];
  }
}

function moveUp(){
  for(let c=0;c<4;c++){
    let col = [tiles[c],tiles[c+4],tiles[c+8],tiles[c+12]];
    col = slide(col);
    for(let r=0;r<4;r++) tiles[r*4+c]=col[r];
  }
}

function moveDown(){
  for(let c=0;c<4;c++){
    let col = [tiles[c],tiles[c+4],tiles[c+8],tiles[c+12]].reverse();
    col = slide(col);
    col = col.reverse();
    for(let r=0;r<4;r++) tiles[r*4+c]=col[r];
  }
}

document.addEventListener(“keydown”, e=>{
  let old = tiles.slice();
  if(e.key===“ArrowLeft”) moveLeft();
  if(e.key===“ArrowRight”) moveRight();
  if(e.key===“ArrowUp”) moveUp();
  if(e.key===“ArrowDown”) moveDown();
  if(old.toString()!==tiles.toString()){
    addTile();
    updateBoard();
  }
});

init();
