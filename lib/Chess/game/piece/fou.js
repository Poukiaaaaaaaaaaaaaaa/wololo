class Fou extends Piece {
  constructor(x, y, player) {
    super("Fou", 50, 70, x, y, player, 5, 60, 30);

// name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange

    this.spell = [
      new Spell("Madness", 3, 4, img.spell.Fou[0], 0, false, this,
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
          let spell = this;
          let range = this.getRange();

          let targets = piecesInCases(range, examineBoard());
          targets = filterElements(targets, function(piece){if (piece.player != spell.piece.player) {return true}});

          startPieceSelectionHLC(targets, [255, 220, 220, 100], [255, 220, 220, 150],
            function(target){
              spell.cast(target);
            }
          );
        },
        function(target){
			let spell = this;
			target.applyEffect(3,function(){target.addPassive("onAttacking",
			function(){if (Math.random() >= 0.5) {damage(this, spell.piece, Math.floor(spell.piece.atk*0.2), true, {nonDirect: true}); return true;}})},0,0,true,
				{icon: img.fx.confuse, name : "Confusion"}
			);
        },
        function(){
          return caseInRangeZ(this.piece.cx, this.piece.cy, 3);
        }
      )
    ];
	
	this.shop = [
		new Item("Precision",img.items.Fou[0],50,
			[function(piece){
				piece.addPassive("onAttacking",
					function(arg){
						if (Math.random() * 100 > 50) arg.dmg = arg.dmg * 2
					}
				)
			}]
		),
		new Item("Hurricane",img.items.Fou[1],50,
			[function(piece){
				piece.addPassive("onAttacking",
					function(arg){
						if (this.atkCD === false) arg.resetCD = true
						if (this.atkCD === 0) arg.dmg = arg.dmg / 2
					}
				);
				piece.addPassive("onAttackingDone",
					function(arg){
						if (arg.resetCD) this.atkCD = 0
					}
				)
			}]
		),
		new Item("Quick Mind",img.items.Fou[2],50,
			[],
			function(piece){
				piece.spell[0].cooldown = 3
				piece.spell[2].cooldown = 4
				
			}
		)
    ]
	
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

  getAtkTargets(board){
	var atk = [];

	for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx + i,this.cy + i)) break
    }
    for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx - i,this.cy + i)) break
    }

    for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx + i,this.cy - i)) break
    }
	for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx - i,this.cy - i)) break
    }

    return atk;
  }

	onAttacked(arg){
		if (arg.dmg < this.hp/2){ //l'attaque reçue est faible (moins de la moitié des hp du fou)
			if (Math.random() * 100 > 50) {return false}
		}
	}


}