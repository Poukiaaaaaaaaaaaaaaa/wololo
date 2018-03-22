function include(scriptFilePath) {
    document.write("<script type=\"text/javascript\" src=\""+scriptFilePath+"\"></script>");
}

include("lib/p55_chess.js")
include("fw.js")
include("lib/chess/config.js")
include("lib/chess/globalFunctions.js")
include("lib/chess/mediaLoaders.js")
include("lib/chess/gui_makers.js")
include("lib/chess/game/class.js")
include("lib/chess/game/class_piece.js")