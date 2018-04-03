class Pion extends Piece {
  constructor(x, y, player) {

    super("Pion", 50, 120, x, y, player, 1, 60, 20); //Appelle le constructeur de la classe parent, Piece, pour créer la pièce de base, avec les paramètres propres au pion

	  var direction = this.player //Initialise la kyojin (avancée), attribut propre au pion qui dépend de sa position sur le board
	  this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
	  let prevMaxHP = this.maxHP;
		this.maxHP += this.kyojin * (this.baseHP / 50) //Les stats du pion sont modifiées en fonction de cette valeur
		this.hp = this.hp * this.maxHP / prevMaxHP;
	  this.atk += this.baseAtk * (this.kyojin / config.nLig);
	
	let spell = [ //Crée le tableau contenant tous les sorts du Pion (voir "class Spell")
		new Spell("Vent Divin",8,1,img.spell.Pion[0],0,0,this, //Nouveau spell : on spécifie son nom, son icône, son coût, le niveau requis, ainsi que :
			function(){ //la fonciton éxécutée lors du clic sur l'icône du spell
				this.cast() //Pour ce spell, l'effet sera directement lancé
			},
			function(){ //la fonction correspondant à l'effet du spell
				var spell = this;
				var hpCost = 50;
				var board = examineBoard();
				var source = this.piece;
				if (spell.piece.hp > hpCost){
					selectPieces(piecesInCases(this.getRange(),board), //Pour chaque pièce dans la portée (tableau de cases) du sort, applique un callback
					   function(target){if (target.player != source.player)damage(target,spell.piece,20)}) //infligeant des dégâts
					damage(spell.piece,undefPiece,hpCost)
				}

			},
			function(){ //la fonction (facultative) retournant la portée du spell sous la forme d'un tableau de cases
				return caseInRangeZ(this.piece.cx,this.piece.cy,1)
			}
		),
		new Spell("Unity",8,3,img.spell.Pion[1],0,true,this,
			function(){
				let spell = this
				var pieces = []
				var board = examineBoard()
				selectPiecesConditional(piecesInCases(this.getRange(),board),
					function(piece){pieces.push(piece)},
					[function(piece){if (piece.player == spell.piece.player) return false ; return true}])
				startPieceSelectionHLC(pieces, [255,0,255,50], [255,0,255,100],
				function(selected){
					spell.cast(selected)
				})
			},
			function(selected){
				let spell = this
				let baseDmg = 20
				let ppDmg = 5 + this.piece.kyojin
				let c = 0
				if (this.piece.spellBoost) baseDmg = 50
				
				selectPiecesConditional(piecesInCases(caseInRangeZ(this.piece.cx,this.piece.cy,3),examineBoard()),
					function(piece){c++},
					[function(piece){if (piece.player == spell.piece.player && piece.constructor.name == "Pion") return true ; return false}])

				let scaleDmg = c * ppDmg

				damage(selected,this.piece,baseDmg + scaleDmg)
			},
			function(){
				return caseInRangeZ(this.piece.cx,this.piece.cy,2)
			}
		),
		new Spell("Flash Wave",5,2,img.spell.Pion[2],0,2,this,
			function(){
				this.cast()
			},
			function(){
				let baseDmg = 20;
				if (this.piece.spellBoost) baseDmg = 50;
				let targets = piecesInCases(this.getRange(), examineBoard())
				for (var i = 0; i < targets.length; i++){  //on n'utilise pas selectPiecesConditional car l'action et la condition sont très simples
					if (targets[i].player != this.piece.player) damage(targets[i],this.piece,baseDmg + this.piece.kyojin * 2)
				}
			},
			function() {return this.piece.getAtkRange()}

		)
    ];
	this.spell = spell;

	this.shop = [
		new Item("Elementalist",img.items.Pion[0],50,
			[],
			function(piece){
				piece.spell[1].unlock()
				piece.spell[2].unlock()
			}
		),
		new Item("Vanguard",img.items.Pion[1],50,
			[function(piece){
				piece.addPassive("onAttacked",
					function(arg){
						arg.dmg = arg.dmg * (1 - (this.kyojin * 3 / 100)) 
					}
				)
			}]
		),
		new Item("Arch-Rook",img.items.Pion[2],50,
			[],
			function(piece){
				piece.spellBoost = true
			},
			function(piece){
				if (piece.hasItem("Elementalist")) return true
			}
		),
	]	
  }	

  
  getDepl(board) { //fonction renvoyant les cases où il est possible de se déplacer (propre à chaque type de pièce)
    var depl = [];
  	var startLine = ((this.player == 0) ? 1 : config.nLig - 2);
  	var direction = ((this.player == 0) ? 1 : -1);
  	var mp = (this.cy == startLine) ? this.mp + 2 : this.mp;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.cx,this.cy + ((i+1)*direction)) == false){break}
	  }

    return depl;
  }

  getAtkRange(){ //fonction n'existant que pour les Pions, renvoyant les cases où il est possible d'attaquer, utile pour le getAtkTargets
	var atk = [];
	var direction = ((this.player == 0) ? 1 : -1);
	var x,y;
	for (var i = -1; i < 2;i++){
		x = this.cx + i;
		y = this.cy + direction;
		if (isOnBoard(x,y)){
			atk.push([x,y]);
		}
	}
	return atk;
  }
  
  getAtkTargets(board){ //fonction renvoyant les cases où il est possible d'attaquer (propre à chaque type de pièce)
	let range = this.getAtkRange(),atk = []
	for (let i = 0; i < range.length; i++) { //pour chaque case du tableau range
		addAtkTarget(this,board,atk,range[i][0],range[i][1])
	}
	return atk
  }
  
	onStartTurn(){ //Passif se lançant au début de chaque tour
		var direction = this.player;
		this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
		//Recalcule la valeur d'avancée (kyojin) et les stats en fonction
		let prevMaxHP = this.maxHP;
		this.maxHP += this.kyojin * (this.baseHP / 50);
		this.hp = this.hp * this.maxHP / prevMaxHP;

		this.atk += this.baseAtk * (this.kyojin / config.nLig);
	}

	permanent(){	
		let prevMaxHP = this.maxHP;
		this.maxHP += this.kyojin * (this.baseHP / 50);
		this.hp = this.hp * this.maxHP / prevMaxHP;

		this.atk += this.baseAtk * (this.kyojin / config.nLig);
	}
	
	onMovedDone(){//Passif se lançant après chaque mouvement
		//Recalcule la valeur d'avancée (kyojin) et les stats en fonction
		var direction = this.player;
		let prevKyojin = this.kyojin;
		this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy);
		this.dKyojin = this.kyojin - prevKyojin;

		let prevMaxHP = this.maxHP;
		this.maxHP += this.dKyojin * (this.baseHP / 50);
		this.hp = this.hp * this.maxHP / prevMaxHP;

		this.atk += this.baseAtk * (this.dKyojin / config.nLig);

	}
}