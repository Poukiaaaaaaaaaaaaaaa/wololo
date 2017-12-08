// debug
var debug = true;
// endDebug

// config : objet contenant toutes les valeurs constantes qui définiront le fonctionnement du jeu
var config = {
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  nLig: 12,
  nCol: 8,
  nbGold: 100,
  mana: {depl: 3, atk: 5, newPiece: 3},
  maxMana: 12
}
// Définition de certains éléments de configuration calculés
config.unit = config.canvasW/100;  //unité de distance dépendant de la taille du canvas
config.boardS = config.canvasH;
config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
// endConfig -------------

// globalFunctions -----------
function callPassive(piece,passive,arg){
	var passiveFunction = piece[passive]
	if (!typeof passiveFunction == "undefined"){
		return passiveFunction(arg)
	}	
}

function addDepl(board,depl,x,y){
	//utile dans les fonctions piece.getDepl() uniquement : ajoute un déplacement
	//à la liste après avoir effectué tous les tests nécessaires (si la case est hors
	//de l'échiquier ou si une pièce si trouve déjà)
  if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig && typeof board[x][y] == "undefined"){
    depl.push([x,y])
    } else { return false } //renvoie false si l'ajout n'a pas pu être effectué
}

function addAtk(board,atk,x,y){
	//utile dans les fonctions piece.getAtkRange() uniquement : ajoute une case d'attaque
	//à la liste après avoir effectué tous les tests nécessaires (si la case est hors
	//de l'échiquier ou s'il n'y a aucune cible possible sur cette case)
	if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
		if (typeof board[x][y] != "undefined"){
			atk.push([x,y]);
			return 2; // dans le board et une pièce -> l'ajout a réussi
		}
		return 1; // dans le board mais pas de pièce
	}
	return 0; // hors du board
}

function getArrayID(array,element){
	//fonction générique renvoyant la clé d'un élément dans un tableau.
	//ne foncitonne correctement que si chaque élément est unique
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){
			return i
		}
	}
	return false
}

Array.prototype.spliceItem = function(item){
	//méthode appartenant au prototype des Arrays, ce qui signifie qu'elle sera présente pour tous les tableaux
	//elle permet de détruire un élément du tableau, en spécifiant uniquement l'élément en question
	//(sa clé est déterminée via getArrayID())
	var array = this
	array.splice(getArrayID(array,item),1)
}

function kill(target,killer){ //tue une pièce -> la supprime des deux tableaux dont elle fait partie : 
	joueur[target.player].piece.spliceItem(target) //le tableau des pièces du propriétaire
	chessGUI.pieces.spliceItem(target) //le tableau des éléments gérés par la GUI
}

function damage(target,source,dmg){ //inflig des dégâts à une pièce
  target.hp = target.hp - dmg

  if (target.hp < 1){
    kill(target,source) //si es PV de la pièce tombent en dessous de 0, la tue
  }

}

function examineBoard() {
	//permet d'analyser le contenu de l'échiquier facilement
	//via un tableau dont chaque entrée représente une case
	var board = []; //crée un tableau 

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes, 
		board[i] = [] 					   //on a donc un tableau à deux dimensions avec une entrée = une case
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i]		//récupère les coordonnées de chaque pièce et place une référence à cette pièce 
    board[piece.x][piece.y] = piece		//dans la case correspodante dans le tableau
  }

	return board;
	//renvoie le tableau
	//board[x][y] contient le contenu de la case (x,y)
}


function convertPx(x) { //convertit une coordonnée exprimée en cases en une coordonnée en pixels, pour l'affichage
  return x*config.tileSize + (x+1)*config.border;
}

function drawBoard(dx = 0) {
//dessine case par case l'échiquier
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

function isHovered(x,y,w,h) { //teste si le curseur de la souris se trouve au dessus de la zone spécifiée
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true;
      } else { return false; }
}

function isCaseHovered(x,y){ //teste si le curseur de la souris se trouve au dessus de la case spécifiée
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border);
}

// endGlobalFunctions -------------

// globalVars --------------
// variables globales
var pieceImg = { //objet contenant deux tableaux, "blanc" et "noir" : chacun contiendra les images des pièces de couleur correspodante
    blanc: [],
    noir: [] },
    hudIMG = [], //tableau contenant les images du HUD
    selectedPiece = 0, //pièce sélectionnée par le joueur
    playerTurn = 0; //ID (numérique) du joueur dont c'est le tour

var chessGUI = { hud: [], pieces: [], highlightCase: [] };  //objet fondamental, qui contient tous les éléments gérée par le HUD,
															//c'est à dire qui seront affichés et/ou qui réagiront au clic
// endGlobalVars --------------


