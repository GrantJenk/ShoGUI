import { Rect, Square, Move, Drop } from "./types";

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

/**
 * Determines if two squares are the same
 * @param {Square} sq1
 * @param {Square} sq2
 */
export function squaresEqual(sq1: Square, sq2: Square) {
    if (sq1.col === sq2.col && sq1.row === sq2.row) return true;
    return false;
}

export function isMove(arg: any): arg is Move {
    return arg && arg.src && arg.dest;
}

export function isDrop(arg: any): arg is Drop {
    return arg && arg.piece && arg.dest;
}

/**
 * Converts a square to its corresponding Shogi notation
 * @param sq Square
 * @example sq(1, 1) --> "8b"
 */
export function square2ShogiNotation(sq: Square): string {
    let colString = String.fromCharCode( (9 - sq.col) + 48);
    let rowString = String.fromCharCode(sq.row + 97);
    return colString + rowString;
}

/**
 * Converts a Shogi notation to its corresponding square
 * @param sNotation square in shogi algebraic notation
 * @example "8b" --> sq(1, 1)
 */
export function shogiNotation2Square(sNotation: string): Square {
    let col = 9 - parseInt(sNotation[0]);
    let row = sNotation.charCodeAt(0) - 97;
    return { col: col, row: row };
}