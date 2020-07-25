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
        if (!curAmount || curAmount - num <= 0) {
            return false;
        }
        hand === null || hand === void 0 ? void 0 : hand.set(piecetype, curAmount - num);
        return true;
    }
    getNumPiecesInHand(color, piecetype) {
        var _a;
        return (_a = this.playerHands.get(color)) === null || _a === void 0 ? void 0 : _a.get(piecetype);
    }
    getHand(color) {
        return this.playerHands.get(color);
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
        this.boardRect = { x: this.canvas.width / 4, y: 15, width: this.canvas.width / 2, height: this.canvas.width / 2 };
        this.sqSize = this.boardRect.width / 9;
        let tmpHandRects = this.initHandRectMaps();
        this.playerHandBounds = tmpHandRects.player;
        this.opponentHandBounds = tmpHandRects.opponent;
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
    highlightSquare(highlight) {
        if (highlight.type === 'hidden')
            return false;
        let pos = this.square2Pos(highlight.sq);
        this.ctx.save();
        this.ctx.fillStyle = highlight.style;
        this.ctx.strokeStyle = highlight.style;
        if (highlight.alpha) {
            this.ctx.globalAlpha = highlight.alpha;
        }
        switch (highlight.type) {
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
        let col = Math.floor((x - this.boardRect.x) / this.sqSize);
        let row = Math.floor((y - this.boardRect.y) / this.sqSize);
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
        let x = this.boardRect.x + (col * this.sqSize);
        let y = this.boardRect.y + row * this.sqSize;
        let centerX = x + (this.sqSize / 2);
        let centerY = y + (this.sqSize / 2);
        return { x, y, centerX, centerY };
    }
    getBoardRect() {
        return this.boardRect;
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
let shogui = new shogui_1.default({ onMovePiece: onPieceMove });
shogui.setPosition('lnsgk2nl/1r4gs1/p1pppp1pp/1p4p2/7P1/2P6/PP1PPPP1P/1SG4R1/LN2KGSNL b 7b');
function onPieceMove(srcSq, destSq) {
    shogui.clearHighlights();
    shogui.addHighlight({ style: 'lightgrey', type: 'fill', sq: srcSq, });
    shogui.addHighlight({ style: 'lightgrey', type: 'fill', sq: destSq, });
    console.log(srcSq + "-->" + destSq);
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
    refreshCanvas() {
        this.gui.clearCanvas();
        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight);
        }
        if (this.activeSquare) {
            this.gui.highlightSquare({ style: 'mintcream', type: 'fill', sq: this.activeSquare });
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
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
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
        if (util_1.isPosInsideRect(this.gui.getBoardRect(), mouseX, mouseY)) {
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
                this.board.dropPiece(this.draggingPiece.piece.color, this.draggingPiece.piece.type, sqOver);
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
exports.isHandArrow = exports.isSquareArrow = exports.isDrop = exports.isMove = exports.sfen2Piecetype = exports.arrowsEqual = exports.isPosInsideRect = void 0;
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL21haW4udHMiLCJzcmMvc2hvZ3VpLnRzIiwic3JjL3R5cGVzLnRzIiwic3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLG1DQUFzRTtBQUN0RSxpQ0FBd0M7QUFFeEMsTUFBcUIsS0FBSztJQUl0QjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWlCLENBQUM7UUFDMUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztRQUU3RCxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUM3QyxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUU3QyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6QixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFB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Q0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3RELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENB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Q0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBRU0sWUFBWSxDQUFDLEtBQXVCLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhLEVBQUUsTUFBYztRQUM1RixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxDQUFTLEVBQUUsQ0FBUztRQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1FBQzNELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLEdB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SUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDeEMsQ0FBQztBQUZELHdCQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQVE7SUFDbEMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDdEQsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEdBQVE7SUFDaEMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztBQUN0RSxDQUFDO0FBRkQsa0NBRUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBQaWVjZSwgUGllY2V0eXBlLCBTcXVhcmUsIENvbG9yLCBhbGxTcXVhcmVzIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHNmZW4yUGllY2V0eXBlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb2FyZCB7XG4gICAgcHJpdmF0ZSBwaWVjZUxpc3Q6IE1hcDxTcXVhcmUsIFBpZWNlPjtcbiAgICBwcml2YXRlIHBsYXllckhhbmRzOiBNYXA8Q29sb3IsIE1hcDxQaWVjZXR5cGUsIG51bWJlcj4gPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdCA9IG5ldyBNYXA8U3F1YXJlLCBQaWVjZT4oKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJIYW5kcyA9IG5ldyBNYXA8Q29sb3IsIE1hcDxQaWVjZXR5cGUsIG51bWJlcj4gPigpO1xuXG4gICAgICAgIGxldCBibGFja0hhbmQgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuICAgICAgICBsZXQgd2hpdGVIYW5kID0gbmV3IE1hcDxQaWVjZXR5cGUsIG51bWJlcj4oKTtcblxuICAgICAgICBibGFja0hhbmQuc2V0KCdwYXduJywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ2xhbmNlJywgMCk7XG4gICAgICAgIGJsYWNrSGFuZC5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdzaWx2ZXInLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgnZ29sZCcsIDApO1xuICAgICAgICBibGFja0hhbmQuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgYmxhY2tIYW5kLnNldCgncm9vaycsIDApO1xuXG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ3Bhd24nLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgnbGFuY2UnLCAwKTtcbiAgICAgICAgd2hpdGVIYW5kLnNldCgna25pZ2h0JywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdnb2xkJywgMCk7XG4gICAgICAgIHdoaXRlSGFuZC5zZXQoJ2Jpc2hvcCcsIDApO1xuICAgICAgICB3aGl0ZUhhbmQuc2V0KCdyb29rJywgMCk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJIYW5kcy5zZXQoJ2JsYWNrJywgYmxhY2tIYW5kKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJIYW5kcy5zZXQoJ3doaXRlJywgd2hpdGVIYW5kKTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogU2V0cyB0aGUgYm9hcmQgdG8gc2ZlbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBzZmVuQm9hcmRGaWVsZCAtIFN1YnN0cmluZyBvZiB0b3RhbCBTRkVOIHRoYXQgaXMgc29sZXkgdGhlIEJvYXJkIGZpZWxkXG4gICAgICovXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHNmZW5Cb2FyZEZpZWxkOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHJvd3MgPSBzZmVuQm9hcmRGaWVsZC5zcGxpdCgnLycpO1xuICAgICAgICBsZXQgY3VyU3F1YXJlSW5kZXggPSAwO1xuICAgICAgICBsZXQgaXNQcm9tb3RlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgciBvZiByb3dzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFyIG9mIHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIGlzTmFOKE51bWJlcihjaGFyKSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvbW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sb3I6IENvbG9yID0gY2hhci50b0xvd2VyQ2FzZSgpID09PSBjaGFyID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwVHlwZSA9IHNmZW4yUGllY2V0eXBlKGNoYXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXRyaWV2ZSBQaWVjZXR5cGUgZnJvbSBTRkVOIGZvciBjaGFyYWN0ZXI6ICcgKyBjaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBpZWNlKHt0eXBlOiBwVHlwZSwgY29sb3I6IGNvbG9yLCBwcm9tb3RlZDogaXNQcm9tb3RlfSwgYWxsU3F1YXJlc1tjdXJTcXVhcmVJbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICBjdXJTcXVhcmVJbmRleCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1clNxdWFyZUluZGV4ID0gY3VyU3F1YXJlSW5kZXggKyBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzUHJvbW90ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG1vdmVQaWVjZShmcm9tU3E6IFNxdWFyZSwgdG9TcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChmcm9tU3EgPT09IHRvU3EpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcGllY2UgPSB0aGlzLnBpZWNlTGlzdC5nZXQoZnJvbVNxKTtcbiAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQodG9TcSwgcGllY2UpO1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3QuZGVsZXRlKGZyb21TcSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGllY2Uoc3E6IFNxdWFyZSk6IFBpZWNlfHVuZGVmaW5lZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnBpZWNlTGlzdC5nZXQoc3EpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRQaWVjZShwaWVjZTogUGllY2UsIHNxOiBTcXVhcmUpIHtcbiAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHNxLCBwaWVjZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyb3BQaWVjZShjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlLCBudW0gPSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZUZyb21IYW5kKGNvbG9yLCBwaWVjZXR5cGUsIG51bSkpIHtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LnNldChzcSwge3R5cGU6IHBpZWNldHlwZSwgY29sb3I6IGNvbG9yfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZDJIYW5kKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGhhbmQgPSB0aGlzLnBsYXllckhhbmRzLmdldChjb2xvcik7XG4gICAgICAgIGxldCBjdXJBbW91bnQgPSBoYW5kPy5nZXQocGllY2V0eXBlKTtcbiAgICAgICAgaWYgKGN1ckFtb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBoYW5kPy5zZXQocGllY2V0eXBlLCBjdXJBbW91bnQgKyBudW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVGcm9tSGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5wbGF5ZXJIYW5kcy5nZXQoY29sb3IpO1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gaGFuZD8uZ2V0KHBpZWNldHlwZSk7XG4gICAgICAgIGlmICghY3VyQW1vdW50IHx8IGN1ckFtb3VudCAtIG51bSA8PSAwKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCAtIG51bSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXROdW1QaWVjZXNJbkhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJIYW5kcy5nZXQoY29sb3IpPy5nZXQocGllY2V0eXBlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0SGFuZChjb2xvcjogQ29sb3IpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZHMuZ2V0KGNvbG9yKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgYWxsU3F1YXJlcywgU3F1YXJlQXJyb3csIEhhbmRBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHVUkge1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgb3JpZW50YXRpb246IENvbG9yO1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgYXJyb3dDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgYXJyb3dDdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIHBpZWNlSW1hZ2VNYXA6IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+O1xuICAgIHByaXZhdGUgc3FTaXplOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBib2FyZFJlY3Q6IFJlY3Q7XG4gICAgcHJpdmF0ZSBwbGF5ZXJIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcbiAgICBwcml2YXRlIG9wcG9uZW50SGFuZEJvdW5kczogTWFwPFBpZWNldHlwZSwgUmVjdD47XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQsIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5ib2FyZCA9IGJvYXJkO1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ2JsYWNrJztcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgbGV0IHRtcEN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBDdHgpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4ID0gdG1wQ3R4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgbGV0IHRtcGFDdHggPSB0aGlzLmFycm93Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGlmICh0bXBhQ3R4KSB7IFxuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eCA9IHRtcGFDdHg7XG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVDYXAgPSAncm91bmQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gb2J0YWluIGFycm93IGRyYXdpbmcgY29udGV4dCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9hZCBpbWFnZXNcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJytwYXduJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdsYW5jZScsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJytrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnZ29sZCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrcm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgna2luZycsIG5ldyBJbWFnZSgpKTtcblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5waWVjZUltYWdlTWFwKSB7XG4gICAgICAgICAgICB2YWx1ZS5zcmMgPSAnLi4vbWVkaWEvcGllY2VzLycgKyBrZXkgKyAnLnBuZyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXR1cCBSZWN0c1xuICAgICAgICB0aGlzLmJvYXJkUmVjdCA9IHsgeDogdGhpcy5jYW52YXMud2lkdGgvNCwgeTogMTUsIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aC8yLCBoZWlnaHQ6IHRoaXMuY2FudmFzLndpZHRoLzIgfTtcbiAgICAgICAgdGhpcy5zcVNpemUgPSB0aGlzLmJvYXJkUmVjdC53aWR0aC85O1xuXG4gICAgICAgIC8vIEhhbmQgUmVjdHNcbiAgICAgICAgbGV0IHRtcEhhbmRSZWN0cyA9IHRoaXMuaW5pdEhhbmRSZWN0TWFwcygpO1xuICAgICAgICB0aGlzLnBsYXllckhhbmRCb3VuZHMgPSB0bXBIYW5kUmVjdHMucGxheWVyO1xuICAgICAgICB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcyA9IHRtcEhhbmRSZWN0cy5vcHBvbmVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRIYW5kUmVjdE1hcHMoKTogeyBwbGF5ZXI6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+LCBvcHBvbmVudDogTWFwPFBpZWNldHlwZSwgUmVjdD4gfSB7XG4gICAgICAgIGxldCBwYWRkaW5nID0gdGhpcy5ib2FyZFJlY3QueCArIHRoaXMuYm9hcmRSZWN0LndpZHRoO1xuICAgICAgICBsZXQgc3EgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IHBIYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIGxldCBvSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjYsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncm9vaycsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdwYXduJywgeyB4OnNxKjIsIHk6c3EqMiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpzcSozLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpzcSozLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnNxKjIsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpzcSwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6c3EqMiwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6c3EsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcblxuICAgICAgICByZXR1cm4geyBwbGF5ZXI6IHBIYW5kTWFwLCBvcHBvbmVudDogb0hhbmRNYXAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhckNhbnZhcygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3NsYXRlZ3JleSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmFycm93Q2FudmFzLndpZHRoLCB0aGlzLmFycm93Q2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdCb2FyZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnc2lsdmVyJztcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMTtcblxuICAgICAgICBmb3IgKGxldCBmID0gMDsgZiA8PSA5OyBmKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gZip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRSZWN0Lng7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKGksIHRoaXMuYm9hcmRSZWN0LnkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGksIHRoaXMuYm9hcmRSZWN0LnkgKyB0aGlzLmJvYXJkUmVjdC5oZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDw9IDk7IHIrKykge1xuICAgICAgICAgICAgbGV0IGkgPSByKnRoaXMuc3FTaXplICsgdGhpcy5ib2FyZFJlY3QueTtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5ib2FyZFJlY3QueCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5ib2FyZFJlY3QueCArIHRoaXMuYm9hcmRSZWN0LndpZHRoLCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ZpbGVSYW5rTGFiZWxzKCk6IHZvaWQge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICcxNXB4IGFyaWFsJ1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IDggLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggU3RyaW5nLmZyb21DaGFyQ29kZShsYWJlbCsxKzk2KSwgdGhpcy5ib2FyZFJlY3QueCArIHRoaXMuYm9hcmRSZWN0LndpZHRoICsgMywgdGhpcy5ib2FyZFJlY3QueSArIHRoaXMuc3FTaXplLzIrKGkqaW50ZXJ2YWwpICk7XG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJztcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCAoMTAgLSAobGFiZWwrMSkpLnRvU3RyaW5nKCksIHRoaXMuYm9hcmRSZWN0LnggKyAodGhpcy5zcVNpemUvMikrKGkqaW50ZXJ2YWwpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3UGllY2UocGllY2U6IFBpZWNlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBwaWVjZS50eXBlO1xuICAgICAgICBpZiAocGllY2UucHJvbW90ZWQpIHtcbiAgICAgICAgICAgIGtleSA9ICcrJyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlQXRTcXVhcmUoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnNxdWFyZTJQb3Moc3EpO1xuICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UocGllY2UsIHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgaWYgKGNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5wbGF5ZXJIYW5kQm91bmRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQoY29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5vcHBvbmVudEhhbmRCb3VuZHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtT2ZQaWVjZXMgPSB0aGlzLmJvYXJkLmdldE51bVBpZWNlc0luSGFuZChjb2xvciwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bU9mUGllY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IG51bU9mUGllY2VzID09PSAwID8gMC4yIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoaGlnaGxpZ2h0OiBIaWdobGlnaHQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGhpZ2hsaWdodC50eXBlID09PSAnaGlkZGVuJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKGhpZ2hsaWdodC5zcSk7XG5cbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBoaWdobGlnaHQuc3R5bGU7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gaGlnaGxpZ2h0LnN0eWxlO1xuICAgICAgICBpZiAoaGlnaGxpZ2h0LmFscGhhKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGhpZ2hsaWdodC5hbHBoYTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2goaGlnaGxpZ2h0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBwb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvMjAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocG9zLnggKyA0LCBwb3MueSArIDQsIHRoaXMuc3FTaXplIC0gOCwgdGhpcy5zcVNpemUgLSA4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aC81MDA7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbi8qXG4gICAgICAgICAgICBjYXNlICdkb3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhwb3MuY2VudGVyWCwgcG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzgsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4qL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93KHN0eWxlOiBzdHJpbmcsIGZyb214OiBudW1iZXIsIGZyb215OiBudW1iZXIsIHRveDogbnVtYmVyLCB0b3k6IG51bWJlcikge1xuICAgICAgICB0aGlzLmFycm93Q3R4LnNhdmUoKTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0b3kgLSBmcm9teSwgdG94IC0gZnJvbXgpO1xuICAgICAgICBsZXQgcmFkaXVzID0gdGhpcy5hcnJvd0NhbnZhcy53aWR0aC80MDtcbiAgICAgICAgbGV0IHggPSB0b3ggLSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gdG95IC0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IDIqcmFkaXVzLzU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiBcbiAgICAgICAgLy8gRHJhdyBsaW5lXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKGZyb214LCBmcm9teSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuIFxuICAgICAgICAvLyBEcmF3IGFycm93IGhlYWRcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiBcbiAgICAgICAgbGV0IHhjZW50ZXIgPSAodG94ICsgeCkvMjtcbiAgICAgICAgbGV0IHljZW50ZXIgPSAodG95ICsgeSkvMjtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8odG94LCB0b3kpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1NxdWFyZUFycm93KGFycm93OiBTcXVhcmVBcnJvdykge1xuICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy50b1NxKTtcbiAgICAgICAgbGV0IGZyb21TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5mcm9tU3EpO1xuXG4gICAgICAgIGlmIChhcnJvdy50b1NxICE9PSBhcnJvdy5mcm9tU3EpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCBmcm9tU3FQb3MuY2VudGVyWCwgZnJvbVNxUG9zLmNlbnRlclksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBhcnJvdy5zdHlsZTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvNTAwO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguYXJjKHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZLCB0aGlzLnNxU2l6ZS8yIC0gNCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SGFuZEFycm93KGFycm93OiBIYW5kQXJyb3cpIHtcbiAgICAgICAgbGV0IHJlY3Q7XG4gICAgICAgIGlmIChhcnJvdy5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgcmVjdCA9IHRoaXMucGxheWVySGFuZEJvdW5kcy5nZXQoYXJyb3cucGllY2V0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgcmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kQm91bmRzLmdldChhcnJvdy5waWVjZXR5cGUpO1xuICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlY3QpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGlmICghYXJyb3cudG9TcSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy50b1NxKTtcblxuICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgcmVjdC54KyhyZWN0LndpZHRoLzIpLCByZWN0LnkrKHJlY3QuaGVpZ2h0LzIpLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdBcnJvd0NhbnZhcyhhbHBoYTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLmFycm93Q2FudmFzLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxLjA7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdJbnZlcnRlZChpbWFnZTogSFRNTEltYWdlRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcblxuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoeCArIHdpZHRoLzIsIHkgKyBoZWlnaHQvMik7XG4gICAgICAgIHRoaXMuY3R4LnJvdGF0ZShNYXRoLlBJKTtcbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKCAtKHggKyB3aWR0aC8yKSwgLSh5ICsgaGVpZ2h0LzIpICk7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWFnZSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBwb3MyU3F1YXJlKHg6IG51bWJlciwgeTogbnVtYmVyKTogU3F1YXJlfHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBjb2wgPSBNYXRoLmZsb29yKCAoeCAtIHRoaXMuYm9hcmRSZWN0LngpL3RoaXMuc3FTaXplICk7XG4gICAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKCAoeSAtIHRoaXMuYm9hcmRSZWN0LnkpL3RoaXMuc3FTaXplKTtcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPCAwIHx8IHJvdyA8IDAgfHwgY29sID4gOSAtIDEgfHwgcm93ID4gOSAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFsbFNxdWFyZXNbIDkqcm93ICsgY29sIF07XG4gICAgfVxuXG4gICAgcHVibGljIHNxdWFyZTJQb3Moc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgY29sID0gOSAtIHBhcnNlSW50KHNxWzBdKTtcbiAgICAgICAgbGV0IHJvdyA9IHNxLmNoYXJDb2RlQXQoMSkgLSA5NztcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGxldCB4ID0gdGhpcy5ib2FyZFJlY3QueCArIChjb2wgKiB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIGxldCB5ID0gdGhpcy5ib2FyZFJlY3QueSArIHJvdyAqIHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgY2VudGVyWCA9IHggKyAodGhpcy5zcVNpemUvMik7XG4gICAgICAgIGxldCBjZW50ZXJZID0geSArICh0aGlzLnNxU2l6ZS8yKVxuICAgICAgICByZXR1cm4geyB4LCB5LCBjZW50ZXJYLCBjZW50ZXJZIH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJvYXJkUmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRSZWN0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTcVNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNxU2l6ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGxheWVySGFuZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3Bwb25lbnRIYW5kQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHBvbmVudEhhbmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9yaWVudGF0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB9XG59IiwiaW1wb3J0IFNob0dVSSBmcm9tIFwiLi9zaG9ndWlcIjtcbmltcG9ydCB7IFNxdWFyZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmxldCBzaG9ndWkgPSBuZXcgU2hvR1VJKHtvbk1vdmVQaWVjZTogb25QaWVjZU1vdmV9KTtcblxuc2hvZ3VpLnNldFBvc2l0aW9uKCdsbnNnazJubC8xcjRnczEvcDFwcHBwMXBwLzFwNHAyLzdQMS8yUDYvUFAxUFBQUDFQLzFTRzRSMS9MTjJLR1NOTCBiIDdiJyk7XG5cbi8qXG5mdW5jdGlvbiB0ZXN0YWRkKCkge1xuICAgIHNob2d1aS5hZGRIaWdobGlnaHQoe3N0eWxlOiAncmVkJywgdHlwZTogJ291dGxpbmUnLCBzcTogJzFhJ30pO1xuICAgIHNob2d1aS5kcmF3R2FtZSgpO1xufVxuXG5mdW5jdGlvbiB0ZXN0cmVtb3ZlKCkge1xuICAgIHNob2d1aS5yZW1vdmVIaWdobGlnaHQoe3N0eWxlOiAncmVkJywgdHlwZTogJ291dGxpbmUnLCBzcTogJzFhJ30pO1xuICAgIHNob2d1aS5kcmF3R2FtZSgpO1xufVxuXG5mdW5jdGlvbiBibGluaygpIHtcbiAgICB0ZXN0YWRkKCk7XG4gICAgc2V0VGltZW91dCggdGVzdHJlbW92ZSwgMzAwKTtcbiAgICBzZXRUaW1lb3V0KCB0ZXN0YWRkLCA2MDApO1xuICAgIHNldFRpbWVvdXQoIHRlc3RyZW1vdmUsIDkwMCk7XG4gICAgc2V0VGltZW91dCggdGVzdGFkZCwgMTIwMCk7XG4gICAgc2V0VGltZW91dCggdGVzdHJlbW92ZSwgMTUwMCk7XG59XG5cbmJsaW5rKCk7XG4qL1xuXG5mdW5jdGlvbiBvblBpZWNlTW92ZShzcmNTcTogU3F1YXJlLCBkZXN0U3E6IFNxdWFyZSkge1xuICAgIHNob2d1aS5jbGVhckhpZ2hsaWdodHMoKTtcbiAgICBzaG9ndWkuYWRkSGlnaGxpZ2h0KHtzdHlsZTogJ2xpZ2h0Z3JleScsIHR5cGU6ICdmaWxsJywgc3E6IHNyY1NxLCB9KTtcbiAgICBzaG9ndWkuYWRkSGlnaGxpZ2h0KHtzdHlsZTogJ2xpZ2h0Z3JleScsIHR5cGU6ICdmaWxsJywgc3E6IGRlc3RTcSwgfSk7XG4gICAgLy9zaG9ndWkuYWRkQXJyb3coe3N0eWxlOiAnYmxhY2snLCBmcm9tU3E6IHNyY1NxLCB0b1NxOiBkZXN0U3F9KTtcbiAgICBjb25zb2xlLmxvZyggc3JjU3EgKyBcIi0tPlwiICsgZGVzdFNxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0iLCJpbXBvcnQgR1VJIGZyb20gXCIuL2d1aVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgeyBDb25maWcsIFBpZWNlLCBTcXVhcmUsIGFsbFNxdWFyZXMsIENvbG9yLCBTcXVhcmVBcnJvdywgSGFuZEFycm93LCBIaWdobGlnaHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgaXNQb3NJbnNpZGVSZWN0LCBpc1NxdWFyZUFycm93LCBpc0hhbmRBcnJvdywgYXJyb3dzRXF1YWwsIHNmZW4yUGllY2V0eXBlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbnRlcmZhY2UgRHJhZ2dpbmdQaWVjZSB7XG4gICAgcGllY2U6IFBpZWNlLFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvR1VJIHtcbiAgICBwcml2YXRlIGNvbmZpZzogQ29uZmlnO1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuICAgIHByaXZhdGUgY3VycmVudEFycm93OiBTcXVhcmVBcnJvd3xIYW5kQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dMaXN0OiAoU3F1YXJlQXJyb3d8SGFuZEFycm93KVtdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgaGlnaGxpZ2h0TGlzdDogSGlnaGxpZ2h0W107XG4gICAgcHJpdmF0ZSBkcmFnZ2luZ1BpZWNlOiBEcmFnZ2luZ1BpZWNlfHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG5cbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gMTM1MDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMud2lkdGgvMiArIDIwO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgdGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdCA9IFtdO1xuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZURvd24oZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZVVwKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZU1vdmUoZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5ndWkuZmxpcEJvYXJkKCk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQb3NpdGlvbihzZmVuOiBzdHJpbmcpIHtcbiAgICAgICAgLy9UT0RPOiBDaGVjayBmb3IgdmFsaWQgc2ZlblxuXG4gICAgICAgIGxldCBzZmVuQXJyID0gc2Zlbi5zcGxpdCgnICcpO1xuICAgICAgICBsZXQgc2ZlbkJvYXJkID0gc2ZlbkFyclswXTtcbiAgICAgICAgbGV0IHNmZW5IYW5kID0gc2ZlbkFyclsyXTtcblxuICAgICAgICB0aGlzLmJvYXJkLnNldFBvc2l0aW9uKHNmZW5Cb2FyZCk7XG5cbiAgICAgICAgaWYgKCFzZmVuSGFuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFtdCA9IDE7XG4gICAgICAgIGZvciAobGV0IGNoYXIgb2Ygc2ZlbkhhbmQpIHtcbiAgICAgICAgICAgIGxldCBwdHlwZSA9IHNmZW4yUGllY2V0eXBlKGNoYXIpO1xuICAgICAgICAgICAgaWYgKCAhaXNOYU4oTnVtYmVyKGNoYXIpKSApIHtcbiAgICAgICAgICAgICAgICBhbXQgPSBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghcHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFUlJPUjogQ2Fubm90IGdldCBwaWVjZXR5cGUgZnJvbSBzZmVuIGNoYXJhY3RlciAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoYXIudG9VcHBlckNhc2UoKSA9PT0gY2hhcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLmFkZDJIYW5kKCdibGFjaycsIHB0eXBlLCBhbXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhci50b0xvd2VyQ2FzZSgpID09PSBjaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuYWRkMkhhbmQoJ3doaXRlJywgcHR5cGUsIGFtdCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYW10ID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmZsaXBCb2FyZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTcXVhcmVIaWdobGlnaHRlZChzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBzcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSGlnaGxpZ2h0KGhpZ2hsaWdodDogSGlnaGxpZ2h0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1NxdWFyZUhpZ2hsaWdodGVkKGhpZ2hsaWdodC5zcSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdC5wdXNoKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBoaWdobGlnaHQuc3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJIaWdobGlnaHRzKCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQXJyb3coYXJyb3c6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoYXJyb3cudG9TcSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0LnB1c2goYXJyb3cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlQXJyb3coYXJyb3c6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IGNtcEFycm93IG9mIHRoaXMuYXJyb3dMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIGFycm93c0VxdWFsKGNtcEFycm93LCBhcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0xpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlUGllY2Uoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25Nb3ZlUGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoQ2FudmFzKCkge1xuICAgICAgICB0aGlzLmd1aS5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGZvciAobGV0IGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmhpZ2hsaWdodFNxdWFyZShoaWdobGlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoIHtzdHlsZTogJ21pbnRjcmVhbScsIHR5cGU6ICdmaWxsJywgc3E6dGhpcy5hY3RpdmVTcXVhcmV9ICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5ndWkuZHJhd0ZpbGVSYW5rTGFiZWxzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSBvZiBhbGxTcXVhcmVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUgJiYgdGhpcy5kcmFnZ2luZ1BpZWNlKSB7IC8vIERvbid0IGRyYXcgdGhlIGN1cnJlbnRseSBkcmFnZ2luZyBwaWVjZSBvbiBpdHMgc3F1YXJlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlID09PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdQaWVjZUF0U3F1YXJlKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmQoJ2JsYWNrJyk7IFxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnd2hpdGUnKTtcblxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3UGllY2UodGhpcy5kcmFnZ2luZ1BpZWNlLnBpZWNlLCB0aGlzLmRyYWdnaW5nUGllY2UueCAtIHRoaXMuZ3VpLmdldFNxU2l6ZSgpLzIsIHRoaXMuZHJhZ2dpbmdQaWVjZS55IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgYXJyb3cgb2YgdGhpcy5hcnJvd0xpc3QpIHtcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0Fycm93Q2FudmFzKDAuNik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3QXJyb3coYXJyb3c6IFNxdWFyZUFycm93fEhhbmRBcnJvdykge1xuICAgICAgICBpZiAoIGlzU3F1YXJlQXJyb3coYXJyb3cpICkge1xuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1NxdWFyZUFycm93KGFycm93KTtcbiAgICAgICAgfSBlbHNlIGlmICggaXNIYW5kQXJyb3coYXJyb3cpICkge1xuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmRBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMub25SaWdodENsaWNrKGV2ZW50KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xlYXJBcnJvd3MoKTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkUmVjdCgpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gY2xpY2tlZFNxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gY2xpY2tlZFNxO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAhPT0gY2xpY2tlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVQaWVjZSh0aGlzLmFjdGl2ZVNxdWFyZSwgY2xpY2tlZFNxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0UGxheWVySGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbnVtUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQodGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIW51bVBpZWNlcyB8fCBudW1QaWVjZXMgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHt0eXBlOiBrZXksIGNvbG9yOiB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpfTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB7cGllY2U6IHBpZWNlLCB4OiBtb3VzZVgsIHk6IG1vdXNlWX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0T3Bwb25lbnRIYW5kQm91bmRzKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBsZXQgbnVtUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQob3Bwb25lbnRDb2xvciwga2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIW51bVBpZWNlcyB8fCBudW1QaWVjZXMgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHt0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yfTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB7cGllY2U6IHBpZWNlLCB4OiBtb3VzZVgsIHk6IG1vdXNlWX07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VVcChldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHRoaXMuZ3VpLmdldEJvYXJkUmVjdCgpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiB0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gc3FPdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVQaWVjZSh0aGlzLmFjdGl2ZVNxdWFyZSwgc3FPdmVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRyYWdnaW5nUGllY2UgJiYgIXRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5kcm9wUGllY2UodGhpcy5kcmFnZ2luZ1BpZWNlLnBpZWNlLmNvbG9yLCB0aGlzLmRyYWdnaW5nUGllY2UucGllY2UudHlwZSwgc3FPdmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7IC8vIFJpZ2h0IG1vdXNlIGJ1dHRvblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5yZW1vdmVBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGhvdmVyU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcblxuICAgICAgICBpZiAoIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnggPSBtb3VzZVg7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueSA9IG1vdXNlWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgaWYgKGhvdmVyU3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy50b1NxID0gaG92ZXJTcTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cudG9TcSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SaWdodENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgY2xpY2tlZFNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG5cbiAgICAgICAgaWYgKGNsaWNrZWRTcSAmJiAhdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6ICdibHVlJywgZnJvbVNxOiBjbGlja2VkU3EsIHRvU3E6IGNsaWNrZWRTcSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAnYmxhY2snLCBwaWVjZXR5cGU6IGtleSwgY29sb3I6IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogJ2JsYWNrJywgcGllY2V0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgIH1cbn0iLCJleHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gICAgb3JpZW50YXRpb24/OiBDb2xvcixcbiAgICBvbk1vdmVQaWVjZT86ICguLi5hcmdzOiBTcXVhcmVbXSkgPT4gYm9vbGVhbixcbiAgICBvblNlbGVjdFBpZWNlPzogKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkgPT4gYm9vbGVhbixcbiAgICBvbkRlc2VsZWN0UGllY2U/OiAoKSA9PiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIENvbG9yID0gJ2JsYWNrJyB8ICd3aGl0ZSc7XG5leHBvcnQgdHlwZSBQaWVjZXR5cGUgPSAna2luZycgfCAncm9vaycgfCAnYmlzaG9wJyAgfCAnZ29sZCcgfCAnc2lsdmVyJyB8ICdrbmlnaHQnIHwgJ2xhbmNlJyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIFNxdWFyZSA9ICc5YScgfCAnOGEnIHwgJzdhJyB8ICc2YScgfCAnNWEnIHwgJzRhJyB8ICczYScgfCAnMmEnIHwgJzFhJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWInIHwgJzhiJyB8ICc3YicgfCAnNmInIHwgJzViJyB8ICc0YicgfCAnM2InIHwgJzJiJyB8ICcxYicgfFxuICAgICAgICAgICAgICAgICAgICAgJzljJyB8ICc4YycgfCAnN2MnIHwgJzZjJyB8ICc1YycgfCAnNGMnIHwgJzNjJyB8ICcyYycgfCAnMWMnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZCcgfCAnOGQnIHwgJzdkJyB8ICc2ZCcgfCAnNWQnIHwgJzRkJyB8ICczZCcgfCAnMmQnIHwgJzFkJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWUnIHwgJzhlJyB8ICc3ZScgfCAnNmUnIHwgJzVlJyB8ICc0ZScgfCAnM2UnIHwgJzJlJyB8ICcxZScgfFxuICAgICAgICAgICAgICAgICAgICAgJzlmJyB8ICc4ZicgfCAnN2YnIHwgJzZmJyB8ICc1ZicgfCAnNGYnIHwgJzNmJyB8ICcyZicgfCAnMWYnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZycgfCAnOGcnIHwgJzdnJyB8ICc2ZycgfCAnNWcnIHwgJzRnJyB8ICczZycgfCAnMmcnIHwgJzFnJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWgnIHwgJzhoJyB8ICc3aCcgfCAnNmgnIHwgJzVoJyB8ICc0aCcgfCAnM2gnIHwgJzJoJyB8ICcxaCcgfFxuICAgICAgICAgICAgICAgICAgICAgJzlpJyB8ICc4aScgfCAnN2knIHwgJzZpJyB8ICc1aScgfCAnNGknIHwgJzNpJyB8ICcyaScgfCAnMWknO1xuXG5leHBvcnQgdHlwZSBSYW5rID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnIHwgJ2knO1xuZXhwb3J0IHR5cGUgRmlsZSA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4IHwgOTtcblxuZXhwb3J0IGNvbnN0IHJhbmtzOiBSYW5rW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJ107XG5leHBvcnQgY29uc3QgZmlsZXM6IEZpbGVbXSA9IFs5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxXTtcbmV4cG9ydCBjb25zdCBhbGxTcXVhcmVzOiBTcXVhcmVbXSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQoLi4ucmFua3MubWFwKHIgPT4gZmlsZXMubWFwKGMgPT4gYytyKSkpO1xuXG5leHBvcnQgdHlwZSBIaWdobGlnaHRUeXBlID0gJ2ZpbGwnIHwgJ291dGxpbmUnIHwgJ2NpcmNsZScgfCAnaGlkZGVuJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgICB0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHByb21vdGVkPzogYm9vbGVhblxufVxuZXhwb3J0IGludGVyZmFjZSBNb3ZlIHtcbiAgICBzcmM6IFNxdWFyZSxcbiAgICBkZXN0OiBTcXVhcmUsXG59XG5leHBvcnQgaW50ZXJmYWNlIERyb3Age1xuICAgIHBpZWNlOiBQaWVjZSxcbiAgICBkZXN0OiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG59XG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUFycm93IHsgLy8gQXJyb3cgZ29pbmcgZnJvbSBvbmUgYm9hcmQgc3F1YXJlIHRvIGFub3RoZXJcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIGZyb21TcTogU3F1YXJlLFxuICAgIHRvU3E6IFNxdWFyZVxufVxuZXhwb3J0IGludGVyZmFjZSBIYW5kQXJyb3cgeyAvLyBBcnJvdyBnb2luZyBmcm9tIGEgcGllY2UgaW4gaGFuZCB0byBhIGJvYXJkIHNxdWFyZVxuICAgIHN0eWxlOiBzdHJpbmcsXG4gICAgcGllY2V0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHRvU3E/OiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSGlnaGxpZ2h0IHtcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIHR5cGU6IEhpZ2hsaWdodFR5cGUsXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgc3E6IFNxdWFyZVxufSIsImltcG9ydCB7IFJlY3QsIE1vdmUsIERyb3AsIFNxdWFyZUFycm93LCBIYW5kQXJyb3csIFBpZWNldHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBzb21ldGhpbmcgaXMgaW5zaWRlIHRoZSBSZWN0XG4gKiBAcGFyYW0gcmVjdCAtIFJlY3RhbmdsZSB0byBjaGVjayBpZiBwb3MgaXMgaW5zaWRlXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiBwb3NpdGlvblxuICogQHBhcmFtIHkgLSBZIGNvb3JkaWFudGUgb2YgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zSW5zaWRlUmVjdChyZWN0OiBSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICh4IDwgcmVjdC54IHx8IHggPj0gcmVjdC54ICsgcmVjdC53aWR0aCB8fFxuICAgICAgICB5IDwgcmVjdC55IHx8IHkgPj0gcmVjdC55ICsgcmVjdC5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycm93c0VxdWFsKGFycm93MTogU3F1YXJlQXJyb3d8SGFuZEFycm93LCBhcnJvdzI6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgIGlmICggaXNTcXVhcmVBcnJvdyhhcnJvdzEpICYmIGlzU3F1YXJlQXJyb3coYXJyb3cyKSApIHtcbiAgICAgICAgaWYgKCBhcnJvdzEudG9TcSA9PT0gYXJyb3cyLnRvU3EgJiYgYXJyb3cxLmZyb21TcSA9PT0gYXJyb3cyLmZyb21TcSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCBpc0hhbmRBcnJvdyhhcnJvdzEpICYmIGlzSGFuZEFycm93KGFycm93MikgKSB7XG4gICAgICAgIGlmIChhcnJvdzEucGllY2V0eXBlID09PSBhcnJvdzIucGllY2V0eXBlICYmIGFycm93MS5jb2xvciA9PT0gYXJyb3cyLmNvbG9yKSB7XG4gICAgICAgICAgICBpZiAoIGFycm93MS50b1NxICYmIGFycm93Mi50b1NxICYmIGFycm93MS50b1NxID09PSBhcnJvdzIudG9TcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNmZW4yUGllY2V0eXBlKHNmZW46IHN0cmluZyk6IFBpZWNldHlwZXx1bmRlZmluZWQge1xuICAgIHN3aXRjaCAoc2Zlbi50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1AnOlxuICAgICAgICBjYXNlICdwJzpcbiAgICAgICAgICAgIHJldHVybiAncGF3bic7XG4gICAgICAgIGNhc2UgJ0wnOlxuICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAgIHJldHVybiAnbGFuY2UnO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgY2FzZSAnbic6XG4gICAgICAgICAgICByZXR1cm4gJ2tuaWdodCc7XG4gICAgICAgIGNhc2UgJ1MnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiAnc2lsdmVyJztcbiAgICAgICAgY2FzZSAnRyc6XG4gICAgICAgIGNhc2UgJ2cnOlxuICAgICAgICAgICAgcmV0dXJuICdnb2xkJztcbiAgICAgICAgY2FzZSAnUic6XG4gICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgcmV0dXJuICdyb29rJztcbiAgICAgICAgY2FzZSAnQic6XG4gICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgcmV0dXJuICdiaXNob3AnO1xuICAgICAgICBjYXNlICdLJzpcbiAgICAgICAgY2FzZSAnayc6XG4gICAgICAgICAgICByZXR1cm4gJ2tpbmcnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vdmUoYXJnOiBhbnkpOiBhcmcgaXMgTW92ZSB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3JjICYmIGFyZy5kZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcm9wKGFyZzogYW55KTogYXJnIGlzIERyb3Age1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnBpZWNlICYmIGFyZy5kZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTcXVhcmVBcnJvdyhhcmc6IGFueSk6IGFyZyBpcyBTcXVhcmVBcnJvdyB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3R5bGUgJiYgYXJnLmZyb21TcSAmJiBhcmcudG9TcTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSGFuZEFycm93KGFyZzogYW55KTogYXJnIGlzIEhhbmRBcnJvdyB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3R5bGUgJiYgYXJnLnBpZWNldHlwZSAmJiBhcmcuY29sb3IgJiYgYXJnLnRvU3E7XG59Il19
