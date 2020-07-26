import { Rect, SquareArrow, HandArrow, Piecetype, Arrow } from "./types";


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
    if ( isSquareArrow(arrow1) && isSquareArrow(arrow2) ) {
        if ( arrow1.toSq === arrow2.toSq && arrow1.fromSq === arrow2.fromSq) {
            return true;
        }
    } else if ( isHandArrow(arrow1) && isHandArrow(arrow2) ) {
        if (arrow1.piecetype === arrow2.piecetype && arrow1.color === arrow2.color) {
            if ( arrow1.toSq && arrow2.toSq && arrow1.toSq === arrow2.toSq) {
                return true;
            }
        }
    }
    return false;
}

export function sfen2Piecetype(sfen: string): Piecetype|undefined {
    switch (sfen.toUpperCase()) {
        case 'P':
        case 'p':
            return 'pawn';
        case 'L':
        case 'l':
            return 'lance';
        case 'N':
        case 'n':
            return 'knight';
        case 'S':
        case 's':
            return 'silver';
        case 'G':
        case 'g':
            return 'gold';
        case 'R':
        case 'r':
            return 'rook';
        case 'B':
        case 'b':
            return 'bishop';
        case 'K':
        case 'k':
            return 'king';
        default:
            return undefined;
    }
}

export function isSquareArrow(arg: any): arg is SquareArrow {
    return arg && arg.style && arg.fromSq && arg.toSq;
}

export function isHandArrow(arg: any): arg is HandArrow {
    return arg && arg.style && arg.piecetype && arg.color && arg.toSq;
}