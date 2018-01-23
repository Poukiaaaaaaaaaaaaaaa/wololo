// CHESS++ ISN PROJECT
// Téo Tinarrage // Amaël Marquez
// TODO (avant la présentation)
// - Intégrer les changements du à la séparation en fichiers multiples (INTEGRER P55.DRAW ET DEFINITION DE P55.GUI)
// TODO (non terminé au moment de la présentation):
// - Sorts de certaines pièces
// - Système de monnaie


//Disclaimer :
//Si ChessPP est actuellement fonctionnel bien que légèrement incomplet, il reste
//peu jouable ; l'équilibrage n'a pas pu être travaillé en profondeur, il est donc fort possible
//que les stratégies n'aient que peu de d'intérêt actuellement. Si nous n'avons pas pu créer un jeu
//réellement intéressant (bien que fonctionnel encore une fois), son développement ne s'arrête pas au
//rendu du projet, et il sera à terme un jeu de stratégie à part entière.

// debug
var debug = false;
// endDebug

// config : objet contenant toutes les valeurs constantes qui définiront le fonctionnement du jeu
var config = {
	canvasW: window.innerWidth,    //tailles du canvas
	canvasH: window.innerHeight,
	nLig: 10, //nombres de lignes/colones
	nCol: 8,
	mana: {atk: 5, depl: 3, newPiece: 1},  //coûts en mana des différentes actions de base
	maxMana: 20,  //mana maximal
	gold: 100,   //monnaie au début de la partie. Au final, n'est pas utilisé (le sera ... un jour)
	hud: {},  //objet qui contiendra des informations sur différents éléments du hud
	background: 0,  //couleur de background
	expLevels : [100,250,500]   //valeurs d'expérience auxquelles les pièces gagnent un niveau
}


config.update = function(){
  // Définition de certains éléments de configuration calculés
  config.boardS = config.canvasH > config.canvasW ? config.canvasW : config.canvasH;
  config.unit = config.boardS/100;  //unité de distance dépendant de la taille du plateau
  config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
  config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
  config.boardW = config.nCol * config.tileSize + config.border * (config.nCol+1);
  config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6}
  config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16}
  config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8}
  config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9}
  config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5}
  config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.h + config.border * 2, size: config.unit * 2}
  config.hud.mute = {x: config.boardW + config.border * 3 + config.hud.info.w, y: config.hud.info.y, w: config.hud.info.h, h: config.hud.info.h}

	// Coordonnées des éléments du HUD
  config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6} //jauge de mana
  config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16 } //bouton de fin de tour
  config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8} //icônes des sorts
  config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9} //bouton d'infomartions sur les pièces
  config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5} //fenêtre affichant les infos
  config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.spellSize + config.border * 2, size: config.unit * 2} //zone où sont affichées les infos sur chaque pièce
}
// endConfig -------------

config.event = [
	"onStartTurn",
	"onMoved",
	"onMovedDone",
	"onAttacked",
	"onAttackedDone",
	"onAttacking",
	"onAttackingDone",
	"onDamaged",
	"onDamagedDone",
	"onDamaging",
	"onDamagingDone",
	"onDying",
	"onKilling",
	"onKilling",
]

// globalFunctions -----------

function initPrePieces() { //initialise les "prePieces" de chaque joueur selon la configuration de base des pièces d'échecs
	//Les prePieces sont des objets présents avant le début de la partie, contenant les infos de base d'un pièce,
	//indiquant quelles pièces seront créées où au début (leur position, etc)
	var layout = [  //Tableau contenant les classes de chaque pièce présente en début de partie
		[Tour, Cavalier, Fou, Reine, Roi, Fou, Cavalier, Tour], //On suit la configuration de base des échecs
		[Pion, Pion, Pion, Pion, Pion, Pion, Pion, Pion]
	];

	//Pour chaque joueur, ajoute à son tableau prePieces les prePieces correspondant aux pièces et la configuration de base des échecs
		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[i].length; j++) {
				joueur[0].prePiece.push(new PrePiece(layout[i][j], j, i, 0));
				joueur[1].prePiece.push(new PrePiece(layout[i][j], j, config.nLig - i - 1, 1));
		}
	}
}

function initBoard() { // création de toutes les pièces (réelles) sur le plateau, à partir des prePieces de chque joueur
  for (let i = 0; i < joueur[0].prePiece.length; i++) {
    joueur[0].prePiece[i].summon(); //pour chaque prePiece de chaque joueur, on éxécute sa méthode summon(), qui crée une pièce à partir de la prePiece
    joueur[1].prePiece[i].summon();
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
		if (array[i] === element){ //Pour chaque élément du tableau, teste si c'est l'élément spécifié
			return i; //si oui, le retourne
		}
	}

	return false; //si aucun n'a été trouvé, renvoie false
}

Array.prototype.spliceItem = function(item){
	//méthode appartenant au prototype des Arrays, ce qui signifie qu'elle sera présente pour tous les tableaux
	//elle permet de détruire un élément du tableau, en spécifiant uniquement l'élément en question
	//(sa clé est déterminée via getArrayID())
	var array = this;
	array.splice(getArrayID(array,item),1)
}

function kill(target,killer){ //tue une pièce
	target.callPassive("onDying",killer) //Appelle les passifs s'activant au moment où une pièce meurt (voir Sorts Passifs/ Piece.callPassive() )
	killer.callPassive("onKilling",target)
	let xp = target.expValue //Calcul de l'expérience raaportée par la mort de la pièce

	//on retire la pièce des tableaux dont elle fait partie (on la supprime totalement)
	joueur[target.player].piece.spliceItem(target) //le tableau des pièces du propriétaire
	chessGUI.pieces.spliceItem(target) //le tableau des éléments gérés par la GUI

	killer.callPassive("onKillingDone",target)
	killer.gainExp(xp) //Le tueur gagne de l'expérience
}

function damage(target,source,dmg){ //inflig des dégâts à une pièce
	//Appel des passifs s'activant quand une pièce subit des dégâts
  if (target.callPassive("onDamaged",{source : source, damage : dmg}) == true) return true //si l'un des passifs pré-dégâts renvoie true
  if (source.callPassive("onDamaging",{target : target, damage : dmg}) == true) return true //les dégâts sont annulés et la fonction renvoie elle aussi true (permet à un passif d'annuler des dégâts)

  target.hp = target.hp - dmg //retrait des points de vie à la pièce subissant des dégâts
  if (target.hp < 1){
    kill(target,source) //si es PV de la pièce tombent à 0, la tue
  }

  target.callPassive("onDamagedDone",{source : source, damage : dmg})
  source.callPassive("onDamagingDone",{target : target, damage : dmg})

}

function examineBoard() {
	//permet d'analyser le contenu de l'échiquier facilement
	//via un tableau dont chaque entrée représente une case
	var board = []; //crée un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau à deux dimensions avec une entrée = une case
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i];		//récupère les coordonnées de chaque pièce et place une référence à cette pièce
    board[piece.cx][piece.cy] = piece;		//dans la case correspodante dans le tableau
  }

	return board;
	//renvoie le tableau
	//board[x][y] contient le contenu de la case (x,y)
}

function examineBoardHLC() { //même effet de examine board, mais remplit les cases avec les highlightCase au lieu des pièces
//sur le moment ça m'avait l'air utile mais je crois que cette fonction sert à rien au final
	var board = []; //crée un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau à deux dimensions avec une entrée = une case
	}

  for (var i = 0; i < chessGUI.highlightCase.length;i++){
    var hlc = chessGUI.highlightCase[i]		//récupère les coordonnées de chaque HLC et place une référence à celle-ci
    board[hlc.x][hlc.y] = hlc;		//dans la case correspodante dans le tableau
  }

	return board;
}

function convertPx(x) { //convertit une coordonnée exprimée en cases en une coordonnée en pixels, pour l'affichage
  return x*config.tileSize + (x+1)*config.border;
}

function drawBoard(dx = 0) {
 //dessine case par case l'échiquier
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

function isHovered(x,y,w,h) { //Teste si le curseur de la souris se trouve au dessus de la zone sp�cifi�e
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true; //Si oui, retourne true, sinon false
      } else { return false; }
}

function isObjectHovered(object){ //Teste si un objet graphique est survolé par la souris.  Utilise ses propriétés x, y, w et h, ne fonctionne donc que si elles sont définies
	return isHovered(object.x,object.y,object.w,object.h) //Teste simplement isHovered avec les coordonnées de l'objet
}

function isCaseHovered(x,y){ //teste si le curseur de la souris se trouve au dessus de la case spécifiée
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border); //Teste isHovered avec les coordonées de la case (x et y sont en nombre de case par rapport à l'échiquier)
}

function deltaVarSpeed(time,speed){
  var delta = (time * speed);
  return delta;
}

function applyFadeOut(object,rawColor,initAlpha,speed){ //Fait disparaître un objet graphique en fondu.
	new FadeOut(object,rawColor,initAlpha,speed); //Pour cela, lui ajoute un objet fadeOut (voir "class FadeOut"). Celui-ci utilise la propriété color d'un objet, qui doit être définie sous forme de tableau
}

function move(object,speed,xTarget,yTarget){ //Déplace un objet graphique
  new Movement(object,speed,xTarget,yTarget); //Pour cela, lui ajoute un objet Movemet (voir "class Movement"). Celui-ci utilise les propriété x et y d'un objet, qui doivent être définies.
}

function clearGUI(gui){ //Vide un des éléments de l'objet GUI (voir "chessGUI")
  if (typeof gui == "undefined"){ //si aucun paramètre n'est passé, on vide tout
    for (var element in chessGUI){
      if (chessGUI.hasOwnProperty(element)){
        chessGUI[element] = []
      }
    }
  } else if (typeof gui == "string"){
    chessGUI[gui] = []
  }

}

function clearSelectedPiece(piece){  //Reset la pièce sélectionnée
	if (selectedPiece) selectedPiece.deselect() ; //Effectue les opérations de déseleciton de la pièce sélectionnée
	selectedPiece = piece; //Si une pièce est passé en paramètre, elle est la nouvelle pièce sélectionnée, sinon selectedP Hiiece est vide (undefined)
	clearGUI("pieceHUD"); //Vide plusieurs éléments de la GUI : le HUD lié aux pièces, les cases colorées (voir "class HighlightCase") et les fenètres
	clearGUI("highlightCase");
	clearGUI("windows");
 	guiState = ""; //Si la GUI était dans un état particulier (opération en cours modifiant son comportement, etc), elle revient à la normale
}

