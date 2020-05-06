import ShoGUI from "./shogui";
import { Square } from "./types";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

function onPieceMove(srcSq: Square, destSq: Square) {
    //console.log(srcSq.file + ", " + srcSq.rank + " --> " + destSq.file + ", " + destSq.rank);
    return true;
}