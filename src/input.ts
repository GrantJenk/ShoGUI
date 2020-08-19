import { ShoGUI } from "./shogui";
import Board from "./board";
import GUI from "./gui";
import { Arrow, Square, Piece, Color } from "./types";
import { isPosInsideRect, arrowsEqual } from "./util";

interface DraggingPiece {
    piece: Piece,
    x: number,
    y: number
}

export default class Input {
    private board: Board;
    private gui: GUI;
    
    private currentArrow: Arrow|undefined;
    private arrows: Arrow[];
    private activeSquare: Square|undefined;
    private draggingPiece: DraggingPiece|undefined;

    constructor(private shogui: ShoGUI) {
        let self = this;

        this.board = shogui.getBoard();
        this.gui = shogui.getGui();

        this.arrows = [];

        this.gui.getCanvas().addEventListener('mousedown', function(e) {
            self.onMouseDown(e);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        });

        window.addEventListener('mouseup', function(e) {
            self.onMouseUp(e);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        });

        window.addEventListener('mousemove', function(e) {
            self.onMouseMove(e);
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        })

        window.addEventListener('keydown', function(e) {
            self.gui.flipBoard();
            window.requestAnimationFrame( () => shogui.refreshCanvas() );
        })

        this.gui.getCanvas().addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        window.addEventListener('load', () => window.requestAnimationFrame( () => shogui.refreshCanvas() ) );
    }

    public getActiveSquare() {
        return this.activeSquare;
    }

    public getDraggingPiece() {
        return this.draggingPiece;
    }

    public getCurrentArrow() {
        return this.currentArrow;
    }

    public getUserArrows() {
        return this.arrows;
    }

    private addArrow(arrow: Arrow) {
        this.arrows.push(arrow);
    }

    private removeArrow(arrow: Arrow) {
        let i = 0;
        for (let cmpArrow of this.arrows) {
            if ( arrowsEqual(cmpArrow, arrow) ) {
                this.arrows.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }

    private clearArrows() {
        this.arrows = [];
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

        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let clickedSq: Square|undefined = this.gui.pos2Square(mouseX, mouseY);
                if (!clickedSq) return;
            let piece = this.board.getPiece(clickedSq);
            
            if (piece && (!this.activeSquare || this.activeSquare === clickedSq)) {
                this.activeSquare = clickedSq;
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            } else {
                if (this.activeSquare) {
                    if (this.activeSquare !== clickedSq) {
                        this.shogui.movePiece(this.activeSquare, clickedSq);
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
                let numPieces = this.board.getNumPiecesInHand(this.gui.getOrientation(), key);
                if (!numPieces || numPieces <= 0) {
                    return;
                }
                let piece = {type: key, color: this.gui.getOrientation()};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }

        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let numPieces = this.board.getNumPiecesInHand(opponentColor, key);
                if (!numPieces || numPieces <= 0) {
                    return;
                }
                let piece = {type: key, color: opponentColor};
                this.draggingPiece = {piece: piece, x: mouseX, y: mouseY};
            }
        }
    }

    private onMouseUp(event: MouseEvent) {
        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let sqOver = this.gui.pos2Square(mouseX, mouseY);
                if (!sqOver) return;
            if (this.draggingPiece && this.activeSquare) {
                if (this.activeSquare === sqOver) {
                    this.draggingPiece = undefined;
                } else {
                    this.shogui.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            } else if (this.draggingPiece && !this.activeSquare) {
                this.shogui.dropPiece(this.draggingPiece.piece.color, this.draggingPiece.piece.type, sqOver);
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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