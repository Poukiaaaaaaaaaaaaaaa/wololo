/**
*	This function "includes" a script file. It actually doesn't directly load it, but writes a script tag to the html page, which will cause
*	the browser to load the script when it reaches the tag. That means that the file is read *at least* after the end of the current script, 
*	so script usind and used by this function should only contain definitions, and not real script with a real effect.
*	@param {string} scriptFilePath the path of the file that will be loaded *on the server side*. Relative to the chesspp root dirctory (which contains main.js)
*/

function include(scriptFilePath) {
    document.write("<script type=\"text/javascript\" src=\""+scriptFilePath+"\"></script>");
}

/** 
*	This function changes the loading message. Only effective during the loading, whichs means before p5.js calls `setup()`
*	@param {string} message the message that will be reaplace the innerHTML of the loading message
*	@return {boolean} true if it worked
*/	

function loading(message){
	let loadingScreen = document.getElementById("p5_loading");
	if (loadingScreen){
		loadingScreen.innerHTML = message
		return true;
	} 
	return false; 
}

loading("Loading the game ...")

include("lib/p55_chess.js");
include("fw.js");
include("lib/chess/config.js");
include("lib/chess/globalFunctions.js");
include("lib/chess/mediaLoaders.js");
include("lib/chess/gui_makers.js");
include("lib/chess/game/class.js");
include("lib/chess/game/class_piece.js");