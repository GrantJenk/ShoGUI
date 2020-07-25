import { Piece, Square, Color, allSquares } from "./types";
import { sfen2Piecetype } from "./util";

export default class Board {
    private pieceList: Map<Square, Piece>;

    constructor() {
        this.pieceList = new Map<Square, Piece>();
    }

    /** 
     * Sets the board to sfen position
     * @param sfenBoardField - Substring of total SFEN that is soley the Board field
     */
    public setPosition(sfenBoardField: string) {
        let rows = sfenBoardField.split('/');
        let curSquareIndex = 0;
        let isPromote = false;

        for (let r of rows) {
            for (let char of r) {
                if ( isNaN(Number(char)) ) {
                    if (char === '+') {
                        isPromote = true;
                        continue;
                    }
                    let color: Color = char.toLowerCase() === char ? 'white' : 'black';
                    let pType = sfen2Piecetype(char);
                    if (!pType) {
                        throw new Error('Failed to retrieve Piecetype from SFEN for character: ' + char);
                    }
                    this.addPiece({type: pType, color: color, promoted: isPromote}, allSquares[curSquareIndex]);
                    curSquareIndex++;
                } else {
                    curSquareIndex = curSquareIndex + Number(char);
                }
                isPromote = false;
            }
        }
    }

    public movePiece(fromSq: Square, toSq: Square): boolean {
        if (fromSq === toSq) return false;

        let piece = this.pieceList.get(fromSq);
        if (piece) {
            this.pieceList.set(toSq, piece);
            this.pieceList.delete(fromSq);
            return true;
        }

        return false;
    }

    public getPiece(sq: Square): Piece|undefined {
        return this.pieceList.get(sq);
    }

    public addPiece(piece: Piece, sq: Square) {
        this.pieceList.set(sq, piece);
    }
}