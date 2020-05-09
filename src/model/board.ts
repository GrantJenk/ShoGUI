import { Piece, Square } from "../types";
import { squaresEqual } from "../util";

export default class Board {
    private rows: number;
    private cols: number;
    private squares: (Piece|undefined)[][];

    constructor(rows=9, cols=9) {
        this.rows = rows;
        this.cols = cols;
        this.squares = [];
        for (let f = 0; f < cols; f++) {
            this.squares[f] = [];
            for (let r = 0; r < rows; r++) {
                this.squares[f][r] = undefined;
            }
        }
    }

    public ascii(): void {
        for (let r = 0; r < this.rows; r++) {
            let s = '';
            for (let f = 0; f < this.cols; f++) {
                let pce = this.squares[f][r];
                if (pce) {
                    s += pce.type;
                } else {
                    s += '.';
                }
            }
            console.log(s);
        }
    }

    public setStartingPosition() {
        for (let f = 0; f < 9; f++) {
            this.squares[f][6] = { type: 'pawn', color: 'black' };
            this.squares[f][2] = { type: 'pawn', color: 'white' };
        }

        this.squares[0][0] = { type: 'lance', color: 'white' };
        this.squares[8][0] = { type: 'lance', color: 'white' };
        this.squares[0][8] = { type: 'lance', color: 'black' };
        this.squares[8][8] = { type: 'lance', color: 'black' };
        this.squares[1][0] = { type: 'knight', color: 'white' };
        this.squares[7][0] = { type: 'knight', color: 'white' };
        this.squares[1][8] = { type: 'knight', color: 'black' };
        this.squares[7][8] = { type: 'knight', color: 'black' };
        this.squares[2][0] = { type: 'silver', color: 'white' };
        this.squares[6][0] = { type: 'silver', color: 'white' };
        this.squares[2][8] = { type: 'silver', color: 'black' };
        this.squares[6][8] = { type: 'silver', color: 'black' };
        this.squares[3][0] = { type: 'gold', color: 'white' };
        this.squares[5][0] = { type: 'gold', color: 'white' };
        this.squares[3][8] = { type: 'gold', color: 'black' };
        this.squares[5][8] = { type: 'gold', color: 'black' };
        this.squares[7][1] = { type: 'bishop', color: 'white' };
        this.squares[1][7] = { type: 'bishop', color: 'black' };
        this.squares[1][1] = { type: 'rook', color: 'white' };
        this.squares[7][7] = { type: 'rook', color: 'black' };
        this.squares[4][0] = { type: 'king', color: 'white' };
        this.squares[4][8] = { type: 'king', color: 'black' };
    }

    /**
     *  Moves a piece on the board. Does NOT check if legal or not
     *
     * @param   {Square} fromSq - Source square
     * @param   {Square} toSq - Destination square
     * @returns {boolean} True if successful, false if not
     */
    public movePiece(fromSq: Square, toSq: Square): boolean {
        if (squaresEqual(fromSq, toSq)) return false;

        if (this.squares[fromSq.col][fromSq.row]) {
            this.squares[toSq.col][toSq.row] = this.squares[fromSq.col][fromSq.row];
            this.squares[fromSq.col][fromSq.row] = undefined;
            return true;
        }

        return false;
    }

    public getPiece(sq: Square): Piece|undefined {
        return this.squares[sq.col][sq.row];
    }

    public addPiece(piece: Piece, sq: Square): void {
        this.squares[sq.col][sq.row] = piece;
    }

    public getDimensions() {
        return { cols: this.cols, rows: this.rows };
    }
}