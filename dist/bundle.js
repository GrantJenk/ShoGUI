(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Board {
    constructor(rows = 9, cols = 9) {
        this.rows = rows;
        this.cols = cols;
        this.squares = [];
        for (let i = 0; i < cols; i++) {
            this.squares[i] = [];
            for (let j = 0; j < rows; j++) {
                this.squares[i][j] = undefined;
            }
        }
    }
    ascii() {
        for (let i = 0; i < this.rows; i++) {
            let s = '';
            for (let j = 0; j < this.cols; j++) {
                let pce = this.squares[j][i];
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
        if (util_1.isSqEqual(fromSq, toSq))
            return false;
        if (this.squares[fromSq.file][fromSq.rank]) {
            this.squares[toSq.file][toSq.rank] = this.squares[fromSq.file][fromSq.rank];
            this.squares[fromSq.file][fromSq.rank] = undefined;
            return true;
        }
        return false;
    }
    getPiece(sq) {
        return this.squares[sq.file][sq.rank];
    }
    addPiece(piece, sq) {
        this.squares[sq.file][sq.rank] = piece;
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
            throw new Error("Failed to obtain drawing context");
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
            value.src = "../media/pieces/" + key + ".png";
        }
        this.boardRect = { x: this.canvas.width / 4, y: 0, width: this.canvas.width / 2, height: this.canvas.width / 2 };
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
                this.drawPiece({ file: f, rank: r });
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
            this.ctx.fillText((label + 1).toString(), this.boardRect.x - 13, this.sqSize / 2 + (i * interval));
            this.ctx.textBaseline = 'top';
            this.ctx.fillText((10 - (label + 1)).toString(), this.boardRect.x + this.sqSize / 2 + (i * interval), this.boardRect.height + 4);
        }
    }
    drawPiece(sq) {
        let piece = this.board.getPiece(sq);
        if (piece) {
            let pieceImg = this.pieceImageMap.get(piece.type);
            if (!pieceImg) {
                throw new Error("Failed to load piece image: " + piece.type);
            }
            let pos = this.getPosAtSquare(sq.file, sq.rank);
            if (this.selectedPieceSq && this.draggingPiece) {
                if (util_1.isSqEqual(this.selectedPieceSq, sq)) {
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
        let piecerole = util_1.PiecetypeToRole(piece.type);
        let pieceRect;
        if (piece.color === this.orientation) {
            pieceRect = this.playerHandRectMap.get(piecerole);
        }
        else {
            pieceRect = this.opponentHandRectMap.get(piecerole);
        }
        if (pieceRect) {
            this.ctx.fillRect(pieceRect.x, pieceRect.y, pieceRect.width, pieceRect.height);
        }
    }
    highlightLastMove() {
        if (this.lastMove) {
            let style = "#9aa6b1";
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
        let file = sq.file;
        let rank = sq.rank;
        if (this.orientation === "white") {
            file = 8 - file;
            rank = 8 - rank;
        }
        this.ctx.fillStyle = style;
        this.ctx.fillRect(this.boardRect.x + file * this.sqSize, rank * this.sqSize, this.sqSize, this.sqSize);
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
        let file = Math.floor((x - this.boardRect.x) / this.sqSize);
        let rank = Math.floor(y / this.sqSize);
        if (this.orientation === "white") {
            file = 8 - file;
            rank = 8 - rank;
        }
        if (file < 0 || rank < 0 || file > this.board.getDimensions().cols || rank > this.board.getDimensions().rows) {
            return undefined;
        }
        return { file, rank };
    }
    getPosAtSquare(file, rank) {
        if (this.orientation === "white") {
            file = 8 - file;
            rank = 8 - rank;
        }
        let x = this.boardRect.x + (file * this.sqSize);
        let y = rank * this.sqSize;
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
        hand.removePiece(util_1.PiecetypeToRole(piece.type));
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
            if (piece && (!selectedSq || util_1.isSqEqual(selectedSq, clickedSq))) {
                this.selectPiece(clickedSq);
                this.startDraggingPiece(piece, mouseX, mouseY);
            }
            else {
                if (selectedSq) {
                    if (selectedSq.file !== clickedSq.file || selectedSq.rank !== clickedSq.rank) {
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
                if (util_1.isSqEqual(selectedSq, sqOver)) {
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
function isSqEqual(sq1, sq2) {
    if (sq1.file === sq2.file && sq1.rank === sq2.rank)
        return true;
    return false;
}
exports.isSqEqual = isSqEqual;
function isMove(arg) {
    return arg && arg.src && arg.dest;
}
exports.isMove = isMove;
function isDrop(arg) {
    return arg && arg.piece && arg.dest;
}
exports.isDrop = isDrop;
function PiecetypeToRole(piecetype) {
    switch (piecetype) {
        case 'pawn':
        case '+pawn':
            return 'pawn';
        case 'lance':
        case '+lance':
            return 'lance';
        case 'knight':
        case '+knight':
            return 'knight';
        case 'silver':
        case '+silver':
            return 'silver';
        case 'gold':
            return 'gold';
        case 'bishop':
        case '+bishop':
            return 'bishop';
        case 'rook':
        case '+rook':
            return 'rook';
        case 'king':
            return 'king';
    }
}
exports.PiecetypeToRole = PiecetypeToRole;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2hhbmQudHMiLCJzcmMvbWFpbi50cyIsInNyYy9zaG9ndWkudHMiLCJzcmMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsaUNBQW1DO0FBRW5DLE1BQXFCLEtBQUs7SUFLdEIsWUFBWSxJQUFJLEdBQUMsQ0FBQyxFQUFFLElBQUksR0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7YUFDbEM7U0FDSjtJQUNMLENBQUM7SUFFTSxLQUFLO1FBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLElBQUksR0FBRyxFQUFFO29CQUNMLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDSCxDQUFDLElBQUksR0FBRyxDQUFDO2lCQUNaO2FBQ0o7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQUVNLG1CQUFtQjtRQUV0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDekQ7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDMUQsQ0FBQztJQVNNLFNBQVMsQ0FBQyxNQUFjLEVBQUUsSUFBWTtRQUN6QyxJQUFJLGdCQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVEsQ0FBQyxFQUFVO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxRQUFRLENBQUMsS0FBWSxFQUFFLEVBQVU7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUMzQyxDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0NBQ0o7QUE3RkQsd0JBNkZDOzs7OztBQzdGRCxpQ0FBb0U7QUFLcEUsTUFBcUIsR0FBRztJQWdCcEIsWUFBWSxLQUFZLEVBQUUsV0FBNkIsRUFBRSxNQUF5QjtRQUM5RSxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUMzQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztTQUNyQjthQUFNO1lBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1NBQ3ZEO1FBR0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBK0IsQ0FBQztRQUM1RCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDekMsS0FBSyxDQUFDLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO1NBQ2pEO1FBR0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUdyQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM3QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUNyRCxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3RELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sSUFBSTtRQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0QsSUFBSSxD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QUFnQixNQUFNLENBQUMsR0FBUTtJQUMzQixPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDdEMsQ0FBQztBQUZELHdCQUVDO0FBRUQsU0FBZ0IsTUFBTSxDQUFDLEdBQVE7SUFDM0IsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3hDLENBQUM7QUFGRCx3QkFFQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxTQUFvQjtJQUNoRCxRQUFRLFNBQVMsRUFBRTtRQUNmLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxPQUFPO1lBQ1IsT0FBTyxNQUFNLENBQUM7UUFDbEIsS0FBSyxPQUFPLENBQUM7UUFDYixLQUFLLFFBQVE7WUFDVCxPQUFPLE9BQU8sQ0FBQztRQUNuQixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssU0FBUztZQUNWLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxTQUFTO1lBQ1YsT0FBTyxRQUFRLENBQUM7UUFDcEIsS0FBSyxNQUFNO1lBQ1AsT0FBTyxNQUFNLENBQUM7UUFDbEIsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFNBQVM7WUFDVixPQUFPLFFBQVEsQ0FBQztRQUNwQixLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssT0FBTztZQUNSLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLEtBQUssTUFBTTtZQUNQLE9BQU8sTUFBTSxDQUFDO0tBQ3JCO0FBQ0wsQ0FBQztBQXpCRCwwQ0F5QkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBQaWVjZSwgU3F1YXJlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzU3FFcXVhbCB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuICAgIHByaXZhdGUgcm93czogbnVtYmVyO1xuICAgIHByaXZhdGUgY29sczogbnVtYmVyO1xuICAgIHByaXZhdGUgc3F1YXJlczogKFBpZWNlfHVuZGVmaW5lZClbXVtdO1xuXG4gICAgY29uc3RydWN0b3Iocm93cz05LCBjb2xzPTkpIHtcbiAgICAgICAgdGhpcy5yb3dzID0gcm93cztcbiAgICAgICAgdGhpcy5jb2xzID0gY29scztcbiAgICAgICAgdGhpcy5zcXVhcmVzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29sczsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbaV0gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcm93czsgaisrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2ldW2pdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzY2lpKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93czsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcyA9ICcnO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmNvbHM7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBwY2UgPSB0aGlzLnNxdWFyZXNbal1baV07XG4gICAgICAgICAgICAgICAgaWYgKHBjZSkge1xuICAgICAgICAgICAgICAgICAgICBzICs9IHBjZS50eXBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgKz0gJy4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFN0YXJ0aW5nUG9zaXRpb24oKSB7XG4gICAgICAgIC8vIFBsYWNlIHBhd25zXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDwgOTsgZisrKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbZl1bNl0gPSB7IHR5cGU6ICdwYXduJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgICAgIHRoaXMuc3F1YXJlc1tmXVsyXSA9IHsgdHlwZTogJ3Bhd24nLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zcXVhcmVzWzBdWzBdID0geyB0eXBlOiAnbGFuY2UnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbOF1bMF0gPSB7IHR5cGU6ICdsYW5jZScsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1swXVs4XSA9IHsgdHlwZTogJ2xhbmNlJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzhdWzhdID0geyB0eXBlOiAnbGFuY2UnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bMF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbN11bMF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMV1bOF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbN11bOF0gPSB7IHR5cGU6ICdrbmlnaHQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMl1bMF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNl1bMF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ3doaXRlJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbMl1bOF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNl1bOF0gPSB7IHR5cGU6ICdzaWx2ZXInLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbM11bMF0gPSB7IHR5cGU6ICdnb2xkJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzVdWzBdID0geyB0eXBlOiAnZ29sZCcsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1szXVs4XSA9IHsgdHlwZTogJ2dvbGQnLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNV1bOF0gPSB7IHR5cGU6ICdnb2xkJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzddWzFdID0geyB0eXBlOiAnYmlzaG9wJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzFdWzddID0geyB0eXBlOiAnYmlzaG9wJywgY29sb3I6ICdibGFjaycgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzFdWzFdID0geyB0eXBlOiAncm9vaycsIGNvbG9yOiAnd2hpdGUnIH07XG4gICAgICAgIHRoaXMuc3F1YXJlc1s3XVs3XSA9IHsgdHlwZTogJ3Jvb2snLCBjb2xvcjogJ2JsYWNrJyB9O1xuICAgICAgICB0aGlzLnNxdWFyZXNbNF1bMF0gPSB7IHR5cGU6ICdraW5nJywgY29sb3I6ICd3aGl0ZScgfTtcbiAgICAgICAgdGhpcy5zcXVhcmVzWzRdWzhdID0geyB0eXBlOiAna2luZycsIGNvbG9yOiAnYmxhY2snIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIE1vdmVzIGEgcGllY2Ugb24gdGhlIGJvYXJkLiBEb2VzIE5PVCBjaGVjayBpZiBsZWdhbCBvciBub3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSAgIHtTcXVhcmV9IGZyb21TcSAtIFNvdXJjZSBzcXVhcmVcbiAgICAgKiBAcGFyYW0gICB7U3F1YXJlfSB0b1NxIC0gRGVzdGluYXRpb24gc3F1YXJlXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcHVibGljIG1vdmVQaWVjZShmcm9tU3E6IFNxdWFyZSwgdG9TcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChpc1NxRXF1YWwoZnJvbVNxLCB0b1NxKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLnNxdWFyZXNbZnJvbVNxLmZpbGVdW2Zyb21TcS5yYW5rXSkge1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW3RvU3EuZmlsZV1bdG9TcS5yYW5rXSA9IHRoaXMuc3F1YXJlc1tmcm9tU3EuZmlsZV1bZnJvbVNxLnJhbmtdO1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2Zyb21TcS5maWxlXVtmcm9tU3EucmFua10gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGllY2Uoc3E6IFNxdWFyZSk6IFBpZWNlfHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxdWFyZXNbc3EuZmlsZV1bc3EucmFua107XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnNxdWFyZXNbc3EuZmlsZV1bc3EucmFua10gPSBwaWVjZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGltZW5zaW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHsgY29sczogdGhpcy5jb2xzLCByb3dzOiB0aGlzLnJvd3MgfTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFBpZWNlcm9sZSwgUmVjdCwgU3F1YXJlLCBNb3ZlLCBEcm9wIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEhhbmQgZnJvbSBcIi4vaGFuZFwiO1xuaW1wb3J0IHsgaXNTcUVxdWFsLCBQaWVjZXR5cGVUb1JvbGUsIGlzTW92ZSwgaXNEcm9wIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG4vKipcbiAqIFZpZXcgZm9yIHRoZSBTaG9HVUkgQXBwbGljYXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGhhbmRNYXA6IE1hcDxDb2xvciwgSGFuZD47XG4gICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogQ29sb3I7XG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBwaWVjZUltYWdlTWFwOiBNYXA8UGllY2V0eXBlLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRSZWN0OiBSZWN0O1xuICAgIHByaXZhdGUgcGxheWVySGFuZFJlY3RNYXA6IE1hcDxQaWVjZXJvbGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgb3Bwb25lbnRIYW5kUmVjdE1hcDogTWFwPFBpZWNlcm9sZSwgUmVjdD47XG4gICAgcHJpdmF0ZSBzZWxlY3RlZFBpZWNlU3E6IFNxdWFyZXx1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlOiBQaWVjZXx1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlUG9zOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xuICAgIHByaXZhdGUgbGFzdE1vdmU6IE1vdmV8RHJvcHx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQsIHBsYXllckhhbmRzOiBNYXA8Q29sb3IsIEhhbmQ+LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaGFuZE1hcCA9IHBsYXllckhhbmRzO1xuICAgICAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSAnYmxhY2snO1xuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2VQb3MgPSB7eDotMSwgeTotMX07XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIGxldCB0bXBDdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5jdHggPSB0bXBDdHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gb2J0YWluIGRyYXdpbmcgY29udGV4dFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgaW1hZ2VzXG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBIVE1MSW1hZ2VFbGVtZW50PigpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdwYXduJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdsYW5jZScsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgna25pZ2h0JywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdzaWx2ZXInLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2dvbGQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2Jpc2hvcCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgncm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgna2luZycsIG5ldyBJbWFnZSgpKTtcblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5waWVjZUltYWdlTWFwKSB7XG4gICAgICAgICAgICB2YWx1ZS5zcmMgPSBcIi4uL21lZGlhL3BpZWNlcy9cIiArIGtleSArIFwiLnBuZ1wiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgUmVjdHNcbiAgICAgICAgdGhpcy5ib2FyZFJlY3QgPSB7IHg6IHRoaXMuY2FudmFzLndpZHRoLzQsIHk6IDAsIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aC8yLCBoZWlnaHQ6IHRoaXMuY2FudmFzLndpZHRoLzIgfTtcbiAgICAgICAgdGhpcy5zcVNpemUgPSB0aGlzLmJvYXJkUmVjdC53aWR0aC85O1xuXG4gICAgICAgIC8vIEhhbmQgUmVjdHNcbiAgICAgICAgbGV0IHRtcEhhbmRSZWN0cyA9IHRoaXMuaW5pdEhhbmRSZWN0TWFwcygpO1xuICAgICAgICB0aGlzLnBsYXllckhhbmRSZWN0TWFwID0gdG1wSGFuZFJlY3RzLnBsYXllcjtcbiAgICAgICAgdGhpcy5vcHBvbmVudEhhbmRSZWN0TWFwID0gdG1wSGFuZFJlY3RzLm9wcG9uZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdEhhbmRSZWN0TWFwcygpOiB7IHBsYXllcjogTWFwPFBpZWNlcm9sZSwgUmVjdD4sIG9wcG9uZW50OiBNYXA8UGllY2Vyb2xlLCBSZWN0PiB9IHtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSB0aGlzLmJvYXJkUmVjdC54ICsgdGhpcy5ib2FyZFJlY3Qud2lkdGg7XG4gICAgICAgIGxldCBzcSA9IHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgcEhhbmRNYXAgPSBuZXcgTWFwPFBpZWNlcm9sZSwgUmVjdD4oKTtcbiAgICAgICAgbGV0IG9IYW5kTWFwID0gbmV3IE1hcDxQaWVjZXJvbGUsIFJlY3Q+KCk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncGF3bicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdyb29rJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6c3EqMiwgeTpzcSoyLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnNxKjMsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnNxKjMsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6c3EqMiwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnNxLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpzcSoyLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncm9vaycsIHsgeDpzcSwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHBsYXllcjogcEhhbmRNYXAsIG9wcG9uZW50OiBvSGFuZE1hcCB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXcoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdzbGF0ZWdyZXknO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmhpZ2hsaWdodExhc3RNb3ZlKCk7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUGllY2VTcSkge1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRTcXVhcmUoJ21pbnRjcmVhbScsIHRoaXMuc2VsZWN0ZWRQaWVjZVNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGVSYW5rTGFiZWxzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPCA5OyBmKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgOTsgcisrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UoIHtmaWxlOmYsIHJhbms6cn0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhd0hhbmQoJ2JsYWNrJyk7IFxuICAgICAgICB0aGlzLmRyYXdIYW5kKCd3aGl0ZScpO1xuXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0RyYWdnaW5nUGllY2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0JvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdzaWx2ZXInO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDw9IDk7IGYrKykge1xuICAgICAgICAgICAgbGV0IGkgPSBmKnRoaXMuc3FTaXplICsgdGhpcy5ib2FyZFJlY3QueDtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oaSwgdGhpcy5ib2FyZFJlY3QueSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8oaSwgdGhpcy5ib2FyZFJlY3QueSArIHRoaXMuYm9hcmRSZWN0LmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPD0gOTsgcisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHIqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkUmVjdC55O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyh0aGlzLmJvYXJkUmVjdC54LCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkUmVjdC54ICsgdGhpcy5ib2FyZFJlY3Qud2lkdGgsIGkpO1xuICAgICAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0ZpbGVSYW5rTGFiZWxzKCk6IHZvaWQge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICcxNXB4IGFyaWFsJ1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IDggLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggKGxhYmVsKzEpLnRvU3RyaW5nKCksIHRoaXMuYm9hcmRSZWN0LnggLSAxMywgdGhpcy5zcVNpemUvMisoaSppbnRlcnZhbCkgKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICd0b3AnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoICgxMCAtIChsYWJlbCsxKSkudG9TdHJpbmcoKSwgdGhpcy5ib2FyZFJlY3QueCArIHRoaXMuc3FTaXplLzIrKGkqaW50ZXJ2YWwpLCB0aGlzLmJvYXJkUmVjdC5oZWlnaHQgKyA0ICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdQaWVjZShzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBwaWVjZTogUGllY2V8dW5kZWZpbmVkID0gdGhpcy5ib2FyZC5nZXRQaWVjZShzcSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQocGllY2UudHlwZSk7XG4gICAgICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsgcGllY2UudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5nZXRQb3NBdFNxdWFyZShzcS5maWxlLCBzcS5yYW5rKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUGllY2VTcSAmJiB0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNTcUVxdWFsKHRoaXMuc2VsZWN0ZWRQaWVjZVNxLCBzcSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgcG9zLngsIHBvcy55LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgcG9zLngsIHBvcy55LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0RyYWdnaW5nUGllY2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KHRoaXMuZHJhZ2dpbmdQaWVjZS50eXBlKTtcbiAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyB0aGlzLmRyYWdnaW5nUGllY2UudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgeCA9IHRoaXMuZHJhZ2dpbmdQaWVjZVBvcy54IC0gdGhpcy5zcVNpemUvMjtcbiAgICAgICAgICAgIGxldCB5ID0gdGhpcy5kcmFnZ2luZ1BpZWNlUG9zLnkgLSB0aGlzLnNxU2l6ZS8yO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgeCwgeSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQoY29sb3IpO1xuICAgICAgICAgICAgaWYgKCFoYW5kKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdib3R0b20nO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBsYXllckhhbmRSZWN0TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gaGFuZC5nZXROdW1PZlBpZWNlcyhrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcCkge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IGhhbmQuZ2V0TnVtT2ZQaWVjZXMoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bU9mUGllY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IG51bU9mUGllY2VzID09PSAwID8gMC4yIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGlnaGxpZ2h0SGFuZFBpZWNlKHN0eWxlOiBzdHJpbmcsIHBpZWNlOiBQaWVjZSkge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgbGV0IHBpZWNlcm9sZSA9IFBpZWNldHlwZVRvUm9sZShwaWVjZS50eXBlKTtcbiAgICAgICAgbGV0IHBpZWNlUmVjdDogUmVjdHx1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgcGllY2VSZWN0ID0gdGhpcy5wbGF5ZXJIYW5kUmVjdE1hcC5nZXQocGllY2Vyb2xlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBpZWNlUmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcC5nZXQocGllY2Vyb2xlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGllY2VSZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChwaWVjZVJlY3QueCwgcGllY2VSZWN0LnksIHBpZWNlUmVjdC53aWR0aCwgcGllY2VSZWN0LmhlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZ2hsaWdodExhc3RNb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0TW92ZSkge1xuICAgICAgICAgICAgbGV0IHN0eWxlID0gXCIjOWFhNmIxXCI7XG4gICAgICAgICAgICBpZiAoIGlzTW92ZSh0aGlzLmxhc3RNb3ZlKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFNxdWFyZShzdHlsZSwgdGhpcy5sYXN0TW92ZS5zcmMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggaXNEcm9wKHRoaXMubGFzdE1vdmUpICl7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRIYW5kUGllY2Uoc3R5bGUsIHRoaXMubGFzdE1vdmUucGllY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRTcXVhcmUoc3R5bGUsIHRoaXMubGFzdE1vdmUuZGVzdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGlnaGxpZ2h0U3F1YXJlKHN0eWxlOiBzdHJpbmcsIHNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IGZpbGUgPSBzcS5maWxlO1xuICAgICAgICBsZXQgcmFuayA9IHNxLnJhbms7XG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSBcIndoaXRlXCIpIHtcbiAgICAgICAgICAgIGZpbGUgPSA4IC0gZmlsZTtcbiAgICAgICAgICAgIHJhbmsgPSA4IC0gcmFuaztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5ib2FyZFJlY3QueCArIGZpbGUqdGhpcy5zcVNpemUsIFxuICAgICAgICAgICAgcmFuayp0aGlzLnNxU2l6ZSxcbiAgICAgICAgICAgIHRoaXMuc3FTaXplLFxuICAgICAgICAgICAgdGhpcy5zcVNpemUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0ludmVydGVkKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh4ICsgd2lkdGgvMiwgeSArIGhlaWdodC8yKTtcbiAgICAgICAgdGhpcy5jdHgucm90YXRlKE1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoIC0oeCArIHdpZHRoLzIpLCAtKHkgKyBoZWlnaHQvMikgKTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNxdWFyZUF0UG9zKHg6IG51bWJlciwgeTogbnVtYmVyKTogU3F1YXJlfHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBmaWxlID0gTWF0aC5mbG9vciggKHggLSB0aGlzLmJvYXJkUmVjdC54KS90aGlzLnNxU2l6ZSApO1xuICAgICAgICBsZXQgcmFuayA9IE1hdGguZmxvb3IoeS90aGlzLnNxU2l6ZSk7XG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSBcIndoaXRlXCIpIHtcbiAgICAgICAgICAgIGZpbGUgPSA4IC0gZmlsZTtcbiAgICAgICAgICAgIHJhbmsgPSA4IC0gcmFuaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsZSA8IDAgfHwgcmFuayA8IDAgfHwgZmlsZSA+IHRoaXMuYm9hcmQuZ2V0RGltZW5zaW9ucygpLmNvbHMgfHwgcmFuayA+IHRoaXMuYm9hcmQuZ2V0RGltZW5zaW9ucygpLnJvd3MpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZmlsZSwgcmFuayB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb3NBdFNxdWFyZShmaWxlOiBudW1iZXIsIHJhbms6IG51bWJlcik6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0ge1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gXCJ3aGl0ZVwiKSB7XG4gICAgICAgICAgICBmaWxlID0gOCAtIGZpbGU7XG4gICAgICAgICAgICByYW5rID0gOCAtIHJhbms7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHggPSB0aGlzLmJvYXJkUmVjdC54ICsgKGZpbGUgKiB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIGxldCB5ID0gcmFuayAqIHRoaXMuc3FTaXplO1xuICAgICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNlbGVjdGVkUGllY2UoKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRQaWVjZVNxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5nZXRQaWVjZSh0aGlzLnNlbGVjdGVkUGllY2VTcSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U2VsZWN0ZWRQaWVjZVNxKHNxOiBTcXVhcmUpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFBpZWNlU3EgPSBzcTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXRTZWxlY3RlZFBpZWNlU3EoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRQaWVjZVNxID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREcmFnZ2luZ1BpZWNlKHBpZWNlOiBQaWVjZSwgeD86IG51bWJlciwgeT86IG51bWJlcikge1xuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSBwaWVjZTtcbiAgICAgICAgaWYgKHggJiYgeSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlUG9zID0ge3g6IHgsIHk6IHl9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlc2V0RHJhZ2dpbmdQaWVjZSgpIHtcbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREcmFnZ2luZ1BpZWNlUG9zKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZVBvcyA9IHt4OiB4LCB5OiB5fTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TGFzdE1vdmUoYXJnOiBNb3ZlfERyb3ApIHtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IGFyZztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RHJhZ2dpbmdQaWVjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhZ2dpbmdQaWVjZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGdldEJvYXJkUmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRSZWN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQbGF5ZXJIYW5kUmVjdE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZFJlY3RNYXA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9wcG9uZW50SGFuZFJlY3RNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wcG9uZW50SGFuZFJlY3RNYXA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNlbGVjdGVkUGllY2VTcSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRQaWVjZVNxO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcmllbnRhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb247XG4gICAgfVxufSIsImltcG9ydCB7IFBpZWNlcm9sZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhhbmQge1xuICAgIHByaXZhdGUgcGllY2VzOiBNYXA8UGllY2Vyb2xlLCBudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGllY2VzID0gbmV3IE1hcDxQaWVjZXJvbGUsIG51bWJlcj4oKTtcbiAgICAgICAgdGhpcy5lbXB0eSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBlbXB0eSgpIHtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdwYXduJywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgnbGFuY2UnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdrbmlnaHQnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdzaWx2ZXInLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdnb2xkJywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgnYmlzaG9wJywgMCk7XG4gICAgICAgIHRoaXMucGllY2VzLnNldCgncm9vaycsIDApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXROdW1PZlBpZWNlcyhwaWVjZTogUGllY2Vyb2xlKTogbnVtYmVyfHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpZWNlcy5nZXQocGllY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBwaWVjZSB0byBoYW5kXG4gICAgICogQHBhcmFtIHBpZWNlIFxuICAgICAqIEBwYXJhbSBudW0gT3B0aW9uYWwgLSBJZiBub3Qgc3VwcGxpZWQsIDEgaXMgdGhlIGRlZmF1bHRcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIG5vdFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRQaWVjZShwaWVjZTogUGllY2Vyb2xlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBjdXJBbW91bnQgPSB0aGlzLnBpZWNlcy5nZXQocGllY2UpO1xuICAgICAgICBpZiAoY3VyQW1vdW50ICE9PSB1bmRlZmluZWQpIHsgLy8gTWFrZSBzdXJlIHRoZSBjdXJyZW50IGFtb3VudCBpcyBub3QgdW5kZWZpbmVkXG4gICAgICAgICAgICB0aGlzLnBpZWNlcy5zZXQocGllY2UsIGN1ckFtb3VudCArIG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHBpZWNlIHRvIGhhbmRcbiAgICAgKiBAcGFyYW0gcGllY2UgXG4gICAgICogQHBhcmFtIG51bSBPcHRpb25hbCAtIElmIG5vdCBzdXBwbGllZCwgMSBpcyB0aGUgZGVmYXVsdFxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcmVtb3ZlUGllY2UocGllY2U6IFBpZWNlcm9sZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gdGhpcy5waWVjZXMuZ2V0KHBpZWNlKTtcbiAgICAgICAgaWYgKCFjdXJBbW91bnQgfHwgY3VyQW1vdW50IDw9IDApIHsgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KHBpZWNlLCBjdXJBbW91bnQgLSBudW0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59IiwiaW1wb3J0IFNob0dVSSBmcm9tIFwiLi9zaG9ndWlcIjtcbmltcG9ydCB7IFNxdWFyZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmxldCBzaG9ndWkgPSBuZXcgU2hvR1VJKHtvbk1vdmVQaWVjZTogb25QaWVjZU1vdmV9KTtcblxuZnVuY3Rpb24gb25QaWVjZU1vdmUoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAvL2NvbnNvbGUubG9nKHNyY1NxLmZpbGUgKyBcIiwgXCIgKyBzcmNTcS5yYW5rICsgXCIgLS0+IFwiICsgZGVzdFNxLmZpbGUgKyBcIiwgXCIgKyBkZXN0U3EucmFuayk7XG4gICAgcmV0dXJuIHRydWU7XG59IiwiaW1wb3J0IEdVSSBmcm9tIFwiLi9ndWlcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEhhbmQgZnJvbSBcIi4vaGFuZFwiO1xuaW1wb3J0IHsgQ29uZmlnLCBQaWVjZSwgU3F1YXJlLCBDb2xvciB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBpc1Bvc0luc2lkZVJlY3QsIGlzU3FFcXVhbCwgUGllY2V0eXBlVG9Sb2xlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG4vKipcbiAqIENvbnRyb2xsZXIvTWFuYWdlciBmb3IgdGhlIFNob0dVSSBhcHBsaWNhdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaG9HVUkge1xuICAgIHByaXZhdGUgY29uZmlnOiBDb25maWc7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBoYW5kTWFwOiBNYXA8Q29sb3IsIEhhbmQ+O1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb25maWcpIHtcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcblxuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIHRoaXMuaGFuZE1hcCA9IG5ldyBNYXA8Q29sb3IsIEhhbmQ+KCk7XG4gICAgICAgIHRoaXMuaGFuZE1hcC5zZXQoJ2JsYWNrJywgbmV3IEhhbmQoKSk7XG4gICAgICAgIHRoaXMuaGFuZE1hcC5zZXQoJ3doaXRlJywgbmV3IEhhbmQoKSk7XG4gICAgICAgIHRoaXMuYm9hcmQuc2V0U3RhcnRpbmdQb3NpdGlvbigpO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTIwMDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMud2lkdGgvMiArIDIwO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgdGhpcy5oYW5kTWFwLCB0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzZWxmLm9uUmlnaHRDbGljayhlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdHYW1lKCkge1xuICAgICAgICB0aGlzLmd1aS5kcmF3KCk7XG4gICAgICAgIC8vdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKFwiZ3JlZW5cIiwge2ZpbGU6IDUsIHJhbms6NX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZVBpZWNlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbk1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgICAgIHRoaXMuZ3VpLnNldExhc3RNb3ZlKCB7c3JjOiBzcmNTcSwgZGVzdDogZGVzdFNxfSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik7XG4gICAgICAgICAgICBpZiAoIWhhbmQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ib2FyZC5hZGRQaWVjZShwaWVjZSwgc3EpO1xuICAgICAgICBoYW5kLnJlbW92ZVBpZWNlKCBQaWVjZXR5cGVUb1JvbGUocGllY2UudHlwZSkgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdFBpZWNlKHNxOiBTcXVhcmUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZy5vblNlbGVjdFBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGxldCBwaWVjZSA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWcub25TZWxlY3RQaWVjZShwaWVjZSwgc3EpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuc2V0U2VsZWN0ZWRQaWVjZVNxKHNxKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlc2VsZWN0UGllY2UoKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZFBpZWNlU3EgPSB0aGlzLmd1aS5nZXRTZWxlY3RlZFBpZWNlU3EoKTtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFBpZWNlU3EpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uRGVzZWxlY3RQaWVjZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAvL3RoaXMuY29uZmlnLm9uRGVzZWxlY3RQaWVjZShwaWVjZSwgc3F1YXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLnJlc2V0U2VsZWN0ZWRQaWVjZVNxKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGFydERyYWdnaW5nUGllY2UocGllY2U6IFBpZWNlLCBtb3VzZVg6IG51bWJlciwgbW91c2VZOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5ndWkuc2V0RHJhZ2dpbmdQaWVjZShwaWVjZSwgbW91c2VYLCBtb3VzZVkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZFJlY3QoKSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICBsZXQgY2xpY2tlZFNxOiBTcXVhcmV8dW5kZWZpbmVkID0gdGhpcy5ndWkuZ2V0U3F1YXJlQXRQb3MobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgICAgIGlmICghY2xpY2tlZFNxKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgcGllY2UgPSB0aGlzLmJvYXJkLmdldFBpZWNlKGNsaWNrZWRTcSk7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWRTcSA9IHRoaXMuZ3VpLmdldFNlbGVjdGVkUGllY2VTcSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCFzZWxlY3RlZFNxIHx8IGlzU3FFcXVhbChzZWxlY3RlZFNxLCBjbGlja2VkU3EpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGllY2UoY2xpY2tlZFNxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RHJhZ2dpbmdQaWVjZShwaWVjZSwgbW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTcSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTcS5maWxlICE9PSBjbGlja2VkU3EuZmlsZSB8fCBzZWxlY3RlZFNxLnJhbmsgIT09IGNsaWNrZWRTcS5yYW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVQaWVjZShzZWxlY3RlZFNxLCBjbGlja2VkU3EpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFBpZWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5yZXNldERyYWdnaW5nUGllY2UoKTtcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RQaWVjZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRSZWN0TWFwKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldCh0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhbmQ/LmdldE51bU9mUGllY2VzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RHJhZ2dpbmdQaWVjZSh7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX0sIG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRSZWN0TWFwKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQob3Bwb25lbnRDb2xvcik7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kPy5nZXROdW1PZlBpZWNlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERyYWdnaW5nUGllY2Uoe3R5cGU6IGtleSwgY29sb3I6IG9wcG9uZW50Q29sb3J9LCBtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VVcChldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkUmVjdCgpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5nZXRTcXVhcmVBdFBvcyhtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgICAgICAgICAgaWYgKCFzcU92ZXIpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFNxID0gdGhpcy5ndWkuZ2V0U2VsZWN0ZWRQaWVjZVNxKCk7XG4gICAgICAgICAgICBsZXQgZHJhZ1BpZWNlID0gdGhpcy5ndWkuZ2V0RHJhZ2dpbmdQaWVjZSgpO1xuICAgICAgICAgICAgaWYgKGRyYWdQaWVjZSAmJiBzZWxlY3RlZFNxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU3FFcXVhbChzZWxlY3RlZFNxLCBzcU92ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3VpLnJlc2V0RHJhZ2dpbmdQaWVjZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHNlbGVjdGVkU3EsIHNxT3Zlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RQaWVjZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZHJhZ1BpZWNlICYmICFzZWxlY3RlZFNxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcm9wUGllY2UoZHJhZ1BpZWNlLCBzcU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZXNlbGVjdFBpZWNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ndWkucmVzZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoIHRoaXMuZ3VpLmdldERyYWdnaW5nUGllY2UoKSApIHtcbiAgICAgICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgICAgIHRoaXMuZ3VpLnNldERyYWdnaW5nUGllY2VQb3MobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJpZ2h0Q2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgdGhpcy5ndWkucmVzZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgICAgIHRoaXMuZGVzZWxlY3RQaWVjZSgpO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBSZWN0LCBTcXVhcmUsIFBpZWNldHlwZSwgUGllY2Vyb2xlLCBNb3ZlLCBEcm9wIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHNvbWV0aGluZyBpcyBpbnNpZGUgdGhlIFJlY3RcbiAqIEBwYXJhbSByZWN0IC0gUmVjdGFuZ2xlIHRvIGNoZWNrIGlmIHBvcyBpcyBpbnNpZGVcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIG9mIHBvc2l0aW9uXG4gKiBAcGFyYW0geSAtIFkgY29vcmRpYW50ZSBvZiBwb3NpdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQb3NJbnNpZGVSZWN0KHJlY3Q6IFJlY3QsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKHggPCByZWN0LnggfHwgeCA+PSByZWN0LnggKyByZWN0LndpZHRoIHx8XG4gICAgICAgIHkgPCByZWN0LnkgfHwgeSA+PSByZWN0LnkgKyByZWN0LmhlaWdodCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgdHdvIHNxdWFyZXMgYXJlIHRoZSBzYW1lXG4gKiBAcGFyYW0ge1NxdWFyZX0gc3ExXG4gKiBAcGFyYW0ge1NxdWFyZX0gc3EyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NxRXF1YWwoc3ExOiBTcXVhcmUsIHNxMjogU3F1YXJlKSB7XG4gICAgaWYgKHNxMS5maWxlID09PSBzcTIuZmlsZSAmJiBzcTEucmFuayA9PT0gc3EyLnJhbmspIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTW92ZShhcmc6IGFueSk6IGFyZyBpcyBNb3ZlIHtcbiAgICByZXR1cm4gYXJnICYmIGFyZy5zcmMgJiYgYXJnLmRlc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Ryb3AoYXJnOiBhbnkpOiBhcmcgaXMgRHJvcCB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcucGllY2UgJiYgYXJnLmRlc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQaWVjZXR5cGVUb1JvbGUocGllY2V0eXBlOiBQaWVjZXR5cGUpOiBQaWVjZXJvbGUge1xuICAgIHN3aXRjaCAocGllY2V0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgICBjYXNlICcrcGF3bic6ICAgXG4gICAgICAgICAgICByZXR1cm4gJ3Bhd24nO1xuICAgICAgICBjYXNlICdsYW5jZSc6XG4gICAgICAgIGNhc2UgJytsYW5jZSc6XG4gICAgICAgICAgICByZXR1cm4gJ2xhbmNlJztcbiAgICAgICAgY2FzZSAna25pZ2h0JzpcbiAgICAgICAgY2FzZSAnK2tuaWdodCc6XG4gICAgICAgICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgICAgIGNhc2UgJ3NpbHZlcic6XG4gICAgICAgIGNhc2UgJytzaWx2ZXInOlxuICAgICAgICAgICAgcmV0dXJuICdzaWx2ZXInO1xuICAgICAgICBjYXNlICdnb2xkJzpcbiAgICAgICAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICAgIGNhc2UgJytiaXNob3AnOlxuICAgICAgICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgICAgICBjYXNlICdyb29rJzpcbiAgICAgICAgY2FzZSAnK3Jvb2snOlxuICAgICAgICAgICAgcmV0dXJuICdyb29rJztcbiAgICAgICAgY2FzZSAna2luZyc6XG4gICAgICAgICAgICByZXR1cm4gJ2tpbmcnO1xuICAgIH1cbn0iXX0=
