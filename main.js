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
  maxMana: 30
}
// Définition de certains éléments de configuration calculés
config.unit = config.canvasW/100;  //unité de distance dépendant de la taille du canvas
config.boardS = config.canvasH;
config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
// endConfig -------------

// globalFunctions -----------
// Initialise les positions de toutes les pièces en début de partie
// 0 -> Pion
// 1 -> Tour
// 2 -> Fou
// 3 -> Reine
// 4 -> Cavalier
// 5 -> Roi
function initBoard() {
  var count = 0;
  var p1 = [ // joueur 1 -> Blanc
    [1, 4, 2, 3, 5, 2, 4, 1],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];

  var p2 = [ // joueur 2 -> Noir
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 4, 2, 3, 5, 2, 4, 1]
  ];

  for (var i = 0; i < p1.length; i++) {
    for (var j = 0; j < p1[i].length; j++) {
      switch (p1[i][j]) {
        case 0: joueur[0].piece[count] = new Pion(j, i, 0); break;
        case 1: joueur[0].piece[count] = new Tour(j, i, 0); break;
        case 2: joueur[0].piece[count] = new Fou(j, i, 0); break;
        case 3: joueur[0].piece[count] = new Reine(j, i, 0); break;
        case 4: joueur[0].piece[count] = new Cavalier(j, i, 0); break;
        case 5: joueur[0].piece[count] = new Roi(j, i, 0); break;
      }
      count++;
    }
  }

  count = 0;

  for (var i = 0; i < p2.length; i++) {
    for (var j = 0; j < p2[i].length; j++) {
      switch (p1[i][j]) {
        case 0: joueur[1].piece[count] = new Pion(j, config.nLig - i - 1, 1); break;
        case 1: joueur[1].piece[count] = new Tour(j, config.nLig - i - 1, 1); break;
        case 2: joueur[1].piece[count] = new Fou(j, config.nLig - i - 1, 1); break;
        case 3: joueur[1].piece[count] = new Reine(j, config.nLig - i - 1, 1); break;
        case 4: joueur[1].piece[count] = new Cavalier(j, config.nLig - i - 1, 1); break;
        case 5: joueur[1].piece[count] = new Roi(j, config.nLig - i - 1, 1); break;
      }
      count++;
    }
  }

}

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
    depl.push([x,y]);
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
      if ((i + j) % 2 == 0) { fill(20); } else { fill(255); }
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

function deltaVarSpeed(startVal,startTime,speed){
  var time = actTime - startTime
  var delta = (time * speed) + startVal
  return delta
}

// endGlobalFunctions -------------

// globalVars --------------
// variables globales
var pieceImg = { //objet contenant deux tableaux, "blanc" et "noir" : chacun contiendra les images des pièces de couleur correspodante
    blanc: [],
    noir: [] },
    hudIMG = [], //tableau contenant les images du HUD
    selectedPiece = 0, //pièce sélectionnée par le joueur
    playerTurn = 0, //ID (numérique) du joueur dont c'est le tour
    time, //le temps (relatif au 1/1/1970)
    d; //le futur objet date

var chessGUI = { hud: [], pieces: [], highlightCase: [] };  //objet fondamental, qui contient tous les éléments gérée par le HUD,
															//c'est à dire qui seront affichés et/ou qui réagiront au clic
// endGlobalVars --------------


