export interface Config {
    orientation?: Color,
    arrowStyle?: string,
    altArrowStyle?: string,
    ctrlArrowStyle?: string,
    onMovePiece?: (...args: Square[]) => boolean,
    onDropPiece?: (color: Color, piecetype: Piecetype, sq: Square) => boolean,
    onSelectPiece?: (piece: Piece, sq: Square) => boolean,
    onDeselectPiece?: () => boolean
}

export type Color = 'black' | 'white';
export type Piecetype = 'king' | 'rook' | 'bishop'  | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';
export type Square = '9a' | '8a' | '7a' | '6a' | '5a' | '4a' | '3a' | '2a' | '1a' |
                     '9b' | '8b' | '7b' | '6b' | '5b' | '4b' | '3b' | '2b' | '1b' |
                     '9c' | '8c' | '7c' | '6c' | '5c' | '4c' | '3c' | '2c' | '1c' |
                     '9d' | '8d' | '7d' | '6d' | '5d' | '4d' | '3d' | '2d' | '1d' |
                     '9e' | '8e' | '7e' | '6e' | '5e' | '4e' | '3e' | '2e' | '1e' |
                     '9f' | '8f' | '7f' | '6f' | '5f' | '4f' | '3f' | '2f' | '1f' |
                     '9g' | '8g' | '7g' | '6g' | '5g' | '4g' | '3g' | '2g' | '1g' |
                     '9h' | '8h' | '7h' | '6h' | '5h' | '4h' | '3h' | '2h' | '1h' |
                     '9i' | '8i' | '7i' | '6i' | '5i' | '4i' | '3i' | '2i' | '1i';

export type Rank = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i';
export type File = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const ranks: Rank[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
export const files: File[] = [9, 8, 7, 6, 5, 4, 3, 2, 1];
export const allSquares: Square[] = Array.prototype.concat(...ranks.map(r => files.map(c => c+r)));

export type HighlightType = 'fill' | 'outline' | 'circle' | 'hidden'

export interface Piece {
    type: Piecetype,
    color: Color,
    promoted?: boolean
}
export interface HandPiece {
    type: Piecetype,
    color: Color,
}
export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}
export interface Arrow {
    style: string;
    size: number,
    src: Square|HandPiece,
    dest?: Square
}
export interface Highlight {
    style: string,
    type: HighlightType,
    alpha?: number,
    sq: Square
}