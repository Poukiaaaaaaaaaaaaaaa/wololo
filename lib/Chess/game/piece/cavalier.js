class Cavalier extends Piece {
	constructor(x, y, player) {
		super(4, "Cavalier", 80, 50, x, y, player,2, 80);

		this.spell = [
			new Spell("Stomp",6,2,img.spell.Cavalier[0],0,false,this,
				function(){
					if (this.active) {this.active = false} else this.active = true;
				},
				function(){
					let spell = this;
					let board = examineBoard();
					let source = this.piece;
					let dmg = 30 + (this.piece.spellBoost == true) * 20
					selectPieces(piecesInCases(this.getRange(),board), //Pour chaque pièce dans la portée (tableau de cases) du sort, applique un callback
						function(target){if (target.player != source.player) damage(target,spell.piece,20)}) //infligeant des dégâts
				},
				function(){ //la fonction (facultative) retournant la portée du spell sous la forme d'un tableau de cases
					return caseInRangeZ(this.piece.cx,this.piece.cy,1)
				}
			),
			new Spell("Piercing assault",5,2,img.spell.Cavalier[1],0,false,this,
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
								if (!isOnBoard(tx,ty)) return false
								if (board[tx][ty]) return false;
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
					let dmg = this.piece.atk / 2 + (this.piece.spellBoost == true) * this.piece.atk / 3
					let tx = this.piece.cx + (target.cx - this.piece.cx) * 2;
					let ty = this.piece.cy + (target.cy - this.piece.cy) * 2;
					damage(target,this.piece,dmg)
					this.piece.move(tx,ty)
				},
				function(){
					let range = caseInRangeZ(this.piece.cx,this.piece.cy,1)
					return range
				}
			),
			new Spell("Chargez!",9,6,img.spell.Cavalier[2],0,false,this,
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

		this.shop = [
			new Item("Runic Horseman",img.items.Cavalier[0],50,
				[],
				function(piece){
					piece.spellBoost = true
				}
			),
			new Item("Power gatherer", img.items.Cavalier[1],50,
				[function(piece){
					piece.addPassive("onMovedDone",
						function(arg){
							if (!arg.type.forced){
								let distance = Math.sqrt(Math.pow(arg.ox - arg.x, 2) + Math.pow(arg.oy - arg.y, 2));
								this.movePower += distance * 10; if(this.movePower > 100) this.movePower = 100
							}
						}
					);
					piece.addPassive("onAttacking",
						function(arg){
							arg.dmg *= 1 + this.movePower / 100
						}
					);
					piece.addPassive("onStartTurn",
						function(){
							this.movePower -= 50;
							if (this.movePower < 0) this.movePower = 0
						}
					)
				}],
				function(piece){
					piece.movePower = 0
				}
			)
		
		]
		
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

	getAtkTargets(board) {
		var atk = [];

		for (var i = -1; i < 2; i += 2) {
			addAtkTarget(this,board,atk,this.cx + i,this.cy + 2)
	   
		}
		for (var i = -1; i < 2; i += 2) {
			addAtkTarget(this,board,atk,this.cx + 2,this.cy + i)
		 
		}
		for (var i = -1; i < 2; i += 2) {
			addAtkTarget(this,board,atk,this.cx + i,this.cy - 2)
		}
		for (var i = -1; i < 2; i += 2) {
			addAtkTarget(this,board,atk,this.cx - 2,this.cy + i)
		}
		return atk;
	}
}