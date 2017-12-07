// debug
var debug = true;
// endDebug

// config
var config = {
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  nLig: 12,
  nCol: 8,
  nbGold: 100,
  mana: {depl: 3, atk: 5, newPiece: 3},
  maxMana: 12
}

config.unit = config.canvasW/100;
config.boardS = config.canvasH;
config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
// endConfig

// globalFunctions
function addDepl(board,depl,x,y){
  if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig && typeof board[x][y] == "undefined"){
    depl.push([x,y])
    } else { return false }
}

function addAtk(board,atk,x,y){
	if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
		if (typeof board[x][y] != "undefined"){
			atk.push([x,y]);
			return 2; // dans le board et une pièce
		}
		return 1; // dans le board mais pas de pièce
	}
	return 0; // hors du board
}

function getArrayID(array,element){
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){
			return i
		}
	}
}

Array.prototype.spliceItem = function(item){
	var array = this
	array.splice(getArrayID(array,item),1)
}

function kill(target,killer){
	joueur[target.player].piece.spliceItem(target)
	chessGUI.pieces.spliceItem(target)
}

function damage(target,source,dmg){
  target.hp = target.hp - dmg

  if (target.hp < 1){
    kill(target,source)
  }

}


function examineBoard() {
	var board = [];

	for (var i = 0; i < config.nCol; i++){
		board[i] = []
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i]
    board[piece.x][piece.y] = piece
  }

	return board;
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

// initBoard

// initBoard end

// images
function preload() {
  hudIMG[0] = loadImage("img/end_turn.png");

  pieceImg.noir[0] = loadImage("img/boneless.png"); // pion noir
  pieceImg.noir[1] = loadImage("img/tour.png"); // tour noire
  pieceImg.noir[2] = loadImage("img/fou.png"); // fou noir
  pieceImg.blanc[0] = pieceImg.noir[0]; // pion blanc
  pieceImg.blanc[1] = pieceImg.noir[1]; // tour blanche
  pieceImg.blanc[2] = pieceImg.noir[2]; // fou blanc
  pieceImg.blanc[3] = pieceImg.noir[0]; // reine blanche
  pieceImg.blanc[4] = pieceImg.noir[0]; // cavalier blanc
}
// endImages

// class
class Joueur {
  constructor(color, name) {
    this.color = color;
    this.gold = config.nbGold;
    this.mana = config.maxMana;
    this.piece = [];
  }
  
  startTurn(){
        var playerID = getArrayID(joueur,this)
        playerTurn = playerID ; 
        chessGUI.highlightCase = [];
        this.mana = config.maxMana;
  }
}

class Piece {
  constructor(img,name,atk,hp,x,y,player,mp = 0){
    this.img = img;
    this.name = name;
    this.atk = atk;
    this.baseHP = hp;
    this.hp = hp;
	this.mp = mp;
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
      this.viewRanges();
    }
  }

  viewRanges() {
    chessGUI.highlightCase = [];
    var board = examineBoard();
    var depl = this.getDepl(board);
    for (var i = 0; i < depl.length; i++) {
      new HighlightCase(depl[i][0],depl[i][1],
	        [0,0,255,90],[100,100,255,90], this,
	        function(){this.piece.move(this.x,this.y)});
    }
	var atk = this.getAtkRange(board);
	var HLCase;

	for (var i = 0; i < atk.length; i++) {
		if (typeof board[atk[i][0]][atk[i][1]] !="undefined"){
			if (board[atk[i][0]][atk[i][1]].player == 1 - this.player){
				HLCase = new HighlightCase(atk[i][0],atk[i][1],
				[255,0,0,90],[255,100,100,90], this,
				function(){this.piece.attack(this.target)});
				HLCase.target = board[atk[i][0]][atk[i][1]];
			}
		}
	}
  }


  attack(target){
    damage(target,this,this.atk)
    joueur[playerTurn].mana -= config.mana.atk
  }


  move(x,y) {
    this.x = x;
    this.y = y;
    joueur[playerTurn].mana -= config.mana.depl
  }

  //Fonctions à redéfinir dans chaque classe piece
  getDepl(board){
	return [];
  }

  getAtkRange(board){
	return [];
  }
}

class Pion extends Piece {
  constructor(x, y, player) {
    super(0, "Pion", 50, 120, x, y, player, 3);
  }

  getDepl(board) {
    var depl = [];
  	var startLine = ((this.player == joueur[0]) ? 1 : config.nLig - 2);
  	var direction = ((this.player == joueur[0]) ? 1 : - 1);
  	var mp = (this.y == startLine) ? this.mp : 1;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.x,this.y + ((i+1)*direction)) == false){break}
	  }

    return depl;
  }

  getAtkRange(board){
	var atk = [];
	var direction = ((this.player == joueur[0]) ? 1 : - 1);
	var x,y;
	for (var i = -1; i < 2;i++){
		x = this.x + i
		y = this.y + direction
		if (x + 1 > 0 || x < config.nCol || y + 1 > 0 || y < config.nLig){
			atk.push([x,y]);
		}
	}
	return atk;
  }

}

