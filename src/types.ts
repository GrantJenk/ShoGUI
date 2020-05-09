export interface Config {
    orientation?: Color,
    onMovePiece?: (...args: Square[]) => boolean,
    onSelectPiece?: (piece: Piece, sq: Square) => boolean,
    onDeselectPiece?: () => boolean
}

export type Color = 'black' | 'white';
export type Piecetype = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';

export interface Square { // Note: this does not map to an actual shogi square coordinate, hence the "col" and "row" instead of "file" and "rank"
    col: number,
    row: number
};
export interface Piece {
    type: Piecetype,
    color: Color,
    promoted?: boolean
}
export interface Move {
    src: Square,
    dest: Square,
}
export interface Drop {
    piece: Piece,
    dest: Square
}
export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}