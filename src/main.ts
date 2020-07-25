import ShoGUI from "./shogui";
import { Square } from "./types";

let shogui = new ShoGUI({onMovePiece: onPieceMove});

shogui.setPosition('lnsgk2nl/1r4gs1/p1pppp1pp/1p4p2/7P1/2P6/PP1PPPP1P/1SG4R1/LN2KGSNL b 7b');

/*
function testadd() {
    shogui.addHighlight({style: 'red', type: 'outline', sq: '1a'});
    shogui.drawGame();
}

function testremove() {
    shogui.removeHighlight({style: 'red', type: 'outline', sq: '1a'});
    shogui.drawGame();
}

function blink() {
    testadd();
    setTimeout( testremove, 300);
    setTimeout( testadd, 600);
    setTimeout( testremove, 900);
    setTimeout( testadd, 1200);
    setTimeout( testremove, 1500);
}

blink();
*/

function onPieceMove(srcSq: Square, destSq: Square) {
    shogui.clearHighlights();
    shogui.addHighlight({style: 'lightgrey', type: 'fill', sq: srcSq, });
    shogui.addHighlight({style: 'lightgrey', type: 'fill', sq: destSq, });
    //shogui.addArrow({style: 'black', fromSq: srcSq, toSq: destSq});
    console.log( srcSq + "-->" + destSq);
    return true;
}