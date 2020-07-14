import ShoGUI from "./shogui";
import { Square } from "./types";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

function onPieceMove(srcSq: Square, destSq: Square) {
    shogui.addArrow({style: 'black', fromSq: srcSq, toSq: destSq});
    console.log( srcSq + "-->" + destSq);
    return true;
}