import { Color, Piece, Piecetype, Rect, Square, Move, Drop } from "../types";
import Board from "../model/board";
import Hand from "../model/hand";
import { squaresEqual, isMove, isDrop } from "../util";

export default class GUI {
    private board: Board;
    private handMap: Map<Color, Hand>;
    private orientation: Color;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private pieceImageMap: Map<Piecetype, HTMLImageElement>;
    private sqSize: number;
    private boardRect: Rect;
    private playerHandRectMap: Map<Piecetype, Rect>;
    private opponentHandRectMap: Map<Piecetype, Rect>;
    private selectedPieceSq: Square|undefined;
    private draggingPiece: Piece|undefined;
    private draggingPiecePos: {x: number, y: number};
    private lastMove: Move|Drop|undefined;

    constructor(board: Board, playerHands: Map<Color, Hand>, canvas: HTMLCanvasElement) {
        this.handMap = playerHands;
        this.board = board;
        this.orientation = 'black';
        this.draggingPiecePos = {x:-1, y:-1};

        this.canvas = canvas;
        let tmpCtx = this.canvas.getContext('2d');
        if (tmpCtx) { 
            this.ctx = tmpCtx;
        } else {
            throw new Error('Failed to obtain drawing context');
        }

        // Load images
        this.pieceImageMap = new Map<Piecetype, HTMLImageElement>();
        this.pieceImageMap.set('pawn', new Image());
        this.pieceImageMap.set('lance', new Image());
        this.pieceImageMap.set('knight', new Image());
        this.pieceImageMap.set('silver', new Image());
        this.pieceImageMap.set('gold', new Image());
        this.pieceImageMap.set('bishop', new Image());
        this.pieceImageMap.set('rook', new Image());
        this.pieceImageMap.set('king', new Image());

        for (let [key, value] of this.pieceImageMap) {
            value.src = '../media/pieces/' + key + '.png';
        }

        // Setup Rects
        this.boardRect = { x: this.canvas.width/4, y: 0, width: this.canvas.width/2, height: this.canvas.width/2 };
        this.sqSize = this.boardRect.width/9;

        // Hand Rects
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandRectMap = tmpHandRects.player;
        this.opponentHandRectMap = tmpHandRects.opponent;
    }

    private initHandRectMaps(): { player: Map<Piecetype, Rect>, opponent: Map<Piecetype, Rect> } {
        let padding = this.boardRect.x + this.boardRect.width;
        let sq = this.sqSize;
        let pHandMap = new Map<Piecetype, Rect>();
        let oHandMap = new Map<Piecetype, Rect>();
        pHandMap.set('pawn', { x:padding + sq*(3/2), y:sq*6, width:sq, height:sq });
        pHandMap.set('lance', { x:padding + sq/2, y:sq*7, width:sq, height:sq });
        pHandMap.set('knight', { x:padding + sq/2, y:sq*8, width:sq, height:sq });
        pHandMap.set('silver', { x:padding + sq*(3/2), y:sq*7, width:sq, height:sq });
        pHandMap.set('gold', { x:padding + sq*(5/2), y:sq*7, width:sq, height:sq });
        pHandMap.set('bishop', { x:padding + sq*(3/2), y:sq*8, width:sq, height:sq });
        pHandMap.set('rook', { x:padding + sq*(5/2), y:sq*8, width:sq, height:sq });
        oHandMap.set('pawn', { x:sq*2, y:sq*2, width:sq, height:sq });
        oHandMap.set('lance', { x:sq*3, y:sq, width:sq, height:sq });
        oHandMap.set('knight', { x:sq*3, y:0, width:sq, height:sq });
        oHandMap.set('silver', { x:sq*2, y:sq, width:sq, height:sq });
        oHandMap.set('gold', { x:sq, y:sq, width:sq, height:sq });
        oHandMap.set('bishop', { x:sq*2, y:0, width:sq, height:sq });
        oHandMap.set('rook', { x:sq, y:0, width:sq, height:sq });

        return { player: pHandMap, opponent: oHandMap };
    }

