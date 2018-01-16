function initPrePieces() {
  var layout = [
    [Tour, Cavalier, Fou, Reine, Roi, Fou, Cavalier, Tour],
    [Pion, Pion, Pion, Pion, Pion, Pion, Pion, Pion]
  ];

  for (let i = 0; i < layout.length; i++) {
    for (let j = 0; j < layout[i].length; j++) {
      joueur[0].prePiece.push(new PrePiece(layout[i][j], j, i, 0));
      joueur[1].prePiece.push(new PrePiece(layout[i][j], j, config.nLig - i - 1, 1));
    }
  }
}

function initBoard() { // placement de toutes les pièces sur le plateau
  for (let i = 0; i < joueur[0].prePiece.length; i++) {
    joueur[0].prePiece[i].summon();
    joueur[1].prePiece[i].summon();
  }
}

function kill(target,killer){ //tue une pi�ce -> la supprime des deux tableaux dont elle fait partie :
	target.callPassive("onDying",killer)
	killer.callPassive("onKilling",target)
	let xp = target.expValue
	
	joueur[target.player].piece.spliceItem(target) //le tableau des pi�ces du propri�taire
	chessGUI.pieces.spliceItem(target) //le tableau des �l�ments g�r�s par la GUI
	
	killer.callPassive("onKillingDone",target)
	killer.gainExp(xp)
}

function damage(target,source,dmg){ //inflig des d�g�ts � une pi�ce
  clearGUI("windows");
  if (target.callPassive("onDamaged",{source : source, damage : dmg}) == true) return true //si l'un des passifs pré-dégâts renvoie true
  if (source.callPassive("onDamaging",{target : target, damage : dmg}) == true) return true //les dégâts sont annulés et la fonciton renvoie elle aussi true

  target.hp = target.hp - dmg
  if (target.hp < 1){
    kill(target,source) //si es PV de la pi�ce tombent à 0, la tue
  }

  target.callPassive("onDamagedDone",{source : source, damage : dmg})
  source.callPassive("onDamagingDone",{target : target, damage : dmg})

}

function clearSelectedPiece(piece){
	if (selectedPiece) selectedPiece.deselect() ;
	selectedPiece = piece;
	clearGUI("pieceHUD");
	clearGUI("highlightCase");
  clearGUI("windows");
	guiState = "";
}

