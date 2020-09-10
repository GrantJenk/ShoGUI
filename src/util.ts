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

export function arrowsEqual(arrow1: Arrow, arrow2: Arrow): boolean {
    if (arrow1.src === arrow2.src) return true;
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

export function piece2sfen(piece: Piece): string {
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

export function sfen2Piece(sfen: string): Piece|undefined {
    let pUpper = sfen.toUpperCase();
    let result = { type: <Piecetype>'', color: <Color>''};

    result.color = pUpper === sfen ? 'black' : 'white';

    switch (pUpper) {
        case 'P':
            result.type = 'pawn';
            break;
        case 'L':
            result.type = 'lance';
            break;
        case 'N':
            result.type = 'knight';
            break;
        case 'S':
            result.type = 'silver';
            break;
        case 'G':
            result.type = 'gold';
            break;
        case 'R':
            result.type = 'rook';
            break;
        case 'B':
            result.type = 'bishop';
            break;
        case 'K':
            result.type = 'king';
            break;
        default:
            return undefined;
    }

    return result;
}
