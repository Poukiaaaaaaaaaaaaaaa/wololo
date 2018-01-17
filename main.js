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
  mana: { depl: 3, atk: 5, newPiece: 3 },  //coûts en mana des différentes actions de base
  maxMana: 20,  //mana maximal
  gold: 100,   //monnaie au début de la partie. Au final, n'est pas utilisé (le sera ... un jour)
  hud: {},  //objet qui contiendra des informations sur différents éléments du hud
  background: 0,  //couleur de background
  expLevels : [100,250,500]   //valeurs d'expérience auxquelles les pièces gagnent un niveau
}


{// Définition de certains éléments de configuration calculés
  config.boardS = config.canvasH > config.canvasW ? config.canvasW : config.canvasH;
  config.unit = config.boardS/100;  //unité de distance dépendant de la taille du plateau
  config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
  config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
  config.boardW = config.nCol * config.tileSize + config.border * (config.nCol+1);
  config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6}
  config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16}
  config.hud.playerTurnText = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22}
  config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8}
  config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9}
  config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5}
  config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.h + config.border * 2, size: config.unit * 2}
  config.hud.mute = {x: config.boardW + config.border * 3 + config.hud.info.w, y: config.hud.info.y, w: config.hud.info.h, h: config.hud.info.h}

	//coordonnées des éléments du HUD
  config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6} //jauge de mana
  config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16 } //bouton de fin de tour
  config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8} //icônes des sorts
  config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9} //bouton d'infomartions sur les pièces
  config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5} //fenêtre affichant les infos
  config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.spellSize + config.border * 2, size: config.unit * 2} //zone où sont affichées les infos sur chaque pièce
  config.hud.playerTurnText = {x: config.hud.info.x + config.hud.info.w + config.border, y: config.hud.info.y + config.hud.info.h - config.unit * 4 , size: config.unit * 4} //texte indiquant le joueur en train de jouer
}
// endConfig -------------

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
//sur le moment ça m'avait l'air utile mais je crois que cette fonction sert à rien au final
	var board = []; //cr�e un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau à deux dimensions avec une entr�e = une case
	}

  for (var i = 0; i < chessGUI.highlightCase.length;i++){
    var hlc = chessGUI.highlightCase[i]		//r�cup�re les coordonn�es de chaque piéce et place une référence à cette piéce
    board[hlc.x][hlc.y] = hlc		//dans la case correspodante dans le tableau
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
	var dist
	var xStart = (cx - range >= 0) ? cx - range  : 0  //calcul des coordonnées du carré (de manière à ce qu'il ne sorte pas de l'échiquier)
	var xEnd = (cx + range < config.nCol) ? cx + range : config.nCol - 1
	var yStart = (cy - range >= 0) ? cy - range  : 0
	var yEnd = (cy + range < config.nLig) ? cy + range : config.nLig - 1

	for (var i = xStart; i <= xEnd; i++){ //Pour chacune des cases du carré
		for (var j = yStart ; j <= yEnd ; j++){
			dist =  Math.sqrt(Math.pow(i - cx,2)+pow(j - cy,2)); //On teste si sa distance (distance entre les centres) avec la case d'origine est en dessous de la portée max
			if (Math.round(dist) <= range && !(i == cx && j == cy && !includeCenter) ) {
				cases.push([i,j]) //Si c'est le cas on l'ajoute au tableau cases
			}
		}
	}

return cases //que l'on renvoie

}

function piecesInCases(cases,board){ //renvoie un tableau contenant les pièces se trouvant sur les cases contenues le tableau cases
	var x,y
	var pieces = []
	for (var i = 0; i < cases.length; i++){
		x = cases[i][0] ; y = cases[i][1] //Pour chacune des cases, on teste si elle contient une pièce, grâce à l'objet board (passé en paramètre, obtenu via examineBoard() ) contenant, pour chaque case,
		if (board[x][y]) pieces.push(board[x][y]) //undefined s'il n'y a pas de pièce, ou la pièce s'il y en a une. Si oui, on ajoute cette pièce au tableau pices
	}
	return pieces //que l'on renvoie
}

