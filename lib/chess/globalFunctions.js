function initPrePieces() { //initialise les "prePieces" de chaque joueur selon la configuration de base des pi�ces d'�checs
	//Les prePieces sont des objets pr�sents avant le d�but de la partie, contenant les infos de base d'un pi�ce,
	//indiquant quelles pi�ces seront cr��es o� au d�but (leur position, etc)
	var layout = [  //Tableau contenant les classes de chaque pi�ce pr�sente en d�but de partie
		[Priest, Cavalier, Fou, Reine, Roi, Fou, Cavalier, Tour], //On suit la configuration de base des �checs
		[Pion, Pion, Pion, Pion, Pion, Pion, Pion, Pion]
	];

	//Pour chaque joueur, ajoute � son tableau prePieces les prePieces correspondant aux pi�ces et la configuration de base des �checs
		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[i].length; j++) {
				joueur[0].prePiece.push(new PrePiece(layout[i][j], j, i, 0));
				joueur[1].prePiece.push(new PrePiece(layout[i][j], j, config.nLig - i - 1, 1));
		}
	}
}

function initBoard() { // cr�ation de toutes les pi�ces (r�elles) sur le plateau, � partir des prePieces de chque joueur
  for (let i = 0; i < joueur[0].prePiece.length; i++) {
    joueur[0].prePiece[i].summon(); //pour chaque prePiece de chaque joueur, on �x�cute sa m�thode summon(), qui cr�e une pi�ce � partir de la prePiece
    joueur[1].prePiece[i].summon();
  }
}

function addDepl(board,depl,x,y){
	//utile dans les fonctions piece.getDepl() uniquement : ajoute un d�placement
	//� la liste apr�s avoir effectu� tous les tests n�cessaires (si la case est hors
	//de l'�chiquier ou si une pi�ce si trouve d�j�
  if (isOnBoard(x,y) && typeof board[x][y] == "undefined"){
    depl.push([x,y]);
    } else { return false } //renvoie false si l'ajout n'a pas pu �tre effectu�
}

function addAtkTarget(source,board,atk,x,y){
	//utile dans les fonctions piece.getAtkTargets() uniquement : ajoute une pi�ce
	//� la liste apr�s avoir effectu� tous les tests n�cessaires (si la case est hors
	//de l'�chiquier ou s'il n'y a aucune pi�ce ennemie sur cette case.
	//Ainsi, cette fonction ne sert qu'� effectuer les tests utilis�s par la plupart des getAtkTargets
	if (isOnBoard(x,y)){
		if (!board) {atk.push([x,y]) ; return 0} //Si le board n'est pas fourni (on consid�re donc qu'on veut la port�e d'attaque brute), on renvoie juste la case
		if (typeof board[x][y] != "undefined"){
			if (board[x][y].player != source.player){
				atk.push(board[x][y])
				return 3 //une pi�ce ennemie est d�tect�e et ajout�e au tableau
			}
			return 2; // dans le board et une pi�ce 
		}
		return 0; // dans le board mais pas de pi�ce
	}
	return 1; // hors du board
}

function getArrayID(array,element){
	//fonction g�n�rique renvoyant la cl� d'un �l�ment dans un tableau.
	//ne foncitonne correctement que si chaque �l�ment est unique
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){ //Pour chaque �l�ment du tableau, teste si c'est l'�l�ment sp�cifi�
			return i; //si oui, le retourne
		}
	}

	return false; //si aucun n'a �t� trouv�, renvoie false
}

Array.prototype.spliceItem = function(item){
	//m�thode appartenant au prototype des Arrays, ce qui signifie qu'elle sera pr�sente pour tous les tableaux
	//elle permet de d�truire un �l�ment du tableau, en sp�cifiant uniquement l'�l�ment en question
	//(sa cl� est d�termin�e via getArrayID())
	var array = this;
	array.splice(getArrayID(array,item),1)
}

function kill(target,killer){ //tue une pi�ce
	target.callPassive("onDying",killer) //Appelle les passifs s'activant au moment o� une pi�ce meurt (voir Sorts Passifs/ Piece.callPassive() )
	killer.callPassive("onKilling",target)
	let xp = target.expValue //Calcul de l'exp�rience raaport�e par la mort de la pi�ce

	//on retire la pi�ce des tableaux dont elle fait partie (on la supprime totalement)
	joueur[target.player].piece.spliceItem(target) //le tableau des pi�ces du propri�taire
	chessGUI.pieces.spliceItem(target) //le tableau des �l�ments g�r�s par la GUI

	killer.callPassive("onKillingDone",target)
	killer.gainExp(xp) //Le tueur gagne de l'exp�rience
}

