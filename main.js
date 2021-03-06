// CHESS++ ISN PROJECT
// Téo Tinarrage // Amaël Marquez
// TODO (éléments de jeu):
// - Système de monnaie -> Objets
// - Pièces additionnelles
// - Traductions
// - Bulles d'aide
// TODO (éléments internes)
// - Ajout de propriétés libre lors de la création des HighLlighCase de séléction [start__SelectionHLC()] -> Ok en fait non
// - Inverser bHP et baseHP (public/privé)
// - Virer p5


//Disclaimer :
//Si ChessPP est actuellement fonctionnel bien que légèrement incomplet, il reste
//peu jouable ; l'équilibrage n'a pas pu être travaillé en profondeur, il est donc fort possible
//que les stratégies n'aient que peu de d'intérêt actuellement. Si nous n'avons pas pu créer un jeu
//réellement intéressant (bien que fonctionnel encore une fois), son développement ne s'arrête pas au
//rendu du projet, et il sera à terme un jeu de stratégie à part entière.

// debug
var debug = false;
if (debug){
	function analysePerf(loops){
		let analyser = {
			loop : loops,
			start : actTime,
			c: 0,
			draw : function(){
				this.c++
				if (this.c > this.loop){
					let time = actTime - this.start
					let speed = time/this.loop
					console.log("Les " + this.loop + " frames on été affichées en "+time+"ms, pour un framerate de " + speed)			
					chessGUI.hud.spliceItem(this)
				}
			}
		}
		chessGUI.hud.push(analyser)
	}
}

// endDebug

// CONFIG

//GLOBAL FUNCTIONS

// globalVars --------------
// variables globales
var img = {}, //Objet contenant toutes les images
    hudIMG = [], //tableau contenant les images du HUD
    selectedPiece = 0, //pièce sélectionnée par le joueur
    playerTurn = 0, //ID (numérique) du joueur dont c'est le tour
    actTime, //le temps (relatif au 1/1/1970)
    d, //le futur objet date
    joueur = [], //l'objet contenant les joueurs
    guiElements = {}, //un objet contenant certains objet p55 auxquels on veut conserver un accès rapide
	chessGUI_DOM = [],
    winIMG = [], //images utilisées par les fenètres
    guiState = "", //représente l'action en cours (qui détermine comment certains éléments se comportent)
    victory = false,
	undefPiece,
    sEffects = [], //array contenant tous les effets audio. Est à false si le son n'a pas pu être load
	turn = 0, //numéro du tour en cours
	nextTick = 0, //temps (origin-relative) du prochain tick
	onTick = new Event_("Tick"), //tableau de fonctions éxécutées à chaque tick
	game = {isReady : false}, //l'objet game. Après un futur rework, il contiendra la plupart des variables globales ainsi que les objets joueur.
	chessPP = {}; //futur objet contenant les constantes du jeu
	
	// { //création du tableau des classes
		// var pieceClass = [Pion,Tour,Fou,Reine,Cavalier,Roi] //Contient les classes de tous les types de pièces
	// }	

	
chessPP.Piece = {};
chessPP.pieceLayout = [];
chessPP.prePieceLayout = [];
	
img.piece = { //objet contenant deux tableaux, "blanc" et "noir" : chacun contiendra les images des pi�ces de couleur correspodante
    blanc: [],
    noir: [],
    selection: null
  };
img.spell = {};
img.HUD = [];
img.title = [];
img.items = {};
img.fx = {}

//GUI OBJECT

// endGlobalVars --------------

// IMAGES
// SON

//PLAYER CLASS

//PIECE CLASS

// P55 CLASS

// SPELL/ITEM/EFFECT CLASS

// endClass ----------

// reset function

function startTitle(){ //fonction inialisant l'écran-titre
  if (soundPreLoad()) sEffects[3].play(); //charge les sons ; joue la musique
  clearGUI();
  new StaticImage("background",img.title[0],0,0,config.canvasW,config.canvasH) //crée une image statique : l'image de fond
  titleView.mainPage(); //Affiche les éléments de la page d'accueil
}

function startGame() { //lance la partie en elle-même

	d = new Date(); //initialise le premier temps
	actTime = d.getTime();

	viewGameGUI()
	
	undefPiece = Piece.prototype ; undefPiece.name = "undef"; //création d'une pièce vide, utile pour le fonctions demandant une pièce en paramètre mais que l'on veut lancer sans préciser de pièce particulière
	playerTurn = 0; //Le joueur en train de jouer est le joueur 0
	guiElements.player_arrow = new StaticImage("hud",img.HUD[playerTurn ? 4 : 5],config.hud.manaGauge.x + config.border, config.hud.manaGauge.y + config.border, config.hud.manaGauge.h - config.border*2, config.hud.manaGauge.h - config.border*2);
	guiElements.player_arrow.update = function() { this.img = img.HUD[playerTurn ? 5 : 4] }
	initBoard(); //Crée les pièces en fonction des prePieces des deux joueurs
	joueur[playerTurn].startTurn(); //Lance la méthode de début de tour du joueur commençant à jouer
}
// -------

