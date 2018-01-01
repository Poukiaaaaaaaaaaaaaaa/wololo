class Pion extends Piece {
  constructor(x, y, player) {

    super(0, "Pion", 50, 120, x, y, player, 3);

    //modification des stats en fonction de la position
    this.rawBaseHP = this.baseHP
    var direction = this.player
    this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
    this.baseHP = this.rawBaseHP + (this.rawBaseHP/50) * this.kyojin
    this.hp = this.hp * this.baseHP / this.rawBaseHP
	this.baseAtk = this.atk
	this.atk = this.baseAtk * ( 1 + this.kyojin / config.nLig)
	

	let spell = [
		new Spell("Holy Duty",8,img.spell.Pion[0],0,0,this,
			function(){
				this.effect()
			},
			function(){
				var spell = this 
				var hpCost = 50
				var board = examineBoard()
				var source = this.piece
				 if (spell.piece.hp > hpCost){
					selectPieces(piecesInCases(caseInRangeZ(spell.piece.cx,spell.piece.cy,1),board),
					   function(target){if (target.player != source.player)damage(target,spell.piece,20)})
					damage(spell.piece,undefPiece,hpCost)
				 }
			}),
		new Spell("Unity",8,img.spell.Pion[1],0,0,this,
			function(){
				let spell = this
				var pieces = []
				var board = examineBoard()
				selectPiecesConditional(piecesInCases(caseInRangeZ(this.piece.cx,this.piece.cy,2),board),
					function(piece){pieces.push(piece)},
					[function(piece){if (piece.player == spell.piece.player) return false ; return true}])
				startSelectionHLC(pieces, [255,0,255,50], [255,0,255,100],
				function(selected){
					spell.effect(selected)
				})
			},
			function(selected){
				let spell = this
				let baseDmg = 20
				let ppDmg = 5 + this.piece.kyojin
				let c = 0
				
				selectPiecesConditional(piecesInCases(caseInRangeZ(this.piece.cx,this.piece.cy,3),examineBoard()),
					function(piece){c++},
					[function(piece){if (piece.player == spell.piece.player && piece.constructor.name == "Pion") return true ; return false}])

				let scaleDmg = c * ppDmg	
					
				damage(selected,this.piece,baseDmg + scaleDmg)
			}),
    ];
	this.spell = spell
  }

  getDepl(board) {
    var depl = [];
  	var startLine = ((this.player == 0) ? 1 : config.nLig - 2);
  	var direction = ((this.player == 0) ? 1 : -1);
  	var mp = (this.cy == startLine) ? this.mp : 1;
  	for (var i = 0; i < mp; i++){
		  if (addDepl(board,depl,this.cx,this.cy + ((i+1)*direction)) == false){break}
	  }

    return depl;
  }

  getAtkRange(board){
	var atk = [];
	var direction = ((this.player == 0) ? 1 : -1);
	var x,y;
	for (var i = -1; i < 2;i++){
		x = this.x + i;
		y = this.y + direction;
		if (x + 1 > 0 && x < config.nCol && y + 1 > 0 && y < config.nLig){
			atk.push([x,y]);
		}
	}
	return atk;
  }

  onMovedDone(arg){
      //modification des stats en fonction de la position
    var direction = this.player
    var prevBaseHP = this.baseHP
    this.kyojin = Math.abs(((config.nLig - 1) * -direction) + this.cy)
    this.baseHP = this.rawBaseHP + (this.rawBaseHP/50) * this.kyojin
    this.hp = this.hp * this.baseHP / prevBaseHP
	this.atk = this.baseAtk * ( 1 + this.kyojin / config.nLig)
  }
}

class Tour extends Piece {
  constructor(x, y, player) {
    super(1, "Tour", 20, 200, x, y, player, 5);
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

  getAtkRange(board){
	var atk = [];
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Fou extends Piece {
  constructor(x, y, player) {
    super(2, "Fou", 50, 70, x, y, player, 5);
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

  getAtkRange(board){
	var atk = [];

	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx + i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Reine extends Piece {
	constructor(x, y, player) {
		super(3, "Reine", 120, 400, x, y, player, 5);
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

  getAtkRange(board){
	var atk = [];

	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx + i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy - i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx - i,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = 1; i < this.mp - 1; i++) {
	  var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }
    for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx,this.cy + i);
      if (atkRt == 2 || !atkRt) break;
    }

    for (var i = 1; i < this.mp - 1; i++) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }
	for (var i = -1; i > -this.mp + 1; i--) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy);
      if (atkRt == 2 || !atkRt) break;
    }

    return atk;
  }
}

class Cavalier extends Piece {
	constructor(x, y, player) {
		super(4, "Cavalier", 80, 50, x, y, player,2);
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

	getAtkRange(board) {
    var atk = [];

    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy + 2);
        if (atkRt == 2 || !atkRt) continue;
		}
		for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + 2,this.cy + i);
        if (atkRt == 2 || !atkRt) continue;
		}
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx + i,this.cy - 2);
        if (atkRt == 2 || !atkRt) continue;
    }
    for (var i = -1; i < 2; i += 2) {
      var atkRt = addAtk(board,atk,this.cx - 2,this.cy + i);
        if (atkRt == 2 || !atkRt) continue;
    }

		return atk;
	}
}

class Roi extends Piece {
  constructor(x, y, player) {
    super(5, "Roi", 30, 400, x, y, player, 2);
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

  getAtkRange(board){
    var atk = [];

    for (var i = 1; i < this.mp; i++) {
      var atkRt = addAtk(board,atk,this.x + i,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
      for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x + i,this.y - i);
        if (atkRt == 2 || !atkRt) break;
      }

      for (var i = 1; i < this.mp; i++) {
        var atkRt = addAtk(board,atk,this.x - i,this.y - i);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x - i,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = 1; i < this.mp; i++) {
      var atkRt = addAtk(board,atk,this.x,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }
      for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x,this.y + i);
        if (atkRt == 2 || !atkRt) break;
      }

      for (var i = 1; i < this.mp; i++) {
        var atkRt = addAtk(board,atk,this.x + i,this.y);
        if (atkRt == 2 || !atkRt) break;
      }
    for (var i = -1; i > -this.mp; i--) {
        var atkRt = addAtk(board,atk,this.x + i,this.y);
        if (atkRt == 2 || !atkRt) break;
      }

      return atk;
  }

  onDying(killer){
    victory = joueur[1-this.player]
  }

}