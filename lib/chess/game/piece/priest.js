class Priest extends Piece{
	constructor(x, y, player){
		super("Priest", 40, 180, x, y, player, 2, 50, 30);
		this.ressource = {color: [255,255,0], bgColor: [255,0,0], val: 0, max: 100, name : "Vital Power"}
		
		this.spell = [
			new Spell("Balance",5,2,img.spell.Reine[0],0,false,this,
				function(){
					let spell = this;
					let range = this.getRange(), board = examineBoard();

					let targets = piecesInCases(range, board);
			
					startPieceSelectionHLC(targets, 
						function(piece){
							if (piece.hp > piece.maxHP / 2){
								return [255,0,0,100]
							} else {
								return [0,255,0,100]
							}
						}, 
						function(piece){
							if (piece.hp > piece.maxHP / 2){
								return [255,0,0,150]
							} else {
								return [0,255,0,150]
							}
						},
						function(target){
							if (spell.piece.spellBoost){
								let targets = [target]
								
								let secondTarget = {player : 1 - target.player, lowHealth: target.hp > target.maxHP / 2}
								
								let selection = startPieceSelectionHLC(
									filterElements(piecesInCases(caseInRangeZ(target.cx, target.cy, 1), board), 
										function(piece){
											if (secondTarget.player == piece.player && (piece.hp <= piece.maxHP / 2) == secondTarget.lowHealth) return true;
										}
									),
									function(piece){
										if (piece.hp > piece.maxHP / 2){
											return [255,0,0,100]
										} else {
											return [0,255,0,100]
										}
									}, 
									function(piece){
										if (piece.hp > piece.maxHP / 2){
											return [255,0,0,150]
										} else {
											return [0,255,0,150]
										}
									},
									function(sTarget){
										targets[1] = sTarget;
										spell.cast(targets);
									}
								)
								if (!selection) spell.cast(target)
							} else {
								spell.cast(target);
							}
						}
					);
				},
				function(target){
					if (!target) return false
					if (target.isPiece) {this.piece.balance(target)} else {
						this.piece.balance(target[0]);
						this.piece.balance(target[1], true);
					}
				},
				function(){
					return caseInRangeZ(this.piece.cx, this.piece.cy, 2, false)
				}
				
			),
			new Spell("Vital Seed", 6, 5, img.spell.Reine[1], 0, false, this,
				function(){
					if (this.piece.ressource.val < 20) return false;
					let spell = this;
					let targets = this.piece.getCrossRangeTargets(examineBoard(), 3)

					startPieceSelectionHLC(targets, [0,150,0,150], [0,150,0,200],
						function(selected){
							spell.cast(selected);
						}
					)
				},
				function(target){
					let spell = this;
					this.piece.ressource.val -= 20;
					target.applyEffect(
						4,0,0,
						function(){
							heal(target,spell.piece,20)
						},
						false,
						{name: "Vital Seed"}
					);
					if (this.piece.spellBoost){
						selectPiecesConditional(piecesInCases(caseInRangeZ(target.cx,target.cy,3),examineBoard()),
							function(piece){heal(piece, spell.piece, 20)},
							[function(piece){if (piece.player == spell.piece.player) return true ; return false}])
					}
				},
				function(){
					return this.piece.getAtkTargets(undefined,3)
				},
				function(){
					if (this.piece.ressource.val > 19) return true;
				}
				
				
			),
			new Spell("W O L O L O", 10, 10, img.spell.Reine[2], 0, false, this,
				function(){
					let targets = this.piece.getAtkTargets(examineBoard(),2);
					let spell = this;

					startPieceSelectionHLC(targets, [100,0,100,100], [100,0,100,150],
						function(selected){
						spell.cast(selected);}
					)
				},
				function(target){
					this.piece.ressource.val -= 60;
					let spell = this;
					joueur[target.player].piece.spliceItem(target)
					joueur[spell.piece.player].piece.push(target)
					target.player = spell.piece.player;
					var originalTargetColor = target.color;
					target.color = joueur[player].color; //string représentant le couleur de la pièce
					if (img.piece[this.piece.color][target.constructor.name]) target.img = img.piece[this.piece.color][target.constructor.name]
					target.applyEffect(
						4,0,
						function(){
							joueur[target.player].piece.spliceItem(target)
							joueur[target.basePlayer].piece.push(target)
							target.player = target.basePlayer;
							target.color = joueur[player].color; //string représentant le couleur de la pièce
							target.img = (image) ? ((typeof image == "string") ? img.piece[target.color][image] : image) : img.piece[target.color][target.constructor.name]
							if (img.piece[originalTargetColor][target.constructor.name]) target.img = img.piece[originalTargetColor][target.constructor.name]
						},
						0, true,
						{name: "Mind Control"},
						true
					)
					
				},
				function(){
					return this.piece.getAtkTargets(undefined,2) //on appelle la fonction renvoyant les cibles d'attaque sans préciser le board :
					//la fonciton addAtkTarget (utilisée dans cette méthode) réagira en renvoyant toutes les cases dans la portée d'attaque, sans tests d'interactions
				},
				function(){
					if (this.piece.ressource.val == this.piece.ressource.max) return true;
				}
			)
		]
		
		this.shop = [
			new Item("Kind Relic",img.items.Priest[0], 50,
				[function(piece){
					piece.addPassive("onHealing", 
						function(arg){
							arg.heal *= 1.2
						}
					)
				}]
			),
			new Item("Echoing Relic", img.items.Priest[1], 50,
				[],
				function(piece){
					piece.spellBoost = true;
				}
			),
			new Item("Raising Relic", img.items.Priest[2], 50,
				[function(piece){
					piece.addPassive('onHealingDone', 
						(p)=>{
							p.target.applyEffect(1, 
								(piece) => {
									piece.atk += p.heal * 0.05
								}
							)
						}
					),
					piece.addPassive('onDamagingDone', 
						(p)=>{
							p.target.applyEffect(1, 
								(piece) => {
									piece.atk -= p.damage * 0.05
								}
							)
						}
					)
				}],
				null
			)
		]
		
	}
	
	balance(target, second){
		if (!target) return false
		let dmg = 50, baseHeal = 20, scaleHeal = 0.5;
		if (second) dmg = 20, baseHeal = 8, scaleHeal = 0.2;
		if (target.hp > target.maxHP / 2){
			damage(target, this, dmg)
		} else {
			heal(target, this, baseHeal + this.ressource.val * scaleHeal)
		}
	}
	
	getDepl(board){
		let depl = [], cases = [], b = 0;
		let caseTest = function(board, x, y){
			if (board[x][y] && board[x][y].player == this.player) return true
		}.bind(this);
		let lineTest = function(direction){
			b = 0
			let cases = casesInLineS(this.cx,this.cy,direction,5, false)
			for (let i = 0; i < cases.length; i++){
				if (caseTest(board, cases[i][0], cases[i][1])) b = 1
			}
		}.bind(this);
		
		lineTest(3);
		for (let i = 1; i < this.mp + b + 1; i++) {
			if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
		}
		lineTest(1);
		for (let i = -1; i > -this.mp - b - 1; i--) {
			if (addDepl(board,depl,this.cx,this.cy + i) == false) break;
		}
		lineTest(0);
		for (let i = 1; i < this.mp + b + 1; i++) {
			if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
		}
		lineTest(2);
		for (let i = -1; i > -this.mp - b - 1; i--) {
			if (addDepl(board,depl,this.cx + i,this.cy) == false) break;
		}

		return depl;
		
	}
	
	getCrossRangeTargets(board, range){
		let targets = [], case_;
		for (var i = 1; i < range && this.cx + i < config.nCol; i++) {
			case_ = board[this.cx + i][this.cy];
			if (case_ && case_.player == this.player) targets.push(case_)
		}
		for (var i = 1; i < range; i++) {
			case_ = board[this.cx][this.cy + i];
			if (case_ && case_.player == this.player) targets.push(case_)
		}
		for (var i = 1; i < range && this.cx - i > 0; i++) {
			case_ = board[this.cx - i][this.cy];
			if (case_ && case_.player == this.player) targets.push(case_)
		}
		for (var i = 1; i < range; i++) {
			case_ = board[this.cx ][this.cy - i];
			if (case_ && case_.player == this.player) targets.push(case_)
		}
		return targets;
	}
	
	getAtkTargets(board, mp = this.mp + 1){
		var atk = [];
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx,this.cy + i)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx,this.cy - i)) break
		}

		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy)) break
		}
		for (var i = 1; i < mp; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy)) break
		}

		return atk;
	}
	
	onDamagingDone(p){
		this.ressource.val = (this.ressource.val + p.damage * 0.6).max(this.ressource.max);
	}
	
	onStartTurn(){
		this.ressource.val = (this.ressource.val - 5).min(0)
	}
	
}

//Priest.img = "Roi"

return Priest