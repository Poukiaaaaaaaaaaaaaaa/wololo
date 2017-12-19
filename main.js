// CHESS++ ISN PROJECT
// Téo Tinarrage // Amaël Marquez
// TODO: terminer les animations, s'occuper du balancing, écran titre

// debug
var debug = false;
// endDebug

// config : objet contenant toutes les valeurs constantes qui d�finiront le fonctionnement du jeu
var config = {
  canvasW: window.innerWidth,
  canvasH: window.innerHeight,
  nLig: 10,
  nCol: 8,
  nbGold: 100,
  mana: { depl: 3, atk: 5, newPiece: 3 },
  maxMana: 10,
  gold: 100,
  hud: {},
  background: 0
}


{// Définition de certains éléments de configuration calculés
  config.boardS = config.canvasH > config.canvasW ? config.canvasW : config.canvasH;
  config.unit = config.boardS/100;  //unité de distance dépendant de la taille du plateau
  config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
  config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
  config.boardW = config.nCol * config.tileSize + config.border * (config.nCol+1);

  config.hud.button = {x : config.boardW, y: -config.unit * 4, w: config.unit * 40, h: config.unit * 16 }
  config.hud.manaGauge = {x: config.boardW + config.border, y: config.unit * 8, w: config.unit * 40, h: config.unit * 6}
  config.hud.playerTurnText = {x: config.boardW + config.border, y: config.unit * 15}
  config.hud.goldText = {x: config.boardW + config.border, y: config.unit * 18}
  config.hud.spells = {x: config.boardW + config.border, y: config.unit * 21, spellSize : config.unit * 8}
}
// endConfig -------------

// globalFunctions -----------
// Initialise les positions de toutes les pi�ces en d�but de partie
// 0 -> Pion
// 1 -> Tour
// 2 -> Fou
// 3 -> Reine
// 4 -> Cavalier
// 5 -> Roi
function initBoard() { // placement de toutes les pièces sur le plateau
  var c = 0; // compte le nombre de pièces placées (utilisé pour l'index de joueur[].piece[c])
  var layout = [
    [1, 4, 2, 3, 5, 2, 4, 1],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];

  for (var i = 0; i < layout.length; i++) {
    for (var j = 0; j < layout[i].length; j++) {
      switch (layout[i][j]) {
        case 0: joueur[0].piece[c] = new Pion(j, i, 0); break;
        case 1: joueur[0].piece[c] = new Tour(j, i, 0); break;
        case 2: joueur[0].piece[c] = new Fou(j, i, 0); break;
        case 3: joueur[0].piece[c] = new Reine(j, i, 0); break;
        case 4: joueur[0].piece[c] = new Cavalier(j, i, 0); break;
        case 5: joueur[0].piece[c] = new Roi(j, i, 0); break;
      }

      c++;
    }
  }

  c = 0;

  for (var i = 0; i < layout.length; i++) {
    for (var j = 0; j < layout[i].length; j++) {
      switch (layout[i][j]) {
        case 0: joueur[1].piece[c] = new Pion(j, config.nLig - i - 1, 1); break;
        case 1: joueur[1].piece[c] = new Tour(j, config.nLig - i - 1, 1); break;
        case 2: joueur[1].piece[c] = new Fou(j, config.nLig - i - 1, 1); break;
        case 3: joueur[1].piece[c] = new Reine(j, config.nLig - i - 1, 1); break;
        case 4: joueur[1].piece[c] = new Cavalier(j, config.nLig - i - 1, 1); break;
        case 5: joueur[1].piece[c] = new Roi(j, config.nLig - i - 1, 1); break;
      }

      c++;
    }
  }

}

function addDepl(board,depl,x,y){
	//utile dans les fonctions piece.getDepl() uniquement : ajoute un déplacement
	//à la liste après avoir effectué tous les tests nécessaires (si la case est hors
	//de l'échiquier ou si une pi�ce si trouve déjà
  if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig && typeof board[x][y] == "undefined"){
    depl.push([x,y]);
    } else { return false } //renvoie false si l'ajout n'a pas pu �tre effectu�
}

