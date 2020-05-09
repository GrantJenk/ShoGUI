import ShoGUI from "./shogui";
import { Square } from "./types";
import { square2ShogiNotation } from "./util";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

function onPieceMove(srcSq: Square, destSq: Square) {
    console.log( square2ShogiNotation(srcSq) + "-->" + square2ShogiNotation(destSq) );
    return true;
}