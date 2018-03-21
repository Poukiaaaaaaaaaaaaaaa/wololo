var titleView = { //Objet contenant plusieurs fonctions : chacune sert à initialiser une "page" de l'écran titre : elles créent les éléments à afficher pour chaque page
	mainPage : function(){ //Page d'accueil
		clearGUI("hud") //Vide les éléments de hud (dans l'écran-titre, l'élément de gui "hud" contient tous les objets affichés sauf le l'image de fond)
		let titleW = config.unit * 90, titleH = config.unit * 18
			new StaticImage("hud",img.title[1],config.canvasW/2 - titleW / 2,config.canvasH/5 - titleH / 2,titleW,titleH)  //Logo de chess++
		let playButtonW = config.unit * 50, playButtonH = config.unit * 20
			new Button("hud",img.title[2],config.canvasW/2 - playButtonW / 2,config.canvasH/5*3 - playButtonH / 2,playButtonW,playButtonH, //Bouton play
				function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
				function(){startGame()})  //son callback appelle startGame, qui lance la partie
		let setButtonS = config.unit * 20
			new Button("hud",img.title[4],config.canvasW/4 - setButtonS/2,config.canvasH/5*3 - setButtonS / 2,setButtonS,setButtonS, //Bouton ouvrant les paramètres
				function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
				function(){titleView.settings()})  //Son callback appelle une autre fonction de titleView, settings, qui affiche les éléments de configuration
		let helpButtonS = config.unit * 20
			new Button("hud",img.title[6],config.canvasW/4 * 3 - helpButtonS/2,config.canvasH/5*3 - helpButtonS / 2,helpButtonS,helpButtonS,  //Bouton d'aide
				function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
				function(){let win = window.open("help/help.html", '_blank') ; document.cookie = "rules_read = true; expires=" + (actTime + 365*24*60*60*1000) ; win.focus()}) 
				//son callback ouvre dans un autre onglet le fichier help/help.html
		new Text("hud",config.unit,config.canvasH - config.unit,"version 1.0","Arial",config.unit,[0,0,0],TOP,LEFT)
		if (!document.cookie){
			let rIndicatorW = config.canvasW / 2, rIndicatorH = rIndicatorW * 234 / 1698;
				new StaticImage("hud",img.title[7],config.canvasW/2 - rIndicatorW / 2, config.canvasH/5*3 + helpButtonS / 2, rIndicatorW, rIndicatorH)
		}
	},
	settings : function(){ //Page de configuration
		clearGUI("hud") //Vide les éléments de hud (dans l'écran-titre, l'élément de gui "hud" contient tous les objets affichés sauf le l'image de fond)
		new Text("hud",config.canvasW/2,config.canvasH/8,"SETTINGS","Verdana",50,[255, 178, 0]) //Titre ("Settings")
		new Button("hud",img.title[5],config.canvasW / 5 * 4,config.canvasH/8, config.unit * 16, config.unit * 9, //Bouton de retour à la page d'accueil
			function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h)},
			function(){titleView.mainPage()}); //son callback appelle titleView.mainPage, affichant la page principale


		guiElements.settingsPlayerName = [];
		for (let i = 0; i < joueur.length; i++){ //Pour chaque joueur
			guiElements.settingsPlayerName[i] = new Text( //affiche son nom
				"hud",config.canvasW/4,config.canvasH/4 + i * config.unit * 4,"Joueur "+(i+1)+": "+joueur[i].name,"Verdana",config.unit * 3,[255, 251, 0],LEFT,TOP)
			let butno = new Button( //en plus d'un bouton permettant de le modifier
				"hud",img.title[3],config.canvasW/4 + config.unit * 40,config.canvasH/4 + i * config.unit * 4,config.unit * 3,config.unit*3,
				function(){fill([200,200,200,50]) ; rect(this.x,this.y,this.w,this.h)},
				function(){joueur[this.player].name = prompt("Name") ;
					guiElements.settingsPlayerName[this.player].text = "Joueur "+(this.player+1)+": "+joueur[this.player].name})
			butno.player = i;
			let miniBoard = new p55_object("hud", 0, 
				config.unit*5, config.unit * 50
			)
			miniBoard.draw = drawBoard.bind(miniBoard,miniBoard.x, miniBoard.y, config.nLig, config.nCol, config.tileSize / 2, config.border/2)			
    }
	

  }
}

