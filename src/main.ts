import ShoGUI from "./shogui";
import { Square } from "./types";
import { square2ShogiCoordinate, shogiCoordinate2Square } from "./util";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

function onPieceMove(srcSq: Square, destSq: Square) {
    console.log( square2ShogiCoordinate({col: 11, row: 11}) );
    return true;
}