// images ---------------
function preload() { //chargement des images
  hudIMG[0] = loadImage("img/end_turn.png");
  pieceImg.noir[0] = loadImage("img/pion_noir.png"); // pion noir
  pieceImg.noir[1] = loadImage("img/tour_noire.png"); // tour noire
  pieceImg.noir[2] = loadImage("img/fou_noir.png"); // fou noir
  pieceImg.noir[3] = loadImage("img/reine_noire.png") // reine noire
  pieceImg.noir[4] = loadImage("img/cavalier_noir.png") // cavalier noi
  pieceImg.noir[5] = loadImage("img/roi_noir.png") // roi noir
  pieceImg.blanc[0] = loadImage("img/pion_blanc.png"); // pion blanc
  pieceImg.blanc[1] = loadImage("img/tour_blanche.png"); // tour blanche
  pieceImg.blanc[2] = loadImage("img/fou_blanc.png"); // fou blanc
  pieceImg.blanc[3] = loadImage("img/reine_blanche.png"); // reine blanche
  pieceImg.blanc[4] = loadImage("img/cavalier_blanc.png"); // cavalier blanc
  pieceImg.blanc[5] = loadImage("img/roi_blanc.png"); // roi blanc
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
        for (var i = 0; i < this.piece.length; i++){
          this.piece[i].deplCD = false
        }
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
    this.deplCD = false;
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

	//ATTAQUE
	var atk = this.getAtkRange(board);
	var HLCase;

	if (joueur[playerTurn].mana >= config.mana.atk){
		color = [255,0,0,120];
		hoverColor = [255,100,100,120];
		callback = function(){ this.piece.attack(this.target) }
	} else {
		color = [190,0,0,50];
		hoverColor = [190,100,100,50];
		callback = function(){ prompt("Not enough mana") }
	}

	for (var i = 0; i < atk.length; i++) {
		if (typeof board[atk[i][0]][atk[i][1]] != "undefined"){
			if (board[atk[i][0]][atk[i][1]].player == 1 - this.player){
				HLCase = new HighlightCase(atk[i][0],atk[i][1],
				color,hoverColor,this,callback);
				HLCase.target = board[atk[i][0]][atk[i][1]];
			}
		}
	}


  //DÉPLACEMENTS
  if (this.deplCD == false){
  	if (joueur[playerTurn].mana >= config.mana.depl){
  		color = [0,0,255,120];
  		hoverColor = [100,100,255,120];
  		callback = function(){ this.piece.move(this.x,this.y); this.piece.deplCD = true }
  	} else {
  		color = [0,0,190,50]
  		hoverColor = [100,100,190,50]
  		callback = function(){ prompt("Not enough mana") }
  	}

    for (var i = 0; i < depl.length; i++) {
      new HighlightCase(depl[i][0],depl[i][1],
  	       color,hoverColor,this,callback);
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
  	var startLine = ((this.player == 0) ? 1 : config.nLig - 2);
  	var direction = ((this.player == 0) ? 1 : -1);
  	var mp = (this.y == startLine) ? this.mp : 1;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.x,this.y + ((i+1)*direction)) == false){break}
	  }

    return depl;
  }

  getAtkRange(board){
	var atk = [];
	var direction = ((this.player == 0) ? 1 : -1);
	var x,y;
	for (var i = -1; i < 2;i++){
		x = this.x + i;
		y = this.y + direction;
		if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
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
			if (addDepl(board,depl,this.x + i,this.y + 2) == false) continue;
		}
		for (var i = -1; i < 2; i += 2) {
			if (addDepl(board,depl,this.x + 2,this.y + i) == false) continue;
		}
    for (var i = -1; i < 2; i += 2) {
      if (addDepl(board,depl,this.x + i,this.y - 2) == false) continue;
    }
    for (var i = -1; i < 2; i += 2) {
      if (addDepl(board,depl,this.x - 2,this.y + i) == false) continue;
    }

    return depl;
	}

	getAtkRange(board){
    var atk = [];

    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.x + i,this.y + 2);
        if (atkRt == 2 || !atkRt) continue;
		}
		for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.x + 2,this.y + i);
        if (atkRt == 2 || !atkRt) continue;
		}
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.x + i,this.y - 2);
        if (atkRt == 2 || !atkRt) continue;
    }
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.x - 2,this.y + i);
        if (atkRt == 2 || !atkRt) continue;
    }

		return atk;
	}
}

class Roi extends Piece {
  constructor(x, y, player) {
    super(5, "Roi", 400, 30, x, y, player, 2);
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

    for (var i = 1; i < this.mp; i++) {
      var atkRt = addAtk(board,atk,this.x + i,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
      for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x + i,this.y - i);
        if (atkRt == 2 || !atkRt) break;
      }

      for (var i = 1; i < this.mp; i++) {
        var atkRt = addAtk(board,atk,this.x - i,this.y - i);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x - i,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = 1; i < this.mp; i++) {
      var atkRt = addAtk(board,atk,this.x,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
      for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }

      for (var i = 1; i < this.mp; i++) {
        var atkRt = addAtk(board,atk,this.x + i,this.y);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x + i,this.y);
        if (atkRt == 2 || !atkRt) break;
      }

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

class Text {
  constructor(x,y,text,font,size,color){
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
  }

  draw(){
    textFont(font)
    textSize(18)
    fill(color)
    text(this.text,this.x,this.y)
  }

}

/*class Animated {
  constructor(object,property,speed,max = NaN,reachMaxCallback = 0){
    this.object = object;
    this.prop = property;
    this.speed = speed;
    this.max = max;

    this.direction = Math.sign(speed);
    this.startVal = this.objet[this.property];
    this.lastTime = actTime;
    this.val;

  }

  update(){
    var val = this.objet[this.property] + deltaVarSpeed(this.startVal,this.last,this.speed);
    this.objet[this.property] = val

    if (this.max != NaN && typeof reachMaxCallback == "function"){
      if (val * this.sign > max * this.sign){
          reachMaxCallback(this.object,this.property)
      }
    }
    this.lastTime = time
  }

}

class FadeOut{
  constructor(object,rawColor,initAlpha,speed){
    this.obj = object
    this.rawColor = rawColor
    this.alpha = initAlpha
    this.speed = speed
    this.animation = new Animated(this,"alpha",-speed,0,
    function(obj){obj.destroy()})
  }

  update(){
    this.animation
  }

}*/

// endClass ----------

// setup -> mettre dans le draw
chessGUI.hud.push(new Button(config.canvasW - (config.unit * 40),10,config.unit * 10,config.unit * 4,0,0,function(){joueur[1 - playerTurn].startTurn()}))
chessGUI.hud.push({x: config.canvasW - (config.unit * 40), y: config.unit * 6, w: config.unit * 20, h: config.unit * 3,
draw: function(){
    fill(150,150,255);
    rect(this.x,this.y,this.w,this.h);
    fill(0,0,255);
    rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h)
}});

//temp
var joueur = [new Joueur("blanc", "Gilbert"), new Joueur("noir", "Patrick")];
initBoard();
var isPlaying = true;
playerTurn = 1;

// endSetup

// main functions
function setup() {
  noStroke();
  cursor("img/cursor.png");
  createCanvas(config.canvasW, config.canvasH);
  background(80); //drawBoard();

  textFont("Arial")
}

function draw() {
	
  background(80);

  d = new Date();
  actTime = d.getTime;

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
    for (var element in chessGUI){ // TROP DE IF LOL
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