// images ---------------
function preload() { //chargement des images
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
// endImages -------------

// class
class Joueur {
	//classe représentant un joueur (sa couleur, son nom,ses ressources, ses pièces)
  constructor(color, name) {
	//les paramètres passés au contruceur sont la couleur et le nom ; les autre propriétés dépendront de la partie (ressources, pièces)
    this.color = color;
    this.gold = config.nbGold;
    this.mana = config.maxMana;
    this.piece = [];
  }
  
  startTurn(){
	  //méthode permettant de démarrer le tour du joueur  : mise à jour de la variable
	  //playerTurn, restauration du mana, réinitialisation des cases colorées
        var playerID = getArrayID(joueur,this)
        playerTurn = playerID ; 
        chessGUI.highlightCase = [];
        this.mana = config.maxMana;
  }
  
}

class Piece {
	//classe représentant une pièce en général
	//les différentes pièces seront des classes héritées de celle-ci
  constructor(img,name,atk,hp,x,y,player,mp = 0){
	  //on passe au constructeur l'image, le nom, les stats, la position initiale, le propriétaire d'une pièce
	  //l'ID d'image, le nom, les stats seront déterminés de manière fixe lors de l'appel du superconstructeur
	  //dans le constructeur des classes héritées (= les pièces en elles mêmes)
	  
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
    chessGUI.pieces.push(this); //ajout de la pièce au tableau des éléments de la GUI
  }


  draw() { 
  //méthode affichant la pièce 
    image(pieceImg[this.color][this.img],
          convertPx(this.x) + config.border, convertPx(this.y) + config.border,
          config.tileSize - 2*config.border, config.tileSize - 2*config.border);
    if (playerTurn == this.player && isCaseHovered(this.x,this.y)){
		// si le curseur est sur la pièce et qu'on peut la sélectionner, affichage d'un indicateur
    fill(255,255,255,50);
    rect(convertPx(this.x),convertPx(this.y),
    config.tileSize, config.tileSize, config.border);
    }

	//affichage de la barre de vie
    fill("red");
    rect(convertPx(this.x),convertPx(this.y) + config.tileSize * 0.8,
    config.tileSize,config.tileSize*0.2);
    fill("green");
    rect(convertPx(this.x),convertPx(this.y) + config.tileSize * 0.8,
    config.tileSize / this.baseHP * this.hp,config.tileSize*0.2)
  }


  onLeftClick() {
	  //fonction appelée à chaque clic de la souris
    if (isCaseHovered(this.x,this.y) && playerTurn == this.player && !(selectedPiece == this)) {
		//si le clic a eu lieu sur cette pièce : 
      selectedPiece = this;
      this.viewRanges(); //on affiche les portées d'attaque et de déplacement
    }
  }

  viewRanges() {
	  //affiche les portées d'attaque et de déplacement
	  //(= cases où ils est possible de se déplacer + pièces attaquables)
    
	chessGUI.highlightCase = []; //réinitialisation des cases colorées
    var board = examineBoard();  //récupération du tableau représentant l'échiquier
    var depl = this.getDepl(board); //récupération de la liste des cases où il est possible de de déplacer
									//la méthode getDepl est définie dans chaque classe de pièce, le déplacement étant propre à celle-ci
	
	var color = 0
	var hoverColor = 0
	var callback
	//DÉPLACEMENTS
	if (joueur[playerTurn].mana >= config.mana.depl){ 
		color = [0,0,255,120]
		hoverColor = [100,100,255,120]
		callback = function(){this.piece.move(this.x,this.y)}
	}else{
		color = [0,0,190,50]
		hoverColor = [100,100,190,50]
		callback = function(){prompt("Not enough mana")}
	}	
		
    for (var i = 0; i < depl.length; i++) {
      new HighlightCase(depl[i][0],depl[i][1],
	        color,hoverColor,this,callback);
    }	
	
	//ATTAQUE
	var atk = this.getAtkRange(board);
	var HLCase;

	if (joueur[playerTurn].mana >= config.mana.atk){
		color = [255,0,0,120]
		hoverColor = [255,100,100,120]
		callback = function(){this.piece.attack(this.target)}
	}else{
		color = [190,0,0,50]
		hoverColor = [190,100,100,50]
		callback = function(){prompt("Not enough mana")}
	}
	
	for (var i = 0; i < atk.length; i++) {
		if (typeof board[atk[i][0]][atk[i][1]] !="undefined"){
			if (board[atk[i][0]][atk[i][1]].player == 1 - this.player){
				HLCase = new HighlightCase(atk[i][0],atk[i][1],
				color,hoverColor, this,callback);
				HLCase.target = board[atk[i][0]][atk[i][1]];
			}
		}
	}
  }


  attack(target){
    if (joueur[playerTurn].mana >= config.mana.atk){
		damage(target,this,this.atk)
		joueur[playerTurn].mana -= config.mana.atk
	}
  }


  move(x,y) {
	if (joueur[playerTurn].mana >= config.mana.depl){
		this.x = x;
		this.y = y;
		joueur[playerTurn].mana -= config.mana.depl
	}	
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

class animated {
	constructor(start,speed,max)
}

// endClass ----------

// setup -> mettre dans le draw
chessGUI.hud.push(new Button(config.canvasW - (config.unit * 40),10,config.unit * 10,config.unit * 4,0,0,function(){joueur[1 - playerTurn].startTurn()}))
chessGUI.hud.push({x: config.canvasW - (config.unit * 40), y: config.unit * 6, w: config.unit * 20, h: config.unit * 3,
draw: function(){
    fill(150,150,255)
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