    public flipBoard(): void {
        this.orientation = this.orientation === 'black' ? 'white' : 'black';
    }

    public draw(): void {
        this.ctx.fillStyle = 'slategrey';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.highlightLastMove();
        if (this.selectedPieceSq) {
            this.highlightSquare('mintcream', this.selectedPieceSq);
        }

        this.drawBoard();
        this.drawFileRankLabels();

        for (let f = 0; f < 9; f++) {
            for (let r = 0; r < 9; r++) {
                this.drawPiece( {file:f, rank:r} );
            }
        }

        this.drawHand('black'); 
        this.drawHand('white');

        if (this.draggingPiece) {
            this.drawDraggingPiece();
        }
    }

    private drawBoard(): void {
        this.ctx.strokeStyle = 'silver';
        this.ctx.lineWidth = 2;

        for (let f = 0; f <= 9; f++) {
            let i = f*this.sqSize + this.boardRect.x;

            this.ctx.beginPath();
            this.ctx.moveTo(i, this.boardRect.y);
            this.ctx.lineTo(i, this.boardRect.y + this.boardRect.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        for (let r = 0; r <= 9; r++) {
            let i = r*this.sqSize + this.boardRect.y;

            this.ctx.beginPath();
            this.ctx.moveTo(this.boardRect.x, i);
            this.ctx.lineTo(this.boardRect.x + this.boardRect.width, i);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    private drawFileRankLabels(): void {
        let interval = this.sqSize;
        this.ctx.font = '15px arial'
        this.ctx.fillStyle = 'white';

        for (let i = 0; i < 9; i++) {
            let label = i;
            if (this.orientation === 'white') {
                label = 8 - i;
            }
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText( (label+1).toString(), this.boardRect.x - 13, this.sqSize/2+(i*interval) );
            this.ctx.textBaseline = 'top';
            this.ctx.fillText( (10 - (label+1)).toString(), this.boardRect.x + this.sqSize/2+(i*interval), this.boardRect.height + 4 );
        }
    }

    private drawPiece(sq: Square): boolean {
        let piece: Piece|undefined = this.board.getPiece(sq);
        if (piece) {
            let pieceImg: HTMLImageElement|undefined = this.pieceImageMap.get(piece.type);
            if (!pieceImg) {
                throw new Error("Failed to load piece image: " + piece.type);
            }
            let pos = this.getPosAtSquare(sq.file, sq.rank);
            if (this.selectedPieceSq && this.draggingPiece) {
                if (squaresEqual(this.selectedPieceSq, sq)) {
                    return false;
                }
            }
            if (piece.color === this.orientation) {
                this.ctx.drawImage(pieceImg, pos.x, pos.y, this.sqSize, this.sqSize);
            } else {
                this.drawInverted(pieceImg, pos.x, pos.y, this.sqSize, this.sqSize);
            }
        }
        return true;
    }

    private drawDraggingPiece() {
        if (this.draggingPiece) {
            let pieceImg: HTMLImageElement|undefined = this.pieceImageMap.get(this.draggingPiece.type);
            if (!pieceImg) {
                throw new Error("Failed to load piece image: " + this.draggingPiece.type);
            }
            let x = this.draggingPiecePos.x - this.sqSize/2;
            let y = this.draggingPiecePos.y - this.sqSize/2;
            if (this.draggingPiece.color === this.orientation) {
                this.ctx.drawImage(pieceImg, x, y, this.sqSize, this.sqSize);
            } else {
                this.drawInverted(pieceImg, x, y, this.sqSize, this.sqSize);
            }
        }
    }

    private drawHand(color: Color) {
        let hand = this.handMap.get(color);
            if (!hand) return;
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = 'white';
        if (color === this.orientation) {
            for (let [key, value] of this.playerHandRectMap) {
                let numOfPieces = hand.getNumOfPieces(key);
                    if (numOfPieces === undefined) return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg: HTMLImageElement|undefined = this.pieceImageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.ctx.drawImage(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        } else {
            for (let [key, value] of this.opponentHandRectMap) {
                let numOfPieces = hand.getNumOfPieces(key);
                    if (numOfPieces === undefined) return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg: HTMLImageElement|undefined = this.pieceImageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.drawInverted(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        }

        this.ctx.globalAlpha = 1;
    }

    private highlightHandPiece(style: string, piece: Piece) {
        this.ctx.fillStyle = style;
        let pieceRect: Rect|undefined;
        if (piece.color === this.orientation) {
            pieceRect = this.playerHandRectMap.get(piece.type);
        } else {
            pieceRect = this.opponentHandRectMap.get(piece.type);
        }
        if (pieceRect) {
            this.ctx.fillRect(pieceRect.x, pieceRect.y, pieceRect.width, pieceRect.height);
        }
    }

    private highlightLastMove() {
        if (this.lastMove) {
            let style = '#9aa6b1';
            if ( isMove(this.lastMove) ) {
                this.highlightSquare(style, this.lastMove.src);
            } else if ( isDrop(this.lastMove) ){
                this.highlightHandPiece(style, this.lastMove.piece);
            }
            this.highlightSquare(style, this.lastMove.dest);
        }
    }

    public highlightSquare(style: string, sq: Square) {
        let file = sq.file;
        let rank = sq.rank;
        if (this.orientation === 'white') {
            file = 8 - file;
            rank = 8 - rank;
        }
        this.ctx.fillStyle = style;
        this.ctx.fillRect(this.boardRect.x + file*this.sqSize, 
            rank*this.sqSize,
            this.sqSize,
            this.sqSize);
    }

    private drawInverted(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
        this.ctx.save();

        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(Math.PI);
        this.ctx.translate( -(x + width/2), -(y + height/2) );
        this.ctx.drawImage(image, x, y, width, height);

        this.ctx.restore();
    }

    public getSquareAtPos(x: number, y: number): Square|undefined {
        let file = Math.floor( (x - this.boardRect.x)/this.sqSize );
        let rank = Math.floor(y/this.sqSize);
        if (this.orientation === 'white') {
            file = 8 - file;
            rank = 8 - rank;
        }
        if (file < 0 || rank < 0 || file > this.board.getDimensions().files || rank > this.board.getDimensions().ranks) {
            return undefined;
        }
        return { file, rank };
    }

    public getPosAtSquare(file: number, rank: number): {x: number, y: number} {
        if (this.orientation === 'white') {
            file = 8 - file;
            rank = 8 - rank;
        }
        let x = this.boardRect.x + (file * this.sqSize);
        let y = rank * this.sqSize;
        return { x, y };
    }

    public getSelectedPiece(): Piece|undefined {
        if (this.selectedPieceSq) {
            return this.board.getPiece(this.selectedPieceSq);
        }
        return undefined;
    }

    public setSelectedPieceSq(sq: Square): void {
        this.selectedPieceSq = sq;
    }

    public resetSelectedPieceSq() {
        this.selectedPieceSq = undefined;
    }

    public setDraggingPiece(piece: Piece, x?: number, y?: number) {
        this.draggingPiece = piece;
        if (x && y) {
            this.draggingPiecePos = {x: x, y: y};
        }
    }

    public resetDraggingPiece() {
        this.draggingPiece = undefined;
    }

    public setDraggingPiecePos(x: number, y: number) {
        this.draggingPiecePos = {x: x, y: y};
    }

    public setLastMove(arg: Move|Drop) {
        this.lastMove = arg;
    }

    public getDraggingPiece() {
        return this.draggingPiece;
    }
    
    public getBoardRect() {
        return this.boardRect;
    }

    public getPlayerHandRectMap() {
        return this.playerHandRectMap;
    }

    public getOpponentHandRectMap() {
        return this.opponentHandRectMap;
    }

    public getSelectedPieceSq() {
        return this.selectedPieceSq;
    }

    public getOrientation() {
        return this.orientation;
    }
}