// main functions
function setup() { //Lancée par p5 au lancement du programme : c'est ici qu commence l'éxécution du programme
	loading("Launching the game")
	noStroke(); //Les formes dessinées n'auront jamais de stroke
	cursor("img/cursor.png"); //Changement de l'image du curseur
	document.body.innerHTML = ''
	createCanvas(config.canvasW, config.canvasH); //Création du canvas où on va dessiner
	config.update()
	joueur = [new Joueur("blanc","Gilbert"), new Joueur("noir","Patrick")]; //crée les deux joueurs de base
	startTitle(); //Lancement de l'écran-titre
	onTick.add(
		function(){
			if (loadCount >= filesCount){ //si tous les fichiers ont été load
			onceComplete()
			this.delete()			
			}
		}
	)
	// window.addEventListener("beforeunload", function()
		// function(){
			// console.log("oui");
			// if (window.pieceLoaderPopup) window.pieceLoaderPopup.close()
		// }
	// )
	
	console.log("HAYO! If you're here it's probably becuz you are going to CHEAT. If it's the case, just be careful and remember ur a BIG SHIT !")

}

function draw() { //Fonction lancée par p5 à chaque frame

  d = new Date(); //Récupération du temps actuel
  actTime = d.getTime();
	//Affichage des objets de chessGUI :
  for (var element in chessGUI) { //pour chaque attribut de l'objet chessGUI (=élement de GUI = tableau)
    if (chessGUI.hasOwnProperty(element)) { //()vérification que l'attribut actuel ne fait pas partie du prototype
      for (var i = 0; i < chessGUI[element].length; i++) { //Pour chaque champ du tableau
        if (typeof chessGUI[element][i].draw === "function"){ //Si l'objet contenu dans ce champ a un méthode draw()
		chessGUI[element][i].draw(); //On la lance
	  
        }
      }
    }
  }
  
	if (actTime > nextTick){ //si on a dépassé le temps auquel doit avoir lieu le prochain tick
		onTick.process()
		nextTick += 50 //on programme le prochain tick pour 50 ms après (pour un total de 20 tick/secondes)
	}

  if (victory){ //Si la victoire a été décidée
    alert("Victoire de " + victory.name) //On affiche le vainquer
    startGame() //On relance la partie
    victory = false //On réinitialise la variable indiquant la victoire d'un joueur
  }
  
  if (debug) {
    fill(255); textSize(20);
    text(floor(frameRate()), 20, 20);
  }
}

function mouseClicked(){ //Fonction lancée par p5 à chaque clic
	if (mouseButton == LEFT){ //Si le clic est un clic gauche
		let ichessGUI = [], i = 0
		for (let element in chessGUI){
			if (chessGUI.hasOwnProperty(element))
			ichessGUI[i] = chessGUI[element];
			i++
		}
		clickLoop: for (element = ichessGUI.length - 1; element > -1; element--){ // pour chaque attribut de l'objet chessGUI (=élement de GUI = tableau)
				for (let i = 0; i < ichessGUI[element].length; i++){ //Pour chaque champ du tableau
					if (typeof ichessGUI[element][i].onLeftClick === "function"){ //Si l'objet contenu dans ce champ a un méthode draw()
						if (ichessGUI[element][i].onLeftClick()) break clickLoop; //On la lance -> si elle a retourné true, on quitte la boucle (permet d'annuler les autres interactions qui pourraient ne pas être à jour)
					}
				}
		}
		if (sEffects) sEffects[Math.floor(random(0,3))].play(); //on joue l'un des 3 sons de clic
	}
}

var fpunch = 0, isFacepunch = false;
var popup

function keyPressed() { //hehe
	if (keyCode == 70 && !fpunch) fpunch = 1;                                                   //f
	if (keyCode == 65 && fpunch == 1) fpunch = 2;                                               //a
	if (keyCode == 67 && fpunch == 2) fpunch = 3;                                               //c
	if (keyCode == 69 && fpunch == 3) fpunch = 4;                                               //e
	if (keyCode == 80 && fpunch == 4) fpunch = 5;                                               //p
	if (keyCode == 85 && fpunch == 5) fpunch = 6;                                               //u
	if (keyCode == 78 && fpunch == 6) fpunch = 7;                                               //n
	if (keyCode == 67 && fpunch == 7) fpunch = 8;                                               //c
	if (keyCode == 72 && fpunch == 8) {                                                         //h
		punch = 0; isFacepunch = isFacepunch ? false : true;
		if (isFacepunch) facepunch();
		if (!isFacepunch) deFacepunch();
	}
	  
	if (keyCode == 69) joueur[1 - playerTurn].startTurn()
	if (keyCode == 73) {
		if (selectedPiece) {
			selectedPiece.showStats(); //on affiche les caractéristique de cette pièce
		}
	}
}
// end of main functions
