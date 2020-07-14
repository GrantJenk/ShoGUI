(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Board {
    constructor() {
        this.pieceList = new Map();
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
}
exports.default = Board;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class GUI {
    constructor(board, playerHands, canvas) {
        this.handMap = playerHands;
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
            let pos = this.square2Pos(sq);
            this.drawPiece(piece, pos.x, pos.y);
            return true;
        }
        return false;
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
            rect = this.playerHandRectMap.get(arrow.piecetype);
        }
        else {
            rect = this.opponentHandRectMap.get(arrow.piecetype);
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
        return types_1.allSquares[9 * col + row];
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
    getPlayerHandRectMap() {
        return this.playerHandRectMap;
    }
    getOpponentHandRectMap() {
        return this.opponentHandRectMap;
    }
    getOrientation() {
        return this.orientation;
    }
}
exports.default = GUI;
},{"./types":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Hand {
    constructor() {
        this.pieces = new Map();
        this.empty();
    }
    empty() {
        this.pieces.set('pawn', 1);
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
    shogui.addArrow({ style: 'black', fromSq: srcSq, toSq: destSq });
    console.log(srcSq + "-->" + destSq);
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
const types_1 = require("./types");
const util_1 = require("./util");
class ShoGUI {
    constructor(config) {
        let self = this;
        this.config = config;
        this.board = new board_1.default();
        this.handMap = new Map();
        this.handMap.set('black', new hand_1.default());
        this.handMap.set('white', new hand_1.default());
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1350;
        this.canvas.height = this.canvas.width / 2 + 20;
        this.gui = new gui_1.default(this.board, this.handMap, this.canvas);
        this.arrowList = [];
        this.highlightList = [];
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
        });
        document.body.appendChild(this.canvas);
        window.onload = function () {
            window.requestAnimationFrame(() => self.drawGame());
        };
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
            this.gui.highlightSquare({ style: 'mintcream', type: 'fill', sq: this.activeSquare });
        }
        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight);
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
                if (this.activeSquare === sqOver) {
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
},{"./board":1,"./gui":2,"./hand":3,"./types":6,"./util":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSquares = exports.files = exports.ranks = void 0;
exports.ranks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
exports.files = [9, 8, 7, 6, 5, 4, 3, 2, 1];
exports.allSquares = Array.prototype.concat(...exports.files.map(c => exports.ranks.map(r => c + r)));
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHandArrow = exports.isSquareArrow = exports.isDrop = exports.isMove = exports.arrowsEqual = exports.isPosInsideRect = void 0;
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
},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9ib2FyZC50cyIsInNyYy9ndWkudHMiLCJzcmMvaGFuZC50cyIsInNyYy9tYWluLnRzIiwic3JjL3Nob2d1aS50cyIsInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFQSxNQUFxQixLQUFLO0lBR3RCO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztJQUM5QyxDQUFDO0lBRU0sU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFZO1FBQ3pDLElBQUksTUFBTSxLQUFLLElBQUk7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUVsQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVEsQ0FBQyxFQUFVO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFZLEVBQUUsRUFBVTtRQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNKO0FBM0JELHdCQTJCQzs7OztBQzdCRCxtQ0FBK0c7QUFJL0csTUFBcUIsR0FBRztJ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QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM3QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUNyRCxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3RELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUss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QUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJ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QU8sSUFBSSxDQUFDO2FBQ2Y7U0FDSjtLQUNKO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQWJELGtDQWFDO0FBRUQsU0FBZ0IsTUFBTSxDQUFDLEdBQVE7SUFDM0IsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3RDLENBQUM7QUFGRCx3QkFFQztBQUVELFNBQWdCLE1BQU0sQ0FBQyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztBQUN4QyxDQUFDO0FBRkQsd0JBRUM7QUFFRCxTQUFnQixhQUFhLENBQUMsR0FBUTtJQUNsQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQztBQUN0RCxDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFnQixXQUFXLENBQUMsR0FBUTtJQUNoQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ3RFLENBQUM7QUFGRCxrQ0FFQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFBpZWNlLCBTcXVhcmUgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb2FyZCB7XG4gICAgcHJpdmF0ZSBwaWVjZUxpc3Q6IE1hcDxTcXVhcmUsIFBpZWNlPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdCA9IG5ldyBNYXA8U3F1YXJlLCBQaWVjZT4oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZVBpZWNlKGZyb21TcTogU3F1YXJlLCB0b1NxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGZyb21TcSA9PT0gdG9TcSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCBwaWVjZSA9IHRoaXMucGllY2VMaXN0LmdldChmcm9tU3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LnNldCh0b1NxLCBwaWVjZSk7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5kZWxldGUoZnJvbVNxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQaWVjZShzcTogU3F1YXJlKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGllY2VMaXN0LmdldChzcSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHBpZWNlKTtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgYWxsU3F1YXJlcywgU3F1YXJlQXJyb3csIEhhbmRBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEhhbmQgZnJvbSBcIi4vaGFuZFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHVUkge1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgaGFuZE1hcDogTWFwPENvbG9yLCBIYW5kPjtcbiAgICBwcml2YXRlIG9yaWVudGF0aW9uOiBDb2xvcjtcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIGFycm93Q2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGFycm93Q3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBwaWVjZUltYWdlTWFwOiBNYXA8UGllY2V0eXBlLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRSZWN0OiBSZWN0O1xuICAgIHByaXZhdGUgcGxheWVySGFuZFJlY3RNYXA6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgb3Bwb25lbnRIYW5kUmVjdE1hcDogTWFwPFBpZWNldHlwZSwgUmVjdD47XG5cbiAgICBjb25zdHJ1Y3Rvcihib2FyZDogQm9hcmQsIHBsYXllckhhbmRzOiBNYXA8Q29sb3IsIEhhbmQ+LCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaGFuZE1hcCA9IHBsYXllckhhbmRzO1xuICAgICAgICB0aGlzLmJvYXJkID0gYm9hcmQ7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSAnYmxhY2snO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICBsZXQgdG1wQ3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKHRtcEN0eCkge1xuICAgICAgICAgICAgdGhpcy5jdHggPSB0bXBDdHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBvYnRhaW4gZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmFycm93Q2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICBsZXQgdG1wYUN0eCA9IHRoaXMuYXJyb3dDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKHRtcGFDdHgpIHsgXG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4ID0gdG1wYUN0eDtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHgubGluZUNhcCA9ICdyb3VuZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBvYnRhaW4gYXJyb3cgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIGltYWdlc1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgSFRNTEltYWdlRWxlbWVudD4oKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgncGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgLy90aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrcGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnbGFuY2UnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIC8vdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIC8vdGhpcy5waWVjZUltYWdlTWFwLnNldCgnK2tuaWdodCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5waWVjZUltYWdlTWFwLnNldCgnc2lsdmVyJywgbmV3IEltYWdlKCkpO1xuICAgICAgICAvL3RoaXMucGllY2VJbWFnZU1hcC5zZXQoJytzaWx2ZXInLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2dvbGQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMucGllY2VJbWFnZU1hcC5zZXQoJ2Jpc2hvcCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgLy90aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCcrYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICAvL3RoaXMucGllY2VJbWFnZU1hcC5zZXQoJytyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLnBpZWNlSW1hZ2VNYXAuc2V0KCdraW5nJywgbmV3IEltYWdlKCkpO1xuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBpZWNlSW1hZ2VNYXApIHtcbiAgICAgICAgICAgIHZhbHVlLnNyYyA9ICcuLi9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIFJlY3RzXG4gICAgICAgIHRoaXMuYm9hcmRSZWN0ID0geyB4OiB0aGlzLmNhbnZhcy53aWR0aC80LCB5OiAxNSwgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLzIsIGhlaWdodDogdGhpcy5jYW52YXMud2lkdGgvMiB9O1xuICAgICAgICB0aGlzLnNxU2l6ZSA9IHRoaXMuYm9hcmRSZWN0LndpZHRoLzk7XG5cbiAgICAgICAgLy8gSGFuZCBSZWN0c1xuICAgICAgICBsZXQgdG1wSGFuZFJlY3RzID0gdGhpcy5pbml0SGFuZFJlY3RNYXBzKCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZFJlY3RNYXAgPSB0bXBIYW5kUmVjdHMucGxheWVyO1xuICAgICAgICB0aGlzLm9wcG9uZW50SGFuZFJlY3RNYXAgPSB0bXBIYW5kUmVjdHMub3Bwb25lbnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0SGFuZFJlY3RNYXBzKCk6IHsgcGxheWVyOiBNYXA8UGllY2V0eXBlLCBSZWN0Piwgb3Bwb25lbnQ6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+IH0ge1xuICAgICAgICBsZXQgcGFkZGluZyA9IHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aDtcbiAgICAgICAgbGV0IHNxID0gdGhpcy5zcVNpemU7XG4gICAgICAgIGxldCBwSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBsZXQgb0hhbmRNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgUmVjdD4oKTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdwYXduJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo2LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnBhZGRpbmcgKyBzcS8yLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnBhZGRpbmcgKyBzcS8yLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2dvbGQnLCB7IHg6cGFkZGluZyArIHNxKig1LzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnYmlzaG9wJywgeyB4OnBhZGRpbmcgKyBzcSooMy8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6cGFkZGluZyArIHNxKig1LzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncGF3bicsIHsgeDpzcSoyLCB5OnNxKjIsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6c3EqMywgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6c3EqMywgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpzcSoyLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2dvbGQnLCB7IHg6c3EsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnYmlzaG9wJywgeyB4OnNxKjIsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdyb29rJywgeyB4OnNxLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcGxheWVyOiBwSGFuZE1hcCwgb3Bwb25lbnQ6IG9IYW5kTWFwIH07XG4gICAgfVxuXG4gICAgcHVibGljIGZsaXBCb2FyZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJDYW52YXMoKSB7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdzbGF0ZWdyZXknO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5hcnJvd0NhbnZhcy53aWR0aCwgdGhpcy5hcnJvd0NhbnZhcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3Qm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gJ3NpbHZlcic7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDE7XG5cbiAgICAgICAgZm9yIChsZXQgZiA9IDA7IGYgPD0gOTsgZisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IGYqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkUmVjdC54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhpLCB0aGlzLmJvYXJkUmVjdC55ICsgdGhpcy5ib2FyZFJlY3QuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRSZWN0Lnk7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuYm9hcmRSZWN0LngsIGkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdGaWxlUmFua0xhYmVscygpOiB2b2lkIHtcbiAgICAgICAgbGV0IGludGVydmFsID0gdGhpcy5zcVNpemU7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMTVweCBhcmlhbCdcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSA4IC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoIFN0cmluZy5mcm9tQ2hhckNvZGUobGFiZWwrMSs5NiksIHRoaXMuYm9hcmRSZWN0LnggKyB0aGlzLmJvYXJkUmVjdC53aWR0aCArIDMsIHRoaXMuYm9hcmRSZWN0LnkgKyB0aGlzLnNxU2l6ZS8yKyhpKmludGVydmFsKSApO1xuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ3RvcCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggKDEwIC0gKGxhYmVsKzEpKS50b1N0cmluZygpLCB0aGlzLmJvYXJkUmVjdC54ICsgKHRoaXMuc3FTaXplLzIpKyhpKmludGVydmFsKSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlKHBpZWNlOiBQaWVjZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMucGllY2VJbWFnZU1hcC5nZXQocGllY2UudHlwZSk7XG4gICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBsb2FkIHBpZWNlIGltYWdlOiBcIiArIHBpZWNlLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlQXRTcXVhcmUoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnNxdWFyZTJQb3Moc3EpO1xuICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UocGllY2UsIHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQoY29sb3IpO1xuICAgICAgICAgICAgaWYgKCFoYW5kKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdib3R0b20nO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICBpZiAoY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLnBsYXllckhhbmRSZWN0TWFwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gaGFuZC5nZXROdW1PZlBpZWNlcyhrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLnBpZWNlSW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMub3Bwb25lbnRIYW5kUmVjdE1hcCkge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IGhhbmQuZ2V0TnVtT2ZQaWVjZXMoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG51bU9mUGllY2VzID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IG51bU9mUGllY2VzID09PSAwID8gMC4yIDogMTtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5waWVjZUltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoaGlnaGxpZ2h0OiBIaWdobGlnaHQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGhpZ2hsaWdodC50eXBlID09PSAnaGlkZGVuJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKGhpZ2hsaWdodC5zcSk7XG5cbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBoaWdobGlnaHQuc3R5bGU7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gaGlnaGxpZ2h0LnN0eWxlO1xuICAgICAgICBpZiAoaGlnaGxpZ2h0LmFscGhhKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGhpZ2hsaWdodC5hbHBoYTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2goaGlnaGxpZ2h0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBwb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvMjAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocG9zLnggKyA0LCBwb3MueSArIDQsIHRoaXMuc3FTaXplIC0gOCwgdGhpcy5zcVNpemUgLSA4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aC81MDA7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbi8qXG4gICAgICAgICAgICBjYXNlICdkb3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhwb3MuY2VudGVyWCwgcG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzgsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4qL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93KHN0eWxlOiBzdHJpbmcsIGZyb214OiBudW1iZXIsIGZyb215OiBudW1iZXIsIHRveDogbnVtYmVyLCB0b3k6IG51bWJlcikge1xuICAgICAgICB0aGlzLmFycm93Q3R4LnNhdmUoKTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0b3kgLSBmcm9teSwgdG94IC0gZnJvbXgpO1xuICAgICAgICBsZXQgcmFkaXVzID0gdGhpcy5hcnJvd0NhbnZhcy53aWR0aC80MDtcbiAgICAgICAgbGV0IHggPSB0b3ggLSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gdG95IC0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IDIqcmFkaXVzLzU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiBcbiAgICAgICAgLy8gRHJhdyBsaW5lXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKGZyb214LCBmcm9teSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuIFxuICAgICAgICAvLyBEcmF3IGFycm93IGhlYWRcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiBcbiAgICAgICAgbGV0IHhjZW50ZXIgPSAodG94ICsgeCkvMjtcbiAgICAgICAgbGV0IHljZW50ZXIgPSAodG95ICsgeSkvMjtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8odG94LCB0b3kpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1NxdWFyZUFycm93KGFycm93OiBTcXVhcmVBcnJvdykge1xuICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy50b1NxKTtcbiAgICAgICAgbGV0IGZyb21TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5mcm9tU3EpO1xuXG4gICAgICAgIGlmIChhcnJvdy50b1NxICE9PSBhcnJvdy5mcm9tU3EpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCBmcm9tU3FQb3MuY2VudGVyWCwgZnJvbVNxUG9zLmNlbnRlclksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBhcnJvdy5zdHlsZTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvNTAwO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHguYXJjKHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZLCB0aGlzLnNxU2l6ZS8yIC0gNCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SGFuZEFycm93KGFycm93OiBIYW5kQXJyb3cpIHtcbiAgICAgICAgbGV0IHJlY3Q7XG4gICAgICAgIGlmIChhcnJvdy5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgcmVjdCA9IHRoaXMucGxheWVySGFuZFJlY3RNYXAuZ2V0KGFycm93LnBpZWNldHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJlY3QgPSB0aGlzLm9wcG9uZW50SGFuZFJlY3RNYXAuZ2V0KGFycm93LnBpZWNldHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVjdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKCFhcnJvdy50b1NxKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCB0b1NxUG9zID0gdGhpcy5zcXVhcmUyUG9zKGFycm93LnRvU3EpO1xuXG4gICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCByZWN0LngrKHJlY3Qud2lkdGgvMiksIHJlY3QueSsocmVjdC5oZWlnaHQvMiksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93Q2FudmFzKGFscGhhOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuYXJyb3dDYW52YXMsIDAsIDApO1xuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDEuMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ludmVydGVkKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh4ICsgd2lkdGgvMiwgeSArIGhlaWdodC8yKTtcbiAgICAgICAgdGhpcy5jdHgucm90YXRlKE1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoIC0oeCArIHdpZHRoLzIpLCAtKHkgKyBoZWlnaHQvMikgKTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBvczJTcXVhcmUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBTcXVhcmV8dW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbCA9IE1hdGguZmxvb3IoICh4IC0gdGhpcy5ib2FyZFJlY3QueCkvdGhpcy5zcVNpemUgKTtcbiAgICAgICAgbGV0IHJvdyA9IE1hdGguZmxvb3IoICh5IC0gdGhpcy5ib2FyZFJlY3QueSkvdGhpcy5zcVNpemUpO1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA8IDAgfHwgcm93IDwgMCB8fCBjb2wgPiA5IC0gMSB8fCByb3cgPiA5IC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsU3F1YXJlc1sgOSpjb2wgKyByb3cgXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3F1YXJlMlBvcyhzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBjb2wgPSA5IC0gcGFyc2VJbnQoc3FbMF0pO1xuICAgICAgICBsZXQgcm93ID0gc3EuY2hhckNvZGVBdCgxKSAtIDk3O1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHggPSB0aGlzLmJvYXJkUmVjdC54ICsgKGNvbCAqIHRoaXMuc3FTaXplKTtcbiAgICAgICAgbGV0IHkgPSB0aGlzLmJvYXJkUmVjdC55ICsgcm93ICogdGhpcy5zcVNpemU7XG4gICAgICAgIGxldCBjZW50ZXJYID0geCArICh0aGlzLnNxU2l6ZS8yKTtcbiAgICAgICAgbGV0IGNlbnRlclkgPSB5ICsgKHRoaXMuc3FTaXplLzIpXG4gICAgICAgIHJldHVybiB7IHgsIHksIGNlbnRlclgsIGNlbnRlclkgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Qm9hcmRSZWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZFJlY3Q7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNxU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FTaXplO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQbGF5ZXJIYW5kUmVjdE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVySGFuZFJlY3RNYXA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9wcG9uZW50SGFuZFJlY3RNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wcG9uZW50SGFuZFJlY3RNYXA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9yaWVudGF0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB9XG59IiwiaW1wb3J0IHsgUGllY2V0eXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGFuZCB7XG4gICAgcHJpdmF0ZSBwaWVjZXM6IE1hcDxQaWVjZXR5cGUsIG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5waWVjZXMgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuICAgICAgICB0aGlzLmVtcHR5KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGVtcHR5KCkge1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ3Bhd24nLCAxKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICB0aGlzLnBpZWNlcy5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgdGhpcy5waWVjZXMuc2V0KCdyb29rJywgMCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE51bU9mUGllY2VzKHBpZWNlOiBQaWVjZXR5cGUpOiBudW1iZXJ8dW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHBpZWNlIHRvIGhhbmRcbiAgICAgKiBAcGFyYW0gcGllY2UgXG4gICAgICogQHBhcmFtIG51bSBPcHRpb25hbCAtIElmIG5vdCBzdXBwbGllZCwgMSBpcyB0aGUgZGVmYXVsdFxuICAgICAqIEByZXR1cm5zIFRydWUgaWYgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgbm90XG4gICAgICovXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgICAgIGlmIChjdXJBbW91bnQgIT09IHVuZGVmaW5lZCkgeyAvLyBNYWtlIHN1cmUgdGhlIGN1cnJlbnQgYW1vdW50IGlzIG5vdCB1bmRlZmluZWRcbiAgICAgICAgICAgIHRoaXMucGllY2VzLnNldChwaWVjZSwgY3VyQW1vdW50ICsgbnVtKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcGllY2UgZnJvbSBoYW5kXG4gICAgICogQHBhcmFtIHBpZWNlIFxuICAgICAqIEBwYXJhbSBudW0gT3B0aW9uYWwgLSBJZiBub3Qgc3VwcGxpZWQsIDEgaXMgdGhlIGRlZmF1bHRcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIG5vdFxuICAgICAqL1xuICAgIHJlbW92ZVBpZWNlKHBpZWNlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IHRoaXMucGllY2VzLmdldChwaWVjZSk7XG4gICAgICAgIGlmICghY3VyQW1vdW50IHx8IGN1ckFtb3VudCA8PSAwKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGllY2VzLnNldChwaWVjZSwgY3VyQW1vdW50IC0gbnVtKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSIsImltcG9ydCBTaG9HVUkgZnJvbSBcIi4vc2hvZ3VpXCI7XG5pbXBvcnQgeyBTcXVhcmUgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5sZXQgc2hvZ3VpID0gbmV3IFNob0dVSSh7b25Nb3ZlUGllY2U6IG9uUGllY2VNb3ZlfSk7XG5cbmZ1bmN0aW9uIG9uUGllY2VNb3ZlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgc2hvZ3VpLmFkZEFycm93KHtzdHlsZTogJ2JsYWNrJywgZnJvbVNxOiBzcmNTcSwgdG9TcTogZGVzdFNxfSk7XG4gICAgY29uc29sZS5sb2coIHNyY1NxICsgXCItLT5cIiArIGRlc3RTcSk7XG4gICAgcmV0dXJuIHRydWU7XG59IiwiaW1wb3J0IEdVSSBmcm9tIFwiLi9ndWlcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEhhbmQgZnJvbSBcIi4vaGFuZFwiO1xuaW1wb3J0IHsgQ29uZmlnLCBQaWVjZSwgU3F1YXJlLCBhbGxTcXVhcmVzLCBDb2xvciwgU3F1YXJlQXJyb3csIEhhbmRBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgaXNTcXVhcmVBcnJvdywgaXNIYW5kQXJyb3csIGFycm93c0VxdWFsIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5pbnRlcmZhY2UgRHJhZ2dpbmdQaWVjZSB7XG4gICAgcGllY2U6IFBpZWNlLFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvR1VJIHtcbiAgICBwcml2YXRlIGNvbmZpZzogQ29uZmlnO1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgaGFuZE1hcDogTWFwPENvbG9yLCBIYW5kPjtcbiAgICBwcml2YXRlIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBndWk6IEdVSTtcbiAgICBwcml2YXRlIGN1cnJlbnRBcnJvdzogU3F1YXJlQXJyb3d8SGFuZEFycm93fHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGFycm93TGlzdDogKFNxdWFyZUFycm93fEhhbmRBcnJvdylbXTtcbiAgICBwcml2YXRlIGFjdGl2ZVNxdWFyZTogU3F1YXJlfHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGhpZ2hsaWdodExpc3Q6IEhpZ2hsaWdodFtdO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSByaWdodENsaWNrU3E6IFNxdWFyZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZykge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwID0gbmV3IE1hcDxDb2xvciwgSGFuZD4oKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwLnNldCgnYmxhY2snLCBuZXcgSGFuZCgpKTtcbiAgICAgICAgdGhpcy5oYW5kTWFwLnNldCgnd2hpdGUnLCBuZXcgSGFuZCgpKTtcbiAgICAgICAgLy90aGlzLmJvYXJkLnNldFN0YXJ0aW5nUG9zaXRpb24oKTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IDEzNTA7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLndpZHRoLzIgKyAyMDtcbiAgICAgICAgdGhpcy5ndWkgPSBuZXcgR1VJKHRoaXMuYm9hcmQsIHRoaXMuaGFuZE1hcCwgdGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdCA9IFtdO1xuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZURvd24oZSk7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLmRyYXdHYW1lKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VVcChlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZShlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5ndWkuZmxpcEJvYXJkKCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHNlbGYuYXJyb3dMaXN0KTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNlbGYuZHJhd0dhbWUoKSApO1xuICAgICAgICB9KVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgLy9zZWxmLm9uUmlnaHRDbGljayhlKTtcbiAgICAgICAgICAgIC8vd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2VsZi5kcmF3R2FtZSgpICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiBzZWxmLmRyYXdHYW1lKCkgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmZsaXBCb2FyZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTcXVhcmVIaWdobGlnaHRlZChzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBzcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSGlnaGxpZ2h0KGhpZ2hsaWdodDogSGlnaGxpZ2h0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1NxdWFyZUhpZ2hsaWdodGVkKGhpZ2hsaWdodC5zcSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdC5wdXNoKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBoaWdobGlnaHQuc3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJIaWdobGlnaHRzKCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQXJyb3coYXJyb3c6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoYXJyb3cudG9TcSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0LnB1c2goYXJyb3cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlQXJyb3coYXJyb3c6IFNxdWFyZUFycm93fEhhbmRBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IGNtcEFycm93IG9mIHRoaXMuYXJyb3dMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIGFycm93c0VxdWFsKGNtcEFycm93LCBhcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0xpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb3ZlUGllY2Uoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25Nb3ZlUGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcm9wUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5oYW5kTWFwLmdldChwaWVjZS5jb2xvcik7XG4gICAgICAgICAgICBpZiAoIWhhbmQpIHJldHVybjtcbiAgICAgICAgdGhpcy5ib2FyZC5hZGRQaWVjZShwaWVjZSwgc3EpO1xuICAgICAgICBoYW5kLnJlbW92ZVBpZWNlKHBpZWNlLnR5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0dhbWUoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmNsZWFyQ2FudmFzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoIHtzdHlsZTogJ21pbnRjcmVhbScsIHR5cGU6ICdmaWxsJywgc3E6dGhpcy5hY3RpdmVTcXVhcmV9ICk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoaGlnaGxpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aS5kcmF3RmlsZVJhbmtMYWJlbHMoKTtcblxuICAgICAgICBmb3IgKGxldCBpIG9mIGFsbFNxdWFyZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAmJiB0aGlzLmRyYWdnaW5nUGllY2UpIHsgLy8gRG9uJ3QgZHJhdyB0aGUgY3VycmVudGx5IGRyYWdnaW5nIHBpZWNlIG9uIGl0cyBzcXVhcmVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlQXRTcXVhcmUoaSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnYmxhY2snKTsgXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kKCd3aGl0ZScpO1xuXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UsIHRoaXMuZHJhZ2dpbmdQaWVjZS54IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMiwgdGhpcy5kcmFnZ2luZ1BpZWNlLnkgLSB0aGlzLmd1aS5nZXRTcVNpemUoKS8yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBhcnJvdyBvZiB0aGlzLmFycm93TGlzdCkge1xuICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3QXJyb3dDYW52YXMoMC42KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRyYXdBcnJvdyhhcnJvdzogU3F1YXJlQXJyb3d8SGFuZEFycm93KSB7XG4gICAgICAgIGlmICggaXNTcXVhcmVBcnJvdyhhcnJvdykgKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3U3F1YXJlQXJyb3coYXJyb3cpO1xuICAgICAgICB9IGVsc2UgaWYgKCBpc0hhbmRBcnJvdyhhcnJvdykgKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZEFycm93KGFycm93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikge1xuICAgICAgICAgICAgdGhpcy5vblJpZ2h0Q2xpY2soZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGVhckFycm93cygpO1xuXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodGhpcy5ndWkuZ2V0Qm9hcmRSZWN0KCksIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgbGV0IGNsaWNrZWRTcTogU3F1YXJlfHVuZGVmaW5lZCA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgICAgIGlmICghY2xpY2tlZFNxKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgcGllY2UgPSB0aGlzLmJvYXJkLmdldFBpZWNlKGNsaWNrZWRTcSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChwaWVjZSAmJiAoIXRoaXMuYWN0aXZlU3F1YXJlIHx8IHRoaXMuYWN0aXZlU3F1YXJlID09PSBjbGlja2VkU3EpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSBjbGlja2VkU3E7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTcXVhcmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlICE9PSBjbGlja2VkU3EpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHRoaXMuYWN0aXZlU3F1YXJlLCBjbGlja2VkU3EpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRQbGF5ZXJIYW5kUmVjdE1hcCgpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQodGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kPy5nZXROdW1PZlBpZWNlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlID0ge3R5cGU6IGtleSwgY29sb3I6IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCl9O1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRSZWN0TWFwKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBsZXQgaGFuZCA9IHRoaXMuaGFuZE1hcC5nZXQob3Bwb25lbnRDb2xvcik7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kPy5nZXROdW1PZlBpZWNlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlID0ge3R5cGU6IGtleSwgY29sb3I6IG9wcG9uZW50Q29sb3J9O1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodGhpcy5ndWkuZ2V0Qm9hcmRSZWN0KCksIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgbGV0IHNxT3ZlciA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuICAgICAgICAgICAgICAgIGlmICghc3FPdmVyKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmIHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlID09PSBzcU92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVBpZWNlKHRoaXMuYWN0aXZlU3F1YXJlLCBzcU92ZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiAhdGhpcy5hY3RpdmVTcXVhcmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3BQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UsIHNxT3Zlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikgeyAvLyBSaWdodCBtb3VzZSBidXR0b25cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgICAgIGlmICggIXRoaXMucmVtb3ZlQXJyb3codGhpcy5jdXJyZW50QXJyb3cpICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEFycm93KHRoaXMuY3VycmVudEFycm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgIGxldCBob3ZlclNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG5cbiAgICAgICAgaWYgKCB0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZS54ID0gbW91c2VYO1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnkgPSBtb3VzZVk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgIGlmIChob3ZlclNxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cudG9TcSA9IGhvdmVyU3E7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93LnRvU3EgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmlnaHRDbGljayhldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGNsaWNrZWRTcSA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuXG4gICAgICAgIGlmIChjbGlja2VkU3EgJiYgIXRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiAnYmx1ZScsIGZyb21TcTogY2xpY2tlZFNxLCB0b1NxOiBjbGlja2VkU3EgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRQbGF5ZXJIYW5kUmVjdE1hcCgpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6ICdibGFjaycsIHBpZWNldHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZFJlY3RNYXAoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogJ2JsYWNrJywgcGllY2V0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgIH1cbn0iLCJleHBvcnQgaW50ZXJmYWNlIENvbmZpZyB7XG4gICAgb3JpZW50YXRpb24/OiBDb2xvcixcbiAgICBvbk1vdmVQaWVjZT86ICguLi5hcmdzOiBTcXVhcmVbXSkgPT4gYm9vbGVhbixcbiAgICBvblNlbGVjdFBpZWNlPzogKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkgPT4gYm9vbGVhbixcbiAgICBvbkRlc2VsZWN0UGllY2U/OiAoKSA9PiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIENvbG9yID0gJ2JsYWNrJyB8ICd3aGl0ZSc7XG5leHBvcnQgdHlwZSBQaWVjZXR5cGUgPSAna2luZycgfCAncm9vaycgfCAnYmlzaG9wJyAgfCAnZ29sZCcgfCAnc2lsdmVyJyB8ICdrbmlnaHQnIHwgJ2xhbmNlJyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIFNxdWFyZSA9ICc5YScgfCAnOGEnIHwgJzdhJyB8ICc2YScgfCAnNWEnIHwgJzRhJyB8ICczYScgfCAnMmEnIHwgJzFhJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWInIHwgJzhiJyB8ICc3YicgfCAnNmInIHwgJzViJyB8ICc0YicgfCAnM2InIHwgJzJiJyB8ICcxYicgfFxuICAgICAgICAgICAgICAgICAgICAgJzljJyB8ICc4YycgfCAnN2MnIHwgJzZjJyB8ICc1YycgfCAnNGMnIHwgJzNjJyB8ICcyYycgfCAnMWMnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZCcgfCAnOGQnIHwgJzdkJyB8ICc2ZCcgfCAnNWQnIHwgJzRkJyB8ICczZCcgfCAnMmQnIHwgJzFkJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWUnIHwgJzhlJyB8ICc3ZScgfCAnNmUnIHwgJzVlJyB8ICc0ZScgfCAnM2UnIHwgJzJlJyB8ICcxZScgfFxuICAgICAgICAgICAgICAgICAgICAgJzlmJyB8ICc4ZicgfCAnN2YnIHwgJzZmJyB8ICc1ZicgfCAnNGYnIHwgJzNmJyB8ICcyZicgfCAnMWYnIHxcbiAgICAgICAgICAgICAgICAgICAgICc5ZycgfCAnOGcnIHwgJzdnJyB8ICc2ZycgfCAnNWcnIHwgJzRnJyB8ICczZycgfCAnMmcnIHwgJzFnJyB8XG4gICAgICAgICAgICAgICAgICAgICAnOWgnIHwgJzhoJyB8ICc3aCcgfCAnNmgnIHwgJzVoJyB8ICc0aCcgfCAnM2gnIHwgJzJoJyB8ICcxaCcgfFxuICAgICAgICAgICAgICAgICAgICAgJzlpJyB8ICc4aScgfCAnN2knIHwgJzZpJyB8ICc1aScgfCAnNGknIHwgJzNpJyB8ICcyaScgfCAnMWknO1xuXG5leHBvcnQgdHlwZSBSYW5rID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnIHwgJ2knO1xuZXhwb3J0IHR5cGUgRmlsZSA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4IHwgOTtcblxuZXhwb3J0IGNvbnN0IHJhbmtzOiBSYW5rW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJ107XG5leHBvcnQgY29uc3QgZmlsZXM6IEZpbGVbXSA9IFs5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxXTtcbmV4cG9ydCBjb25zdCBhbGxTcXVhcmVzOiBTcXVhcmVbXSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQoLi4uZmlsZXMubWFwKGMgPT4gcmFua3MubWFwKHIgPT4gYytyKSkpO1xuXG5leHBvcnQgdHlwZSBIaWdobGlnaHRUeXBlID0gJ2ZpbGwnIHwgJ291dGxpbmUnIHwgJ2NpcmNsZScgfCAnaGlkZGVuJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgICB0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHByb21vdGVkPzogYm9vbGVhblxufVxuZXhwb3J0IGludGVyZmFjZSBNb3ZlIHtcbiAgICBzcmM6IFNxdWFyZSxcbiAgICBkZXN0OiBTcXVhcmUsXG59XG5leHBvcnQgaW50ZXJmYWNlIERyb3Age1xuICAgIHBpZWNlOiBQaWVjZSxcbiAgICBkZXN0OiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG59XG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZUFycm93IHsgLy8gQXJyb3cgZ29pbmcgZnJvbSBvbmUgYm9hcmQgc3F1YXJlIHRvIGFub3RoZXJcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIGZyb21TcTogU3F1YXJlLFxuICAgIHRvU3E6IFNxdWFyZVxufVxuZXhwb3J0IGludGVyZmFjZSBIYW5kQXJyb3cgeyAvLyBBcnJvdyBnb2luZyBmcm9tIGEgcGllY2UgaW4gaGFuZCB0byBhIGJvYXJkIHNxdWFyZVxuICAgIHN0eWxlOiBzdHJpbmcsXG4gICAgcGllY2V0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHRvU3E/OiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSGlnaGxpZ2h0IHtcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIHR5cGU6IEhpZ2hsaWdodFR5cGUsXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgc3E6IFNxdWFyZVxufSIsImltcG9ydCB7IFJlY3QsIE1vdmUsIERyb3AsIFNxdWFyZUFycm93LCBIYW5kQXJyb3cgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgc29tZXRoaW5nIGlzIGluc2lkZSB0aGUgUmVjdFxuICogQHBhcmFtIHJlY3QgLSBSZWN0YW5nbGUgdG8gY2hlY2sgaWYgcG9zIGlzIGluc2lkZVxuICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGUgb2YgcG9zaXRpb25cbiAqIEBwYXJhbSB5IC0gWSBjb29yZGlhbnRlIG9mIHBvc2l0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc0luc2lkZVJlY3QocmVjdDogUmVjdCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoeCA8IHJlY3QueCB8fCB4ID49IHJlY3QueCArIHJlY3Qud2lkdGggfHxcbiAgICAgICAgeSA8IHJlY3QueSB8fCB5ID49IHJlY3QueSArIHJlY3QuaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJvd3NFcXVhbChhcnJvdzE6IFNxdWFyZUFycm93fEhhbmRBcnJvdywgYXJyb3cyOiBTcXVhcmVBcnJvd3xIYW5kQXJyb3cpOiBib29sZWFuIHtcbiAgICBpZiAoIGlzU3F1YXJlQXJyb3coYXJyb3cxKSAmJiBpc1NxdWFyZUFycm93KGFycm93MikgKSB7XG4gICAgICAgIGlmICggYXJyb3cxLnRvU3EgPT09IGFycm93Mi50b1NxICYmIGFycm93MS5mcm9tU3EgPT09IGFycm93Mi5mcm9tU3EpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICggaXNIYW5kQXJyb3coYXJyb3cxKSAmJiBpc0hhbmRBcnJvdyhhcnJvdzIpICkge1xuICAgICAgICBpZiAoYXJyb3cxLnBpZWNldHlwZSA9PT0gYXJyb3cyLnBpZWNldHlwZSAmJiBhcnJvdzEuY29sb3IgPT09IGFycm93Mi5jb2xvcikge1xuICAgICAgICAgICAgaWYgKCBhcnJvdzEudG9TcSAmJiBhcnJvdzIudG9TcSAmJiBhcnJvdzEudG9TcSA9PT0gYXJyb3cyLnRvU3EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc01vdmUoYXJnOiBhbnkpOiBhcmcgaXMgTW92ZSB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3JjICYmIGFyZy5kZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEcm9wKGFyZzogYW55KTogYXJnIGlzIERyb3Age1xuICAgIHJldHVybiBhcmcgJiYgYXJnLnBpZWNlICYmIGFyZy5kZXN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTcXVhcmVBcnJvdyhhcmc6IGFueSk6IGFyZyBpcyBTcXVhcmVBcnJvdyB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3R5bGUgJiYgYXJnLmZyb21TcSAmJiBhcmcudG9TcTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSGFuZEFycm93KGFyZzogYW55KTogYXJnIGlzIEhhbmRBcnJvdyB7XG4gICAgcmV0dXJuIGFyZyAmJiBhcmcuc3R5bGUgJiYgYXJnLnBpZWNldHlwZSAmJiBhcmcuY29sb3IgJiYgYXJnLnRvU3E7XG59Il19