function selectCases(cases,callback){ //appelle un même callback(x,y) avec les coordonnées des cases du tableau cases
	for (var i = 0 ; i < cases.length ; i++){
		callback(cases[i][0],cases[i][1])
	}
}

function selectPieces(pieces,callback){ //appelle un même callback(piece) pour chaque pièce du tableau pieces
	for (var i = 0 ; i < pieces.length ; i++){
		callback(pieces[i])
	}
}

function selectPiecesConditional(pieces,callback,condition = []){
  //Appelle un même callback(piece) pour chaque pièce du tableau pieces qui remplit les conditions
  //les conditions sont des fonctions prenant en paramètre piece[i] et renvoient true ou false
	pieceLoop:for (var i = 0 ; i < pieces.length ; i++){ //Pour chaque pièce
		for (var j = 0 ; j < condition.length; j++){ //On teste toutes les conditions (array condition)
			if (!condition[j](pieces[i])) continue pieceLoop
		}
		callback(pieces[i]) //Si elles sont toutes vérifiées, on éxécute le callback
	}
}

//Fonctions de sélection via HighlightCase : crée des HighlightCase sur les objets pouvant être sélectionés, et éxécute un callback quand l'utilisateur a cliqué sur l'un d'eux
function startPieceSelectionHLC(pieces, color, hoverColor, callback){ //démarre un processus de sélection de pièce (pieces), en utilisant des cases colorées (voir "class HighlightCase")
//pieces : pièces pouvant être sélecctionnées, color et hovercolor : couleurs des HighlightCase, callback: fonction éxécutée lorsqu'une pièce est
  if (pieces.length > 0){ //Si aucune pièce n'est dans la liste des pièces, rien ne se passe
    endSelectionHLC() //Si une sélection était en cours, elle se termine
    guiState = "selection" //le GUISTATE passe à "selection" : toutes les interactions des objets de la GUI qui nécessitent que la GUI soient à son état normal ne fonctionneront pas
    clearGUI("highlightCase") //On supprime toutes les cases colorées.

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
		move(objects[i],0.2,objects[i].x + Math.cos(targetAngle) * 2000, objects[i].y + Math.sin(targetAngle) * 2000)
	}

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
    guiElements = {}, //un objet contenant certains objet p55 dont un veut conserver un accès rapide
    isPlaying = false, //variable indiquant si la partie est en cours (obsolète ?)
    winIMG = [], //images utilisées par les fenètres
    guiState = "", //représente l'action en cours (qui détermine comment certains éléments se comportent)
    victory = false,
	  undefPiece,
    sEffects = []; //array contenant tous les effets audio

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
  config.background = loadImage("img/background.png");
  img.HUD[0] = loadImage("img/HUD/end_turn.png");
  img.HUD[1] = loadImage("img/HUD/info.png");
  img.HUD[2] = loadImage("img/HUD/unmuted.png");
  img.HUD[3] = loadImage("img/HUD/muted.png");
  img.title[0] = loadImage("img/title_background.png")
  img.title[1] = loadImage("img/logo.png")
  img.title[2] = loadImage("img/playButton.png")
  img.title[3] = loadImage("img/edit.png")
  img.title[4] = loadImage("img/settings.png")
  img.title[5] = loadImage("img/backToMenu.png")
  img.title[6] = loadImage("img/help.png")

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
  img.spell.Pion[0] = loadImage("img/spells/Pion/0.png");
  img.spell.Pion[1] = loadImage("img/spells/Pion/1.png");
  img.spell.Pion[2] = loadImage("img/spells/Pion/2.png");
  img.spell.Tour = [];
  img.spell.Tour[0] = loadImage("img/spells/Tour/0.png");
  img.spell.Tour[1] = loadImage("img/spells/Tour/1.png");
  img.spell.Tour[2] = loadImage("img/spells/Tour/2.png");

/*
   for (var i = 0; i < pieceClass.length; i++){
    img.spell[pieceClass[i]] = [];
    while (true) {
      loadImage("img/"+)
    }
  }*/

  winIMG[0] = loadImage("img/Window/window_left.png");
  winIMG[1] = loadImage("img/Window/window_right.png");
}
// endImages -------------

