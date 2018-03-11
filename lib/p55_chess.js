//Le fondement de l'interface graphique du jeu : l'objet chessGUI poss�de en tant qu'attributs des "�l�ments de GUI", qui sont des tablelaux
//qui contiendront des objets graphiques. Ces objets seront affich�s et pourront r�agir au clic (voir "draw()" et "mouseClicked()")


var chessGUI = { background: [], pieces: [], highlightCase: [], hud: [], pieceHUD: [], msg: [], windows: [] };

class p55_object{
	constructor(gui,draw,olc,x,y,w,h,onBuilt){
		this.draw = draw
		this.onLeftClick = olc
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		if (onBuilt) (onBuilt.bind(this))()
	
		chessGUI[gui].push(this) 
	}
	
}

class StaticImage { //Classe d�finissant un objet graphique qui affichera une simple image
  constructor(gui,img,x,y,w = undefined,h = undefined){
    this.x = x //D�finition de ses coordonn�es
    this.y = y
    this.w = w
    this.h = h
    this.img = img
    this.gui = gui //D�finition du champ de l'objet-GUI (chessGUI) dans lequel elle se trouvera

    chessGUI[gui].push(this) //Ajoute l'objet au tableau de chessGUI (�l�ment de GUI) sp�cifi� ('gui')
  }

  draw(){ //Affiche l'image (si l'objet se trouve dans un tableau de chessGUI, cette m�thode sera lanc�e � chaque draw)
    image(this.img,this.x,this.y,this.w,this.h)
  }

}

class Button { //Classe d�finissant un objet graphique qui affichera un bouton
  constructor(gui,img,x,y,w,h,hovercallback,callback) {
    this.x = x; //D�finition de ses coordon�es
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img; //D�finition de son image
    this.hovercallback = hovercallback; //D�finition de la fonction �x�cut�e en m�me temps que draw lorsque la souris se trouve sur le bouton
    this.callback = callback; //D�finition de la fonction �x�cut�e lorsque que l'on clique sur le bouton
    this.gui = gui;

    chessGUI[gui].push(this); //Ajoute l'objet au tableau de chessGUI (�l�ment de GUI) sp�cifi� ('gui')
  }

  draw() { //Affiche le bouton
    image(this.img, //Affiche l'image
          this.x, this.y,
          this.w, this.h);
          if (typeof this.hovercallback == "function" && isHovered(this.x,this.y,this.w,this.h)){ //Si la souris est sur le bouton, lance le "hovercallbcak"
            this.hovercallback()
          }
  }

  onLeftClick() { //Fonction r�agissant au clic : si l'objet se trouve dans un tableau de chessGUI, cette m�thode sera lanc�e � chaque clic
     if (typeof this.callback == "function" && isHovered(this.x,this.y,this.w,this.h)) { //Si la souris est sur le bouton
       this.callback(); //on appelle le callback du bouton
    }
  }
}

class HighlightCase { //Classe d�finissant un objet graphique qui affichera un rectangle color� sur une case, et fonctionnera comme un bouton
  constructor(xc,yc,color,hovercolor,piece,callback) {
    this.x = xc; //D�finition de la position en cases
    this.y = yc;
    this.color = color; //D�finition de la couleur normale
    this.hovercolor = hovercolor; //D�finition de la couleur lorsque la souris est sur la case
    this.callback = callback; //D�fintion de la fonction �x�cut�e lors d'un clic sur la case
    this.piece = piece;

    chessGUI.highlightCase.push(this); //Ajout de l'objet � l'�l�ment de GUI (tableau de chessGUI) sp�cifi� ('gui')
  }

  draw() { //Affiche l'objet
    if (isCaseHovered(this.x,this.y)) //Si la souris est sur la case
    { fill(this.hovercolor); } else //La couleur d'affichage sera la hover color
    { fill(this.color); } //Sinon, ce sera la couleur de base
    rect(convertPx(this.x),convertPx(this.y), //Affiche un rectangle de la m�me forme/taille que les cases, sur la case correspondant � la position
    config.tileSize,config.tileSize,
    config.border);
  }

  onLeftClick() { //Fonction r�agissant a clic
     if (isCaseHovered(this.x,this.y)) {//si la souris est sur la case
      clearGUI("highlightCase") //supprime toutes les HighlighCase
      this.callback();  //Appelle le callback de la pi�ce
      return true //si un onLeftClick renvoie true, alors on quitte la boucle qui teste les onLeftClick() de tous les �l�ments
      //cela permet d'�viter que plusieurs �l�ments r�agissent au m�me clic
    }
  }
}