//Fonctions de gestion de l'échiquier : permettent de détecter/trier des cases, des pièces, selon leur position par exemple, et de leur appliquer des callbacks
function caseInRangeZ(cx,cy,range,includeCenter = false){ //Renvoie (dans un tableau) les cases (sous la forme [x,y]) se trouvant dans une portée spécifiée
	//le Z signifie qu'on utilise la méthode de Zone : on prend un carré dont on sait qu'il contient toutes les cases à portée, et on teste toutes les cases de ce carré
	var cases = []
	var dist;
	var xStart = (cx - range >= 0) ? cx - range : 0;  //calcul des coordonnées du carré (de manière à ce qu'il ne sorte pas de l'échiquier)
	var xEnd = (cx + range < config.nCol) ? cx + range : config.nCol - 1;
	var yStart = (cy - range >= 0) ? cy - range : 0;
	var yEnd = (cy + range < config.nLig) ? cy + range : config.nLig - 1;

	for (var i = xStart; i <= xEnd; i++){ //Pour chacune des cases du carré
		for (var j = yStart ; j <= yEnd ; j++){
			dist =  Math.sqrt(Math.pow(i - cx,2)+pow(j - cy,2)); //On teste si sa distance (distance entre les centres) avec la case d'origine est en dessous de la portée max
			if (Math.round(dist) <= range && !(i == cx && j == cy && !includeCenter)) {
				cases.push([i,j]) //Si c'est le cas on l'ajoute au tableau cases
			}
		}
	}

return cases; //que l'on renvoie

}

function piecesInCases(cases, board){ //renvoie un tableau contenant les pièces se trouvant sur les cases contenues le tableau cases
	var x,y;
	var pieces = [];
	for (var i = 0; i < cases.length; i++){
		x = cases[i][0] ; y = cases[i][1]; //Pour chacune des cases, on teste si elle contient une pièce, grâce à l'objet board (passé en paramètre, obtenu via examineBoard() ) contenant, pour chaque case,
		if (board[x][y]) pieces.push(board[x][y]); //undefined s'il n'y a pas de pièce, ou la pièce s'il y en a une. Si oui, on ajoute cette pièce au tableau pices
	}
	return pieces //que l'on renvoie
}

function selectCases(cases, callback){ //appelle un même callback(x,y) avec les coordonnées des cases du tableau cases
	for (var i = 0 ; i < cases.length ; i++){
		callback(cases[i][0],cases[i][1])
	}
}

function selectPieces(pieces, callback){ //appelle un même callback(piece) pour chaque pièce du tableau pieces
	for (var i = 0 ; i < pieces.length ; i++){
		callback(pieces[i])
	}
}

function selectPiecesConditional(pieces, callback, condition = []){
  //Appelle un même callback(piece) pour chaque pièce du tableau pieces qui remplit les conditions
  //les conditions sont des fonctions prenant en paramètre piece[i] et renvoient true ou false
	pieceLoop: for (var i = 0 ; i < pieces.length ; i++){ //Pour chaque pièce
		for (var j = 0 ; j < condition.length; j++){ //On teste toutes les conditions (array condition)
			if (!condition[j](pieces[i])) continue pieceLoop;
		}
		callback(pieces[i]); //Si elles sont toutes vérifiées, on éxécute le callback
	}
}

function filterElements(elements,condition){
	let result = [];
	for (let i = 0; i < elements.length; i++){
		if (condition(elements[i])) result.push(elements[i]);
	}
	return result
}



//Fonctions de sélection via HighlightCase : crée des HighlightCase sur les objets pouvant être sélectionés, et éxécute un callback quand l'utilisateur a cliqué sur l'un d'eux
function startPieceSelectionHLC(pieces, color, hoverColor, callback){ //démarre un processus de sélection de pièce (pieces), en utilisant des cases colorées (voir "class HighlightCase")
//pieces : pièces pouvant être sélecctionnées, color et hovercolor : couleurs des HighlightCase, callback: fonction éxécutée lorsqu'une pièce est
  if (pieces.length > 0){ //Si aucune pièce n'est dans la liste des pièces, rien ne se passe
    endSelectionHLC(); //Si une sélection était en cours, elle se termine
    guiState = "selection"; //le GUISTATE passe à "selection" : toutes les interactions des objets de la GUI qui nécessitent que la GUI soient à son état normal ne fonctionneront pas
    clearGUI("highlightCase"); //On supprime toutes les cases colorées.

    var colorType = typeof color //Le paramètre color, la couleur des cases de couleur de la sélection, peut être indéfini, une couleur p5 ou une fonction
    var hoverColorType = typeof hoverColor //Idem pour la couleur "hover" (si la souris passe dessus) des HighlightCase.
    var caseColor, caseHoverColor
    var piece

    for (var i = 0; i < pieces.length; i++){  //Pour chaque pièce pouvant être sélectionnée
    	piece = pieces[i]
    	if (colorType == "undefined") {caseColor = [200,200,200,50]}  //Si la couleur des cases n'est pas définie, elle est choisie par défaut
    	else if (colorType == "function") {caseColor = color(piece)}  //Si c'est une fonction, on l'éxécute en lui passant la pièce actuelle pour qu'elle retourne la couleur de sa Highlight Case
    	else {caseColor = color}
    	if (hoverColorType == "undefined") {caseHoverColor = [200,200,200,100]}
    	else if (hoverColorType == "function") {caseHoverColor = hoverColor(piece)}
    	else {caseHoverColor = hoverColor}
        new HighlightCase(piece.cx,piece.cy, //On crée une highlightCase sur la pièce, avec pour callback une fonction mettant fin à la sélection en éxécutant le callback de cette sléection (voir "endSelectionHLC")
            caseColor,caseHoverColor,piece,function(){endSelectionHLC(callback,this.piece)});
    }
  }
}

function startCasesSelectionHLC(cases, color, hoverColor, callback){ //démarre un processus de sélection de case, en utilisant les Highlight Cases
	//pareil mais pour sélectionner des cases
  if (cases.length > 0){
    endSelectionHLC()
    guiState = "selection"
    clearGUI("highlightCase")

    var colorType = typeof color
    var hoverColorType = typeof hoverColor
    var caseColor, caseHoverColor
    var case_ // le _ est là pour faire la différence avec case, qui est un mot-clé JS

    for (var i = 0; i < cases.length; i++){
    	case_ = cases[i]
    	if (colorType == "undefined") {caseColor = [200,200,200,50]}
    	else if (colorType == "function") {caseColor = color(piece)}
    	else {caseColor = color}
    	if (hoverColorType == "undefined") {caseHoverColor = [200,200,200,100]}
    	else if (hoverColorType == "function") {caseHoverColor = hoverColor(piece)}
    	else {caseHoverColor = hoverColor}
        new HighlightCase(case_[0],case_[1],
            caseColor,caseHoverColor,undefPiece,function(){endSelectionHLC(callback,{x : this.x, y: this.y})});
    }
  }
}

function endSelectionHLC(callback,selected){ //Met fin au processus de sélection en cours, et éxécute un callback en fonction de l'objet sélectionné si spécifié
	//Cette fonction sera appelée pour annuler une sélection, mais aussi pour la terminer si un objet a été sélectionné, auquel cas celui-ci est passé en paramètre (selected)
	if (guiState == "selection") { //Ne s'active que si une sélection était en cours
		guiState = ""; //Remet la GUI à son état normal
		clearGUI("highlightCase") //Supprime les highlightCase
		if (typeof callback == "function") callback(selected) //Si un callback a été spécifié (cette fonction est généralement appelée avec un callback quand on a cliqué sur une HighlightCase), l'éxécute
	}
}

function isOnBoard(x,y){return (x > -1 && x < config.nCol && y > -1 && y < config.nLig)}

var titleView = { //Objet contenant plusieurs fonctions : chacune sert à initialiser une "page" de l'écran titre : elles créent les éléments à afficher pour chaque page
	mainPage : function(){ //Page d'accueil
    clearGUI("hud") //Vide les éléments de hud (dans l'écran-titre, l'élément de gui "hud" contient tous les objets affichés sauf le l'image de fond)
    {let titleW = config.unit * 90, titleH = config.unit * 18
    new StaticImage("hud",img.title[1],config.canvasW/2 - titleW / 2,config.canvasH/5 - titleH / 2,titleW,titleH)}  //Logo de chess++
    {let playButtonW = config.unit * 50, playButtonH = config.unit * 20
    new Button("hud",img.title[2],config.canvasW/2 - playButtonW / 2,config.canvasH/5*3 - playButtonH / 2,playButtonW,playButtonH, //Bouton play
      function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
      function(){startGame()})}  //son callback appelle startGame, qui lance la partie
    {let setButtonS = config.unit * 20
    new Button("hud",img.title[4],config.canvasW/4 - setButtonS/2,config.canvasH/5*3 - setButtonS / 2,setButtonS,setButtonS, //Bouton ouvrant les paramètres
    function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
    function(){titleView.settings()})}  //Son callback appelle une autre fonction de titleView, settings, qui affiche les éléments de configuration
    {let helpButtonS = config.unit * 20
    new Button("hud",img.title[6],config.canvasW/4 * 3 - helpButtonS/2,config.canvasH/5*3 - helpButtonS / 2,helpButtonS,helpButtonS,  //Bouton d'aide
    function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
    function(){let win = window.open("help/help.html", '_blank') ; win.focus()})} //son callback ouvre dans un autre onglet le fichier help/help.html
	new Text("hud",config.unit,config.canvasH - config.unit,"version 1.0-alpha","Arial",config.unit,[0,0,0],TOP,LEFT)
	},
	settings : function(){ //Page de configuration
		clearGUI("hud") //Vide les éléments de hud (dans l'écran-titre, l'élément de gui "hud" contient tous les objets affichés sauf le l'image de fond)
		new Text("hud",config.canvasW/2,config.canvasH/8,"SETTINGS","Verdana",50,[255, 178, 0]) //Titre ("Settings")
		new Button("hud",img.title[5],config.canvasW / 5 * 4,config.canvasH/8, config.unit * 16, config.unit * 9, //Bouton de retour à la page d'accueil
			function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h)},
			function(){titleView.mainPage()}); //son callback appelle titleView.mainPage, affichant la page principale


		guiElements.settingsPlayerName = [];
		for (let i = 0; i < joueur.length; i++){ //Pour chaque joueur
			guiElements.settingsPlayerName[i] = new Text( //affiche son nom
				"hud",config.canvasW/4,config.canvasH/4 + i * config.unit * 4,"Joueur "+(i+1)+": "+joueur[i].name,"Verdana",config.unit * 3,[255, 251, 0],LEFT,TOP)
			let butno = new Button( //en plus d'un bouton permettant de le modifier
				"hud",img.title[3],config.canvasW/4 + config.unit * 40,config.canvasH/4 + i * config.unit * 4,config.unit * 3,config.unit*3,
				function(){fill([200,200,200,50]) ; rect(this.x,this.y,this.w,this.h)},
				function(){joueur[this.player].name = prompt("Name") ;
					guiElements.settingsPlayerName[this.player].text = "Joueur "+(this.player+1)+": "+joueur[this.player].name})
			butno.player = i;
    }

  }
}

function fuckThisShitImOut(){ //Euh alors ça c'est n'importe quoi
	guiState = "boi"
	clearGUI("windows")
	let objects = []
	for (var element in chessGUI) {
		if (chessGUI.hasOwnProperty(element)) {
			for (var i = 0; i < chessGUI[element].length; i++) {
				if (typeof chessGUI[element][i].draw === "function"){
					objects.push(chessGUI[element][i])
				}
			}
        }
    }
	let bgCleaner = {draw: function(){background(0)}} ; chessGUI.background.splice(0,0,bgCleaner)
	let targetAngle
	for (let i = 0; i < objects.length; i++){
		targetAngle = Math.random() * 2 * Math.PI
		move(objects[i],0.3,objects[i].x + Math.cos(targetAngle) * 2000, objects[i].y + Math.sin(targetAngle) * 2000)
	}

	for (let i = 0; i < joueur.length; i++){
		for (let j = 0; j < joueur[i].piece.length; j++){
			joueur[i].piece[j].cx = 500
		}
	}

}