function soundPreLoad() {
  sEffects[0] = new Audio("audio/click1.wav");
  sEffects[1] = new Audio("audio/click2.wav");
  sEffects[2] = new Audio("audio/click3.wav");
  sEffects[3] = new Audio("audio/loop.mp3"); sEffects[3].loop = true;
  sEffects[3].volume = 0.5;
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

		guiElements.playerTurnText.text = this.name + " is playing" //Met à jour le texte indiquant le nom du joueur en train de jouer
		selectedPiece = 0;
	}


}

function facepunch() { //hehe
  config.background = loadImage("img/no/facepunch.jpg");
  img.HUD[0] = loadImage("img/no/facepunch.jpg");
  img.HUD[1] = loadImage("img/no/facepunch.jpg");
  img.HUD[2] = loadImage("img/no/facepunch.jpg");
  img.HUD[3] = loadImage("img/no/facepunch.jpg");
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

/*
   for (var i = 0; i < pieceClass.length; i++){
    img.spell[pieceClass[i]] = [];
    while (true) {
      loadImage("img/"+)
    }
  }
  */

  winIMG[0] = loadImage("img/no/facepunch.jpg");
  winIMG[1] = loadImage("img/no/facepunch.jpg");
  startGame();
}

function deFacepunch() {
  preload(); startGame();
}

