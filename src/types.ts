export interface Config {
    orientation?: Color,
    onMovePiece?: (...args: Square[]) => boolean,
    onSelectPiece?: (piece: Piece, sq: Square) => boolean,
    onDeselectPiece?: () => boolean
}

export type Color = 'black' | 'white';
export type Piecetype = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn';
export type Coordinate = '9a' | '8a' | '7a' | '6a' | '5a' | '4a' | '3a' | '2a' | '1a' |
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
export interface SquareArrow { // Arrow going from one board square to another
    style: string,
    fromSq: Square,
    toSq: Square
}
export interface HandArrow { // Arrow going from a piece in hand to a board square
    style: string,
    piecetype: Piecetype,
    color: Color,
    toSq?: Square
}