var p55 = {}

class StaticImage {
  constructor(gui,img,x,y,w = undefined,h = undefined){
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.img = img
    this.gui = gui

    p55.gui[gui].push(this)
  }

  draw(){
    image(this.img,this.x,this.y,this.w,this.h)
  }

}

class Button {
  constructor(gui,img,x,y,w,h,hovercallback,callback) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.hovercallback = hovercallback
    this.callback = callback
    this.gui = gui

    p55.gui[gui].push(this)
  }

  draw() {
    image(this.img,
          this.x, this.y,
          this.w, this.h);
          if (typeof this.hovercallback == "function" && isHovered(this.x,this.y,this.w,this.h)){
            this.hovercallback(this.x,this.y,this.w,this.h)
          }
  }

  onLeftClick() {
     if (typeof this.callback == "function" && isHovered(this.x,this.y,this.w,this.h)) {
       this.callback();
    }
  }
}

class Text {
  constructor(gui,x,y,text,font,size,color,xalign = CENTER,yalign = CENTER){
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.gui = gui
  	this.font = font
	  this.size = size
    this.xalign = xalign
    this.yalign = yalign

    p55.gui[gui].push(this)
  }

  draw(){
    textFont(this.font)
    textSize(this.size)
    textAlign(this.xalign,this.yalign)
    fill(this.color)
    text(this.text,this.x,this.y)
  }

  destroy(){
    p55.gui[this.gui].spliceItem(this)
  }
}

class Animated {
  constructor(object,property,speed,max = NaN,reachMaxCallback = 0){
    this.object = object;
    this.property = property;
    this.speed = speed;
    this.max = max;
    this.reachMaxCallback = reachMaxCallback

    this.direction = Math.sign(speed);
    this.startVal = this.object[this.property];
    this.lastTime = actTime;
    this.val;

  }

  update(){
    var time = actTime - this.lastTime;
    var val = this.object[this.property] + deltaVarSpeed(time,this.speed);

    this.object[this.property] = val;

    if (this.max != NaN && typeof this.reachMaxCallback == "function"){
      if (val * this.direction >= this.max * this.direction){
          this.reachMaxCallback(this.object,this.property);
      }
    }
    this.lastTime = actTime;
  }


}

class FadeOut {
  constructor(object,rawColor,initAlpha,speed){
    this.object = object
    this.rawColor = rawColor
    this.alpha = initAlpha
    this.speed = speed
    this.animation = new Animated(this,"alpha",-speed,0,
    function(obj){obj.object.destroy()})

    this.object.fadeOut = this;

    this.object.staticDraw = this.object.draw;
    this.object.draw = function(){this.fadeOut.update() ; this.staticDraw()}
  }

  update(){
    this.animation.update()
    this.object.color = [this.rawColor[0],this.rawColor[1],this.rawColor[2],this.alpha];
  }

}

class Movement{
  constructor(object,speed,xTarget,yTarget){
    this.object = object
    this.speed = speed
    this.xTarget = xTarget
    this.yTarget = yTarget

    this.xReach = false
    this.yReach = false

    this.x = object.x
    this.y = object.y
    var dx = xTarget - object.x
    var dy = yTarget - object.y
    var dist = Math.sqrt(Math.pow(dx,2)+pow(dy,2));
    var vx = (dx / dist) * speed
    var vy = (dy / dist) * speed

    this.xAnimation = new Animated(this,"x",vx,xTarget,
      function(mov){mov.xReach = true ; if (mov.yReach) mov.end()})
    this.yAnimation = new Animated(this,"y",vy,yTarget,
      function(mov){mov.yReach = true ; if (mov.xReach) mov.end()})


    if (object.movement) object.movement.destroy()
    this.object.movement = this

    this.object.staticDraw = this.object.draw
    this.object.draw = function(){this.movement.update() ; this.staticDraw()}
  }

  update(){
    this.xAnimation.update();
    this.yAnimation.update();
    this.object.x = this.x;
    this.object.y = this.y;
  }

  destroy(){
    this.object.draw = this.object.staticDraw; this.object.movement = 0;
  }

  end(){
    this.object.x = this.xTarget ;
    this.object.y = this.yTarget ;
    this.destroy();
  }

}

function deltaVarSpeed(time,speed){
  var delta = (time * speed);
  return delta;
}

function applyFadeOut(object,rawColor,initAlpha,speed){
	new FadeOut(object,rawColor,initAlpha,speed);
}

function move(object,speed,xTarget,yTarget){
  new Movement(object,speed,xTarget,yTarget);
  clearGUI("windows");
}

function clearGUI(gui){
  if (typeof gui == "undefined"){
    for (var element in p55.gui){
      if (p55.gui.hasOwnProperty(element)){
        p55.gui[element] = []
      }
    }
  } else if (typeof gui == "string"){
    p55.gui[gui] = []
  }

}

function isHovered(x,y,w,h) { //teste si le curseur de la souris se trouve au dessus de la zone sp�cifi�e
  if (mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h ){
        return true;
      } else { return false; }
}

function getArrayID(array,element){
	//fonction générique renvoyant la clé d'un élément dans un tableau.
	//ne foncitonne correctement que si chaque élément est unique
	for (var i = 0; i < array.length; i++){
		if (array[i] == element){
			return i;
		}
	}

	return false;
}

Array.prototype.spliceItem = function(item){
	//m�thode appartenant au prototype des Arrays, ce qui signifie qu'elle sera pr�sente pour tous les tableaux
	//elle permet de d�truire un �l�ment du tableau, en sp�cifiant uniquement l'�l�ment en question
	//(sa cl� est d�termin�e via getArrayID())
	var array = this;
	array.splice(getArrayID(array,item),1)
}


//CHANGEMENTS A EFFECTUER POUR LA VERSION 1.0
//Création d'un objet graphique dont hériteront tous les autres
//Animations : changements pour permettre la simultanéité

