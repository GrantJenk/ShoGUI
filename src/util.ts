import { Rect, Arrow, Piece, Square, squares, Color, Piecetype } from "./types";

/**
 * Determines if something is inside the Rect
 * @param rect - Rectangle to check if pos is inside
 * @param x - X coordinate of position
 * @param y - Y coordiante of position
 */
export function isPosInsideRect(rect: Rect, x: number, y: number) {
    if (x < rect.x || x >= rect.x + rect.width ||
        y < rect.y || y >= rect.y + rect.height) {
        return false;
    }
    return true;
}

export function arrowEndpointsEqual(arrow1: Arrow, arrow2: Arrow): boolean {
    if (arrow1.src === arrow2.src && arrow1.dest === arrow2.dest) return true;
    return false;
}

export function isValidSquare(arg:any): arg is Square {
    return squares.includes(arg) !== false;
}

// TOOD: Check hand substring of sfen
export function validSfen(sfen: string): boolean {
    let sfenArr = sfen.split(' ');
    let sfenBoard = sfenArr[0];
    let rows = sfenBoard.split('/');

    if (rows.length !== 9) {
        return false;
    }

    let sqCount = 0;
    for(let r of rows) {
        for(let char of r) {
            if ( !isNaN(Number(char)) ){
                sqCount += Number(char);
            } else {
                if (char === '+') {
                    continue;
                }
                if ( char.search(/[^plnsgbrkPLNSGBRK]/) ) {
                    sqCount++;
                } else {
                    return false;
                }
            }
        }
        if (sqCount !== 9) {
            return false;
        }
        sqCount = 0;
    }

    return true;
}

export function getPieceCode(piece: Piece): string {
    let result = '';

    // Get the sfen from piecetype
    if (piece.type === 'knight') {
        result += 'n'
    } else {
        result += piece.type[0];
    }

    // Make it uppercase if it's black's piece
    if (piece.color === 'black') {
        result = result.toUpperCase();
    }

    // Add the plus sign if the piece is promoted
    if (piece.promoted) {
        result = '+' + result;
    }

    return result;
}

const piecetypeMap = new Map<string, Piecetype>();
piecetypeMap.set('p', 'pawn');
piecetypeMap.set('l', 'lance');
piecetypeMap.set('n', 'knight');
piecetypeMap.set('s', 'silver');
piecetypeMap.set('g', 'gold');
piecetypeMap.set('b', 'bishop');
piecetypeMap.set('r', 'rook');
piecetypeMap.set('k', 'king');

export function getPieceObj(sfenPieceCode: string): Piece|undefined {
    let pieceCode = sfenPieceCode.toLowerCase();
    let pColor: Color = pieceCode === sfenPieceCode ? 'white' : 'black';
    let pType = piecetypeMap.get(pieceCode);
        if (!pType) return undefined;

    return {type:pType, color: pColor};
}
