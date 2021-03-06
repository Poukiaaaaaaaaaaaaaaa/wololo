class Piece {
	//classe repr�sentant une pi�ce en g�n�ral
	//les diff�rentes pi�ces seront des classes h�rit�es de celle-ci
	constructor(name,atk,hp,cx,cy,player,mp,expValue = 0, goldValue = 0, image = this.constructor.img) { //On ne cr�era jamais d'instances de cette classe directement : ce sont les classes
			//h�ritant de Piece, les classes qui d�finissent un pi�ce en particulier (voir "class Pion"), appelleront elle-m�me le constructeur de Piece
		  //on passe au constructeur l'image, le nom, les stats, la position initiale, le propri�taire d'une pi�ce
		  //l'ID d'image, le nom, les stats seront d�termin�s de mani�re fixe lors de l'appel du superconstructeur
		  //dans le constructeur des classes h�rit�es (= les pi�ces en elles m�mes)
		  this.name = name; //nom de la pi�ce (pas vraiment utilis�)
		this.atk = atk; //stat d'attaque de la pi�ce
		this.baseAtk = atk //stat d'attaque d'origine de la pi�ce
		this.baseHP = hp; //stat de pv max d'origine de la pi�ce
		this.maxHP = hp //stat de pv max de la pi�ce
		this.hp = hp; //pv actuels de la pi�ce
		this.mp = mp; //stat de point de d�placements
		this.cx = cx; //position x (en cases)
		this.cy = cy; //position y (en cases)
		this.color = joueur[player].color; //string repr�sentant le couleur de la pi�ce
		this.img = (image) ? ((typeof image == "string") ? img.piece[this.color][image] : image) : img.piece[this.color][this.constructor.name]
		this.basePlayer = player;
		this.player = player; //num�ro du joueur poss�dan la pi�ce
		this.deplCD = false; //valeur bool indiquant si la pi�ce peut oui ou non se d�placer (possible une fois par tour)
		this.atkCD = false; //valeur bool indiquant si la pi�ce peut oui ou non attaquer (possible une fois par tour)
		this.addedPassive = initAddedpassivesArrays()
		this.effects = [] //effets appliqu�s � la pi�ce
		this.exp = 0 //exp�rience de la pi�ce
		this.level = 0 //niveau de la pi�ce
		this.expValue = expValue //quantit� d'exp obtenue en tuant la pi�ce
		this.goldValue = goldValue //idem pour les goldes
		this.baseMp = mp //Points de d�placement � l'origine
		this.items = [];
		this.shop = [];
		this.spell = [];
		this.setPermissions();
		chessGUI.pieces.push(this); //ajout de la pi�ce au tableau des �l�ments de la GUI
		
		this.isPiece = true;
	}

	draw() {
	//m�thode affichant la pi�ce
		if (!(this.movement)) {this.x = convertPx(this.cx) ; this.y = convertPx(this.cy)} //Si la pi�ce n'est pas en mouvement (=ne poss�de pas actuellement d'attribut mouvement), sa position est calcul�e
		image(this.img, //Affiche l'image de la pi�ce
			this.x + config.border, this.y + config.border,
			config.tileSize - 2*config.border, config.tileSize - 2*config.border);
		if (selectedPiece == this) //Si la pi�ce est s�lectionn�e, affiche l'ic�ne de s�lection
			image(img.piece.selection,
			this.x + config.border, this.y + config.border,
			config.tileSize - 2*config.border, config.tileSize - 2*config.border);
		if (isCaseHovered(this.cx,this.cy) && guiState == ""){  //Si la pi�ce peut �tre s�lectionn�e et que la souris passe dessus
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
		if (this.ressource){
			fill(this.ressource.bgColor);
			rect(this.x, this.y + config.tileSize * 0.7,
				config.tileSize, config.tileSize * 0.1
			)
			fill(this.ressource.color);
			rect(this.x, this.y + config.tileSize * 0.7,
				(config.tileSize / this.ressource.max) * this.ressource.val, 
				config.tileSize * 0.1
			)
		}
	}

	onLeftClick() { //fonction appel�e � chaque clic de la souris
		if (isCaseHovered(this.cx,this.cy) && guiState == "") { //si le clic a eu lieu sur cette pi�ce :
			if (selectedPiece == this) { //Si la pi�ce �tait d�j� s�lectionn�e
				clearSelectedPiece(); return; //la d�selectionne
			} else { this.select() } //sinon, la s�lectionne
		}
	}

	select(){ //S�lectionne la pi�ce
		clearSelectedPiece(this) //D�selectionne la pi�ce s�lectionn�e, puis s�lectionne celle-ci
		if (playerTurn == this.player){
			this.viewRanges(); //on affiche les port�es d'attaque et de d�placement

			for (var i = 0; i < this.spell.length; i++){ //Affichage des ic�nes des sorts
				new SpellIcon(config.hud.spells.x + i * (config.hud.spells.spellSize * 1.1),config.hud.spells.y,config.hud.spells.spellSize,config.hud.spells.spellSize,this.spell[i])
			}
		}
	}

	deselect(){ //D�selectionne la pi�ce
		clearGUI("pieceHUD") //Vide la partie de la GUI li�e aux pi�ces
		if (this.deplSpell){
			for (let i = 0; i < this.deplSpell.length; i++){
				this.deplSpell[i].active = false
			}
		}
	}

	viewRanges() { 	  //affiche les port�es d'attaque et de d�placement (= cases o� ils est possible de se d�placer + pi�ces attaquables)
		var board = examineBoard();  //r�cup�ration du tableau repr�sentant l'�chiquier
		var depl = this.getDepl(board); //r�cup�ration de la liste des cases o� il est possible de de d?placer
											//la m?thode getDepl est d?finie dans chaque classe de pi?ce, le d?placement ?tant propre ? celle-ci

		var color;
		var hoverColor;
		var callback;

		//ATTAQUE
		var atk = this.getAtkTargets(board); //R�cup�re les cases sur lesquelles on peut attaquer (sous forme de tableau de pi�ces)
		var HLCase;

		clearGUI("highlightCase"); //Supprime les cases color�es

		if (!this.atkCD && this.perm.attack && atk){ //Uniquement si atkCD est � false, c'est � dire si la pi�ce n'a pas encore attaqu�
			//Pr�paration des highlightCase qui indiqueront les cases o� il est possible d'attaquer
			if (joueur[playerTurn].mana >= config.mana.atk){ //Si la pi�ce 	a assez de mana pour attaquer
				color = [255,0,0,120]; //On choisit un rouge fonc� pour indiquer les cases
				hoverColor = [255,100,100,120];
				callback = function(){ this.piece.attack(this.target) ; this.piece.viewRanges() } //Le callback des HighlightCase aura pour effet d'attaquer
			} else { //Sinon, on choisit une couleur plus claire, et le callback aura pour effet d'afficher le texte "not enough mana"
				color = [190,0,0,50];
				hoverColor = [190,100,100,50];
				callback = function(){ this.piece.noManaError(convertPx(this.x) + config.tileSize / 2,convertPx(this.y) + config.tileSize / 2) ; this.piece.viewRanges()}
			}

			for (var i = 0; i < atk.length; i++) { //Pour chaque case du tableau
				if (atk[i].player != this.player){ //si la case contient une pi�ce ennemie 
					HLCase = new HighlightCase(atk[i].cx,atk[i].cy, //On y cr�e une HighLlighCase
					color,hoverColor,this,callback);
					HLCase.target = atk[i];
				}
			}
		}

		//D?PLACEMENTS
		//Idem que pou l'attaque : les highlightCase sont cr�es sur les cases (vides) dans la port�e de d�placement de la pi�ce
		if (!this.deplCD && this.perm.movement){
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
	
	updateView(){
		if (selectedPiece == this){ //si la pi�ce est s�lectionn�e
			this.select()
		}
	}

	attack(target){ //D�clenche une attaque "de base" sur une pi�ce

		if (joueur[playerTurn].mana >= config.mana.atk){ //Uniquement si la pi�ce poss�de assez de mana
			let parameters = {source : this, dmg : this.atk, target: target}
			if (target.callPassive("onAttacked",parameters) == true) return true //Appel des passifs se d�lclenchant lors d'une attaque
			if (this.callPassive("onAttacking",parameters) == true) return true //Si 'lun d'eux renvoie true, l'attaque est annul�e
			
			this.joueur.startAction(config.mana.atk) //Retire � la pi�ce le mana correspondant au co�t d'une attaque de base
			damage(target,parameters.source, parameters.dmg) //inflige des d�g�ts correspondants � la stat d'attaque de la pi�ce
			this.atkCD = true
			
			target.callPassive("onAttackedDone",parameters)
			this.callPassive("onAttackingDone",parameters)
			
			this.joueur.endAction()
			
		}

	}
  

	depl(cx,cy){ //D�clenche un d�placement
		if (joueur[playerTurn].mana >= config.mana.depl){ //Si la pi�ce a assez de mana
			this.joueur.startAction(config.mana.depl)
			this.move(cx,cy) //elle est d�plac�e � la position choisie (pass�e en param�tre de .depl)
			if (this.deplSpell){
				for (let i = 0; i < this.deplSpell.length; i++){
					if (this.deplSpell[i].active) this.deplSpell[i].cast({x: cx, y: cy})
				}
			}
			this.joueur.endAction()
		}
	}

	move(cx,cy,animation = true, type = {}) { //D�place la pi�ce. Il ne s'agit pas n�cessairement d'un d�placement "normal" de la pi�ce : la pi�ce peut �tre d�plac�e pour d'autres raisons
		let p = {x: cx, y: cy, ox: this.cx, oy: this.cy, type: type}
		this.callPassive("onMoved",p) //Appelle le passif de la pi�ce se d�clenchant lors d'un mouvement
		this.cx = cx;  //Modifie la position de la pi�ce
		this.cy = cy;
		this.callPassive("onMovedDone",p)

		if (animation) move(this,0.8,convertPx(cx),convertPx(cy)); //D�clenche une animation de mouvement, de la position de d�part � la pisition d'arriv�e
		updatePieces()
	}

	  // Fonctions � red�finir dans chaque classe piece : renvoient les cases sur lesquelles il est possible d'attaquer/se d�placer
	getDepl(board){
		return [];
	}

	getAtkTargets(board){
		return [];
	}

	callPassive(passive,arg,env = {}){ //Appelle un "passif" de la pi�ce. Les passifs sont des sorts se d�clenchant d'eux m�mes � divers moments.
	//Il s'agit de m�thodes "on________()" cr�es dans les classes de chaque pi�ce. Lors de chaque �v�nement pouvanr d�clencher un passif,
	//cette m�thode est appel�e, en sp�cifiant le passif correspondant.
		
		if (typeof this[passive] == "function"){ //Si cette m�thode existe
			if (this[passive](arg,env) == true) return true; //la lance
		}
		if (this.addedPassive){
			if (!this.addedPassive[passive]) {console.error(passive + "is not a valid passive event") ; return false}
			for (let i = 0; i < this.addedPassive[passive].length; i++){
				if (this.addedPassive[passive][i](arg,env) == true) return true
			}
		}
	}

	addPassive(event,passive){ //Ajoute un passif � la pi�ce
		//event : l'�v�nement durant lequel le passif se d�clenchera ; passive : la fonction du passif
		this.addedPassive[event].push(passive.bind(this))
	}

	set bAtk(v){
		let prevBaseAtk = this.baseAtk
		this.baseAtk = v //Augmente l'attaque de base de la pi�ce
		this.atk = this.atk * this.baseAtk / prevBaseAtk //met � jour la valeur d'attaque actuelle
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
	
	updatePre(){ //�x�cut� au d�but du tour avant update (doit �tre ex�cut� pour toutes les pi�ces avant qu'on commence � �x�cuter les StartTurn)
		//R�initialise les stats (les remet aux valeurs de base de la pi�ce)
		this.atk = this.baseAtk;
		let prevMaxHP = this.maxHP;
		this.maxHP = this.baseHP;
		this.hp = this.hp * this.maxHP / prevMaxHP;
		this.mp = this.baseMp;
		this.addedPassive = initAddedpassivesArrays()
		this.setPermissions()
		
	}
	
	startTurnPre(){
		this.updatePre()
		for (var i = 0; i < this.spell.length; i++){
			if (this.spell[i].actualCooldown > 0) this.spell[i].actualCooldown--;
		}
		this.deplCD = false; //Met les atkCD et deplCD � false, indiquant que ces actions sont disponibles
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
	
	startTurn(){ //a ne pas confondre avec le passif onStartTurn : fonction �x�cut�e au d�but de chaque tour
		this.callPassive("onStartTurnP")
		for (let i = 0; i < this.effects.length; i++){
				this.effects[i].startTurn();
		}
		for (let i = 0; i < this.items.length; i++){	
			for (let j = 0; j < this.items[i].effects.length; j++){
				this.items[i].effects[j](this)
			}	
		}
		this.callPassive("onStartTurn"); //Appel de l'�ventuel passif se d�clenchant au d�but de chaque tour
	}
		
	applyEffect(duration,perm,end,turn,direct,view,uniqueEffect){ // Applique un effet � la pi�ce (voir "class Effect")
		if (uniqueEffect && view && this.hasEffect(view.name)) return false
		
		let effect = new Effect(this,duration,perm,end,turn,direct,view);
		effect.init()
		return effect;
	}
	
	hasEffect(effect){
		if (typeof effect == "string"){
			for (let i = 0; i < this.effects.length; i++){
				if (this.effects[i].view && this.effects[i].view.name == effect) return this.effects[i]
			}
		}
		return false
	}
	
	setPermissions(set){
		this.perm = {
			movement : true,
			attack : true,
			spell : true,
		}.assign(set)
	}

	showStats() { //Affiche les caract�ristiques de la pi�ce dans une fen�tre (fw.js)
		let expText = (this.level >= config.expLevels.length) ? "" :"/" + config.expLevels[this.level];
		let color = this.player ? "Black" : "White";
		let elements = [
		  [ { type: "text", coord: { x: 0, y: 0 }, text: "Health Points: " + Math.floor(this.hp) + "/" + Math.floor(this.maxHP), size: config.unit*2, color: [210, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*2 }, text: "Attack Points: " + Math.floor(this.atk), size: config.unit*2, color: [255, 210, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*4 }, text: "Color: " + color, size: config.unit*2, color: [255, 255, 210] },
			{ type: "text", coord: { x: 0, y: config.unit*11.6 }, text: "Level: "+this.level, size: config.unit*2, color: [150,150,255] },
			{ type: "text", coord: { x: 0, y: config.unit*13.6 }, text: "Experience: "+this.exp + expText, size: config.unit*2, color: [150,150,255]}]
		];
		if (this.ressource) elements[0].push(
			{ type: "text", coord: { x: 0, y: config.unit*8 }, text: (this.ressource.name || "Ressource") + " : " + this.ressource.val, size: config.unit * 2, color: this.ressource.color}
		)
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
				let w = config.unit * 35
				let h = config.unit * 2 * (1 + this.win.effectsView.length)
				fill([0,10,20])
				rect(mouseX,y,w,h)
				fill(255)
				for (let i = 0; i < this.win.effectsView.length; i++){
					if (this.win.effectsView[i].view.icon) image(this.win.effectsView[i].view.icon,mouseX + config.unit, mouseY + config.unit * (1 + 3*i), config.unit * 2, config.unit * 2) ;
					if (this.win.effectsView[i].view.name) text(this.win.effectsView[i].view.name, mouseX + config.unit * 4, y + config.unit * (1 + 3*i))
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

	gainExp(exp){ //Ajoute de l'exp�rience � la pi�ce
		this.exp += exp //ajout de l'exp

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1);  //on teste si l'exp
																					//a d�pass� un nouveau niveau
	}

	levelUp(){ //La pi�ce gagne un nouveau niveau
		this.level += 1

		this.bAtk *= 1.1 //Augmente l'attaque de base de la pi�ce

		this.bHP *= 1.1

		for (var i = 0; i < this.spell.length; i++){ //Teste si un des sorts n�cessite d'avoir le niveau nouvellement acquis
			if (this.spell[i].locked){
				if (typeof this.spell[i].locked == "number" && this.level >= this.spell[i].locked){
					this.spell[i].locked = false //Si oui, le d�bloque
				}
			}
		}

        let levelUpTXT = new Text("msg", convertPx(this.cx) + config.tileSize / 2, convertPx(this.cy) + config.tileSize / 2, "Level Up","Arial",config.unit * 4,[0,0,255])
        applyFadeOut(levelUpTXT,levelUpTXT.color,255,0.3) //Affiche un texte "level up" et le fait disparaitre en fondu

		if (this.exp >= config.expLevels[this.level]) this.levelUp(this.level + 1) //si l'exp a d�pass� un autre niveau, on r�p�te l'op�ration

	}
	
	noManaError(x,y){ //Affiche, � une position sp�cifi�e, un message d'erreur "not enough mana"
		let manaTXT = new Text("msg",x,y,"Not\nenough\nmana","Arial",config.unit * 2,[0,0,255]) //Cr�e un texte bleu "not enough mana"
			applyFadeOut(manaTXT,manaTXT.color,255,0.5) //Le fait dispara�tre en fondu
	}
	
	get joueur(){
		return joueur[this.player]
	}
	
}

window.Piece = Piece;

	let files = ["pion.js","tour.js","fou.js","cavalier.js","reine.js","roi.js","priest.js", "marksman.js"];
	var classBuilders = [];
	let filesCount = files.length, loadCount = 0;

	//Les classes suivantes sonrt les classes-pi�ces. Chacune h�rite de la clase pi�ce, et d�finit une pi�ce particuli�re
	//Ce sont ces classes qui seront instanci�es pour cr�er une nouvelle pi�ce

	for (let i = 0; i < files.length; i++){
		
		let xobj = new XMLHttpRequest();
		xobj.overrideMimeType("text/text");
		xobj.open('GET', "lib/chess/game/piece/" + files[i], true);
		xobj.i = i
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				classBuilders.push(xobj.responseText);
				loadCount += 1
			}
		}
		xobj.send(null);
		
	}

loadJSON_("lib/chess/game/piece/config.json",
	function(rep){
		let configObj = JSON.parse(rep)
		
		if (configObj.constructor.name != "Array"){
			console.error("Unable to read config.json : the file doesn't directly contain an array !")
			return false
		}		
		
		chessPP.pieceLayout[0] = configObj;
		chessPP.pieceLayout[0].name = "Default";
		chessPP.pieceLayout[0].default = true;
		chessPP.pieceLayout[0].isLayout = true;
		
		chessPP.pieceLayout.index = 0;
	}
)

/*MULTIPIECE/PIECE CONFIG : TODO
- Lecture des fichiers pieceClass
-- Obtenir la liste des fichiers dans le dossier
-- Ajouter l'objet pieceClass � ??? (via Function)
- D�cider de la mani�re dont on g�re les pieceClasses (array, global, etc)
- G�rer plusieurs config

*/