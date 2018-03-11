class Reine extends Piece {
	constructor(x, y, player) {
		super(3, "Reine", 120, 400, x, y, player, 5, 150);

		this.spell = [
			new Spell("Thunderbolt",8,3,img.spell.Reine[0],0,false,this,
				function(){
					let board = examineBoard()
					let range = this.getRange()
					if (piecesInCases(range,board)) this.cast({range : range, board : board})
				},
				function(arg){
					let range = arg.range
					let board = arg.board
					let i = 0
					let piece, found = false
					
					for (let i = 0; i < range.length; i++){
						piece = board[ range[i][0] ][ range[i][1] ]
						if (piece && piece.player != this.piece.player) {
							found = true
							let p = {source : this.piece, dmg : 50, target: piece}
							if (this.piece.callPassive("onAttacking",p) != true) damage(piece,this.piece,p.dmg);
							this.piece.callPassive("onAttackingDone",p)
						}else if (found) break
					}
					
						
				},
				function(){
					let distance = (this.rangeBoost) ? 6 : 5
					let range = []
					let direction = ((this.piece.player == 0) ? 1 : -1);
					let y = 0
					for (let i = 1; i < distance; i++){
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
			),
			new Spell("Petrifying",8,5,img.spell.Reine[2],0,false,this,
				function(){
					let targets = this.piece.getAtkTargets(examineBoard(),2);
					let spell = this;

					startPieceSelectionHLC(targets, [0,0,0,150], [0,0,0,200],
						function(selected){
							spell.cast(selected);
						}
					)
				},
				function(target){
					stun(target,2)
				},
				function(){
					return this.piece.getAtkTargets(undefined,2) //on appelle la fonction renvoyant les cibles d'attaque sans préciser le board :
					//la fonciton addAtkTarget (utilisée dans cette méthode) réagira en renvoyant toutes les cases dans la portée d'attaque, sans tests d'interactions
				}
			)
		]
		
		this.shop = [
			new Item("Soul Reaper",img.items.Reine[0],50,
				[function(piece){
					piece.addPassive("onKillingDone",
						function(){
							this.applyEffect(4,
								function(){
									this.piece.addPassive("onDamaging",
										function(arg){
											if (!(arg.type && arg.type.nonDirect)){
												burn(arg.target,5,3,this)
											}	
										}
									)
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
								
								},0,0,true,{name : "Burning Soul"}, true
							)
						
						}
					)
			
				}]
			),
			new Item("Long shot",img.items.Reine[1],50,
				[function(piece){
					piece.addPassive("onAttackingDone",
						function(arg){
							damage(arg.target, this, arg.target.maxHP / 15, false, {nonDirect : true})
						}
					)
				
				}],
				function(piece){
					piece.spell[0].rangeBoost = true
				}
			),
			new Item("Berserk", img.items.Reine[1],50,
				[function(queen){
					queen.atk += 50
					queen.mHP += 50
				}],
				function(piece){
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

  getAtkTargets(board,mp = this.mp - 2){
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
	for (var i = 1; i < mp + 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx + i,this.cy + i)) break
    }
    for (var i = 1; i < mp + 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx - i,this.cy + i)) break
    }

    for (var i = 1; i < mp + 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx + i,this.cy - i)) break
    }
	for (var i = 1; i < mp + 1; i++) {
		if (addAtkTarget(this,board,atk,this.cx - i,this.cy - i)) break
    }

    return atk;
  }
}