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
    constructor(board) {
        this.board = board;
        this.orientation = 'black';
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width / 2 + 20;
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
        this.imageMap = new Map();
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
        this.boardBounds = { x: this.canvas.width / 4, y: 15, width: this.canvas.width / 2, height: this.canvas.width / 2 };
        this.sqSize = this.boardBounds.width / 9;
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandBounds = tmpHandRects.player;
        this.opponentHandBounds = tmpHandRects.opponent;
        document.body.appendChild(this.canvas);
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
        let pieceImg = this.imageMap.get(key);
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
                let pieceImg = this.imageMap.get(key);
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
                let pieceImg = this.imageMap.get(key);
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
    getCanvas() {
        return this.canvas;
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
        this.gui = new gui_1.default(this.board);
        this.arrowList = [];
        this.highlightList = [];
        this.gui.getCanvas().addEventListener('mousedown', function (e) {
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
        this.gui.getCanvas().addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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
        let rect = this.gui.getCanvas().getBoundingClientRect();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL21haW4udHMiLCJzcmMvc2hvZ3VpLnRzIiwic3JjL3R5cGVzLnRzIiwic3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLG1DQUFzRTtBQUN0RSxpQ0FBd0M7QUFFeEMsTUFBcUIsS0FBSztJQUl0QjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQUU3RCxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUM3QyxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUU3QyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6QixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFB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LENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQzFELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FB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SyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdB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Q25CLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxHQUFHO1lBQ0osT0FBTyxRQUFRLENBQUM7UUFDcEIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLEdBQUc7WUFDSixPQUFPLFFBQVEsQ0FBQztRQUNwQixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssR0FBRztZQUNKLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxHQUFHO1lBQ0osT0FBTyxNQUFNLENBQUM7UUFDbEIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLEdBQUc7WUFDSixPQUFPLFFBQVEsQ0FBQztRQUNwQixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssR0FBRztZQUNKLE9BQU8sTUFBTSxDQUFDO1FBQ2xCO1lBQ0ksT0FBTyxTQUFTLENBQUM7S0FDeEI7QUFDTCxDQUFDO0FBN0JELHdDQTZCQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxHQUFRO0lBQ2xDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3RELENBQUM7QUFGRCxzQ0FFQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxHQUFRO0lBQ2hDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDdEUsQ0FBQztBQUZELGtDQUVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgUGllY2UsIFBpZWNldHlwZSwgU3F1YXJlLCBDb2xvciwgYWxsU3F1YXJlcyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBzZmVuMlBpZWNldHlwZSB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuICAgIHByaXZhdGUgcGllY2VMaXN0OiBNYXA8U3F1YXJlLCBQaWVjZT47XG4gICAgcHJpdmF0ZSBwbGF5ZXJIYW5kczogTWFwPENvbG9yLCBNYXA8UGllY2V0eXBlLCBudW1iZXI+ID47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5waWVjZUxpc3QgPSBuZXcgTWFwPFNxdWFyZSwgUGllY2U+KCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZHMgPSBuZXcgTWFwPENvbG9yLCBNYXA8UGllY2V0eXBlLCBudW1iZXI+ID4oKTtcblxuICAgICAgICBsZXQgYmxhY2tIYW5kID0gbmV3IE1hcDxQaWVjZXR5cGUsIG51bWJlcj4oKTtcbiAgICAgICAgbGV0IHdoaXRlSGFuZCA9IG5ldyBNYXA8UGllY2V0eXBlLCBudW1iZXI+KCk7XG5cbiAgICAgICAgYmxhY2tIYW5kLnNldCgncGF3bicsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdrbmlnaHQnLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgnc2lsdmVyJywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgnYmlzaG9wJywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ3Jvb2snLCAwKTtcblxuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdwYXduJywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ2xhbmNlJywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdzaWx2ZXInLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgnZ29sZCcsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgncm9vaycsIDApO1xuXG4gICAgICAgIHRoaXMucGxheWVySGFuZHMuc2V0KCdibGFjaycsIGJsYWNrSGFuZCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZHMuc2V0KCd3aGl0ZScsIHdoaXRlSGFuZCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIFNldHMgdGhlIGJvYXJkIHRvIHNmZW4gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gc2ZlbkJvYXJkRmllbGQgLSBTdWJzdHJpbmcgb2YgdG90YWwgU0ZFTiB0aGF0IGlzIHNvbGV5IHRoZSBCb2FyZCBmaWVsZFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQb3NpdGlvbihzZmVuQm9hcmRGaWVsZDogc3RyaW5nKSB7XG4gICAgICAgIGxldCByb3dzID0gc2ZlbkJvYXJkRmllbGQuc3BsaXQoJy8nKTtcbiAgICAgICAgbGV0IGN1clNxdWFyZUluZGV4ID0gMDtcbiAgICAgICAgbGV0IGlzUHJvbW90ZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IHIgb2Ygcm93cykge1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhciBvZiByKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc05hTihOdW1iZXIoY2hhcikpICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhciA9PT0gJysnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Byb21vdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbG9yOiBDb2xvciA9IGNoYXIudG9Mb3dlckNhc2UoKSA9PT0gY2hhciA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcFR5cGUgPSBzZmVuMlBpZWNldHlwZShjaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmV0cmlldmUgUGllY2V0eXBlIGZyb20gU0ZFTiBmb3IgY2hhcmFjdGVyOiAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRQaWVjZSh7dHlwZTogcFR5cGUsIGNvbG9yOiBjb2xvciwgcHJvbW90ZWQ6IGlzUHJvbW90ZX0sIGFsbFNxdWFyZXNbY3VyU3F1YXJlSW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgY3VyU3F1YXJlSW5kZXgrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJTcXVhcmVJbmRleCA9IGN1clNxdWFyZUluZGV4ICsgTnVtYmVyKGNoYXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc1Byb21vdGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUGllY2UoZnJvbVNxOiBTcXVhcmUsIHRvU3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZnJvbVNxID09PSB0b1NxKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5waWVjZUxpc3QuZ2V0KGZyb21TcSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHRvU3EsIHBpZWNlKTtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LmRlbGV0ZShmcm9tU3EpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBpZWNlKHNxOiBTcXVhcmUpOiBQaWVjZXx1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5waWVjZUxpc3QuZ2V0KHNxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIHRoaXMucGllY2VMaXN0LnNldChzcSwgcGllY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSwgbnVtID0gMSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVGcm9tSGFuZChjb2xvciwgcGllY2V0eXBlLCBudW0pKSB7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHt0eXBlOiBwaWVjZXR5cGUsIGNvbG9yOiBjb2xvcn0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQySGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5wbGF5ZXJIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gaGFuZD8uZ2V0KHBpZWNldHlwZSk7XG4gICAgICAgIGlmIChjdXJBbW91bnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaGFuZD8uc2V0KHBpZWNldHlwZSwgY3VyQW1vdW50ICsgbnVtKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRnJvbUhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMucGxheWVySGFuZHMuZ2V0KGNvbG9yKTtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IGhhbmQ/LmdldChwaWVjZXR5cGUpO1xuICAgICAgICBpZiAoIWN1ckFtb3VudCB8fCBjdXJBbW91bnQgLSBudW0gPCAwKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCAtIG51bSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXROdW1QaWVjZXNJbkhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJIYW5kcy5nZXQoY29sb3IpPy5nZXQocGllY2V0eXBlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgYWxsU3F1YXJlcywgU3F1YXJlQXJyb3csIEhhbmRBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHVUkge1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgb3JpZW50YXRpb246IENvbG9yO1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgYXJyb3dDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgYXJyb3dDdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIGltYWdlTWFwOiBNYXA8c3RyaW5nLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRCb3VuZHM6IFJlY3Q7XG4gICAgcHJpdmF0ZSBwbGF5ZXJIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcbiAgICBwcml2YXRlIG9wcG9uZW50SGFuZEJvdW5kczogTWFwPFBpZWNldHlwZSwgUmVjdD47XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQpIHtcbiAgICAgICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ2JsYWNrJztcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDEzNTA7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLndpZHRoLzIgKyAyMDtcbiAgICAgICAgbGV0IHRtcEN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBDdHgpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4ID0gdG1wQ3R4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgbGV0IHRtcGFDdHggPSB0aGlzLmFycm93Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBhQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eCA9IHRtcGFDdHg7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGFycm93IGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCBpbWFnZXNcbiAgICAgICAgdGhpcy5pbWFnZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBIVE1MSW1hZ2VFbGVtZW50PigpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgncGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytwYXduJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnbGFuY2UnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrbGFuY2UnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcra25pZ2h0JywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnc2lsdmVyJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2dvbGQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdiaXNob3AnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgncm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgna2luZycsIG5ldyBJbWFnZSgpKTtcblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5pbWFnZU1hcCkge1xuICAgICAgICAgICAgdmFsdWUuc3JjID0gJy4uL21lZGlhL3BpZWNlcy8nICsga2V5ICsgJy5wbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgUmVjdHNcbiAgICAgICAgdGhpcy5ib2FyZEJvdW5kcyA9IHsgeDogdGhpcy5jYW52YXMud2lkdGgvNCwgeTogMTUsIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aC8yLCBoZWlnaHQ6IHRoaXMuY2FudmFzLndpZHRoLzIgfTtcbiAgICAgICAgdGhpcy5zcVNpemUgPSB0aGlzLmJvYXJkQm91bmRzLndpZHRoLzk7XG5cbiAgICAgICAgLy8gSGFuZCBSZWN0c1xuICAgICAgICBsZXQgdG1wSGFuZFJlY3RzID0gdGhpcy5pbml0SGFuZFJlY3RNYXBzKCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZEJvdW5kcyA9IHRtcEhhbmRSZWN0cy5wbGF5ZXI7XG4gICAgICAgIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzID0gdG1wSGFuZFJlY3RzLm9wcG9uZW50O1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdEhhbmRSZWN0TWFwcygpOiB7IHBsYXllcjogTWFwPFBpZWNldHlwZSwgUmVjdD4sIG9wcG9uZW50OiBNYXA8UGllY2V0eXBlLCBSZWN0PiB9IHtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSB0aGlzLmJvYXJkQm91bmRzLnggKyB0aGlzLmJvYXJkQm91bmRzLndpZHRoO1xuICAgICAgICBsZXQgc3EgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IHBIYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIGxldCBvSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjYsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncm9vaycsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdwYXduJywgeyB4OnNxKjIsIHk6c3EqMiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpzcSozLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpzcSozLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnNxKjIsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpzcSwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6c3EqMiwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6c3EsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcblxuICAgICAgICByZXR1cm4geyBwbGF5ZXI6IHBIYW5kTWFwLCBvcHBvbmVudDogb0hhbmRNYXAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhckNhbnZhcygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3NsYXRlZ3JleSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmFycm93Q2FudmFzLndpZHRoLCB0aGlzLmFycm93Q2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdCb2FyZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnc2lsdmVyJztcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMTtcblxuICAgICAgICBmb3IgKGxldCBmID0gMDsgZiA8PSA5OyBmKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gZip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRCb3VuZHMueDtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oaSwgdGhpcy5ib2FyZEJvdW5kcy55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhpLCB0aGlzLmJvYXJkQm91bmRzLnkgKyB0aGlzLmJvYXJkQm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPD0gOTsgcisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHIqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkQm91bmRzLnk7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuYm9hcmRCb3VuZHMueCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5ib2FyZEJvdW5kcy54ICsgdGhpcy5ib2FyZEJvdW5kcy53aWR0aCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdGaWxlUmFua0xhYmVscygpOiB2b2lkIHtcbiAgICAgICAgbGV0IGludGVydmFsID0gdGhpcy5zcVNpemU7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMTVweCBhcmlhbCdcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSA4IC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoIFN0cmluZy5mcm9tQ2hhckNvZGUobGFiZWwrMSs5NiksIHRoaXMuYm9hcmRCb3VuZHMueCArIHRoaXMuYm9hcmRCb3VuZHMud2lkdGggKyAzLCB0aGlzLmJvYXJkQm91bmRzLnkgKyB0aGlzLnNxU2l6ZS8yKyhpKmludGVydmFsKSApO1xuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ3RvcCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggKDEwIC0gKGxhYmVsKzEpKS50b1N0cmluZygpLCB0aGlzLmJvYXJkQm91bmRzLnggKyAodGhpcy5zcVNpemUvMikrKGkqaW50ZXJ2YWwpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3UGllY2UocGllY2U6IFBpZWNlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBwaWVjZS50eXBlO1xuICAgICAgICBpZiAocGllY2UucHJvbW90ZWQpIHtcbiAgICAgICAgICAgIGtleSA9ICcrJyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5pbWFnZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgeCwgeSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0ludmVydGVkKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdQaWVjZUF0U3F1YXJlKHNxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHBpZWNlOiBQaWVjZXx1bmRlZmluZWQgPSB0aGlzLmJvYXJkLmdldFBpZWNlKHNxKTtcbiAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd1BpZWNlKHBpZWNlLCBwb3MueCwgcG9zLnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SGFuZChjb2xvcjogQ29sb3IpIHtcbiAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ2JvdHRvbSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMucGxheWVySGFuZEJvdW5kcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB2YWx1ZS54LCB2YWx1ZS55LCB2YWx1ZS53aWR0aCwgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChudW1PZlBpZWNlcy50b1N0cmluZygpLCB2YWx1ZS54LCB2YWx1ZS55ICsgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoc3R5bGU6IHN0cmluZywgdHlwZTogc3RyaW5nLCBzcTogU3F1YXJlLCBhbHBoYT86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2hpZGRlbicpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuc3F1YXJlMlBvcyhzcSk7XG5cbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgaWYgKGFscGhhKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxsJzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChwb3MueCwgcG9zLnksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ291dGxpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLzIwMDtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KHBvcy54ICsgNCwgcG9zLnkgKyA0LCB0aGlzLnNxU2l6ZSAtIDgsIHRoaXMuc3FTaXplIC0gOCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvNTAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhwb3MuY2VudGVyWCwgcG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzIgLSA0LCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4vKlxuICAgICAgICAgICAgY2FzZSAnZG90JzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5hcmMocG9zLmNlbnRlclgsIHBvcy5jZW50ZXJZLCB0aGlzLnNxU2l6ZS84LCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdBcnJvdyhzdHlsZTogc3RyaW5nLCBmcm9teDogbnVtYmVyLCBmcm9teTogbnVtYmVyLCB0b3g6IG51bWJlciwgdG95OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zYXZlKCk7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodG95IC0gZnJvbXksIHRveCAtIGZyb214KTtcbiAgICAgICAgbGV0IHJhZGl1cyA9IHRoaXMuYXJyb3dDYW52YXMud2lkdGgvNDA7XG4gICAgICAgIGxldCB4ID0gdG94IC0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBsZXQgeSA9IHRveSAtIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lV2lkdGggPSAyKnJhZGl1cy81O1xuICAgICAgICB0aGlzLmFycm93Q3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZVN0eWxlID0gc3R5bGU7XG4gXG4gICAgICAgIC8vIERyYXcgbGluZVxuICAgICAgICB0aGlzLmFycm93Q3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4Lm1vdmVUbyhmcm9teCwgZnJvbXkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5jbG9zZVBhdGgoKTtcbiBcbiAgICAgICAgLy8gRHJhdyBhcnJvdyBoZWFkXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gXG4gICAgICAgIGxldCB4Y2VudGVyID0gKHRveCArIHgpLzI7XG4gICAgICAgIGxldCB5Y2VudGVyID0gKHRveSArIHkpLzI7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKHRveCwgdG95KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgIGFuZ2xlICs9IDIqTWF0aC5QSS8zO1xuICAgICAgICB4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpICsgeGNlbnRlcjtcbiAgICAgICAgeSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSArIHljZW50ZXI7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmZpbGwoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdTcXVhcmVBcnJvdyhhcnJvdzogU3F1YXJlQXJyb3cpIHtcbiAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cudG9TcSk7XG4gICAgICAgIGxldCBmcm9tU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cuZnJvbVNxKTtcblxuICAgICAgICBpZiAoYXJyb3cudG9TcSAhPT0gYXJyb3cuZnJvbVNxKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgZnJvbVNxUG9zLmNlbnRlclgsIGZyb21TcVBvcy5jZW50ZXJZLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZVN0eWxlID0gYXJyb3cuc3R5bGU7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLzUwMDtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmFyYyh0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0hhbmRBcnJvdyhhcnJvdzogSGFuZEFycm93KSB7XG4gICAgICAgIGxldCByZWN0O1xuICAgICAgICBpZiAoYXJyb3cuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIHJlY3QgPSB0aGlzLnBsYXllckhhbmRCb3VuZHMuZ2V0KGFycm93LnBpZWNldHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJlY3QgPSB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcy5nZXQoYXJyb3cucGllY2V0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZWN0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIWFycm93LnRvU3EpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cudG9TcSk7XG5cbiAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cuc3R5bGUsIHJlY3QueCsocmVjdC53aWR0aC8yKSwgcmVjdC55KyhyZWN0LmhlaWdodC8yKSwgdG9TcVBvcy5jZW50ZXJYLCB0b1NxUG9zLmNlbnRlclkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3QXJyb3dDYW52YXMoYWxwaGE6IG51bWJlcikge1xuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5hcnJvd0NhbnZhcywgMCwgMCk7XG4gICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMS4wO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SW52ZXJ0ZWQoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHggKyB3aWR0aC8yLCB5ICsgaGVpZ2h0LzIpO1xuICAgICAgICB0aGlzLmN0eC5yb3RhdGUoTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSggLSh4ICsgd2lkdGgvMiksIC0oeSArIGhlaWdodC8yKSApO1xuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcG9zMlNxdWFyZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IFNxdWFyZXx1bmRlZmluZWQge1xuICAgICAgICBsZXQgY29sID0gTWF0aC5mbG9vciggKHggLSB0aGlzLmJvYXJkQm91bmRzLngpL3RoaXMuc3FTaXplICk7XG4gICAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKCAoeSAtIHRoaXMuYm9hcmRCb3VuZHMueSkvdGhpcy5zcVNpemUpO1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA8IDAgfHwgcm93IDwgMCB8fCBjb2wgPiA5IC0gMSB8fCByb3cgPiA5IC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsU3F1YXJlc1sgOSpyb3cgKyBjb2wgXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3F1YXJlMlBvcyhzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBjb2wgPSA5IC0gcGFyc2VJbnQoc3FbMF0pO1xuICAgICAgICBsZXQgcm93ID0gc3EuY2hhckNvZGVBdCgxKSAtIDk3O1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHggPSB0aGlzLmJvYXJkQm91bmRzLnggKyAoY29sICogdGhpcy5zcVNpemUpO1xuICAgICAgICBsZXQgeSA9IHRoaXMuYm9hcmRCb3VuZHMueSArIHJvdyAqIHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgY2VudGVyWCA9IHggKyAodGhpcy5zcVNpemUvMik7XG4gICAgICAgIGxldCBjZW50ZXJZID0geSArICh0aGlzLnNxU2l6ZS8yKVxuICAgICAgICByZXR1cm4geyB4LCB5LCBjZW50ZXJYLCBjZW50ZXJZIH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJvYXJkQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3FTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcVNpemU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBsYXllckhhbmRCb3VuZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckhhbmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9wcG9uZW50SGFuZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcmllbnRhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldENhbnZhcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cbn0iLCJpbXBvcnQgU2hvR1VJIGZyb20gXCIuL3Nob2d1aVwiO1xuaW1wb3J0IHsgQ29sb3IsIFNxdWFyZSwgUGllY2V0eXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxubGV0IHNob2d1aSA9IG5ldyBTaG9HVUkoe29uTW92ZVBpZWNlOiBteVBpZWNlTW92ZSwgb25Ecm9wUGllY2U6IG15RHJvcFBpZWNlfSk7XG5cbnNob2d1aS5zZXRQb3NpdGlvbignbG5zZ2tnc25sLzFyNWIxL3BwcHBwcHBwcC85LzkvOS9QUFBQUFBQUFAvMUI1UjEvTE5TR0tHU05MJyk7XG5cbmZ1bmN0aW9uIG15UGllY2VNb3ZlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgc2hvZ3VpLmNsZWFySGlnaGxpZ2h0cygpO1xuICAgIHNob2d1aS5hZGRIaWdobGlnaHQoe3N0eWxlOiAnbGlnaHRncmV5JywgdHlwZTogJ2ZpbGwnLCBzcTogc3JjU3EsIH0pO1xuICAgIHNob2d1aS5hZGRIaWdobGlnaHQoe3N0eWxlOiAnbGlnaHRncmV5JywgdHlwZTogJ2ZpbGwnLCBzcTogZGVzdFNxLCB9KTtcbiAgICAvL3Nob2d1aS5hZGRBcnJvdyh7c3R5bGU6ICdibGFjaycsIGZyb21TcTogc3JjU3EsIHRvU3E6IGRlc3RTcX0pO1xuICAgIGNvbnNvbGUubG9nKCBzcmNTcSArIFwiLS0+XCIgKyBkZXN0U3EpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBteURyb3BQaWVjZShjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlKSB7XG4gICAgc2hvZ3VpLmNsZWFySGlnaGxpZ2h0cygpO1xuICAgIHNob2d1aS5hZGRIaWdobGlnaHQoe3N0eWxlOiAnbGlnaHRncmV5JywgdHlwZTogJ2ZpbGwnLCBzcTogc3F9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0iLCJpbXBvcnQgR1VJIGZyb20gXCIuL2d1aVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgeyBDb25maWcsIFBpZWNlLCBQaWVjZXR5cGUsIFNxdWFyZSwgYWxsU3F1YXJlcywgQ29sb3IsIEFycm93LCBIaWdobGlnaHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgaXNQb3NJbnNpZGVSZWN0LCBpc1NxdWFyZUFycm93LCBpc0hhbmRBcnJvdywgYXJyb3dzRXF1YWwsIHNmZW4yUGllY2V0eXBlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbnRlcmZhY2UgRHJhZ2dpbmdQaWVjZSB7XG4gICAgcGllY2U6IFBpZWNlLFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvR1VJIHtcbiAgICBwcml2YXRlIGNvbmZpZzogQ29uZmlnO1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgZ3VpOiBHVUk7XG4gICAgcHJpdmF0ZSBjdXJyZW50QXJyb3c6IEFycm93fHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGFycm93TGlzdDogQXJyb3dbXTtcbiAgICBwcml2YXRlIGFjdGl2ZVNxdWFyZTogU3F1YXJlfHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGhpZ2hsaWdodExpc3Q6IEhpZ2hsaWdodFtdO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKTtcblxuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCk7XG5cbiAgICAgICAgdGhpcy5hcnJvd0xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0ID0gW107XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYucmVmcmVzaENhbnZhcygpICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlVXAoZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYucmVmcmVzaENhbnZhcygpICk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzZWxmLmd1aS5mbGlwQm9hcmQoKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYucmVmcmVzaENhbnZhcygpICk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHNmZW46IHN0cmluZykge1xuICAgICAgICAvL1RPRE86IENoZWNrIGZvciB2YWxpZCBzZmVuXG5cbiAgICAgICAgbGV0IHNmZW5BcnIgPSBzZmVuLnNwbGl0KCcgJyk7XG4gICAgICAgIGxldCBzZmVuQm9hcmQgPSBzZmVuQXJyWzBdO1xuICAgICAgICBsZXQgc2ZlbkhhbmQgPSBzZmVuQXJyWzJdO1xuXG4gICAgICAgIHRoaXMuYm9hcmQuc2V0UG9zaXRpb24oc2ZlbkJvYXJkKTtcblxuICAgICAgICBpZiAoIXNmZW5IYW5kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYW10ID0gMTtcbiAgICAgICAgZm9yIChsZXQgY2hhciBvZiBzZmVuSGFuZCkge1xuICAgICAgICAgICAgbGV0IHB0eXBlID0gc2ZlbjJQaWVjZXR5cGUoY2hhcik7XG4gICAgICAgICAgICBpZiAoICFpc05hTihOdW1iZXIoY2hhcikpICkge1xuICAgICAgICAgICAgICAgIGFtdCA9IE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VSUk9SOiBDYW5ub3QgZ2V0IHBpZWNldHlwZSBmcm9tIHNmZW4gY2hhcmFjdGVyICcgKyBjaGFyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hhci50b1VwcGVyQ2FzZSgpID09PSBjaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuYWRkMkhhbmQoJ2JsYWNrJywgcHR5cGUsIGFtdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyLnRvTG93ZXJDYXNlKCkgPT09IGNoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5hZGQySGFuZCgnd2hpdGUnLCBwdHlwZSwgYW10KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhbXQgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGZsaXBCb2FyZCgpIHtcbiAgICAgICAgdGhpcy5ndWkuZmxpcEJvYXJkKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1NxdWFyZUhpZ2hsaWdodGVkKHNxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgZm9yIChsZXQgdG1waGlnaGxpZ2h0IG9mIHRoaXMuaGlnaGxpZ2h0TGlzdCkge1xuICAgICAgICAgICAgaWYgKCB0bXBoaWdobGlnaHQuc3EgPT09IHNxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRIaWdobGlnaHQoaGlnaGxpZ2h0OiBIaWdobGlnaHQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzU3F1YXJlSGlnaGxpZ2h0ZWQoaGlnaGxpZ2h0LnNxKSkge1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0LnB1c2goaGlnaGxpZ2h0KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlSGlnaGxpZ2h0KGhpZ2hsaWdodDogSGlnaGxpZ2h0KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgdG1waGlnaGxpZ2h0IG9mIHRoaXMuaGlnaGxpZ2h0TGlzdCkge1xuICAgICAgICAgICAgaWYgKCB0bXBoaWdobGlnaHQuc3EgPT09IGhpZ2hsaWdodC5zcSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhckhpZ2hsaWdodHMoKSB7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdCA9IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRBcnJvdyhhcnJvdzogQXJyb3cpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGFycm93LnRvU3EgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLmFycm93TGlzdC5wdXNoKGFycm93KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUFycm93KGFycm93OiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IGNtcEFycm93IG9mIHRoaXMuYXJyb3dMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIGFycm93c0VxdWFsKGNtcEFycm93LCBhcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0xpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlUGllY2Uoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25Nb3ZlUGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyb3BQaWVjZShjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uRHJvcFBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbkRyb3BQaWVjZShjb2xvciwgcGllY2V0eXBlLCBzcSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5kcm9wUGllY2UoY29sb3IsIHBpZWNldHlwZSwgc3EsIG51bSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZnJlc2hDYW52YXMoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmNsZWFyQ2FudmFzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaGlnaGxpZ2h0IG9mIHRoaXMuaGlnaGxpZ2h0TGlzdCkge1xuICAgICAgICAgICAgdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKGhpZ2hsaWdodC5zdHlsZSwgaGlnaGxpZ2h0LnR5cGUsIGhpZ2hsaWdodC5zcSwgaGlnaGxpZ2h0LmFscGhhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKCdtaW50Y3JlYW0nLCAnZmlsbCcsIHRoaXMuYWN0aXZlU3F1YXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aS5kcmF3RmlsZVJhbmtMYWJlbHMoKTtcblxuICAgICAgICBmb3IgKGxldCBpIG9mIGFsbFNxdWFyZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAmJiB0aGlzLmRyYWdnaW5nUGllY2UpIHsgLy8gRG9uJ3QgZHJhdyB0aGUgY3VycmVudGx5IGRyYWdnaW5nIHBpZWNlIG9uIGl0cyBzcXVhcmVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlQXRTcXVhcmUoaSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnYmxhY2snKTsgXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kKCd3aGl0ZScpO1xuXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UsIHRoaXMuZHJhZ2dpbmdQaWVjZS54IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMiwgdGhpcy5kcmFnZ2luZ1BpZWNlLnkgLSB0aGlzLmd1aS5nZXRTcVNpemUoKS8yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBhcnJvdyBvZiB0aGlzLmFycm93TGlzdCkge1xuICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3QXJyb3dDYW52YXMoMC42KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdBcnJvdyhhcnJvdzogQXJyb3cpIHtcbiAgICAgICAgaWYgKCBpc1NxdWFyZUFycm93KGFycm93KSApIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdTcXVhcmVBcnJvdyhhcnJvdyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIGlzSGFuZEFycm93KGFycm93KSApIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kQXJyb3coYXJyb3cpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uUmlnaHRDbGljayhldmVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyQXJyb3dzKCk7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gY2xpY2tlZFNxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gY2xpY2tlZFNxO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAhPT0gY2xpY2tlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVQaWVjZSh0aGlzLmFjdGl2ZVNxdWFyZSwgY2xpY2tlZFNxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0UGxheWVySGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQodGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIW51bVBpZWNlcyB8fCBudW1QaWVjZXMgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHt0eXBlOiBrZXksIGNvbG9yOiB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpfTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB7cGllY2U6IHBpZWNlLCB4OiBtb3VzZVgsIHk6IG1vdXNlWX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0T3Bwb25lbnRIYW5kQm91bmRzKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBsZXQgbnVtUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQob3Bwb25lbnRDb2xvciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIW51bVBpZWNlcyB8fCBudW1QaWVjZXMgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHt0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yfTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB7cGllY2U6IHBpZWNlLCB4OiBtb3VzZVgsIHk6IG1vdXNlWX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VVcChldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZ3VpLmdldENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkQm91bmRzKCksIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgbGV0IHNxT3ZlciA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgICAgIGlmICghc3FPdmVyKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmIHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlID09PSBzcU92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHRoaXMuYWN0aXZlU3F1YXJlLCBzcU92ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiAhdGhpcy5hY3RpdmVTcXVhcmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3BQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UuY29sb3IsIHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZS50eXBlLCBzcU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnJlbW92ZUFycm93KHRoaXMuY3VycmVudEFycm93KSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5ndWkuZ2V0Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgaG92ZXJTcSA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuXG4gICAgICAgIGlmICggdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueCA9IG1vdXNlWDtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZS55ID0gbW91c2VZO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICBpZiAoaG92ZXJTcSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93LnRvU3EgPSBob3ZlclNxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy50b1NxID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJpZ2h0Q2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgIGxldCBjbGlja2VkU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcblxuICAgICAgICBpZiAoY2xpY2tlZFNxICYmICF0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogJ2JsdWUnLCBmcm9tU3E6IGNsaWNrZWRTcSwgdG9TcTogY2xpY2tlZFNxIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0UGxheWVySGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6ICdibGFjaycsIHBpZWNldHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAnYmxhY2snLCBwaWVjZXR5cGU6IGtleSwgY29sb3I6IG9wcG9uZW50Q29sb3IgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgfVxufSIsImV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgICBvcmllbnRhdGlvbj86IENvbG9yLFxuICAgIG9uTW92ZVBpZWNlPzogKC4uLmFyZ3M6IFNxdWFyZVtdKSA9PiBib29sZWFuLFxuICAgIG9uRHJvcFBpZWNlPzogKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25TZWxlY3RQaWVjZT86IChwaWVjZTogUGllY2UsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25EZXNlbGVjdFBpZWNlPzogKCkgPT4gYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBDb2xvciA9ICdibGFjaycgfCAnd2hpdGUnO1xuZXhwb3J0IHR5cGUgUGllY2V0eXBlID0gJ2tpbmcnIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgIHwgJ2dvbGQnIHwgJ3NpbHZlcicgfCAna25pZ2h0JyB8ICdsYW5jZScgfCAncGF3bic7XG5leHBvcnQgdHlwZSBTcXVhcmUgPSAnOWEnIHwgJzhhJyB8ICc3YScgfCAnNmEnIHwgJzVhJyB8ICc0YScgfCAnM2EnIHwgJzJhJyB8ICcxYScgfFxuICAgICAgICAgICAgICAgICAgICAgJzliJyB8ICc4YicgfCAnN2InIHwgJzZiJyB8ICc1YicgfCAnNGInIHwgJzNiJyB8ICcyYicgfCAnMWInIHxcbiAgICAgICAgICAgICAgICAgICAgICc5YycgfCAnOGMnIHwgJzdjJyB8ICc2YycgfCAnNWMnIHwgJzRjJyB8ICczYycgfCAnMmMnIHwgJzFjJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWQnIHwgJzhkJyB8ICc3ZCcgfCAnNmQnIHwgJzVkJyB8ICc0ZCcgfCAnM2QnIHwgJzJkJyB8ICcxZCcgfFxuICAgICAgICAgICAgICAgICAgICAgJzllJyB8ICc4ZScgfCAnN2UnIHwgJzZlJyB8ICc1ZScgfCAnNGUnIHwgJzNlJyB8ICcyZScgfCAnMWUnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZicgfCAnOGYnIHwgJzdmJyB8ICc2ZicgfCAnNWYnIHwgJzRmJyB8ICczZicgfCAnMmYnIHwgJzFmJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWcnIHwgJzhnJyB8ICc3ZycgfCAnNmcnIHwgJzVnJyB8ICc0ZycgfCAnM2cnIHwgJzJnJyB8ICcxZycgfFxuICAgICAgICAgICAgICAgICAgICAgJzloJyB8ICc4aCcgfCAnN2gnIHwgJzZoJyB8ICc1aCcgfCAnNGgnIHwgJzNoJyB8ICcyaCcgfCAnMWgnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5aScgfCAnOGknIHwgJzdpJyB8ICc2aScgfCAnNWknIHwgJzRpJyB8ICczaScgfCAnMmknIHwgJzFpJztcblxuZXhwb3J0IHR5cGUgUmFuayA9ICdhJyB8ICdiJyB8ICdjJyB8ICdkJyB8ICdlJyB8ICdmJyB8ICdnJyB8ICdoJyB8ICdpJztcbmV4cG9ydCB0eXBlIEZpbGUgPSAxIHwgMiB8IDMgfCA0IHwgNSB8IDYgfCA3IHwgOCB8IDk7XG5cbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaSddO1xuZXhwb3J0IGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbOSwgOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5leHBvcnQgY29uc3QgYWxsU3F1YXJlczogU3F1YXJlW10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KC4uLnJhbmtzLm1hcChyID0+IGZpbGVzLm1hcChjID0+IGMrcikpKTtcblxuZXhwb3J0IHR5cGUgSGlnaGxpZ2h0VHlwZSA9ICdmaWxsJyB8ICdvdXRsaW5lJyB8ICdjaXJjbGUnIHwgJ2hpZGRlbidcbmV4cG9ydCB0eXBlIEFycm93ID0gU3F1YXJlQXJyb3cgfCBIYW5kQXJyb3c7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICAgIHR5cGU6IFBpZWNldHlwZSxcbiAgICBjb2xvcjogQ29sb3IsXG4gICAgcHJvbW90ZWQ/OiBib29sZWFuXG59XG5leHBvcnQgaW50ZXJmYWNlIFJlY3Qge1xuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXIsXG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBoZWlnaHQ6IG51bWJlclxufVxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVBcnJvdyB7IC8vIEFycm93IGdvaW5nIGZyb20gb25lIGJvYXJkIHNxdWFyZSB0byBhbm90aGVyXG4gICAgc3R5bGU6IHN0cmluZyxcbiAgICBmcm9tU3E6IFNxdWFyZSxcbiAgICB0b1NxOiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSGFuZEFycm93IHsgLy8gQXJyb3cgZ29pbmcgZnJvbSBhIHBpZWNlIGluIGhhbmQgdG8gYSBib2FyZCBzcXVhcmVcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIHBpZWNldHlwZTogUGllY2V0eXBlLFxuICAgIGNvbG9yOiBDb2xvcixcbiAgICB0b1NxPzogU3F1YXJlXG59XG5leHBvcnQgaW50ZXJmYWNlIEhpZ2hsaWdodCB7XG4gICAgc3R5bGU6IHN0cmluZyxcbiAgICB0eXBlOiBIaWdobGlnaHRUeXBlLFxuICAgIGFscGhhPzogbnVtYmVyLFxuICAgIHNxOiBTcXVhcmVcbn0iLCJpbXBvcnQgeyBSZWN0LCBTcXVhcmVBcnJvdywgSGFuZEFycm93LCBQaWVjZXR5cGUsIEFycm93IH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuXG4vKipcbiAqIERldGVybWluZXMgaWYgc29tZXRoaW5nIGlzIGluc2lkZSB0aGUgUmVjdFxuICogQHBhcmFtIHJlY3QgLSBSZWN0YW5nbGUgdG8gY2hlY2sgaWYgcG9zIGlzIGluc2lkZVxuICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGUgb2YgcG9zaXRpb25cbiAqIEBwYXJhbSB5IC0gWSBjb29yZGlhbnRlIG9mIHBvc2l0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc0luc2lkZVJlY3QocmVjdDogUmVjdCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoeCA8IHJlY3QueCB8fCB4ID49IHJlY3QueCArIHJlY3Qud2lkdGggfHxcbiAgICAgICAgeSA8IHJlY3QueSB8fCB5ID49IHJlY3QueSArIHJlY3QuaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJvd3NFcXVhbChhcnJvdzE6IEFycm93LCBhcnJvdzI6IEFycm93KTogYm9vbGVhbiB7XG4gICAgaWYgKCBpc1NxdWFyZUFycm93KGFycm93MSkgJiYgaXNTcXVhcmVBcnJvdyhhcnJvdzIpICkge1xuICAgICAgICBpZiAoIGFycm93MS50b1NxID09PSBhcnJvdzIudG9TcSAmJiBhcnJvdzEuZnJvbVNxID09PSBhcnJvdzIuZnJvbVNxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIGlzSGFuZEFycm93KGFycm93MSkgJiYgaXNIYW5kQXJyb3coYXJyb3cyKSApIHtcbiAgICAgICAgaWYgKGFycm93MS5waWVjZXR5cGUgPT09IGFycm93Mi5waWVjZXR5cGUgJiYgYXJyb3cxLmNvbG9yID09PSBhcnJvdzIuY29sb3IpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3cxLnRvU3EgJiYgYXJyb3cyLnRvU3EgJiYgYXJyb3cxLnRvU3EgPT09IGFycm93Mi50b1NxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2ZlbjJQaWVjZXR5cGUoc2Zlbjogc3RyaW5nKTogUGllY2V0eXBlfHVuZGVmaW5lZCB7XG4gICAgc3dpdGNoIChzZmVuLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgIGNhc2UgJ3AnOlxuICAgICAgICAgICAgcmV0dXJuICdwYXduJztcbiAgICAgICAgY2FzZSAnTCc6XG4gICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgICAgcmV0dXJuICdsYW5jZSc7XG4gICAgICAgIGNhc2UgJ04nOlxuICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgIHJldHVybiAna25pZ2h0JztcbiAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgcmV0dXJuICdzaWx2ZXInO1xuICAgICAgICBjYXNlICdHJzpcbiAgICAgICAgY2FzZSAnZyc6XG4gICAgICAgICAgICByZXR1cm4gJ2dvbGQnO1xuICAgICAgICBjYXNlICdSJzpcbiAgICAgICAgY2FzZSAncic6XG4gICAgICAgICAgICByZXR1cm4gJ3Jvb2snO1xuICAgICAgICBjYXNlICdCJzpcbiAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICByZXR1cm4gJ2Jpc2hvcCc7XG4gICAgICAgIGNhc2UgJ0snOlxuICAgICAgICBjYXNlICdrJzpcbiAgICAgICAgICAgIHJldHVybiAna2luZyc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3F1YXJlQXJyb3coYXJnOiBhbnkpOiBhcmcgaXMgU3F1YXJlQXJyb3cge1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnN0eWxlICYmIGFyZy5mcm9tU3EgJiYgYXJnLnRvU3E7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hhbmRBcnJvdyhhcmc6IGFueSk6IGFyZyBpcyBIYW5kQXJyb3cge1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnN0eWxlICYmIGFyZy5waWVjZXR5cGUgJiYgYXJnLmNvbG9yICYmIGFyZy50b1NxO1xufSJdfQ==