function initAddedpassivesArrays(){
	passives = {}
	for (let i = 0; i < config.event.length; i++){
		passives[config.event[i]] = []
	}
	return passives
}

// endGlobalFunctions -------------

// globalVars --------------
// variables globales
var img = {}, //Objet contenant toutes les images
    hudIMG = [], //tableau contenant les images du HUD
    selectedPiece = 0, //pièce sélectionnée par le joueur
    playerTurn = 0, //ID (numérique) du joueur dont c'est le tour
    actTime, //le temps (relatif au 1/1/1970)
    d, //le futur objet date
    joueur = [], //l'objet contenant les joueurs
    guiElements = {}, //un objet contenant certains objet p55 auxquels on veut conserver un accès rapide
    winIMG = [], //images utilisées par les fenètres
    guiState = "", //représente l'action en cours (qui détermine comment certains éléments se comportent)
    victory = false,
	undefPiece,
    sEffects = []; //array contenant tous les effets audio. Est à false si le son n'a pas pu être load

img.piece = { //objet contenant deux tableaux, "blanc" et "noir" : chacun contiendra les images des pi�ces de couleur correspodante
    blanc: [],
    noir: [],
    selection: null
  };
img.spell = {};
img.HUD = [];
img.title = [];

//Le fondement de l'interface graphique du jeu : l'objet chessGUI possède en tant qu'attributs des "éléments de GUI", qui sont des tablelaux
//qui contiendront des objets graphiques. Ces objets seront affichés et pourront réagir au clic (voir "draw()" et "mouseClicked()")


var chessGUI = { background: [], pieces: [], highlightCase: [], hud: [], pieceHUD: [], msg: [], windows: [] };

// endGlobalVars --------------


// images ---------------
function preload() { //chargement des images. La fonction Preload est lancée par p5 avant le setup.
	var oldLoadImage = loadImage
	loadImage = function(path,sCallback = undefined,fCallback = undefined){
		return oldLoadImage(path,sCallback,
			function(){
        if(fCallback) fCallback();
				throw "Impossible de charger " + path;
			}
		);
	}

  config.background = loadImage("img/background.png");
  img.HUD[0] = loadImage("img/HUD/end_turn.png");
  img.HUD[1] = loadImage("img/HUD/info.png");
  img.HUD[2] = loadImage("img/HUD/unmuted.png");
  img.HUD[3] = loadImage("img/HUD/muted.png");
  img.HUD[4] = loadImage("img/HUD/player_up.png");
  img.HUD[5] = loadImage("img/HUD/player_down.png");
  img.title[0] = loadImage("img/title_background.png");
  img.title[1] = loadImage("img/logo.png");
  img.title[2] = loadImage("img/playButton.png");
  img.title[3] = loadImage("img/edit.png");
  img.title[4] = loadImage("img/settings.png");
  img.title[5] = loadImage("img/backToMenu.png");
  img.title[6] = loadImage("img/help.png");

  img.piece.noir[0] = loadImage("img/Pieces/pion_noir.png"); // pion noir
  img.piece.noir[1] = loadImage("img/Pieces/tour_noire.png"); // tour noire
  img.piece.noir[2] = loadImage("img/Pieces/fou_noir.png"); // fou noir
  img.piece.noir[3] = loadImage("img/Pieces/reine_noire.png") // reine noire
  img.piece.noir[4] = loadImage("img/Pieces/cavalier_noir.png") // cavalier noir
  img.piece.noir[5] = loadImage("img/Pieces/roi_noir.png") // roi noir
  img.piece.blanc[0] = loadImage("img/Pieces/pion_blanc.png"); // pion blanc
  img.piece.blanc[1] = loadImage("img/Pieces/tour_blanche.png"); // tour blanche
  img.piece.blanc[2] = loadImage("img/Pieces/fou_blanc.png"); // fou blanc
  img.piece.blanc[3] = loadImage("img/Pieces/reine_blanche.png"); // reine blanche
  img.piece.blanc[4] = loadImage("img/Pieces/cavalier_blanc.png"); // cavalier blanc
  img.piece.blanc[5] = loadImage("img/Pieces/roi_blanc.png"); // roi blanc
  img.piece.selection = loadImage("img/Pieces/selection.png"); // image de séléction

  img.spell.Pion = [];
  img.spell.Pion[0] = loadImage("img/Spells/Pion/0.png");
  img.spell.Pion[1] = loadImage("img/Spells/Pion/1.png");
  img.spell.Pion[2] = loadImage("img/Spells/Pion/2.png");
  img.spell.Tour = [];
  img.spell.Tour[0] = loadImage("img/Spells/Tour/0.png");
  img.spell.Tour[1] = loadImage("img/Spells/Tour/1.png");
  img.spell.Tour[2] = loadImage("img/Spells/Tour/2.png");
  img.spell.Cavalier = []
  img.spell.Cavalier[0] = loadImage("img/Spells/Cavalier/0.png");
  img.spell.Cavalier[1] = loadImage("img/Spells/Cavalier/1.png");
  img.spell.Cavalier[2] = loadImage("img/Spells/Cavalier/2.png");
  img.spell.Reine = []
  img.spell.Reine[0] = loadImage("img/Spells/Reine/0.png");
  img.spell.Reine[1] = loadImage("img/Spells/Reine/1.png");
  img.spell.Reine[2] = loadImage("img/Spells/Reine/2.png");
  img.spell.Fou = [];
  img.spell.Fou[0] = loadImage("img/Spells/Fou/0.png");
  img.spell.Fou[1] = loadImage("img/Spells/Fou/1.png");
  img.spell.Fou[2] = loadImage("img/Spells/Fou/2.png");
  img.spell.Roi = [];
  img.spell.Roi[0] = loadImage("img/Spells/Roi/0.png");
  img.spell.Roi[1] = loadImage("img/Spells/Roi/1.png");

  winIMG[0] = loadImage("img/Window/window_left.png");
  winIMG[1] = loadImage("img/Window/window_right.png");
}

