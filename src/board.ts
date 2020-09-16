import { Piece, Piecetype, Square, Color, squares, Piececode } from "./types";
import { validSfen, getPiececode, getPieceObj } from "./util";

export default class Board {
    private pieceList: Map<Square, Piece>;
    private whiteHand: Map<Piecetype, number>;
    private blackHand: Map<Piecetype, number>;

    constructor() {
        this.pieceList = new Map<Square, Piece>();
        this.blackHand = new Map<Piecetype, number>();

        this.blackHand.set('pawn', 0);
        this.blackHand.set('lance', 0);
        this.blackHand.set('knight', 0);
        this.blackHand.set('silver', 0);
        this.blackHand.set('gold', 0);
        this.blackHand.set('bishop', 0);
        this.blackHand.set('rook', 0);

        this.whiteHand = new Map<Piecetype, number>(this.blackHand);
    }

    /** 
     * Sets the board to sfen position
     * @param sfen - sfen string
     */
    public setPosition(sfen: string): boolean {
        if (!validSfen(sfen)) {
            return false;
        }
        let sfenArr = sfen.split(' ');
        let sfenBoard = sfenArr[0];
        let sfenHand = sfenArr[2];

        let rows = sfenBoard.split('/');
        let curSquareIndex = 0;
        let isPromote = false;

        for (let r of rows) {
            for (let char of r) {
                if ( isNaN(Number(char)) ) {
                    if (char === '+') {
                        if (isPromote) throw new Error ('ERROR: Two "+" signs found in a row in sfen');
                        isPromote = true;
                        continue;
                    }
                    let piece = getPieceObj(<Piececode>char);
                    if (!piece) {
                        throw new Error('Failed to retrieve piece from sfen for character: ' + char);
                    }
                    if (isPromote) piece.promoted = true;
                    this.addPiece(piece, squares[curSquareIndex]);
                    curSquareIndex++;
                } else {
                    curSquareIndex = curSquareIndex + Number(char);
                }
                isPromote = false;
            }
        }

        if (sfenHand) {
            let amt = 1;
            for (let char of sfenHand) {
                let piece = getPieceObj(<Piececode>char);
                if ( !isNaN(Number(char)) ) {
                    amt = Number(char);
                    continue;
                } else {
                    if (!piece) {
                        throw new Error('ERROR: Cannot get piece from sfen for character ' + char);
                    }

                    this.add2Hand(piece.color, piece.type, amt);

                    amt = 1;
                }
            }
        }
        return true;
    }

    /** 
     * Gets the board's SFEN position
     * TODO: Add hand substring of sfen
     */
    public getPosition(): string {
        let sfen = '';
        let numEmptySpaces = 0;

        for (let curSq of squares) {
            let piece = this.pieceList.get(curSq);

            if (piece) {
                if (numEmptySpaces !== 0) {
                    sfen += numEmptySpaces.toString();
                }
                sfen += getPiececode(piece);
                numEmptySpaces = 0;
            } else {
                numEmptySpaces++;
            }

            if (curSq[0] === '1') {
                if (numEmptySpaces !== 0) {
                    sfen += numEmptySpaces.toString();
                }
                numEmptySpaces = 0;
                if (curSq !== squares[squares.length - 1]) {
                    sfen += '/';
                }
            }
        }

        return sfen;
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

    public dropPiece(color: Color, piecetype: Piecetype, sq: Square, num = 1) {
        if (this.removeFromHand(color, piecetype, num)) {
            this.pieceList.set(sq, {type: piecetype, color: color});
            return true;
        }
        return false;
    }

    public add2Hand(color: Color, piecetype: Piecetype, num = 1) {
        let hand = this.getHand(color);
        let curAmount = hand?.get(piecetype);
        if (curAmount !== undefined) {
            hand?.set(piecetype, curAmount + num);
            return true;
        }
        return false;
    }

    public removeFromHand(color: Color, piecetype: Piecetype, num = 1) {
        let hand = this.getHand(color);
        let curAmount = hand?.get(piecetype);
        if (!curAmount || curAmount - num < 0) { 
            return false;
        }
        hand?.set(piecetype, curAmount - num);
        return true;
    }

    public getNumPiecesInHand(color: Color, piecetype: Piecetype) {
        return this.getHand(color)?.get(piecetype);
    }

    private getHand(color: Color): Map<Piecetype, number> | undefined {
        if (color === 'black') {
            return this.blackHand;
        } else if (color === 'white') {
            return this.whiteHand;
        }
        return undefined;
    }
}