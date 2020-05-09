import GUI from "./gui";
import Board from "./board";

export default class Controller {
    private board: Board;
    private gui: GUI;

    constructor(board: Board, gui: GUI) {
        this.board = board;
        this.gui = gui;
    }

    public drawGame() { // Does this belong here?

    }

    public addSquareHighlight() {

    }

    public removeSquareHighlight() {

    }

    public addArrow() {

    }

    public removeArrow() {
        
    }

    public movePiece() {

    }

    public dropPiece() {

    }

    public selectSquare() {

    }

    // Sets or gets current position
    public position(position?: string) {

    }

    public flipBoard() {

    }
}