class Piece {
	//classe représentant une pièce en général
	//les différentes pièces seront des classes héritées de celle-ci
  constructor(img,name,atk,hp,cx,cy,player,mp,expValue,spell = []) {
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
	  this.effects = [] //effets appliqués à la pièce
	  this.exp = 0 //expérience de la pièce
	  this.level = 0 //niveau de la pièce
	  this.expValue = expValue //quantité d'exp obtenue en tuant la pièce

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

  onLeftClick() {
	  //fonction appelée à chaque clic de la souris
    if (isCaseHovered(this.cx,this.cy) && playerTurn == this.player && guiState == "") {
		//si le clic a eu lieu sur cette pièce :
      if (selectedPiece == this) {
        clearSelectedPiece(); return;
      } else { this.select() }
	  
	//affichage de la jauge de vie
		fill("red");
		rect(this.x,this.y + config.tileSize * 0.8, //Affiche un rectangle rouge sur toute la longueur de la jauge
		config.tileSize,config.tileSize*0.2,
		0,0,config.border,config.border);
		fill("green");
		rect(this.x,this.y + config.tileSize * 0.8, //Affiche un rectangle vert sur une longueur dépendant des points de vie restants
		config.tileSize / this.maxHP * this.hp,config.tileSize * 0.2,
		0,0,config.border,config.border);
	}
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
  }

  viewRanges() { 	  //affiche les portées d'attaque et de déplacement (= cases où ils est possible de se déplacer + pièces attaquables)
    var board = examineBoard();  //récupération du tableau représentant l'échiquier
    var depl = this.getDepl(board); //r�cup�ration de la liste des cases o� il est possible de de d�placer
									//la m�thode getDepl est d�finie dans chaque classe de pi�ce, le d�placement �tant propre � celle-ci

  	var color
  	var hoverColor
  	var callback

  	//ATTAQUE
  	var atk = this.getAtkRange(board); //Récupère les cases sur lesquelles on peut attaquer (sous forme de tableau [ [x,y], [x,y], ... ])
  	var HLCase;

    clearGUI("highlightCase") //Supprime les cases colorées

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
    			if (board[atk[i][0]][atk[i][1]].player == 1 - this.player){
    				HLCase = new HighlightCase(atk[i][0],atk[i][1],
    				color,hoverColor,this,callback);
    				HLCase.target = board[atk[i][0]][atk[i][1]];
    			}
    		}
    	}
    }

    //D�PLACEMENTS
    if (this.deplCD == false){
    	if (joueur[playerTurn].mana >= config.mana.depl){
    		color = [0,0,255,120];
    		hoverColor = [100,100,255,120];
    		callback = function(){ this.piece.move(this.x,this.y); this.piece.deplCD = true ; this.piece.viewRanges()}
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

  attack(target){

	if (joueur[playerTurn].mana >= config.mana.atk){
		if (target.callPassive("onAttacked",{source : this, dmg : this.atk}) == true) return true
		if (this.callPassive("onAttacking",{target : target, dmg : this.atk}) == true) return true

		damage(target,this,this.atk)
		joueur[playerTurn].mana -= config.mana.atk

		target.callPassive("onAttacked",{source : this, dmg : this.atk})
		this.callPassive("onAttacking",{target : target, dmg : this.atk})
	}

  }

	depl(cx,cy){
		if (joueur[playerTurn].mana >= config.mana.depl){
			this.move(cx,cy)
		}
	}

  move(cx,cy) {
	this.callPassive("onMoved",{x: cx, y: cy})
  	this.cx = cx;
  	this.cy = cy;
  	joueur[playerTurn].mana -= config.mana.depl;
    this.callPassive("onMovedDone",{x: cx, y: cy})

    move(this,0.8,convertPx(cx),convertPx(cy));
  }

  // Fonctions à redéfinir dans chaque classe piece
  getDepl(board){
	 return [];
  }

  getAtkRange(board){
	 return [];
  }

  noManaError(x,y){
    {
      let manaTXT = new Text("msg",x,y,"Not enough mana","Arial",config.unit,[0,0,255])
      applyFadeOut(manaTXT,manaTXT.color,255,0.5)
    }
  }

	callPassive(passive,arg){
		if (typeof this[passive] == "function"){
			return this[passive](arg);
		}
	}

	startTurn(){ //a ne pas confondre avec le passif onStartTurn
		this.deplCD = false;
    this.atkCD = false
		this.atk = this.baseAtk
		let prevMaxHP = this.maxHP ;
		this.maxHP = this.baseHP ;
		this.hp = this.hp * this.maxHP / prevMaxHP
		for (var i = 0; i < this.spell.length; i++){
			if (this.spell[i].actualCooldown > 0) this.spell[i].actualCooldown--
		}
		for (var i = 0; i < this.effects.length; i++){
			this.effects[i].apply()
		}

		this.callPassive("onStartTurn")

	}

	applyEffect(duration,turn,end){
		this.effects.push(new Effect(this,duration,turn,end))
	}

	showStats() {
		let expText = (this.level >= config.expLevels.length) ? "" :"/" + config.expLevels[this.level]
		let color = this.player ? "Noir" : "Blanc";
			this.elements = [
		  [ { type: "text", coord: { x: 0, y: 0 }, text: "Points De Vie: " + Math.floor(this.hp) + "/" + Math.floor(this.maxHP), size: config.unit*2, color: [210, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*2 }, text: "Points d'Attaque: " + Math.floor(this.atk), size: config.unit*2, color: [255, 210, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*4 }, text: "Couleur: " + color, size: config.unit*2, color: [255, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*11.6 }, text: "Niveau: "+this.level, size: config.unit*2, color: [150,150,255] },
			{ type: "text", coord: { x: 0, y: config.unit*13.6 }, text: "Experience: "+this.exp + expText, size: config.unit*2, color: [150,150,255]}]
		];
		clearGUI("windows")
		new Window(config.hud.statsWindow.x, config.hud.statsWindow.y,config.hud.statsWindow.w,config.hud.statsWindow.h, "Stats", this.elements);
	}

	gainExp(exp){
		this.exp += exp //ajout de l'exp

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1)  //on teste si l'exp
																					//a dépassé un nouveau niveau
	}

	levelUp(){
		this.level += 1
		console.log(this.level)
		console.log(this.exp)

		let prevBaseAtk = this.baseAtk
		this.baseAtk *= 1.1
		this.atk = this.atk * this.baseAtk / prevBaseAtk

		let prevBaseHP = this.baseHP
		this.baseHP *= 1.1
		this.maxHP = this.maxHP * this.baseHP / prevBaseHP
		this.hp = this.hp * this.baseHP / prevBaseHP

		for (var i = 0; i < this.spell.length; i++){
			if (this.spell[i].locked){
				if (typeof this.spell[i].locked == "number" && this.level >= this.spell[i].locked){
					this.spell[i].locked = false
				}
			}
		}

        let levelUpTXT = new Text("msg", convertPx(this.cx) + config.tileSize / 2, convertPx(this.cy) + config.tileSize / 2, "Level Up","Arial",config.unit * 4,[0,0,255])
        applyFadeOut(levelUpTXT,levelUpTXT.color,255,0.3)

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1) //si l'exp a dépassé un autre niveau, on répète l'opération

	}

}