function addAtk(board,atk,x,y){
	//utile dans les fonctions piece.getAtkRange() uniquement : ajoute une case d'attaque
	//à la liste apr�s avoir effectu� tous les tests n�cessaires (si la case est hors
	//de l'�chiquier ou s'il n'y a aucune cible possible sur cette case)
	if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
		if (typeof board[x][y] != "undefined"){
			atk.push([x,y]);
			return 2; // dans le board et une pi�ce -> l'ajout a r�ussi
		}
		return 1; // dans le board mais pas de pi�ce
	}
	return 0; // hors du board
}

function getArrayID(array,element){
	//fonction générique renvoyant la clé d'un élément dans un tableau.
	//ne foncitonne correctement que si chaque élément est unique
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){
			return i;
		}
	}

	return false;
}

Array.prototype.spliceItem = function(item){
	//m�thode appartenant au prototype des Arrays, ce qui signifie qu'elle sera pr�sente pour tous les tableaux
	//elle permet de d�truire un �l�ment du tableau, en sp�cifiant uniquement l'�l�ment en question
	//(sa cl� est d�termin�e via getArrayID())
	var array = this
	array.splice(getArrayID(array,item),1)
}

function kill(target,killer){ //tue une pi�ce -> la supprime des deux tableaux dont elle fait partie :
  target.callPassive("onDying",killer)

  joueur[target.player].piece.spliceItem(target) //le tableau des pi�ces du propri�taire
	chessGUI.pieces.spliceItem(target) //le tableau des �l�ments g�r�s par la GUI

}

function damage(target,source,dmg){ //inflig des d�g�ts � une pi�ce
  target.hp = target.hp - dmg

  if (target.hp < 1){
    kill(target,source) //si es PV de la pi�ce tombent en dessous de 0, la tue
  }

}

function examineBoard() {
	//permet d'analyser le contenu de l'�chiquier facilement
	//via un tableau dont chaque entr�e repr�sente une case
	var board = []; //cr�e un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau à deux dimensions avec une entr�e = une case
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i]		//r�cup�re les coordonn�es de chaque pi�ce et place une r�f�rence � cette pi�ce
    board[piece.cx][piece.cy] = piece		//dans la case correspodante dans le tableau
  }

	return board;
	//renvoie le tableau
	//board[x][y] contient le contenu de la case (x,y)
}

function examineBoardHLC() { //même effet de examine board, mais remplit les cases avec les highlightCase au lieu des pièces
	
	var board = []; //cr�e un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau à deux dimensions avec une entr�e = une case
	}

  for (var i = 0; i < chessGUI.highlightCase.length;i++){
    var hlc = chessGUI.highlightCase[i]		//r�cup�re les coordonn�es de chaque pi�ce et place une r�f�rence � cette pi�ce
    board[hlc.x][hlc.y] = hlc		//dans la case correspodante dans le tableau
  }

	return board;	
}

function convertPx(x) { //convertit une coordonn�e exprim�e en cases en une coordonn�e en pixels, pour l'affichage
  return x*config.tileSize + (x+1)*config.border;
}

function drawBoard(dx = 0) {
 //dessine case par case l'�chiquier
  for (var i = 0; i < config.nCol; i++) {
    for (var j = 0; j < config.nLig; j++) {
      if ((i + j) % 2 == 0) { fill(50); } else { fill(255); }
      rect(i*config.tileSize + (i + 1)*config.border + dx,
           j*config.tileSize + (j + 1)*config.border,
           config.tileSize,
           config.tileSize,
           config.border);
    }
  }
}

function isHovered(x,y,w,h) { //teste si le curseur de la souris se trouve au dessus de la zone sp�cifi�e
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true;
      } else { return false; }
}

function isCaseHovered(x,y){ //teste si le curseur de la souris se trouve au dessus de la case sp�cifi�e
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border);
}

function deltaVarSpeed(time,speed){
  var delta = (time * speed);
  return delta;
}

function applyFadeOut(object,rawColor,initAlpha,speed){
	new FadeOut(object,rawColor,initAlpha,speed);
}