function viewGameGUI(){
	clearGUI(); //vide tous les éléments de GUI
	new StaticImage("background",config.background, 0, 0, config.canvasW, config.canvasH); //Crée une image fixe : l'image de fond
  {let hudBG = {}; //crée un objet graphique affichant un simple rectangle derrière l'échiquier et le HUD
    hudBG.draw = function() {
      fill(80, 80, 80, 200); rect(0, 0, config.boardW + config.hud.manaGauge.w + config.border * 3, config.canvasH);
    }
  chessGUI.background.push(hudBG);} //l'ajoute à l'élément de GUI 'background'
	{
    let chessBoard = {draw : drawBoard} //crée un objet graphique qui affichera simplement l'échiquier via drawBoard()
	  chessGUI.background.push(chessBoard)
  }

	new Button("hud",img.HUD[0],config.hud.button.x,config.hud.button.y,config.hud.button.w,config.hud.button.h, //crée le bouton de fin de tour
		function(){fill([255,255,255,50]) ; rect(this.x,this.y,this.w,this.h,config.unit)},
		function(){joueur[1 - playerTurn].startTurn()}); //son callback démarre le tour de l'adversaire

	{
    let manaGauge = config.hud.manaGauge; //création d'un objet graphique qui affichera simplement la barre de mana du joueur
	manaGauge.draw = function(){
	   fill(200,200,255);
	   rect(this.x+1,this.y+1,this.w-1,this.h-1);
	   fill(80,80,255);
	   rect(this.x,this.y,joueur[playerTurn].mana / config.maxMana * this.w,this.h);
	   textAlign(LEFT, CENTER); textSize(config.unit * 4); fill(255);}
	chessGUI.hud.push(manaGauge)
  }

{ //création d'un objet graphique qui affichera un bouton (on aurait pu faire avec new Button())
    let info = config.hud.info;
		info.draw = function() { //affiche l'image du bouton, grisée si aucune pièce n'est sélectionnée
			image(img.HUD[1], config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h);
			if (!selectedPiece) { fill(50, 50, 50, 180); rect(config.hud.info.x, config.hud.info.y, config.hud.info.w, config.hud.info.h, config.unit/4);
			} else { if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/4)}}
		}
		info.onLeftClick = function(){ //lorsque l'on clique, si une pièce est sélectionnée
			if (selectedPiece) {
				if (isObjectHovered(this)) {
					selectedPiece.showStats(); //on affiche les caractéristique de cette pièce
					this.ftsioCounter ++; if (this.ftsioCounter >= 25) fuckThisShitImOut() //shhhhh

				} else {this.ftsioCounter = 0}
			}
		}
		chessGUI.hud.push(info);
	}
	
	new p55_object("hud",
		function(){
			image(this.img, this.x, this.y, this.w, this.h);
			if (!selectedPiece || selectedPiece.player != playerTurn) { fill(50, 50, 50, 180); rect(this.x, this.y, this.w, this.h, config.unit/4);
			} else { if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/4)}}
		},
		function(){
			if (selectedPiece && selectedPiece.player == playerTurn) {
				if (isObjectHovered(this)) {
					selectedPiece.showShop(); //on affiche les caractéristique de cette pièce
				}
			}
		},
		config.hud.shopButton.x,config.hud.shopButton.y,config.hud.shopButton.w,config.hud.shopButton.h,
		function(){this.img = img.HUD[6]}
	)

	{let txt = 
		new Text("hud",config.hud.gold.x,config.hud.gold.y,"","Arial",config.hud.gold.size,
			[255,255,0],RIGHT,TOP)
		Object.defineProperty(txt,"text",{get: function(){return joueur[playerTurn].gold + "\n golds"}})
	}	
		

	for (let i = 0; i < joueur.length; i++){
		joueur[i].initGame(); //pour chaque joueur, on lance la méthode préparant le joueur pour la partie (voir "class Joueur")
	}

  { //création du bouton permettant de couper la musique
    let mute = config.hud.mute;
    mute.draw = function() { //affiche simplement l'image du bouton
      let tmp = sEffects[3].volume == 0 ? img.HUD[3] : img.HUD[2];
      image(tmp, this.x, this.y, this.w, this.h);
      if (isObjectHovered(this)) {fill(255,255,255,50) ; rect(this.x,this.y,this.w,this.h,config.unit/1.9)}
    }
    mute.onLeftClick = function() { //au clic, si le clic est effectué sur ce bouton évidemment, on met le volumme de la musique à 0 ou à son volumme d'origine
      if (isObjectHovered(this)) sEffects[3].volume = 0.5 - sEffects[3].volume;
    } 	

    chessGUI.hud.push(mute);
  }
}