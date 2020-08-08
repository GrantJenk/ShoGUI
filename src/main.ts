import ShoGUI from "./shogui";
import { Color, Square, Piecetype } from "./types";

let shogui = new ShoGUI({onMovePiece: myPieceMove, onDropPiece: myDropPiece});

shogui.setPosition('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b 3p4P');

function myPieceMove(srcSq: Square, destSq: Square) {
    shogui.clearHighlights();
    shogui.addHighlight({style: 'lightgrey', type: 'fill', sq: srcSq, });
    shogui.addHighlight({style: 'lightgrey', type: 'fill', sq: destSq, });
    //shogui.addArrow({style: 'black', fromSq: srcSq, toSq: destSq});
    console.log( srcSq + "-->" + destSq);
    return true;
}

function myDropPiece(color: Color, piecetype: Piecetype, sq: Square) {
    shogui.clearHighlights();
    shogui.addHighlight({style: 'lightgrey', type: 'fill', sq: sq});
    return true;
}