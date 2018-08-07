//EFFECTS A METTRE A JOUR
/*
*Burn
*Stun
*Confuse
*Atk buff
*Hp buff
*/	
	
function preload() { //chargement des images. La fonction Preload est lancée par p5 avant le setup.
	
	loading("Loading images ...")
	
  config.background = loadImage("img/background.png");
  img.HUD[0] = loadImage("img/HUD/end_turn.png");
  img.HUD[1] = loadImage("img/HUD/info.png");
  img.HUD[2] = loadImage("img/HUD/unmuted.png");
  img.HUD[3] = loadImage("img/HUD/muted.png");
  img.HUD[4] = loadImage("img/HUD/player_up.png");
  img.HUD[5] = loadImage("img/HUD/player_down.png");
  img.HUD[6] = loadImage("img/HUD/shop.png")
  img.HUD[7] = loadImage("img/HUD/buy.png")
  img.title[0] = loadImage("img/title/title_background.png");
  img.title[1] = loadImage("img/title/logo.png");
  img.title[2] = loadImage("img/title/playButton.png");
  img.title[3] = loadImage("img/title/edit.png");
  img.title[4] = loadImage("img/title/settings.png");
  img.title[5] = loadImage("img/title/backToMenu.png");
  img.title[6] = loadImage("img/title/help.png");
  img.title[7] = loadImage("img/title/rules_here.png");
  img.title[8] = loadImage("img/title/pieceloader.png");
  
  
  img.piece.noir["Pion"] = loadImage("img/Pieces/pion_noir.png"); // pion noir
  img.piece.noir["Tour"] = loadImage("img/Pieces/tour_noire.png"); // tour noire
  img.piece.noir["Fou"] = loadImage("img/Pieces/fou_noir.png"); // fou noir
  img.piece.noir["Reine"] = loadImage("img/Pieces/reine_noire.png") // reine noire
  img.piece.noir["Cavalier"] = loadImage("img/Pieces/cavalier_noir.png") // cavalier noir
  img.piece.noir["Roi"] = loadImage("img/Pieces/roi_noir.png") // roi noir
  img.piece.noir["Priest"] = loadImage("img/Pieces/priest_noir.png")
  img.piece.blanc["Pion"] = loadImage("img/Pieces/pion_blanc.png"); // pion blanc
  img.piece.blanc["Tour"] = loadImage("img/Pieces/tour_blanche.png"); // tour blanche
  img.piece.blanc["Fou"] = loadImage("img/Pieces/fou_blanc.png"); // fou blanc
  img.piece.blanc["Reine"] = loadImage("img/Pieces/reine_blanche.png"); // reine blanche
  img.piece.blanc["Cavalier"] = loadImage("img/Pieces/cavalier_blanc.png"); // cavalier blanc
  img.piece.blanc["Roi"] = loadImage("img/Pieces/roi_blanc.png"); // roi blanc
  img.piece.blanc["Priest"] = loadImage("img/Pieces/priest_blanc.png")
  img.piece.selection = loadImage("img/Pieces/selection.png"); // image de séléction

  img.spell.Pion = [];
  img.spell.Pion[0] = loadImage("img/Spells/Pion/0.png");
  img.spell.Pion[1] = loadImage("img/Spells/Pion/1.png");
  img.spell.Pion[2] = loadImage("img/Spells/Pion/2.png");
  img.spell.Tour = [];
  img.spell.Tour[0] = loadImage("img/Spells/Tour/0.png");
  img.spell.Tour[1] = loadImage("img/Spells/Tour/1.png");
  img.spell.Tour[2] = loadImage("img/Spells/Tour/2.png");
  img.spell.Cavalier = []
  img.spell.Cavalier[0] = loadImage("img/Spells/Cavalier/0.png");
  img.spell.Cavalier[1] = loadImage("img/Spells/Cavalier/1.png");
  img.spell.Cavalier[2] = loadImage("img/Spells/Cavalier/2.png");
  img.spell.Reine = []
  img.spell.Reine[0] = loadImage("img/Spells/Reine/0.png");
  img.spell.Reine[1] = loadImage("img/Spells/Reine/1.png");
  img.spell.Reine[2] = loadImage("img/Spells/Reine/2.png");
  img.spell.Fou = [];
  img.spell.Fou[0] = loadImage("img/Spells/Fou/0.png");
  img.spell.Fou[1] = loadImage("img/Spells/Fou/1.png");
  img.spell.Fou[2] = loadImage("img/Spells/Fou/2.png");
  img.spell.Roi = [];
  img.spell.Roi[0] = loadImage("img/Spells/Roi/0.png");
  img.spell.Roi[1] = loadImage("img/Spells/Roi/1.png");
  img.spell.Roi[2] = loadImage("img/Spells/Roi/2.png");
  
  img.items.Pion = [];
  img.items.Pion[0] = loadImage("img/Items/Pion/0.png");
  img.items.Pion[1] = loadImage("img/Items/Pion/1.png");
  img.items.Pion[2] = loadImage("img/Items/Pion/2.png");
  img.items.Tour = [];
  img.items.Tour[0] = loadImage("img/Items/Tour/0.png");
  img.items.Tour[1] = loadImage("img/Items/Tour/1.png");
  img.items.Tour[2] = loadImage("img/Items/Tour/2.png");
  img.items.Fou = [];
  img.items.Fou[0] = loadImage("img/Items/Fou/0.png");
  img.items.Fou[1] = loadImage("img/Items/Fou/1.png");
  img.items.Fou[2] = loadImage("img/Items/Fou/2.png");
  img.items.Reine = [];
  img.items.Reine[0] = loadImage("img/Items/Reine/0.png");
  img.items.Reine[1] = loadImage("img/Items/Reine/1.png");
  img.items.Cavalier = [];
  img.items.Cavalier[0] = loadImage("img/Items/Cavalier/0.png");
  img.items.Cavalier[1] = loadImage("img/Items/Cavalier/1.png");
  img.items.Priest = [];
  img.items.Priest[0] = loadImage("img/Items/Priest/0.png");
  img.items.Priest[1] = loadImage("img/Items/Priest/1.png");
  img.items.Priest[2] = loadImage("img/Items/Priest/2.png");
  
  img.fx.burn = loadImage("img/effects/burn.png");
  img.fx.confuse = loadImage("img/effects/confuse.png");
  img.fx.stun = loadImage("img/effects/stun.png");
  
  winIMG[0] = loadImage("img/Window/window_left.png");
  winIMG[1] = loadImage("img/Window/window_right.png");
  
  img.HUD[7].darker = createGraphics(500,500);
  img.HUD[7].darker.image(img.HUD[7],0,0,500,500);
  // img.HUD[7].darker.fill([0,0,0,100]);
  // img.HUD[7].darker.rect(0,0,200,125);
  
}

