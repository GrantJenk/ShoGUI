import { Piecetype } from "./types";

export default class Hand {
    private pieces: Map<Piecetype, number>;

    constructor() {
        this.pieces = new Map<Piecetype, number>();
        this.empty();
    }

    public empty() {
        this.pieces.set('pawn', 0);
        this.pieces.set('lance', 0);
        this.pieces.set('knight', 0);
        this.pieces.set('silver', 0);
        this.pieces.set('gold', 0);
        this.pieces.set('bishop', 0);
        this.pieces.set('rook', 0);
    }

    public getNumOfPieces(piece: Piecetype): number|undefined {
        return this.pieces.get(piece);
    }

    /**
     * Adds a piece to hand
     * @param piece 
     * @param num Optional - If not supplied, 1 is the default
     * @returns True if successful, false if not
     */
    public addPiece(piece: Piecetype, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (curAmount !== undefined) { // Make sure the current amount is not undefined
            this.pieces.set(piece, curAmount + num);
            return true;
        }
        return false;
    }

    /**
     * Removes a piece from hand
     * @param piece 
     * @param num Optional - If not supplied, 1 is the default
     * @returns True if successful, false if not
     */
    public removePiece(piece: Piecetype, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (!curAmount || curAmount <= 0) { 
            return false;
        }
        this.pieces.set(piece, curAmount - num);
        return true;
    }
}