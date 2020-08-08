import { Color, Piece, Piecetype, Rect, Square, allSquares, SquareArrow, HandArrow, Highlight } from "./types";
import Board from "./board";

export default class GUI {
    private board: Board;
    private orientation: Color;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private arrowCanvas: HTMLCanvasElement;
    private arrowCtx: CanvasRenderingContext2D;
    private imageMap: Map<string, HTMLImageElement>;
    private sqSize: number;
    private boardBounds: Rect;
    private playerHandBounds: Map<Piecetype, Rect>;
    private opponentHandBounds: Map<Piecetype, Rect>;

    constructor(board: Board, canvas: HTMLCanvasElement) {
        this.board = board;
        this.orientation = 'black';

        this.canvas = canvas;
        let tmpCtx = this.canvas.getContext('2d');
        if (tmpCtx) {
            this.ctx = tmpCtx;
        } else {
            throw new Error('Failed to obtain drawing context');
        }
        this.arrowCanvas = document.createElement('canvas');
        this.arrowCanvas.height = this.canvas.height;
        this.arrowCanvas.width = this.canvas.width;
        let tmpaCtx = this.arrowCanvas.getContext('2d');
        if (tmpaCtx) { 
            this.arrowCtx = tmpaCtx;
            this.arrowCtx.lineCap = 'round';
        } else {
            throw new Error('Failed to obtain arrow drawing context');
        }

        // Load images
        this.imageMap = new Map<string, HTMLImageElement>();
        this.imageMap.set('pawn', new Image());
        this.imageMap.set('+pawn', new Image());
        this.imageMap.set('lance', new Image());
        this.imageMap.set('+lance', new Image());
        this.imageMap.set('knight', new Image());
        this.imageMap.set('+knight', new Image());
        this.imageMap.set('silver', new Image());
        this.imageMap.set('+silver', new Image());
        this.imageMap.set('gold', new Image());
        this.imageMap.set('bishop', new Image());
        this.imageMap.set('+bishop', new Image());
        this.imageMap.set('rook', new Image());
        this.imageMap.set('+rook', new Image());
        this.imageMap.set('king', new Image());

        for (let [key, value] of this.imageMap) {
            value.src = '../media/pieces/' + key + '.png';
        }

        // Setup Rects
        this.boardBounds = { x: this.canvas.width/4, y: 15, width: this.canvas.width/2, height: this.canvas.width/2 };
        this.sqSize = this.boardBounds.width/9;

        // Hand Rects
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandBounds = tmpHandRects.player;
        this.opponentHandBounds = tmpHandRects.opponent;
    }

