class Priest extends Piece{
	constructor(x, y, player){
		super("Priest", 180, 40, x, y, player, 2, 50, 30);	
		this.vp = 0;
		
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

Priest.img = "Roi"

return Priest