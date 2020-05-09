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
    if (sq1.file === sq2.file && sq1.rank === sq2.rank) return true;
    return false;
}

export function isMove(arg: any): arg is Move {
    return arg && arg.src && arg.dest;
}

export function isDrop(arg: any): arg is Drop {
    return arg && arg.piece && arg.dest;
}