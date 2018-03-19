function initPrePieces() { //initialise les "prePieces" de chaque joueur selon la configuration de base des pièces d'échecs
	//Les prePieces sont des objets présents avant le début de la partie, contenant les infos de base d'un pièce,
	//indiquant quelles pièces seront créées où au début (leur position, etc)
	var layout = [  //Tableau contenant les classes de chaque pièce présente en début de partie
		[Priest, Cavalier, Fou, Reine, Roi, Fou, Cavalier, Tour], //On suit la configuration de base des échecs
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
	//de l'échiquier ou si une pièce si trouve déjà
  if (isOnBoard(x,y) && typeof board[x][y] == "undefined"){
    depl.push([x,y]);
    } else { return false } //renvoie false si l'ajout n'a pas pu être effectué
}

function addAtkTarget(source,board,atk,x,y){
	//utile dans les fonctions piece.getAtkTargets() uniquement : ajoute une pièce
	//à la liste après avoir effectué tous les tests nécessaires (si la case est hors
	//de l'échiquier ou s'il n'y a aucune pièce ennemie sur cette case.
	//Ainsi, cette fonction ne sert qu'à effectuer les tests utilisés par la plupart des getAtkTargets
	if (isOnBoard(x,y)){
		if (!board) {atk.push([x,y]) ; return 0} //Si le board n'est pas fourni (on considère donc qu'on veut la portée d'attaque brute), on renvoie juste la case
		if (typeof board[x][y] != "undefined"){
			if (board[x][y].player != source.player){
				atk.push(board[x][y])
				return 3 //une pièce ennemie est détectée et ajoutée au tableau
			}
			return 2; // dans le board et une pièce 
		}
		return 0; // dans le board mais pas de pièce
	}
	return 1; // hors du board
}

function getArrayID(array,element){
	//fonction générique renvoyant la clé d'un élément dans un tableau.
	//ne foncitonne correctement que si chaque élément est unique
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){ //Pour chaque élément du tableau, teste si c'est l'élément spécifié
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

function damage(target,source,dmg, animation = true, type){ //inflig des dégâts à une pièce
	//Appel des passifs s'activant quand une pièce subit des dégâts
	var parameters = {source : source, damage : dmg, target : target, type: type}
	if (target.callPassive("onDamaged",parameters) == true) return true //si l'un des passifs pré-dégâts renvoie true
	if (source.callPassive("onDamaging",parameters) == true) return true //les dégâts sont annulés et la fonction renvoie elle aussi true (permet à un passif d'annuler des dégâts)

	if (animation){
		{
		  let dmgTXT = new Text("msg",target.x + config.tileSize / 2,target.y + config.tileSize / 2,"-"+ Math.floor(parameters.damage),"Arial",config.unit * 4,[255,0,0]) //Crée un texte rouge indiquant les dégâts subis
		  applyFadeOut(dmgTXT,dmgTXT.color,255,0.5) //Le fait disparaître en fondu
		}
	}
	
	target.hp = target.hp - parameters.damage //retrait des points de vie à la pièce subissant des dégâts
	if (target.hp < 1){
		kill(target,source) //si es PV de la pièce tombent à 0, la tue
	}
	updatePieces()

	target.callPassive("onDamagedDone",parameters)
	source.callPassive("onDamagingDone",parameters)
}

function heal(target,source,heal){
	target.hp += heal
	if (target.hp > target.maxHP) target.hp = target.maxHP
	
}

function stun(target,duration){
	target.applyEffect(duration,
		function(){this.piece.cc = true}
	,0,0,true,
	{icon : img.fx.stun, name: "Stun"})
	
	target.updateView()
}

function burn(target,dmg,duration,source = undefPiece){
	let burnEffect = target.applyEffect(duration,0,0,
		function(){
			damage(this.target,this.source,this.dmg,true,{nonDirect: true, source: "burn"})
		},
		false,
		{icon: img.fx.burn, name: "Burn"}
	)
	burnEffect.dmg = dmg
	burnEffect.target = target
	burnEffect.source = source
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

function isHovered(x,y,w,h) { //Teste si le curseur de la souris se trouve au dessus de la zone sp?cifi?e
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

function casesInLineS(cx,cy,direction,l){
	let dx = (direction % 2 == 0) ? 1 - direction : 0
	let dy = (direction % 2 == 1) ? direction - 2 : 0
	let cases = []
	
	for (let i = 0; i < l; i++){
		cases[i] = [cx + dx * i, cy + dy * i]
	}
	
	return cases
	
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

function updatePieces(){
	for (let i = 0; i < joueur.length; i++){
		for (let j = 0; j < joueur[i].piece.length; j++){
			joueur[i].piece[j].updatePre();
			joueur[i].piece[j].update();
		}
	}
}