class Pion extends Piece {
  constructor(x, y, player) {

    super(0, "Pion", 50, 120, x, y, player, 3, 60);

	var direction = this.player
	this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
	let prevMaxHP = this.maxHP
		this.maxHP += this.kyojin * (this.baseHP / 50)
		this.hp = this.hp * this.maxHP / prevMaxHP
	this.atk += this.baseAtk * (this.kyojin / config.nLig)

	let spell = [
		new Spell("Vent Divin",8,1,img.spell.Pion[0],0,2,this,
			function(){
				this.cast()
			},
			function(){
				var spell = this
				var hpCost = 50
				var board = examineBoard()
				var source = this.piece
				if (spell.piece.hp > hpCost){
					selectPieces(piecesInCases(this.getRange(),board),
					   function(target){if (target.player != source.player)damage(target,spell.piece,20)})
					damage(spell.piece,undefPiece,hpCost)
				}

			},
			function(){
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
			function() this.piece.getAtkRange()

		)
    ];
	this.spell = spell;

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

  getAtkRange(){
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

	onStartTurn(){
		var direction = this.player

		let prevMaxHP = this.maxHP
		this.maxHP += this.kyojin * (this.baseHP / 50)
		this.hp = this.hp * this.maxHP / prevMaxHP

		this.atk += this.baseAtk * (this.kyojin / config.nLig)

	}

	onMovedDone(){
		  //modification des stats en fonction de la position
		var direction = this.player
		let prevKyojin = this.kyojin
		this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
		this.dKyojin = this.kyojin - prevKyojin

		let prevMaxHP = this.maxHP
		this.maxHP += this.dKyojin * (this.baseHP / 50)
		this.hp = this.hp * this.maxHP / prevMaxHP

		this.atk += this.baseAtk * (this.dKyojin / config.nLig)

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
					}
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
					continue
					}else if (this.piece.cy + i >= config.nLig) break

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
		if (arg.dmg < this.hp/2){ //l'attaque réçue est faible (moins de la moitié des hp du fou)
			if (Math.random() * 100 > 100) {return false}
		}
	}


}

class Reine extends Piece {
	constructor(x, y, player) {
		super(3, "Reine", 120, 400, x, y, player, 5, 150);
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
    victory = joueur[1-this.player]
  }

}

class PrePiece{
  constructor(Piece,cx,cy,player){
    this.Piece = Piece;
    this.cx = cx;
    this.cy = cy;
    this.player = player;
  }

  summon(){
    joueur[this.player].piece.push(new this.Piece(this.cx,this.cy,this.player));
  }

}

{ //création du tableau des classes
  var pieceClass = [Pion,Tour,Fou,Reine,Cavalier,Roi]
}

class StaticImage {
  constructor(gui,img,x,y,w = undefined,h = undefined){
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.img = img
    this.gui = gui

    chessGUI[gui].push(this)
  }

  draw(){
    image(this.img,this.x,this.y,this.w,this.h)
  }

}

class Button {
  constructor(gui,img,x,y,w,h,hovercallback,callback) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.hovercallback = hovercallback;
    this.callback = callback;
    this.gui = gui;

