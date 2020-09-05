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

export const ranks: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
export const files: number[] = [9, 8, 7, 6, 5, 4, 3, 2, 1];
export const squares: string[] = Array.prototype.concat(...ranks.map(r => files.map(c => c+r)));

export type Rank = typeof ranks[number];
export type File = typeof files[number];
export type Square = typeof squares[number];

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