function facepunch() { //hehe
  config.background = loadImage("img/no/facepunch.jpg");
  img.HUD[0] = loadImage("img/no/facepunch.jpg");
  img.HUD[1] = loadImage("img/no/facepunch.jpg");
  img.HUD[2] = loadImage("img/no/facepunch.jpg");
  img.HUD[3] = loadImage("img/no/facepunch.jpg");
  img.HUD[4] = loadImage("img/no/facepunch.jpg");
  img.HUD[5] = loadImage("img/no/facepunch.jpg");
  img.title[0] = loadImage("img/no/facepunch.jpg")
  img.title[1] = loadImage("img/no/facepunch.jpg")
  img.title[2] = loadImage("img/no/facepunch.jpg")
  img.title[3] = loadImage("img/no/facepunch.jpg")
  img.title[4] = loadImage("img/no/facepunch.jpg")
  img.title[5] = loadImage("img/no/facepunch.jpg")
  img.title[6] = loadImage("img/no/facepunch.jpg")

  img.piece.noir[0] = loadImage("img/no/facepunch.jpg"); // pion noir
  img.piece.noir[1] = loadImage("img/no/facepunch.jpg"); // tour noire
  img.piece.noir[2] = loadImage("img/no/facepunch.jpg"); // fou noir
  img.piece.noir[3] = loadImage("img/no/facepunch.jpg") // reine noire
  img.piece.noir[4] = loadImage("img/no/facepunch.jpg") // cavalier noir
  img.piece.noir[5] = loadImage("img/no/facepunch.jpg") // roi noir
  img.piece.blanc[0] = loadImage("img/no/facepunch.jpg"); // pion blanc
  img.piece.blanc[1] = loadImage("img/no/facepunch.jpg"); // tour blanche
  img.piece.blanc[2] = loadImage("img/no/facepunch.jpg"); // fou blanc
  img.piece.blanc[3] = loadImage("img/no/facepunch.jpg"); // reine blanche
  img.piece.blanc[4] = loadImage("img/no/facepunch.jpg"); // cavalier blanc
  img.piece.blanc[5] = loadImage("img/no/facepunch.jpg"); // roi blanc

  img.spell.Pion = [];
  img.spell.Pion[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Pion[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Pion[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour = [];
  img.spell.Tour[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier = []
  img.spell.Cavalier[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine = []
  img.spell.Reine[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou = [];
  img.spell.Fou[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Roi = [];
  img.spell.Roi[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Roi[1] = loadImage("img/no/facepunch.jpg");

  winIMG[0] = loadImage("img/no/facepunch.jpg");
  winIMG[1] = loadImage("img/no/facepunch.jpg");
  startGame();
}

function deFacepunch() {
  preload(); startGame();
}
// endImages -------------

function soundPreLoad() {
	if (!Audio) {sEffects = false ; return false} //Si la classe Audio n'existe pas, on l'indique en mettant sEffects à false, puis on quitte la fonction(return)
	sEffects[0] = new Audio("audio/click1.wav");
	sEffects[1] = new Audio("audio/click2.wav");
	sEffects[2] = new Audio("audio/click3.wav");
	sEffects[3] = new Audio("audio/loop.mp3"); sEffects[3].loop = true;
	sEffects[3].volume = 0.5;
	return true
}

// class
class Joueur {
		//classe représentant un joueur (sa couleur, son nom,ses ressources, ses pièces)
	constructor(color, name) {
		//les paramètres passés au contruceur sont la couleur et le nom; les autre propriétés dépendront de la partie (ressources, pièces)
		this.color = color;
		this.piece = []; //On initialise deux tableaux vides : 'piece', celui des pièces, et prePieces (voir "initPrePieces()")
		this.prePiece = [];
		this.name = name;
	}

	initGame(){ //Méthode initialisant le joueur pour une nouvelle partie
		this.mana = config.maxMana;
		this.gold = config.gold;
	}

	startTurn() {
		//méthode permettant de démarrer le tour du joueur: mise à jour de la variable
		//playerTurn, restauration du mana, réinitialisation des cases colorées
		var playerID = getArrayID(joueur,this); //Récupère le numéro du joueur dans le tableau des joueurs
		playerTurn = playerID; //ce numéro devient le nouveau 'playerTurn'
		clearSelectedPiece() //Aucune pièce n'est sélectionnée
		this.mana = config.maxMana;
		for (var i = 0; i < this.piece.length; i++) {
			this.piece[i].startTurn();
		}

		guiElements.player_arrow.update(); //Met à jour la flèche indiquant le joueur en train de jouer
		selectedPiece = 0;
	}


}

class Piece {
	//classe représentant une pièce en général
	//les différentes pièces seront des classes héritées de celle-ci
  constructor(img,name,atk,hp,cx,cy,player,mp,expValue,spell = []) { //On ne créera jamais d'instances de cette classe directement : ce sont les classes
		//héritant de Piece, les classes qui définissent un pièce en particulier (voir "class Pion"), appelleront elle-même le constructeur de Piece
	  //on passe au constructeur l'image, le nom, les stats, la position initiale, le propriétaire d'une pièce
	  //l'ID d'image, le nom, les stats seront déterminés de manière fixe lors de l'appel du superconstructeur
	  //dans le constructeur des classes héritées (= les pièces en elles mêmes)
    this.img = img; //image représentant la pièce : il s'agit d'un numéro, qui indique une entrée du tableau img.piece.[noir/blanc]
    this.name = name; //nom de la pièce (pas vraiment utilisé)
    this.atk = atk; //stat d'attaque de la pièce
	  this.baseAtk = atk //stat d'attaque d'origine de la pièce
    this.baseHP = hp; //stat de pv max d'origine de la pièce
	  this.maxHP = hp //stat de pv max de la pièce
    this.hp = hp; //pv actuels de la pièce
	  this.mp = mp; //stat de point de déplacements (obsolète)
    this.cx = cx; //position x (en cases)
    this.cy = cy; //position y (en cases)
    this.color = joueur[player].color; //string représentant le couleur de la pièce
    this.player = player; //numéro du joueur possédan la pièce
    this.deplCD = false; //valeur bool indiquant si la pièce peut oui ou non se déplacer (possible une fois par tour)
    this.atkCD = false; //valeur bool indiquant si la pièce peut oui ou non attaquer (possible une fois par tour)
	  this.spell = spell; //spells (actifs) de la pièce
	  this.addedPassive = initAddedpassivesArrays()
	  this.effects = [] //effets appliqués à la pièce
	  this.exp = 0 //expérience de la pièce
	  this.level = 0 //niveau de la pièce
	  this.expValue = expValue //quantité d'exp obtenue en tuant la pièce
	  this.baseMp = mp //Points de déplacement à l'origine

    chessGUI.pieces.push(this); //ajout de la pièce au tableau des éléments de la GUI
  }

  draw() {
  //méthode affichant la pièce
    if (!(this.movement)) {this.x = convertPx(this.cx) ; this.y = convertPx(this.cy)} //Si la pièce n'est pas en mouvement (=ne possède pas actuellement d'attribut mouvement), sa position est calculée
      image(img.piece[this.color][this.img], //Affiche l'image de la pièce
            this.x + config.border, this.y + config.border,
            config.tileSize - 2*config.border, config.tileSize - 2*config.border);
      if (selectedPiece == this) //Si la pièce est sélectionnée, affiche l'icône de sélection
        image(img.piece.selection,
              this.x + config.border, this.y + config.border,
              config.tileSize - 2*config.border, config.tileSize - 2*config.border);
      if (playerTurn == this.player && isCaseHovered(this.cx,this.cy) && guiState == ""){  //Si la pièce peut être sélectionnée et que la souris passe dessus
        fill(255,255,255,50);
        rect(convertPx(this.cx),convertPx(this.cy), //affiche un indicateur
        config.tileSize, config.tileSize, config.border);
    }

	//affichage de la barre de vie
    fill("red");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize,config.tileSize * 0.2,
    0,0,config.border,config.border);
    fill("green");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize / this.maxHP * this.hp,config.tileSize * 0.2,
    0,0,config.border,config.border);
  }

  onLeftClick() { //fonction appelée à chaque clic de la souris
    if (isCaseHovered(this.cx,this.cy) && playerTurn == this.player && guiState == "") { //si le clic a eu lieu sur cette pièce :
      if (selectedPiece == this) { //Si la pièce était déjà sélectionnée
        clearSelectedPiece(); return; //la déselectionne
      } else { this.select() } //sinon, la sélectionne
    }
  }

  select(){ //Sélectionne la pièce
    clearSelectedPiece(this) //Déselectionne la pièce sélectionnée, puis sélectionne celle-ci
    this.viewRanges(); //on affiche les portées d'attaque et de déplacement

    for (var i = 0; i < this.spell.length; i++){ //Affichage des icônes des sorts
      new SpellIcon(config.hud.spells.x + i * (config.hud.spells.spellSize * 1.1),config.hud.spells.y,config.hud.spells.spellSize,config.hud.spells.spellSize,this.spell[i])
    }
  }

  deselect(){ //Déselectionne la pièce
    clearGUI("pieceHUD") //Vide la partie de la GUI liée aux pièces
	if (this.deplSpell){
		for (let i = 0; i < this.deplSpell.length; i++){
			this.deplSpell[i].active = false
		}
	}
  }

  viewRanges() { 	  //affiche les portées d'attaque et de déplacement (= cases où ils est possible de se déplacer + pièces attaquables)
    var board = examineBoard();  //récupération du tableau représentant l'échiquier
    var depl = this.getDepl(board); //r�cup�ration de la liste des cases o� il est possible de de d�placer
									//la m�thode getDepl est d�finie dans chaque classe de pi�ce, le d�placement �tant propre � celle-ci

  	var color;
  	var hoverColor;
  	var callback;

  	//ATTAQUE
  	var atk = this.getAtkRange(board); //Récupère les cases sur lesquelles on peut attaquer (sous forme de tableau [ [x,y], [x,y], ... ])
  	var HLCase;

    clearGUI("highlightCase"); //Supprime les cases colorées

    if (this.atkCD == false){ //Uniquement si atkCD est à false, c'est à dire si la pièce n'a pas encore attaqué
		//Préparation des highlightCase qui indiqueront les cases où il est possible d'attaquer
    	if (joueur[playerTurn].mana >= config.mana.atk){ //Si la pièce 	a assez de mana pour attaquer
    		color = [255,0,0,120]; //On choisit un rouge foncé pour indiquer les cases
    		hoverColor = [255,100,100,120];
    		callback = function(){ this.piece.attack(this.target); this.piece.atkCD = true ; this.piece.viewRanges() } //Le callback des HighlightCase aura pour effet d'attaquer
    	} else { //Sinon, on choisit une couleur plus claire, et le callback aura pour effet d'afficher le texte "not enough mana"
    		color = [190,0,0,50];
    		hoverColor = [190,100,100,50];
    		callback = function(){ this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) ; this.piece.viewRanges()}
    	}

    	for (var i = 0; i < atk.length; i++) { //Pour chaque case du tableau
    		if (typeof board[atk[i][0]][atk[i][1]] != "undefined"){
    			if (board[atk[i][0]][atk[i][1]].player == 1 - this.player){ //si la case contient une pièce ennemie (on vérifie grâce à examineBoard())
    				HLCase = new HighlightCase(atk[i][0],atk[i][1], //On y crée une HighLlighCase
    				color,hoverColor,this,callback);
    				HLCase.target = board[atk[i][0]][atk[i][1]];
    			}
    		}
    	}
    }

    //D�PLACEMENTS
	//Idem que pou l'attaque : les highlightCase sont crées sur les cases (vides) dans la portée de déplacement de la pièce
    if (this.deplCD == false){
    	if (joueur[playerTurn].mana >= config.mana.depl){
    		color = [0,0,255,120];
    		hoverColor = [100,100,255,120];
    		callback = function(){ this.piece.depl(this.x,this.y); this.piece.deplCD = true ; this.piece.viewRanges()}
    	} else {
    		color = [0,0,190,50]
    		hoverColor = [100,100,190,50]
    		callback = function(){this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) ; this.piece.viewRanges()}
    	}

      for (var i = 0; i < depl.length; i++) {
        new HighlightCase(depl[i][0],depl[i][1],
    	       color,hoverColor,this,callback);
      }
    }
  }

  attack(target){ //Déclenche une attaque "de base" sur une pièce

	if (joueur[playerTurn].mana >= config.mana.atk){ //Uniquement si la pièce possède assez de mana
		if (target.callPassive("onAttacked",{source : this, dmg : this.atk}) == true) return true //Appel des passifs se délclenchant lors d'une attaque
		if (this.callPassive("onAttacking",{target : target, dmg : this.atk}) == true) return true //Si 'lun d'eux renvoie true, l'attaque est annulée

		damage(target,this,this.atk) //inflige des dégâts correspondants à la stat d'attaque de la pièce
		joueur[playerTurn].mana -= config.mana.atk //Retire à la pièce le mana correspondant au coût d'une attaque de base

		target.callPassive("onAttackedDone",{source : this, dmg : this.atk})
		this.callPassive("onAttackingDone",{target : target, dmg : this.atk})
	}

  }

	depl(cx,cy){ //Déclenche un déplacement
		if (joueur[playerTurn].mana >= config.mana.depl){ //Si la pièce a assez de mana
			this.move(cx,cy) //elle est déplacée à la position choisie (passée en paramètre de .depl)
			joueur[this.player].mana -= config.mana.depl; //Retire à la pièce le mana correspondant au coût d'un déplacement
			if (this.deplSpell){
				for (let i = 0; i < this.deplSpell.length; i++){
					if (this.deplSpell[i].active) this.deplSpell[i].cast({x: cx, y: cy})
				}
			}
		}
	}

  move(cx,cy,animation  = true) { //Déplace la pièce. Il ne s'agit pas nécessairement d'un déplacement "normal" de la pièce : la pièce peut être déplacée pour d'autres raisons
	this.callPassive("onMoved",{x: cx, y: cy}) //Appelle le passif de la pièce se déclenchant lors d'un mouvement
  	this.cx = cx;  //Modifie la position de la pièce
  	this.cy = cy;
    this.callPassive("onMovedDone",{x: cx, y: cy})

    if (animation) move(this,0.8,convertPx(cx),convertPx(cy)); //Déclenche une animation de mouvement, de la position de départ à la pisition d'arrivée
  }

  // Fonctions à redéfinir dans chaque classe piece : renvoient les cases sur lesquelles il est possible d'attaquer/se déplacer
  getDepl(board){
	 return [];
  }

  getAtkRange(board){
	 return [];
  }

  noManaError(x,y){ //Affiche, à une position spécifiée, un message d'erreur "not enough mana"
    {
      let manaTXT = new Text("msg",x,y,"Not\nenough\nmana","Arial",config.unit * 2,[0,0,255]) //Crée un texte bleu "not enough mana"
      applyFadeOut(manaTXT,manaTXT.color,255,0.5) //Le fait disparaître en fondu
    }
  }

	callPassive(passive,arg){ //Appelle un "passif" de la pièce. Les passifs sont des sorts se déclenchant d'eux mêmes à divers moments.
	//Il s'agit de méthodes "on________()" crées dans les classes de chaque pièce. Lors de chaque évènement pouvanr déclencher un passif,
	//cette méthode est appelée, en spécifiant le passif correspondant.
		if (typeof this[passive] == "function"){ //Si cette méthode existe
			return this[passive](arg); //la lance
		}
		if (this.addedPassive){
			for (let i = 0; i < this.addedPassive[passive].length; i++){
				this.addedPassive[passive][i](arg)
			}
		}
	}

	addPassive(event,passive){ //Ajoute un passif à la pièce
		//event : l'évènement durant lequel le passif se déclenchera ; passive : la fonction du passif
		this.addedPassive[event].push(passive)
	}

	startTurn(){ //a ne pas confondre avec le passif onStartTurn : fonctioné éxécutée au début de chaque tour
		this.deplCD = false; //Met les atkCD et deplCD à false, indiquant que ces actions sont disponibles
		this.atkCD = false;
		//Réinitialise les stats (les remet au valeurs de base de la pièce)
		this.atk = this.baseAtk;
		let prevMaxHP = this.maxHP;
		this.maxHP = this.baseHP;
		this.hp = this.hp * this.maxHP / prevMaxHP;
		for (var i = 0; i < this.spell.length; i++){
			if (this.spell[i].actualCooldown > 0) this.spell[i].actualCooldown--;
		}
		this.mp = this.baseMp;
		this.addedPassive = initAddedpassivesArrays()
		//Puis les recalcule en fonction des effets actifs (voir "class Effect()")
		for (var i = 0; i < this.effects.length; i++){
			this.effects[i].apply();
		}

		this.callPassive("onStartTurn"); //Appel de l'éventuel passif se déclanchant au début de chaque tour

	}

	applyEffect(duration,turn,end){ // Applique un effet à la pièce (voir "class Effect")
		this.effects.push(new Effect(this,duration,turn,end));
	}

	showStats() { //Affiche les caractéristiques de la pièce dans une fenêtre (fw.js)
		let expText = (this.level >= config.expLevels.length) ? "" :"/" + config.expLevels[this.level];
		let color = this.player ? "Black" : "White";
			this.elements = [
		  [ { type: "text", coord: { x: 0, y: 0 }, text: "Health Points: " + Math.floor(this.hp) + "/" + Math.floor(this.maxHP), size: config.unit*2, color: [210, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*2 }, text: "Attack Points: " + Math.floor(this.atk), size: config.unit*2, color: [255, 210, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*4 }, text: "Color: " + color, size: config.unit*2, color: [255, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*11.6 }, text: "Level: "+this.level, size: config.unit*2, color: [150,150,255] },
			{ type: "text", coord: { x: 0, y: config.unit*13.6 }, text: "Experience: "+this.exp + expText, size: config.unit*2, color: [150,150,255]}]
		];
		clearGUI("windows");
		new Window(config.hud.statsWindow.x, config.hud.statsWindow.y,config.hud.statsWindow.w,config.hud.statsWindow.h, "Stats", this.elements);
	}

	gainExp(exp){ //Ajoute de l'expérience à la pièce
		this.exp += exp //ajout de l'exp

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1);  //on teste si l'exp
																					//a dépassé un nouveau niveau
	}

	levelUp(){ //La pièce gagne un nouveau niveau
		this.level += 1

		let prevBaseAtk = this.baseAtk
		this.baseAtk *= 1.1 //Augmente l'attaque de base de la pièce
		this.atk = this.atk * this.baseAtk / prevBaseAtk //met à jour la valeur d'attaque actuelle

		let prevBaseHP = this.baseHP //Idem pour les HP
		this.baseHP *= 1.1
		this.maxHP = this.maxHP * this.baseHP / prevBaseHP
		this.hp = this.hp * this.baseHP / prevBaseHP

		for (var i = 0; i < this.spell.length; i++){ //Teste si un des sorts nécessite d'avoir le niveau nouvellement acquis
			if (this.spell[i].locked){
				if (typeof this.spell[i].locked == "number" && this.level >= this.spell[i].locked){
					this.spell[i].locked = false //Si oui, le débloque
				}
			}
		}

        let levelUpTXT = new Text("msg", convertPx(this.cx) + config.tileSize / 2, convertPx(this.cy) + config.tileSize / 2, "Level Up","Arial",config.unit * 4,[0,0,255])
        applyFadeOut(levelUpTXT,levelUpTXT.color,255,0.3) //Affiche un texte "level up" et le fait disparaitre en fondu

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1) //si l'exp a dépassé un autre niveau, on répète l'opération

	}


}

//Les classes suivantes sonrt les classes-pièces. Chacune hérite de la clase pièce, et définit une pièce particulière
//Ce sont ces classes qui seront instanciées pour créer une nouvelle pièce
class Pion extends Piece {
  constructor(x, y, player) {

    super(0, "Pion", 50, 120, x, y, player, 1, 60); //Appelle le constructeur de la classe parent, Piece, pour créer la pièce de base, avec les paramètres propres au pion

	  var direction = this.player //Initialise la kyojin (avancée), attribut propre au pion qui dépend de sa position sur le board
	  this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
	  let prevMaxHP = this.maxHP;
		this.maxHP += this.kyojin * (this.baseHP / 50) //Les stats du pion sont modifiées en fonction de cette valeur
		this.hp = this.hp * this.maxHP / prevMaxHP;
	  this.atk += this.baseAtk * (this.kyojin / config.nLig);

	let spell = [ //Crée le tableau contenant tous les sorts du Pion (voir "class Spell")
		new Spell("Vent Divin",8,1,img.spell.Pion[0],0,2,this, //Nouveau spell : on spécifie son nom, son icône, son coût, le niveau requis, ainsi que :
			function(){ //la fonciton éxécutée lors du clic sur l'icône du spell
				this.cast() //Pour ce spell, l'effet sera directement lancé
			},
			function(){ //la fonction correspondant à l'effet du spell
				var spell = this;
				var hpCost = 50;
				var board = examineBoard();
				var source = this.piece;
				if (spell.piece.hp > hpCost){
					selectPieces(piecesInCases(this.getRange(),board), //Pour chaque pièce dans la portée (tableau de cases) du sort, applique un callback
					   function(target){if (target.player != source.player)damage(target,spell.piece,20)}) //infligeant des dégâts
					damage(spell.piece,undefPiece,hpCost)
				}

			},
			function(){ //la fonction (facultative) retournant la portée du spell sous la forme d'un tableau de cases
				return caseInRangeZ(this.piece.cx,this.piece.cy,1)
			}
		),
		new Spell("Unity",8,3,img.spell.Pion[1],0,0,this,
			function(){
				let spell = this
				var pieces = []
				var board = examineBoard()
				selectPiecesConditional(piecesInCases(this.getRange(),board),
					function(piece){pieces.push(piece)},
					[function(piece){if (piece.player == spell.piece.player) return false ; return true}])
				startPieceSelectionHLC(pieces, [255,0,255,50], [255,0,255,100],
				function(selected){
					spell.cast(selected)
				})
			},
			function(selected){
				let spell = this
				let baseDmg = 20
				let ppDmg = 5 + this.piece.kyojin
				let c = 0

				selectPiecesConditional(piecesInCases(caseInRangeZ(this.piece.cx,this.piece.cy,3),examineBoard()),
					function(piece){c++},
					[function(piece){if (piece.player == spell.piece.player && piece.constructor.name == "Pion") return true ; return false}])

				let scaleDmg = c * ppDmg

				damage(selected,this.piece,baseDmg + scaleDmg)
			},
			function(){
				return caseInRangeZ(this.piece.cx,this.piece.cy,2)
			}
		),
		new Spell("Flash Wave",5,2,img.spell.Pion[2],0,0,this,
			function(){
				this.cast()
			},
			function(){
				let targets = piecesInCases( this.getRange(), examineBoard())
				for (var i = 0; i < targets.length; i++){  //on n'utilise pas selectPiecesConditional car l'action et la condition sont très simples
					if (targets[i].player != this.piece.player) damage(targets[i],this.piece,20 + this.piece.kyojin * 2)
				}
			},
			function() {return this.piece.getAtkRange()}

		)
    ];
	this.spell = spell;

  }

  getDepl(board) { //fonction renvoyant les cases où il est possible de se déplacer (propre à chaque type de pièce)
    var depl = [];
  	var startLine = ((this.player == 0) ? 1 : config.nLig - 2);
  	var direction = ((this.player == 0) ? 1 : -1);
  	var mp = (this.cy == startLine) ? this.mp + 2 : this.mp;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.cx,this.cy + ((i+1)*direction)) == false){break}
	  }

    return depl;
  }

  getAtkRange(){ //fonction renvoyant les cases où il est possible de se déplacer (propre à chaque type de pièce)
	var atk = [];
	var direction = ((this.player == 0) ? 1 : -1);
	var x,y;
	for (var i = -1; i < 2;i++){
		x = this.cx + i;
		y = this.cy + direction;
		if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
			atk.push([x,y]);
		}
	}
	return atk;
  }

	onStartTurn(){ //Passif se lançant au début de chaque tour
		var direction = this.player;
		//Recalcule la valeur d'avancée (kyojin) et les stats en fonction
		let prevMaxHP = this.maxHP;
		this.maxHP += this.kyojin * (this.baseHP / 50);
		this.hp = this.hp * this.maxHP / prevMaxHP;

		this.atk += this.baseAtk * (this.kyojin / config.nLig);
	}

	onMovedDone(){//Passif se lançant après chaque mouvement
		//Recalcule la valeur d'avancée (kyojin) et les stats en fonction
		var direction = this.player;
		let prevKyojin = this.kyojin;
		this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy);
		this.dKyojin = this.kyojin - prevKyojin;

		let prevMaxHP = this.maxHP;
		this.maxHP += this.dKyojin * (this.baseHP / 50);
		this.hp = this.hp * this.maxHP / prevMaxHP;

		this.atk += this.baseAtk * (this.dKyojin / config.nLig);

	}
}

