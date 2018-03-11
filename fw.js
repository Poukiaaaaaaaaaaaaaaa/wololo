class Window {
	constructor(x,y,w,h,title,elements,dPage = 0) {
		this.x = x; //coordonnées
		this.y = y; //^
		this.w = w; //^
		this.h = h; //^
			this.headerSize = h/7;
			this.cross = { //"croix" de la fenêtre
				x: x + w - h/7, y: y, s: h/7,
			isHovered: function(){ //utilisation de cette fonction dans la méthode onLeftClick() > fermeture de la fenêtre
					if (mouseX > this.x &&
						mouseX < this.x + this.s &&
						mouseY > this.y &&
						mouseY < this.y + this.s) { return true } else { return false }
					}
			};
		//calcul des coordonnées et de la taille du titre de la fenêtre
		this.title = title;
		this.titleSize = h/9;
		this.titleOffset = h/60;

		//éléments du "footer" > nombre de pages, etc...
		this.nPages = elements.length;
		this.pageCounter = dPage //page par défaut
	  this.footer = { buttons: [], text: [] };
	  this.footerOffset = h/80;
	  this.footerHeight = h/12;

		//éléments nécessaires à la gestion des éléments de chaque page
		this.eleBorder = h/25;
	  this.elements = [];

		//ajout des éléments à partir du tableau d'éléments fourni dans le constructeur
	  for (let i = 0; i < this.nPages; i++) {
			this.elements[i] = { buttons: [], text: [], images: [] };
	  }

	  for (let i = 0; i < elements.length; i++) {
			for (let j = 0; j < elements[i].length; j++) {
			  if (elements[i][j].type === "button") {
				this.elements[i].buttons.push(new WButton(this, elements[i][j].coord.x, elements[i][j].coord.y,
														  elements[i][j].coord.w, elements[i][j].coord.h,
														  elements[i][j].img, elements[i][j].hovercallback, elements[i][j].callback));
			  }

			  if (elements[i][j].type === "text") {
				this.elements[i].text.push(new WText(this, elements[i][j].coord.x, elements[i][j].coord.y,
													 elements[i][j].text, elements[i][j].size, elements[i][j].color));
			  }
			  
			   if (elements[i][j].type === "image") {
				this.elements[i].text.push(new WImage(this, elements[i][j].coord.x, elements[i][j].coord.y,
													elements[i][j].coord.w, elements[i][j].coord.h,
														  elements[i][j].img));
			  }
			}
	  }

		//ajout des éléments du "footer"
		for (var i = 0; i < 3; i++) {
		  if (i == 0) this.footer.buttons[0] = new WButton(this,-this.eleBorder + this.footerOffset,this.h - this.eleBorder - this.footerHeight - this.headerSize - this.footerOffset,
											   this.footerHeight,this.footerHeight,winIMG[0],null,function(){if (this.win.pageCounter > 0) this.win.pageCounter -= 1});
		  if (i == 1) this.footer.buttons[1] = new WButton(this,this.w - this.eleBorder - this.footerHeight - this.footerOffset,this.h - this.eleBorder - this.footerHeight - this.headerSize - this.footerOffset,
											   this.footerHeight,this.footerHeight,winIMG[1],null,function(){if (this.win.pageCounter < this.win.nPages-1) this.win.pageCounter += 1});
		  if (i == 2) this.footer.text[0] = new FText(this,-this.eleBorder + this.w/2, this.h - this.footerHeight - this.headerSize, this.pageCounter+1 + "/" + this.nPages, this.footerHeight, [255]);
		}

		//ajout de la fenêtre dans la GUI
		chessGUI.windows.push(this);
	}

  clearElements() {
		//fonction supprimant les éléments de la page actuelle
    this.elements[this.pageCounter] = { buttons: [], text: [] };
  }

  onLeftClick() {
		//condition de fermeture de la fenêtre
		if (this.cross.isHovered()) chessGUI.windows.spliceItem(this);

    for (let i = 0; i < this.footer.buttons.length; i++) {
			//appelle le onLeftClick() des éléments du "footer"
      this.footer.buttons[i].onLeftClick();
    }
	
	wclickloop: for (let j = 0; j < this.elements[this.pageCounter].buttons.length; j++) {
				//appelle la méthode onLeftClick() de tous les boutons de l'array 'elements' affichés
        if (this.elements[this.pageCounter].buttons[j].onLeftClick()) return true
      }
	
  }

	draw() {
		// Draw de la window, incluant les footer, la window elle-même et les éléments de la page actuelle
		// Tout ce qui concerne le framework
			noStroke(); textSize(this.titleSize);
			textAlign(LEFT, TOP);
			fill(30, 10, 20);
			rect(this.x, this.y, this.w, this.h);
			fill(150);
			rect(this.x, this.y, this.w, this.headerSize);
			fill(255);
			text(this.title, this.x + this.titleOffset, this.y + this.titleOffset);
			if (this.cross.isHovered()) fill(230, 50, 0);
			else fill(250);
			rect(this.x + this.w - this.headerSize,  this.y, this.headerSize, this.headerSize);
		// Fin Du Framework

    // Footer
		if (this.nPages > 1) {
			for (let i in this.footer) {
				for (let j = 0; j < this.footer[i].length; j++) {
					this.footer[i][j].draw();
				}
			}
		}
    // Footer End

		// Elements
			for (let i in this.elements[this.pageCounter]) {
				for (let j = 0; j < this.elements[this.pageCounter][i].length; j++) {
					if (typeof (this.elements[this.pageCounter][i][j].draw) == "function")
            this.elements[this.pageCounter][i][j].draw();
				}
			}
		// Fin des Elements

	}
}

class WindowElement {
	// Classe de base d'un élément de la window, classe mère de tous les différents types d'éléments de la window
	constructor(win, x, y) {
		this.win = win;
		this.x = x + this.win.x + this.win.eleBorder;
		this.y = y + this.win.y + this.win.headerSize + this.win.eleBorder;
	}

	draw() { //fonction à overload dans chaque classe qui hérite
		return false;
	}
}

class WText extends WindowElement {
	constructor(win,x,y,text,size,color) {
		super(win, x, y);
		this.text = text;
		this.size = size;
		this.color = color;
	}

	draw() {
		textAlign(LEFT, TOP);
		textSize(this.size); fill(this.color);
		textFont("Arial");
		text(this.text, this.x, this.y);
	}
}

class FText extends WText {
  constructor(win,x,y,text,size,color) {
    super(win, x, y, text, size, color);
  }

  draw() {
		textAlign(CENTER, CENTER);
		textSize(this.size); fill(this.color);
		textFont("Arial")
		text(this.text, this.x, this.y);
    this.update();
	}

  update() {
    this.text = (this.win.pageCounter+1) + "/" + (this.win.nPages);
  }
}

class WButton extends WindowElement {
  constructor(win,x,y,w,h,img,hovercallback,callback) {
		super(win, x, y);
    this.w = w;
    this.h = h;
    this.img = img;
    this.hovercallback = hovercallback;
    this.callback = callback;
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
	   return true
    }
  }
}

class WImage extends WindowElement {
	
	constructor(win,x,y,w,h,img,hovercallback,callback) {
		super(win, x, y);
    this.w = w;
    this.h = h;
    this.img = img;
  }

  draw() {
    image(this.img,
          this.x, this.y,
          this.w, this.h);
    }
	

}
