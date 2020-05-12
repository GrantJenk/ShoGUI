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
        this.arrowCanvas = document.createElement('canvas');
        this.arrowCanvas.height = this.canvas.height;
        this.arrowCanvas.width = this.canvas.width;
        let tmpaCtx = this.arrowCanvas.getContext('2d');
        if (tmpaCtx) {
            this.arrowCtx = tmpaCtx;
            this.arrowCtx.lineCap = 'round';
        }
        else {
            throw new Error('Failed to obtain arrow drawing context');
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
    clearCanvas() {
        this.ctx.fillStyle = 'slategrey';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.arrowCtx.clearRect(0, 0, this.arrowCanvas.width, this.arrowCanvas.height);
    }
    drawBoard() {
        this.ctx.strokeStyle = 'silver';
        this.ctx.lineWidth = 1;
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
    drawPiece(piece, x, y) {
        let pieceImg = this.pieceImageMap.get(piece.type);
        if (!pieceImg) {
            throw new Error("Failed to load piece image: " + piece.type);
        }
        if (piece.color === this.orientation) {
            this.ctx.drawImage(pieceImg, x, y, this.sqSize, this.sqSize);
        }
        else {
            this.drawInverted(pieceImg, x, y, this.sqSize, this.sqSize);
        }
    }
    drawPieceAtSquare(sq) {
        let piece = this.board.getPiece(sq);
        if (piece) {
            let pos = this.square2Pos(sq.col, sq.row);
            if (this.selectedPieceSq && this.draggingPiece) {
                if (util_1.squaresEqual(this.selectedPieceSq, sq)) {
                    return false;
                }
            }
            this.drawPiece(piece, pos.x, pos.y);
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
    highlightSquare(style, sq) {
        let pos = this.square2Pos(sq.col, sq.row);
        this.ctx.fillStyle = style;
        this.ctx.fillRect(pos.x, pos.y, this.sqSize, this.sqSize);
    }
    drawArrow(style, fromx, fromy, tox, toy) {
        let angle = Math.atan2(toy - fromy, tox - fromx);
        let radius = this.arrowCanvas.width / 40;
        let x = tox - radius * Math.cos(angle);
        let y = toy - radius * Math.sin(angle);
        this.arrowCtx.lineWidth = 2 * radius / 5;
        this.arrowCtx.fillStyle = style;
        this.arrowCtx.strokeStyle = style;
        this.arrowCtx.beginPath();
        this.arrowCtx.moveTo(fromx, fromy);
        this.arrowCtx.lineTo(x, y);
        this.arrowCtx.stroke();
        this.arrowCtx.closePath();
        this.arrowCtx.beginPath();
        let xcenter = (tox + x) / 2;
        let ycenter = (toy + y) / 2;
        this.arrowCtx.moveTo(tox, toy);
        angle += 2 * Math.PI / 3;
        x = radius * Math.cos(angle) + xcenter;
        y = radius * Math.sin(angle) + ycenter;
        this.arrowCtx.lineTo(x, y);
        angle += 2 * Math.PI / 3;
        x = radius * Math.cos(angle) + xcenter;
        y = radius * Math.sin(angle) + ycenter;
        this.arrowCtx.lineTo(x, y);
        this.arrowCtx.closePath();
        this.arrowCtx.fill();
    }
    drawSquareArrow(arrow) {
        let toSqPos = this.square2Pos(arrow.toSq.col, arrow.toSq.row);
        let fromSqPos = this.square2Pos(arrow.fromSq.col, arrow.fromSq.row);
        this.arrowCtx.save();
        if (util_1.squaresEqual(arrow.toSq, arrow.fromSq)) {
            this.arrowCtx.strokeStyle = arrow.style;
            this.arrowCtx.lineWidth = this.arrowCanvas.width / 200;
            this.arrowCtx.strokeRect(toSqPos.x, toSqPos.y, this.sqSize, this.sqSize);
        }
        else {
            this.drawArrow(arrow.style, fromSqPos.centerX, fromSqPos.centerY, toSqPos.centerX, toSqPos.centerY);
        }
        this.arrowCtx.restore();
    }
    drawHandArrow(arrow) {
        let rect;
        if (arrow.color === this.orientation) {
            rect = this.playerHandRectMap.get(arrow.piecetype);
        }
        else {
            rect = this.opponentHandRectMap.get(arrow.piecetype);
        }
        if (!rect)
            return false;
        if (!arrow.toSq)
            return false;
        let toSqPos = this.square2Pos(arrow.toSq.col, arrow.toSq.row);
        this.drawArrow(arrow.style, rect.x + (rect.width / 2), rect.y + (rect.height / 2), toSqPos.centerX, toSqPos.centerY);
    }
    drawArrowCanvas(alpha) {
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(this.arrowCanvas, 0, 0);
        this.ctx.globalAlpha = 1.0;
    }
    drawInverted(image, x, y, width, height) {
        this.ctx.save();
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(Math.PI);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
        this.ctx.drawImage(image, x, y, width, height);
        this.ctx.restore();
    }
    pos2Square(x, y) {
        let col = Math.floor((x - this.boardRect.x) / this.sqSize);
        let row = Math.floor((y - this.boardRect.y) / this.sqSize);
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        if (col < 0 || row < 0 || col > this.board.getDimensions().cols - 1 || row > this.board.getDimensions().rows - 1) {
            return undefined;
        }
        return { col, row };
    }
    square2Pos(col, row) {
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        let x = this.boardRect.x + (col * this.sqSize);
        let y = this.boardRect.y + row * this.sqSize;
        let centerX = x + (this.sqSize / 2);
        let centerY = y + (this.sqSize / 2);
        return { x, y, centerX, centerY };
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
    getBoardRect() {
        return this.boardRect;
    }
    getSqSize() {
        return this.sqSize;
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
let shogui = new shogui_1.default({ onMovePiece: onPieceMove });
function onPieceMove(srcSq, destSq) {
    return true;
}

},{"./shogui":5}],5:[function(require,module,exports){
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
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width / 2 + 20;
        this.gui = new gui_1.default(this.board, this.handMap, this.canvas);
        this.arrowList = [];
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
        window.addEventListener('keydown', function (e) {
            self.gui.flipBoard();
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
    flipBoard() {
        this.gui.flipBoard();
    }
    addArrow(arrow) {
        if (arrow.toSq === undefined)
            return false;
        this.arrowList.push(arrow);
        return true;
    }
    removeArrow(arrow) {
        let i = 0;
        for (let cmpArrow of this.arrowList) {
            if (util_1.arrowsEqual(cmpArrow, arrow)) {
                this.arrowList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }
    clearArrows() {
        this.arrowList = [];
    }
    movePiece(srcSq, destSq) {
        let success = true;
        if (typeof this.config.onMovePiece === "function") {
            success = this.config.onMovePiece(srcSq, destSq);
        }
        if (success) {
            this.board.movePiece(srcSq, destSq);
        }
    }
    dropPiece(piece, sq) {
        let hand = this.handMap.get(piece.color);
        if (!hand)
            return;
        this.board.addPiece(piece, sq);
        hand.removePiece(piece.type);
    }
    drawGame() {
        this.gui.clearCanvas();
        if (this.activeSquare) {
            this.gui.highlightSquare('mintcream', this.activeSquare);
        }
        this.gui.drawBoard();
        this.gui.drawFileRankLabels();
        for (let f = 0; f < 9; f++) {
            for (let r = 0; r < 9; r++) {
                if (this.activeSquare && this.draggingPiece) {
                    if (util_1.squaresEqual(this.activeSquare, { col: f, row: r })) {
                        continue;
                    }
                }
                this.gui.drawPieceAtSquare({ col: f, row: r });
            }
        }
        this.gui.drawHand('black');
        this.gui.drawHand('white');
        if (this.draggingPiece) {
            this.gui.drawPiece(this.draggingPiece.piece, this.draggingPiece.x - this.gui.getSqSize() / 2, this.draggingPiece.y - this.gui.getSqSize() / 2);
        }
        if (this.currentArrow) {
            this.drawArrow(this.currentArrow);
        }
        for (let arrow of this.arrowList) {
            this.drawArrow(arrow);
        }
        this.gui.drawArrowCanvas(0.6);
    }
    drawArrow(arrow) {
        if (util_1.isSquareArrow(arrow)) {
            this.gui.drawSquareArrow(arrow);
        }
        else if (util_1.isHandArrow(arrow)) {
            if (!arrow.toSq) {
            }
            else {
                this.gui.drawHandArrow(arrow);
            }
        }
    }
    onMouseDown(event) {
        if (event.button !== 0) {
            return;
        }
        this.clearArrows();
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let clickedSq = this.gui.pos2Square(mouseX, mouseY);
            if (!clickedSq)
                return;
            let piece = this.board.getPiece(clickedSq);
            if (piece && (!this.activeSquare || util_1.squaresEqual(this.activeSquare, clickedSq))) {
                this.activeSquare = clickedSq;
                this.draggingPiece = { piece: piece, x: mouseX, y: mouseY };
            }
            else {
                if (this.activeSquare) {
                    if (!util_1.squaresEqual(this.activeSquare, clickedSq)) {
                        this.movePiece(this.activeSquare, clickedSq);
                        this.activeSquare = undefined;
                    }
                }
            }
        }
        else {
            this.draggingPiece = undefined;
            this.activeSquare = undefined;
        }
        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let hand = this.handMap.get(this.gui.getOrientation());
                if (!(hand === null || hand === void 0 ? void 0 : hand.getNumOfPieces(key))) {
                    return;
                }
                let piece = { type: key, color: this.gui.getOrientation() };
                this.draggingPiece = { piece: piece, x: mouseX, y: mouseY };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let hand = this.handMap.get(opponentColor);
                if (!(hand === null || hand === void 0 ? void 0 : hand.getNumOfPieces(key))) {
                    return;
                }
                let piece = { type: key, color: opponentColor };
                this.draggingPiece = { piece: piece, x: mouseX, y: mouseY };
            }
        }
    }
    onMouseUp(event) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
            let sqOver = this.gui.pos2Square(mouseX, mouseY);
            if (!sqOver)
                return;
            if (this.draggingPiece && this.activeSquare) {
                if (util_1.squaresEqual(this.activeSquare, sqOver)) {
                    this.draggingPiece = undefined;
                }
                else {
                    this.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            }
            else if (this.draggingPiece && !this.activeSquare) {
                this.dropPiece(this.draggingPiece.piece, sqOver);
            }
        }
        else {
            this.activeSquare = undefined;
        }
        this.draggingPiece = undefined;
        if (event.button === 2) {
            if (this.currentArrow) {
                if (!this.removeArrow(this.currentArrow)) {
                    this.addArrow(this.currentArrow);
                }
                this.currentArrow = undefined;
            }
        }
    }
    onMouseMove(event) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let hoverSq = this.gui.pos2Square(mouseX, mouseY);
        if (this.draggingPiece) {
            this.draggingPiece.x = mouseX;
            this.draggingPiece.y = mouseY;
        }
        if (this.currentArrow) {
            if (hoverSq) {
                this.currentArrow.toSq = hoverSq;
            }
            else {
                this.currentArrow.toSq = undefined;
            }
        }
    }
    onRightClick(event) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let clickedSq = this.gui.pos2Square(mouseX, mouseY);
        if (clickedSq && !this.draggingPiece) {
            this.currentArrow = { style: 'red', fromSq: clickedSq, toSq: clickedSq };
        }
        for (let [key, value] of this.gui.getPlayerHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                this.currentArrow = { style: 'black', piecetype: key, color: this.gui.getOrientation() };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandRectMap()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                this.currentArrow = { style: 'black', piecetype: key, color: opponentColor };
            }
        }
        this.draggingPiece = undefined;
        this.activeSquare = undefined;
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
function arrowsEqual(arrow1, arrow2) {
    if (isSquareArrow(arrow1) && isSquareArrow(arrow2)) {
        if (squaresEqual(arrow1.toSq, arrow2.toSq) && squaresEqual(arrow1.fromSq, arrow2.fromSq)) {
            return true;
        }
    }
    else if (isHandArrow(arrow1) && isHandArrow(arrow2)) {
        if (arrow1.piecetype === arrow2.piecetype && arrow1.color === arrow2.color) {
            if (arrow1.toSq && arrow2.toSq && squaresEqual(arrow1.toSq, arrow2.toSq)) {
                return true;
            }
        }
    }
    return false;
}
exports.arrowsEqual = arrowsEqual;
function isMove(arg) {
    return arg && arg.src && arg.dest;
}
exports.isMove = isMove;
function isDrop(arg) {
    return arg && arg.piece && arg.dest;
}
exports.isDrop = isDrop;
function isSquareArrow(arg) {
    return arg && arg.style && arg.fromSq && arg.toSq;
}
exports.isSquareArrow = isSquareArrow;
function isHandArrow(arg) {
    return arg && arg.style && arg.piecetype && arg.color && arg.toSq;
}
exports.isHandArrow = isHandArrow;
function square2ShogiCoordinate(sq) {
    let colString = String.fromCharCode((9 - sq.col) + 48);
    let rowString = String.fromCharCode(sq.row + 97);
    return colString + rowString;
}
exports.square2ShogiCoordinate = square2ShogiCoordinate;
function shogiCoordinate2Square(coord) {
    let col = 9 - parseInt(coord[0]);
    let row = coord.charCodeAt(1) - 97;
    return { col: col, row: row };
}
exports.shogiCoordinate2Square = shogiCoordinate2Square;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2hhbmQudHMiLCJzcmMvbWFpbi50cyIsInNyYy9zaG9ndWkudHMiLCJzcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsaUNBQXNDO0FBRXRDLE1BQXFCLEtBQUs7SUFLdEIsWUFBWSxJQUFJLEdBQUMsQ0FBQyxFQUFFLElBQUksR0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDbEM7U0FDSjtJQUNMLENBQUM7SUFFTSxLQUFLO1FBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksR0FBRyxFQUFFO29CQUNMLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDSCxDQUFDLElBQUksR0FBRyxDQUFDO2lCQUNaO2FBQ0o7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDekQ7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVB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QU07WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDN0Q7UUFHRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1FBQzVELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUU1QyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN6QyxLQUFLLENBQUMsR0FBRyxHQUFHLGtCQUFrQixHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDakQ7UUFHRCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDO1FBR3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQzdDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO0lBQ3JELENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDdEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNyQixJQUFJLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztRQUMxQyxJQUFJLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztRQUMxQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRCxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RCxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVB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Q0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJ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QUFzQixDQUFDLEVBQVU7SUFDN0MsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDeEQsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUNqQyxDQUFDO0FBSkQsd0RBSUM7QUFPRCxTQUFnQixzQkFBc0IsQ0FBQyxLQUFpQjtJQUNwRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ25DLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBSkQsd0RBSUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBQaWVjZSwgU3F1YXJlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHNxdWFyZXNFcXVhbCB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuICAgIHByaXZhdGUgcm93czogbnVtYmVyO1xuICAgIHByaXZhdGUgY29sczogbnVtYmVyO1xuICAgIHByaXZhdGUgc3F1YXJlczogKFBpZWNlfHVuZGVmaW5lZClbXVtdO1xuXG4gICAgY29uc3RydWN0b3Iocm93cz05LCBjb2xzPTkpIHtcbiAgICAgICAgdGhpcy5yb3dzID0gcm93cztcbiAgICAgICAgdGhpcy5jb2xzID0gY29scztcbiAgICAgICAgdGhpcy5zcXVhcmVzID0gW107XG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgY29sczsgZisrKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbZl0gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgcm93czsgcisrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2ZdW3JdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzY2lpKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IHRoaXMucm93czsgcisrKSB7XG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCB0aGlzLmNvbHM7IGYrKykge1xuICAgICAgICAgICAgICAgIGxldCBwY2UgPSB0aGlzLnNxdWFyZXNbZl1bcl07XG4gICAgICAgICAgICAgICAgaWYgKHBjZSkge1xuICAgICAgICAgICAgICAgICAgICBzICs9IHBjZS50eXBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJy4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFN0YXJ0aW5nUG9zaXRpb24oKSB7XG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgOTsgZisrKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbZl1bNl0gPSB7IHR5cGU6ICdwYXduJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlc1tmXVsyXSA9IHsgdHlwZTogJ3Bhd24nLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zcXVhcmVzWzBdWzBdID0geyB0eXBlOiAnbGFuY2UnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbOF1bMF0gPSB7IHR5cGU6ICdsYW5jZScsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1swXVs4XSA9IHsgdHlwZTogJ2xhbmNlJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzhdWzhdID0geyB0eXBlOiAnbGFuY2UnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bMF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbN11bMF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bOF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbN11bOF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMl1bMF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNl1bMF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMl1bOF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNl1bOF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbM11bMF0gPSB7IHR5cGU6ICdnb2xkJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzVdWzBdID0geyB0eXBlOiAnZ29sZCcsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1szXVs4XSA9IHsgdHlwZTogJ2dvbGQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNV1bOF0gPSB7IHR5cGU6ICdnb2xkJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzddWzFdID0geyB0eXBlOiAnYmlzaG9wJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzFdWzddID0geyB0eXBlOiAnYmlzaG9wJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzFdWzFdID0geyB0eXBlOiAncm9vaycsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s3XVs3XSA9IHsgdHlwZTogJ3Jvb2snLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNF1bMF0gPSB7IHR5cGU6ICdraW5nJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzRdWzhdID0geyB0eXBlOiAna2luZycsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIE1vdmVzIGEgcGllY2Ugb24gdGhlIGJvYXJkLiBEb2VzIE5PVCBjaGVjayBpZiBsZWdhbCBvciBub3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSAgIHtTcXVhcmV9IGZyb21TcSAtIFNvdXJjZSBzcXVhcmVcbiAgICAgKiBAcGFyYW0gICB7U3F1YXJlfSB0b1NxIC0gRGVzdGluYXRpb24gc3F1YXJlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcHVibGljIG1vdmVQaWVjZShmcm9tU3E6IFNxdWFyZSwgdG9TcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChzcXVhcmVzRXF1YWwoZnJvbVNxLCB0b1NxKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLnNxdWFyZXNbZnJvbVNxLmNvbF1bZnJvbVNxLnJvd10pIHtcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlc1t0b1NxLmNvbF1bdG9TcS5yb3ddID0gdGhpcy5zcXVhcmVzW2Zyb21TcS5jb2xdW2Zyb21TcS5yb3ddO1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2Zyb21TcS5jb2xdW2Zyb21TcS5yb3ddID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBpZWNlKHNxOiBTcXVhcmUpOiBQaWVjZXx1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5zcXVhcmVzW3NxLmNvbF1bc3Eucm93XTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3F1YXJlc1tzcS5jb2xdW3NxLnJvd10gPSBwaWVjZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGltZW5zaW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHsgY29sczogdGhpcy5jb2xzLCByb3dzOiB0aGlzLnJvd3MgfTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgTW92ZSwgRHJvcCwgU3F1YXJlQXJyb3csIEhhbmRBcnJvdyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCBIYW5kIGZyb20gXCIuL2hhbmRcIjtcbmltcG9ydCB7IHNxdWFyZXNFcXVhbCB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGhhbmRNYXA6IE1hcDxDb2xvciwgSGFuZD47XG4gICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogQ29sb3I7XG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBhcnJvd0NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhcnJvd0N0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgcGllY2VJbWFnZU1hcDogTWFwPFBpZWNldHlwZSwgSFRNTEltYWdlRWxlbWVudD47XG4gICAgcHJpdmF0ZSBzcVNpemU6IG51bWJlcjtcbiAgICBwcml2YXRlIGJvYXJkUmVjdDogUmVjdDtcbiAgICBwcml2YXRlIHBsYXllckhhbmRSZWN0TWFwOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcbiAgICBwcml2YXRlIG9wcG9uZW50SGFuZFJlY3RNYXA6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgc2VsZWN0ZWRQaWVjZVNxOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogUGllY2V8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZVBvczoge3g6IG51bWJlciwgeTogbnVtYmVyfTtcblxuICAgIGNvbnN0cnVjdG9yKGJvYXJkOiBCb2FyZCwgcGxheWVySGFuZHM6IE1hcDxDb2xvciwgSGFuZD4sIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5oYW5kTWFwID0gcGxheWVySGFuZHM7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBib2FyZDtcbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbiA9ICdibGFjayc7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZVBvcyA9IHt4Oi0xLCB5Oi0xfTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgbGV0IHRtcEN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBDdHgpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4ID0gdG1wQ3R4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgbGV0IHRtcGFDdHggPSB0aGlzLmFycm93Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBhQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eCA9IHRtcGFDdHg7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGFycm93IGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCBpbWFnZXNcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnZ29sZCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdraW5nJywgbmV3IEltYWdlKCkpO1xuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBpZWNlSW1hZ2VNYXApIHtcbiAgICAgICAgICAgIHZhbHVlLnNyYyA9ICcuLi9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIFJlY3RzXG4gICAgICAgIHRoaXMuYm9hcmRSZWN0ID0geyB4OiB0aGlzLmNhbnZhcy53aWR0aC80LCB5OiAxNSwgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLzIsIGhlaWdodDogdGhpcy5jYW52YXMud2lkdGgvMiB9O1xuICAgICAgICB0aGlzLnNxU2l6ZSA9IHRoaXMuYm9hcmRSZWN0LndpZHRoLzk7XG5cbiAgICAgICAgLy8gSGFuZCBSZWN0c1xuICAgICAgICBsZXQgdG1wSGFuZFJlY3RzID0gdGhpcy5pbml0SGFuZFJlY3RNYXBzKCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZFJlY3RNYXAgPSB0bXBIYW5kUmVjdHMucGxheWVyO1xuICAgICAgICB0aGlzLm9wcG9uZW50SGFuZFJlY3RNYXAgPSB0bXBIYW5kUmVjdHMub3Bwb25lbnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0SGFuZFJlY3RNYXBzKCk6IHsgcGxheWVyOiBNYXA8UGllY2V0eXBlLCBSZWN0Piwgb3Bwb25lbnQ6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+IH0ge1xuICAgICAgICBsZXQgcGFkZGluZyA9IHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aDtcbiAgICAgICAgbGV0IHNxID0gdGhpcy5zcVNpemU7XG4gICAgICAgIGxldCBwSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBsZXQgb0hhbmRNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgUmVjdD4oKTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdwYXduJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo2LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnBhZGRpbmcgKyBzcS8yLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnBhZGRpbmcgKyBzcS8yLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2dvbGQnLCB7IHg6cGFkZGluZyArIHNxKig1LzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnYmlzaG9wJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6cGFkZGluZyArIHNxKig1LzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncGF3bicsIHsgeDpzcSoyLCB5OnNxKjIsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6c3EqMywgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6c3EqMywgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpzcSoyLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2dvbGQnLCB7IHg6c3EsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnYmlzaG9wJywgeyB4OnNxKjIsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdyb29rJywgeyB4OnNxLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcGxheWVyOiBwSGFuZE1hcCwgb3Bwb25lbnQ6IG9IYW5kTWFwIH07XG4gICAgfVxuXG4gICAgcHVibGljIGZsaXBCb2FyZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJDYW52YXMoKSB7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdzbGF0ZWdyZXknO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5hcnJvd0NhbnZhcy53aWR0aCwgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3Qm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ3NpbHZlcic7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPD0gOTsgZisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IGYqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkUmVjdC54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55ICsgdGhpcy5ib2FyZFJlY3QuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRSZWN0Lnk7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuYm9hcmRSZWN0LngsIGkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdGaWxlUmFua0xhYmVscygpOiB2b2lkIHtcbiAgICAgICAgbGV0IGludGVydmFsID0gdGhpcy5zcVNpemU7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMTVweCBhcmlhbCdcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSA4IC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoIFN0cmluZy5mcm9tQ2hhckNvZGUobGFiZWwrMSs5NiksIHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aCArIDMsIHRoaXMuYm9hcmRSZWN0LnkgKyB0aGlzLnNxU2l6ZS8yKyhpKmludGVydmFsKSApO1xuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ3RvcCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggKDEwIC0gKGxhYmVsKzEpKS50b1N0cmluZygpLCB0aGlzLmJvYXJkUmVjdC54ICsgKHRoaXMuc3FTaXplLzIpKyhpKmludGVydmFsKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlKHBpZWNlOiBQaWVjZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQocGllY2UudHlwZSk7XG4gICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIHBpZWNlLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlQXRTcXVhcmUoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnNxdWFyZTJQb3Moc3EuY29sLCBzcS5yb3cpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRQaWVjZVNxICYmIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgICAgIGlmIChzcXVhcmVzRXF1YWwodGhpcy5zZWxlY3RlZFBpZWNlU3EsIHNxKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UocGllY2UsIHBvcy54LCBwb3MueSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdEcmFnZ2luZ1BpZWNlKCkge1xuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldCh0aGlzLmRyYWdnaW5nUGllY2UudHlwZSk7XG4gICAgICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsgdGhpcy5kcmFnZ2luZ1BpZWNlLnR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHggPSB0aGlzLmRyYWdnaW5nUGllY2VQb3MueCAtIHRoaXMuc3FTaXplLzI7XG4gICAgICAgICAgICBsZXQgeSA9IHRoaXMuZHJhZ2dpbmdQaWVjZVBvcy55IC0gdGhpcy5zcVNpemUvMjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nUGllY2UuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ludmVydGVkKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQoY29sb3IpO1xuICAgICAgICAgICAgaWYgKCFoYW5kKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdib3R0b20nO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBsYXllckhhbmRSZWN0TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gaGFuZC5nZXROdW1PZlBpZWNlcyhrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcCkge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IGhhbmQuZ2V0TnVtT2ZQaWVjZXMoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bU9mUGllY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IG51bU9mUGllY2VzID09PSAwID8gMC4yIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoc3R5bGU6IHN0cmluZywgc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxLmNvbCwgc3Eucm93KTtcblxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QocG9zLngsIFxuICAgICAgICAgICAgcG9zLnksXG4gICAgICAgICAgICB0aGlzLnNxU2l6ZSxcbiAgICAgICAgICAgIHRoaXMuc3FTaXplKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93KHN0eWxlOiBzdHJpbmcsIGZyb214OiBudW1iZXIsIGZyb215OiBudW1iZXIsIHRveDogbnVtYmVyLCB0b3k6IG51bWJlcikge1xuICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4yKHRveSAtIGZyb215LCB0b3ggLSBmcm9teCk7XG4gICAgICAgIGxldCByYWRpdXMgPSB0aGlzLmFycm93Q2FudmFzLndpZHRoLzQwO1xuICAgICAgICBsZXQgeCA9IHRveCAtIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgbGV0IHkgPSB0b3kgLSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVdpZHRoID0gMipyYWRpdXMvNTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2VTdHlsZSA9IHN0eWxlO1xuIFxuICAgICAgICAvLyBEcmF3IGxpbmVcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8oZnJvbXgsIGZyb215KTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gXG4gICAgICAgIC8vIERyYXcgYXJyb3cgaGVhZFxuICAgICAgICB0aGlzLmFycm93Q3R4LmJlZ2luUGF0aCgpO1xuIFxuICAgICAgICBsZXQgeGNlbnRlciA9ICh0b3ggKyB4KS8yO1xuICAgICAgICBsZXQgeWNlbnRlciA9ICh0b3kgKyB5KS8yO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4Lm1vdmVUbyh0b3gsIHRveSk7XG4gICAgICAgIGFuZ2xlICs9IDIqTWF0aC5QSS8zO1xuICAgICAgICB4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpICsgeGNlbnRlcjtcbiAgICAgICAgeSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSArIHljZW50ZXI7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5maWxsKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdTcXVhcmVBcnJvdyhhcnJvdzogU3F1YXJlQXJyb3cpIHtcbiAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cudG9TcS5jb2wsIGFycm93LnRvU3Eucm93KTtcbiAgICAgICAgbGV0IGZyb21TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5mcm9tU3EuY29sLCBhcnJvdy5mcm9tU3Eucm93KTtcblxuICAgICAgICB0aGlzLmFycm93Q3R4LnNhdmUoKTtcbiAgICAgICAgaWYgKHNxdWFyZXNFcXVhbChhcnJvdy50b1NxLCBhcnJvdy5mcm9tU3EpICkge1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2VTdHlsZSA9IGFycm93LnN0eWxlO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lV2lkdGggPSB0aGlzLmFycm93Q2FudmFzLndpZHRoLzIwMDtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlUmVjdCh0b1NxUG9zLngsIHRvU3FQb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCBmcm9tU3FQb3MuY2VudGVyWCwgZnJvbVNxUG9zLmNlbnRlclksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0hhbmRBcnJvdyhhcnJvdzogSGFuZEFycm93KSB7XG4gICAgICAgIGxldCByZWN0O1xuICAgICAgICBpZiAoYXJyb3cuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIHJlY3QgPSB0aGlzLnBsYXllckhhbmRSZWN0TWFwLmdldChhcnJvdy5waWVjZXR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcC5nZXQoYXJyb3cucGllY2V0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZWN0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIWFycm93LnRvU3EpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cudG9TcS5jb2wsIGFycm93LnRvU3Eucm93KTtcblxuICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgcmVjdC54KyhyZWN0LndpZHRoLzIpLCByZWN0LnkrKHJlY3QuaGVpZ2h0LzIpLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdBcnJvd0NhbnZhcyhhbHBoYTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLmFycm93Q2FudmFzLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxLjA7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdJbnZlcnRlZChpbWFnZTogSFRNTEltYWdlRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcblxuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoeCArIHdpZHRoLzIsIHkgKyBoZWlnaHQvMik7XG4gICAgICAgIHRoaXMuY3R4LnJvdGF0ZShNYXRoLlBJKTtcbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKCAtKHggKyB3aWR0aC8yKSwgLSh5ICsgaGVpZ2h0LzIpICk7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwb3MyU3F1YXJlKHg6IG51bWJlciwgeTogbnVtYmVyKTogU3F1YXJlfHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBjb2wgPSBNYXRoLmZsb29yKCAoeCAtIHRoaXMuYm9hcmRSZWN0LngpL3RoaXMuc3FTaXplICk7XG4gICAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKCAoeSAtIHRoaXMuYm9hcmRSZWN0LnkpL3RoaXMuc3FTaXplKTtcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPCAwIHx8IHJvdyA8IDAgfHwgY29sID4gdGhpcy5ib2FyZC5nZXREaW1lbnNpb25zKCkuY29scyAtIDF8fCByb3cgPiB0aGlzLmJvYXJkLmdldERpbWVuc2lvbnMoKS5yb3dzIC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBjb2wsIHJvdyB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBzcXVhcmUyUG9zKGNvbDogbnVtYmVyLCByb3c6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHggPSB0aGlzLmJvYXJkUmVjdC54ICsgKGNvbCAqIHRoaXMuc3FTaXplKTtcbiAgICAgICAgbGV0IHkgPSB0aGlzLmJvYXJkUmVjdC55ICsgcm93ICogdGhpcy5zcVNpemU7XG4gICAgICAgIGxldCBjZW50ZXJYID0geCArICh0aGlzLnNxU2l6ZS8yKTtcbiAgICAgICAgbGV0IGNlbnRlclkgPSB5ICsgKHRoaXMuc3FTaXplLzIpXG4gICAgICAgIHJldHVybiB7IHgsIHksIGNlbnRlclgsIGNlbnRlclkgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U2VsZWN0ZWRQaWVjZSgpOiBQaWVjZXx1bmRlZmluZWQge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFBpZWNlU3EpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJvYXJkLmdldFBpZWNlKHRoaXMuc2VsZWN0ZWRQaWVjZVNxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRTZWxlY3RlZFBpZWNlU3Eoc3E6IFNxdWFyZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnNlbGVjdGVkUGllY2VTcSA9IHNxO1xuICAgIH1cblxuICAgIHB1YmxpYyByZXNldFNlbGVjdGVkUGllY2VTcSgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFBpZWNlU3EgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJvYXJkUmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRSZWN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTcVNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxU2l6ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGxheWVySGFuZFJlY3RNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckhhbmRSZWN0TWFwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcHBvbmVudEhhbmRSZWN0TWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHBvbmVudEhhbmRSZWN0TWFwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTZWxlY3RlZFBpZWNlU3EoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkUGllY2VTcTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3JpZW50YXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBQaWVjZXR5cGUgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIYW5kIHtcbiAgICBwcml2YXRlIHBpZWNlczogTWFwPFBpZWNldHlwZSwgbnVtYmVyPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBpZWNlcyA9IG5ldyBNYXA8UGllY2V0eXBlLCBudW1iZXI+KCk7XG4gICAgICAgIHRoaXMuZW1wdHkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZW1wdHkoKSB7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgncGF3bicsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2xhbmNlJywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgna25pZ2h0JywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgnc2lsdmVyJywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgnZ29sZCcsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2Jpc2hvcCcsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ3Jvb2snLCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TnVtT2ZQaWVjZXMocGllY2U6IFBpZWNldHlwZSk6IG51bWJlcnx1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5waWVjZXMuZ2V0KHBpZWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgcGllY2UgdG8gaGFuZFxuICAgICAqIEBwYXJhbSBwaWVjZSBcbiAgICAgKiBAcGFyYW0gbnVtIE9wdGlvbmFsIC0gSWYgbm90IHN1cHBsaWVkLCAxIGlzIHRoZSBkZWZhdWx0XG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiBzdWNjZXNzZnVsLCBmYWxzZSBpZiBub3RcbiAgICAgKi9cbiAgICBwdWJsaWMgYWRkUGllY2UocGllY2U6IFBpZWNldHlwZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gdGhpcy5waWVjZXMuZ2V0KHBpZWNlKTtcbiAgICAgICAgaWYgKGN1ckFtb3VudCAhPT0gdW5kZWZpbmVkKSB7IC8vIE1ha2Ugc3VyZSB0aGUgY3VycmVudCBhbW91bnQgaXMgbm90IHVuZGVmaW5lZFxuICAgICAgICAgICAgdGhpcy5waWVjZXMuc2V0KHBpZWNlLCBjdXJBbW91bnQgKyBudW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBwaWVjZSBmcm9tIGhhbmRcbiAgICAgKiBAcGFyYW0gcGllY2UgXG4gICAgICogQHBhcmFtIG51bSBPcHRpb25hbCAtIElmIG5vdCBzdXBwbGllZCwgMSBpcyB0aGUgZGVmYXVsdFxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcmVtb3ZlUGllY2UocGllY2U6IFBpZWNldHlwZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gdGhpcy5waWVjZXMuZ2V0KHBpZWNlKTtcbiAgICAgICAgaWYgKCFjdXJBbW91bnQgfHwgY3VyQW1vdW50IDw9IDApIHsgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KHBpZWNlLCBjdXJBbW91bnQgLSBudW0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59IiwiaW1wb3J0IFNob0dVSSBmcm9tIFwiLi9zaG9ndWlcIjtcbmltcG9ydCB7IFNxdWFyZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBzcXVhcmUyU2hvZ2lDb29yZGluYXRlLCBzaG9naUNvb3JkaW5hdGUyU3F1YXJlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5sZXQgc2hvZ3VpID0gbmV3IFNob0dVSSh7b25Nb3ZlUGllY2U6IG9uUGllY2VNb3ZlfSk7XG5cbmZ1bmN0aW9uIG9uUGllY2VNb3ZlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgLy9zaG9ndWkuYWRkQXJyb3coe3N0eWxlOiAnYmxhY2snLCBmcm9tU3E6IHNyY1NxLCB0b1NxOiBkZXN0U3F9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0iLCJpbXBvcnQgR1VJIGZyb20gXCIuL2d1aVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgSGFuZCBmcm9tIFwiLi9oYW5kXCI7XG5pbXBvcnQgeyBDb25maWcsIFBpZWNlLCBTcXVhcmUsIENvbG9yLCBTcXVhcmVBcnJvdywgSGFuZEFycm93IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgc3F1YXJlc0VxdWFsLCBpc1NxdWFyZUFycm93LCBpc0hhbmRBcnJvdywgYXJyb3dzRXF1YWwgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBEcmFnZ2luZ1BpZWNlIHtcbiAgICBwaWVjZTogUGllY2UsXG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlclxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaG9HVUkge1xuICAgIHByaXZhdGUgY29uZmlnOiBDb25maWc7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBoYW5kTWFwOiBNYXA8Q29sb3IsIEhhbmQ+O1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuICAgIHByaXZhdGUgY3VycmVudEFycm93OiBTcXVhcmVBcnJvd3xIYW5kQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dMaXN0OiAoU3F1YXJlQXJyb3d8SGFuZEFycm93KVtdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwID0gbmV3IE1hcDxDb2xvciwgSGFuZD4oKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwLnNldCgnYmxhY2snLCBuZXcgSGFuZCgpKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwLnNldCgnd2hpdGUnLCBuZXcgSGFuZCgpKTtcbiAgICAgICAgdGhpcy5ib2FyZC5zZXRTdGFydGluZ1Bvc2l0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSAxMzUwO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy53aWR0aC8yICsgMjA7XG4gICAgICAgIHRoaXMuZ3VpID0gbmV3IEdVSSh0aGlzLmJvYXJkLCB0aGlzLmhhbmRNYXAsIHRoaXMuY2FudmFzKTtcblxuICAgICAgICB0aGlzLmFycm93TGlzdCA9IFtdO1xuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZURvd24oZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLmRyYXdHYW1lKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VVcChlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5ndWkuZmxpcEJvYXJkKCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHNlbGYuYXJyb3dMaXN0KTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2VsZi5vblJpZ2h0Q2xpY2soZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLmRyYXdHYW1lKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgd2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGZsaXBCb2FyZCgpIHtcbiAgICAgICAgdGhpcy5ndWkuZmxpcEJvYXJkKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEFycm93KGFycm93OiBTcXVhcmVBcnJvd3xIYW5kQXJyb3cpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGFycm93LnRvU3EgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLmFycm93TGlzdC5wdXNoKGFycm93KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUFycm93KGFycm93OiBTcXVhcmVBcnJvd3xIYW5kQXJyb3cpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCBjbXBBcnJvdyBvZiB0aGlzLmFycm93TGlzdCkge1xuICAgICAgICAgICAgaWYgKCBhcnJvd3NFcXVhbChjbXBBcnJvdywgYXJyb3cpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXJyb3dMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQXJyb3dzKCkge1xuICAgICAgICB0aGlzLmFycm93TGlzdCA9IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZVBpZWNlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbk1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJvcFBpZWNlKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQocGllY2UuY29sb3IpO1xuICAgICAgICAgICAgaWYgKCFoYW5kKSByZXR1cm47XG4gICAgICAgIHRoaXMuYm9hcmQuYWRkUGllY2UocGllY2UsIHNxKTtcbiAgICAgICAgaGFuZC5yZW1vdmVQaWVjZShwaWVjZS50eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdHYW1lKCkge1xuICAgICAgICB0aGlzLmd1aS5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKCdtaW50Y3JlYW0nLCB0aGlzLmFjdGl2ZVNxdWFyZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5ndWkuZHJhd0ZpbGVSYW5rTGFiZWxzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCA5OyBmKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgOTsgcisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlICYmIHRoaXMuZHJhZ2dpbmdQaWVjZSkgeyAvLyBEb24ndCBkcmF3IHRoZSBjdXJyZW50bHkgZHJhZ2dpbmcgcGllY2Ugb24gaXRzIHNxdWFyZVxuICAgICAgICAgICAgICAgICAgICBpZiAoIHNxdWFyZXNFcXVhbCh0aGlzLmFjdGl2ZVNxdWFyZSwge2NvbDogZiwgcm93OiByfSkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmd1aS5kcmF3UGllY2VBdFNxdWFyZSgge2NvbDpmLCByb3c6cn0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kKCdibGFjaycpOyBcbiAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmQoJ3doaXRlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlKHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZSwgdGhpcy5kcmFnZ2luZ1BpZWNlLnggLSB0aGlzLmd1aS5nZXRTcVNpemUoKS8yLCB0aGlzLmRyYWdnaW5nUGllY2UueSAtIHRoaXMuZ3VpLmdldFNxU2l6ZSgpLzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgIHRoaXMuZHJhd0Fycm93KHRoaXMuY3VycmVudEFycm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGFycm93IG9mIHRoaXMuYXJyb3dMaXN0KSB7XG4gICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdBcnJvd0NhbnZhcygwLjYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0Fycm93KGFycm93OiBTcXVhcmVBcnJvd3xIYW5kQXJyb3cpIHtcbiAgICAgICAgaWYgKCBpc1NxdWFyZUFycm93KGFycm93KSApIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdTcXVhcmVBcnJvdyhhcnJvdyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGlzSGFuZEFycm93KGFycm93KSApIHtcbiAgICAgICAgICAgIGlmICggIWFycm93LnRvU3EgKSB7XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgZHJhdyBhcnJvdywganVzdCBkcmF3IGhpZ2hsaWdodCBvciBzb21ldGhpbmcuLi5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmRBcnJvdyhhcnJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xlYXJBcnJvd3MoKTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkUmVjdCgpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCBzcXVhcmVzRXF1YWwodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSBjbGlja2VkU3E7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzcXVhcmVzRXF1YWwodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHRoaXMuYWN0aXZlU3F1YXJlLCBjbGlja2VkU3EpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRQbGF5ZXJIYW5kUmVjdE1hcCgpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQodGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kPy5nZXROdW1PZlBpZWNlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlID0ge3R5cGU6IGtleSwgY29sb3I6IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCl9O1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRSZWN0TWFwKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQob3Bwb25lbnRDb2xvcik7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kPy5nZXROdW1PZlBpZWNlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlID0ge3R5cGU6IGtleSwgY29sb3I6IG9wcG9uZW50Q29sb3J9O1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodGhpcy5ndWkuZ2V0Qm9hcmRSZWN0KCksIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgbGV0IHNxT3ZlciA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgICAgIGlmICghc3FPdmVyKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmIHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNxdWFyZXNFcXVhbCh0aGlzLmFjdGl2ZVNxdWFyZSwgc3FPdmVyKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIHNxT3Zlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmICF0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJvcFBpZWNlKHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZSwgc3FPdmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7IC8vIFJpZ2h0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5yZW1vdmVBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgIGxldCBob3ZlclNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG5cbiAgICAgICAgaWYgKCB0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZS54ID0gbW91c2VYO1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnkgPSBtb3VzZVk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgIGlmIChob3ZlclNxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cudG9TcSA9IGhvdmVyU3E7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93LnRvU3EgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmlnaHRDbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGNsaWNrZWRTcSA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuXG4gICAgICAgIGlmIChjbGlja2VkU3EgJiYgIXRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAncmVkJywgZnJvbVNxOiBjbGlja2VkU3EsIHRvU3E6IGNsaWNrZWRTcSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRSZWN0TWFwKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogJ2JsYWNrJywgcGllY2V0eXBlOiBrZXksIGNvbG9yOiB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0T3Bwb25lbnRIYW5kUmVjdE1hcCgpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAnYmxhY2snLCBwaWVjZXR5cGU6IGtleSwgY29sb3I6IG9wcG9uZW50Q29sb3IgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgfVxufSIsImltcG9ydCB7IFJlY3QsIFNxdWFyZSwgTW92ZSwgRHJvcCwgQ29vcmRpbmF0ZSwgU3F1YXJlQXJyb3csIEhhbmRBcnJvdyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBzb21ldGhpbmcgaXMgaW5zaWRlIHRoZSBSZWN0XG4gKiBAcGFyYW0gcmVjdCAtIFJlY3RhbmdsZSB0byBjaGVjayBpZiBwb3MgaXMgaW5zaWRlXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiBwb3NpdGlvblxuICogQHBhcmFtIHkgLSBZIGNvb3JkaWFudGUgb2YgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zSW5zaWRlUmVjdChyZWN0OiBSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICh4IDwgcmVjdC54IHx8IHggPj0gcmVjdC54ICsgcmVjdC53aWR0aCB8fFxuICAgICAgICB5IDwgcmVjdC55IHx8IHkgPj0gcmVjdC55ICsgcmVjdC5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHR3byBzcXVhcmVzIGFyZSB0aGUgc2FtZVxuICogQHBhcmFtIHtTcXVhcmV9IHNxMVxuICogQHBhcmFtIHtTcXVhcmV9IHNxMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlc0VxdWFsKHNxMTogU3F1YXJlLCBzcTI6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgIGlmIChzcTEuY29sID09PSBzcTIuY29sICYmIHNxMS5yb3cgPT09IHNxMi5yb3cpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycm93c0VxdWFsKGFycm93MTogU3F1YXJlQXJyb3d8SGFuZEFycm93LCBhcnJvdzI6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgIGlmICggaXNTcXVhcmVBcnJvdyhhcnJvdzEpICYmIGlzU3F1YXJlQXJyb3coYXJyb3cyKSApIHtcbiAgICAgICAgaWYgKCBzcXVhcmVzRXF1YWwoYXJyb3cxLnRvU3EsIGFycm93Mi50b1NxKSAmJiBzcXVhcmVzRXF1YWwoYXJyb3cxLmZyb21TcSwgYXJyb3cyLmZyb21TcSkgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIGlzSGFuZEFycm93KGFycm93MSkgJiYgaXNIYW5kQXJyb3coYXJyb3cyKSApIHtcbiAgICAgICAgaWYgKGFycm93MS5waWVjZXR5cGUgPT09IGFycm93Mi5waWVjZXR5cGUgJiYgYXJyb3cxLmNvbG9yID09PSBhcnJvdzIuY29sb3IpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3cxLnRvU3EgJiYgYXJyb3cyLnRvU3EgJiYgc3F1YXJlc0VxdWFsKGFycm93MS50b1NxLCBhcnJvdzIudG9TcSkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNb3ZlKGFyZzogYW55KTogYXJnIGlzIE1vdmUge1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnNyYyAmJiBhcmcuZGVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHJvcChhcmc6IGFueSk6IGFyZyBpcyBEcm9wIHtcbiAgICByZXR1cm4gYXJnICYmIGFyZy5waWVjZSAmJiBhcmcuZGVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3F1YXJlQXJyb3coYXJnOiBhbnkpOiBhcmcgaXMgU3F1YXJlQXJyb3cge1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnN0eWxlICYmIGFyZy5mcm9tU3EgJiYgYXJnLnRvU3E7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hhbmRBcnJvdyhhcmc6IGFueSk6IGFyZyBpcyBIYW5kQXJyb3cge1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnN0eWxlICYmIGFyZy5waWVjZXR5cGUgJiYgYXJnLmNvbG9yICYmIGFyZy50b1NxO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc3F1YXJlIHRvIGl0cyBjb3JyZXNwb25kaW5nIFNob2dpIGFsZ2VicmFpYyBub3RhdGlvblxuICogVE9ETzogSW52ZXN0aWdhdGUgcmV0dXJuaW5nIENvb3JkaW5hdGUgdHlwZSByYXRoZXIgdGhhbiBzdHJpbmdcbiAqIEBwYXJhbSBzcSBTcXVhcmVcbiAqIEBleGFtcGxlIHNxKDEsIDEpIC0tPiBcIjhiXCJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZTJTaG9naUNvb3JkaW5hdGUoc3E6IFNxdWFyZSk6IHN0cmluZyB7XG4gICAgbGV0IGNvbFN0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoICg5IC0gc3EuY29sKSArIDQ4KTtcbiAgICBsZXQgcm93U3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZShzcS5yb3cgKyA5Nyk7XG4gICAgcmV0dXJuIGNvbFN0cmluZyArIHJvd1N0cmluZztcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFNob2dpIHNxdWFyZSBpbiBhbGdlYnJhaWMgbm90YXRpb24gdG8gaXRzIGNvcnJlc3BvbmRpbmcgc3F1YXJlXG4gKiBAcGFyYW0gY29vcmQgc3F1YXJlIGluIHNob2dpIGFsZ2VicmFpYyBub3RhdGlvblxuICogQGV4YW1wbGUgXCI4YlwiIC0tPiBzcSgxLCAxKVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvZ2lDb29yZGluYXRlMlNxdWFyZShjb29yZDogQ29vcmRpbmF0ZSk6IFNxdWFyZSB7XG4gICAgbGV0IGNvbCA9IDkgLSBwYXJzZUludChjb29yZFswXSk7XG4gICAgbGV0IHJvdyA9IGNvb3JkLmNoYXJDb2RlQXQoMSkgLSA5NztcbiAgICByZXR1cm4geyBjb2w6IGNvbCwgcm93OiByb3cgfTtcbn0iXX0=