class Tour extends Piece {
  constructor(x, y, player) {
    super(1, "Tour", 20,200, x, y, player, 5, 80);

	this.spell = [
		new Spell("Rise of the army",6,3,img.spell.Tour[0],0,0,this,
			function(){
				this.cast();
			},
			function(){
				selectPiecesConditional(piecesInCases(this.getRange(),examineBoard()),
					function(pion){
						pion.applyEffect(4,function(){this.piece.atk += 20})
					},
					[function(piece){if (piece.constructor.name == "Pion") return true}]
				)
			},
			function(){
				return caseInRangeZ(this.piece.cx,this.piece.cy,3)
			}
		),
		new Spell("Rise of the soldier",10,5,img.spell.Tour[1],0,false,this,
			function(){
				let cases = []
				var spell = this
				let board = examineBoard()
				selectCases(this.getRange(),function(x,y){
					if (!board[x][y]) cases.push([x,y])
				});
				startCasesSelectionHLC(cases, [255,0,255,50], [255,0,255,100],
					function(targetCase){
						spell.cast(targetCase)
					}
				)
			},
			function(targetCase){
				let pion = new Pion(targetCase.x, targetCase.y, this.piece.player)
				pion.applyEffect(4,0,function(){
					kill(this.piece,undefPiece)
				})
				pion.name = "Tower Soldier"
				joueur[this.piece.player].piece.push(pion)
			},
			function(){
				return caseInRangeZ(this.piece.cx,this.piece.cy,3)
			}

		),
		new Spell("Catapult",4,2,img.spell.Tour[2],0,false,this,
			function(){
				var spell = this

				let range = this.getRange()

				let inRange = piecesInCases(range,examineBoard())
				let targetPieces = []


				selectPieces(inRange,
					function(target){
						if (target.player != spell.piece.player){
							targetPieces.push(target)
						}
					}
				)

				startPieceSelectionHLC(targetPieces, [255,0,255,50], [255,0,255,100],
					function(target){
						spell.cast(target)
					}
				)

			},
			function(target){
				damage(target,this.piece,25)
			},
			function(){
				let range = []
				for (var i = -5; i < 6; i++){
					if (this.piece.cx + i < 0){
					continue
					} else if (this.piece.cx + i >= config.nCol) break

					if (i) range.push([this.piece.cx + i, this.piece.cy])
				}
				for (var i = -5; i < 6; i++){
					if (this.piece.cy + i < 0){
					       continue;
					} else if (this.piece.cy + i >= config.nLig) break

					if (i) range.push([this.piece.cx, this.piece.cy + i])
				}
				return range
			}
		)
	]
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
    super(2, "Fou", 50, 70, x, y, player, 5, 60);

// name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange

    this.spell = [
      new Spell("Madness", 3, 1, img.spell.Fou[0], 0, false, this,
        function(){
          let range = this.getRange();
          let board = examineBoard();
          let pos = [];

          for (let i = 0; i < range.length; i++) {
            if (range[i][0] && range[i][1] &&
                range[i][0] < config.nCol && range[i][1] < config.nLig &&
                !board[range[i][0]][range[i][1]]) pos.push([range[i][0], range[i][1]]);
          }

          let finalPos = Math.floor(Math.random() * pos.length);
          let coord = [pos[finalPos][0], pos[finalPos][1]];
          if (pos.length > 0) this.cast(coord);
        },
        function(coord){
          let board = examineBoard();
          this.piece.move(coord[0], coord[1], false);
          this.piece.viewRanges();
          let dmgRange = [[this.piece.cx + 1,this.piece.cy + 1]]
          //selectPieces(piecesInCases())
          for (let i = -1; i < 2; i++) {
            if (board[this.piece.cx + i][this.piece.cy] && board[this.piece.cx + i][this.piece.cy].player != this.piece.player &&
                board[this.piece.cx + i][this.piece.cy] != this.piece) damage(board[this.piece.cx + i][this.piece.cy], this.piece, 20);
            if (board[this.piece.cx][this.piece.cy + i] && board[this.piece.cx][this.piece.cy + i].player != this.piece.player &&
                board[this.piece.cx][this.piece.cy + i] != this.piece) damage(board[this.piece.cx][this.piece.cy + i], this.piece, 20);
          }
        },
        function(){
          return caseInRangeZ(this.piece.cx, this.piece.cy, 2);
        }
      ),
      new Spell("Echo", 5, 3, img.spell.Fou[1], 0, false, this,
        function(){
          let spell = this;
          let range = this.getRange();
          let board = examineBoard();
          let pieces = piecesInCases(range, board);
          let finalPieces = [];

          for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].player != this.piece.player) finalPieces.push(pieces[i]);
          }

          startPieceSelectionHLC(finalPieces, [255, 255, 150, 100], [255, 255, 150, 150],
            function(target){
              let origin = target;
              let targets = [];
              targets = caseInRangeZ(origin.cx, origin.cy, 1);
              targets = piecesInCases(targets, examineBoard());
              targets = filterElements(targets, function(piece){if (piece.player != spell.piece.player) {return true}});
              if (targets.length < 1) spell.cast([origin]);

              startPieceSelectionHLC(targets, [255, 255, 150, 100], [255, 255, 150, 150],
                function(selected){
                  spell.cast([origin, selected]);
                }
              );
            }
          );
        },
        function(targets){
          damage(targets[0], this.piece, this.piece.atk*0.9);
          if (targets.length > 1) damage(targets[1], this.piece, this.piece.atk*0.9);
        },
        function(){
          return caseInRangeZ(this.piece.cx, this.piece.cy, 4);
        }
      ),
      new Spell("Ultrasound", 4, 5, img.spell.Fou[2], 0, false, this,
        function(){

        },
        function(){
          let range = this.getRange();
        },
        function(){
          return caseInRangeZ(this.piece.cx, this.piece.cy, 3);
        }
      )
    ];
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

	onAttacked(arg){
		if (arg.dmg < this.hp/2){ //l'attaque reçue est faible (moins de la moitié des hp du fou)
			if (Math.random() * 100 > 50) {return false}
		}
	}


}