    chessGUI[gui].push(this);
  }

  draw() {
    image(this.img,
          this.x, this.y,
          this.w, this.h);
          if (typeof this.hovercallback == "function" && isHovered(this.x,this.y,this.w,this.h)){
            this.hovercallback()
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
      clearGUI("highlightCase")
      this.callback();
      return true //si un onLeftClick renvoie true, alors on quitte la boucle qui teste les onLeftClick() de tous les éléments
      //cela permet d'éviter que plusieurs éléments réagissent au même clic4
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
  constructor(name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange){
    this.name = name;
    this.manaCost = manaCost;
    this.img = img;
    this.helpImg = helpImg;
    this.locked = baseLocked;
    this.onUsed = onUsed;
    this.effect = effect;
	this.piece = piece;
	this.cooldown = cooldown;
	this.actualCooldown = 0;
	this.getRange = getRange;
  }

  cast(arg){
    this.effect(arg)
    joueur[this.piece.player].mana -= this.manaCost;
    this.actualCooldown = this.cooldown
  }

}

class SpellIcon extends Button {
	constructor(x,y,w,h,spell){
		super("pieceHUD",spell.img,x,y,w,h,
		function(){
			textSize(config.hud.spellInfo.size)
			textFont("Verdana")
			textAlign(LEFT,TOP)
			fill(255)
			text(this.spell.name, config.hud.spellInfo.x, config.hud.spellInfo.y)
			fill(150,150,150)
			text("Cooldown : " + this.spell.cooldown, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size)
			fill(150,150,255)
			text("Mana cost : " + this.spell.manaCost, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size * 2)

			if (this.spell.getRange){
				let range = this.spell.getRange()
				for (var i = 0; i < range.length; i++){
					fill(255,200,200,100)
					rect(convertPx(range[i][0]),convertPx(range[i][1]),config.tileSize,config.tileSize,config.border)
				}
			}
		},
		function(){
			if (guiState == ""){
				if(joueur[this.spell.piece.player].mana >= this.spell.manaCost){
					if (this.spell.actualCooldown == 0 && !this.spell.locked){
						this.spell.onUsed(this.spell); //utilisation du spell
					}
				}else{
					this.spell.piece.noManaError(this.x + this.w/2, this.y + this.h/2)
				}
			}
		})
		this.spell = spell
		this.baseDraw = this.draw

		this.draw = function(){
			this.baseDraw()
			if (this.spell.actualCooldown || this.spell.locked){
				fill([0,0,0,150])
				rect(this.x,this.y,this.w,this.h)
				fill(255)
				textAlign(CENTER,CENTER) ; textSize(this.h * 0.8)
				if (this.spell.actualCooldown) text(this.spell.actualCooldown,this.x + this.w/2, this.y + this.h/2)
			}
		}
	}
}



class Effect{ //classe représentant les effets sur la durée appliqués aux pièces
	constructor(piece,duration,turnEffect = 0,endEffect = 0,direct = true){
		this.piece = piece
		this.turnEffect = turnEffect
		this.endEffect = endEffect
		this.duration = duration
		this.remaining = duration

		if (direct && this.turnEffect) this.turnEffect()
	}

	apply(){
		this.remaining--;
		if (this.remaining == 0){
			if(this.endEffect) this.endEffect()
			this.destroy()
		}else{
			if (this.turnEffect) this.turnEffect()
		}
	}

	destroy(){
		this.piece.effects.spliceItem(this)
	}
}

// endClass ----------

// reset function

function startTitle(){
  soundPreLoad(); sEffects[3].play();
  joueur = [new Joueur("blanc","Gilbert"), new Joueur("noir","Patrick")];
  initPrePieces();
  clearGUI();
  new StaticImage("background",img.title[0],0,0,config.canvasW,config.canvasH)
  titleView.mainPage();
}

function startGame() {

	d = new Date();
	actTime = d.getTime();

	clearGUI();
	new StaticImage("background",config.background, 0, 0, config.canvasW, config.canvasH);
  {let hudBG = {};
    hudBG.draw = function() {
      fill(80, 80, 80, 200); rect(0, 0, config.boardW + config.hud.manaGauge.w + config.border * 3, config.canvasH);
    }
  chessGUI.background.push(hudBG);}
	{
    let chessBoard = {draw : drawBoard}
	  chessGUI.background.push(chessBoard)
  }

	new Button("hud",img.HUD[0],config.hud.button.x,config.hud.button.y,config.hud.button.w,config.hud.button.h,
		function(){fill([255,255,255,50]) ; rect(this.x,this.y,this.w,this.h,config.unit)},
		function(){joueur[1 - playerTurn].startTurn()});

	{
    let manaGauge = config.hud.manaGauge;
	manaGauge.draw = function(){
	   fill(200,200,255);
	   rect(this.x+1,this.y+1,this.w-1,this.h-1);
	   fill(80,80,255);
	   rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h);
	   textAlign(LEFT, CENTER); textSize(config.unit * 4); fill(255);}
	chessGUI.hud.push(manaGauge)
  }

	{
    let info = config.hud.info;
		info.draw = function() {
			image(img.HUD[1], config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h);
			if (!selectedPiece) { fill(50, 50, 50, 180); rect(config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h, config.unit/4);
			} else { if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/4)}}
		}
		info.onLeftClick = function(){
			if (selectedPiece) {
				if (isObjectHovered(this)) {
					selectedPiece.showStats();
					this.ftsioCounter ++; if (this.ftsioCounter >= 25) fuckThisShitImOut()

				} else {this.ftsioCounter = 0}
			}
		}
		chessGUI.hud.push(info);
	}

	for (let i = 0; i < joueur.length; i++){
		joueur[i].initGame();
	}

  {
    let mute = config.hud.mute;
    mute.draw = function() {
      let tmp = sEffects[3].volume == 0 ? img.HUD[3] : img.HUD[2];
      image(tmp, this.x, this.y, this.w, this.h);
      if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/1.9)}
    }
    mute.onLeftClick = function() {
      if (isObjectHovered(this)) sEffects[3].volume = 0.5 - sEffects[3].volume;
    }

    chessGUI.hud.push(mute);
  }

	undefPiece = Piece.prototype ; undefPiece.name = "undef";
	playerTurn = 1;
	guiElements.playerTurnText = new Text("hud",config.hud.playerTurnText.x,config.hud.playerTurnText.y,joueur[playerTurn].name + " is playing","Arial",config.unit*3,[255,255,255],LEFT,TOP);
	isPlaying = true;
	initBoard();
	joueur[playerTurn].startTurn()
}
// -------

// main functions
function setup() {
  noStroke();
  cursor("img/cursor.png");
  createCanvas(config.canvasW, config.canvasH);
  background(80); //drawBoard();

  textFont("Arial");

  startTitle();
}

function draw() {

  d = new Date();
  actTime = d.getTime();

  for (var element in chessGUI) {
    if (chessGUI.hasOwnProperty(element)) {
      for (var i = 0; i < chessGUI[element].length; i++) {
        if (typeof chessGUI[element][i].draw === "function"){
          chessGUI[element][i].draw();
        }
      }
    }
  }

  if (victory){
    alert("Victoire de " + victory.name)
    startGame()
    victory = false
  }

  if (debug) {
    fill(255); textSize(20);
    text(floor(frameRate()), 20, 20);
  }
}

function mouseClicked(){
  if (mouseButton == LEFT){
    clickLoop: for (var element in chessGUI){ // TROP DE IF LOL
      if (chessGUI.hasOwnProperty(element)){
        for (var i = 0; i < chessGUI[element].length; i++){
          if (typeof chessGUI[element][i].onLeftClick === "function"){
            if (chessGUI[element][i].onLeftClick()) break clickLoop;
          }
        }
      }
    }
    sEffects[Math.floor(random(0,3))].play();
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
