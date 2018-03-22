class Tour extends Piece {
  constructor(x, y, player) {
    super(1, "Tour", 20,200, x, y, player, 5, 80);

	this.spell = [
		new Spell("Rise of the army",6,3,img.spell.Tour[0],0,0,this,
			function(){
				this.cast();
			},
			function(){
				let spell = this
				selectPiecesConditional(piecesInCases(this.getRange(),examineBoard()),
					function(pion){
						let effect = (spell.piece.hasItem("Invoker") && pion.name == "Tower Soldier") ?
						function(){
							this.piece.atk += 20
							this.piece.addPassive("onAttacking",
								function(arg){
									burn(arg.target,10,3,this)
								}
							)
						} :
						function(){
							this.piece.atk += 20
						}
						pion.applyEffect(4,effect)
					},
					[function(piece){if (piece.constructor.name == "Pion") return true}]
				)
			},
			function(){
				return caseInRangeZ(this.piece.cx,this.piece.cy,3)
			}
		),
		new Spell("Rise of the soldier",10,5,img.spell.Tour[1],0,1,this,
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
				if (this.piece.hasItem("Invoker")){ //Si la tour possède l'item Invoker, le Pion invoqué a déjà tous ses items
					pion.obtainItem(0) //alors oui j'aurais pu faire une boucle for
					pion.obtainItem(1) //mais franchement nous n++ les boucles for c'est moche et pas lisible
					pion.obtainItem(2) //comme ça c'est plus joli voilà
				}
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
	
	this.shop = [
		new Item("Summoner",img.items.Tour[0],50,
			[],
			function(piece){
				piece.spell[1].unlock()
			}
		),
		new Item("Invoker",img.items.Tour[1],50,
			[], //oui, cet item ne fait rien. En effet, il booste des sorts qui détectent eux même s'il est présent. Peut être que plus tard je ferai en sorte que le spell modifie le sort lui-même
			0,
			function(piece){
				return piece.hasItem("Summoner")
			}
		),
		new Item("Siege Tower",img.items.Tour[2],50,
			[function(piece){
				piece.addPassive("onDamaging",
					function(arg){
						if (arg.target.constructor.name == "Tour"){
							arg.damage = arg.damage * 1.2
						}
					}
				)
			}]
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

  getAtkTargets(board){
	var atk = [];
	for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx,this.cy + i)) break
    }
    for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx,this.cy - i)) break
    }

    for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx + i,this.cy)) break
    }
	for (var i = 1; i < this.mp - 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx - i,this.cy)) break
    }

    return atk;
  }
}