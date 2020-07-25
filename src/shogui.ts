import GUI from "./gui";
import Board from "./board";
import Hand from "./hand";
import { Config, Piece, Square, allSquares, Color, SquareArrow, HandArrow, Highlight } from "./types";
import { isPosInsideRect, isSquareArrow, isHandArrow, arrowsEqual, sfen2Piecetype } from "./util";

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
    private highlightList: Highlight[];
    private draggingPiece: DraggingPiece|undefined;

    constructor(config: Config) {
        let self = this;
        this.config = config;

        this.board = new Board();
        this.handMap = new Map<Color, Hand>();
        this.handMap.set('black', new Hand());
        this.handMap.set('white', new Hand());

        this.canvas = document.createElement('canvas');
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width/2 + 20;
        this.gui = new GUI(this.board, this.handMap, this.canvas);

        this.arrowList = [];
        this.highlightList = [];

        this.canvas.addEventListener('mousedown', function(e) {
            self.onMouseDown(e);
            window.requestAnimationFrame( () => self.refreshCanvas() );
        });

        window.addEventListener('mouseup', function(e) {
            self.onMouseUp(e);
            window.requestAnimationFrame( () => self.refreshCanvas() );
        });

        window.addEventListener('mousemove', function(e) {
            self.onMouseMove(e);
            window.requestAnimationFrame( () => self.refreshCanvas() );
        })

        window.addEventListener('keydown', function(e) {
            self.gui.flipBoard();
            window.requestAnimationFrame( () => self.refreshCanvas() );
        })

        this.canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        document.body.appendChild(this.canvas);

        window.onload = function () {
            window.requestAnimationFrame( () => self.refreshCanvas() );
        }
    }

    public setPosition(sfen: string) {
        //TODO: Check for valid sfen

        let sfenArr = sfen.split(' ');
        let sfenBoard = sfenArr[0];
        let sfenHand = sfenArr[2];

        this.board.setPosition(sfenBoard);

        if (!sfenHand) {
            return;
        }

        let amt = 1;
        for (let char of sfenHand) {
            let ptype = sfen2Piecetype(char);
            if ( !isNaN(Number(char)) ) {
                amt = Number(char);
                continue;
            } else {
                if (!ptype) {
                    throw new Error('ERROR: Cannot get piecetype from sfen character ' + char);
                }

                if (char.toUpperCase() === char) {
                    this.handMap.get('black')?.addPiece(ptype, amt);
                } else if (char.toLowerCase() === char) {
                    this.handMap.get('white')?.addPiece(ptype, amt);
                }

                amt = 1;
            }
        }
    }
    

    public flipBoard() {
        this.gui.flipBoard();
    }

    private isSquareHighlighted(sq: Square): boolean {
        for (let tmphighlight of this.highlightList) {
            if ( tmphighlight.sq === sq) {
                return true;
            }
        }
        return false;
    }

    public addHighlight(highlight: Highlight): boolean {
        if (!this.isSquareHighlighted(highlight.sq)) {
            this.highlightList.push(highlight);
            return true;
        }
        return false;
    }

    public removeHighlight(highlight: Highlight): boolean {
        let i = 0;
        for (let tmphighlight of this.highlightList) {
            if ( tmphighlight.sq === highlight.sq) {
                this.highlightList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }

    public clearHighlights() {
        this.highlightList = [];
    }

    public addArrow(arrow: SquareArrow|HandArrow): boolean {
        if (arrow.toSq === undefined) return false;
        this.arrowList.push(arrow);
        return true;
    }

    public removeArrow(arrow: SquareArrow|HandArrow): boolean {
        let i = 0;
        for (let cmpArrow of this.arrowList) {
            if ( arrowsEqual(cmpArrow, arrow) ) {
                this.arrowList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
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

    private refreshCanvas() {
        this.gui.clearCanvas();

        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight);
        }

        if (this.activeSquare) {
            this.gui.highlightSquare( {style: 'mintcream', type: 'fill', sq:this.activeSquare} );
        }

        this.gui.drawBoard();
        this.gui.drawFileRankLabels();

        for (let i of allSquares) {
            if (this.activeSquare && this.draggingPiece) { // Don't draw the currently dragging piece on its square
                if (this.activeSquare === i) {
                    continue;
                }
            }
            this.gui.drawPieceAtSquare(i);
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
            this.gui.drawSquareArrow(arrow);
        } else if ( isHandArrow(arrow) ) {
            this.gui.drawHandArrow(arrow);
        }
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button === 2) {
            this.onRightClick(event);
            return;
        }

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
            
            if (piece && (!this.activeSquare || this.activeSquare === clickedSq)) {
                this.activeSquare = clickedSq;
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            } else {
                if (this.activeSquare) {
                    if (this.activeSquare !== clickedSq) {
                        this.movePiece(this.activeSquare, clickedSq);
                        this.activeSquare = undefined;
                    }
                }
            }
        } else {
            this.draggingPiece = undefined;
            this.activeSquare = undefined;
        }

        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let hand = this.handMap.get(this.gui.getOrientation());
                if (!hand?.getNumOfPieces(key)) {
                    return;
                }
                let piece = {type: key, color: this.gui.getOrientation()};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }

        for (let [key, value] of this.gui.getOpponentHandBounds()) {
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
                if (this.activeSquare === sqOver) {
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
                if ( !this.removeArrow(this.currentArrow) ) {
                    this.addArrow(this.currentArrow);
                }
            }
            this.currentArrow = undefined;
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

        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                this.currentArrow = { style: 'black', piecetype: key, color: this.gui.getOrientation() };
            }
        }

        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                this.currentArrow = { style: 'black', piecetype: key, color: opponentColor };
            }
        }

        this.draggingPiece = undefined;
        this.activeSquare = undefined;
    }
}