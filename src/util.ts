import { Rect, Move, Drop, SquareArrow, HandArrow, Piecetype } from "./types";

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

export function arrowsEqual(arrow1: SquareArrow|HandArrow, arrow2: SquareArrow|HandArrow): boolean {
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
            return 'pawn';
        case 'L':
            return 'lance';
        case 'N':
            return 'knight';
        case 'S':
            return 'silver';
        case 'G':
            return 'gold';
        case 'R':
            return 'rook';
        case 'B':
            return 'bishop';
        case 'K':
            return 'king';
        default:
            return undefined;
    }
}

export function isMove(arg: any): arg is Move {
    return arg && arg.src && arg.dest;
}

export function isDrop(arg: any): arg is Drop {
    return arg && arg.piece && arg.dest;
}

export function isSquareArrow(arg: any): arg is SquareArrow {
    return arg && arg.style && arg.fromSq && arg.toSq;
}

export function isHandArrow(arg: any): arg is HandArrow {
    return arg && arg.style && arg.piecetype && arg.color && arg.toSq;
}