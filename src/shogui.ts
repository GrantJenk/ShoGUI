import GUI from "./gui";
import Board from "./board";
import { Config, Piecetype, Square, allSquares, Color, Arrow, Highlight } from "./types";
import { arrowsEqual } from "./util";
import Input from "./input";

export class ShoGUI {
    private board: Board;
    private gui: GUI;
    private input: Input;
    private highlightList: Highlight[];
    private arrowList: Arrow[];

    constructor(private container: HTMLElement, private config: Config) {
        this.board = new Board();
        this.gui = new GUI(this.board, container, config);
        this.input = new Input(this, config);

        this.highlightList = [];
        this.arrowList = [];
    }

    public setPosition(sfen: string) {
        this.board.setPosition(sfen);
    }

    public getPosition() {
        return this.board.getPosition();
    }

    public flipBoard() {
        this.gui.flipBoard();
    }

    private isSquareHighlighted(sq: Square): boolean {
        for (let tmphighlight of this.highlightList) {
            if ( tmphighlight.sq === sq) {
                return true;
            }
        }
        return false;
    }

    public addHighlight(highlight: Highlight): boolean {
        if (!this.isSquareHighlighted(highlight.sq)) {
            this.highlightList.push(highlight);
            return true;
        }
        return false;
    }

    public removeHighlight(highlight: Highlight): boolean {
        let i = 0;
        for (let tmphighlight of this.highlightList) {
            if ( tmphighlight.sq === highlight.sq) {
                this.highlightList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }

    public clearHighlights() {
        this.highlightList = [];
    }

    public addArrow(arrow: Arrow): boolean {
        if (arrow.dest === undefined) return false;
        this.arrowList.push(arrow);
        return true;
    }

    public removeArrow(arrow: Arrow): boolean {
        let i = 0;
        for (let cmpArrow of this.arrowList) {
            if ( arrowsEqual(cmpArrow, arrow) ) {
                this.arrowList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }

    public clearArrows() {
        this.arrowList = [];
    }

    public movePiece(srcSq: Square, destSq: Square) {
        let success = true;

        if (typeof this.config.onMovePiece === "function") {
            success = this.config.onMovePiece(srcSq, destSq);
        }

        if (success) {
            this.board.movePiece(srcSq, destSq);
        }
    }

    public dropPiece(color: Color, piecetype: Piecetype, sq: Square, num = 1) {
        let success = true;

        if (typeof this.config.onDropPiece === "function") {
            success = this.config.onDropPiece(color, piecetype, sq);
        }

        if (success) {
            this.board.dropPiece(color, piecetype, sq, num);
        }
    }

    public refreshCanvas() {
        let activeSquare = this.input.getActiveSquare();
        let draggingPiece = this.input.getDraggingPiece();
        let currentArrow = this.input.getCurrentArrow();
        this.gui.clearCanvas();

        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight.style, highlight.type, highlight.sq, highlight.alpha);
        }

        if (activeSquare) {
            this.gui.highlightSquare('mintcream', 'fill', activeSquare);
        }

        this.gui.drawBoard();
        this.gui.drawFileRankLabels();

        for (let i of allSquares) {
            if (activeSquare && draggingPiece) { // Don't draw the currently dragging piece on its square
                if (activeSquare === i) {
                    continue;
                }
            }
            this.gui.drawPieceAtSquare(i);
        }

        this.gui.drawHand('black'); 
        this.gui.drawHand('white');

        if (draggingPiece) {
            this.gui.drawPiece(draggingPiece.piece, draggingPiece.x - this.gui.getSqSize()/2, draggingPiece.y - this.gui.getSqSize()/2);
        }

        for ( let arrow of this.input.getUserArrows() ) { // Draw user input arrows
           this.drawArrow(arrow);
        }

        for ( let arrow of this.arrowList ) { // Draw programmatically-added arrows
            this.drawArrow(arrow);
        }

        if (currentArrow) {
            this.drawArrow(currentArrow);
        }

        this.gui.drawArrowCanvas(0.6);
    }

    private drawArrow(arrow: Arrow) {
        this.gui.drawSnapArrow(arrow);
    }

    public getBoard() {
        return this.board;
    }

    public getGui() {
        return this.gui;
    }
}

module.exports = ShoGUI;