(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Board {
    constructor(rows = 9, cols = 9) {
        this.rows = rows;
        this.cols = cols;
        this.squares = [];
        for (let f = 0; f < cols; f++) {
            this.squares[f] = [];
            for (let r = 0; r < rows; r++) {
                this.squares[f][r] = undefined;
            }
        }
    }
    ascii() {
        for (let r = 0; r < this.rows; r++) {
            let s = '';
            for (let f = 0; f < this.cols; f++) {
                let pce = this.squares[f][r];
                if (pce) {
                    s += pce.type;
                }
                else {
                    s += '.';
                }
            }
            console.log(s);
        }
    }
    setStartingPosition() {
        for (let f = 0; f < 9; f++) {
            this.squares[f][6] = { type: 'pawn', color: 'black' };
            this.squares[f][2] = { type: 'pawn', color: 'white' };
        }
        this.squares[0][0] = { type: 'lance', color: 'white' };
        this.squares[8][0] = { type: 'lance', color: 'white' };
        this.squares[0][8] = { type: 'lance', color: 'black' };
        this.squares[8][8] = { type: 'lance', color: 'black' };
        this.squares[1][0] = { type: 'knight', color: 'white' };
        this.squares[7][0] = { type: 'knight', color: 'white' };
        this.squares[1][8] = { type: 'knight', color: 'black' };
        this.squares[7][8] = { type: 'knight', color: 'black' };
        this.squares[2][0] = { type: 'silver', color: 'white' };
        this.squares[6][0] = { type: 'silver', color: 'white' };
        this.squares[2][8] = { type: 'silver', color: 'black' };
        this.squares[6][8] = { type: 'silver', color: 'black' };
        this.squares[3][0] = { type: 'gold', color: 'white' };
        this.squares[5][0] = { type: 'gold', color: 'white' };
        this.squares[3][8] = { type: 'gold', color: 'black' };
        this.squares[5][8] = { type: 'gold', color: 'black' };
        this.squares[7][1] = { type: 'bishop', color: 'white' };
        this.squares[1][7] = { type: 'bishop', color: 'black' };
        this.squares[1][1] = { type: 'rook', color: 'white' };
        this.squares[7][7] = { type: 'rook', color: 'black' };
        this.squares[4][0] = { type: 'king', color: 'white' };
        this.squares[4][8] = { type: 'king', color: 'black' };
    }
    movePiece(fromSq, toSq) {
        if (util_1.squaresEqual(fromSq, toSq))
            return false;
        if (this.squares[fromSq.col][fromSq.row]) {
            this.squares[toSq.col][toSq.row] = this.squares[fromSq.col][fromSq.row];
            this.squares[fromSq.col][fromSq.row] = undefined;
            return true;
        }
        return false;
    }
    getPiece(sq) {
        return this.squares[sq.col][sq.row];
    }
    addPiece(piece, sq) {
        this.squares[sq.col][sq.row] = piece;
    }
    getDimensions() {
        return { cols: this.cols, rows: this.rows };
    }
}
exports.default = Board;

},{"./util":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class GUI {
    constructor(board, playerHands, canvas) {
        this.handMap = playerHands;
        this.board = board;
        this.orientation = 'black';
        this.draggingPiecePos = { x: -1, y: -1 };
        this.canvas = canvas;
        let tmpCtx = this.canvas.getContext('2d');
        if (tmpCtx) {
            this.ctx = tmpCtx;
        }
        else {
            throw new Error('Failed to obtain drawing context');
        }
        this.pieceImageMap = new Map();
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
        this.boardRect = { x: this.canvas.width / 4, y: 15, width: this.canvas.width / 2, height: this.canvas.width / 2 };
        this.sqSize = this.boardRect.width / 9;
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandRectMap = tmpHandRects.player;
        this.opponentHandRectMap = tmpHandRects.opponent;
    }
    initHandRectMaps() {
        let padding = this.boardRect.x + this.boardRect.width;
        let sq = this.sqSize;
        let pHandMap = new Map();
        let oHandMap = new Map();
        pHandMap.set('pawn', { x: padding + sq * (3 / 2), y: sq * 6, width: sq, height: sq });
        pHandMap.set('lance', { x: padding + sq / 2, y: sq * 7, width: sq, height: sq });
        pHandMap.set('knight', { x: padding + sq / 2, y: sq * 8, width: sq, height: sq });
        pHandMap.set('silver', { x: padding + sq * (3 / 2), y: sq * 7, width: sq, height: sq });
        pHandMap.set('gold', { x: padding + sq * (5 / 2), y: sq * 7, width: sq, height: sq });
        pHandMap.set('bishop', { x: padding + sq * (3 / 2), y: sq * 8, width: sq, height: sq });
        pHandMap.set('rook', { x: padding + sq * (5 / 2), y: sq * 8, width: sq, height: sq });
        oHandMap.set('pawn', { x: sq * 2, y: sq * 2, width: sq, height: sq });
        oHandMap.set('lance', { x: sq * 3, y: sq, width: sq, height: sq });
        oHandMap.set('knight', { x: sq * 3, y: 0, width: sq, height: sq });
        oHandMap.set('silver', { x: sq * 2, y: sq, width: sq, height: sq });
        oHandMap.set('gold', { x: sq, y: sq, width: sq, height: sq });
        oHandMap.set('bishop', { x: sq * 2, y: 0, width: sq, height: sq });
        oHandMap.set('rook', { x: sq, y: 0, width: sq, height: sq });
        return { player: pHandMap, opponent: oHandMap };
    }
    flipBoard() {
        this.orientation = this.orientation === 'black' ? 'white' : 'black';
    }
    draw() {
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
                this.drawPiece({ col: f, row: r });
            }
        }
        this.drawHand('black');
        this.drawHand('white');
        if (this.draggingPiece) {
            this.drawDraggingPiece();
        }
    }
    drawBoard() {
        this.ctx.strokeStyle = 'silver';
        this.ctx.lineWidth = 2;
        for (let f = 0; f <= 9; f++) {
            let i = f * this.sqSize + this.boardRect.x;
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.boardRect.y);
            this.ctx.lineTo(i, this.boardRect.y + this.boardRect.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        for (let r = 0; r <= 9; r++) {
            let i = r * this.sqSize + this.boardRect.y;
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardRect.x, i);
            this.ctx.lineTo(this.boardRect.x + this.boardRect.width, i);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    drawFileRankLabels() {
        let interval = this.sqSize;
        this.ctx.font = '15px arial';
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 9; i++) {
            let label = i;
            if (this.orientation === 'white') {
                label = 8 - i;
            }
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(String.fromCharCode(label + 1 + 96), this.boardRect.x + this.boardRect.width + 3, this.boardRect.y + this.sqSize / 2 + (i * interval));
            this.ctx.textBaseline = 'top';
            this.ctx.fillText((10 - (label + 1)).toString(), this.boardRect.x + (this.sqSize / 2) + (i * interval), 0);
        }
    }
    drawPiece(sq) {
        let piece = this.board.getPiece(sq);
        if (piece) {
            let pieceImg = this.pieceImageMap.get(piece.type);
            if (!pieceImg) {
                throw new Error("Failed to load piece image: " + piece.type);
            }
            let pos = this.getPosAtSquare(sq.col, sq.row);
            if (this.selectedPieceSq && this.draggingPiece) {
                if (util_1.squaresEqual(this.selectedPieceSq, sq)) {
                    return false;
                }
            }
            if (piece.color === this.orientation) {
                this.ctx.drawImage(pieceImg, pos.x, pos.y, this.sqSize, this.sqSize);
            }
            else {
                this.drawInverted(pieceImg, pos.x, pos.y, this.sqSize, this.sqSize);
            }
        }
        return true;
    }
    drawDraggingPiece() {
        if (this.draggingPiece) {
            let pieceImg = this.pieceImageMap.get(this.draggingPiece.type);
            if (!pieceImg) {
                throw new Error("Failed to load piece image: " + this.draggingPiece.type);
            }
            let x = this.draggingPiecePos.x - this.sqSize / 2;
            let y = this.draggingPiecePos.y - this.sqSize / 2;
            if (this.draggingPiece.color === this.orientation) {
                this.ctx.drawImage(pieceImg, x, y, this.sqSize, this.sqSize);
            }
            else {
                this.drawInverted(pieceImg, x, y, this.sqSize, this.sqSize);
            }
        }
    }
    drawHand(color) {
        let hand = this.handMap.get(color);
        if (!hand)
            return;
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = 'white';
        if (color === this.orientation) {
            for (let [key, value] of this.playerHandRectMap) {
                let numOfPieces = hand.getNumOfPieces(key);
                if (numOfPieces === undefined)
                    return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg = this.pieceImageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.ctx.drawImage(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        }
        else {
            for (let [key, value] of this.opponentHandRectMap) {
                let numOfPieces = hand.getNumOfPieces(key);
                if (numOfPieces === undefined)
                    return;
                this.ctx.globalAlpha = numOfPieces === 0 ? 0.2 : 1;
                let pieceImg = this.pieceImageMap.get(key);
                if (!pieceImg) {
                    throw new Error("Failed to load piece image: " + key);
                }
                this.drawInverted(pieceImg, value.x, value.y, value.width, value.height);
                this.ctx.fillText(numOfPieces.toString(), value.x, value.y + value.height);
            }
        }
        this.ctx.globalAlpha = 1;
    }
    highlightHandPiece(style, piece) {
        this.ctx.fillStyle = style;
        let pieceRect;
        if (piece.color === this.orientation) {
            pieceRect = this.playerHandRectMap.get(piece.type);
        }
        else {
            pieceRect = this.opponentHandRectMap.get(piece.type);
        }
        if (pieceRect) {
            this.ctx.fillRect(pieceRect.x, pieceRect.y, pieceRect.width, pieceRect.height);
        }
    }
    highlightLastMove() {
        if (this.lastMove) {
            let style = '#9aa6b1';
            if (util_1.isMove(this.lastMove)) {
                this.highlightSquare(style, this.lastMove.src);
            }
            else if (util_1.isDrop(this.lastMove)) {
                this.highlightHandPiece(style, this.lastMove.piece);
            }
            this.highlightSquare(style, this.lastMove.dest);
        }
    }
    highlightSquare(style, sq) {
        let pos = this.getPosAtSquare(sq.col, sq.row);
        this.ctx.fillStyle = style;
        this.ctx.fillRect(pos.x, pos.y, this.sqSize, this.sqSize);
    }
    drawInverted(image, x, y, width, height) {
        this.ctx.save();
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(Math.PI);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
        this.ctx.drawImage(image, x, y, width, height);
        this.ctx.restore();
    }
    getSquareAtPos(x, y) {
        let col = Math.floor((x - this.boardRect.x) / this.sqSize);
        let row = Math.floor(y / this.sqSize);
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        if (col < 0 || row < 0 || col > this.board.getDimensions().cols || row > this.board.getDimensions().rows) {
            return undefined;
        }
        return { col, row };
    }
    getPosAtSquare(col, row) {
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        let x = this.boardRect.x + (col * this.sqSize);
        let y = this.boardRect.y + row * this.sqSize;
        return { x, y };
    }
    getSelectedPiece() {
        if (this.selectedPieceSq) {
            return this.board.getPiece(this.selectedPieceSq);
        }
        return undefined;
    }
    setSelectedPieceSq(sq) {
        this.selectedPieceSq = sq;
    }
    resetSelectedPieceSq() {
        this.selectedPieceSq = undefined;
    }
    setDraggingPiece(piece, x, y) {
        this.draggingPiece = piece;
        if (x && y) {
            this.draggingPiecePos = { x: x, y: y };
        }
    }
    resetDraggingPiece() {
        this.draggingPiece = undefined;
    }
    setDraggingPiecePos(x, y) {
        this.draggingPiecePos = { x: x, y: y };
    }
    setLastMove(arg) {
        this.lastMove = arg;
    }
    getDraggingPiece() {
        return this.draggingPiece;
    }
    getBoardRect() {
        return this.boardRect;
    }
    getPlayerHandRectMap() {
        return this.playerHandRectMap;
    }
    getOpponentHandRectMap() {
        return this.opponentHandRectMap;
    }
    getSelectedPieceSq() {
        return this.selectedPieceSq;
    }
    getOrientation() {
        return this.orientation;
    }
}
exports.default = GUI;

},{"./util":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Hand {
    constructor() {
        this.pieces = new Map();
        this.empty();
    }
    empty() {
        this.pieces.set('pawn', 0);
        this.pieces.set('lance', 0);
        this.pieces.set('knight', 0);
        this.pieces.set('silver', 0);
        this.pieces.set('gold', 0);
        this.pieces.set('bishop', 0);
        this.pieces.set('rook', 0);
    }
    getNumOfPieces(piece) {
        return this.pieces.get(piece);
    }
    addPiece(piece, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (curAmount !== undefined) {
            this.pieces.set(piece, curAmount + num);
            return true;
        }
        return false;
    }
    removePiece(piece, num = 1) {
        let curAmount = this.pieces.get(piece);
        if (!curAmount || curAmount <= 0) {
            return false;
        }
        this.pieces.set(piece, curAmount - num);
        return true;
    }
}
exports.default = Hand;

},{}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shogui_1 = __importDefault(require("./shogui"));
const util_1 = require("./util");
let shogui = new shogui_1.default({ onMovePiece: onPieceMove });
function onPieceMove(srcSq, destSq) {
    console.log(util_1.square2ShogiNotation(srcSq) + "-->" + util_1.square2ShogiNotation(destSq));
    return true;
}

},{"./shogui":5,"./util":6}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gui_1 = __importDefault(require("./gui"));
const board_1 = __importDefault(require("./board"));
const hand_1 = __importDefault(require("./hand"));
const util_1 = require("./util");
class ShoGUI {
    constructor(config) {
        let self = this;
        this.config = config;
        this.board = new board_1.default();
        this.handMap = new Map();
        this.handMap.set('black', new hand_1.default());
        this.handMap.set('white', new hand_1.default());
        this.board.setStartingPosition();
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1200;
        this.canvas.height = this.canvas.width / 2 + 20;
        this.gui = new gui_1.default(this.board, this.handMap, this.canvas);
        this.canvas.addEventListener('mousedown', function (e) {
            self.onMouseDown(e);
            window.requestAnimationFrame(() => self.drawGame());
        });
        window.addEventListener('mouseup', function (e) {
            self.onMouseUp(e);
            window.requestAnimationFrame(() => self.drawGame());
        });
        window.addEventListener('mousemove', function (e) {
            self.onMouseMove(e);
            window.requestAnimationFrame(() => self.drawGame());
        });
        this.canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            self.onRightClick(e);
            window.requestAnimationFrame(() => self.drawGame());
        });
        document.body.appendChild(this.canvas);
        window.onload = function () {
            window.requestAnimationFrame(() => self.drawGame());
        };
    }
    drawGame() {
        this.gui.draw();
    }
    movePiece(srcSq, destSq) {
        let success = true;
        if (typeof this.config.onMovePiece === "function") {
            success = this.config.onMovePiece(srcSq, destSq);
        }
        if (success) {
            this.board.movePiece(srcSq, destSq);
            this.gui.setLastMove({ src: srcSq, dest: destSq });
        }
    }
    dropPiece(piece, sq) {
        let hand = this.handMap.get(piece.color);
        if (!hand)
            return;
        this.board.addPiece(piece, sq);
        hand.removePiece(piece.type);
    }
    selectPiece(sq) {
        if (typeof this.config.onSelectPiece === "function") {
            let piece = this.board.getPiece(sq);
            if (piece) {
                this.config.onSelectPiece(piece, sq);
            }
        }
        this.gui.setSelectedPieceSq(sq);
    }
    deselectPiece() {
        let selectedPieceSq = this.gui.getSelectedPieceSq();
        if (!selectedPieceSq) {
            return;
        }
        if (typeof this.config.onDeselectPiece === "function") {
        }
        this.gui.resetSelectedPieceSq();
    }
    startDraggingPiece(piece, mouseX, mouseY) {
        this.gui.setDraggingPiece(piece, mouseX, mouseY);
    }
    onMouseDown(event) {
        if (event.button !== 0) {
            return;
        }
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let clickedSq = this.gui.getSquareAtPos(mouseX, mouseY);
            if (!clickedSq)
                return;
            let piece = this.board.getPiece(clickedSq);
            let selectedSq = this.gui.getSelectedPieceSq();
            if (piece && (!selectedSq || util_1.squaresEqual(selectedSq, clickedSq))) {
                this.selectPiece(clickedSq);
                this.startDraggingPiece(piece, mouseX, mouseY);
            }
            else {
                if (selectedSq) {
                    if (!util_1.squaresEqual(selectedSq, clickedSq)) {
                        this.movePiece(selectedSq, clickedSq);
                        this.deselectPiece();
                    }
                }
            }
        }
        else {
            this.gui.resetDraggingPiece();
            this.deselectPiece();
        }
        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let hand = this.handMap.get(this.gui.getOrientation());
                if (!(hand === null || hand === void 0 ? void 0 : hand.getNumOfPieces(key))) {
                    return;
                }
                this.startDraggingPiece({ type: key, color: this.gui.getOrientation() }, mouseX, mouseY);
            }
        }
        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let hand = this.handMap.get(opponentColor);
                if (!(hand === null || hand === void 0 ? void 0 : hand.getNumOfPieces(key))) {
                    return;
                }
                this.startDraggingPiece({ type: key, color: opponentColor }, mouseX, mouseY);
            }
        }
    }
    onMouseUp(event) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let sqOver = this.gui.getSquareAtPos(mouseX, mouseY);
            if (!sqOver)
                return;
            let selectedSq = this.gui.getSelectedPieceSq();
            let dragPiece = this.gui.getDraggingPiece();
            if (dragPiece && selectedSq) {
                if (util_1.squaresEqual(selectedSq, sqOver)) {
                    this.gui.resetDraggingPiece();
                }
                else {
                    this.movePiece(selectedSq, sqOver);
                    this.deselectPiece();
                }
            }
            else if (dragPiece && !selectedSq) {
                this.dropPiece(dragPiece, sqOver);
            }
        }
        else {
            this.deselectPiece();
        }
        this.gui.resetDraggingPiece();
    }
    onMouseMove(event) {
        if (this.gui.getDraggingPiece()) {
            let rect = this.canvas.getBoundingClientRect();
            let mouseX = event.clientX - rect.left;
            let mouseY = event.clientY - rect.top;
            this.gui.setDraggingPiecePos(mouseX, mouseY);
        }
    }
    onRightClick(event) {
        this.gui.resetDraggingPiece();
        this.deselectPiece();
    }
}
exports.default = ShoGUI;

},{"./board":1,"./gui":2,"./hand":3,"./util":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPosInsideRect(rect, x, y) {
    if (x < rect.x || x >= rect.x + rect.width ||
        y < rect.y || y >= rect.y + rect.height) {
        return false;
    }
    return true;
}
exports.isPosInsideRect = isPosInsideRect;
function squaresEqual(sq1, sq2) {
    if (sq1.col === sq2.col && sq1.row === sq2.row)
        return true;
    return false;
}
exports.squaresEqual = squaresEqual;
function isMove(arg) {
    return arg && arg.src && arg.dest;
}
exports.isMove = isMove;
function isDrop(arg) {
    return arg && arg.piece && arg.dest;
}
exports.isDrop = isDrop;
function square2ShogiNotation(sq) {
    let colString = String.fromCharCode((9 - sq.col) + 48);
    let rowString = String.fromCharCode(sq.row + 97);
    return colString + rowString;
}
exports.square2ShogiNotation = square2ShogiNotation;
function shogiNotation2Square(sNotation) {
    let col;
    let row;
}
exports.shogiNotation2Square = shogiNotation2Square;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2hhbmQudHMiLCJzcmMvbWFpbi50cyIsInNyYy9zaG9ndWkudHMiLCJzcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsaUNBQXNDO0FBRXRDLE1BQXFCLEtBQUs7SUFLdEIsWUFBWSxJQUFJLEdBQUMsQ0FBQyxFQUFFLElBQUksR0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDbEM7U0FDSjtJQUNMLENBQUM7SUFFTSxLQUFLO1FBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksR0FBRyxFQUFFO29CQUNMLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDSCxDQUFDLElBQUksR0FBRyxDQUFDO2lCQUNaO2FBQ0o7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDekQ7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVB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LElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sSUFBSTtRQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0QsSUFBSSxD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SUFBSSxDQUFDO0FBQ3RDLENBQUM7QUFGRCx3QkFFQztBQUVELFNBQWdCLE1BQU0sQ0FBQyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztBQUN4QyxDQUFDO0FBRkQsd0JBRUM7QUFPRCxTQUFnQixvQkFBb0IsQ0FBQyxFQUFVO0lBQzNDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqRCxPQUFPLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDakMsQ0FBQztBQUpELG9EQUlDO0FBT0QsU0FBZ0Isb0JBQW9CLENBQUMsU0FBaUI7SUFDbEQsSUFBSSxHQUFHLENBQUM7SUFDUixJQUFJLEdBQUcsQ0FBQztBQUVaLENBQUM7QUFKRCxvREFJQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFBpZWNlLCBTcXVhcmUgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgc3F1YXJlc0VxdWFsIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb2FyZCB7XG4gICAgcHJpdmF0ZSByb3dzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBjb2xzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBzcXVhcmVzOiAoUGllY2V8dW5kZWZpbmVkKVtdW107XG5cbiAgICBjb25zdHJ1Y3Rvcihyb3dzPTksIGNvbHM9OSkge1xuICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICB0aGlzLmNvbHMgPSBjb2xzO1xuICAgICAgICB0aGlzLnNxdWFyZXMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCBjb2xzOyBmKyspIHtcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlc1tmXSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCByb3dzOyByKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNxdWFyZXNbZl1bcl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYXNjaWkoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgdGhpcy5yb3dzOyByKyspIHtcbiAgICAgICAgICAgIGxldCBzID0gJyc7XG4gICAgICAgICAgICBmb3IgKGxldCBmID0gMDsgZiA8IHRoaXMuY29sczsgZisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBjZSA9IHRoaXMuc3F1YXJlc1tmXVtyXTtcbiAgICAgICAgICAgICAgICBpZiAocGNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgKz0gcGNlLnR5cGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcyArPSAnLic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U3RhcnRpbmdQb3NpdGlvbigpIHtcbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCA5OyBmKyspIHtcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlc1tmXVs2XSA9IHsgdHlwZTogJ3Bhd24nLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2ZdWzJdID0geyB0eXBlOiAncGF3bicsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNxdWFyZXNbMF1bMF0gPSB7IHR5cGU6ICdsYW5jZScsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s4XVswXSA9IHsgdHlwZTogJ2xhbmNlJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzBdWzhdID0geyB0eXBlOiAnbGFuY2UnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbOF1bOF0gPSB7IHR5cGU6ICdsYW5jZScsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1sxXVswXSA9IHsgdHlwZTogJ2tuaWdodCcsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s3XVswXSA9IHsgdHlwZTogJ2tuaWdodCcsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1sxXVs4XSA9IHsgdHlwZTogJ2tuaWdodCcsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s3XVs4XSA9IHsgdHlwZTogJ2tuaWdodCcsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1syXVswXSA9IHsgdHlwZTogJ3NpbHZlcicsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s2XVswXSA9IHsgdHlwZTogJ3NpbHZlcicsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1syXVs4XSA9IHsgdHlwZTogJ3NpbHZlcicsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s2XVs4XSA9IHsgdHlwZTogJ3NpbHZlcicsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1szXVswXSA9IHsgdHlwZTogJ2dvbGQnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNV1bMF0gPSB7IHR5cGU6ICdnb2xkJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzNdWzhdID0geyB0eXBlOiAnZ29sZCcsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s1XVs4XSA9IHsgdHlwZTogJ2dvbGQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbN11bMV0gPSB7IHR5cGU6ICdiaXNob3AnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bN10gPSB7IHR5cGU6ICdiaXNob3AnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bMV0gPSB7IHR5cGU6ICdyb29rJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzddWzddID0geyB0eXBlOiAncm9vaycsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s0XVswXSA9IHsgdHlwZTogJ2tpbmcnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNF1bOF0gPSB7IHR5cGU6ICdraW5nJywgY29sb3I6ICdibGFjaycgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgTW92ZXMgYSBwaWVjZSBvbiB0aGUgYm9hcmQuIERvZXMgTk9UIGNoZWNrIGlmIGxlZ2FsIG9yIG5vdFxuICAgICAqXG4gICAgICogQHBhcmFtICAge1NxdWFyZX0gZnJvbVNxIC0gU291cmNlIHNxdWFyZVxuICAgICAqIEBwYXJhbSAgIHtTcXVhcmV9IHRvU3EgLSBEZXN0aW5hdGlvbiBzcXVhcmVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBzdWNjZXNzZnVsLCBmYWxzZSBpZiBub3RcbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZVBpZWNlKGZyb21TcTogU3F1YXJlLCB0b1NxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHNxdWFyZXNFcXVhbChmcm9tU3EsIHRvU3EpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3F1YXJlc1tmcm9tU3EuY29sXVtmcm9tU3Eucm93XSkge1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW3RvU3EuY29sXVt0b1NxLnJvd10gPSB0aGlzLnNxdWFyZXNbZnJvbVNxLmNvbF1bZnJvbVNxLnJvd107XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbZnJvbVNxLmNvbF1bZnJvbVNxLnJvd10gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGllY2Uoc3E6IFNxdWFyZSk6IFBpZWNlfHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxdWFyZXNbc3EuY29sXVtzcS5yb3ddO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRQaWVjZShwaWVjZTogUGllY2UsIHNxOiBTcXVhcmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zcXVhcmVzW3NxLmNvbF1bc3Eucm93XSA9IHBpZWNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXREaW1lbnNpb25zKCkge1xuICAgICAgICByZXR1cm4geyBjb2xzOiB0aGlzLmNvbHMsIHJvd3M6IHRoaXMucm93cyB9O1xuICAgIH1cbn0iLCJpbXBvcnQgeyBDb2xvciwgUGllY2UsIFBpZWNldHlwZSwgUmVjdCwgU3F1YXJlLCBNb3ZlLCBEcm9wIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEhhbmQgZnJvbSBcIi4vaGFuZFwiO1xuaW1wb3J0IHsgc3F1YXJlc0VxdWFsLCBpc01vdmUsIGlzRHJvcCB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGhhbmRNYXA6IE1hcDxDb2xvciwgSGFuZD47XG4gICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogQ29sb3I7XG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBwaWVjZUltYWdlTWFwOiBNYXA8UGllY2V0eXBlLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRSZWN0OiBSZWN0O1xuICAgIHByaXZhdGUgcGxheWVySGFuZFJlY3RNYXA6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgb3Bwb25lbnRIYW5kUmVjdE1hcDogTWFwPFBpZWNldHlwZSwgUmVjdD47XG4gICAgcHJpdmF0ZSBzZWxlY3RlZFBpZWNlU3E6IFNxdWFyZXx1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlOiBQaWVjZXx1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlUG9zOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xuICAgIHByaXZhdGUgbGFzdE1vdmU6IE1vdmV8RHJvcHx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQsIHBsYXllckhhbmRzOiBNYXA8Q29sb3IsIEhhbmQ+LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaGFuZE1hcCA9IHBsYXllckhhbmRzO1xuICAgICAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSAnYmxhY2snO1xuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2VQb3MgPSB7eDotMSwgeTotMX07XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIGxldCB0bXBDdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5jdHggPSB0bXBDdHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBvYnRhaW4gZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIGltYWdlc1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgSFRNTEltYWdlRWxlbWVudD4oKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgncGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnbGFuY2UnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2tuaWdodCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnc2lsdmVyJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdnb2xkJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdiaXNob3AnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3Jvb2snLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2tpbmcnLCBuZXcgSW1hZ2UoKSk7XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMucGllY2VJbWFnZU1hcCkge1xuICAgICAgICAgICAgdmFsdWUuc3JjID0gJy4uL21lZGlhL3BpZWNlcy8nICsga2V5ICsgJy5wbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgUmVjdHNcbiAgICAgICAgdGhpcy5ib2FyZFJlY3QgPSB7IHg6IHRoaXMuY2FudmFzLndpZHRoLzQsIHk6IDE1LCB3aWR0aDogdGhpcy5jYW52YXMud2lkdGgvMiwgaGVpZ2h0OiB0aGlzLmNhbnZhcy53aWR0aC8yIH07XG4gICAgICAgIHRoaXMuc3FTaXplID0gdGhpcy5ib2FyZFJlY3Qud2lkdGgvOTtcblxuICAgICAgICAvLyBIYW5kIFJlY3RzXG4gICAgICAgIGxldCB0bXBIYW5kUmVjdHMgPSB0aGlzLmluaXRIYW5kUmVjdE1hcHMoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJIYW5kUmVjdE1hcCA9IHRtcEhhbmRSZWN0cy5wbGF5ZXI7XG4gICAgICAgIHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcCA9IHRtcEhhbmRSZWN0cy5vcHBvbmVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRIYW5kUmVjdE1hcHMoKTogeyBwbGF5ZXI6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+LCBvcHBvbmVudDogTWFwPFBpZWNldHlwZSwgUmVjdD4gfSB7XG4gICAgICAgIGxldCBwYWRkaW5nID0gdGhpcy5ib2FyZFJlY3QueCArIHRoaXMuYm9hcmRSZWN0LndpZHRoO1xuICAgICAgICBsZXQgc3EgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IHBIYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIGxldCBvSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjYsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncm9vaycsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdwYXduJywgeyB4OnNxKjIsIHk6c3EqMiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpzcSozLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpzcSozLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnNxKjIsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpzcSwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6c3EqMiwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6c3EsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcblxuICAgICAgICByZXR1cm4geyBwbGF5ZXI6IHBIYW5kTWFwLCBvcHBvbmVudDogb0hhbmRNYXAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnc2xhdGVncmV5JztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5oaWdobGlnaHRMYXN0TW92ZSgpO1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFBpZWNlU3EpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0U3F1YXJlKCdtaW50Y3JlYW0nLCB0aGlzLnNlbGVjdGVkUGllY2VTcSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLmRyYXdGaWxlUmFua0xhYmVscygpO1xuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgOTsgZisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDk7IHIrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1BpZWNlKCB7Y29sOmYsIHJvdzpyfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmF3SGFuZCgnYmxhY2snKTsgXG4gICAgICAgIHRoaXMuZHJhd0hhbmQoJ3doaXRlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3RHJhZ2dpbmdQaWVjZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3Qm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ3NpbHZlcic7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPD0gOTsgZisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IGYqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkUmVjdC54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55ICsgdGhpcy5ib2FyZFJlY3QuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRSZWN0Lnk7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuYm9hcmRSZWN0LngsIGkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3RmlsZVJhbmtMYWJlbHMoKTogdm9pZCB7XG4gICAgICAgIGxldCBpbnRlcnZhbCA9IHRoaXMuc3FTaXplO1xuICAgICAgICB0aGlzLmN0eC5mb250ID0gJzE1cHggYXJpYWwnXG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IGk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gOCAtIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCBTdHJpbmcuZnJvbUNoYXJDb2RlKGxhYmVsKzErOTYpLCB0aGlzLmJvYXJkUmVjdC54ICsgdGhpcy5ib2FyZFJlY3Qud2lkdGggKyAzLCB0aGlzLmJvYXJkUmVjdC55ICsgdGhpcy5zcVNpemUvMisoaSppbnRlcnZhbCkgKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICd0b3AnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoICgxMCAtIChsYWJlbCsxKSkudG9TdHJpbmcoKSwgdGhpcy5ib2FyZFJlY3QueCArICh0aGlzLnNxU2l6ZS8yKSsoaSppbnRlcnZhbCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3UGllY2Uoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KHBpZWNlLnR5cGUpO1xuICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIHBpZWNlLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ2V0UG9zQXRTcXVhcmUoc3EuY29sLCBzcS5yb3cpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRQaWVjZVNxICYmIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgICAgIGlmIChzcXVhcmVzRXF1YWwodGhpcy5zZWxlY3RlZFBpZWNlU3EsIHNxKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCBwb3MueCwgcG9zLnksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ludmVydGVkKHBpZWNlSW1nLCBwb3MueCwgcG9zLnksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3RHJhZ2dpbmdQaWVjZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQodGhpcy5kcmFnZ2luZ1BpZWNlLnR5cGUpO1xuICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIHRoaXMuZHJhZ2dpbmdQaWVjZS50eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB4ID0gdGhpcy5kcmFnZ2luZ1BpZWNlUG9zLnggLSB0aGlzLnNxU2l6ZS8yO1xuICAgICAgICAgICAgbGV0IHkgPSB0aGlzLmRyYWdnaW5nUGllY2VQb3MueSAtIHRoaXMuc3FTaXplLzI7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlLmNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgeCwgeSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0hhbmQoY29sb3I6IENvbG9yKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldChjb2xvcik7XG4gICAgICAgICAgICBpZiAoIWhhbmQpIHJldHVybjtcbiAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ2JvdHRvbSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMucGxheWVySGFuZFJlY3RNYXApIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtT2ZQaWVjZXMgPSBoYW5kLmdldE51bU9mUGllY2VzKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5vcHBvbmVudEhhbmRSZWN0TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gaGFuZC5nZXROdW1PZlBpZWNlcyhrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWdobGlnaHRIYW5kUGllY2Uoc3R5bGU6IHN0cmluZywgcGllY2U6IFBpZWNlKSB7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuICAgICAgICBsZXQgcGllY2VSZWN0OiBSZWN0fHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICBwaWVjZVJlY3QgPSB0aGlzLnBsYXllckhhbmRSZWN0TWFwLmdldChwaWVjZS50eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBpZWNlUmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcC5nZXQocGllY2UudHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBpZWNlUmVjdCkge1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QocGllY2VSZWN0LngsIHBpZWNlUmVjdC55LCBwaWVjZVJlY3Qud2lkdGgsIHBpZWNlUmVjdC5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWdobGlnaHRMYXN0TW92ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdE1vdmUpIHtcbiAgICAgICAgICAgIGxldCBzdHlsZSA9ICcjOWFhNmIxJztcbiAgICAgICAgICAgIGlmICggaXNNb3ZlKHRoaXMubGFzdE1vdmUpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0U3F1YXJlKHN0eWxlLCB0aGlzLmxhc3RNb3ZlLnNyYyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBpc0Ryb3AodGhpcy5sYXN0TW92ZSkgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodEhhbmRQaWVjZShzdHlsZSwgdGhpcy5sYXN0TW92ZS5waWVjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFNxdWFyZShzdHlsZSwgdGhpcy5sYXN0TW92ZS5kZXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoc3R5bGU6IHN0cmluZywgc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5nZXRQb3NBdFNxdWFyZShzcS5jb2wsIHNxLnJvdyk7XG5cbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBcbiAgICAgICAgICAgIHBvcy55LFxuICAgICAgICAgICAgdGhpcy5zcVNpemUsXG4gICAgICAgICAgICB0aGlzLnNxU2l6ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3SW52ZXJ0ZWQoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHggKyB3aWR0aC8yLCB5ICsgaGVpZ2h0LzIpO1xuICAgICAgICB0aGlzLmN0eC5yb3RhdGUoTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSggLSh4ICsgd2lkdGgvMiksIC0oeSArIGhlaWdodC8yKSApO1xuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3F1YXJlQXRQb3MoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBTcXVhcmV8dW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbCA9IE1hdGguZmxvb3IoICh4IC0gdGhpcy5ib2FyZFJlY3QueCkvdGhpcy5zcVNpemUgKTtcbiAgICAgICAgbGV0IHJvdyA9IE1hdGguZmxvb3IoeS90aGlzLnNxU2l6ZSk7XG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICBjb2wgPSA4IC0gY29sO1xuICAgICAgICAgICAgcm93ID0gOCAtIHJvdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sIDwgMCB8fCByb3cgPCAwIHx8IGNvbCA+IHRoaXMuYm9hcmQuZ2V0RGltZW5zaW9ucygpLmNvbHMgfHwgcm93ID4gdGhpcy5ib2FyZC5nZXREaW1lbnNpb25zKCkucm93cykge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBjb2wsIHJvdyB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb3NBdFNxdWFyZShjb2w6IG51bWJlciwgcm93OiBudW1iZXIpOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGxldCB4ID0gdGhpcy5ib2FyZFJlY3QueCArIChjb2wgKiB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIGxldCB5ID0gdGhpcy5ib2FyZFJlY3QueSArIHJvdyAqIHRoaXMuc3FTaXplO1xuICAgICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNlbGVjdGVkUGllY2UoKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRQaWVjZVNxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5nZXRQaWVjZSh0aGlzLnNlbGVjdGVkUGllY2VTcSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWRQaWVjZVNxKHNxOiBTcXVhcmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFBpZWNlU3EgPSBzcTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXRTZWxlY3RlZFBpZWNlU3EoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRQaWVjZVNxID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREcmFnZ2luZ1BpZWNlKHBpZWNlOiBQaWVjZSwgeD86IG51bWJlciwgeT86IG51bWJlcikge1xuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSBwaWVjZTtcbiAgICAgICAgaWYgKHggJiYgeSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlUG9zID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlc2V0RHJhZ2dpbmdQaWVjZSgpIHtcbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREcmFnZ2luZ1BpZWNlUG9zKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZVBvcyA9IHt4OiB4LCB5OiB5fTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TGFzdE1vdmUoYXJnOiBNb3ZlfERyb3ApIHtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IGFyZztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RHJhZ2dpbmdQaWVjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhZ2dpbmdQaWVjZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Qm9hcmRSZWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZFJlY3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBsYXllckhhbmRSZWN0TWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJIYW5kUmVjdE1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3Bwb25lbnRIYW5kUmVjdE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWRQaWVjZVNxKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFBpZWNlU3E7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9yaWVudGF0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB9XG59IiwiaW1wb3J0IHsgUGllY2V0eXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGFuZCB7XG4gICAgcHJpdmF0ZSBwaWVjZXM6IE1hcDxQaWVjZXR5cGUsIG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5waWVjZXMgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuICAgICAgICB0aGlzLmVtcHR5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGVtcHR5KCkge1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ3Bhd24nLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdyb29rJywgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE51bU9mUGllY2VzKHBpZWNlOiBQaWVjZXR5cGUpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHBpZWNlIHRvIGhhbmRcbiAgICAgKiBAcGFyYW0gcGllY2UgXG4gICAgICogQHBhcmFtIG51bSBPcHRpb25hbCAtIElmIG5vdCBzdXBwbGllZCwgMSBpcyB0aGUgZGVmYXVsdFxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgICAgIGlmIChjdXJBbW91bnQgIT09IHVuZGVmaW5lZCkgeyAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgYW1vdW50IGlzIG5vdCB1bmRlZmluZWRcbiAgICAgICAgICAgIHRoaXMucGllY2VzLnNldChwaWVjZSwgY3VyQW1vdW50ICsgbnVtKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcGllY2UgZnJvbSBoYW5kXG4gICAgICogQHBhcmFtIHBpZWNlIFxuICAgICAqIEBwYXJhbSBudW0gT3B0aW9uYWwgLSBJZiBub3Qgc3VwcGxpZWQsIDEgaXMgdGhlIGRlZmF1bHRcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIG5vdFxuICAgICAqL1xuICAgIHJlbW92ZVBpZWNlKHBpZWNlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgICAgIGlmICghY3VyQW1vdW50IHx8IGN1ckFtb3VudCA8PSAwKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGllY2VzLnNldChwaWVjZSwgY3VyQW1vdW50IC0gbnVtKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSIsImltcG9ydCBTaG9HVUkgZnJvbSBcIi4vc2hvZ3VpXCI7XG5pbXBvcnQgeyBTcXVhcmUgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgc3F1YXJlMlNob2dpTm90YXRpb24gfSBmcm9tIFwiLi91dGlsXCI7XG5cbmxldCBzaG9ndWkgPSBuZXcgU2hvR1VJKHtvbk1vdmVQaWVjZTogb25QaWVjZU1vdmV9KTtcblxuZnVuY3Rpb24gb25QaWVjZU1vdmUoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICBjb25zb2xlLmxvZyggc3F1YXJlMlNob2dpTm90YXRpb24oc3JjU3EpICsgXCItLT5cIiArIHNxdWFyZTJTaG9naU5vdGF0aW9uKGRlc3RTcSkgKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0iLCJpbXBvcnQgR1VJIGZyb20gXCIuL2d1aVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgSGFuZCBmcm9tIFwiLi9oYW5kXCI7XG5pbXBvcnQgeyBDb25maWcsIFBpZWNlLCBTcXVhcmUsIENvbG9yIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgc3F1YXJlc0VxdWFsIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaG9HVUkge1xuICAgIHByaXZhdGUgY29uZmlnOiBDb25maWc7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBoYW5kTWFwOiBNYXA8Q29sb3IsIEhhbmQ+O1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIHRoaXMuaGFuZE1hcCA9IG5ldyBNYXA8Q29sb3IsIEhhbmQ+KCk7XG4gICAgICAgIHRoaXMuaGFuZE1hcC5zZXQoJ2JsYWNrJywgbmV3IEhhbmQoKSk7XG4gICAgICAgIHRoaXMuaGFuZE1hcC5zZXQoJ3doaXRlJywgbmV3IEhhbmQoKSk7XG4gICAgICAgIHRoaXMuYm9hcmQuc2V0U3RhcnRpbmdQb3NpdGlvbigpO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTIwMDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMud2lkdGgvMiArIDIwO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgdGhpcy5oYW5kTWFwLCB0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzZWxmLm9uUmlnaHRDbGljayhlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdHYW1lKCkge1xuICAgICAgICB0aGlzLmd1aS5kcmF3KCk7XG4gICAgICAgIC8vdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKFwiZ3JlZW5cIiwge2ZpbGU6IDUsIHJhbms6NX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZVBpZWNlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbk1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgICAgIHRoaXMuZ3VpLnNldExhc3RNb3ZlKCB7c3JjOiBzcmNTcSwgZGVzdDogZGVzdFNxfSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik7XG4gICAgICAgICAgICBpZiAoIWhhbmQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ib2FyZC5hZGRQaWVjZShwaWVjZSwgc3EpO1xuICAgICAgICBoYW5kLnJlbW92ZVBpZWNlKHBpZWNlLnR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0UGllY2Uoc3E6IFNxdWFyZSkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uU2VsZWN0UGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShzcSk7XG4gICAgICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5vblNlbGVjdFBpZWNlKHBpZWNlLCBzcSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5zZXRTZWxlY3RlZFBpZWNlU3Eoc3EpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVzZWxlY3RQaWVjZSgpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkUGllY2VTcSA9IHRoaXMuZ3VpLmdldFNlbGVjdGVkUGllY2VTcSgpO1xuICAgICAgICBpZiAoIXNlbGVjdGVkUGllY2VTcSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25EZXNlbGVjdFBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIC8vdGhpcy5jb25maWcub25EZXNlbGVjdFBpZWNlKHBpZWNlLCBzcXVhcmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkucmVzZXRTZWxlY3RlZFBpZWNlU3EoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXJ0RHJhZ2dpbmdQaWVjZShwaWVjZTogUGllY2UsIG1vdXNlWDogbnVtYmVyLCBtb3VzZVk6IG51bWJlcikge1xuICAgICAgICB0aGlzLmd1aS5zZXREcmFnZ2luZ1BpZWNlKHBpZWNlLCBtb3VzZVgsIG1vdXNlWSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkUmVjdCgpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5nZXRTcXVhcmVBdFBvcyhtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGlja2VkU3EpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBwaWVjZSA9IHRoaXMuYm9hcmQuZ2V0UGllY2UoY2xpY2tlZFNxKTtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFNxID0gdGhpcy5ndWkuZ2V0U2VsZWN0ZWRQaWVjZVNxKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChwaWVjZSAmJiAoIXNlbGVjdGVkU3EgfHwgc3F1YXJlc0VxdWFsKHNlbGVjdGVkU3EsIGNsaWNrZWRTcSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREcmFnZ2luZ1BpZWNlKHBpZWNlLCBtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3F1YXJlc0VxdWFsKHNlbGVjdGVkU3EsIGNsaWNrZWRTcSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHNlbGVjdGVkU3EsIGNsaWNrZWRTcSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0UGllY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLnJlc2V0RHJhZ2dpbmdQaWVjZSgpO1xuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFBpZWNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0UGxheWVySGFuZFJlY3RNYXAoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGhhbmQgPSB0aGlzLmhhbmRNYXAuZ2V0KHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkpO1xuICAgICAgICAgICAgICAgIGlmICghaGFuZD8uZ2V0TnVtT2ZQaWVjZXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREcmFnZ2luZ1BpZWNlKHt0eXBlOiBrZXksIGNvbG9yOiB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpfSwgbW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZFJlY3RNYXAoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldChvcHBvbmVudENvbG9yKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmQ/LmdldE51bU9mUGllY2VzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RHJhZ2dpbmdQaWVjZSh7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn0sIG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodGhpcy5ndWkuZ2V0Qm9hcmRSZWN0KCksIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgbGV0IHNxT3ZlciA9IHRoaXMuZ3VpLmdldFNxdWFyZUF0UG9zKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkU3EgPSB0aGlzLmd1aS5nZXRTZWxlY3RlZFBpZWNlU3EoKTtcbiAgICAgICAgICAgIGxldCBkcmFnUGllY2UgPSB0aGlzLmd1aS5nZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgICAgICAgICBpZiAoZHJhZ1BpZWNlICYmIHNlbGVjdGVkU3EpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3F1YXJlc0VxdWFsKHNlbGVjdGVkU3EsIHNxT3ZlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ndWkucmVzZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlUGllY2Uoc2VsZWN0ZWRTcSwgc3FPdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFBpZWNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChkcmFnUGllY2UgJiYgIXNlbGVjdGVkU3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3BQaWVjZShkcmFnUGllY2UsIHNxT3Zlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0UGllY2UoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmd1aS5yZXNldERyYWdnaW5nUGllY2UoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICggdGhpcy5ndWkuZ2V0RHJhZ2dpbmdQaWVjZSgpICkge1xuICAgICAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICAgICAgdGhpcy5ndWkuc2V0RHJhZ2dpbmdQaWVjZVBvcyhtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmlnaHRDbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICB0aGlzLmd1aS5yZXNldERyYWdnaW5nUGllY2UoKTtcbiAgICAgICAgdGhpcy5kZXNlbGVjdFBpZWNlKCk7XG4gICAgfVxufSIsImltcG9ydCB7IFJlY3QsIFNxdWFyZSwgTW92ZSwgRHJvcCB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBzb21ldGhpbmcgaXMgaW5zaWRlIHRoZSBSZWN0XG4gKiBAcGFyYW0gcmVjdCAtIFJlY3RhbmdsZSB0byBjaGVjayBpZiBwb3MgaXMgaW5zaWRlXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiBwb3NpdGlvblxuICogQHBhcmFtIHkgLSBZIGNvb3JkaWFudGUgb2YgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zSW5zaWRlUmVjdChyZWN0OiBSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICh4IDwgcmVjdC54IHx8IHggPj0gcmVjdC54ICsgcmVjdC53aWR0aCB8fFxuICAgICAgICB5IDwgcmVjdC55IHx8IHkgPj0gcmVjdC55ICsgcmVjdC5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBzcXVhcmVzIGFyZSB0aGUgc2FtZVxuICogQHBhcmFtIHtTcXVhcmV9IHNxMVxuICogQHBhcmFtIHtTcXVhcmV9IHNxMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlc0VxdWFsKHNxMTogU3F1YXJlLCBzcTI6IFNxdWFyZSkge1xuICAgIGlmIChzcTEuY29sID09PSBzcTIuY29sICYmIHNxMS5yb3cgPT09IHNxMi5yb3cpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTW92ZShhcmc6IGFueSk6IGFyZyBpcyBNb3ZlIHtcbiAgICByZXR1cm4gYXJnICYmIGFyZy5zcmMgJiYgYXJnLmRlc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Ryb3AoYXJnOiBhbnkpOiBhcmcgaXMgRHJvcCB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcucGllY2UgJiYgYXJnLmRlc3Q7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzcXVhcmUgdG8gaXRzIGNvcnJlc3BvbmRpbmcgU2hvZ2kgbm90YXRpb25cbiAqIEBwYXJhbSBzcSBTcXVhcmVcbiAqIEBleGFtcGxlIHNxKDEsIDEpIC0tPiBcIjhiXCJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZTJTaG9naU5vdGF0aW9uKHNxOiBTcXVhcmUpOiBzdHJpbmcge1xuICAgIGxldCBjb2xTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCAoOSAtIHNxLmNvbCkgKyA0OCk7XG4gICAgbGV0IHJvd1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoc3Eucm93ICsgOTcpO1xuICAgIHJldHVybiBjb2xTdHJpbmcgKyByb3dTdHJpbmc7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBTaG9naSBub3RhdGlvbiB0byBpdHMgY29ycmVzcG9uZGluZyBzcXVhcmVcbiAqIEBwYXJhbSBzTm90YXRpb24gc3F1YXJlIGluIHNob2dpIGFsZ2VicmFpYyBub3RhdGlvblxuICogQGV4YW1wbGUgXCI4YlwiIC0tPiBzcSgxLCAxKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvZ2lOb3RhdGlvbjJTcXVhcmUoc05vdGF0aW9uOiBzdHJpbmcpIHtcbiAgICBsZXQgY29sO1xuICAgIGxldCByb3c7XG4gICAgLy8gVE9ETzogRmluaXNoIHRoaXNcbn0iXX0=