class Text { //Classe d�finissant un objet graphique qui affichera un texte
  constructor(gui,x,y,text,font,size,color,xalign = CENTER,yalign = CENTER){
    this.x = x; //D�finition de la position
    this.y = y;
    this.text = text; //texte � afficher
    this.color = color; //couleur
    this.gui = gui
  	this.font = font //police de caract�re
	this.size = size //taille de police
    this.xalign = xalign //alignement par rapport � la position
    this.yalign = yalign

    chessGUI[gui].push(this)
  }

  draw(){ //affiche l'objet
    textFont(this.font) //param�trage du prochain texte affich� en fcontion des propri�t�s de l'objet
    textSize(this.size)
    textAlign(this.xalign,this.yalign)
    fill(this.color)
    text(this.text,this.x,this.y) //affiche le texte
  }

  destroy(){ //supprime le texte du tableau de chessGUI dont il fait partie
    chessGUI[this.gui].spliceItem(this)
  }
}

class Animated { //Objet se liant � une propri�t� d'un autre objet, et modifiant cette propri�t� au cours du temps
  constructor(object,property,speed,max = NaN,reachMaxCallback = 0){
    this.object = object; //d�finition de l'objet sur lequel agir
    this.property = property; //d�finition de la propri�t� sur laquelle agir
    this.speed = speed; //vitesse de variation (valeur absolue)
    this.max = max; //valeur � atteindre
    this.reachMaxCallback = reachMaxCallback //fonction � �x�cuter lorsque la valeur max est atteinte

    this.direction = Math.sign(speed); //calcul du sens de variation
    this.startVal = this.object[this.property]; //enregistrement du moment o� l'animation a commenc�
    this.lastTime = actTime;
    this.val;

  }

  update(){ //met � jour la propri�t� en fonction du temps
    var time = actTime - this.lastTime;
    var val = this.object[this.property] + deltaVarSpeed(time,this.speed);

    this.object[this.property] = val;

    if (this.max != NaN && typeof this.reachMaxCallback == "function"){ //si un max est d�fini et s'il est atteint
      if (val * this.direction >= this.max * this.direction){
          this.reachMaxCallback(this.object,this.property); //appelle le reachMaxCallbacl
      }
    }
    this.lastTime = actTime;
  }


}

class FadeOut { //Animation � appliquer � un objet graphique, qui va modifier sa valeur d'alpha (il doit donc avoir un atribut '.color')
  constructor(object,rawColor,initAlpha,speed){
    this.object = object //objet
    this.rawColor = rawColor //couleur d'origine
    this.alpha = initAlpha //alpha d'origine
    this.speed = speed  //vitesse de disparition (�alpha/ms)
    this.animation = new Animated(this,"alpha",-speed,0, //l'objet fadeOut, contiendra un objet animated qui mettra � jour le fadeOut
    function(obj){obj.object.destroy()})

    this.object.fadeOut = this;

    this.object.staticDraw = this.object.draw; //Modifie le draw de l'objet pour que celui-ci appelle la m�thode update du fadeOut
    this.object.draw = function(){this.fadeOut.update() ; this.staticDraw()}
  }

  update(){ //Modifie l'alpha de l'objet, c'est � dire objet.color[3] (avec une couleur stock�e sous forme de tableau)
    this.animation.update() //Met � jour l'animation qui agit sur la valeur "alpha" du fadeOut
    this.object.color = [this.rawColor[0],this.rawColor[1],this.rawColor[2],this.alpha]; //modifie la couleur de l'objet en y ajoutant cet alpha
  }

}

class Movement { //Animation � appliquer � un objet graphique pour le d�placer
  constructor(object,speed,xTarget,yTarget){
    this.object = object //objet
    this.speed = speed  //vitesse en px/ms
    this.xTarget = xTarget //position � atteindre
    this.yTarget = yTarget

    this.xReach = false //bool�ens indiquant si la position a �t� atteinte, en x ou en y
    this.yReach = false
	//attributs g�n�r�s automatiquement
    this.x = object.x //position actuelle
    this.y = object.y
    var dx = xTarget - object.x //distance � parcourir
    var dy = yTarget - object.y
    var dist = Math.sqrt(Math.pow(dx,2)+pow(dy,2));
    var vx = (dx / dist) * speed //vitesse x et y
    var vy = (dy / dist) * speed

    this.xAnimation = new Animated(this,"x",vx,xTarget, //cr�e une animation pour le x
      function(mov){mov.xReach = true ; if (mov.yReach) mov.end()})
    this.yAnimation = new Animated(this,"y",vy,yTarget, //et une autre pour le y
      function(mov){mov.yReach = true ; if (mov.xReach) mov.end()})


    if (object.movement) object.movement.destroy()
    this.object.movement = this

    this.object.staticDraw = this.object.draw
    this.object.draw = function(){this.movement.update() ; this.staticDraw()} //Modifie le draw de l'objet pour que celui-ci appelle la m�thode update du fadeOut
  }