class Tour extends Piece {
  constructor(x, y, player) {
    super(1, "Tour", 20, 200, x, y, player, 5);
  }

  getDepl(board) {
    var depl = []; 
    for (var i = 1; i < this.mp + 1; i++) {
	  if (addDepl(board,depl,this.x,this.y + i) == false) break;
    } 
    for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.x,this.y + i) == false) break;
    }

    for (var i = 1; i < this.mp + 1; i++) {
      if (addDepl(board,depl,this.x + i,this.y) == false) break;
    }
	for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.x + i,this.y) == false) break;
    }

    return depl;
  }
  
  getAtkRange(board){
	var atk = []; 
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.x,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    } 
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.x + i,this.y);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x + i,this.y);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Fou extends Piece {
  constructor(x, y, player) {
    super(2, "Fou", 50, 70, x, y, player, 5);
  }

  getDepl(board) {
    var depl = [];
	
    for (var i = 1; i < this.mp; i++) {
      if (addDepl(board,depl,this.x + i,this.y + i) == false) { break }
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.x + i,this.y - i) == false) { break }
	}
	for (var i = 1; i < this.mp; i++) {
	  if (addDepl(board,depl,this.x - i,this.y - i) == false) { break }
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.x - i,this.y + i) == false) { break }
	}
	
	return depl;
  }
  
  getAtkRange(board){
	var atk = []; 
	
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.x + i,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    } 
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x + i,this.y - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.x - i,this.y - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x - i,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Reine extends Piece {
	constructor(x, y, player) {
		super(3, "Reine", 120, 400, x, y, player, 5);
	}
	
	getDepl(board) {
    var depl = [];
	
    for (var i = 1; i < this.mp; i++) {
      if (addDepl(board,depl,this.x + i,this.y + i) == false) break;
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.x + i,this.y - i) == false) break;
	}
	for (var i = 1; i < this.mp; i++) {
	  if (addDepl(board,depl,this.x - i,this.y - i) == false) break;
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.x - i,this.y + i) == false) break;
	}
	for (var i = 1; i < this.mp + 1; i++) {
	  if (addDepl(board,depl,this.x,this.y + i) == false) break;
    } 
    for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.x,this.y + i) == false) break;
    }

    for (var i = 1; i < this.mp + 1; i++) {
      if (addDepl(board,depl,this.x + i,this.y) == false) break;
    }
	for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.x + i,this.y) == false) break;
    }
	
	return depl;
  }
  
  getAtkRange(board){
	var atk = []; 
	
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.x + i,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    } 
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x + i,this.y - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.x - i,this.y - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x - i,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.x,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    } 
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x,this.y + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.x + i,this.y);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.x + i,this.y);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Cavalier extends Piece {
	constructor(x, y, player) {
		super(4, "Cavalier", 80, 50, x, y, player);
	}
	
	getDepl(board) {
		var depl = [];
		
		for (var i = -1; i < 2; i += 2) {
			if (addDepl(board,depl,this.x + i,this.y + 2) == false) break;
		}
		for (var i = -1; i < 2; i +=2) {
			if (addDepl(board,depl,this.x + 2,this.y + i) == false) break;
		}
	}
	
	getAtkRange(board){
		var atk = [0, 0];
		return atk;
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
      this.callback();
      chessGUI.highlightCase = [];
      selectedPiece = 0;
    }
  }
}
// endClass

// setup -> mettre dans le draw
chessGUI.hud.push(new Button(config.canvasW - (config.unit * 40),10,config.unit * 10,config.unit * 4,0,0,function(){joueur[1 - playerTurn].startTurn()}))
chessGUI.hud.push({x: config.canvasW - (config.unit * 40), y: config.unit * 6, w: config.unit * 20, h: config.unit * 3,
draw: function(){
    fill(100,100,255)
    rect(this.x,this.y,this.w,this.h)
    fill(0,0,255)
    rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h)
}})
var joueur = [new Joueur("blanc", "Gilbert"), new Joueur("noir", "Patrick")];
joueur[1].piece[0] = new Pion(3, config.nLig - 2, 1);
joueur[0].piece[0] = new Tour(5, 6, 0);
joueur[1].piece[1] = new Fou(2, 3, 1);
joueur[0].piece[1] = new Reine(7, 7, 0);
joueur[0].piece[2] = new Cavalier(0, 0, 0);
var isPlaying = true;
playerTurn = 1;
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