function damage(target,source,dmg, animation = true, type){ //inflig des d�g�ts � une pi�ce
	//Appel des passifs s'activant quand une pi�ce subit des d�g�ts
	var parameters = {source : source, damage : dmg, target : target, type: type}
	if (target.callPassive("onDamaged",parameters) == true) return true //si l'un des passifs pr�-d�g�ts renvoie true
	if (source.callPassive("onDamaging",parameters) == true) return true //les d�g�ts sont annul�s et la fonction renvoie elle aussi true (permet � un passif d'annuler des d�g�ts)

	if (animation){
		{
		  let dmgTXT = new Text("msg",target.x + config.tileSize / 2,target.y + config.tileSize / 2,"-"+ Math.floor(parameters.damage),"Arial",config.unit * 4,[255,0,0]) //Cr�e un texte rouge indiquant les d�g�ts subis
		  applyFadeOut(dmgTXT,dmgTXT.color,255,0.5) //Le fait dispara�tre en fondu
		}
	}
	
	target.hp = target.hp - parameters.damage //retrait des points de vie � la pi�ce subissant des d�g�ts
	if (target.hp < 1){
		kill(target,source) //si es PV de la pi�ce tombent � 0, la tue
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
	//permet d'analyser le contenu de l'�chiquier facilement
	//via un tableau dont chaque entr�e repr�sente une case
	var board = []; //cr�e un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau � deux dimensions avec une entr�e = une case
	}

  for (var i = 0; i < chessGUI.pieces.length;i++){
    var piece = chessGUI.pieces[i];		//r�cup�re les coordonn�es de chaque pi�ce et place une r�f�rence � cette pi�ce
    board[piece.cx][piece.cy] = piece;		//dans la case correspodante dans le tableau
  }
	return board;
	//renvoie le tableau
	//board[x][y] contient le contenu de la case (x,y)
}

function examineBoardHLC() { //m�me effet de examine board, mais remplit les cases avec les highlightCase au lieu des pi�ces
//sur le moment �a m'avait l'air utile mais je crois que cette fonction sert � rien au final
	var board = []; //cr�e un tableau

	for (var i = 0; i < config.nCol; i++){ //y place autant de sous tableaux qu'il y a de colonnes,
		board[i] = []; 					   //on a donc un tableau � deux dimensions avec une entr�e = une case
	}

  for (var i = 0; i < chessGUI.highlightCase.length;i++){
    var hlc = chessGUI.highlightCase[i]		//r�cup�re les coordonn�es de chaque HLC et place une r�f�rence � celle-ci
    board[hlc.x][hlc.y] = hlc;		//dans la case correspodante dans le tableau
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

function isHovered(x,y,w,h) { //Teste si le curseur de la souris se trouve au dessus de la zone sp?cifi?e
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true; //Si oui, retourne true, sinon false
      } else { return false; }
}

function isObjectHovered(object){ //Teste si un objet graphique est survol� par la souris.  Utilise ses propri�t�s x, y, w et h, ne fonctionne donc que si elles sont d�finies
	return isHovered(object.x,object.y,object.w,object.h) //Teste simplement isHovered avec les coordonn�es de l'objet
}

function isCaseHovered(x,y){ //teste si le curseur de la souris se trouve au dessus de la case sp�cifi�e
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border); //Teste isHovered avec les coordon�es de la case (x et y sont en nombre de case par rapport � l'�chiquier)
}

function deltaVarSpeed(time,speed){
  var delta = (time * speed);
  return delta;
}

function applyFadeOut(object,rawColor,initAlpha,speed){ //Fait dispara�tre un objet graphique en fondu.
	new FadeOut(object,rawColor,initAlpha,speed); //Pour cela, lui ajoute un objet fadeOut (voir "class FadeOut"). Celui-ci utilise la propri�t� color d'un objet, qui doit �tre d�finie sous forme de tableau
}

function move(object,speed,xTarget,yTarget){ //D�place un objet graphique
  new Movement(object,speed,xTarget,yTarget); //Pour cela, lui ajoute un objet Movemet (voir "class Movement"). Celui-ci utilise les propri�t� x et y d'un objet, qui doivent �tre d�finies.
}