function facepunch() { //hehe
  config.background = loadImage("img/no/facepunch.jpg");
  img.HUD[0] = loadImage("img/no/facepunch.jpg");
  img.HUD[1] = loadImage("img/no/facepunch.jpg");
  img.HUD[2] = loadImage("img/no/facepunch.jpg");
  img.HUD[3] = loadImage("img/no/facepunch.jpg");
  img.HUD[4] = loadImage("img/no/facepunch.jpg");
  img.HUD[5] = loadImage("img/no/facepunch.jpg");
  img.title[0] = loadImage("img/no/facepunch.jpg");
  img.title[1] = loadImage("img/no/facepunch.jpg");
  img.title[2] = loadImage("img/no/facepunch.jpg");
  img.title[3] = loadImage("img/no/facepunch.jpg");
  img.title[4] = loadImage("img/no/facepunch.jpg");
  img.title[5] = loadImage("img/no/facepunch.jpg");
  img.title[6] = loadImage("img/no/facepunch.jpg");

  img.piece.noir[0] = loadImage("img/no/facepunch.jpg"); // pion noir
  img.piece.noir[1] = loadImage("img/no/facepunch.jpg"); // tour noire
  img.piece.noir[2] = loadImage("img/no/facepunch.jpg"); // fou noir
  img.piece.noir[3] = loadImage("img/no/facepunch.jpg") // reine noire
  img.piece.noir[4] = loadImage("img/no/facepunch.jpg") // cavalier noir
  img.piece.noir[5] = loadImage("img/no/facepunch.jpg") // roi noir
  img.piece.blanc[0] = loadImage("img/no/facepunch.jpg"); // pion blanc
  img.piece.blanc[1] = loadImage("img/no/facepunch.jpg"); // tour blanche
  img.piece.blanc[2] = loadImage("img/no/facepunch.jpg"); // fou blanc
  img.piece.blanc[3] = loadImage("img/no/facepunch.jpg"); // reine blanche
  img.piece.blanc[4] = loadImage("img/no/facepunch.jpg"); // cavalier blanc
  img.piece.blanc[5] = loadImage("img/no/facepunch.jpg"); // roi blanc

  img.spell.Pion = [];
  img.spell.Pion[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Pion[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Pion[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour = [];
  img.spell.Tour[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Tour[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier = []
  img.spell.Cavalier[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Cavalier[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine = []
  img.spell.Reine[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Reine[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou = [];
  img.spell.Fou[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Fou[2] = loadImage("img/no/facepunch.jpg");
  img.spell.Roi = [];
  img.spell.Roi[0] = loadImage("img/no/facepunch.jpg");
  img.spell.Roi[1] = loadImage("img/no/facepunch.jpg");
  img.spell.Roi[2] = loadImage("img/no/facepunch.jpg");
  
  winIMG[0] = loadImage("img/no/facepunch.jpg");
  winIMG[1] = loadImage("img/no/facepunch.jpg");
  startGame();
}

function deFacepunch() {
  preload(); startGame();
}
// endImages -------------

function soundPreLoad() {
	if (!Audio) {sEffects = false ; return false} //Si la classe Audio n'existe pas, on l'indique en mettant sEffects à false, puis on quitte la fonction(return)
	sEffects[0] = new Audio("audio/click1.wav");
	sEffects[1] = new Audio("audio/click2.wav");
	sEffects[2] = new Audio("audio/click3.wav");
	sEffects[3] = new Audio("audio/loop.mp3"); sEffects[3].loop = true;
	sEffects[3].volume = 0.5;
	return true
}