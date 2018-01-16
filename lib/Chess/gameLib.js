var titleView = {
	mainPage : function(){
    clearGUI("hud")
    {let titleW = config.unit * 90, titleH = config.unit * 18
    new StaticImage("hud",img.title[1],config.canvasW/2 - titleW / 2,config.canvasH/5 - titleH / 2,titleW,titleH)}
    {let playButtonW = config.unit * 50, playButtonH = config.unit * 20
    new Button("hud",img.title[2],config.canvasW/2 - playButtonW / 2,config.canvasH/5*3 - playButtonH / 2,playButtonW,playButtonH,
      function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
      function(){startGame()})}
    {let setButtonS = config.unit * 20
    new Button("hud",img.title[4],config.canvasW/4 - setButtonS/2,config.canvasH/5*3 - setButtonS / 2,setButtonS,setButtonS,
    function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
    function(){titleView.settings()})}
    {let helpButtonS = config.unit * 20
    new Button("hud",img.title[6],config.canvasW/4 * 3 - helpButtonS/2,config.canvasH/5*3 - helpButtonS / 2,helpButtonS,helpButtonS,
    function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h,config.unit*3)},
    function(){let win = window.open("help.html", '_blank') ; win.focus()})}
	},
	settings : function(){
		clearGUI("hud")
		new Text("hud",config.canvasW/2,config.canvasH/8,"SETTINGS","Verdana",50,[255, 178, 0])
		new Button("hud",img.title[5],config.canvasW / 5 * 4,config.canvasH/8, config.unit * 16, config.unit * 9,
			function(){fill([200,200,200,50]); rect(this.x,this.y,this.w,this.h)},
			function(){titleView.mainPage()});


		guiElements.settingsPlayerName = [];
		for (let i = 0; i < joueur.length; i++){
			guiElements.settingsPlayerName[i] = new Text(
				"hud",config.canvasW/4,config.canvasH/4 + i * config.unit * 4,"Joueur "+(i+1)+": "+joueur[i].name,"Verdana",config.unit * 3,[255, 251, 0],LEFT,TOP)
			let butno = new Button(
				"hud",img.title[3],config.canvasW/4 + config.unit * 40,config.canvasH/4 + i * config.unit * 4,config.unit * 3,config.unit*3,
				function(){fill([200,200,200,50]) ; rect(this.x,this.y,this.w,this.h)},
				function(){joueur[this.player].name = prompt("Name") ;
					guiElements.settingsPlayerName[this.player].text = "Joueur "+(this.player+1)+": "+joueur[this.player].name})
			butno.player = i;
    }

  }
}