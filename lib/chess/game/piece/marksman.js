class Marksman extends Piece{
	
	constructor(x, y, player){
		super("Marksman", 20, 50, x, y, player, 3, 60, 30	)
		this.ressource = { color : [255,255,0], bgColor: [100,100,100], val : 3, max : 3, name : "Ammo"}
		
		this.spell = [
			new TogglableSpell("Turret",5,7,img.spell.Fou[0],0,false,this,
				null,null,null,
				function(){
					if (this.active && this.pEffect.c < 3) return false  
					else return true
				},
				new Effect(this, 5, 
					function(){
						this.piece.setPermissions({movement : false})
					},
					function(piece){
						piece.incMaxAmmo(-this.c)
					}, 
					function(){
						this.c++
						this.piece.incMaxAmmo(this.c)
					}, 
					false, {name: "Turret"}
				),
				{
					toggle : function(){
						this.pEffect.c = 0
					}
				}
			),
			new Spell("Twilight Mark", 3, 5, img.spell.Fou[1], 0, false, this,
				function(){
					let board = examineBoard(), spell = this;
					startPieceSelectionHLC(this.piece.getCrossRange(board), [255,0,255,100], [255,0,255,150], 
						function(target){
							spell.cast(target)
						}
					)
				},
				function(target){
					target.applyEffect(2, 
						null,
						function(){
							this.piece.applyEffect(2, null, null, null, false, {name: "Twilight Mark (Charged)"}
							)
						},
						null, false, {name: "Charging Twilight Mark"}
					)
				},
				function(){
					return this.piece.getCrossRange(undefined)
				}
			),
			new Spell("Rocket Jump", 2, 5, img.spell.Fou[2], 0, false, this,
				function(){
						this.cast()
				},
				function(){
					this.piece.applyEffect(
						1, function(piece){
							var fx = this;
							piece.addPassive('onAttackingDone', function(){
								piece.deplCD = false
								
							})
						}
					);
					this.piece.ressource.val = (this.piece.ressource.val - 2).min(0)
					this.piece.updateView()
				},
				null,
				function(){
					return this.piece.ressource.val > 1
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
		let source = this, atk = [];
		selectCases(caseInRangeZ(this.cx, this.cy, 2, false),
			function(x, y){
				addAtkTarget(source, board, atk, x, y)
			}
		)
		return atk;
	}
	
	onAttacking(p){
		var dx = p.target.cx - p.source.cx //distance à parcourir
		var dy = p.target.cy - p.source.cy
		var dist = Math.sqrt(Math.pow(dx,2)+pow(dy,2));
		
		p.dmg *= (2 / 3) * Math.round(dist) 
		
		if (p.target.hasEffect("Marksman-protected")) p.dmg /= 2
		
		if (p.target.hasEffect("Twilight Mark (Charged)")) p.dmg += (0.1 + 0.03 * dist) * p.target.hp
		
		let fx = p.target.hasEffect("Charging Twilight Mark")
		if (fx) fx.destroy()
	}
	
	onAttackingDone(p){
		if (this.ressource.val > 0){
			this.ressource.val -= 1
			this.atkCD = false
		}
		
		p.target.applyEffect(
			1, null, null, null, false, { name: "Marksman-protected" }
		)
		
		this.joueur.mana += Math.floor(config.mana.atk / 2)
		
	}
	
	onStartTurn(){
		this.ressource.val = this.ressource.max;
	}
	
	onStartTurnP(){
		this.ressource.max = 3;
	}
	
	incMaxAmmo(val) {
		this.ressource.max += val
		this.ressource.val += val
	}
	
	getCrossRange(board, mp = this.mp){
		var atk = [];

		for (var i = 1; i < mp - 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy + i)) break
		}
		for (var i = 1; i < mp - 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy + i)) break
		}

		for (var i = 1; i < mp - 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx + i,this.cy - i)) break
		}
		for (var i = 1; i < mp - 1; i++) {
			if (addAtkTarget(this,board,atk,this.cx - i,this.cy - i)) break
		}

		return atk;
	}	
}

Marksman.img = "Fou"

return Marksman