class Window {
	constructor(x,y,w,h,title,elements) {
		this.id = chessGUI.windows.length;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
		this.headerSize = h/7;
		this.cross = {
			x: x + w - h/7, y: y, s: h/7,
    	isHovered: function(){
				if (mouseX > this.x &&
				    mouseX < this.x + this.s &&
				    mouseY > this.y &&
				    mouseY < this.y + this.s) { return true } else { return false }
				}
		};
	this.eleBorder = h/25;
	this.title = title;
	this.titleSize = h/9;
	this.titleOffset = h/60;
	this.nPages = elements.length;
	this.pageCounter = 0;
  this.footer = { buttons: [], text: [] };
  this.footerOffset = h/80;
  this.footerHeight = h/12;
  this.closed = false;
  this.elements = [];

  for (let i = 0; i < this.nPages; i++) {
    this.elements[i] = { buttons: [], text: [] };
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
    }
  }


    for (var i = 0; i < 3; i++) {
      if (i == 0) this.footer.buttons[0] = new WButton(this,-this.eleBorder + this.footerOffset,this.h - this.eleBorder - this.footerHeight - this.headerSize - this.footerOffset,
                                           this.footerHeight,this.footerHeight,0,null,function(){if (this.win.pageCounter > 0) this.win.pageCounter -= 1});
      if (i == 1) this.footer.buttons[1] = new WButton(this,this.w - this.eleBorder - this.footerHeight - this.footerOffset,this.h - this.eleBorder - this.footerHeight - this.headerSize - this.footerOffset,
                                           this.footerHeight,this.footerHeight,1,null,function(){if (this.win.pageCounter < this.win.nPages-1) this.win.pageCounter += 1});
      if (i == 2) this.footer.text[0] = new FText(this,-this.eleBorder + this.w/2, this.h - this.footerHeight - this.headerSize, this.pageCounter+1 + "/" + this.nPages, this.footerHeight, [255]);
    }
	}

  shouldClose(){ if (this.cross.isHovered()) { return true } else { return false; } }

  clearElements() {
    this.elements[this.pageCounter] = { buttons: [], text: [] };
  }

  onLeftClick() {
    for (let i = 0; i < this.elements.length; i++) {
      for (let j = 0; j < this.elements[i].buttons.length; j++) {
        this.elements[i].buttons[j].onLeftClick();
      }
    }

    for (let i = 0; i < this.footer.buttons.length; i++) {
      this.footer.buttons[i].onLeftClick();
    }
  }

	draw() {
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
    image(winIMG[this.img],
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
