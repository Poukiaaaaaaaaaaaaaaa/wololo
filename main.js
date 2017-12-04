// debug
var debug = true;
// endDebug

// config
var config = {
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  nLig: 12,
  nCol: 8,
  nbGold: 100
}



config.unit = config.canvasW/100;
config.boardS = config.canvasH;
config.border = config.boardS / (10*((config.nLig>config.nCol) ? config.nLig : config.nCol));
config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
// endConfig

// globalFunctions

function kill(target,killer){
  
}

function damage(target,source,dmg){
  target.hp = target.hp - dmg

  if (target.hp < 1){
    //kill(target,source)
  }

}

function examineBoard() {
	board = []

	for (var i = 0; i < config.nCol; i++){
		board[i] = []
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i]
    board[piece.x][piece.y] = piece
  }

	return board
}


function convertPx(x) {
  return x*config.tileSize + (x+1)*config.border;
}

function drawBoard(dx = 0) {
  fill(80);
  rect(0,0,config.tileSize * config.nCol + (config.nCol + 1) * config.border,config.tileSize * config.nLig + (config.nLig + 1) * config.border);
  for (var i = 0; i < config.nCol; i++) {
    for (var j = 0; j < config.nLig; j++) {
      if ((i + j) % 2 == 0) { fill(0); } else { fill(255); }
      rect(i*config.tileSize + (i + 1)*config.border + dx,
           j*config.tileSize + (j + 1)*config.border,
           config.tileSize,
           config.tileSize,
           config.border);
    }
  }
}

function animate(x, type, coef) {
  if (type === "line") {
    return x += coef;
  }
}

function isHovered(x,y,w,h) {
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true;
      } else { return false; }
}

function isCaseHovered(x,y){
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border);
}

// endGlobalFunctions

// globalVars
var pieceImg = {
    blanc: [],
    noir: [] },
    hudIMG = [],
    selectedPiece = 0,
    playerTurn = 0;
const mana = 10;

var chessGUI = { hud: [], pieces: [], highlightCase: [] };
// endGlobalVars

// images
function preload() {
  hudIMG[0] = loadImage("img/end_turn.png");

  pieceImg.noir[0] = loadImage("img/boneless.png");
  pieceImg.noir[1] = loadImage("img/tour.png");
  pieceImg.blanc[1] = pieceImg.noir[1];
}
// endImages

// class
class Joueur {
  constructor(color, name) {
    this.color = color;
    this.gold = config.nbGold;
    this.mana = config.mana;
    this.piece = [];
  }
}

class Piece {
  constructor(img,name,atk,hp,x,y,player){
    this.img = img;
    this.name = name;
    this.atk = atk;
    this.baseHP = hp;
    this.hp = hp;
    this.x = x;
    this.y = y;
    this.activeSpells = [];
    this.color = joueur[player].color;
    this.player = player;
    this.bgColor = { r: 150, g: 150, b: 240, a: 0 }
    chessGUI.pieces.push(this);
  }


  draw() {
    image(pieceImg[this.color][this.img],
          convertPx(this.x) + config.border, convertPx(this.y) + config.border,
          config.tileSize - 2*config.border, config.tileSize - 2*config.border);
    if (playerTurn == this.player && isCaseHovered(this.x,this.y)){
    fill(255,255,255,50);
    rect(convertPx(this.x),convertPx(this.y),
    config.tileSize, config.tileSize, config.border);
    }

    fill("red");
    rect(convertPx(this.x),convertPx(this.y) + config.tileSize * 0.8,
    config.tileSize,config.tileSize*0.2);
    fill("green");
    rect(convertPx(this.x),convertPx(this.y) + config.tileSize * 0.8,
    config.tileSize / this.baseHP * this.hp,config.tileSize*0.2)
  }


  onLeftClick() {
    if (isCaseHovered(this.x,this.y) && playerTurn == this.player && !(selectedPiece == this)) {
      selectedPiece = this;
      this.viewDepl();
    }
  }

  viewDepl() {
    chessGUI.highlightCase = [];
    board = examineBoard()
    var depl = this.getDepl(board);
    for (var i = 0; i < depl.length; i++) {
      new HighlightCase(depl[i][0],depl[i][1],
	        [0,0,255,90],[100,100,255,90], this,
	        function(x,y){this.piece.move(x,y)});
    }
  }

  attack(target){
    damage(target,this,this.atk)
  }

  move(x,y) {
	this.x = x
	this.y = y
  }
}

class Pion extends Piece {
  constructor(x, y, player) {
    super(0, "Pion", 50, 120, x, y, player);
  }

