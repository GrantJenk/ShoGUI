import GUI from "./gui";
import Board from "./board";
import Hand from "./hand";
import { Config, Piece, Square, Color } from "./types";
import { isPosInsideRect, squaresEqual } from "./util";

export default class ShoGUI {
    private config: Config;
    private board: Board;
    private handMap: Map<Color, Hand>;
    private canvas: HTMLCanvasElement;
    private gui: GUI;

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

    private drawGame() {
        this.gui.draw();
        //this.gui.highlightSquare("green", {file: 5, rank:5});
    }

    public addArrow(fromSq: Square, toSq: Square) {

    }

    private movePiece(srcSq: Square, destSq: Square) {
        let success = true;

        if (typeof this.config.onMovePiece === "function") {
            success = this.config.onMovePiece(srcSq, destSq);
        }

        if (success) {
            this.board.movePiece(srcSq, destSq);
            this.gui.setLastMove( {src: srcSq, dest: destSq} );
        }
    }

    private dropPiece(piece: Piece, sq: Square) {
        let hand = this.handMap.get(piece.color);
            if (!hand) return;
        this.board.addPiece(piece, sq);
        hand.removePiece(piece.type);
    }

    private selectPiece(sq: Square) {
        if (typeof this.config.onSelectPiece === "function") {
            let piece = this.board.getPiece(sq);
            if (piece) {
                this.config.onSelectPiece(piece, sq);
            }
        }

        this.gui.setSelectedPieceSq(sq);
    }

    private deselectPiece() {
        let selectedPieceSq = this.gui.getSelectedPieceSq();
        if (!selectedPieceSq) {
            return;
        }
        if (typeof this.config.onDeselectPiece === "function") {
            //this.config.onDeselectPiece(piece, square);
        }

        this.gui.resetSelectedPieceSq();
    }

    private startDraggingPiece(piece: Piece, mouseX: number, mouseY: number) {
        this.gui.setDraggingPiece(piece, mouseX, mouseY);
    }

    private onMouseDown(event: MouseEvent) {
        if (event.button !== 0) {
            return;
        }

        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        if (isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let clickedSq: Square|undefined = this.gui.pos2Square(mouseX, mouseY);
                if (!clickedSq) return;
            let piece = this.board.getPiece(clickedSq);
            let selectedSq = this.gui.getSelectedPieceSq();
            
            if (piece && (!selectedSq || squaresEqual(selectedSq, clickedSq))) {
                this.selectPiece(clickedSq);
                this.startDraggingPiece(piece, mouseX, mouseY);
            } else {
                if (selectedSq) {
                    if (!squaresEqual(selectedSq, clickedSq)) {
                        this.movePiece(selectedSq, clickedSq);
                        this.deselectPiece();
                    }
                }
            }
        } else {
            this.gui.resetDraggingPiece();
            this.deselectPiece();
        }

        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let hand = this.handMap.get(this.gui.getOrientation());
                if (!hand?.getNumOfPieces(key)) {
                    return;
                }
                this.startDraggingPiece({type: key, color: this.gui.getOrientation()}, mouseX, mouseY);
            }
        }

        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor: Color = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let hand = this.handMap.get(opponentColor);
                if (!hand?.getNumOfPieces(key)) {
                    return;
                }
                this.startDraggingPiece({type: key, color: opponentColor}, mouseX, mouseY);
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
            let selectedSq = this.gui.getSelectedPieceSq();
            let dragPiece = this.gui.getDraggingPiece();
            if (dragPiece && selectedSq) {
                if (squaresEqual(selectedSq, sqOver)) {
                    this.gui.resetDraggingPiece();
                } else {
                    this.movePiece(selectedSq, sqOver);
                    this.deselectPiece();
                }
            } else if (dragPiece && !selectedSq) {
                this.dropPiece(dragPiece, sqOver);
            }
        } else {
            this.deselectPiece();
        }
        this.gui.resetDraggingPiece();
    }

    private onMouseMove(event: MouseEvent) {
        if ( this.gui.getDraggingPiece() ) {
            let rect = this.canvas.getBoundingClientRect();
            let mouseX = event.clientX - rect.left;
            let mouseY = event.clientY - rect.top;

            this.gui.setDraggingPiecePos(mouseX, mouseY);
        }
    }

    private onRightClick(event: MouseEvent) {
        this.gui.resetDraggingPiece();
        this.deselectPiece();
    }
}