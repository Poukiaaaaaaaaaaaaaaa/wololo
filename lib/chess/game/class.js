class Joueur {
		//classe représentant un joueur (sa couleur, son nom,ses ressources, ses pièces)
	constructor(color, name) {
		//les paramètres passés au contruceur sont la couleur et le nom; les autre propriétés dépendront de la partie (ressources, pièces)
		this.color = color;
		this.piece = []; //On initialise deux tableaux vides : 'piece', celui des pièces, et prePieces (voir "initPrePieces()")
		this.prePiece = [];
		this.name = name;
		this.gold = config.gold
	}

	initGame(){ //Méthode initialisant le joueur pour une nouvelle partie
		this.mana = config.maxMana;
		this.gold = config.gold;
	}

	startTurn() {
		//méthode permettant de démarrer le tour du joueur: mise à jour de la variable
		//playerTurn, restauration du mana, réinitialisation des cases colorées
		var playerID = getArrayID(joueur,this); //Récupère le numéro du joueur dans le tableau des joueurs
		playerTurn = playerID; //ce numéro devient le nouveau 'playerTurn'
		clearSelectedPiece() //Aucune pièce n'est sélectionnée
		this.mana = config.maxMana;
		for (var i = 0; i < this.piece.length; i++) {
			this.piece[i].startTurnPre();
		}
		for (var i = 0; i < this.piece.length; i++) { //Une fois qu'on a effecté tous les updatePre, on peut commencer à éxécuter les StartTurn
			this.piece[i].startTurn();
		}

		guiElements.player_arrow.update(); //Met à jour la flèche indiquant le joueur en train de jouer
		selectedPiece = 0;
	}
}

class PrePiece { //Les prePiece sont des objets "prévoyant" une pièce : chaque prePiece indique une future pièce qui sera créee au début de la partie
	//les prePieces qu'un joueur possède avant le début de la partie déterminent dont les pièces qu'il possèdera lorsque la partie se lancera
  constructor(Piece,cx,cy,player){ //Une prePieces ne contient comme attribut que
    this.Piece = Piece; //La classe de la pièce à créer
    this.cx = cx; //La position de la future pièce
    this.cy = cy;
    this.player = player; //Le joueur auquel elle appartient
  }

  summon(){ //Crée une pièce (réelle) à partir de cette prePiece
    joueur[this.player].piece.push(new this.Piece(this.cx,this.cy,this.player));
  }

}

class Spell { //Classe définissant un sort d'une pièce
  constructor(name,manaCost,cooldown,img,helpImg,baseLocked,piece,onUsed,effect,getRange){
    this.name = name; //nom
    this.manaCost = manaCost; //coût en mana
    this.img = img; //icône
    this.helpImg = helpImg; //*non-uilisé*
    this.locked = baseLocked; //disponibilité au début de la partie : true si bloqué, un nombre si on veut le bloquer jusqu'à ce que la pièce atteigne le niveau correspondant
    this.onUsed = onUsed; //fonction éxécutée au clic sur l'icône
    this.effect = effect; //effet du sort : peut être lancé directement lors du clic, ou après
  	this.getRange = getRange; //fonction donnant les cases su lesquelles le spell peut agir (s'il agit sur des cases définies)
  	this.piece = piece; //pièce propriétaire
  	this.cooldown = cooldown; //délai de récupération
  	this.actualCooldown = 0; //récupération actuelle
  }

  cast(arg,cost = this.manaCost){ //lance le spell (sera a priori appelée à un moment où un autre dans onUsed() ) :
    if (!joueur || joueur[this.piece.player].mana >= cost){ //si le joueur a assez de mana (ou si aucun joueur n'est défini)
		this.effect(arg) //éxécute l'effet
		if (joueur) joueur[this.piece.player].mana -= cost; //retire le mana au joueur s'il est défini
		this.actualCooldown = this.cooldown //indique qu'il reste un certain nombre de tour avant de pouvoir l'utiliser
	}
  }
  
	unlock(){
		this.locked = false
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

class Effect { //classe représentant les effets sur la durée appliqués aux pièces. A ajouter au tableau .effect d'une pièce pour lui appliquer un effet
	//un effet contient une fonction qui sera appelée à chaque tour, pour s'assurer que l'effet est présent de manière continue, jusqu'à un certain nombre de tour
	constructor(piece,duration,permEffect = 0,endEffect = 0,turnEffect = 0,direct = true,view){
		this.piece = piece; //pièce sur laquelle l'effet agira
		this.turnEffect = turnEffect; //effet continu : sera lancé à chaque début de tour (souvent pour modifier les stats après leur réinitialisation)
		this.endEffect = endEffect; //fcontion à éxécuter lorsque l'effet se termine
		this.duration = duration; //durée de l'effet en tours
		this.remaining = duration;
		this.permEffect = permEffect;
		this.view = view;
	if (view && !view.name && !view.icon) delete this.view
		
		if (direct && this.permEffect) this.permEffect(); //si on a précisé que l'effet était présent dès son applicaiton, on lance son effet continu
	}

	apply(){ //applique l'effet
		if (this.permEffect) this.permEffect(); //lance sa fonction d'effet continu
	}
	
	startTurn(){ //sera lancé au début de chaque tour
		this.remaining--;
		if (this.remaining == 0){ //s'il arrive à sa fin
			if(this.endEffect) this.endEffect(); //lance la fonction de fin
			this.destroy(); //puis le supprime
		}else{
			if (this.turnEffect) this.turnEffect();
			this.apply()
		}
	}
	

	destroy(){
		this.piece.effects.spliceItem(this); //supprime l'effet du tableau piece.effects
	}
}