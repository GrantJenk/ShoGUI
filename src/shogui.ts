import GUI from "./gui";
import Board from "./board";
import Hand from "./hand";
import { Config, Piece, Square, Color, SquareArrow, HandArrow } from "./types";
import { isPosInsideRect, squaresEqual, isSquareArrow, isHandArrow } from "./util";

interface DraggingPiece {
    piece: Piece,
    x: number,
    y: number
}

export default class ShoGUI {
    private config: Config;
    private board: Board;
    private handMap: Map<Color, Hand>;
    private canvas: HTMLCanvasElement;
    private gui: GUI;
    private currentArrow: SquareArrow|HandArrow|undefined;
    private arrowList: (SquareArrow|HandArrow)[];
    private activeSquare: Square|undefined;
    private draggingPiece: DraggingPiece|undefined;

    constructor(config: Config) {
        let self = this;
        this.config = config;

        this.board = new Board();
        this.handMap = new Map<Color, Hand>();
        this.handMap.set('black', new Hand());
        this.handMap.set('white', new Hand());
        this.board.setStartingPosition();

        this.canvas = document.createElement('canvas');
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width/2 + 20;
        this.gui = new GUI(this.board, this.handMap, this.canvas);

        this.arrowList = [];

        this.canvas.addEventListener('mousedown', function(e) {
            self.onMouseDown(e);
            window.requestAnimationFrame( () => self.drawGame() );
        });

        window.addEventListener('mouseup', function(e) {
            self.onMouseUp(e);
            window.requestAnimationFrame( () => self.drawGame() );
        });

        window.addEventListener('mousemove', function(e) {
            self.onMouseMove(e);
            window.requestAnimationFrame( () => self.drawGame() );
        })

        window.addEventListener('keydown', function(e) {
            self.gui.flipBoard();
            //console.log(self.arrowList);
            window.requestAnimationFrame( () => self.drawGame() );
        })

        this.canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            self.onRightClick(e);
            window.requestAnimationFrame( () => self.drawGame() );
        });

        document.body.appendChild(this.canvas);

        window.onload = function () {
            window.requestAnimationFrame( () => self.drawGame() );
        }
    }

    public flipBoard() {
        this.gui.flipBoard();
    }

    public addArrow(arrow: SquareArrow|HandArrow): boolean {
        if (arrow.toSq === undefined) return false;
        this.arrowList.push(arrow);
        return true;
    }

    public clearArrows() {
        this.arrowList = [];
    }

    private movePiece(srcSq: Square, destSq: Square) {
        let success = true;

        if (typeof this.config.onMovePiece === "function") {
            success = this.config.onMovePiece(srcSq, destSq);
        }

        if (success) {
            this.board.movePiece(srcSq, destSq);
        }
    }

    private dropPiece(piece: Piece, sq: Square) {
        let hand = this.handMap.get(piece.color);
            if (!hand) return;
        this.board.addPiece(piece, sq);
        hand.removePiece(piece.type);
    }

    private drawGame() {
        this.gui.clearCanvas();

        if (this.activeSquare) {
            this.gui.highlightSquare('mintcream', this.activeSquare);
        }

        this.gui.drawBoard();
        this.gui.drawFileRankLabels();

        for (let f = 0; f < 9; f++) {
            for (let r = 0; r < 9; r++) {
                if (this.activeSquare && this.draggingPiece) { // Don't draw the currently dragging piece on its square
                    if ( squaresEqual(this.activeSquare, {col: f, row: r}) ) {
                        continue;
                    }
                }
                this.gui.drawPieceAtSquare( {col:f, row:r} );
            }
        }

        this.gui.drawHand('black'); 
        this.gui.drawHand('white');

        if (this.draggingPiece) {
            this.gui.drawPiece(this.draggingPiece.piece, this.draggingPiece.x - this.gui.getSqSize()/2, this.draggingPiece.y - this.gui.getSqSize()/2);
        }

        if (this.currentArrow) {
           this.drawArrow(this.currentArrow);
        }

        for (let arrow of this.arrowList) {
           this.drawArrow(arrow);
        }

        this.gui.drawArrowCanvas(0.6);
    }

    private drawArrow(arrow: SquareArrow|HandArrow) {
        if ( isSquareArrow(arrow) ) {
            /*if ( squaresEqual(arrow.fromSq, arrow.toSq) ) {
                
            } else {*/
                this.gui.drawSquareArrow(arrow);
            //}
        } else if ( isHandArrow(arrow) ) {
            if ( !arrow.toSq ) {
                // Don't draw arrow, just draw highlight or something...
            } else {
                this.gui.drawHandArrow(arrow);
            }
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button !== 0) {
            return;
        }

        this.clearArrows();

        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let clickedSq: Square|undefined = this.gui.pos2Square(mouseX, mouseY);
                if (!clickedSq) return;
            let piece = this.board.getPiece(clickedSq);
            
            if (piece && (!this.activeSquare || squaresEqual(this.activeSquare, clickedSq))) {
                this.activeSquare = clickedSq;
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            } else {
                if (this.activeSquare) {
                    if (!squaresEqual(this.activeSquare, clickedSq)) {
                        this.movePiece(this.activeSquare, clickedSq);
                        this.activeSquare = undefined;
                    }
                }
            }
        } else {
            this.draggingPiece = undefined;
            this.activeSquare = undefined;
        }

        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let hand = this.handMap.get(this.gui.getOrientation());
                if (!hand?.getNumOfPieces(key)) {
                    return;
                }
                let piece = {type: key, color: this.gui.getOrientation()};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }

        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let hand = this.handMap.get(opponentColor);
                if (!hand?.getNumOfPieces(key)) {
                    return;
                }
                let piece = {type: key, color: opponentColor};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }
    }

    private onMouseUp(event: MouseEvent) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let sqOver = this.gui.pos2Square(mouseX, mouseY);
                if (!sqOver) return;
            if (this.draggingPiece && this.activeSquare) {
                if (squaresEqual(this.activeSquare, sqOver)) {
                    this.draggingPiece = undefined;
                } else {
                    this.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            } else if (this.draggingPiece && !this.activeSquare) {
                this.dropPiece(this.draggingPiece.piece, sqOver);
            }
        } else {
            this.activeSquare = undefined;
        }
        this.draggingPiece = undefined;

        if (event.button === 2) { // Right mouse button
            if (this.currentArrow) {
                this.addArrow(this.currentArrow);
                this.currentArrow = undefined;
            }
        }
    }

    private onMouseMove(event: MouseEvent) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let hoverSq = this.gui.pos2Square(mouseX, mouseY);

        if ( this.draggingPiece) {
            this.draggingPiece.x = mouseX;
            this.draggingPiece.y = mouseY;
        }

        if (this.currentArrow) {
            if (hoverSq) {
                this.currentArrow.toSq = hoverSq;
            } else {
                this.currentArrow.toSq = undefined;
            }
        }
    }

    private onRightClick(event: MouseEvent) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let clickedSq = this.gui.pos2Square(mouseX, mouseY);

        if (clickedSq && !this.draggingPiece) {
            this.currentArrow = { style: 'blue', fromSq: clickedSq, toSq: clickedSq };
        }

        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                this.currentArrow = { style: 'black', piecetype: key, color: this.gui.getOrientation() };
            }
        }

        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                this.currentArrow = { style: 'black', piecetype: key, color: opponentColor };
            }
        }

        this.draggingPiece = undefined;
        this.activeSquare = undefined;
    }
}