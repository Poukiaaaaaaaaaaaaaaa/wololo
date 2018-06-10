//Transformer l'onglet en mini fenêtre
//Voir comment faire un truc persistant après reload (call un truc dans chesspp qui attend que ce soit load pour tout remettre)

function update(){
	if (!window.chessWindow) return false;
	window.pieces = window.pieces || window.chessWindow.chessPP.Piece;
	let list = document.getElementById("pList"), element, piece;
	for (let pieceID in pieces){
		if (pieces.hasOwnProperty(pieceID)) {
			piece = pieces[pieceID];
			element = list.appendChild(document.createElement('li'));
			element.innerHTML = piece.name + '<br>';
			if (piece.default) element.style.fontWeight="bold" ;
		}
	}
	window.layouts = window.layouts || window.chessWindow.chessPP.pieceLayout;
	list = document.getElementById("lList")
	for (let layoutID in layouts){
		if (layouts.hasOwnProperty(layoutID)) {
			layout = layouts[layoutID];
			element = list.appendChild(document.createElement('li'));
			element.innerHTML = layout.name + '<br>';
			if (piece.default) element.style.fontWeight="bold" ;
		}
	}
	return true;
}
	
window.onload = function() {
	if (!update()){
		document.children[0].innerHTML = "Unable to load the piece loading service. <br>" + 
		"This may be caused by the tab being reloaded (don't reload it)." 
	}
	document.getElementById("fileInput").onchange = function(evt){
		startRead(evt.target)
	}
}

function startRead(reader) {

  let file = reader.files[0];
  if(file){
    loadPieceFile(file);
  }
}

function readTextFile(readFile, callback){
  var reader = new FileReader();

  reader.readAsText(readFile, "UTF-16");
	fileStateLog("Chargement du fichier ...", "#0000ff")
  // Handle progress, success, and errors
  reader.onload = callback;
  reader.onerror = errorHandler;
}

function loadPieceFile(file){
	readTextFile(file, pieceLoadCallback)
}

function pieceLoadCallback(evt) {
	var fileString = evt.target.result;
	console.log(evt)
	
	
	fileStateLog("La pièce a été ajoutée", "#20ff20")
	try { 
		let classBuilder = Function(fileString)()
	} catch (error){
		fileStateLog("ERREUR : Erreur dans le fichier : " + error, "#ff0000")
		return false
	}
  
	if (window.chessWindow.chessPP.Piece[classBuilder.name]){
		fileStateLog("ERREUR : Une pièce possède déjà cet identifiant")
	}
  
  classBuilder.default = false
  window.chessWindow.chessPP.Piece[classBuilder.name] = classBuilder
  
}

function fileStateLog(msg, color){
	let info = document.getElementById("loadInfo")
		info.innerHTML = msg
		info.style.color = color
	return info
	
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		fileStateLog("ERREUR : Impossible de lire le fichier", "#ff0000")
	}
}