class Reine extends Piece {
	constructor(x, y, player) {
		super(3, "Reine", 120, 400, x, y, player, 5, 150);

		this.spell = [
			new Spell("Thunderbolt",8,3,img.spell.Reine[0],0,false,this,
				function(){


					startCasesSelectionHLC(range,color,hc,cb)
				},
				function(){

				},
				function(){
					let range = []
					let direction = ((this.piece.player == 0) ? 1 : -1);
					let y = 0
					for (let i = 1; i < 6; i++){
						y = this.piece.cy + (i * direction)
						if (isOnBoard(this.piece.cx, y)){
							range.push([this.piece.cx,y])
						} else {
							break
						}
					}

					return range
				}
			),
			new Spell("Meteor",10,6,img.spell.Reine[1],0,false,this,
				function(){
					let range = this.getRange()
					let spell = this

					startCasesSelectionHLC(range,[240,120,0,100],[240,120,0,150],
						function(selected){
							spell.cast(selected)
						}
					)
				},
				function(selected){
					let spell = this
					let board = examineBoard()
					let targetCases = caseInRangeZ(selected.x,selected.y,1)
						selectPieces(piecesInCases(targetCases,board),
							function(target){
								damage(target,spell.piece,50)
							}
						)
						if (board[selected.x][selected.y]) damage(board[selected.x][selected.y],this.piece,70)
				},
				function(){
					return caseInRangeZ(this.piece.cx,this.piece.cy,3,true)
				}
			)
		]
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
		super(4, "Cavalier", 80, 50, x, y, player,2, 80);

		this.spell = [
			new Spell("Stomp",6,2,img.spell.Cavalier[0],0,false,this,
				function(){
					this.active = true;
				},
				function(){
					var spell = this;
					var board = examineBoard();
					var source = this.piece;
					selectPieces(piecesInCases(this.getRange(),board), //Pour chaque pièce dans la portée (tableau de cases) du sort, applique un callback
						function(target){if (target.player != source.player) damage(target,spell.piece,20)}) //infligeant des dégâts
				},
				function(){ //la fonction (facultative) retournant la portée du spell sous la forme d'un tableau de cases
					return caseInRangeZ(this.piece.cx,this.piece.cy,1)
				}
			),
			new Spell("Chargez!",5,2,img.spell.Cavalier[1],0,false,this,
				function(){
					let spell = this;
					var targets = [];
					var board = examineBoard();
					selectPiecesConditional(piecesInCases(this.getRange(),board),
						function(piece){targets.push(piece)},
						[
							function(piece){
								if (piece.player == spell.piece.player) return false;
								let tx = spell.piece.cx + (piece.cx - spell.piece.cx) * 2;
								let ty = spell.piece.cy + (piece.cy - spell.piece.cy) * 2;
								if (isOnBoard(tx,ty)) if (board[tx][ty]) return false;
								return true;
							}
						]
					)
					startPieceSelectionHLC(targets, [255,0,255,50], [255,0,255,100],
						function(selected){
							spell.cast(selected)}
					)

				},
				function(target){
					let tx = this.piece.cx + (target.cx - this.piece.cx) * 2;
					let ty = this.piece.cy + (target.cy - this.piece.cy) * 2;
					damage(target,this.piece,this.piece.atk / 2)
					this.piece.move(tx,ty)
				},
				function(){
					let range = caseInRangeZ(this.piece.cx,this.piece.cy,1)
					return range
				}
			),
			new Spell("En Chasse",9,6,img.spell.Cavalier[2],0,false,this,
				function(){
					this.cast();
				},
				function(){
					selectPieces(piecesInCases(this.getRange(),examineBoard()),
						function(pion){
							pion.applyEffect(4,function(){this.piece.mp += 1})
						}
					)
				},
				function(){
					return caseInRangeZ(this.piece.cx,this.piece.cy,3)
				}
			)
		]

		this.deplSpell = [this.spell[0]]

	}

	onKilling(){
		this.deplCD = false
		if (this.spell[2].actualCooldown > 0) this.spell[2].actualCooldown -= 1
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
    super(5, "Roi", 30, 400, x, y, player, 2, 0);

// name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange

    this.spell = [
      new Spell("Arrêtez De Vous Battez", 7, 5, img.spell.Roi[0], 0, false, this,
        function(){
          this.cast();
        },
        function(){
          let range = this.getRange();
          let board = examineBoard();
          let pieces = piecesInCases(range, board);

          for (let i = 0; i < pieces.length; i++) {
            pieces[i].hp += 15;
            if (!pieces[i].maxHP && pieces[i].hp > pieces[i].baseHP) pieces[i].hp = pieces[i].baseHP;
            if (pieces[i].maxHP && pieces[i].hp > pieces[i].maxHP) pieces[i].hp = pieces[i].maxHP;
          }
        },
        function(){
          return caseInRangeZ(this.piece.cx, this.piece.cy, 2);
        }
      ),
      new Spell("Colère Royale", 1, 10, img.spell.Roi[1], 0, false, this,
        function(){
          this.cast();
        },
        function(){
          let range = this.getRange();
          let board = examineBoard();
          let pieces = piecesInCases(range, board);
          pieces[Math.floor(Math.random() * pieces.length)].hp -= 2;
        },
        function(){
          let ennemy = [];
          let board = examineBoard();

          for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
              if (board[i][j] && board[i][j].player != this.piece.player) ennemy.push([i, j]);
            }
          }

          return ennemy;
        }
      )
    ]
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

  onStartTurn() {
    let king = this;
    let range = caseInRangeZ(this.cx, this.cy, 1);
    let pieces = piecesInCases(range, examineBoard());
    let allies = filterElements(pieces, function(piece){if (piece.player == king.player) return true});
    if (this.hp < this.baseHP * 20 / 100) {
      for (let i = 0; i < allies.length; i++) {
        allies[i].atk *= 110 / 100;
      }
    }
  }

  onDying(killer){ //Passif se lançant lorsque cette pièce meurt : indique que le joueur ayant tué le Roi à gagné
    victory = joueur[1-this.player];
  }

}

class PrePiece { //Les prePiece sont des objets "prévoyant" une pièce : chaque prePiece indique une future pièce qui sera créee au début de la partie
	//les prePieces qu'un joueur possède avant le début de la partie déterminent dont les pièces qu'il possèdera lorsque la partie se lancera
  constructor(Piece,cx,cy,player){ //Une prePieces ne contient comme attribut que
    this.Piece = Piece; //La classe de la pièce à créer
    this.cx = cx; //La position de la future pièce
    this.cy = cy;
    this.player = player; //Le joueur auquel elle appartient
  }

  summon(){ //Crée une pièce (réelle) à partir de cette prePiece
    joueur[this.player].piece.push(new this.Piece(this.cx,this.cy,this.player));
  }

}

{ //création du tableau des classes
  var pieceClass = [Pion,Tour,Fou,Reine,Cavalier,Roi] //Contient les classes de tous les types de pièces
}

class StaticImage { //Classe définissant un objet graphique qui affichera une simple image
  constructor(gui,img,x,y,w = undefined,h = undefined){
    this.x = x //Définition de ses coordonnées
    this.y = y
    this.w = w
    this.h = h
    this.img = img
    this.gui = gui //Définition du champ de l'objet-GUI (chessGUI) dans lequel elle se trouvera

    chessGUI[gui].push(this) //Ajoute l'objet au tableau de chessGUI (élément de GUI) spécifié ('gui')
  }

