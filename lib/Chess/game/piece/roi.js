class Roi extends Piece {
  constructor(x, y, player) {
    super("Roi", 30, 400, x, y, player, 2, 999, 999);

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
		  let heal = 15 + (this.piece.spellBoost == true) * 10

          for (let i = 0; i < pieces.length; i++) {
            heal(pieces[i],this.piece,heal)
            
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
		  let dmg = 2 + (this.piece.spellBoost == true) * 1
          damage(pieces[Math.floor(Math.random() * pieces.length)],this.piece,dmg)
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
      ),
	  new Spell("Projet", 5, 10, img.spell.Roi[2], 0, false, this,
        function(){
          this.cast();
        },
        function(){
          let range = this.getRange();
          let board = examineBoard();
		  let spell = this, c = 0
          let pieces = filterElements(piecesInCases(range, board), function(piece){ if (piece.player == spell.piece.player) return true})
		  let dmg = 15 + (this.piece.spellBoost == true) * 10
          selectPieces(pieces,
			function(piece){
				c++
				damage(piece,spell.piece,dmg);
			}
		  )
		  heal(spell.piece,spell.piece,dmg * c);
        },
        function(){
          return caseInRangeZ(this.piece.cx,this.piece.cy,1);
        }
      )
    ]
	
	this.shop = [
		new Item("Divine King", img.items.Pion[0],50,
			[],
			function(piece){
				piece.spellBoost = true;
			}
		),
		new Item("Democracy", img.items.Pion[1],50,
			[function(piece){
				piece.addPassive("permanent",
					function(){
						let assembly = caseInRangeZ(this.cx,this.cy,2);
						let allies = [], enemies = [];
						for (let i; i < assembly.length; i++){
							if (assembly[i].player == this.player){
								allies.push(assembly[i]);
							}else{
								enemies.push(assembly[i]);
							}							
						}
						if (allies.length >= enemies.length){
							selectPieces(allies,
								function(ally){
									ally.atk += 20;
									ally.mHP += 20;
								}
							)
						} else {
							selectPieces(enemies,
								function(enemy){
									enemy.atk += 20;
									enemy.mHP += 20;
								}
							)
						}
					}
				)
			}]
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

    getAtkTargets(board,mp = this.mp){
		var atk = [];

		for (var i = 1; i < mp + 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx,this.cy + i)) break
		}
		for (var i = 1; i < mp + 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx,this.cy - i)) break
		}
		for (var i = 1; i < mp + 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy)) break
		}
		for (var i = 1; i < mp + 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy + i)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy + i)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy - i)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy - i)) break
		}
		return atk;
	}

  permanent() {
    if (this.hp < this.maxHP * 20 / 100) {
		let king = this
		let range = caseInRangeZ(this.cx, this.cy, 1);
		let pieces = piecesInCases(range, examineBoard());
		let allies = filterElements(pieces, function(piece){if (piece.player == king.player) return true});
		for (let i = 0; i < allies.length; i++) {
			allies[i].atk *= (110 / 100);
		}
    }
  }

  onDying(killer){ //Passif se lançant lorsque cette pièce meurt : indique que le joueur ayant tué le Roi à gagné
    victory = joueur[1-this.player]; 
  }

}