function move(object,speed,xTarget,yTarget){
  new Movement(object,speed,xTarget,yTarget)
}

function clearGUI(gui){
  if (typeof gui == "undefined"){
    for (var element in chessGUI){
      if (chessGUI.hasOwnProperty(element)){
        chessGUI[element] = []
      }
    }
  } else if (typeof gui == "string"){
    chessGUI[gui] = []
  }

}

function clearSelectedPiece(piece){
	if (selectedPiece) selectedPiece.deselect() ; 
	selectedPiece = piece
	chessGUI.pieceHUD = []
	clearGUI("highlightCase")
}

function caseInRangeZ(cx,cy,range){ //fonction donnant les pièces dans une portée donnée (Z: méthode Zone)
	var cases = []
	var dist
	var xStart = (cx - range >= 0) ? cx - range  : 0
	var xEnd = (cx + range < config.nCol) ? cx + range : config.nCol - 1
	var yStart = (cy - range >= 0) ? cy - range  : 0
	var yEnd = (cy + range < config.nLig) ? cy + range : config.nLig - 1
	
	for (var i = xStart; i <= xEnd; i++){
		for (var j = yStart ; j <= yEnd ; j++){
			dist =  Math.sqrt(Math.pow(i - cx,2)+pow(j - cy,2));
			if (Math.round(dist) <= range ) {
				cases.push([i,j])
			}				
		}
	}
	return cases

}

function selectCases(cases,callback){ //appelle un même callback(x,y) avec les coordonnées des cases du tableau cases 
	for (var i = 0 ; i < cases.length ; i++){
		callback(cases[i][0],cases[i][1])
	}
}

function startSelectionHLC(pieces, color){//démarre un processus de sélection de pièce, en utilisant les Highlight Cases
  var piece
  for (var i = 0; i < pieces.length; i++){
    piece = pieces[i] 
    new HighlightCase(piece.x,piece.y
             color,hoverColor,this,callback);
  }
} 

// endGlobalFunctions -------------

// globalVars --------------
// variables globales
var img = {},
    hudIMG = [], //tableau contenant les images du HUD
    selectedPiece = 0, //pièce sélectionnée par le joueur
    playerTurn = 0, //ID (numérique) du joueur dont c'est le tour
    actTime, //le temps (relatif au 1/1/1970)
    d, //le futur objet date
    joueur = [],
    guiElements = {},
    isPlaying = false,
    windows = [],
    winIMG = [],
    TG;

img.piece = { //objet contenant deux tableaux, "blanc" et "noir" : chacun contiendra les images des pi�ces de couleur correspodante
    blanc: [],
    noir: [] };
img.spell = {};
img.HUD = [];

var chessGUI = { pieces: [], highlightCase: [], hud: [], pieceHUD: [], windows: [] };  //objet fondamental, qui contient tous les éléments gérés par le HUD,
															//c'est à dire qui seront affichés et/ou qui réagiront au clic
// endGlobalVars --------------


// images ---------------
function preload() { //chargement des images
  config.background = loadImage("img/background.png");
  img.HUD[0] = loadImage("img/HUD/end_turn.png");
  img.piece.noir[0] = loadImage("img/Pièces/pion_noir.png"); // pion noir
  img.piece.noir[1] = loadImage("img/Pièces/tour_noire.png"); // tour noire
  img.piece.noir[2] = loadImage("img/Pièces/fou_noir.png"); // fou noir
  img.piece.noir[3] = loadImage("img/Pièces/reine_noire.png") // reine noire
  img.piece.noir[4] = loadImage("img/Pièces/cavalier_noir.png") // cavalier noirrrrrr
  img.piece.noir[5] = loadImage("img/Pièces/roi_noir.png") // roi noir
  img.piece.blanc[0] = loadImage("img/Pièces/pion_blanc.png"); // pion blanc
  img.piece.blanc[1] = loadImage("img/Pièces/tour_blanche.png"); // tour blanche
  img.piece.blanc[2] = loadImage("img/Pièces/fou_blanc.png"); // fou blanc
  img.piece.blanc[3] = loadImage("img/Pièces/reine_blanche.png"); // reine blanche
  img.piece.blanc[4] = loadImage("img/Pièces/cavalier_blanc.png"); // cavalier blanc
  img.piece.blanc[5] = loadImage("img/Pièces/roi_blanc.png"); // roi blanc

  img.spell.Pion = [];
  img.spell.Pion[0] = loadImage("img/Spells/Pion/0.png");
/*
   for (var i = 0; i < pieceClass.length; i++){
    img.spell[pieceClass[i]] = [];
    while (true) {
      loadImage("img/"+)
    }
  }*/

  winIMG[0] = loadImage("img/Window/window_left_arrow.png");
  winIMG[1] = loadImage("img/Window/window_right_arrow.png");
  winIMG[2] = loadImage("img/Window/window_right_arrow.png");
}
// endImages -------------

