function addDepl(board,depl,x,y){
	//utile dans les fonctions piece.getDepl() uniquement : ajoute un déplacement
	//à la liste après avoir effectué tous les tests nécessaires (si la case est hors
	//de l'échiquier ou si une pièce s'y trouve déjà
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

function isCaseHovered(x,y){ //teste si le curseur de la souris se trouve au dessus de la case sp�cifi�e
  return isHovered(convertPx(x),convertPx(y),config.tileSize,config.tileSize,config.border);
}

function caseInRangeZ(cx,cy,range,includeCenter = false){ //fonction donnant les pièces dans une portée donnée (Z: méthode Zone)
	var cases = []
	var dist
	var xStart = (cx - range >= 0) ? cx - range  : 0
	var xEnd = (cx + range < config.nCol) ? cx + range : config.nCol - 1
	var yStart = (cy - range >= 0) ? cy - range  : 0
	var yEnd = (cy + range < config.nLig) ? cy + range : config.nLig - 1

	for (var i = xStart; i <= xEnd; i++){
		for (var j = yStart ; j <= yEnd ; j++){
			dist =  Math.sqrt(Math.pow(i - cx,2)+pow(j - cy,2));
			if (Math.round(dist) <= range && !(i == cx && j == cy && !includeCenter) ) {
				cases.push([i,j])
			}
		}
	}


	return cases

}

function piecesInCases(cases,board){ //renvoie un tableau contenant les pièces se trouvant sur les cases représentées par le tableau cases
	var x,y
	var pieces = []
	for (var i = 0; i < cases.length; i++){
		x = cases[i][0] ; y = cases[i][1]
		if (board[x][y]) pieces.push(board[x][y])
	}
	return pieces
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
	pieceLoop:for (var i = 0 ; i < pieces.length ; i++){
    for (var j = 0 ; j < condition.length; j++){
        if (!condition[j](pieces[i])) continue pieceLoop
    }
    callback(pieces[i])
	}
}

function startPieceSelectionHLC(pieces, color, hoverColor, callback){ //démarre un processus de sélection de pièce, en utilisant les Highlight Cases
  if (pieces.length > 0){
    endSelectionHLC()
    guiState = "selection"
    clearGUI("highlightCase")

    var colorType = typeof color
    var hoverColorType = typeof hoverColor
    var caseColor, caseHoverColor
    var piece

    for (var i = 0; i < pieces.length; i++){
    	piece = pieces[i]
    	if (colorType == "undefined") {caseColor = [200,200,200,50]}
    	else if (colorType == "function") {caseColor = color(piece)}
    	else {caseColor = color}
    	if (hoverColorType == "undefined") {caseHoverColor = [200,200,200,100]}
    	else if (hoverColorType == "function") {caseHoverColor = hoverColor(piece)}
    	else {caseHoverColor = hoverColor}
        new HighlightCase(piece.cx,piece.cy,
            caseColor,caseHoverColor,piece,function(){endSelectionHLC(callback,this.piece)});
    }
  }
}

function startCasesSelectionHLC(cases, color, hoverColor, callback){ //démarre un processus de sélection de case, en utilisant les Highlight Cases
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

function endSelectionHLC(callback,selected){
	if (guiState == "selection") {
		guiState = "";
		clearGUI("highlightCase")
		if (typeof callback == "function") callback(selected)
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

    p55.gui.highlightCase.push(this);
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
