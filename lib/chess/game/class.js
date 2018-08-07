class Joueur {
		//classe repr�sentant un joueur (sa couleur, son nom,ses ressources, ses pi�ces)
	constructor(color, name) {
		//les param�tres pass�s au contruceur sont la couleur et le nom; les autre propri�t�s d�pendront de la partie (ressources, pi�ces)
		this.color = color;
		this.piece = []; //On initialise deux tableaux vides : 'piece', celui des pi�ces, et prePieces (voir "initPrePieces()")
		this.prePiece = [];
		this.name = name;
		this.gold = config.gold
		this.playedTurns = 0
	}

	initGame(){ //M�thode initialisant le joueur pour une nouvelle partie
		this.mana = config.maxMana;
		this.gold = config.gold;
	}

	startTurn() {
		//m�thode permettant de d�marrer le tour du joueur: mise � jour de la variable
		//playerTurn, restauration du mana, r�initialisation des cases color�es
		var playerID = getArrayID(joueur,this); //R�cup�re le num�ro du joueur dans le tableau des joueurs
		playerTurn = playerID; //ce num�ro devient le nouveau 'playerTurn'
		clearSelectedPiece() //Aucune pi�ce n'est s�lectionn�e
		
		this.playedTurns += 1;
		for (let i = 0; i<joueur.length; i++) {if (turn < joueur[i].playedTurns) turn = joueur[i].playedTurns}
		
		this.mana = config.maxMana;
		this.gold += 50 + (turn * 5);
		
		for (var i = 0; i < this.piece.length; i++) {
			this.piece[i].startTurnPre();
		}
		for (var i = 0; i < this.piece.length; i++) { //Une fois qu'on a effectu� tous les updatePre, on peut commencer � �x�cuter les StartTurn
			this.piece[i].startTurn();
		}

		guiElements.player_arrow.update(); //Met � jour la fl�che indiquant le joueur en train de jouer
		selectedPiece = 0;
	}
	
	startAction(mana){
		this.previousMana = this.mana;
		this.mana -= mana;
	}
	
	endAction(){
		let dMana = this.mana - this.previousMana;
		let manaTXT = new Text("msg",config.hud.manaGauge.x + config.hud.manaGauge.w - config.unit * 6 + (dMana > 9) * 3, config.hud.manaGauge.y,dMana,"Arial",config.hud.manaGauge.h,[0,0,255], LEFT, TOP) //Cr�e un texte bleu "not enough mana"
			applyFadeOut(manaTXT,manaTXT.color,255,0.5) //Le fait dispara�tre en fondu
	}
	
}

class PrePiece { //Les prePiece sont des objets "pr�voyant" une pi�ce : chaque prePiece indique une future pi�ce qui sera cr��e au d�but de la partie
	//les prePieces qu'un joueur poss�de avant le d�but de la partie d�terminent donc les pi�ces qu'il poss�dera lorsque la partie se lancera
  constructor(Piece,cx,cy,player, selected){ //Une prePiece ne contient comme attribut que
    this.Piece = Piece; //La classe de la pi�ce � cr�er
    this.cx = cx; //La position de la future pi�ce
    this.cy = cy;
    this.player = player; //Le joueur auquel elle appartient
	this.selected = selected;
  }

  summon(){ //Cr�e une pi�ce (r�elle) � partir de cette prePiece
	if (this.Piece.constructor.name == "Array"){	
		if (typeof this.selected != "number") {
			console.warn("No specified selection for the multiPiece at (" + this.cx + ";" + this.cy+ ") of player " + this.player);
			this.selected = 0
		}
		joueur[this.player].piece.push(new this.Piece[this.selected](this.cx,this.cy,this.player))
	}else{
		joueur[this.player].piece.push(new this.Piece(this.cx,this.cy,this.player))
	}
  }

}

class Spell { //Classe d�finissant un sort d'une pi�ce
		constructor(name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange,condition){
		this.name = name; //nom
		this.manaCost = manaCost; //co�t en mana
		this.img = img; //ic�ne
		this.helpImg = helpImg; //*non-utilis�*
		this.locked = baseLocked; //disponibilit� au d�but de la partie : true si bloqu�, un nombre si on veut le bloquer jusqu'� ce que la pi�ce atteigne le niveau correspondant
		this.onUsed = onUsed; //fonction �x�cut�e au clic sur l'ic�ne
		this.effect = effect; //effet du sort : peut �tre lanc� directement lors du clic, ou apr�s
		this.getRange = getRange; //fonction donnant les cases sur lesquelles le spell peut agir (s'il agit sur des cases d�finies)
		this.condition = condition //fonction d�terminant si le lancement du spell est possible
		this.piece = piece; //pi�ce propri�taire
		this.cooldown = cooldown; //d�lai de r�cup�ration
		this.actualCooldown = 0; //r�cup�ration actuelle
	}