// class
class Joueur {
	//classe représentant un joueur (sa couleur, son nom,ses ressources, ses pièces)
  constructor(color, name) {
	//les paramètres passés au contruceur sont la couleur et le nom; les autre propriétés dépendront de la partie (ressources, pièces)
    this.color = color;
    this.mana = config.maxMana;
    this.piece = [];
    this.name = name;
    this.gold = config.gold;
  }

  startTurn() {
	  //méthode permettant de démarrer le tour du joueur: mise à jour de la variable
	  //playerTurn, restauration du mana, réinitialisation des cases color�es
        var playerID = getArrayID(joueur,this);
        playerTurn = playerID;
        chessGUI.highlightCase = [];
        this.mana = config.maxMana;
        for (var i = 0; i < this.piece.length; i++) {
          this.piece[i].deplCD = false;
        }
    guiElements.playerTurnText.text = this.name + " is playing"
		selectedPiece = 0;
  }


}

class Piece {
	//classe repr�sentant une pi�ce en g�n�ral
	//les diff�rentes pi�ces seront des classes h�rit�es de celle-ci
  constructor(img,name,atk,hp,cx,cy,player,mp,spell = []) {
	  //on passe au constructeur l'image, le nom, les stats, la position initiale, le propri�taire d'une pi�ce
	  //l'ID d'image, le nom, les stats seront d�termin�s de mani�re fixe lors de l'appel du superconstructeur
	  //dans le constructeur des classes h�rit�es (= les pi�ces en elles m�mes)
    this.img = img;
    this.name = name;
    this.atk = atk;
    this.baseHP = hp;
    this.hp = hp;
	  this.mp = mp;
    this.cx = cx;
    this.cy = cy;
    this.activeSpells = [];
    this.color = joueur[player].color;
    this.player = player;
    this.deplCD = false;
	this.spell = spell
    chessGUI.pieces.push(this); //ajout de la pièce au tableau des éléments de la GUI
  }