function clearGUI(gui){ //Vide un des �l�ments de l'objet GUI (voir "chessGUI")
  if (typeof gui == "undefined"){ //si aucun param�tre n'est pass�, on vide tout
    for (var element in chessGUI){
      if (chessGUI.hasOwnProperty(element)){
        chessGUI[element] = []
      }
    }
  } else if (typeof gui == "string"){
    chessGUI[gui] = []
  }

}

function clearSelectedPiece(piece){  //Reset la pi�ce s�lectionn�e
	if (selectedPiece) selectedPiece.deselect() ; //Effectue les op�rations de d�seleciton de la pi�ce s�lectionn�e
	selectedPiece = piece; //Si une pi�ce est pass� en param�tre, elle est la nouvelle pi�ce s�lectionn�e, sinon selectedP Hiiece est vide (undefined)
	clearGUI("pieceHUD"); //Vide plusieurs �l�ments de la GUI : le HUD li� aux pi�ces, les cases color�es (voir "class HighlightCase") et les fen�tres
	clearGUI("highlightCase");
	clearGUI("windows");
 	guiState = ""; //Si la GUI �tait dans un �tat particulier (op�ration en cours modifiant son comportement, etc), elle revient � la normale
}

//Fonctions de gestion de l'�chiquier : permettent de d�tecter/trier des cases, des pi�ces, selon leur position par exemple, et de leur appliquer des callbacks
function caseInRangeZ(cx,cy,range,includeCenter = false){ //Renvoie (dans un tableau) les cases (sous la forme [x,y]) se trouvant dans une port�e sp�cifi�e
	//le Z signifie qu'on utilise la m�thode de Zone : on prend un carr� dont on sait qu'il contient toutes les cases � port�e, et on teste toutes les cases de ce carr�
	var cases = []
	var dist;
	var xStart = (cx - range >= 0) ? cx - range : 0;  //calcul des coordonn�es du carr� (de mani�re � ce qu'il ne sorte pas de l'�chiquier)
	var xEnd = (cx + range < config.nCol) ? cx + range : config.nCol - 1;
	var yStart = (cy - range >= 0) ? cy - range : 0;
	var yEnd = (cy + range < config.nLig) ? cy + range : config.nLig - 1;

	for (var i = xStart; i <= xEnd; i++){ //Pour chacune des cases du carr�
		for (var j = yStart ; j <= yEnd ; j++){
			dist =  Math.sqrt(Math.pow(i - cx,2)+pow(j - cy,2)); //On teste si sa distance (distance entre les centres) avec la case d'origine est en dessous de la port�e max
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


function piecesInCases(cases, board){ //renvoie un tableau contenant les pi�ces se trouvant sur les cases contenues le tableau cases
	var x,y;
	var pieces = [];
	for (var i = 0; i < cases.length; i++){
		x = cases[i][0] ; y = cases[i][1]; //Pour chacune des cases, on teste si elle contient une pi�ce, gr�ce � l'objet board (pass� en param�tre, obtenu via examineBoard() ) contenant, pour chaque case,
		if (board[x][y]) pieces.push(board[x][y]); //undefined s'il n'y a pas de pi�ce, ou la pi�ce s'il y en a une. Si oui, on ajoute cette pi�ce au tableau pices
	}
	return pieces //que l'on renvoie
}

function selectCases(cases, callback){ //appelle un m�me callback(x,y) avec les coordonn�es des cases du tableau cases
	for (var i = 0 ; i < cases.length ; i++){
		callback(cases[i][0],cases[i][1])
	}
}

function selectPieces(pieces, callback){ //appelle un m�me callback(piece) pour chaque pi�ce du tableau pieces
	for (var i = 0 ; i < pieces.length ; i++){
		callback(pieces[i])
	}
}

function selectPiecesConditional(pieces, callback, condition = []){
  //Appelle un m�me callback(piece) pour chaque pi�ce du tableau pieces qui remplit les conditions
  //les conditions sont des fonctions prenant en param�tre piece[i] et renvoient true ou false
	pieceLoop: for (var i = 0 ; i < pieces.length ; i++){ //Pour chaque pi�ce
		for (var j = 0 ; j < condition.length; j++){ //On teste toutes les conditions (array condition)
			if (!condition[j](pieces[i])) continue pieceLoop;
		}
		callback(pieces[i]); //Si elles sont toutes v�rifi�es, on �x�cute le callback
	}
}

function filterElements(elements,condition){
	let result = [];
	for (let i = 0; i < elements.length; i++){
		if (condition(elements[i])) result.push(elements[i]);
	}
	return result
}



//Fonctions de s�lection via HighlightCase : cr�e des HighlightCase sur les objets pouvant �tre s�lection�s, et �x�cute un callback quand l'utilisateur a cliqu� sur l'un d'eux
function startPieceSelectionHLC(pieces, color, hoverColor, callback){ //d�marre un processus de s�lection de pi�ce (pieces), en utilisant des cases color�es (voir "class HighlightCase")
//pieces : pi�ces pouvant �tre s�lecctionn�es, color et hovercolor : couleurs des HighlightCase, callback: fonction �x�cut�e lorsqu'une pi�ce est
  if (pieces.length > 0){ //Si aucune pi�ce n'est dans la liste des pi�ces, rien ne se passe
    endSelectionHLC(); //Si une s�lection �tait en cours, elle se termine
    guiState = "selection"; //le GUISTATE passe � "selection" : toutes les interactions des objets de la GUI qui n�cessitent que la GUI soient � son �tat normal ne fonctionneront pas
    clearGUI("highlightCase"); //On supprime toutes les cases color�es.

    var colorType = typeof color //Le param�tre color, la couleur des cases de couleur de la s�lection, peut �tre ind�fini, une couleur p5 ou une fonction
    var hoverColorType = typeof hoverColor //Idem pour la couleur "hover" (si la souris passe dessus) des HighlightCase.
    var caseColor, caseHoverColor
    var piece

    for (var i = 0; i < pieces.length; i++){  //Pour chaque pi�ce pouvant �tre s�lectionn�e
    	piece = pieces[i]
    	if (colorType == "undefined") {caseColor = [200,200,200,50]}  //Si la couleur des cases n'est pas d�finie, elle est choisie par d�faut
    	else if (colorType == "function") {caseColor = color(piece)}  //Si c'est une fonction, on l'�x�cute en lui passant la pi�ce actuelle pour qu'elle retourne la couleur de sa Highlight Case
    	else {caseColor = color}
    	if (hoverColorType == "undefined") {caseHoverColor = [200,200,200,100]}
    	else if (hoverColorType == "function") {caseHoverColor = hoverColor(piece)}
    	else {caseHoverColor = hoverColor}
        new HighlightCase(piece.cx,piece.cy, //On cr�e une highlightCase sur la pi�ce, avec pour callback une fonction mettant fin � la s�lection en �x�cutant le callback de cette sl�ection (voir "endSelectionHLC")
            caseColor,caseHoverColor,piece,function(){endSelectionHLC(callback,this.piece)});
    }
  }
}

function startCasesSelectionHLC(cases, color, hoverColor, callback){ //d�marre un processus de s�lection de case, en utilisant les Highlight Cases
	//pareil mais pour s�lectionner des cases
  if (cases.length > 0){
    endSelectionHLC()
    guiState = "selection"
    clearGUI("highlightCase")

    var colorType = typeof color
    var hoverColorType = typeof hoverColor
    var caseColor, caseHoverColor
    var case_ // le _ est l� pour faire la diff�rence avec case, qui est un mot-cl� JS

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

function endSelectionHLC(callback,selected){ //Met fin au processus de s�lection en cours, et �x�cute un callback en fonction de l'objet s�lectionn� si sp�cifi�
	//Cette fonction sera appel�e pour annuler une s�lection, mais aussi pour la terminer si un objet a �t� s�lectionn�, auquel cas celui-ci est pass� en param�tre (selected)
	if (guiState == "selection") { //Ne s'active que si une s�lection �tait en cours
		guiState = ""; //Remet la GUI � son �tat normal
		clearGUI("highlightCase") //Supprime les highlightCase
		if (typeof callback == "function") callback(selected) //Si un callback a �t� sp�cifi� (cette fonction est g�n�ralement appel�e avec un callback quand on a cliqu� sur une HighlightCase), l'�x�cute
	}
}

function isOnBoard(x,y){return (x > -1 && x < config.nCol && y > -1 && y < config.nLig)}

function fuckThisShitImOut(){ //Euh alors �a c'est n'importe quoi
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