  draw(){ //Affiche l'image (si l'objet se trouve dans un tableau de chessGUI, cette méthode sera lancée à chaque draw)
    image(this.img,this.x,this.y,this.w,this.h)
  }

}

class Button { //Classe définissant un objet graphique qui affichera un bouton
  constructor(gui,img,x,y,w,h,hovercallback,callback) {
    this.x = x; //Définition de ses coordonées
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img; //Définition de son image
    this.hovercallback = hovercallback; //Définition de la fonction éxécutée en même temps que draw lorsque la souris se trouve sur le bouton
    this.callback = callback; //Définition de la fonction éxécutée lorsque que l'on clique sur le bouton
    this.gui = gui;

    chessGUI[gui].push(this); //Ajoute l'objet au tableau de chessGUI (élément de GUI) spécifié ('gui')
  }

  draw() { //Affiche le bouton
    image(this.img, //Affiche l'image
          this.x, this.y,
          this.w, this.h);
          if (typeof this.hovercallback == "function" && isHovered(this.x,this.y,this.w,this.h)){ //Si la souris est sur le bouton, lance le "hovercallbcak"
            this.hovercallback()
          }
  }

  onLeftClick() { //Fonction réagissant au clic : si l'objet se trouve dans un tableau de chessGUI, cette méthode sera lancée à chaque clic
     if (typeof this.callback == "function" && isHovered(this.x,this.y,this.w,this.h)) { //Si la souris est sur le bouton
       this.callback(); //on appelle le callback du bouton
    }
  }
}

class HighlightCase { //Classe définissant un objet graphique qui affichera un rectangle coloré sur une case, et fonctionnera comme un bouton
  constructor(xc,yc,color,hovercolor,piece,callback) {
    this.x = xc; //Définition de la position en cases
    this.y = yc;
    this.color = color; //Définition de la couleur normale
    this.hovercolor = hovercolor; //Définition de la couleur lorsque la souris est sur la case
    this.callback = callback; //Défintion de la fonction éxécutée lors d'un clic sur la case
    this.piece = piece;

    chessGUI.highlightCase.push(this); //Ajout de l'objet à l'élément de GUI (tableau de chessGUI) spécifié ('gui')
  }

  draw() { //Affiche l'objet
    if (isCaseHovered(this.x,this.y)) //Si la souris est sur la case
    { fill(this.hovercolor); } else //La couleur d'affichage sera la hover color
    { fill(this.color); } //Sinon, ce sera la couleur de base
    rect(convertPx(this.x),convertPx(this.y), //Affiche un rectangle de la même forme/taille que les cases, sur la case correspondant à la position
    config.tileSize,config.tileSize,
    config.border);
  }

  onLeftClick() { //Fonction réagissant a clic
     if (isCaseHovered(this.x,this.y)) {//si la souris est sur la case
      clearGUI("highlightCase") //supprime toutes les HighlighCase
      this.callback();  //Appelle le callback de la pièce
      return true //si un onLeftClick renvoie true, alors on quitte la boucle qui teste les onLeftClick() de tous les éléments
      //cela permet d'éviter que plusieurs éléments réagissent au même clic
    }
  }
}


class Text { //Classe définissant un objet graphique qui affichera un texte
  constructor(gui,x,y,text,font,size,color,xalign = CENTER,yalign = CENTER){
    this.x = x; //Définition de la position
    this.y = y;
    this.text = text; //texte à afficher
    this.color = color; //couleur
    this.gui = gui
  	this.font = font //police de caractère
	this.size = size //taille de police
    this.xalign = xalign //alignement par rapport à la position
    this.yalign = yalign

    chessGUI[gui].push(this)
  }

  draw(){ //affiche l'objet
    textFont(this.font) //paramétrage du prochain texte affiché en fcontion des propriétés de l'objet
    textSize(this.size)
    textAlign(this.xalign,this.yalign)
    fill(this.color)
    text(this.text,this.x,this.y) //affiche le texte
  }

  destroy(){ //supprime le texte du tableau de chessGUI dont il fait partie
    chessGUI[this.gui].spliceItem(this)
  }
}

class Animated { //Objet se liant à une propriété d'un autre objet, et modifiant cette propriété au cours du temps
  constructor(object,property,speed,max = NaN,reachMaxCallback = 0){
    this.object = object; //définition de l'objet sur lequel agir
    this.property = property; //définition de la propriété sur laquelle agir
    this.speed = speed; //vitesse de variation (valeur absolue)
    this.max = max; //valeur à atteindre
    this.reachMaxCallback = reachMaxCallback //fonction à éxécuter lorsque la valeur max est atteinte

    this.direction = Math.sign(speed); //calcul du sens de variation
    this.startVal = this.object[this.property]; //enregistrement du moment où l'animation a commencé
    this.lastTime = actTime;
    this.val;

  }

  update(){ //met à jour la propriété en fonction du temps
    var time = actTime - this.lastTime;
    var val = this.object[this.property] + deltaVarSpeed(time,this.speed);

    this.object[this.property] = val;

    if (this.max != NaN && typeof this.reachMaxCallback == "function"){ //si un max est défini et s'il est atteint
      if (val * this.direction >= this.max * this.direction){
          this.reachMaxCallback(this.object,this.property); //appelle le reachMaxCallbacl
      }
    }
    this.lastTime = actTime;
  }


}

class FadeOut { //Animation à appliquer à un objet graphique, qui va modifier sa valeur d'alpha (il doit donc avoir un atribut '.color')
  constructor(object,rawColor,initAlpha,speed){
    this.object = object //objet
    this.rawColor = rawColor //couleur d'origine
    this.alpha = initAlpha //alpha d'origine
    this.speed = speed  //vitesse de disparition (°alpha/ms)
    this.animation = new Animated(this,"alpha",-speed,0, //l'objet fadeOut, contiendra un objet animated qui mettra à jour le fadeOut
    function(obj){obj.object.destroy()})

    this.object.fadeOut = this;

    this.object.staticDraw = this.object.draw; //Modifie le draw de l'objet pour que celui-ci appelle la méthode update du fadeOut
    this.object.draw = function(){this.fadeOut.update() ; this.staticDraw()}
  }

  update(){ //Modifie l'alpha de l'objet, c'est à dire objet.color[3] (avec une couleur stockée sous forme de tableau)
    this.animation.update() //Met à jour l'animation qui agit sur la valeur "alpha" du fadeOut
    this.object.color = [this.rawColor[0],this.rawColor[1],this.rawColor[2],this.alpha]; //modifie la couleur de l'objet en y ajoutant cet alpha
  }

}

class Movement { //Animation à appliquer à un objet graphique pour le déplacer
  constructor(object,speed,xTarget,yTarget){
    this.object = object //objet
    this.speed = speed  //vitesse en px/ms
    this.xTarget = xTarget //position à atteindre
    this.yTarget = yTarget

    this.xReach = false //booléens indiquant si la position a été atteinte, en x ou en y
    this.yReach = false
	//attributs générés automatiquement
    this.x = object.x //position actuelle
    this.y = object.y
    var dx = xTarget - object.x //distance à parcourir
    var dy = yTarget - object.y
    var dist = Math.sqrt(Math.pow(dx,2)+pow(dy,2));
    var vx = (dx / dist) * speed //vitesse x et y
    var vy = (dy / dist) * speed

    this.xAnimation = new Animated(this,"x",vx,xTarget, //crée une animation pour le x
      function(mov){mov.xReach = true ; if (mov.yReach) mov.end()})
    this.yAnimation = new Animated(this,"y",vy,yTarget, //et une autre pour le y
      function(mov){mov.yReach = true ; if (mov.xReach) mov.end()})


    if (object.movement) object.movement.destroy()
    this.object.movement = this

    this.object.staticDraw = this.object.draw
    this.object.draw = function(){this.movement.update() ; this.staticDraw()} //Modifie le draw de l'objet pour que celui-ci appelle la méthode update du fadeOut
  }

  update(){//met à jour la position de l'objet
    this.xAnimation.update(); //met à jour les animations agissant sur le x et l'y de l'objet mouvement
    this.yAnimation.update();
    this.object.x = this.x; //le x et le y de l'objet mouvement deviennent la position de l'objet
    this.object.y = this.y;
  }

  destroy(){ //supprime le mouvement
    this.object.draw = this.object.staticDraw; this.object.movement = 0;
  }

  end(){ //fin du mouvement (généralement quand la position d'arrivée est atteinte)
    this.object.x = this.xTarget; //place l'objet sur la positiond d'arrivée exacte (évite les décalages, liés aux arrondis par ex)
    this.object.y = this.yTarget;
    this.destroy(); //supprime l'objet mouvement
  }

}

class Spell { //Classe définissant un sort d'une pièce
  constructor(name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange){
    this.name = name; //nom
    this.manaCost = manaCost; //coût en mana
    this.img = img; //icône
    this.helpImg = helpImg; //*non-uilisé*
    this.locked = baseLocked; //disponibilité au début de la partie : true si bloqué, un nombre si on veut le bloquer jusqu'à ce que la pièce atteigne le niveau correspondant
    this.onUsed = onUsed; //fonction éxécutée au clic sur l'icône
    this.effect = effect; //effet du sort : peut être lancé directement lors du clic, ou après
  	this.getRange = getRange; //fonction donnant les cases su lesquelles le spell peut agir (s'il agit sur des cases définies)
  	this.piece = piece; //pièce propriétaire
  	this.cooldown = cooldown; //délai de récupération
  	this.actualCooldown = 0; //récupération actuelle
  }

  cast(arg){ //lance le spell (sera a priori appelée à un moment où un autre dans onUsed() ) :
    if (joueur[this.piece.player].mana >= this.manaCost){ //si le joueur a assez de mana
		this.effect(arg) //éxécute l'effet
		joueur[this.piece.player].mana -= this.manaCost; //retire le mana
		this.actualCooldown = this.cooldown //indique qu'il reste un certain nombre de tour avant de pouvoir l'utiliser
	}
  }

}