  draw() {
  //m�thode affichant la pi�ce
    if (!(this.movement)) {this.x = convertPx(this.cx) ; this.y = convertPx(this.cy)}
      image(img.piece[this.color][this.img],
            this.x + config.border, this.y + config.border,
            config.tileSize - 2*config.border, config.tileSize - 2*config.border);
      if (playerTurn == this.player && isCaseHovered(this.cx,this.cy)){
    		// si le curseur est sur la pi�ce et qu'on peut la s�lectionner, affichage d'un indicateur
        fill(255,255,255,50);
        rect(convertPx(this.cx),convertPx(this.cy),
        config.tileSize, config.tileSize, config.border);
    }

	//affichage de la barre de vie
    fill("red");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize,config.tileSize*0.2,
    0,0,config.border,config.border);
    fill("green");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize / this.baseHP * this.hp,config.tileSize * 0.2,
    0,0,config.border,config.border);
  }

  onLeftClick() {
	  //fonction appelée à chaque clic de la souris
    if (isCaseHovered(this.cx,this.cy) && playerTurn == this.player) {
		//si le clic a eu lieu sur cette pièce :
      if (selectedPiece == this) {
        clearSelectedPiece(); return;
      } else { this.select() }
    }
  }

  select(){
    clearSelectedPiece(this)
    this.viewRanges(); //on affiche les portées d'attaque et de déplacement

    for (var i = 0; i < this.spell.length; i++){
      new SpellIcon(config.hud.spells.x + i * (config.hud.spells.spellSize * 1.1),config.hud.spells.y,config.hud.spells.spellSize,config.hud.spells.spellSize,this.spell[i])
    }
  }
  
  deselect(){
	
  }

  viewRanges() {
	  //affiche les port�es d'attaque et de d�placement
	  //(= cases o� ils est possible de se d�placer + pi�ces attaquables)
    var board = examineBoard();  //r�cup�ration du tableau repr�sentant l'�chiquier
    var depl = this.getDepl(board); //r�cup�ration de la liste des cases o� il est possible de de d�placer
									//la m�thode getDepl est d�finie dans chaque classe de pi�ce, le d�placement �tant propre � celle-ci

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
  		callback = function(){ this.piece.noManaError(convertPx(this.cx) + config.tileSize / 2,convertPx(this.cy) + config.tileSize / 2)}
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


    //D�PLACEMENTS
    if (this.deplCD == false){
    	if (joueur[playerTurn].mana >= config.mana.depl){
    		color = [0,0,255,120];
    		hoverColor = [100,100,255,120];
    		callback = function(){ this.piece.move(this.x,this.y); this.piece.deplCD = true }
    	} else {
    		color = [0,0,190,50]
    		hoverColor = [100,100,190,50]
    		callback = function(){this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) }
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


  move(cx,cy) {
  	if (joueur[playerTurn].mana >= config.mana.depl){
  		this.cx = cx;
  		this.cy = cy;
  		joueur[playerTurn].mana -= config.mana.depl;

      move(this,0.8,convertPx(cx),convertPx(cy));
  	}
  }

  // Fonctions à redéfinir dans chaque classe piece
  getDepl(board){
	 return [];
  }

  getAtkRange(board){
	 return [];
  }

  noManaError(x,y){
    textAlign(CENTER,CENTER);

    {
      let manaTXT = new Text("hud",x,y,"Not enough mana","Arial",config.unit,[0,0,255])
      applyFadeOut(manaTXT,manaTXT.color,255,0.5)
    }
  }

  callPassive(passive,arg){
  	let passiveFunction = this[passive]
  	if (typeof passiveFunction == "function"){
  		return passiveFunction(arg);
  	}
  }
}

class Pion extends Piece {
  constructor(x, y, player) {
    
    super(0, "Pion", 50, 120, x, y, player, 3);
	let spell = [
      new Spell("Allahu Akkbar",8,img.spell.Pion[0],0,0,this,
        function(spell){
          spell.effect()
        },
        function(){
          console.log("ok")
        })
    ];
	this.spell = spell
  }

  getDepl(board) {
    var depl = [];
  	var startLine = ((this.player == 0) ? 1 : config.nLig - 2);
  	var direction = ((this.player == 0) ? 1 : -1);
  	var mp = (this.cy == startLine) ? this.mp : 1;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.cx,this.cy + ((i+1)*direction)) == false){break}
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
	  if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }
    for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }

    for (var i = 1; i < this.mp + 1; i++) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
    }
	for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
    }

    return depl;
  }

  getAtkRange(board){
	var atk = [];
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
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
      if (addDepl(board,depl,this.cx + i,this.cy + i) == false) { break }
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy - i) == false) { break }
	}
	for (var i = 1; i < this.mp; i++) {
	  if (addDepl(board,depl,this.cx - i,this.cy - i) == false) { break }
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx - i,this.cy + i) == false) { break }
	}

	return depl;
  }

  getAtkRange(board){
	var atk = [];

	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx + i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy + i);
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
      if (addDepl(board,depl,this.cx + i,this.cy + i) == false) break;
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy - i) == false) break;
	}
	for (var i = 1; i < this.mp; i++) {
	  if (addDepl(board,depl,this.cx - i,this.cy - i) == false) break;
	}
	for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx - i,this.cy + i) == false) break;
	}
	for (var i = 1; i < this.mp + 1; i++) {
	  if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }
    for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }

    for (var i = 1; i < this.mp + 1; i++) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
    }
	for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
    }

	return depl;
  }

  getAtkRange(board){
	var atk = [];

	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx + i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Cavalier extends Piece {
	constructor(x, y, player) {
		super(4, "Cavalier", 80, 50, x, y, player,2);
	}

	getDepl(board) {
		var depl = [];
    var mp = this.mp;
		for (var i = -1; i < 2; i += 2) {
			if (addDepl(board,depl,this.cx + i,this.cy + mp) == false) continue;
		}
		for (var i = -1; i < 2; i += 2) {
			if (addDepl(board,depl,this.cx + mp,this.cy + i) == false) continue;
		}
    for (var i = -1; i < 2; i += 2) {
      if (addDepl(board,depl,this.cx + i,this.cy - mp) == false) continue;
    }
    for (var i = -1; i < 2; i += 2) {
      if (addDepl(board,depl,this.cx - mp,this.cy + i) == false) continue;
    }

    return depl;
	}

	getAtkRange(board) {
    var atk = [];

    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy + 2);
        if (atkRt == 2 || !atkRt) continue;
		}
		for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + 2,this.cy + i);
        if (atkRt == 2 || !atkRt) continue;
		}
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - 2);
        if (atkRt == 2 || !atkRt) continue;
    }
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx - 2,this.cy + i);
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
      if (addDepl(board,depl,this.cx + i,this.cy + i) == false) break;
  }
  for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy - i) == false) break;
  }
  for (var i = 1; i < this.mp; i++) {
    if (addDepl(board,depl,this.cx - i,this.cy - i) == false) break;
  }
  for (var i = -1; i > -this.mp; i--) {
      if (addDepl(board,depl,this.cx - i,this.cy + i) == false) break;
  }
  for (var i = 1; i < this.mp + 1; i++) {
    if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }
    for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
    }

    for (var i = 1; i < this.mp + 1; i++) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
    }
  for (var i = -1; i > -this.mp - 1; i--) {
      if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
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

  onDying(killer){
    console.log(killer)
    alert("Victoire de " + joueur[killer.player].name)
    startGame()
  }

}