  update(){//met � jour la position de l'objet
    this.xAnimation.update(); //met � jour les animations agissant sur le x et l'y de l'objet mouvement
    this.yAnimation.update();
    this.object.x = this.x; //le x et le y de l'objet mouvement deviennent la position de l'objet
    this.object.y = this.y;
  }

  destroy(){ //supprime le mouvement
    this.object.draw = this.object.staticDraw; this.object.movement = 0;
  }

  end(){ //fin du mouvement (g�n�ralement quand la position d'arriv�e est atteinte)
    this.object.x = this.xTarget; //place l'objet sur la positiond d'arriv�e exacte (�vite les d�calages, li�s aux arrondis par ex)
    this.object.y = this.yTarget;
    this.destroy(); //supprime l'objet mouvement
  }

}

class SpellIcon extends Button { //ic�ne des spells; h�rite des simples boutons
	constructor(x,y,w,h,spell){ //on s�pcifie uniquement les coordonn�es et le spell correspondant
		super("pieceHUD",spell.img,x,y,w,h, //cr�e un bouton avec les coordon�es sp�cifi�es, et comme image l'ic�ne du spell sp�cifi�
		function(){ //comme hovercallback, une fonction affichant des infos sur le spell (qui seront donc affich�es qua la souris est sur l'ic�ne)
			textSize(config.hud.spellInfo.size)
			textFont("Verdana");
			textAlign(LEFT,TOP);
			fill(255);
			text(this.spell.name, config.hud.spellInfo.x, config.hud.spellInfo.y); //le nom du sort
			fill(150,150,150);
			text("Cooldown: " + this.spell.cooldown, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size); //son d�lai de r�cup�ration
			fill(150,150,255);
			text("Mana cost: " + this.spell.manaCost, config.hud.spellInfo.x, config.hud.spellInfo.y + config.hud.spellInfo.size * 2); //son co�t

			if (this.spell.getRange){ //des rectangles sur les cases faisant partie de la port�e du sort
				let range = this.spell.getRange();
				for (var i = 0; i < range.length; i++){
					fill(255,120,120,100);
					rect(convertPx(range[i][0]),convertPx(range[i][1]),config.tileSize,config.tileSize,config.border);
				}
			}
		},
		function(){ //callback du bouton :
			if (guiState == ""){ //si la GUI est � son �tat normal (aucune op�ration particuli�re en cours)
				if(joueur[this.spell.piece.player].mana >= this.spell.manaCost){ //si le joueur a assez de mana
					if (this.spell.actualCooldown == 0 && !this.spell.locked && !this.spell.piece.cc){ //et si le spell n'est pas en r�cup�ration
						this.spell.onUsed(this.spell); //utilisation du spell
					}
				} else {
					this.spell.piece.noManaError(this.x + this.w/2, this.y + this.h/2); // si pas assez de mana, affichage de l'erreur "not enough mana" (voir "manaError()")
				}
			}
		});
		this.spell = spell
	}
	
	draw(){ //Affiche l'ic�ne
		super.draw() //draw de base du bouton (g�re notament le hovercallback)
		if (this.spell.actualCooldown || this.spell.locked){ //si le spell est bloqu� ou en r�cup�ration, le grise
			fill([0,0,0,150])
			rect(this.x,this.y,this.w,this.h)
			fill(255)
			textAlign(CENTER,CENTER) ; textSize(this.h * 0.8)
			if (this.spell.actualCooldown) text(this.spell.actualCooldown,this.x + this.w/2, this.y + this.h/2) //si en r�cup�ration, affiche le nombre de tours restants
		} else if (joueur[this.spell.piece.player].mana < this.spell.manaCost) {
			fill(100,100,255,100);
			rect(this.x,this.y,this.w,this.h);
		} else if (this.spell.piece.cc) {
			fill(150,150,150,100);
			rect(this.x,this.y,this.w,this.h);
		} else if (this.spell.active){
			fill(255,255,255,100);
			rect(this.x,this.y,this.w,this.h);
		}
	}
}