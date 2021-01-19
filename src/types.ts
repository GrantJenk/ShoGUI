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
export type Piecetype = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';
export type HighlightType = 'fill' | 'outline' | 'circle' | 'hidden'

export const pieceCodes = [ 'K', 'R', 'B', 'G', 'S', 'N', 'L', 'P',
                            'k', 'r', 'b', 'g', 's', 'n', 'l', 'p',
                            '+R', '+B', '+S', '+N', '+L', '+P',
                            '+r', '+b', '+s', '+n', '+l', '+p', ] as const;

export const files = ['9', '8', '7', '6', '5', '4', '3', '2', '1'] as const;
export const ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;
export const squares = Array.prototype.concat(...ranks.map(r => files.map(f => f+r)));

export type Piececode = typeof pieceCodes[number];
export type File = typeof files[number];
export type Rank = typeof ranks[number];
export type Square = `${File}${Rank}`;

export interface Piece {
    type: Piecetype,
    color: Color,
    promoted?: boolean
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
    src: Square|Piececode,
    dest?: Square
}
export interface Highlight {
    style: string,
    type: HighlightType,
    alpha?: number,
    sq: Square
}