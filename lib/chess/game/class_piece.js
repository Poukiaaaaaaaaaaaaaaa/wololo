class Piece {
	//classe représentant une pièce en général
	//les différentes pièces seront des classes héritées de celle-ci
	constructor(img,name,atk,hp,cx,cy,player,mp,expValue,spell = []) { //On ne créera jamais d'instances de cette classe directement : ce sont les classes
			//héritant de Piece, les classes qui définissent un pièce en particulier (voir "class Pion"), appelleront elle-même le constructeur de Piece
		  //on passe au constructeur l'image, le nom, les stats, la position initiale, le propriétaire d'une pièce
		  //l'ID d'image, le nom, les stats seront déterminés de manière fixe lors de l'appel du superconstructeur
		  //dans le constructeur des classes héritées (= les pièces en elles mêmes)
		this.img = img; //image représentant la pièce : il s'agit d'un numéro, qui indique une entrée du tableau img.piece.[noir/blanc]
		this.name = name; //nom de la pièce (pas vraiment utilisé)
		this.atk = atk; //stat d'attaque de la pièce
		this.baseAtk = atk //stat d'attaque d'origine de la pièce
		this.baseHP = hp; //stat de pv max d'origine de la pièce
		this.maxHP = hp //stat de pv max de la pièce
		this.hp = hp; //pv actuels de la pièce
		this.mp = mp; //stat de point de déplacements (obsolète)
		this.cx = cx; //position x (en cases)
		this.cy = cy; //position y (en cases)
		this.color = joueur[player].color; //string représentant le couleur de la pièce
		this.player = player; //numéro du joueur possédan la pièce
		this.deplCD = false; //valeur bool indiquant si la pièce peut oui ou non se déplacer (possible une fois par tour)
		this.atkCD = false; //valeur bool indiquant si la pièce peut oui ou non attaquer (possible une fois par tour)
		this.spell = spell; //spells (actifs) de la pièce
		this.addedPassive = initAddedpassivesArrays()
		this.effects = [] //effets appliqués à la pièce
		this.exp = 0 //expérience de la pièce
		this.level = 0 //niveau de la pièce
		this.expValue = expValue //quantité d'exp obtenue en tuant la pièce
		this.baseMp = mp //Points de déplacement à l'origine
		this.items = []
		this.shop = []
		chessGUI.pieces.push(this); //ajout de la pièce au tableau des éléments de la GUI
	}

  draw() {
  //méthode affichant la pièce
    if (!(this.movement)) {this.x = convertPx(this.cx) ; this.y = convertPx(this.cy)} //Si la pièce n'est pas en mouvement (=ne possède pas actuellement d'attribut mouvement), sa position est calculée
      image(img.piece[this.color][this.img], //Affiche l'image de la pièce
            this.x + config.border, this.y + config.border,
            config.tileSize - 2*config.border, config.tileSize - 2*config.border);
      if (selectedPiece == this) //Si la pièce est sélectionnée, affiche l'icône de sélection
        image(img.piece.selection,
              this.x + config.border, this.y + config.border,
              config.tileSize - 2*config.border, config.tileSize - 2*config.border);
      if (isCaseHovered(this.cx,this.cy) && guiState == ""){  //Si la pièce peut être sélectionnée et que la souris passe dessus
        fill(255,255,255,50);
        rect(convertPx(this.cx),convertPx(this.cy), //affiche un indicateur
        config.tileSize, config.tileSize, config.border);
    }

	//affichage de la barre de vie
    fill("red");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize,config.tileSize * 0.2,
    0,0,config.border,config.border);
    fill("green");
    rect(this.x,this.y + config.tileSize * 0.8,
    config.tileSize / this.maxHP * this.hp,config.tileSize * 0.2,
    0,0,config.border,config.border);
  }

  onLeftClick() { //fonction appelée à chaque clic de la souris
    if (isCaseHovered(this.cx,this.cy) && guiState == "") { //si le clic a eu lieu sur cette pièce :
      if (selectedPiece == this) { //Si la pièce était déjà sélectionnée
        clearSelectedPiece(); return; //la déselectionne
      } else { this.select() } //sinon, la sélectionne
    }
  }

  select(){ //Sélectionne la pièce
	clearSelectedPiece(this) //Déselectionne la pièce sélectionnée, puis sélectionne celle-ci
    if (playerTurn == this.player){
		if (!this.cc) this.viewRanges(); //on affiche les portées d'attaque et de déplacement

		for (var i = 0; i < this.spell.length; i++){ //Affichage des icônes des sorts
		  new SpellIcon(config.hud.spells.x + i * (config.hud.spells.spellSize * 1.1),config.hud.spells.y,config.hud.spells.spellSize,config.hud.spells.spellSize,this.spell[i])
		}
	}
  }

  deselect(){ //Déselectionne la pièce
    clearGUI("pieceHUD") //Vide la partie de la GUI liée aux pièces
	if (this.deplSpell){
		for (let i = 0; i < this.deplSpell.length; i++){
			this.deplSpell[i].active = false
		}
	}
  }

  viewRanges() { 	  //affiche les portées d'attaque et de déplacement (= cases où ils est possible de se déplacer + pièces attaquables)
    var board = examineBoard();  //récupération du tableau représentant l'échiquier
    var depl = this.getDepl(board); //récupération de la liste des cases où il est possible de de d?placer
									//la m?thode getDepl est d?finie dans chaque classe de pi?ce, le d?placement ?tant propre ? celle-ci

  	var color;
  	var hoverColor;
  	var callback;

  	//ATTAQUE
  	var atk = this.getAtkTargets(board); //Récupère les cases sur lesquelles on peut attaquer (sous forme de tableau de pièces)
  	var HLCase;

    clearGUI("highlightCase"); //Supprime les cases colorées

    if (!this.atkCD){ //Uniquement si atkCD est à false, c'est à dire si la pièce n'a pas encore attaqué
		//Préparation des highlightCase qui indiqueront les cases où il est possible d'attaquer
    	if (joueur[playerTurn].mana >= config.mana.atk){ //Si la pièce 	a assez de mana pour attaquer
    		color = [255,0,0,120]; //On choisit un rouge foncé pour indiquer les cases
    		hoverColor = [255,100,100,120];
    		callback = function(){ this.piece.attack(this.target) ; this.piece.viewRanges() } //Le callback des HighlightCase aura pour effet d'attaquer
    	} else { //Sinon, on choisit une couleur plus claire, et le callback aura pour effet d'afficher le texte "not enough mana"
    		color = [190,0,0,50];
    		hoverColor = [190,100,100,50];
    		callback = function(){ this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) ; this.piece.viewRanges()}
    	}

    	for (var i = 0; i < atk.length; i++) { //Pour chaque case du tableau
    		if (atk[i].player != this.player){ //si la case contient une pièce ennemie 
    			HLCase = new HighlightCase(atk[i].cx,atk[i].cy, //On y crée une HighLlighCase
    			color,hoverColor,this,callback);
    			HLCase.target = atk[i];
    		}
    	}
    }

    //D?PLACEMENTS
	//Idem que pou l'attaque : les highlightCase sont crées sur les cases (vides) dans la portée de déplacement de la pièce
    if (this.deplCD == false){
    	if (joueur[playerTurn].mana >= config.mana.depl){
    		color = [0,0,255,120];
    		hoverColor = [100,100,255,120];
    		callback = function(){ this.piece.depl(this.x,this.y); this.piece.deplCD = true ; this.piece.viewRanges()}
    	} else {
    		color = [0,0,190,50]
    		hoverColor = [100,100,190,50]
    		callback = function(){this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) ; this.piece.viewRanges()}
    	}

      for (var i = 0; i < depl.length; i++) {
        new HighlightCase(depl[i][0],depl[i][1],
    	       color,hoverColor,this,callback);
      }
    }
  }

  attack(target){ //Déclenche une attaque "de base" sur une pièce

	if (joueur[playerTurn].mana >= config.mana.atk){ //Uniquement si la pièce possède assez de mana
		let parameters = {source : this, dmg : this.atk, target: target}
		if (target.callPassive("onAttacked",parameters) == true) return true //Appel des passifs se délclenchant lors d'une attaque
		if (this.callPassive("onAttacking",parameters) == true) return true //Si 'lun d'eux renvoie true, l'attaque est annulée
		
		damage(target,parameters.source, parameters.dmg) //inflige des dégâts correspondants à la stat d'attaque de la pièce
		joueur[playerTurn].mana -= config.mana.atk //Retire à la pièce le mana correspondant au coût d'une attaque de base
		this.atkCD = true
		
		target.callPassive("onAttackedDone",parameters)
		this.callPassive("onAttackingDone",parameters)
	}

  }
  

	depl(cx,cy){ //Déclenche un déplacement
		if (joueur[playerTurn].mana >= config.mana.depl){ //Si la pièce a assez de mana
			this.move(cx,cy) //elle est déplacée à la position choisie (passée en paramètre de .depl)
			joueur[this.player].mana -= config.mana.depl; //Retire à la pièce le mana correspondant au coût d'un déplacement
			if (this.deplSpell){
				for (let i = 0; i < this.deplSpell.length; i++){
					if (this.deplSpell[i].active) this.deplSpell[i].cast({x: cx, y: cy})
				}
			}
		}
	}

  move(cx,cy,animation = true, type = {}) { //Déplace la pièce. Il ne s'agit pas nécessairement d'un déplacement "normal" de la pièce : la pièce peut être déplacée pour d'autres raisons
	let p = {x: cx, y: cy, ox: this.cx, oy: this.cy, type: type}
	this.callPassive("onMoved",p) //Appelle le passif de la pièce se déclenchant lors d'un mouvement
  	this.cx = cx;  //Modifie la position de la pièce
  	this.cy = cy;
    this.callPassive("onMovedDone",p)

    if (animation) move(this,0.8,convertPx(cx),convertPx(cy)); //Déclenche une animation de mouvement, de la position de départ à la pisition d'arrivée
	updatePieces()
  }

  // Fonctions à redéfinir dans chaque classe piece : renvoient les cases sur lesquelles il est possible d'attaquer/se déplacer
  getDepl(board){
	 return [];
  }

  getAtkTargets(board){
	 return [];
  }

  noManaError(x,y){ //Affiche, à une position spécifiée, un message d'erreur "not enough mana"
    {
      let manaTXT = new Text("msg",x,y,"Not\nenough\nmana","Arial",config.unit * 2,[0,0,255]) //Crée un texte bleu "not enough mana"
      applyFadeOut(manaTXT,manaTXT.color,255,0.5) //Le fait disparaître en fondu
    }
  }

	callPassive(passive,arg,env = {}){ //Appelle un "passif" de la pièce. Les passifs sont des sorts se déclenchant d'eux mêmes à divers moments.
	//Il s'agit de méthodes "on________()" crées dans les classes de chaque pièce. Lors de chaque évènement pouvanr déclencher un passif,
	//cette méthode est appelée, en spécifiant le passif correspondant.
		
		if (typeof this[passive] == "function"){ //Si cette méthode existe
			if (this[passive](arg,env) == true) return true; //la lance
		}
		if (this.addedPassive){
			if (!this.addedPassive[passive]) {console.error(passive + "is not a valid passive event") ; return false}
			for (let i = 0; i < this.addedPassive[passive].length; i++){
				if (this.addedPassive[passive][i](arg,env) == true) return true
			}
		}
	}

	addPassive(event,passive){ //Ajoute un passif à la pièce
		//event : l'évènement durant lequel le passif se déclenchera ; passive : la fonction du passif
		this.addedPassive[event].push(passive.bind(this))
	}

	set bAtk(v){
		let prevBaseAtk = this.baseAtk
		this.baseAtk = v //Augmente l'attaque de base de la pièce
		this.atk = this.atk * this.baseAtk / prevBaseAtk //met à jour la valeur d'attaque actuelle
	}
	
	set bHP(v){
		let prevBaseHP = this.baseHP //Idem pour les HP
		this.baseHP = v
		this.maxHP = this.maxHP * this.baseHP / prevBaseHP
		this.hp = this.hp * this.baseHP / prevBaseHP
	}
	
	get bAtk(){
		return this.baseAtk
	}
	
	get bHP(){
		return this.baseHP
	}
	
	set mHP(v){
		let prevMaxHP = this.maxHP;
		this.maxHP = v
		this.hp = this.hp * this.maxHP / prevMaxHP;
	}
	
	get mHP(){
		return this.maxHP
	}	
	
	updatePre(){ //éxécuté au début du tour avant update (doit être exécuté pour toutes les pièces avant qu'on commence à éxécuter les StartTurn)
		//Réinitialise les stats (les remet aux valeurs de base de la pièce)
		this.atk = this.baseAtk;
		let prevMaxHP = this.maxHP;
		this.maxHP = this.baseHP;
		this.hp = this.hp * this.maxHP / prevMaxHP;
		for (var i = 0; i < this.spell.length; i++){
			if (this.spell[i].actualCooldown > 0) this.spell[i].actualCooldown--;
		}
		this.mp = this.baseMp;
		this.addedPassive = initAddedpassivesArrays()
		this.cc = false
		
	}
	
	startTurnPre(){
		this.updatePre()
		this.deplCD = false; //Met les atkCD et deplCD à false, indiquant que ces actions sont disponibles
		this.atkCD = false;
	}
	
	update(){
		for (let i = 0; i < this.effects.length; i++){
			this.effects[i].apply()
		}
		for (let i = 0; i < this.items.length; i++){	
			for (let j = 0; j < this.items[i].effects.length; j++){
				this.items[i].effects[j](this)
			}	
		}
		this.callPassive("permanent")
	}
	
	startTurn(){ //a ne pas confondre avec le passif onStartTurn : fonction éxécutée au début de chaque tour
		for (let i = 0; i < this.effects.length; i++){
				this.effects[i].startTurn();
		}
		for (let i = 0; i < this.items.length; i++){	
			for (let j = 0; j < this.items[i].effects.length; j++){
				this.items[i].effects[j](this)
			}	
		}
		this.callPassive("onStartTurn"); //Appel de l'éventuel passif se déclenchant au début de chaque tour
	}
		
	applyEffect(duration,perm,end,turn,direct,view,uniqueEffect){ // Applique un effet à la pièce (voir "class Effect")
		if (uniqueEffect && this.hasEffect(view.name)) return false
		
		let effect = new Effect(this,duration,perm,end,turn,direct,view)
		this.effects.push(effect); return effect
	}

	showStats() { //Affiche les caractéristiques de la pièce dans une fenêtre (fw.js)
		let expText = (this.level >= config.expLevels.length) ? "" :"/" + config.expLevels[this.level];
		let color = this.player ? "Black" : "White";
		let elements = [
		  [ { type: "text", coord: { x: 0, y: 0 }, text: "Health Points: " + Math.floor(this.hp) + "/" + Math.floor(this.maxHP), size: config.unit*2, color: [210, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*2 }, text: "Attack Points: " + Math.floor(this.atk), size: config.unit*2, color: [255, 210, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*4 }, text: "Color: " + color, size: config.unit*2, color: [255, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*11.6 }, text: "Level: "+this.level, size: config.unit*2, color: [150,150,255] },
			{ type: "text", coord: { x: 0, y: config.unit*13.6 }, text: "Experience: "+this.exp + expText, size: config.unit*2, color: [150,150,255]}]
		];
		clearGUI("windows");
		let win = new Window(config.hud.statsWindow.x, config.hud.statsWindow.y,config.hud.statsWindow.w,config.hud.statsWindow.h, "Stats", elements);
		let viewAbleFX = []
		for (let i = 0; i < this.effects.length; i++){
			if (this.effects[i].view) viewAbleFX.push(this.effects[i])
		}
		win.effectsView = viewAbleFX
		win.elements[0].text.push({
			x: win.x + win.eleBorder,
			y: config.unit *6 + win.y + win.eleBorder + win.headerSize,
			size: config.unit * 2,
			win : win,
			color : [255,0,255],
			viewEffects : function(){
				let y = (mouseY + config.unit * (1 + 2*this.win.effectsView.length) < window.innerHeight) ? mouseY : mouseY - config.unit * (1 + 2*this.win.effectsView.length)
				let w = config.unit * 30
				let h = config.unit * 2 * (1 + this.win.effectsView.length)
				fill([0,10,20])
				rect(mouseX,y,w,h)
				fill(255)
				for (let i = 0; i < this.win.effectsView.length; i++){
					if (this.win.effectsView[i].view.icon) image(this.win.effectsView[i].view.icon,mouseX + config.unit, mouseY + config.unit * (1 + 3*i), config.unit * 2, config.unit * 2) ;
					if (this.win.effectsView[i].view.name) text(this.win.effectsView[i].view.name, mouseX + config.unit * 4, y + config.unit * (1 + 3*i) , config.unit * 30)
				}
			},
			draw: function(){
				textFont("Verdana")
				textSize(this.size)
				textAlign(LEFT,TOP)
				fill(this.color)
				text("Effects : " + this.win.effectsView.length,this.x,this.y)
				if (isHovered(this.x,this.y,this.win.w,this.size) && this.win.effectsView.length) this.viewEffects()
			}
		})
	}
	
	showShop(itemIndex){
	let buyButton = function(piece){
		if (this.buy(piece)) piece.showShop(piece.shopWin.pageCounter)
	}
	let buyButtonHover = function(){
		fill([255,255,255,50]);
		rect(this.x,this.y,this.w,this.h);
	}
	let elements = []
	for (let i = 0; i < this.shop.length; i++){
		let hasItem = this.hasItem(this.shop[i])
		elements[i] = [
			{ type: "image", coord: { x: config.unit, y: config.unit, w: config.unit*6, h: config.unit*6}, img: this.shop[i].img},
			{ type: "text", coord: { x: config.unit * 8, y: config.unit}, text: this.shop[i].name, color: (hasItem) ? [0,255,0] : 255, size: config.unit * 2},
			{ type: "text", coord: { x: config.unit * 8, y: config.unit * 4}, text: "Cost : " + this.shop[i].cost, color: [255,255,0], size: config.unit * 2}
		]
		if (!hasItem && this.shop[i].isBuyable(this)) elements[i].push(
		{ type: "button", coord: { x: config.unit, y: config.unit * 8, w: config.unit*8, h: config.unit*5}, img: img.HUD[7], callback: buyButton.bind(this.shop[i],this), hovercallback: buyButtonHover})
	}
	this.shopWin = new Window(config.hud.statsWindow.x, config.hud.statsWindow.y,config.hud.statsWindow.w,config.hud.statsWindow.h, "Shop", elements, itemIndex);
	}

	gainExp(exp){ //Ajoute de l'expérience à la pièce
		this.exp += exp //ajout de l'exp

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1);  //on teste si l'exp
																					//a dépassé un nouveau niveau
	}

	levelUp(){ //La pièce gagne un nouveau niveau
		this.level += 1

		this.bAtk *= 1.1 //Augmente l'attaque de base de la pièce

		this.bHP *= 1.1

		for (var i = 0; i < this.spell.length; i++){ //Teste si un des sorts nécessite d'avoir le niveau nouvellement acquis
			if (this.spell[i].locked){
				if (typeof this.spell[i].locked == "number" && this.level >= this.spell[i].locked){
					this.spell[i].locked = false //Si oui, le débloque
				}
			}
		}

        let levelUpTXT = new Text("msg", convertPx(this.cx) + config.tileSize / 2, convertPx(this.cy) + config.tileSize / 2, "Level Up","Arial",config.unit * 4,[0,0,255])
        applyFadeOut(levelUpTXT,levelUpTXT.color,255,0.3) //Affiche un texte "level up" et le fait disparaitre en fondu

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1) //si l'exp a dépassé un autre niveau, on répète l'opération

	}
	
	updateView(){
		if (selectedPiece == this){ //si la pièce est sélectionnée
			this.select()
		}
	}

	hasItem(item){
		if (typeof item == "string") {if (this.items[item]) return true} else
		if (getArrayID(this.items,item) !== false) return true
		return false
	}
	
	obtainItem(item){
		if (typeof item == "number"){this.obtainItem(this.shop[item])} else item.obtain(this)
	}
	
	buyItem(item){
		if (typeof item == "number"){this.buyItem(this.shop[item])} else item.buy(this)
	}
	
	hasEffect(effect){
		if (typeof effect == "string"){
			for (let i = 0; i < this.effects.length; i++){
				if (this.effects[i].view && this.effects[i].view.name == effect) return true
			}
		}
		return false
	}
	
	set test(arg){
		console.log("ok")	
	}
}

//Les classes suivantes sonrt les classes-pièces. Chacune hérite de la clase pièce, et définit une pièce particulière
//Ce sont ces classes qui seront instanciées pour créer une nouvelle pièce

include("lib/chess/game/piece/pion.js")
include("lib/chess/game/piece/tour.js")
include("lib/chess/game/piece/fou.js")
include("lib/chess/game/piece/cavalier.js")
include("lib/chess/game/piece/reine.js")
include("lib/chess/game/piece/roi.js")