	cast(arg,cost = this.manaCost, cd = this.cooldown){ //lance le spell (sera a priori appel�e � un moment o� un autre dans onUsed() ) :
		if (this.spendMana(cost)){
			this.effect(arg) //�x�cute l'effet
			this.startCooldown(cd)
		}
	}
  
	unlock(){
		this.locked = false
	}
	
	spendMana(cost = this.manaCost){
		if (typeof cost != "number" || !joueur || joueur[this.piece.player].mana >= cost){ //si le joueur a assez de mana (ou si aucun joueur n'est d�fini)
			if (joueur) joueur[this.piece.player].mana -= cost; //retire le mana au joueur s'il est d�fini
			return true
		}
		return false
	}
	
	startCooldown(cd = this.cooldown){
		if (typeof cd == "number") this.actualCooldown = cd //indique qu'il reste un certain nombre de tour avant de pouvoir l'utiliser
	}
}

class TogglableSpell extends Spell {
	constructor(name, manaCost, cooldown, img, helpImg, baseLocked, piece, onUsed, cast, getRange, condition, effect, callbacks){
	
		onUsed = onUsed || function(){
			if (!this.active) this.cast(null, undefined, null);
			else {
				this.disable()
			}
		}
		
		
		cast = cast || function(){
			if (!this.active) {
				this.toggle()
			}
			
		}
		
		super(name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,cast,getRange,condition)
		this.pEffect = effect;
		this.pEffect.spell = this;
		this.pEffect.aEndEffect = this.pEffect.endEffect
		this.pEffect.endEffect = function(piece, type){
			this.spell.active = false
			this.spell.startCooldown()
			if (this.aEndEffect) this.aEndEffect(piece, type)
		}
		this.callbacks = callbacks;
	}
	
	toggle(){
		this.active = true;
		if (this.callbacks && this.callbacks.toggle) this.callbacks.toggle.bind(this)()
		this.pEffect.init()
	
	}
	
	disable(){
		this.active = false
		if (this.callbacks && this.callbacks.disable) this.callbacks.disable.bind(this)()
		this.pEffect.end("disable")
	}
}

class Item{
	constructor(name,img,cost,effects = [],onBuying,require){
		this.name = name
		this.img = img
		this.cost = cost
		this.effects = effects || []
		this.require = require
		this.onBuying = onBuying
	}
	
	obtain(piece){
		piece.items.push(this);
		piece.items[this.name] = true
		if (this.onBuying) this.onBuying(piece)
		for (let i = 0; i < this.effects.length; i++){
				this.effects[i](piece)
		}	
	}
	
	isBuyable(piece){
		if (joueur[piece.player].gold < this.cost) return false
		if (this.require && !this.require(piece)) return false
		return true
	}
	
	buy(piece){
		if (this.isBuyable(piece)){
			this.obtain(piece)
			joueur[piece.player].gold -= this.cost;
			return true
		}
	}
	
}

class Effect { //classe repr�sentant les effets sur la dur�e appliqu�s aux pi�ces. A ajouter au tableau .effect d'une pi�ce pour lui appliquer un effet
	//un effet contient une fonction qui sera appel�e � chaque tour, pour s'assurer que l'effet est pr�sent de mani�re continue, jusqu'� un certain nombre de tour
	constructor(piece,duration,permEffect = 0,endEffect = 0,turnEffect = 0,direct = true,view, important){
		this.piece = piece; //pi�ce sur laquelle l'effet agira
		this.turnEffect = turnEffect; //effet continu : sera lanc� � chaque d�but de tour (souvent pour modifier les stats apr�s leur r�initialisation)
		this.endEffect = endEffect; //fcontion � �x�cuter lorsque l'effet se termine
		this.duration = duration; //dur�e de l'effet en tours
		this.remaining = duration;
		this.permEffect = permEffect;
		this.view = view;
		this.direct = direct;
		if (view && !view.name && !view.icon) delete this.view;
		this.important = important;
	}

	init(){
		this.piece.effects.push(this)
		if (this.direct && this.permEffect) this.permEffect(this.piece); //si on a pr�cis� que l'effet �tait pr�sent d�s son applicaiton, on lance son effet continu
	}
	
	apply(){ //applique l'effet
		if (this.permEffect) this.permEffect(this.piece); //lance sa fonction d'effet continu
	}
	
	startTurn(){ //sera lanc� au d�but de chaque tour
		this.remaining--;
		if (this.remaining < 1){ //s'il arrive � sa fin
			this.end()
		}else{
			if (this.turnEffect) this.turnEffect(this.piece);
			this.apply()
		}
	}

	end(type){
		if(this.endEffect) this.endEffect(this.piece, type); //lance la fonction de fin
			this.destroy(); //puis le supprime
	}
	
	destroy(){
		this.piece.effects.spliceItem(this); //supprime l'effet du tableau piece.effects
		updatePieces();
	}
}