class SpellIcon extends Button { //icône des spells; hérite des simples boutons
	constructor(x,y,w,h,spell){ //on sépcifie uniquement les coordonnées et le spell correspondant
		super("pieceHUD",spell.img,x,y,w,h, //crée un bouton avec les coordonées spécifiées, et comme image l'icône du spell spécifié
		function(){ //comme hovercallback, une fonction affichant des infos sur le spell (qui seront donc affichées qua la souris est sur l'icône)
			textSize(config.hud.spellInfo.size)
			textFont("Verdana");
			textAlign(LEFT,TOP);
			fill(255);
			text(this.spell.name, config.hud.spellInfo.x, config.hud.spellInfo.y); //le nom du sort
			fill(150,150,150);
			text("Cooldown: " + this.spell.cooldown, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size); //son délai de récupération
			fill(150,150,255);
			text("Mana cost: " + this.spell.manaCost, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size * 2); //son coût

			if (this.spell.getRange){ //des rectangles sur les cases faisant partie de la portée du sort
				let range = this.spell.getRange();
				for (var i = 0; i < range.length; i++){
					fill(255,120,120,100);
					rect(convertPx(range[i][0]),convertPx(range[i][1]),config.tileSize,config.tileSize,config.border);
				}
			}
		},
		function(){ //callback du bouton :
			if (guiState == ""){ //si la GUI est à son état normal (aucune opération particulière en cours)
				if(joueur[this.spell.piece.player].mana >= this.spell.manaCost){ //si le joueur a assez de mana
					if (this.spell.actualCooldown == 0 && !this.spell.locked){ //et si le spell n'est pas en récupération
						this.spell.onUsed(this.spell); //utilisation du spell
					}
				} else {
					this.spell.piece.noManaError(this.x + this.w/2, this.y + this.h/2); // si pas assez de mana, affichage de l'erreur "not enough mana" (voir "manaError()")
				}
			}
		});

		this.spell = spell;
		this.baseDraw = this.draw;

		this.draw = function(){ //Affiche l'icône
			this.baseDraw() //draw de base du bouton (gère notament le hovercallback)
			if (this.spell.actualCooldown || this.spell.locked){ //si le spell est bloqué ou en récupération, le grise
				fill([0,0,0,150])
				rect(this.x,this.y,this.w,this.h)
				fill(255)
				textAlign(CENTER,CENTER) ; textSize(this.h * 0.8)
				if (this.spell.actualCooldown) text(this.spell.actualCooldown,this.x + this.w/2, this.y + this.h/2) //si en récupération, affiche le nombre de tours restants
			}
			if (this.spell.active){
				fill(255,255,255,100);
				rect(this.x,this.y,this.w,this.h);
			}
		}
	}
}



class Effect { //classe représentant les effets sur la durée appliqués aux pièces. A ajouter au tableau .effect d'une pièce pour lui appliquer un effet
	//un effet contient une fonction qui sera appelée à chaque tour, pour s'assurer que l'effet est présent de manière continue, jusqu'à un certain nombre de tour
	constructor(piece,duration,turnEffect = 0,endEffect = 0,direct = true){
		this.piece = piece; //pièce sur laquelle l'effet agira
		this.turnEffect = turnEffect; //effet continu : sera lancé à chaque début de tour (souvent pour modifier les stats après leur réinitialisation)
		this.endEffect = endEffect; //fcontion à éxécuter lorsque l'effet se termine
		this.duration = duration; //durée de l'effet en tours
		this.remaining = duration;

		if (direct && this.turnEffect) this.turnEffect(); //si on a précisé que l'effet était présent dès son applicaiton, on lance son effet continu
	}

	apply(){ //applique l'effet : sera lancé à chaque début de tour
		this.remaining--;
		if (this.remaining == 0){ //s'il arrive à sa fin
			if(this.endEffect) this.endEffect(); //lance la fonction de fin
			this.destroy(); //puis le supprime
		}else{
			if (this.turnEffect) this.turnEffect(); //sinon, lance sa fonction d'effet continu
		}
	}

	destroy(){
		this.piece.effects.spliceItem(this); //supprime l'effet du tableau piece.effects
	}
}

// endClass ----------

// reset function

function startTitle(){ //fonction inialisant l'écran-titre
  if (soundPreLoad()) sEffects[3].play(); //charge les sons ; joue la musique
  joueur = [new Joueur("blanc","Gilbert"), new Joueur("noir","Patrick")]; //crée les deux joueurs de base
  initPrePieces(); //crée leurs prePieces de base
  clearGUI();
  new StaticImage("background",img.title[0],0,0,config.canvasW,config.canvasH) //crée une image statique : l'image de fond
  titleView.mainPage(); //Affiche les éléments de la page d'accueil
}

function startGame() { //lance la partie en elle-même

	d = new Date(); //initialise le premier temps
	actTime = d.getTime();

	clearGUI(); //vide tous les éléments de GUI
	new StaticImage("background",config.background, 0, 0, config.canvasW, config.canvasH); //Crée une image fixe : l'image de fond
  {let hudBG = {}; //crée un objet graphique affichant un simple rectangle derrière l'échiquier et le HUD
    hudBG.draw = function() {
      fill(80, 80, 80, 200); rect(0, 0, config.boardW + config.hud.manaGauge.w + config.border * 3, config.canvasH);
    }
  chessGUI.background.push(hudBG);} //l'ajoute à l'élément de GUI 'background'
	{
    let chessBoard = {draw : drawBoard} //crée un objet graphique qui affichera simplement l'échiquier via drawBoard()
	  chessGUI.background.push(chessBoard)
  }

	new Button("hud",img.HUD[0],config.hud.button.x,config.hud.button.y,config.hud.button.w,config.hud.button.h, //crée le bouton de fin de tour
		function(){fill([255,255,255,50]) ; rect(this.x,this.y,this.w,this.h,config.unit)},
		function(){joueur[1 - playerTurn].startTurn()}); //son callback démarre le tour de l'adversaire

	{
    let manaGauge = config.hud.manaGauge; //création d'un objet graphique qui affichera simplement la barre de mana du joueur
	manaGauge.draw = function(){
	   fill(200,200,255);
	   rect(this.x+1,this.y+1,this.w-1,this.h-1);
	   fill(80,80,255);
	   rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h);
	   textAlign(LEFT, CENTER); textSize(config.unit * 4); fill(255);}
	chessGUI.hud.push(manaGauge)
  }

	{ //création d'un objet graphique qui affichera un bouton (on aurait pu faire avec new Button())
    let info = config.hud.info;
		info.draw = function() { //affiche l'image du bouton, grisée si aucune pièce n'est sélectionnée
			image(img.HUD[1], config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h);
			if (!selectedPiece) { fill(50, 50, 50, 180); rect(config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h, config.unit/4);
			} else { if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/4)}}
		}
		info.onLeftClick = function(){ //lorsque l'on clique, si une pièce est sélectionnée
			if (selectedPiece) {
				if (isObjectHovered(this)) {
					selectedPiece.showStats(); //on affiche les caractéristique de cette pièce
					this.ftsioCounter ++; if (this.ftsioCounter >= 25) fuckThisShitImOut() //shhhhh

				} else {this.ftsioCounter = 0}
			}
		}
		chessGUI.hud.push(info);
	}

	for (let i = 0; i < joueur.length; i++){
		joueur[i].initGame(); //pour chaque joueur, on lance la méthode préparant le joueur pour la partie (voir "class Joueur")
	}

  { //création du bouton permettant de couper la musique
    let mute = config.hud.mute;
    mute.draw = function() { //affiche simplement l'image du bouton
      let tmp = sEffects[3].volume == 0 ? img.HUD[3] : img.HUD[2];
      image(tmp, this.x, this.y, this.w, this.h);
      if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/1.9)}
    }
    mute.onLeftClick = function() { //au clic, si le clic est effectué sur ce bouton évidemment, on met le volumme de la musique à 0 ou à son volumme d'origine
      if (isObjectHovered(this)) sEffects[3].volume = 0.5 - sEffects[3].volume;
    }

    chessGUI.hud.push(mute);
  }

	undefPiece = Piece.prototype ; undefPiece.name = "undef"; //création d'une pièce vide, utile pour le fonctions demandant une pièce en paramètre mais que l'on veut lancer sans préciser de pièce particulière
	playerTurn = 0; //Le joueur en train de jouer est le joueur 0
	guiElements.player_arrow = new StaticImage("hud",img.HUD[playerTurn ? 4 : 5],config.hud.manaGauge.x + config.border, config.hud.manaGauge.y + config.border, config.hud.manaGauge.h - config.border*2, config.hud.manaGauge.h - config.border*2);
  guiElements.player_arrow.update = function() { this.img = img.HUD[playerTurn ? 5 : 4] }
	initBoard(); //Crée les pièces en fonction des prePieces des deux joueurs
	joueur[playerTurn].startTurn(); //Lance la méthode de début de tour du joueur commençant à jouer
}
// -------

// main functions
function setup() { //Lancée par p5 au lancement du programme : c'est ici qu commence l'éxécution du programme
	noStroke(); //Les formes dessinées n'auront jamais de stroke
	cursor("img/cursor.png"); //Changement de l'image du curseur
	createCanvas(config.canvasW, config.canvasH); //Création du canvas où on va dessiner
	config.update()

	startTitle(); //Lancement de l'écran-titre

}

function draw() { //Fonction lancée par p5 à chaque frame

  d = new Date(); //Récupération du temps actuel
  actTime = d.getTime();
	//Affichage des objets de chessGUI :
  for (var element in chessGUI) { //pour chaque attribut de l'objet chessGUI (=élement de GUI = tableau)
    if (chessGUI.hasOwnProperty(element)) { //()vérification que l'attribut actuel ne fait pas partie du prototype
      for (var i = 0; i < chessGUI[element].length; i++) { //Pour chaque champ du tableau
        if (typeof chessGUI[element][i].draw === "function"){ //Si l'objet contenu dans ce champ a un méthode draw()
          chessGUI[element][i].draw(); //On la lance
        }
      }
    }
  }

  if (victory){ //Si la victoire a été décidée
    alert("Victoire de " + victory.name) //On affiche le vainquer
    startGame() //On relance la partie
    victory = false //On réinitialise la variable indiquant la victoire d'un joueur
  }

  if (debug) {
    fill(255); textSize(20);
    text(floor(frameRate()), 20, 20);
  }
}

function mouseClicked(){ //Fonction lancée par p5 à chaque clic
  if (mouseButton == LEFT){ //Si le clic est un clic gauche
    clickLoop: for (var element in chessGUI){ // pour chaque attribut de l'objet chessGUI (=élement de GUI = tableau)
      if (chessGUI.hasOwnProperty(element)){//()vérification que l'attribut actuel ne fait pas partie du prototype
        for (var i = 0; i < chessGUI[element].length; i++){ //Pour chaque champ du tableau
          if (typeof chessGUI[element][i].onLeftClick === "function"){ //Si l'objet contenu dans ce champ a un méthode draw()
            if (chessGUI[element][i].onLeftClick()) break clickLoop; //On la lance -> si elle a retourné true, on quitte la boucle (permet d'annuler les autres interactions qui pourraient ne pas être à jour)
          }
        }
      }
    }
    if (sEffects) sEffects[Math.floor(random(0,3))].play(); //on joue l'un des 3 sons de clic
  }
}

var fpunch = 0, isFacepunch = false;

function keyPressed() { //hehe
  if (keyCode == 70 && !fpunch) fpunch = 1;                                                   //f
  if (keyCode == 65 && fpunch == 1) fpunch = 2;                                               //a
  if (keyCode == 67 && fpunch == 2) fpunch = 3;                                               //c
  if (keyCode == 69 && fpunch == 3) fpunch = 4;                                               //e
  if (keyCode == 80 && fpunch == 4) fpunch = 5;                                               //p
  if (keyCode == 85 && fpunch == 5) fpunch = 6;                                               //u
  if (keyCode == 78 && fpunch == 6) fpunch = 7;                                               //n
  if (keyCode == 67 && fpunch == 7) fpunch = 8;                                               //c
  if (keyCode == 72 && fpunch == 8) {                                                         //h
    fpunch = 0; isFacepunch = isFacepunch ? false : true;
    if (isFacepunch) facepunch();
    if (!isFacepunch) deFacepunch();
  }
}
// end of main functions