    private initHandRectMaps(): { player: Map<Piecetype, Rect>, opponent: Map<Piecetype, Rect> } {
        let padding = this.boardBounds.x + this.boardBounds.width;
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

    public clearCanvas() {
        this.ctx.fillStyle = 'slategrey';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.arrowCtx.clearRect(0, 0, this.arrowCanvas.width, this.arrowCanvas.height);
    }

    public drawBoard(): void {
        this.ctx.strokeStyle = 'silver';
        this.ctx.lineWidth = 1;

        for (let f = 0; f <= 9; f++) {
            let i = f*this.sqSize + this.boardBounds.x;

            this.ctx.beginPath();
            this.ctx.moveTo(i, this.boardBounds.y);
            this.ctx.lineTo(i, this.boardBounds.y + this.boardBounds.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        for (let r = 0; r <= 9; r++) {
            let i = r*this.sqSize + this.boardBounds.y;

            this.ctx.beginPath();
            this.ctx.moveTo(this.boardBounds.x, i);
            this.ctx.lineTo(this.boardBounds.x + this.boardBounds.width, i);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }

    public drawFileRankLabels(): void {
        let interval = this.sqSize;
        this.ctx.font = '15px arial'
        this.ctx.fillStyle = 'white';

        for (let i = 0; i < 9; i++) {
            let label = i;
            if (this.orientation === 'white') {
                label = 8 - i;
            }
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText( String.fromCharCode(label+1+96), this.boardBounds.x + this.boardBounds.width + 3, this.boardBounds.y + this.sqSize/2+(i*interval) );
            this.ctx.textBaseline = 'top';
            this.ctx.fillText( (10 - (label+1)).toString(), this.boardBounds.x + (this.sqSize/2)+(i*interval), 0);
        }
    }

    public drawPiece(piece: Piece, x: number, y: number) {
        let key: string = piece.type;
        if (piece.promoted) {
            key = '+' + key;
        }
        let pieceImg: HTMLImageElement|undefined = this.imageMap.get(key);
        if (!pieceImg) {
            throw new Error("Failed to load piece image: " + key);
        }
        if (piece.color === this.orientation) {
            this.ctx.drawImage(pieceImg, x, y, this.sqSize, this.sqSize);
        } else {
            this.drawInverted(pieceImg, x, y, this.sqSize, this.sqSize);
        }
    }

    public drawPieceAtSquare(sq: Square): boolean {
        let piece: Piece|undefined = this.board.getPiece(sq);
        if (piece) {
            let pos = this.square2Pos(sq);
            this.drawPiece(piece, pos.x, pos.y);
            return true;
        }
        return false;
    }

    public drawHand(color: Color) {
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = 'white';
        if (color === this.orientation) {
            for (let [key, value] of this.playerHandBounds) {
                let numOfPieces = this.board.getNumPiecesInHand(color, key);
                    if (numOfPieces === undefined) return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg: HTMLImageElement|undefined = this.imageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.ctx.drawImage(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        } else {
            for (let [key, value] of this.opponentHandBounds) {
                let numOfPieces = this.board.getNumPiecesInHand(color, key);
                    if (numOfPieces === undefined) return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg: HTMLImageElement|undefined = this.imageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.drawInverted(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        }

        this.ctx.globalAlpha = 1;
    }

    public highlightSquare(style: string, type: string, sq: Square, alpha?: number): boolean {
        if (type === 'hidden') return false;
        let pos = this.square2Pos(sq);

        this.ctx.save();
        this.ctx.fillStyle = style;
        this.ctx.strokeStyle = style;
        if (alpha) {
            this.ctx.globalAlpha = alpha;
        }
        switch(type) {
            case 'fill':
                this.ctx.fillRect(pos.x, pos.y, this.sqSize, this.sqSize);
                break;

            case 'outline':
                this.ctx.lineWidth = this.canvas.width/200;
                this.ctx.strokeRect(pos.x + 4, pos.y + 4, this.sqSize - 8, this.sqSize - 8);
                break;

            case 'circle':
                this.ctx.lineWidth = this.canvas.width/500;
                this.ctx.beginPath();
                this.ctx.arc(pos.centerX, pos.centerY, this.sqSize/2 - 4, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
/*
            case 'dot':
                this.ctx.beginPath();
                this.ctx.arc(pos.centerX, pos.centerY, this.sqSize/8, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
*/
            default:
                return false;
        }
        this.ctx.restore();
        return true;
    }

    public drawArrow(style: string, fromx: number, fromy: number, tox: number, toy: number) {
        this.arrowCtx.save();
        let angle = Math.atan2(toy - fromy, tox - fromx);
        let radius = this.arrowCanvas.width/40;
        let x = tox - radius * Math.cos(angle);
        let y = toy - radius * Math.sin(angle);
 
        this.arrowCtx.lineWidth = 2*radius/5;
        this.arrowCtx.fillStyle = style;
        this.arrowCtx.strokeStyle = style;
 
        // Draw line
        this.arrowCtx.beginPath();
        this.arrowCtx.moveTo(fromx, fromy);
        this.arrowCtx.lineTo(x, y);
        this.arrowCtx.stroke();
        this.arrowCtx.closePath();
 
        // Draw arrow head
        this.arrowCtx.beginPath();
 
        let xcenter = (tox + x)/2;
        let ycenter = (toy + y)/2;
 
        this.arrowCtx.moveTo(tox, toy);
        angle += 2*Math.PI/3;
        x = radius * Math.cos(angle) + xcenter;
        y = radius * Math.sin(angle) + ycenter;
        this.arrowCtx.lineTo(x, y);
        angle += 2*Math.PI/3;
        x = radius * Math.cos(angle) + xcenter;
        y = radius * Math.sin(angle) + ycenter;
        this.arrowCtx.lineTo(x, y);
 
        this.arrowCtx.closePath();
        this.arrowCtx.fill();
        this.arrowCtx.restore();
    }

    public drawSquareArrow(arrow: SquareArrow) {
        let toSqPos = this.square2Pos(arrow.toSq);
        let fromSqPos = this.square2Pos(arrow.fromSq);

        if (arrow.toSq !== arrow.fromSq) {
            this.drawArrow(arrow.style, fromSqPos.centerX, fromSqPos.centerY, toSqPos.centerX, toSqPos.centerY);
        } else {
            this.arrowCtx.strokeStyle = arrow.style;
            this.arrowCtx.lineWidth = this.canvas.width/500;
            this.arrowCtx.beginPath();
            this.arrowCtx.arc(toSqPos.centerX, toSqPos.centerY, this.sqSize/2 - 4, 0, 2 * Math.PI);
            this.arrowCtx.stroke();
        }
    }

    public drawHandArrow(arrow: HandArrow) {
        let rect;
        if (arrow.color === this.orientation) {
            rect = this.playerHandBounds.get(arrow.piecetype);
        } else {

            rect = this.opponentHandBounds.get(arrow.piecetype);
        }
            if (!rect) return false;
            if (!arrow.toSq) return false;
        let toSqPos = this.square2Pos(arrow.toSq);

        this.drawArrow(arrow.style, rect.x+(rect.width/2), rect.y+(rect.height/2), toSqPos.centerX, toSqPos.centerY);
    }

    public drawArrowCanvas(alpha: number) {
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(this.arrowCanvas, 0, 0);
        this.ctx.globalAlpha = 1.0;
    }

    public drawInverted(image: HTMLImageElement, x: number, y: number, width: number, height: number): void {
        this.ctx.save();

        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(Math.PI);
        this.ctx.translate( -(x + width/2), -(y + height/2) );
        this.ctx.drawImage(image, x, y, width, height);

        this.ctx.restore();
    }

    public pos2Square(x: number, y: number): Square|undefined {
        let col = Math.floor( (x - this.boardBounds.x)/this.sqSize );
        let row = Math.floor( (y - this.boardBounds.y)/this.sqSize);
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        if (col < 0 || row < 0 || col > 9 - 1 || row > 9 - 1) {
            return undefined;
        }
        return allSquares[ 9*row + col ];
    }

    public square2Pos(sq: Square) {
        let col = 9 - parseInt(sq[0]);
        let row = sq.charCodeAt(1) - 97;
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        let x = this.boardBounds.x + (col * this.sqSize);
        let y = this.boardBounds.y + row * this.sqSize;
        let centerX = x + (this.sqSize/2);
        let centerY = y + (this.sqSize/2)
        return { x, y, centerX, centerY };
    }

    public getBoardBounds() {
        return this.boardBounds;
    }

    public getSqSize() {
        return this.sqSize;
    }

    public getPlayerHandBounds() {
        return this.playerHandBounds;
    }

    public getOpponentHandBounds() {
        return this.opponentHandBounds;
    }

    public getOrientation() {
        return this.orientation;
    }
}