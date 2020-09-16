import { Rect, Arrow, Piece, Square, squares, Color, Piecetype, Piececode } from "./types";

const piecetypeMap = new Map<Piececode, Piecetype>();
piecetypeMap.set('P', 'pawn');
piecetypeMap.set('L', 'lance');
piecetypeMap.set('N', 'knight');
piecetypeMap.set('S', 'silver');
piecetypeMap.set('G', 'gold');
piecetypeMap.set('B', 'bishop');
piecetypeMap.set('R', 'rook');
piecetypeMap.set('K', 'king');

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

export function oppositeColor(color: Color) {
    return color === 'black' ? 'white' : 'black';
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

export function getPiececode(piece: Piece): Piececode {
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

    return <Piececode>result;
}

export function getPieceObj(pieceCode: Piececode): Piece|undefined {
    let upper = pieceCode.toUpperCase();
    let pPromoted = pieceCode[0] === '+' ? true : false;
    let pColor: Color = pieceCode === upper ? 'black' : 'white';
    let pType = piecetypeMap.get(<Piececode>upper);
        if (!pType) return undefined;

    return { type:pType, color: pColor, promoted: pPromoted };
}
