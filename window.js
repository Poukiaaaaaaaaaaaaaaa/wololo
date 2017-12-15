class Window {
	constructor(x, y, w, h, title, nPages) {
		this.coord = { x: x, y: y, w: w, h: h }
		this.headerSize = this.coord.h / 5;
		this.cross = { x: x + w - super.headerSize, y: y, s: super.headerSize,
			isHovered: function(){ if (mouseX > this.x &&
									   mouseX < this.x + this.s &&
									   mouseY > this.y &&
									   mouseY < this.y + this.s) { return true } else { return false } } }
		this.title = title;
		this.nPages = nPages;
		this.pageCounter = 0;
		this.elements = [];
	}

	draw() {
		noStroke();

		fill(30, 10, 20);
		rect(this.coord.x, this.coord.y, this.coord.w, this.coord.h);

		fill(150);
		rect(this.coord.x, this.coord.y, this.coord.w, this.headerSize);

		if (this.cross.isHovered()) fill(255, 0, 0);
		else fill(255);
		rect(this.coord.x + this.coord.w - this.headerSize,  this.coord.y, this.headerSize, this.headerSize);
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
}

var win = new Window(50, 50, 150, 80, "Test", 5);

function draw() {
	background(80);

	win.draw();
}