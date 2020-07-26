(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
class Board {
    constructor() {
        this.pieceList = new Map();
        this.playerHands = new Map();
        let blackHand = new Map();
        let whiteHand = new Map();
        blackHand.set('pawn', 0);
        blackHand.set('lance', 0);
        blackHand.set('knight', 0);
        blackHand.set('silver', 0);
        blackHand.set('gold', 0);
        blackHand.set('bishop', 0);
        blackHand.set('rook', 0);
        whiteHand.set('pawn', 0);
        whiteHand.set('lance', 0);
        whiteHand.set('knight', 0);
        whiteHand.set('silver', 0);
        whiteHand.set('gold', 0);
        whiteHand.set('bishop', 0);
        whiteHand.set('rook', 0);
        this.playerHands.set('black', blackHand);
        this.playerHands.set('white', whiteHand);
    }
    setPosition(sfenBoardField) {
        let rows = sfenBoardField.split('/');
        let curSquareIndex = 0;
        let isPromote = false;
        for (let r of rows) {
            for (let char of r) {
                if (isNaN(Number(char))) {
                    if (char === '+') {
                        isPromote = true;
                        continue;
                    }
                    let color = char.toLowerCase() === char ? 'white' : 'black';
                    let pType = util_1.sfen2Piecetype(char);
                    if (!pType) {
                        throw new Error('Failed to retrieve Piecetype from SFEN for character: ' + char);
                    }
                    this.addPiece({ type: pType, color: color, promoted: isPromote }, types_1.allSquares[curSquareIndex]);
                    curSquareIndex++;
                }
                else {
                    curSquareIndex = curSquareIndex + Number(char);
                }
                isPromote = false;
            }
        }
    }
    movePiece(fromSq, toSq) {
        if (fromSq === toSq)
            return false;
        let piece = this.pieceList.get(fromSq);
        if (piece) {
            this.pieceList.set(toSq, piece);
            this.pieceList.delete(fromSq);
            return true;
        }
        return false;
    }
    getPiece(sq) {
        return this.pieceList.get(sq);
    }
    addPiece(piece, sq) {
        this.pieceList.set(sq, piece);
    }
    dropPiece(color, piecetype, sq, num = 1) {
        if (this.removeFromHand(color, piecetype, num)) {
            this.pieceList.set(sq, { type: piecetype, color: color });
            return true;
        }
        return false;
    }
    add2Hand(color, piecetype, num = 1) {
        let hand = this.playerHands.get(color);
        let curAmount = hand === null || hand === void 0 ? void 0 : hand.get(piecetype);
        if (curAmount !== undefined) {
            hand === null || hand === void 0 ? void 0 : hand.set(piecetype, curAmount + num);
            return true;
        }
        return false;
    }
    removeFromHand(color, piecetype, num = 1) {
        let hand = this.playerHands.get(color);
        let curAmount = hand === null || hand === void 0 ? void 0 : hand.get(piecetype);
        if (!curAmount || curAmount - num < 0) {
            return false;
        }
        hand === null || hand === void 0 ? void 0 : hand.set(piecetype, curAmount - num);
        return true;
    }
    getNumPiecesInHand(color, piecetype) {
        var _a;
        return (_a = this.playerHands.get(color)) === null || _a === void 0 ? void 0 : _a.get(piecetype);
    }
}
exports.default = Board;

},{"./types":5,"./util":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class GUI {
    constructor(board, canvas) {
        this.board = board;
        this.orientation = 'black';
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
        this.pieceImageMap.set('+pawn', new Image());
        this.pieceImageMap.set('lance', new Image());
        this.pieceImageMap.set('+lance', new Image());
        this.pieceImageMap.set('knight', new Image());
        this.pieceImageMap.set('+knight', new Image());
        this.pieceImageMap.set('silver', new Image());
        this.pieceImageMap.set('+silver', new Image());
        this.pieceImageMap.set('gold', new Image());
        this.pieceImageMap.set('bishop', new Image());
        this.pieceImageMap.set('+bishop', new Image());
        this.pieceImageMap.set('rook', new Image());
        this.pieceImageMap.set('+rook', new Image());
        this.pieceImageMap.set('king', new Image());
        for (let [key, value] of this.pieceImageMap) {
            value.src = '../media/pieces/' + key + '.png';
        }
        this.boardBounds = { x: this.canvas.width / 4, y: 15, width: this.canvas.width / 2, height: this.canvas.width / 2 };
        this.sqSize = this.boardBounds.width / 9;
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandBounds = tmpHandRects.player;
        this.opponentHandBounds = tmpHandRects.opponent;
    }
    initHandRectMaps() {
        let padding = this.boardBounds.x + this.boardBounds.width;
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
            let i = f * this.sqSize + this.boardBounds.x;
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.boardBounds.y);
            this.ctx.lineTo(i, this.boardBounds.y + this.boardBounds.height);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        for (let r = 0; r <= 9; r++) {
            let i = r * this.sqSize + this.boardBounds.y;
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardBounds.x, i);
            this.ctx.lineTo(this.boardBounds.x + this.boardBounds.width, i);
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
            this.ctx.fillText(String.fromCharCode(label + 1 + 96), this.boardBounds.x + this.boardBounds.width + 3, this.boardBounds.y + this.sqSize / 2 + (i * interval));
            this.ctx.textBaseline = 'top';
            this.ctx.fillText((10 - (label + 1)).toString(), this.boardBounds.x + (this.sqSize / 2) + (i * interval), 0);
        }
    }
    drawPiece(piece, x, y) {
        let key = piece.type;
        if (piece.promoted) {
            key = '+' + key;
        }
        let pieceImg = this.pieceImageMap.get(key);
        if (!pieceImg) {
            throw new Error("Failed to load piece image: " + key);
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
            let pos = this.square2Pos(sq);
            this.drawPiece(piece, pos.x, pos.y);
            return true;
        }
        return false;
    }
    drawHand(color) {
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillStyle = 'white';
        if (color === this.orientation) {
            for (let [key, value] of this.playerHandBounds) {
                let numOfPieces = this.board.getNumPiecesInHand(color, key);
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
            for (let [key, value] of this.opponentHandBounds) {
                let numOfPieces = this.board.getNumPiecesInHand(color, key);
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
    highlightSquare(style, type, sq, alpha) {
        if (type === 'hidden')
            return false;
        let pos = this.square2Pos(sq);
        this.ctx.save();
        this.ctx.fillStyle = style;
        this.ctx.strokeStyle = style;
        if (alpha) {
            this.ctx.globalAlpha = alpha;
        }
        switch (type) {
            case 'fill':
                this.ctx.fillRect(pos.x, pos.y, this.sqSize, this.sqSize);
                break;
            case 'outline':
                this.ctx.lineWidth = this.canvas.width / 200;
                this.ctx.strokeRect(pos.x + 4, pos.y + 4, this.sqSize - 8, this.sqSize - 8);
                break;
            case 'circle':
                this.ctx.lineWidth = this.canvas.width / 500;
                this.ctx.beginPath();
                this.ctx.arc(pos.centerX, pos.centerY, this.sqSize / 2 - 4, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
            default:
                return false;
        }
        this.ctx.restore();
        return true;
    }
    drawArrow(style, fromx, fromy, tox, toy) {
        this.arrowCtx.save();
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
        this.arrowCtx.restore();
    }
    drawSquareArrow(arrow) {
        let toSqPos = this.square2Pos(arrow.toSq);
        let fromSqPos = this.square2Pos(arrow.fromSq);
        if (arrow.toSq !== arrow.fromSq) {
            this.drawArrow(arrow.style, fromSqPos.centerX, fromSqPos.centerY, toSqPos.centerX, toSqPos.centerY);
        }
        else {
            this.arrowCtx.strokeStyle = arrow.style;
            this.arrowCtx.lineWidth = this.canvas.width / 500;
            this.arrowCtx.beginPath();
            this.arrowCtx.arc(toSqPos.centerX, toSqPos.centerY, this.sqSize / 2 - 4, 0, 2 * Math.PI);
            this.arrowCtx.stroke();
        }
    }
    drawHandArrow(arrow) {
        let rect;
        if (arrow.color === this.orientation) {
            rect = this.playerHandBounds.get(arrow.piecetype);
        }
        else {
            rect = this.opponentHandBounds.get(arrow.piecetype);
        }
        if (!rect)
            return false;
        if (!arrow.toSq)
            return false;
        let toSqPos = this.square2Pos(arrow.toSq);
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
        let col = Math.floor((x - this.boardBounds.x) / this.sqSize);
        let row = Math.floor((y - this.boardBounds.y) / this.sqSize);
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        if (col < 0 || row < 0 || col > 9 - 1 || row > 9 - 1) {
            return undefined;
        }
        return types_1.allSquares[9 * row + col];
    }
    square2Pos(sq) {
        let col = 9 - parseInt(sq[0]);
        let row = sq.charCodeAt(1) - 97;
        if (this.orientation === 'white') {
            col = 8 - col;
            row = 8 - row;
        }
        let x = this.boardBounds.x + (col * this.sqSize);
        let y = this.boardBounds.y + row * this.sqSize;
        let centerX = x + (this.sqSize / 2);
        let centerY = y + (this.sqSize / 2);
        return { x, y, centerX, centerY };
    }
    getBoardBounds() {
        return this.boardBounds;
    }
    getSqSize() {
        return this.sqSize;
    }
    getPlayerHandBounds() {
        return this.playerHandBounds;
    }
    getOpponentHandBounds() {
        return this.opponentHandBounds;
    }
    getOrientation() {
        return this.orientation;
    }
}
exports.default = GUI;

},{"./types":5}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shogui_1 = __importDefault(require("./shogui"));
let shogui = new shogui_1.default({ onMovePiece: myPieceMove, onDropPiece: myDropPiece });
shogui.setPosition('lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL');
function myPieceMove(srcSq, destSq) {
    shogui.clearHighlights();
    shogui.addHighlight({ style: 'lightgrey', type: 'fill', sq: srcSq, });
    shogui.addHighlight({ style: 'lightgrey', type: 'fill', sq: destSq, });
    console.log(srcSq + "-->" + destSq);
    return true;
}
function myDropPiece(color, piecetype, sq) {
    shogui.clearHighlights();
    shogui.addHighlight({ style: 'lightgrey', type: 'fill', sq: sq });
    return true;
}

},{"./shogui":4}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gui_1 = __importDefault(require("./gui"));
const board_1 = __importDefault(require("./board"));
const types_1 = require("./types");
const util_1 = require("./util");
class ShoGUI {
    constructor(config) {
        let self = this;
        this.config = config;
        this.board = new board_1.default();
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width / 2 + 20;
        this.gui = new gui_1.default(this.board, this.canvas);
        this.arrowList = [];
        this.highlightList = [];
        this.canvas.addEventListener('mousedown', function (e) {
            self.onMouseDown(e);
            window.requestAnimationFrame(() => self.refreshCanvas());
        });
        window.addEventListener('mouseup', function (e) {
            self.onMouseUp(e);
            window.requestAnimationFrame(() => self.refreshCanvas());
        });
        window.addEventListener('mousemove', function (e) {
            self.onMouseMove(e);
            window.requestAnimationFrame(() => self.refreshCanvas());
        });
        window.addEventListener('keydown', function (e) {
            self.gui.flipBoard();
            window.requestAnimationFrame(() => self.refreshCanvas());
        });
        this.canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        document.body.appendChild(this.canvas);
        window.onload = function () {
            window.requestAnimationFrame(() => self.refreshCanvas());
        };
    }
    setPosition(sfen) {
        let sfenArr = sfen.split(' ');
        let sfenBoard = sfenArr[0];
        let sfenHand = sfenArr[2];
        this.board.setPosition(sfenBoard);
        if (!sfenHand) {
            return;
        }
        let amt = 1;
        for (let char of sfenHand) {
            let ptype = util_1.sfen2Piecetype(char);
            if (!isNaN(Number(char))) {
                amt = Number(char);
                continue;
            }
            else {
                if (!ptype) {
                    throw new Error('ERROR: Cannot get piecetype from sfen character ' + char);
                }
                if (char.toUpperCase() === char) {
                    this.board.add2Hand('black', ptype, amt);
                }
                else if (char.toLowerCase() === char) {
                    this.board.add2Hand('white', ptype, amt);
                }
                amt = 1;
            }
        }
    }
    flipBoard() {
        this.gui.flipBoard();
    }
    isSquareHighlighted(sq) {
        for (let tmphighlight of this.highlightList) {
            if (tmphighlight.sq === sq) {
                return true;
            }
        }
        return false;
    }
    addHighlight(highlight) {
        if (!this.isSquareHighlighted(highlight.sq)) {
            this.highlightList.push(highlight);
            return true;
        }
        return false;
    }
    removeHighlight(highlight) {
        let i = 0;
        for (let tmphighlight of this.highlightList) {
            if (tmphighlight.sq === highlight.sq) {
                this.highlightList.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }
    clearHighlights() {
        this.highlightList = [];
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
    dropPiece(color, piecetype, sq, num = 1) {
        let success = true;
        if (typeof this.config.onDropPiece === "function") {
            success = this.config.onDropPiece(color, piecetype, sq);
        }
        if (success) {
            this.board.dropPiece(color, piecetype, sq, num);
        }
    }
    refreshCanvas() {
        this.gui.clearCanvas();
        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight.style, highlight.type, highlight.sq, highlight.alpha);
        }
        if (this.activeSquare) {
            this.gui.highlightSquare('mintcream', 'fill', this.activeSquare);
        }
        this.gui.drawBoard();
        this.gui.drawFileRankLabels();
        for (let i of types_1.allSquares) {
            if (this.activeSquare && this.draggingPiece) {
                if (this.activeSquare === i) {
                    continue;
                }
            }
            this.gui.drawPieceAtSquare(i);
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
            this.gui.drawHandArrow(arrow);
        }
    }
    onMouseDown(event) {
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
        if (util_1.isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let clickedSq = this.gui.pos2Square(mouseX, mouseY);
            if (!clickedSq)
                return;
            let piece = this.board.getPiece(clickedSq);
            if (piece && (!this.activeSquare || this.activeSquare === clickedSq)) {
                this.activeSquare = clickedSq;
                this.draggingPiece = { piece: piece, x: mouseX, y: mouseY };
            }
            else {
                if (this.activeSquare) {
                    if (this.activeSquare !== clickedSq) {
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
        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let numPieces = this.board.getNumPiecesInHand(this.gui.getOrientation(), key);
                if (!numPieces || numPieces <= 0) {
                    return;
                }
                let piece = { type: key, color: this.gui.getOrientation() };
                this.draggingPiece = { piece: piece, x: mouseX, y: mouseY };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                let numPieces = this.board.getNumPiecesInHand(opponentColor, key);
                if (!numPieces || numPieces <= 0) {
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
        if (util_1.isPosInsideRect(this.gui.getBoardBounds(), mouseX, mouseY)) {
            let sqOver = this.gui.pos2Square(mouseX, mouseY);
            if (!sqOver)
                return;
            if (this.draggingPiece && this.activeSquare) {
                if (this.activeSquare === sqOver) {
                    this.draggingPiece = undefined;
                }
                else {
                    this.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            }
            else if (this.draggingPiece && !this.activeSquare) {
                this.dropPiece(this.draggingPiece.piece.color, this.draggingPiece.piece.type, sqOver);
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
            }
            this.currentArrow = undefined;
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
            this.currentArrow = { style: 'blue', fromSq: clickedSq, toSq: clickedSq };
        }
        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                this.currentArrow = { style: 'black', piecetype: key, color: this.gui.getOrientation() };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandBounds()) {
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

},{"./board":1,"./gui":2,"./types":5,"./util":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSquares = exports.files = exports.ranks = void 0;
exports.ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
exports.files = [9, 8, 7, 6, 5, 4, 3, 2, 1];
exports.allSquares = Array.prototype.concat(...exports.ranks.map(r => exports.files.map(c => c + r)));

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHandArrow = exports.isSquareArrow = exports.sfen2Piecetype = exports.arrowsEqual = exports.isPosInsideRect = void 0;
function isPosInsideRect(rect, x, y) {
    if (x < rect.x || x >= rect.x + rect.width ||
        y < rect.y || y >= rect.y + rect.height) {
        return false;
    }
    return true;
}
exports.isPosInsideRect = isPosInsideRect;
function arrowsEqual(arrow1, arrow2) {
    if (isSquareArrow(arrow1) && isSquareArrow(arrow2)) {
        if (arrow1.toSq === arrow2.toSq && arrow1.fromSq === arrow2.fromSq) {
            return true;
        }
    }
    else if (isHandArrow(arrow1) && isHandArrow(arrow2)) {
        if (arrow1.piecetype === arrow2.piecetype && arrow1.color === arrow2.color) {
            if (arrow1.toSq && arrow2.toSq && arrow1.toSq === arrow2.toSq) {
                return true;
            }
        }
    }
    return false;
}
exports.arrowsEqual = arrowsEqual;
function sfen2Piecetype(sfen) {
    switch (sfen.toUpperCase()) {
        case 'P':
        case 'p':
            return 'pawn';
        case 'L':
        case 'l':
            return 'lance';
        case 'N':
        case 'n':
            return 'knight';
        case 'S':
        case 's':
            return 'silver';
        case 'G':
        case 'g':
            return 'gold';
        case 'R':
        case 'r':
            return 'rook';
        case 'B':
        case 'b':
            return 'bishop';
        case 'K':
        case 'k':
            return 'king';
        default:
            return undefined;
    }
}
exports.sfen2Piecetype = sfen2Piecetype;
function isSquareArrow(arg) {
    return arg && arg.style && arg.fromSq && arg.toSq;
}
exports.isSquareArrow = isSquareArrow;
function isHandArrow(arg) {
    return arg && arg.style && arg.piecetype && arg.color && arg.toSq;
}
exports.isHandArrow = isHandArrow;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL21haW4udHMiLCJzcmMvc2hvZ3VpLnRzIiwic3JjL3R5cGVzLnRzIiwic3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLG1DQUFzRTtBQUN0RSxpQ0FBd0M7QUFFeEMsTUFBcUIsS0FBSztJQUl0QjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQUU3RCxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUM3QyxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUU3QyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6QixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFNTSxXQUFXLENBQUMsY0FBc0I7UUFDckMsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBRXRCLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ2hCLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO2dCQUNoQixJQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRztvQkFDdkIsSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO3dCQUNkLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLFNBQVM7cUJBQ1o7b0JBQ0QsSUFBSSxLQUFLLEdBQVUsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ25FLElBQUksS0FBSyxHQUFHLHFCQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsR0FBRyxJQUFJLENBQUMsQ0FBQztxQkFDcEY7b0JBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLEVBQUUsa0JBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUM1RixjQUFjLEVBQUUsQ0FBQztpQkFDcEI7cUJBQU07b0JBQ0gsY0FBYyxHQUFHLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xEO2dCQUNELFNBQVMsR0FBRyxLQUFLLENBQUM7YUFDckI7U0FDSjtJQUNMLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBYyxFQUFFLElBQVk7UUFDekMsSUFBSSxNQUFNLEtBQUssSUFBSTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRWxDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sUUFBUSxDQUFDLEVBQVU7UUFDdEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVksRUFBRSxFQUFVO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sU0FBUyxDQUFDLEtBQVksRUFBRSxTQUFvQixFQUFFLEVBQVUsRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNwRSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVksRUFBRSxTQUFvQixFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ3ZELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLElBQUksU0FBUyxHQUFHLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQ3pCLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsR0FBRyxHQUFHLEVBQUU7WUFDdEMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxjQUFjLENBQUMsS0FBWSxFQUFFLFNBQW9CLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDN0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxHQUFHLEdBQUcsRUFBRTtRQUN0QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sa0JBQWtCLENBQUMsS0FBWSxFQUFFLFNBQW9COztRQUN4RCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywwQ0FBRSxHQUFHLENBQUMsU0FBUyxFQUFFO0lBQ3ZELENBQUM7Q0FDSjtBQWxIRCx3QkFrSEM7Ozs7O0FDckhELG1DQUErRztBQUcvRyxNQUFxQixHQUFHO0lBYXBCLFlBQVksS0FBWSxFQUFFLE1BQXlCO1FBQy9DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksTUFBTSxFQUFFO1lBQ1IsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDckI7YUFBTTtZQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztTQUN2RDtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMzQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxJQUFJLE9BQU8sRUFBRTtZQUNULElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUNuQzthQUFNO1lBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQzdEO1FBR0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUMsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDekMsS0FBSyxDQUFDLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO1NBQ2pEO1FBR0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUd2QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUNwRCxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQzFELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxTQUFTO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRTNDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3JCO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUUzQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjtJQUNMLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUE7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBRTdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLE9BQU8sRUFBRTtnQkFDOUIsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakI7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsQ0FBRSxDQUFDO1lBQ3ZKLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN6RztJQUNMLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBWSxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9DLElBQUksR0FBRyxHQUFXLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2hCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxRQUFRLEdBQStCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3pEO1FBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEU7YUFBTTtZQUNILElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0Q7SUFDTCxDQUFDO0lBRU0saUJBQWlCLENBQUMsRUFBVTtRQUMvQixJQUFJLEtBQUssR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckQsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVk7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzVDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLFdBQVcsS0FBSyxTQUFTO29CQUFFLE9BQU87Z0JBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFFBQVEsR0FBK0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDekQ7Z0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDOUU7U0FDSjthQUFNO1lBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDOUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3hELElBQUksV0FBVyxLQUFLLFNBQVM7b0JBQUUsT0FBTztnQkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELElBQUksUUFBUSxHQUErQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkUsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUN6RDtnQkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlFO1NBQ0o7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLGVBQWUsQ0FBQyxLQUFhLEVBQUUsSUFBWSxFQUFFLEVBQVUsRUFBRSxLQUFjO1FBQzFFLElBQUksSUFBSSxLQUFLLFFBQVE7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNwQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNoQztRQUNELFFBQU8sSUFBSSxFQUFFO1lBQ1QsS0FBSyxNQUFNO2dCQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUQsTUFBTTtZQUVWLEtBQUssU0FBUztnQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLE1BQU07WUFFVixLQUFLLFFBQVE7Z0JBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsR0FBRyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBUVY7Z0JBQ0ksT0FBTyxLQUFLLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBYSxFQUFFLEtBQWEsRUFBRSxLQUFhLEVBQUUsR0FBVyxFQUFFLEdBQVc7UUFDbEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2pELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixLQUFLLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO1FBQ3JCLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDdkMs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O1FBQ1QsS0FBSyxHQUFHO1lBQ0osT0FBTyxRQUFRLENBQUM7UUFDcEIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLEdBQUc7WUFDSixPQUFPLE1BQU0sQ0FBQztRQUNsQixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssR0FBRztZQUNKLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxHQUFHO1lBQ0osT0FBTyxRQUFRLENBQUM7UUFDcEIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLEdBQUc7WUFDSixPQUFPLE1BQU0sQ0FBQztRQUNsQjtZQUNJLE9BQU8sU0FBUyxDQUFDO0tBQ3hCO0FBQ0wsQ0FBQztBQTdCRCx3Q0E2QkM7QUFFRCxTQUFnQixhQUFhLENBQUMsR0FBUTtJQUNsQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztBQUN0RCxDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFnQixXQUFXLENBQUMsR0FBUTtJQUNoQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3RFLENBQUM7QUFGRCxrQ0FFQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFBpZWNlLCBQaWVjZXR5cGUsIFNxdWFyZSwgQ29sb3IsIGFsbFNxdWFyZXMgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgc2ZlbjJQaWVjZXR5cGUgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvYXJkIHtcbiAgICBwcml2YXRlIHBpZWNlTGlzdDogTWFwPFNxdWFyZSwgUGllY2U+O1xuICAgIHByaXZhdGUgcGxheWVySGFuZHM6IE1hcDxDb2xvciwgTWFwPFBpZWNldHlwZSwgbnVtYmVyPiA+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGllY2VMaXN0ID0gbmV3IE1hcDxTcXVhcmUsIFBpZWNlPigpO1xuICAgICAgICB0aGlzLnBsYXllckhhbmRzID0gbmV3IE1hcDxDb2xvciwgTWFwPFBpZWNldHlwZSwgbnVtYmVyPiA+KCk7XG5cbiAgICAgICAgbGV0IGJsYWNrSGFuZCA9IG5ldyBNYXA8UGllY2V0eXBlLCBudW1iZXI+KCk7XG4gICAgICAgIGxldCB3aGl0ZUhhbmQgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuXG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ3Bhd24nLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgnbGFuY2UnLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgna25pZ2h0JywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdnb2xkJywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ2Jpc2hvcCcsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdyb29rJywgMCk7XG5cbiAgICAgICAgd2hpdGVIYW5kLnNldCgncGF3bicsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdrbmlnaHQnLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgnc2lsdmVyJywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgnYmlzaG9wJywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ3Jvb2snLCAwKTtcblxuICAgICAgICB0aGlzLnBsYXllckhhbmRzLnNldCgnYmxhY2snLCBibGFja0hhbmQpO1xuICAgICAgICB0aGlzLnBsYXllckhhbmRzLnNldCgnd2hpdGUnLCB3aGl0ZUhhbmQpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBTZXRzIHRoZSBib2FyZCB0byBzZmVuIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHNmZW5Cb2FyZEZpZWxkIC0gU3Vic3RyaW5nIG9mIHRvdGFsIFNGRU4gdGhhdCBpcyBzb2xleSB0aGUgQm9hcmQgZmllbGRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UG9zaXRpb24oc2ZlbkJvYXJkRmllbGQ6IHN0cmluZykge1xuICAgICAgICBsZXQgcm93cyA9IHNmZW5Cb2FyZEZpZWxkLnNwbGl0KCcvJyk7XG4gICAgICAgIGxldCBjdXJTcXVhcmVJbmRleCA9IDA7XG4gICAgICAgIGxldCBpc1Byb21vdGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCByIG9mIHJvd3MpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXIgb2Ygcikge1xuICAgICAgICAgICAgICAgIGlmICggaXNOYU4oTnVtYmVyKGNoYXIpKSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXIgPT09ICcrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9tb3RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2xvcjogQ29sb3IgPSBjaGFyLnRvTG93ZXJDYXNlKCkgPT09IGNoYXIgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBUeXBlID0gc2ZlbjJQaWVjZXR5cGUoY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIFBpZWNldHlwZSBmcm9tIFNGRU4gZm9yIGNoYXJhY3RlcjogJyArIGNoYXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkUGllY2Uoe3R5cGU6IHBUeXBlLCBjb2xvcjogY29sb3IsIHByb21vdGVkOiBpc1Byb21vdGV9LCBhbGxTcXVhcmVzW2N1clNxdWFyZUluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGN1clNxdWFyZUluZGV4Kys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyU3F1YXJlSW5kZXggPSBjdXJTcXVhcmVJbmRleCArIE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNQcm9tb3RlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZVBpZWNlKGZyb21TcTogU3F1YXJlLCB0b1NxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGZyb21TcSA9PT0gdG9TcSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCBwaWVjZSA9IHRoaXMucGllY2VMaXN0LmdldChmcm9tU3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LnNldCh0b1NxLCBwaWVjZSk7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5kZWxldGUoZnJvbVNxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQaWVjZShzcTogU3F1YXJlKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGllY2VMaXN0LmdldChzcSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHBpZWNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJvcFBpZWNlKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIHNxOiBTcXVhcmUsIG51bSA9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlRnJvbUhhbmQoY29sb3IsIHBpZWNldHlwZSwgbnVtKSkge1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHNxLCB7dHlwZTogcGllY2V0eXBlLCBjb2xvcjogY29sb3J9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkMkhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMucGxheWVySGFuZHMuZ2V0KGNvbG9yKTtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IGhhbmQ/LmdldChwaWVjZXR5cGUpO1xuICAgICAgICBpZiAoY3VyQW1vdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCArIG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUZyb21IYW5kKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGhhbmQgPSB0aGlzLnBsYXllckhhbmRzLmdldChjb2xvcik7XG4gICAgICAgIGxldCBjdXJBbW91bnQgPSBoYW5kPy5nZXQocGllY2V0eXBlKTtcbiAgICAgICAgaWYgKCFjdXJBbW91bnQgfHwgY3VyQW1vdW50IC0gbnVtIDwgMCkgeyBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kPy5zZXQocGllY2V0eXBlLCBjdXJBbW91bnQgLSBudW0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZHMuZ2V0KGNvbG9yKT8uZ2V0KHBpZWNldHlwZSk7XG4gICAgfVxufSIsImltcG9ydCB7IENvbG9yLCBQaWVjZSwgUGllY2V0eXBlLCBSZWN0LCBTcXVhcmUsIGFsbFNxdWFyZXMsIFNxdWFyZUFycm93LCBIYW5kQXJyb3csIEhpZ2hsaWdodCB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIG9yaWVudGF0aW9uOiBDb2xvcjtcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIGFycm93Q2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGFycm93Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBwaWVjZUltYWdlTWFwOiBNYXA8c3RyaW5nLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRCb3VuZHM6IFJlY3Q7XG4gICAgcHJpdmF0ZSBwbGF5ZXJIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcbiAgICBwcml2YXRlIG9wcG9uZW50SGFuZEJvdW5kczogTWFwPFBpZWNldHlwZSwgUmVjdD47XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQsIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ2JsYWNrJztcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgbGV0IHRtcEN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBDdHgpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4ID0gdG1wQ3R4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgbGV0IHRtcGFDdHggPSB0aGlzLmFycm93Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBhQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eCA9IHRtcGFDdHg7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGFycm93IGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCBpbWFnZXNcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJytwYXduJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdsYW5jZScsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJytrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnZ29sZCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrcm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgna2luZycsIG5ldyBJbWFnZSgpKTtcblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5waWVjZUltYWdlTWFwKSB7XG4gICAgICAgICAgICB2YWx1ZS5zcmMgPSAnLi4vbWVkaWEvcGllY2VzLycgKyBrZXkgKyAnLnBuZyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXR1cCBSZWN0c1xuICAgICAgICB0aGlzLmJvYXJkQm91bmRzID0geyB4OiB0aGlzLmNhbnZhcy53aWR0aC80LCB5OiAxNSwgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLzIsIGhlaWdodDogdGhpcy5jYW52YXMud2lkdGgvMiB9O1xuICAgICAgICB0aGlzLnNxU2l6ZSA9IHRoaXMuYm9hcmRCb3VuZHMud2lkdGgvOTtcblxuICAgICAgICAvLyBIYW5kIFJlY3RzXG4gICAgICAgIGxldCB0bXBIYW5kUmVjdHMgPSB0aGlzLmluaXRIYW5kUmVjdE1hcHMoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJIYW5kQm91bmRzID0gdG1wSGFuZFJlY3RzLnBsYXllcjtcbiAgICAgICAgdGhpcy5vcHBvbmVudEhhbmRCb3VuZHMgPSB0bXBIYW5kUmVjdHMub3Bwb25lbnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0SGFuZFJlY3RNYXBzKCk6IHsgcGxheWVyOiBNYXA8UGllY2V0eXBlLCBSZWN0Piwgb3Bwb25lbnQ6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+IH0ge1xuICAgICAgICBsZXQgcGFkZGluZyA9IHRoaXMuYm9hcmRCb3VuZHMueCArIHRoaXMuYm9hcmRCb3VuZHMud2lkdGg7XG4gICAgICAgIGxldCBzcSA9IHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgcEhhbmRNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgUmVjdD4oKTtcbiAgICAgICAgbGV0IG9IYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncGF3bicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdyb29rJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6c3EqMiwgeTpzcSoyLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnNxKjMsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnNxKjMsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6c3EqMiwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnNxLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpzcSoyLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncm9vaycsIHsgeDpzcSwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHBsYXllcjogcEhhbmRNYXAsIG9wcG9uZW50OiBvSGFuZE1hcCB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQ2FudmFzKCkge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnc2xhdGVncmV5JztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuYXJyb3dDYW52YXMud2lkdGgsIHRoaXMuYXJyb3dDYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0JvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdzaWx2ZXInO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAxO1xuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDw9IDk7IGYrKykge1xuICAgICAgICAgICAgbGV0IGkgPSBmKnRoaXMuc3FTaXplICsgdGhpcy5ib2FyZEJvdW5kcy54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkQm91bmRzLnkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGksIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuYm9hcmRCb3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRCb3VuZHMueTtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5ib2FyZEJvdW5kcy54LCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkQm91bmRzLnggKyB0aGlzLmJvYXJkQm91bmRzLndpZHRoLCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ZpbGVSYW5rTGFiZWxzKCk6IHZvaWQge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICcxNXB4IGFyaWFsJ1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IDggLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggU3RyaW5nLmZyb21DaGFyQ29kZShsYWJlbCsxKzk2KSwgdGhpcy5ib2FyZEJvdW5kcy54ICsgdGhpcy5ib2FyZEJvdW5kcy53aWR0aCArIDMsIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuc3FTaXplLzIrKGkqaW50ZXJ2YWwpICk7XG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJztcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCAoMTAgLSAobGFiZWwrMSkpLnRvU3RyaW5nKCksIHRoaXMuYm9hcmRCb3VuZHMueCArICh0aGlzLnNxU2l6ZS8yKSsoaSppbnRlcnZhbCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdQaWVjZShwaWVjZTogUGllY2UsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZyA9IHBpZWNlLnR5cGU7XG4gICAgICAgIGlmIChwaWVjZS5wcm9tb3RlZCkge1xuICAgICAgICAgICAga2V5ID0gJysnICsga2V5O1xuICAgICAgICB9XG4gICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgeCwgeSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3UGllY2VBdFNxdWFyZShzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBwaWVjZTogUGllY2V8dW5kZWZpbmVkID0gdGhpcy5ib2FyZC5nZXRQaWVjZShzcSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgbGV0IHBvcyA9IHRoaXMuc3F1YXJlMlBvcyhzcSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdQaWVjZShwaWVjZSwgcG9zLngsIHBvcy55KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0hhbmQoY29sb3I6IENvbG9yKSB7XG4gICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdib3R0b20nO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBsYXllckhhbmRCb3VuZHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtT2ZQaWVjZXMgPSB0aGlzLmJvYXJkLmdldE51bVBpZWNlc0luSGFuZChjb2xvciwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bU9mUGllY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IG51bU9mUGllY2VzID09PSAwID8gMC4yIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB2YWx1ZS54LCB2YWx1ZS55LCB2YWx1ZS53aWR0aCwgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChudW1PZlBpZWNlcy50b1N0cmluZygpLCB2YWx1ZS54LCB2YWx1ZS55ICsgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZ2hsaWdodFNxdWFyZShzdHlsZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHNxOiBTcXVhcmUsIGFscGhhPzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlID09PSAnaGlkZGVuJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxKTtcblxuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHN0eWxlO1xuICAgICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBwb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvMjAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocG9zLnggKyA0LCBwb3MueSArIDQsIHRoaXMuc3FTaXplIC0gOCwgdGhpcy5zcVNpemUgLSA4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aC81MDA7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbi8qXG4gICAgICAgICAgICBjYXNlICdkb3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhwb3MuY2VudGVyWCwgcG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzgsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4qL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93KHN0eWxlOiBzdHJpbmcsIGZyb214OiBudW1iZXIsIGZyb215OiBudW1iZXIsIHRveDogbnVtYmVyLCB0b3k6IG51bWJlcikge1xuICAgICAgICB0aGlzLmFycm93Q3R4LnNhdmUoKTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0b3kgLSBmcm9teSwgdG94IC0gZnJvbXgpO1xuICAgICAgICBsZXQgcmFkaXVzID0gdGhpcy5hcnJvd0NhbnZhcy53aWR0aC80MDtcbiAgICAgICAgbGV0IHggPSB0b3ggLSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gdG95IC0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IDIqcmFkaXVzLzU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiBcbiAgICAgICAgLy8gRHJhdyBsaW5lXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKGZyb214LCBmcm9teSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuIFxuICAgICAgICAvLyBEcmF3IGFycm93IGhlYWRcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiBcbiAgICAgICAgbGV0IHhjZW50ZXIgPSAodG94ICsgeCkvMjtcbiAgICAgICAgbGV0IHljZW50ZXIgPSAodG95ICsgeSkvMjtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8odG94LCB0b3kpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1NxdWFyZUFycm93KGFycm93OiBTcXVhcmVBcnJvdykge1xuICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy50b1NxKTtcbiAgICAgICAgbGV0IGZyb21TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5mcm9tU3EpO1xuXG4gICAgICAgIGlmIChhcnJvdy50b1NxICE9PSBhcnJvdy5mcm9tU3EpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCBmcm9tU3FQb3MuY2VudGVyWCwgZnJvbVNxUG9zLmNlbnRlclksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBhcnJvdy5zdHlsZTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvNTAwO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguYXJjKHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZLCB0aGlzLnNxU2l6ZS8yIC0gNCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SGFuZEFycm93KGFycm93OiBIYW5kQXJyb3cpIHtcbiAgICAgICAgbGV0IHJlY3Q7XG4gICAgICAgIGlmIChhcnJvdy5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgcmVjdCA9IHRoaXMucGxheWVySGFuZEJvdW5kcy5nZXQoYXJyb3cucGllY2V0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kQm91bmRzLmdldChhcnJvdy5waWVjZXR5cGUpO1xuICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlY3QpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmICghYXJyb3cudG9TcSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy50b1NxKTtcblxuICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgcmVjdC54KyhyZWN0LndpZHRoLzIpLCByZWN0LnkrKHJlY3QuaGVpZ2h0LzIpLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdBcnJvd0NhbnZhcyhhbHBoYTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLmFycm93Q2FudmFzLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxLjA7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdJbnZlcnRlZChpbWFnZTogSFRNTEltYWdlRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcblxuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoeCArIHdpZHRoLzIsIHkgKyBoZWlnaHQvMik7XG4gICAgICAgIHRoaXMuY3R4LnJvdGF0ZShNYXRoLlBJKTtcbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKCAtKHggKyB3aWR0aC8yKSwgLSh5ICsgaGVpZ2h0LzIpICk7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwb3MyU3F1YXJlKHg6IG51bWJlciwgeTogbnVtYmVyKTogU3F1YXJlfHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBjb2wgPSBNYXRoLmZsb29yKCAoeCAtIHRoaXMuYm9hcmRCb3VuZHMueCkvdGhpcy5zcVNpemUgKTtcbiAgICAgICAgbGV0IHJvdyA9IE1hdGguZmxvb3IoICh5IC0gdGhpcy5ib2FyZEJvdW5kcy55KS90aGlzLnNxU2l6ZSk7XG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICBjb2wgPSA4IC0gY29sO1xuICAgICAgICAgICAgcm93ID0gOCAtIHJvdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sIDwgMCB8fCByb3cgPCAwIHx8IGNvbCA+IDkgLSAxIHx8IHJvdyA+IDkgLSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxTcXVhcmVzWyA5KnJvdyArIGNvbCBdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzcXVhcmUyUG9zKHNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IGNvbCA9IDkgLSBwYXJzZUludChzcVswXSk7XG4gICAgICAgIGxldCByb3cgPSBzcS5jaGFyQ29kZUF0KDEpIC0gOTc7XG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICBjb2wgPSA4IC0gY29sO1xuICAgICAgICAgICAgcm93ID0gOCAtIHJvdztcbiAgICAgICAgfVxuICAgICAgICBsZXQgeCA9IHRoaXMuYm9hcmRCb3VuZHMueCArIChjb2wgKiB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIGxldCB5ID0gdGhpcy5ib2FyZEJvdW5kcy55ICsgcm93ICogdGhpcy5zcVNpemU7XG4gICAgICAgIGxldCBjZW50ZXJYID0geCArICh0aGlzLnNxU2l6ZS8yKTtcbiAgICAgICAgbGV0IGNlbnRlclkgPSB5ICsgKHRoaXMuc3FTaXplLzIpXG4gICAgICAgIHJldHVybiB7IHgsIHksIGNlbnRlclgsIGNlbnRlclkgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Qm9hcmRCb3VuZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJvYXJkQm91bmRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTcVNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxU2l6ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGxheWVySGFuZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3Bwb25lbnRIYW5kQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHBvbmVudEhhbmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9yaWVudGF0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB9XG59IiwiaW1wb3J0IFNob0dVSSBmcm9tIFwiLi9zaG9ndWlcIjtcbmltcG9ydCB7IENvbG9yLCBTcXVhcmUsIFBpZWNldHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmxldCBzaG9ndWkgPSBuZXcgU2hvR1VJKHtvbk1vdmVQaWVjZTogbXlQaWVjZU1vdmUsIG9uRHJvcFBpZWNlOiBteURyb3BQaWVjZX0pO1xuXG5zaG9ndWkuc2V0UG9zaXRpb24oJ2xuc2drZ3NubC8xcjViMS9wcHBwcHBwcHAvOS85LzkvUFBQUFBQUFBQLzFCNVIxL0xOU0dLR1NOTCcpO1xuXG5mdW5jdGlvbiBteVBpZWNlTW92ZShzcmNTcTogU3F1YXJlLCBkZXN0U3E6IFNxdWFyZSkge1xuICAgIHNob2d1aS5jbGVhckhpZ2hsaWdodHMoKTtcbiAgICBzaG9ndWkuYWRkSGlnaGxpZ2h0KHtzdHlsZTogJ2xpZ2h0Z3JleScsIHR5cGU6ICdmaWxsJywgc3E6IHNyY1NxLCB9KTtcbiAgICBzaG9ndWkuYWRkSGlnaGxpZ2h0KHtzdHlsZTogJ2xpZ2h0Z3JleScsIHR5cGU6ICdmaWxsJywgc3E6IGRlc3RTcSwgfSk7XG4gICAgLy9zaG9ndWkuYWRkQXJyb3coe3N0eWxlOiAnYmxhY2snLCBmcm9tU3E6IHNyY1NxLCB0b1NxOiBkZXN0U3F9KTtcbiAgICBjb25zb2xlLmxvZyggc3JjU3EgKyBcIi0tPlwiICsgZGVzdFNxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbXlEcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSkge1xuICAgIHNob2d1aS5jbGVhckhpZ2hsaWdodHMoKTtcbiAgICBzaG9ndWkuYWRkSGlnaGxpZ2h0KHtzdHlsZTogJ2xpZ2h0Z3JleScsIHR5cGU6ICdmaWxsJywgc3E6IHNxfSk7XG4gICAgcmV0dXJuIHRydWU7XG59IiwiaW1wb3J0IEdVSSBmcm9tIFwiLi9ndWlcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IHsgQ29uZmlnLCBQaWVjZSwgUGllY2V0eXBlLCBTcXVhcmUsIGFsbFNxdWFyZXMsIENvbG9yLCBBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgaXNTcXVhcmVBcnJvdywgaXNIYW5kQXJyb3csIGFycm93c0VxdWFsLCBzZmVuMlBpZWNldHlwZSB9IGZyb20gXCIuL3V0aWxcIjtcblxuaW50ZXJmYWNlIERyYWdnaW5nUGllY2Uge1xuICAgIHBpZWNlOiBQaWVjZSxcbiAgICB4OiBudW1iZXIsXG4gICAgeTogbnVtYmVyXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNob0dVSSB7XG4gICAgcHJpdmF0ZSBjb25maWc6IENvbmZpZztcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBndWk6IEdVSTtcbiAgICBwcml2YXRlIGN1cnJlbnRBcnJvdzogQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dMaXN0OiBBcnJvd1tdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgaGlnaGxpZ2h0TGlzdDogSGlnaGxpZ2h0W107XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlOiBEcmFnZ2luZ1BpZWNlfHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTM1MDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMud2lkdGgvMiArIDIwO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgdGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdCA9IFtdO1xuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZURvd24oZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZU1vdmUoZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5ndWkuZmxpcEJvYXJkKCk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQb3NpdGlvbihzZmVuOiBzdHJpbmcpIHtcbiAgICAgICAgLy9UT0RPOiBDaGVjayBmb3IgdmFsaWQgc2ZlblxuXG4gICAgICAgIGxldCBzZmVuQXJyID0gc2Zlbi5zcGxpdCgnICcpO1xuICAgICAgICBsZXQgc2ZlbkJvYXJkID0gc2ZlbkFyclswXTtcbiAgICAgICAgbGV0IHNmZW5IYW5kID0gc2ZlbkFyclsyXTtcblxuICAgICAgICB0aGlzLmJvYXJkLnNldFBvc2l0aW9uKHNmZW5Cb2FyZCk7XG5cbiAgICAgICAgaWYgKCFzZmVuSGFuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFtdCA9IDE7XG4gICAgICAgIGZvciAobGV0IGNoYXIgb2Ygc2ZlbkhhbmQpIHtcbiAgICAgICAgICAgIGxldCBwdHlwZSA9IHNmZW4yUGllY2V0eXBlKGNoYXIpO1xuICAgICAgICAgICAgaWYgKCAhaXNOYU4oTnVtYmVyKGNoYXIpKSApIHtcbiAgICAgICAgICAgICAgICBhbXQgPSBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghcHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFUlJPUjogQ2Fubm90IGdldCBwaWVjZXR5cGUgZnJvbSBzZmVuIGNoYXJhY3RlciAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXIudG9VcHBlckNhc2UoKSA9PT0gY2hhcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmFkZDJIYW5kKCdibGFjaycsIHB0eXBlLCBhbXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhci50b0xvd2VyQ2FzZSgpID09PSBjaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuYWRkMkhhbmQoJ3doaXRlJywgcHR5cGUsIGFtdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYW10ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmZsaXBCb2FyZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTcXVhcmVIaWdobGlnaHRlZChzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBzcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSGlnaGxpZ2h0KGhpZ2hsaWdodDogSGlnaGxpZ2h0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1NxdWFyZUhpZ2hsaWdodGVkKGhpZ2hsaWdodC5zcSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdC5wdXNoKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBoaWdobGlnaHQuc3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJIaWdobGlnaHRzKCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQXJyb3coYXJyb3c6IEFycm93KTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChhcnJvdy50b1NxID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5hcnJvd0xpc3QucHVzaChhcnJvdyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVBcnJvdyhhcnJvdzogQXJyb3cpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCBjbXBBcnJvdyBvZiB0aGlzLmFycm93TGlzdCkge1xuICAgICAgICAgICAgaWYgKCBhcnJvd3NFcXVhbChjbXBBcnJvdywgYXJyb3cpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXJyb3dMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQXJyb3dzKCkge1xuICAgICAgICB0aGlzLmFycm93TGlzdCA9IFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgbW92ZVBpZWNlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbk1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZy5vbkRyb3BQaWVjZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5jb25maWcub25Ecm9wUGllY2UoY29sb3IsIHBpZWNldHlwZSwgc3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZHJvcFBpZWNlKGNvbG9yLCBwaWVjZXR5cGUsIHNxLCBudW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoQ2FudmFzKCkge1xuICAgICAgICB0aGlzLmd1aS5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGZvciAobGV0IGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmhpZ2hsaWdodFNxdWFyZShoaWdobGlnaHQuc3R5bGUsIGhpZ2hsaWdodC50eXBlLCBoaWdobGlnaHQuc3EsIGhpZ2hsaWdodC5hbHBoYSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmhpZ2hsaWdodFNxdWFyZSgnbWludGNyZWFtJywgJ2ZpbGwnLCB0aGlzLmFjdGl2ZVNxdWFyZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5ndWkuZHJhd0ZpbGVSYW5rTGFiZWxzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSBvZiBhbGxTcXVhcmVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUgJiYgdGhpcy5kcmFnZ2luZ1BpZWNlKSB7IC8vIERvbid0IGRyYXcgdGhlIGN1cnJlbnRseSBkcmFnZ2luZyBwaWVjZSBvbiBpdHMgc3F1YXJlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlID09PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdQaWVjZUF0U3F1YXJlKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmQoJ2JsYWNrJyk7IFxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnd2hpdGUnKTtcblxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3UGllY2UodGhpcy5kcmFnZ2luZ1BpZWNlLnBpZWNlLCB0aGlzLmRyYWdnaW5nUGllY2UueCAtIHRoaXMuZ3VpLmdldFNxU2l6ZSgpLzIsIHRoaXMuZHJhZ2dpbmdQaWVjZS55IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgYXJyb3cgb2YgdGhpcy5hcnJvd0xpc3QpIHtcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0Fycm93Q2FudmFzKDAuNik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3QXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIGlmICggaXNTcXVhcmVBcnJvdyhhcnJvdykgKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3U3F1YXJlQXJyb3coYXJyb3cpO1xuICAgICAgICB9IGVsc2UgaWYgKCBpc0hhbmRBcnJvdyhhcnJvdykgKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZEFycm93KGFycm93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikge1xuICAgICAgICAgICAgdGhpcy5vblJpZ2h0Q2xpY2soZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhckFycm93cygpO1xuXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodGhpcy5ndWkuZ2V0Qm9hcmRCb3VuZHMoKSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICBsZXQgY2xpY2tlZFNxOiBTcXVhcmV8dW5kZWZpbmVkID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGlja2VkU3EpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBwaWVjZSA9IHRoaXMuYm9hcmQuZ2V0UGllY2UoY2xpY2tlZFNxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHBpZWNlICYmICghdGhpcy5hY3RpdmVTcXVhcmUgfHwgdGhpcy5hY3RpdmVTcXVhcmUgPT09IGNsaWNrZWRTcSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IGNsaWNrZWRTcTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB7cGllY2U6IHBpZWNlLCB4OiBtb3VzZVgsIHk6IG1vdXNlWX07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUgIT09IGNsaWNrZWRTcSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCksIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKG9wcG9uZW50Q29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiB0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gc3FPdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVQaWVjZSh0aGlzLmFjdGl2ZVNxdWFyZSwgc3FPdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRyYWdnaW5nUGllY2UgJiYgIXRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcm9wUGllY2UodGhpcy5kcmFnZ2luZ1BpZWNlLnBpZWNlLmNvbG9yLCB0aGlzLmRyYWdnaW5nUGllY2UucGllY2UudHlwZSwgc3FPdmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7IC8vIFJpZ2h0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5yZW1vdmVBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGhvdmVyU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcblxuICAgICAgICBpZiAoIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnggPSBtb3VzZVg7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueSA9IG1vdXNlWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgaWYgKGhvdmVyU3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy50b1NxID0gaG92ZXJTcTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cudG9TcSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SaWdodENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgY2xpY2tlZFNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG5cbiAgICAgICAgaWYgKGNsaWNrZWRTcSAmJiAhdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6ICdibHVlJywgZnJvbVNxOiBjbGlja2VkU3EsIHRvU3E6IGNsaWNrZWRTcSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAnYmxhY2snLCBwaWVjZXR5cGU6IGtleSwgY29sb3I6IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogJ2JsYWNrJywgcGllY2V0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgIH1cbn0iLCJleHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gICAgb3JpZW50YXRpb24/OiBDb2xvcixcbiAgICBvbk1vdmVQaWVjZT86ICguLi5hcmdzOiBTcXVhcmVbXSkgPT4gYm9vbGVhbixcbiAgICBvbkRyb3BQaWVjZT86IChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlKSA9PiBib29sZWFuLFxuICAgIG9uU2VsZWN0UGllY2U/OiAocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSA9PiBib29sZWFuLFxuICAgIG9uRGVzZWxlY3RQaWVjZT86ICgpID0+IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgQ29sb3IgPSAnYmxhY2snIHwgJ3doaXRlJztcbmV4cG9ydCB0eXBlIFBpZWNldHlwZSA9ICdraW5nJyB8ICdyb29rJyB8ICdiaXNob3AnICB8ICdnb2xkJyB8ICdzaWx2ZXInIHwgJ2tuaWdodCcgfCAnbGFuY2UnIHwgJ3Bhd24nO1xuZXhwb3J0IHR5cGUgU3F1YXJlID0gJzlhJyB8ICc4YScgfCAnN2EnIHwgJzZhJyB8ICc1YScgfCAnNGEnIHwgJzNhJyB8ICcyYScgfCAnMWEnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5YicgfCAnOGInIHwgJzdiJyB8ICc2YicgfCAnNWInIHwgJzRiJyB8ICczYicgfCAnMmInIHwgJzFiJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWMnIHwgJzhjJyB8ICc3YycgfCAnNmMnIHwgJzVjJyB8ICc0YycgfCAnM2MnIHwgJzJjJyB8ICcxYycgfFxuICAgICAgICAgICAgICAgICAgICAgJzlkJyB8ICc4ZCcgfCAnN2QnIHwgJzZkJyB8ICc1ZCcgfCAnNGQnIHwgJzNkJyB8ICcyZCcgfCAnMWQnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZScgfCAnOGUnIHwgJzdlJyB8ICc2ZScgfCAnNWUnIHwgJzRlJyB8ICczZScgfCAnMmUnIHwgJzFlJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWYnIHwgJzhmJyB8ICc3ZicgfCAnNmYnIHwgJzVmJyB8ICc0ZicgfCAnM2YnIHwgJzJmJyB8ICcxZicgfFxuICAgICAgICAgICAgICAgICAgICAgJzlnJyB8ICc4ZycgfCAnN2cnIHwgJzZnJyB8ICc1ZycgfCAnNGcnIHwgJzNnJyB8ICcyZycgfCAnMWcnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5aCcgfCAnOGgnIHwgJzdoJyB8ICc2aCcgfCAnNWgnIHwgJzRoJyB8ICczaCcgfCAnMmgnIHwgJzFoJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWknIHwgJzhpJyB8ICc3aScgfCAnNmknIHwgJzVpJyB8ICc0aScgfCAnM2knIHwgJzJpJyB8ICcxaSc7XG5cbmV4cG9ydCB0eXBlIFJhbmsgPSAnYScgfCAnYicgfCAnYycgfCAnZCcgfCAnZScgfCAnZicgfCAnZycgfCAnaCcgfCAnaSc7XG5leHBvcnQgdHlwZSBGaWxlID0gMSB8IDIgfCAzIHwgNCB8IDUgfCA2IHwgNyB8IDggfCA5O1xuXG5leHBvcnQgY29uc3QgcmFua3M6IFJhbmtbXSA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJywgJ2knXTtcbmV4cG9ydCBjb25zdCBmaWxlczogRmlsZVtdID0gWzksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDFdO1xuZXhwb3J0IGNvbnN0IGFsbFNxdWFyZXM6IFNxdWFyZVtdID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdCguLi5yYW5rcy5tYXAociA9PiBmaWxlcy5tYXAoYyA9PiBjK3IpKSk7XG5cbmV4cG9ydCB0eXBlIEhpZ2hsaWdodFR5cGUgPSAnZmlsbCcgfCAnb3V0bGluZScgfCAnY2lyY2xlJyB8ICdoaWRkZW4nXG5leHBvcnQgdHlwZSBBcnJvdyA9IFNxdWFyZUFycm93IHwgSGFuZEFycm93O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgICB0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHByb21vdGVkPzogYm9vbGVhblxufVxuZXhwb3J0IGludGVyZmFjZSBSZWN0IHtcbiAgICB4OiBudW1iZXIsXG4gICAgeTogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU3F1YXJlQXJyb3cgeyAvLyBBcnJvdyBnb2luZyBmcm9tIG9uZSBib2FyZCBzcXVhcmUgdG8gYW5vdGhlclxuICAgIHN0eWxlOiBzdHJpbmcsXG4gICAgZnJvbVNxOiBTcXVhcmUsXG4gICAgdG9TcTogU3F1YXJlXG59XG5leHBvcnQgaW50ZXJmYWNlIEhhbmRBcnJvdyB7IC8vIEFycm93IGdvaW5nIGZyb20gYSBwaWVjZSBpbiBoYW5kIHRvIGEgYm9hcmQgc3F1YXJlXG4gICAgc3R5bGU6IHN0cmluZyxcbiAgICBwaWVjZXR5cGU6IFBpZWNldHlwZSxcbiAgICBjb2xvcjogQ29sb3IsXG4gICAgdG9TcT86IFNxdWFyZVxufVxuZXhwb3J0IGludGVyZmFjZSBIaWdobGlnaHQge1xuICAgIHN0eWxlOiBzdHJpbmcsXG4gICAgdHlwZTogSGlnaGxpZ2h0VHlwZSxcbiAgICBhbHBoYT86IG51bWJlcixcbiAgICBzcTogU3F1YXJlXG59IiwiaW1wb3J0IHsgUmVjdCwgU3F1YXJlQXJyb3csIEhhbmRBcnJvdywgUGllY2V0eXBlLCBBcnJvdyB9IGZyb20gXCIuL3R5cGVzXCI7XG5cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHNvbWV0aGluZyBpcyBpbnNpZGUgdGhlIFJlY3RcbiAqIEBwYXJhbSByZWN0IC0gUmVjdGFuZ2xlIHRvIGNoZWNrIGlmIHBvcyBpcyBpbnNpZGVcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIG9mIHBvc2l0aW9uXG4gKiBAcGFyYW0geSAtIFkgY29vcmRpYW50ZSBvZiBwb3NpdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQb3NJbnNpZGVSZWN0KHJlY3Q6IFJlY3QsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKHggPCByZWN0LnggfHwgeCA+PSByZWN0LnggKyByZWN0LndpZHRoIHx8XG4gICAgICAgIHkgPCByZWN0LnkgfHwgeSA+PSByZWN0LnkgKyByZWN0LmhlaWdodCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyb3dzRXF1YWwoYXJyb3cxOiBBcnJvdywgYXJyb3cyOiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgIGlmICggaXNTcXVhcmVBcnJvdyhhcnJvdzEpICYmIGlzU3F1YXJlQXJyb3coYXJyb3cyKSApIHtcbiAgICAgICAgaWYgKCBhcnJvdzEudG9TcSA9PT0gYXJyb3cyLnRvU3EgJiYgYXJyb3cxLmZyb21TcSA9PT0gYXJyb3cyLmZyb21TcSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBpc0hhbmRBcnJvdyhhcnJvdzEpICYmIGlzSGFuZEFycm93KGFycm93MikgKSB7XG4gICAgICAgIGlmIChhcnJvdzEucGllY2V0eXBlID09PSBhcnJvdzIucGllY2V0eXBlICYmIGFycm93MS5jb2xvciA9PT0gYXJyb3cyLmNvbG9yKSB7XG4gICAgICAgICAgICBpZiAoIGFycm93MS50b1NxICYmIGFycm93Mi50b1NxICYmIGFycm93MS50b1NxID09PSBhcnJvdzIudG9TcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW4yUGllY2V0eXBlKHNmZW46IHN0cmluZyk6IFBpZWNldHlwZXx1bmRlZmluZWQge1xuICAgIHN3aXRjaCAoc2Zlbi50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1AnOlxuICAgICAgICBjYXNlICdwJzpcbiAgICAgICAgICAgIHJldHVybiAncGF3bic7XG4gICAgICAgIGNhc2UgJ0wnOlxuICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAgIHJldHVybiAnbGFuY2UnO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgY2FzZSAnbic6XG4gICAgICAgICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgICAgIGNhc2UgJ1MnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICAgICAgY2FzZSAnRyc6XG4gICAgICAgIGNhc2UgJ2cnOlxuICAgICAgICAgICAgcmV0dXJuICdnb2xkJztcbiAgICAgICAgY2FzZSAnUic6XG4gICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgcmV0dXJuICdyb29rJztcbiAgICAgICAgY2FzZSAnQic6XG4gICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgICAgICBjYXNlICdLJzpcbiAgICAgICAgY2FzZSAnayc6XG4gICAgICAgICAgICByZXR1cm4gJ2tpbmcnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NxdWFyZUFycm93KGFyZzogYW55KTogYXJnIGlzIFNxdWFyZUFycm93IHtcbiAgICByZXR1cm4gYXJnICYmIGFyZy5zdHlsZSAmJiBhcmcuZnJvbVNxICYmIGFyZy50b1NxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNIYW5kQXJyb3coYXJnOiBhbnkpOiBhcmcgaXMgSGFuZEFycm93IHtcbiAgICByZXR1cm4gYXJnICYmIGFyZy5zdHlsZSAmJiBhcmcucGllY2V0eXBlICYmIGFyZy5jb2xvciAmJiBhcmcudG9TcTtcbn0iXX0=
