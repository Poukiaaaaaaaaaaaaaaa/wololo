// config : objet contenant toutes les valeurs constantes qui définiront le fonctionnement du jeu
var config = {
	canvasW: window.innerWidth,    //tailles du canvas
	canvasH: window.innerHeight,
	nLig: 10, //nombres de lignes/colones
	nCol: 8,
	mana: {atk: 5, depl: 3, newPiece: 1},  //coûts en mana des différentes actions de base
	maxMana: 20,  //mana maximal
	gold: 100,   //monnaie au début de la partie. Au final, n'est pas utilisé (le sera ... un jour)
	hud: {},  //objet qui contiendra des informations sur différents éléments du hud
	background: 0,  //couleur de background
	expLevels : [100,250,500]   //valeurs d'expérience auxquelles les pièces gagnent un niveau
}


config.update = function(){
	// Définition de certains éléments de configuration calculés
	config.boardS = config.canvasH > config.canvasW ? config.canvasW : config.canvasH;
	config.unit = config.boardS/100;  //unité de distance dépendant de la taille du plateau
	config.border = config.boardS / (15*((config.nLig>config.nCol) ? config.nLig : config.nCol));
	config.tileSize = (config.boardS - ((config.nLig>config.nCol) ? config.nLig + 1 : config.nCol + 1) * config.border) / ((config.nLig>config.nCol) ? config.nLig : config.nCol);
	config.boardW = config.nCol * config.tileSize + config.border * (config.nCol+1);
	config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6}
	config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16}
	config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8}
	config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9}
	config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5}
	config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.h + config.border * 2, size: config.unit * 2}

	// Coordonnées des éléments du HUD
	config.hud.manaGauge = {x: config.boardW + config.border, y: config.border * 4 + config.unit * 16, w: config.unit * 40, h: config.unit * 6} //jauge de mana
	config.hud.button = {x : config.boardW + config.border, y: config.border * 2, w: config.hud.manaGauge.w, h: config.unit * 16 } //bouton de fin de tour
	config.hud.spells = {x: config.boardW + config.border, y: config.border * 6 + config.unit * 22, spellSize : config.unit * 8} //icônes des sorts
	config.hud.info = {x: config.boardW + config.border, y: config.boardS - config.border * 2 - config.unit * 9, w: config.unit * 16, h: config.unit * 9} //bouton d'infomartions sur les pièces
	config.hud.statsWindow = {x: config.boardW + config.border, y: config.boardS - config.border * 4 - config.boardS/5 - config.hud.info.h, w: config.boardW/3, h: config.boardS/5} //fenêtre affichant les infos
	config.hud.spellInfo = {x : config.boardW + config.border, y: config.hud.spells.y + config.hud.spells.spellSize + config.border * 2, size: config.unit * 2} //zone où sont affichées les infos sur chaque pièce
	config.hud.shopButton = {x: config.boardW + config.border * 3 + config.hud.info.w, y: config.hud.info.y, w: config.unit * 12, h: config.hud.info.h}
	config.hud.mute = {x: config.hud.shopButton.x + config.hud.shopButton.w + config.unit, y: config.hud.info.y, w: config.hud.info.h, h: config.hud.info.h}
	config.hud.gold = {x: config.hud.manaGauge.x + config.hud.manaGauge.w, y: config.hud.info.y - config.unit * 8, size: config.unit * 3}
}
// endConfig -------------

config.event = [
	"permanent",
	"onStartTurn",
	"onMoved",
	"onMovedDone",
	"onAttacked",
	"onAttackedDone",
	"onAttacking",
	"onAttackingDone",
	"onDamaged",
	"onDamagedDone",
	"onDamaging",
	"onDamagingDone",
	"onDying",
	"onKilling",
	"onKillingDone",
]