{ //création du tableau des classes
  var pieceClass = [Pion,Tour,Fou,Reine,Cavalier,Roi]
}

class Button {
  constructor(gui,x,y,w,h,img,hovercallback,callback) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.hovercallback = hovercallback
    this.callback = callback
    this.gui = gui

    chessGUI[gui].push(this)
  }

  draw() {
    image(this.img,
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
  constructor(gui,x,y,text,font,size,color,xalign = CENTER,yalign = CENTER){
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.gui = gui
  	this.font = font
	  this.size = size
    this.xalign = xalign
    this.yalign = yalign

    chessGUI[gui].push(this)
  }

  draw(){
    textFont(this.font)
    textSize(this.size)
    textAlign(this.xalign,this.yalign)
    fill(this.color)
    text(this.text,this.x,this.y)
  }

  destroy(){
    chessGUI[this.gui].spliceItem(this)
  }
}

class Animated {
  constructor(object,property,speed,max = NaN,reachMaxCallback = 0){
    this.object = object;
    this.property = property;
    this.speed = speed;
    this.max = max;
    this.reachMaxCallback = reachMaxCallback

    this.direction = Math.sign(speed);
    this.startVal = this.object[this.property];
    this.lastTime = actTime;
    this.val;

  }

  update(){
    var time = actTime - this.lastTime;
    var val = this.object[this.property] + deltaVarSpeed(time,this.speed);

    this.object[this.property] = val;

    if (this.max != NaN && typeof this.reachMaxCallback == "function"){
      if (val * this.direction >= this.max * this.direction){
          this.reachMaxCallback(this.object,this.property);
      }
    }
    this.lastTime = actTime;
  }


}

class FadeOut {
  constructor(object,rawColor,initAlpha,speed){
    this.object = object
    this.rawColor = rawColor
    this.alpha = initAlpha
    this.speed = speed
    this.animation = new Animated(this,"alpha",-speed,0,
    function(obj){obj.object.destroy()})

    this.object.fadeOut = this;

    this.object.staticDraw = this.object.draw;
    this.object.draw = function(){this.fadeOut.update() ; this.staticDraw()}
  }

  update(){
    this.animation.update()
    this.object.color = [this.rawColor[0],this.rawColor[1],this.rawColor[2],this.alpha];
  }

}

class Movement{
  constructor(object,speed,xTarget,yTarget){
    this.object = object
    this.speed = speed
    this.xTarget = xTarget
    this.yTarget = yTarget

    this.xReach = false
    this.yReach = false

    this.x = object.x
    this.y = object.y
    var dx = xTarget - object.x
    var dy = yTarget - object.y
    var dist = Math.sqrt(Math.pow(dx,2)+pow(dy,2));
    var vx = (dx / dist) * speed
    var vy = (dy / dist) * speed

    this.xAnimation = new Animated(this,"x",vx,xTarget,
      function(mov){mov.xReach = true ; if (mov.yReach) mov.end()})
    this.yAnimation = new Animated(this,"y",vy,yTarget,
      function(mov){mov.yReach = true ; if (mov.xReach) mov.end()})


    if (object.movement) object.movement.destroy()
    this.object.movement = this

    this.object.staticDraw = this.object.draw
    this.object.draw = function(){this.movement.update() ; this.staticDraw()}
  }

  update(){
    this.xAnimation.update();
    this.yAnimation.update();
    this.object.x = this.x;
    this.object.y = this.y;
  }

  destroy(){
    this.object.draw = this.object.staticDraw; this.object.movement = 0;
  }

  end(){
    this.object.x = this.xTarget ;
    this.object.y = this.yTarget ;
    this.destroy();
  }

}

class Spell {
  constructor(name,manaCost,img,helpImg,baseLocked,piece,onUsed,effect){
    this.name = name;
    this.manaCost = manaCost;
    this.img = img;
    this.helpImg = helpImg;
    this.locked = baseLocked;
    this.onUsed = onUsed;
    this.effect = effect;
  }



}

class SpellIcon extends Button {
  constructor(x,y,w,h,spell){ 
    super("pieceHUD",x,y,w,h,spell.img,0,function(){
      this.spell.onUsed(this.spell)
    })
	this.spell = spell
  }
}

// endClass ----------

// reset function
function startGame() {

  d = new Date();
  actTime = d.getTime();

  clearGUI();
  new Button("hud",config.hud.button.x,config.hud.button.y,config.hud.button.w,config.hud.button.h,img.HUD[0],0,function(){joueur[1 - playerTurn].startTurn()})
  {let manaGauge = config.hud.manaGauge;
   manaGauge.draw = function(){
       fill(200,200,255);
       rect(this.x+1,this.y+1,this.w-1,this.h-1);
       fill(80,80,255);
       rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h);
       textAlign(LEFT, CENTER); textSize(config.unit * 4); fill(255);
       text(joueur[playerTurn].mana + "/" + config.maxMana, this.x + this.w + config.unit * 2, this.y + this.h/2);}
   chessGUI.hud.push(manaGauge)}
  joueur = [new Joueur("blanc", "Gilbert"), new Joueur("noir", "Patrick")];
  playerTurn = 1;
  guiElements.playerTurnText = new Text("hud",config.hud.playerTurnText.x,config.hud.playerTurnText.y,joueur[playerTurn].name + " is playing","Arial",config.unit*3,[0,255,0],LEFT,TOP);
  guiElements.golds = new Text("hud",config.hud.goldText.x,config.hud.goldText.y,joueur[playerTurn].gold + " arjan","Arial",config.unit*3,[255,255,0],LEFT,TOP);
  isPlaying = true;
  initBoard();
}
// -------

// main functions
function setup() {
  noStroke();
  cursor("img/cursor.png");
  createCanvas(config.canvasW, config.canvasH);
  background(80); //drawBoard();

  textFont("Arial");

  startGame();
}

function draw() {

  image(config.background, 0, 0, config.canvasW, config.canvasH);

  d = new Date();
  actTime = d.getTime();

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
    fill(255); textSize(20);
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