  getDepl(board) {
    var depl = [];
  	var startLine = ((this.player == joueur[0]) ? 1 : config.nLig - 2);
  	var direction = ((this.player == joueur[0]) ? 1 : - 1);
  	var mp = (this.y == startLine) ? 3 : 1;
  	for (var i = 0; i < mp; i++){
		    depl.push([this.x,this.y + ((i+1)*direction)]);
	  }

    return depl;
  }

}

class Tour extends Piece {
  constructor(x, y, player) {
    super(1, "Tour", 20, 200, x, y, player);
  }

  getDepl(board) {
    var depl = [];
    var mp = 5;
    for (var i = -mp; i < mp + 1; i++) {
      if (i && this.y + i < config.nLig) depl.push([this.x,this.y + i]);
    }
    for (var i = -mp; i < mp + 1; i++) {
      if (i && this.x + i < config.nCol) depl.push([this.x + i,this.y]);
    }

    return depl;
  }

}

class Fou extends Piece {
  constructor(x, y, player) {
    super(1, "Fou", 50, 70, x, y, player);
  }

  getDepl(board) {
    var depl = [];
    var mp = 5;
    for (var i = -mp; i < mp; i++) {
      if (i && this.y + i < config.nLig && this.x + i < config.nCol) {
          depl.push([this.x + i,this.y + i]);
      }
      if (i && this.y + i < config.nLig && this.x - i < config.nCol) {
            depl.push([this.x - i,this.y + i]);
      }
    }

    return depl;
  }
}

class Button {
  constructor(x,y,w,h,img,hovercallback,callback) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.hovercallback = hovercallback
    this.callback = callback
  }

  draw() {
    image(hudIMG[this.img],
          this.x, this.y,
          this.w, this.h);
          if (typeof this.hovercallback == "function" && isHovered(this.x,this.y,this.w,this.h)){
            this.hovercallback(this.x,this.y,this.w,this.h)
          }
  }

  onLeftClick() {
     if (typeof this.callback == "function" && isHovered(this.x,this.y,this.w,this.h)) {
       this.callback();
    }
  }
}

class HighlightCase {
  constructor(xc,yc,color,hovercolor,piece,callback) {
    this.x = xc;
    this.y = yc;
    this.color = color;
    this.hovercolor = hovercolor;
    this.callback = callback;
    this.piece = piece;

    chessGUI.highlightCase.push(this);
  }

  draw() {
    if (isCaseHovered(this.x,this.y))
    { fill(this.hovercolor); } else
    { fill(this.color); }
    rect(convertPx(this.x),convertPx(this.y),
    config.tileSize,config.tileSize,
    config.border);
  }

  onLeftClick() {
     if (isCaseHovered(this.x,this.y)) {
      this.callback(this.x,this.y);
      chessGUI.highlightCase = [];
      selectedPiece = 0;
    }
  }
}
// endClass

// setup -> mettre dans le draw
var joueur = [new Joueur("blanc", "Gilbert"), new Joueur("noir", "Patrick")];
joueur[1].piece[0] = new Pion(3, config.nLig - 2, 1);
joueur[0].piece[1] = new Tour(5, 6, 0);
joueur[1].piece[2] = new Fou(2, 3, 1)
var isPlaying = true;
playerTurn = 1
 chessGUI.hud.push(new Button(config.canvasW - (config.unit * 40),10,config.unit * 10,config.unit * 4,0,0,function(){playerTurn = 1-playerTurn}))
// endSetup

// main functions
function setup() {
  noStroke();
  cursor("img/cursor.png");
  createCanvas(config.canvasW, config.canvasH);
  background(80); //drawBoard();
}

function draw() {
  if (!isPlaying) {

  }

  if (isPlaying) {
	  drawBoard();
    for (var element in chessGUI) {
      if (chessGUI.hasOwnProperty(element)) {
        for (var i = 0; i < chessGUI[element].length; i++) {
          if (typeof chessGUI[element][i].draw === "function"){
            chessGUI[element][i].draw(); }
          }
        }
      }
    }

    if (debug) {
      fill(255);
      text(floor(frameRate()), 20, 20);
    }
  }

function mouseClicked(){
  if (mouseButton == LEFT){
    for (var element in chessGUI){
      if (chessGUI.hasOwnProperty(element)){
        for (var i = 0; i < chessGUI[element].length; i++){
          if (typeof chessGUI[element][i].onLeftClick === "function"){
            chessGUI[element][i].onLeftClick();
          }
        }
      }
    }
  }
}


// end of main functions
