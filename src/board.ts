import { Piece, Square } from "./types";

export default class Board {
    private pieceList: Map<Square, Piece>;

    constructor() {
        this.pieceList = new Map<Square, Piece>();
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