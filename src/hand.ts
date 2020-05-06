import { Piecerole } from "./types";

export default class Hand {
    private pieces: Map<Piecerole, number>;

    constructor() {
        this.pieces = new Map<Piecerole, number>();
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

    public getNumOfPieces(piece: Piecerole): number|undefined {
        return this.pieces.get(piece);
    }

    /**
     * Adds a piece to hand
     * @param piece 
     * @param num Optional - If not supplied, 1 is the default
     * @returns True if successful, false if not
     */
    public addPiece(piece: Piecerole, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (curAmount !== undefined) { // Make sure the current amount is not undefined
            this.pieces.set(piece, curAmount + num);
            return true;
        }
        return false;
    }

    /**
     * Removes a piece to hand
     * @param piece 
     * @param num Optional - If not supplied, 1 is the default
     * @returns True if successful, false if not
     */
    removePiece(piece: Piecerole, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (!curAmount || curAmount <= 0) { 
            return false;
        }
        this.pieces.set(piece, curAmount - num);
        return true;
    }
}