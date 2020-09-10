(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ShoGUI = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
class Board {
    constructor() {
        this.pieceList = new Map();
        this.blackHand = new Map();
        this.whiteHand = new Map();
        this.blackHand.set('pawn', 0);
        this.blackHand.set('lance', 0);
        this.blackHand.set('knight', 0);
        this.blackHand.set('silver', 0);
        this.blackHand.set('gold', 0);
        this.blackHand.set('bishop', 0);
        this.blackHand.set('rook', 0);
        this.whiteHand.set('pawn', 0);
        this.whiteHand.set('lance', 0);
        this.whiteHand.set('knight', 0);
        this.whiteHand.set('silver', 0);
        this.whiteHand.set('gold', 0);
        this.whiteHand.set('bishop', 0);
        this.whiteHand.set('rook', 0);
    }
    setPosition(sfen) {
        if (!util_1.validSfen(sfen)) {
            return false;
        }
        let sfenArr = sfen.split(' ');
        let sfenBoard = sfenArr[0];
        let sfenHand = sfenArr[2];
        let rows = sfenBoard.split('/');
        let curSquareIndex = 0;
        let isPromote = false;
        for (let r of rows) {
            for (let char of r) {
                if (isNaN(Number(char))) {
                    if (char === '+') {
                        if (isPromote)
                            throw new Error('ERROR: Two "+" signs found in a row in sfen');
                        isPromote = true;
                        continue;
                    }
                    let piece = util_1.sfen2Piece(char);
                    if (!piece) {
                        throw new Error('Failed to retrieve piece from sfen for character: ' + char);
                    }
                    if (isPromote)
                        piece.promoted = true;
                    this.addPiece(piece, types_1.squares[curSquareIndex]);
                    curSquareIndex++;
                }
                else {
                    curSquareIndex = curSquareIndex + Number(char);
                }
                isPromote = false;
            }
        }
        if (sfenHand) {
            let amt = 1;
            for (let char of sfenHand) {
                let piece = util_1.sfen2Piece(char);
                if (!isNaN(Number(char))) {
                    amt = Number(char);
                    continue;
                }
                else {
                    if (!piece) {
                        throw new Error('ERROR: Cannot get piece from sfen for character ' + char);
                    }
                    this.add2Hand(piece.color, piece.type, amt);
                    amt = 1;
                }
            }
        }
        return true;
    }
    getPosition() {
        let sfen = '';
        let numEmptySpaces = 0;
        for (let curSq of types_1.squares) {
            let piece = this.pieceList.get(curSq);
            if (piece) {
                if (numEmptySpaces !== 0) {
                    sfen += numEmptySpaces.toString();
                }
                sfen += util_1.piece2sfen(piece);
                numEmptySpaces = 0;
            }
            else {
                numEmptySpaces++;
            }
            if (curSq[0] === '1') {
                if (numEmptySpaces !== 0) {
                    sfen += numEmptySpaces.toString();
                }
                numEmptySpaces = 0;
                if (curSq !== types_1.squares[types_1.squares.length - 1]) {
                    sfen += '/';
                }
            }
        }
        return sfen;
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
        let hand = this.getHand(color);
        let curAmount = hand === null || hand === void 0 ? void 0 : hand.get(piecetype);
        if (curAmount !== undefined) {
            hand === null || hand === void 0 ? void 0 : hand.set(piecetype, curAmount + num);
            return true;
        }
        return false;
    }
    removeFromHand(color, piecetype, num = 1) {
        let hand = this.getHand(color);
        let curAmount = hand === null || hand === void 0 ? void 0 : hand.get(piecetype);
        if (!curAmount || curAmount - num < 0) {
            return false;
        }
        hand === null || hand === void 0 ? void 0 : hand.set(piecetype, curAmount - num);
        return true;
    }
    getNumPiecesInHand(color, piecetype) {
        var _a;
        return (_a = this.getHand(color)) === null || _a === void 0 ? void 0 : _a.get(piecetype);
    }
    getHand(color) {
        if (color === 'black') {
            return this.blackHand;
        }
        else if (color === 'white') {
            return this.whiteHand;
        }
        return undefined;
    }
}
exports.default = Board;

},{"./types":5,"./util":6}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
class GUI {
    constructor(board, container, config) {
        this.board = board;
        this.config = config;
        this.orientation = 'black';
        if (config.orientation === 'white') {
            this.orientation = 'white';
        }
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
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
        container.appendChild(this.canvas);
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
    drawArrow(style, size, fromx, fromy, tox, toy) {
        this.arrowCtx.save();
        let angle = Math.atan2(toy - fromy, tox - fromx);
        let radius = size * (this.arrowCanvas.width / 150);
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
    drawSnapArrow(arrow) {
        if (!arrow.dest)
            return false;
        if (util_1.isValidSquare(arrow.src)) {
            let fromSqPos = this.square2Pos(arrow.src);
            if (arrow.dest === arrow.src) {
                this.arrowCtx.strokeStyle = arrow.style;
                this.arrowCtx.lineWidth = arrow.size * this.canvas.width / 1750;
                this.arrowCtx.beginPath();
                this.arrowCtx.arc(fromSqPos.centerX, fromSqPos.centerY, this.sqSize / 2 - 4, 0, 2 * Math.PI);
                this.arrowCtx.stroke();
            }
            else {
                let toSqPos = this.square2Pos(arrow.dest);
                this.drawArrow(arrow.style, arrow.size, fromSqPos.centerX, fromSqPos.centerY, toSqPos.centerX, toSqPos.centerY);
            }
        }
        else {
            let rect;
            let handPiece = arrow.src;
            if (handPiece.color === this.orientation) {
                rect = this.playerHandBounds.get(handPiece.type);
            }
            else {
                rect = this.opponentHandBounds.get(handPiece.type);
            }
            if (!rect)
                return false;
            let toSqPos = this.square2Pos(arrow.dest);
            this.drawArrow(arrow.style, arrow.size, rect.x + (rect.width / 2), rect.y + (rect.height / 2), toSqPos.centerX, toSqPos.centerY);
        }
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
        return types_1.squares[9 * row + col];
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

},{"./types":5,"./util":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
class Input {
    constructor(shogui, config) {
        this.shogui = shogui;
        this.config = config;
        let self = this;
        this.board = shogui.getBoard();
        this.gui = shogui.getGui();
        this.arrows = [];
        function mouseMoveHandler(e) {
            self.onMouseMove(e);
            window.requestAnimationFrame(() => shogui.refreshCanvas());
        }
        this.gui.getCanvas().addEventListener('mousedown', function (e) {
            self.onMouseDown(e);
            window.addEventListener('mousemove', mouseMoveHandler);
            window.requestAnimationFrame(() => shogui.refreshCanvas());
        });
        window.addEventListener('mouseup', function (e) {
            window.removeEventListener('mousemove', mouseMoveHandler);
            self.onMouseUp(e);
            window.requestAnimationFrame(() => shogui.refreshCanvas());
        });
        this.gui.getCanvas().addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        window.addEventListener('load', () => window.requestAnimationFrame(() => shogui.refreshCanvas()));
    }
    getActiveSquare() {
        return this.activeSquare;
    }
    getDraggingPiece() {
        return this.draggingPiece;
    }
    getCurrentArrow() {
        return this.currentArrow;
    }
    getUserArrows() {
        return this.arrows;
    }
    addArrow(arrow) {
        this.arrows.push(arrow);
    }
    removeArrow(arrow) {
        let i = 0;
        for (let cmpArrow of this.arrows) {
            if (util_1.arrowsEqual(cmpArrow, arrow)) {
                this.arrows.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }
    clearArrows() {
        this.arrows = [];
    }
    onMouseDown(event) {
        if (this.currentArrow) {
            this.currentArrow = undefined;
        }
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
                        this.shogui.movePiece(this.activeSquare, clickedSq);
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
                    this.shogui.movePiece(this.activeSquare, sqOver);
                    this.activeSquare = undefined;
                }
            }
            else if (this.draggingPiece && !this.activeSquare) {
                this.shogui.dropPiece(this.draggingPiece.piece.color, this.draggingPiece.piece.type, sqOver);
            }
        }
        else {
            this.activeSquare = undefined;
        }
        this.draggingPiece = undefined;
        if (event.button === 2) {
            if (this.currentArrow) {
                if (!this.removeArrow(this.currentArrow)) {
                    this.currentArrow.size += 0.5;
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
                this.currentArrow.dest = hoverSq;
            }
            else {
                this.currentArrow.dest = undefined;
            }
        }
    }
    onRightClick(event) {
        let rect = this.gui.getCanvas().getBoundingClientRect();
        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;
        let clickedSq = this.gui.pos2Square(mouseX, mouseY);
        let arrowStyle = 'blue';
        if (this.config.arrowStyle) {
            arrowStyle = this.config.arrowStyle;
        }
        if (this.config.altArrowStyle && event.altKey) {
            arrowStyle = this.config.altArrowStyle;
        }
        if (this.config.ctrlArrowStyle && event.ctrlKey) {
            arrowStyle = this.config.ctrlArrowStyle;
        }
        if (clickedSq && !this.draggingPiece) {
            this.currentArrow = { style: arrowStyle, size: 3.5, src: clickedSq, dest: clickedSq };
        }
        for (let [key, value] of this.gui.getPlayerHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                this.currentArrow = { style: arrowStyle, size: 3.5, src: { type: key, color: this.gui.getOrientation() } };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                this.currentArrow = { style: arrowStyle, size: 3.5, src: { type: key, color: opponentColor } };
            }
        }
        this.draggingPiece = undefined;
        this.activeSquare = undefined;
    }
}
exports.default = Input;

},{"./util":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoGUI = void 0;
const gui_1 = require("./gui");
const board_1 = require("./board");
const types_1 = require("./types");
const util_1 = require("./util");
const input_1 = require("./input");
class ShoGUI {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.board = new board_1.default();
        this.gui = new gui_1.default(this.board, container, config);
        this.input = new input_1.default(this, config);
        this.highlightList = [];
        this.arrowList = [];
    }
    setPosition(sfen) {
        this.board.setPosition(sfen);
    }
    getPosition() {
        return this.board.getPosition();
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
        if (arrow.dest === undefined)
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
        let activeSquare = this.input.getActiveSquare();
        let draggingPiece = this.input.getDraggingPiece();
        let currentArrow = this.input.getCurrentArrow();
        this.gui.clearCanvas();
        for (let highlight of this.highlightList) {
            this.gui.highlightSquare(highlight.style, highlight.type, highlight.sq, highlight.alpha);
        }
        if (activeSquare) {
            this.gui.highlightSquare('mintcream', 'fill', activeSquare);
        }
        this.gui.drawBoard();
        this.gui.drawFileRankLabels();
        for (let i of types_1.squares) {
            if (activeSquare && draggingPiece) {
                if (activeSquare === i) {
                    continue;
                }
            }
            this.gui.drawPieceAtSquare(i);
        }
        this.gui.drawHand('black');
        this.gui.drawHand('white');
        if (draggingPiece) {
            this.gui.drawPiece(draggingPiece.piece, draggingPiece.x - this.gui.getSqSize() / 2, draggingPiece.y - this.gui.getSqSize() / 2);
        }
        for (let arrow of this.input.getUserArrows()) {
            this.drawArrow(arrow);
        }
        for (let arrow of this.arrowList) {
            this.drawArrow(arrow);
        }
        if (currentArrow) {
            this.drawArrow(currentArrow);
        }
        this.gui.drawArrowCanvas(0.6);
    }
    drawArrow(arrow) {
        this.gui.drawSnapArrow(arrow);
    }
    getBoard() {
        return this.board;
    }
    getGui() {
        return this.gui;
    }
}
exports.ShoGUI = ShoGUI;
module.exports = ShoGUI;

},{"./board":1,"./gui":2,"./input":3,"./types":5,"./util":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squares = void 0;
exports.squares = ['9a', '8a', '7a', '6a', '5a', '4a', '3a', '2a', '1a',
    '9b', '8b', '7b', '6b', '5b', '4b', '3b', '2b', '1b',
    '9c', '8c', '7c', '6c', '5c', '4c', '3c', '2c', '1c',
    '9d', '8d', '7d', '6d', '5d', '4d', '3d', '2d', '1d',
    '9e', '8e', '7e', '6e', '5e', '4e', '3e', '2e', '1e',
    '9f', '8f', '7f', '6f', '5f', '4f', '3f', '2f', '1f',
    '9g', '8g', '7g', '6g', '5g', '4g', '3g', '2g', '1g',
    '9h', '8h', '7h', '6h', '5h', '4h', '3h', '2h', '1h',
    '9i', '8i', '7i', '6i', '5i', '4i', '3i', '2i', '1i'];

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sfen2Piece = exports.piece2sfen = exports.validSfen = exports.isValidSquare = exports.arrowsEqual = exports.isPosInsideRect = void 0;
const types_1 = require("./types");
function isPosInsideRect(rect, x, y) {
    if (x < rect.x || x >= rect.x + rect.width ||
        y < rect.y || y >= rect.y + rect.height) {
        return false;
    }
    return true;
}
exports.isPosInsideRect = isPosInsideRect;
function arrowsEqual(arrow1, arrow2) {
    if (arrow1.src === arrow2.src)
        return true;
    return false;
}
exports.arrowsEqual = arrowsEqual;
function isValidSquare(arg) {
    return types_1.squares.includes(arg) !== false;
}
exports.isValidSquare = isValidSquare;
function validSfen(sfen) {
    let sfenArr = sfen.split(' ');
    let sfenBoard = sfenArr[0];
    let rows = sfenBoard.split('/');
    if (rows.length !== 9) {
        return false;
    }
    let sqCount = 0;
    for (let r of rows) {
        for (let char of r) {
            if (!isNaN(Number(char))) {
                sqCount += Number(char);
            }
            else {
                if (char === '+') {
                    continue;
                }
                if (char.search(/[^plnsgbrkPLNSGBRK]/)) {
                    sqCount++;
                }
                else {
                    return false;
                }
            }
        }
        if (sqCount !== 9) {
            return false;
        }
        sqCount = 0;
    }
    return true;
}
exports.validSfen = validSfen;
function piece2sfen(piece) {
    let result = '';
    if (piece.type === 'knight') {
        result += 'n';
    }
    else {
        result += piece.type[0];
    }
    if (piece.color === 'black') {
        result = result.toUpperCase();
    }
    if (piece.promoted) {
        result = '+' + result;
    }
    return result;
}
exports.piece2sfen = piece2sfen;
function sfen2Piece(sfen) {
    let pUpper = sfen.toUpperCase();
    let result = { type: '', color: '' };
    result.color = pUpper === sfen ? 'black' : 'white';
    switch (pUpper) {
        case 'P':
            result.type = 'pawn';
            break;
        case 'L':
            result.type = 'lance';
            break;
        case 'N':
            result.type = 'knight';
            break;
        case 'S':
            result.type = 'silver';
            break;
        case 'G':
            result.type = 'gold';
            break;
        case 'R':
            result.type = 'rook';
            break;
        case 'B':
            result.type = 'bishop';
            break;
        case 'K':
            result.type = 'king';
            break;
        default:
            return undefined;
    }
    return result;
}
exports.sfen2Piece = sfen2Piece;

},{"./types":5}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2lucHV0LnRzIiwic3JjL3Nob2d1aS50cyIsInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxtQ0FBbUU7QUFDbkUsaUNBQTJEO0FBRTNELE1BQXFCLEtBQUs7SUFLdEI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8s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O1NBQzdEO1FBR0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDcEMsS0FBSyxDQUFDLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO1NBRWpEO1FBR0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUd2QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztRQUVoRCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQzFELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJ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QyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixLQUFLLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO1FBQ3JCLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdB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LEtBQUssR0FBRztZQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ3ZCLE1BQU07UUFDVixLQUFLLEdBQUc7WUFDSixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUNyQixNQUFNO1FBQ1YsS0FBSyxHQUFHO1lBQ0osTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDckIsTUFBTTtRQUNWLEtBQUssR0FBRztZQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ3ZCLE1BQU07UUFDVixLQUFLLEdBQUc7WUFDSixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUNyQixNQUFNO1FBQ1Y7WUFDSSxPQUFPLFNBQVMsQ0FBQztLQUN4QjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFwQ0QsZ0NBb0NDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgUGllY2UsIFBpZWNldHlwZSwgU3F1YXJlLCBDb2xvciwgc3F1YXJlcyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBwaWVjZTJzZmVuLCB2YWxpZFNmZW4sIHNmZW4yUGllY2UgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvYXJkIHtcbiAgICBwcml2YXRlIHBpZWNlTGlzdDogTWFwPFNxdWFyZSwgUGllY2U+O1xuICAgIHByaXZhdGUgd2hpdGVIYW5kOiBNYXA8UGllY2V0eXBlLCBudW1iZXI+O1xuICAgIHByaXZhdGUgYmxhY2tIYW5kOiBNYXA8UGllY2V0eXBlLCBudW1iZXI+O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucGllY2VMaXN0ID0gbmV3IE1hcDxTcXVhcmUsIFBpZWNlPigpO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZCA9IG5ldyBNYXA8UGllY2V0eXBlLCBudW1iZXI+KCk7XG4gICAgICAgIHRoaXMud2hpdGVIYW5kID0gbmV3IE1hcDxQaWVjZXR5cGUsIG51bWJlcj4oKTtcblxuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ3Bhd24nLCAwKTtcbiAgICAgICAgdGhpcy5ibGFja0hhbmQuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgdGhpcy5ibGFja0hhbmQuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgdGhpcy5ibGFja0hhbmQuc2V0KCdyb29rJywgMCk7XG5cbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdwYXduJywgMCk7XG4gICAgICAgIHRoaXMud2hpdGVIYW5kLnNldCgnbGFuY2UnLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdrbmlnaHQnLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdzaWx2ZXInLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdnb2xkJywgMCk7XG4gICAgICAgIHRoaXMud2hpdGVIYW5kLnNldCgnYmlzaG9wJywgMCk7XG4gICAgICAgIHRoaXMud2hpdGVIYW5kLnNldCgncm9vaycsIDApO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBTZXRzIHRoZSBib2FyZCB0byBzZmVuIHBvc2l0aW9uXG4gICAgICogQHBhcmFtIHNmZW4gLSBzZmVuIHN0cmluZ1xuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQb3NpdGlvbihzZmVuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF2YWxpZFNmZW4oc2ZlbikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2ZlbkFyciA9IHNmZW4uc3BsaXQoJyAnKTtcbiAgICAgICAgbGV0IHNmZW5Cb2FyZCA9IHNmZW5BcnJbMF07XG4gICAgICAgIGxldCBzZmVuSGFuZCA9IHNmZW5BcnJbMl07XG5cbiAgICAgICAgbGV0IHJvd3MgPSBzZmVuQm9hcmQuc3BsaXQoJy8nKTtcbiAgICAgICAgbGV0IGN1clNxdWFyZUluZGV4ID0gMDtcbiAgICAgICAgbGV0IGlzUHJvbW90ZSA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAobGV0IHIgb2Ygcm93cykge1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhciBvZiByKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpc05hTihOdW1iZXIoY2hhcikpICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhciA9PT0gJysnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcm9tb3RlKSB0aHJvdyBuZXcgRXJyb3IgKCdFUlJPUjogVHdvIFwiK1wiIHNpZ25zIGZvdW5kIGluIGEgcm93IGluIHNmZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJvbW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSBzZmVuMlBpZWNlKGNoYXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBpZWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXRyaWV2ZSBwaWVjZSBmcm9tIHNmZW4gZm9yIGNoYXJhY3RlcjogJyArIGNoYXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1Byb21vdGUpIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRQaWVjZShwaWVjZSwgc3F1YXJlc1tjdXJTcXVhcmVJbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICBjdXJTcXVhcmVJbmRleCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGN1clNxdWFyZUluZGV4ID0gY3VyU3F1YXJlSW5kZXggKyBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzUHJvbW90ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNmZW5IYW5kKSB7XG4gICAgICAgICAgICBsZXQgYW10ID0gMTtcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXIgb2Ygc2ZlbkhhbmQpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSBzZmVuMlBpZWNlKGNoYXIpO1xuICAgICAgICAgICAgICAgIGlmICggIWlzTmFOKE51bWJlcihjaGFyKSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFtdCA9IE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaWVjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFUlJPUjogQ2Fubm90IGdldCBwaWVjZSBmcm9tIHNmZW4gZm9yIGNoYXJhY3RlciAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZDJIYW5kKHBpZWNlLmNvbG9yLCBwaWVjZS50eXBlLCBhbXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFtdCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBHZXRzIHRoZSBib2FyZCdzIFNGRU4gcG9zaXRpb25cbiAgICAgKiBUT0RPOiBBZGQgaGFuZCBzdWJzdHJpbmcgb2Ygc2ZlblxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQb3NpdGlvbigpOiBzdHJpbmcge1xuICAgICAgICBsZXQgc2ZlbiA9ICcnO1xuICAgICAgICBsZXQgbnVtRW1wdHlTcGFjZXMgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGN1clNxIG9mIHNxdWFyZXMpIHtcbiAgICAgICAgICAgIGxldCBwaWVjZSA9IHRoaXMucGllY2VMaXN0LmdldChjdXJTcSk7XG5cbiAgICAgICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgICAgIGlmIChudW1FbXB0eVNwYWNlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZmVuICs9IG51bUVtcHR5U3BhY2VzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNmZW4gKz0gcGllY2Uyc2ZlbihwaWVjZSk7XG4gICAgICAgICAgICAgICAgbnVtRW1wdHlTcGFjZXMgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBudW1FbXB0eVNwYWNlcysrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY3VyU3FbMF0gPT09ICcxJykge1xuICAgICAgICAgICAgICAgIGlmIChudW1FbXB0eVNwYWNlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZmVuICs9IG51bUVtcHR5U3BhY2VzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG51bUVtcHR5U3BhY2VzID0gMDtcbiAgICAgICAgICAgICAgICBpZiAoY3VyU3EgIT09IHNxdWFyZXNbc3F1YXJlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgICAgICAgICBzZmVuICs9ICcvJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2ZlbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZVBpZWNlKGZyb21TcTogU3F1YXJlLCB0b1NxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGZyb21TcSA9PT0gdG9TcSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCBwaWVjZSA9IHRoaXMucGllY2VMaXN0LmdldChmcm9tU3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LnNldCh0b1NxLCBwaWVjZSk7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5kZWxldGUoZnJvbVNxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQaWVjZShzcTogU3F1YXJlKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGllY2VMaXN0LmdldChzcSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFBpZWNlKHBpZWNlOiBQaWVjZSwgc3E6IFNxdWFyZSkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHBpZWNlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJvcFBpZWNlKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIHNxOiBTcXVhcmUsIG51bSA9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlRnJvbUhhbmQoY29sb3IsIHBpZWNldHlwZSwgbnVtKSkge1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHNxLCB7dHlwZTogcGllY2V0eXBlLCBjb2xvcjogY29sb3J9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkMkhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgaGFuZCA9IHRoaXMuZ2V0SGFuZChjb2xvcik7XG4gICAgICAgIGxldCBjdXJBbW91bnQgPSBoYW5kPy5nZXQocGllY2V0eXBlKTtcbiAgICAgICAgaWYgKGN1ckFtb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBoYW5kPy5zZXQocGllY2V0eXBlLCBjdXJBbW91bnQgKyBudW0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVGcm9tSGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5nZXRIYW5kKGNvbG9yKTtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IGhhbmQ/LmdldChwaWVjZXR5cGUpO1xuICAgICAgICBpZiAoIWN1ckFtb3VudCB8fCBjdXJBbW91bnQgLSBudW0gPCAwKSB7IFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCAtIG51bSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXROdW1QaWVjZXNJbkhhbmQoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRIYW5kKGNvbG9yKT8uZ2V0KHBpZWNldHlwZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRIYW5kKGNvbG9yOiBDb2xvcik6IE1hcDxQaWVjZXR5cGUsIG51bWJlcj4gfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoY29sb3IgPT09ICdibGFjaycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJsYWNrSGFuZDtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xvciA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2hpdGVIYW5kO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufSIsImltcG9ydCB7IENvbG9yLCBQaWVjZSwgUGllY2V0eXBlLCBSZWN0LCBTcXVhcmUsIHNxdWFyZXMsIEFycm93LCBDb25maWcgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgeyBpc1ZhbGlkU3F1YXJlIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHVUkge1xuICAgIHByaXZhdGUgb3JpZW50YXRpb246IENvbG9yO1xuICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBwcml2YXRlIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgYXJyb3dDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgYXJyb3dDdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwcml2YXRlIGltYWdlTWFwOiBNYXA8c3RyaW5nLCBIVE1MSW1hZ2VFbGVtZW50PjtcbiAgICBwcml2YXRlIHNxU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgYm9hcmRCb3VuZHM6IFJlY3Q7XG4gICAgcHJpdmF0ZSBwbGF5ZXJIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcbiAgICBwcml2YXRlIG9wcG9uZW50SGFuZEJvdW5kczogTWFwPFBpZWNldHlwZSwgUmVjdD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJvYXJkOiBCb2FyZCwgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgcHJpdmF0ZSBjb25maWc6IENvbmZpZykge1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ2JsYWNrJztcbiAgICAgICAgaWYgKGNvbmZpZy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgdGhpcy5vcmllbnRhdGlvbiA9ICd3aGl0ZSc7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMud2lkdGgvMiArIDIwO1xuICAgICAgICBsZXQgdG1wQ3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKHRtcEN0eCkge1xuICAgICAgICAgICAgdGhpcy5jdHggPSB0bXBDdHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBvYnRhaW4gZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmFycm93Q2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcbiAgICAgICAgdGhpcy5hcnJvd0NhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICBsZXQgdG1wYUN0eCA9IHRoaXMuYXJyb3dDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgaWYgKHRtcGFDdHgpIHsgXG4gICAgICAgICAgICB0aGlzLmFycm93Q3R4ID0gdG1wYUN0eDtcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHgubGluZUNhcCA9ICdyb3VuZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBvYnRhaW4gYXJyb3cgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb2FkIGltYWdlc1xuICAgICAgICB0aGlzLmltYWdlTWFwID0gbmV3IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+KCk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdwYXduJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdsYW5jZScsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytsYW5jZScsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2tuaWdodCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytrbmlnaHQnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdzaWx2ZXInLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrc2lsdmVyJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnZ29sZCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2Jpc2hvcCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytiaXNob3AnLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdyb29rJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK3Jvb2snLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdraW5nJywgbmV3IEltYWdlKCkpO1xuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmltYWdlTWFwKSB7XG4gICAgICAgICAgICB2YWx1ZS5zcmMgPSAnLi4vbWVkaWEvcGllY2VzLycgKyBrZXkgKyAnLnBuZyc7XG4gICAgICAgICAgICAvL3ZhbHVlLnNyYyA9ICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ3NqMjg1L1Nob0dVSS9tYXN0ZXIvbWVkaWEvcGllY2VzLycgKyBrZXkgKyAnLnBuZydcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIFJlY3RzXG4gICAgICAgIHRoaXMuYm9hcmRCb3VuZHMgPSB7IHg6IHRoaXMuY2FudmFzLndpZHRoLzQsIHk6IDE1LCB3aWR0aDogdGhpcy5jYW52YXMud2lkdGgvMiwgaGVpZ2h0OiB0aGlzLmNhbnZhcy53aWR0aC8yIH07XG4gICAgICAgIHRoaXMuc3FTaXplID0gdGhpcy5ib2FyZEJvdW5kcy53aWR0aC85O1xuXG4gICAgICAgIC8vIEhhbmQgUmVjdHNcbiAgICAgICAgbGV0IHRtcEhhbmRSZWN0cyA9IHRoaXMuaW5pdEhhbmRSZWN0TWFwcygpO1xuICAgICAgICB0aGlzLnBsYXllckhhbmRCb3VuZHMgPSB0bXBIYW5kUmVjdHMucGxheWVyO1xuICAgICAgICB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcyA9IHRtcEhhbmRSZWN0cy5vcHBvbmVudDtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdEhhbmRSZWN0TWFwcygpOiB7IHBsYXllcjogTWFwPFBpZWNldHlwZSwgUmVjdD4sIG9wcG9uZW50OiBNYXA8UGllY2V0eXBlLCBSZWN0PiB9IHtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSB0aGlzLmJvYXJkQm91bmRzLnggKyB0aGlzLmJvYXJkQm91bmRzLndpZHRoO1xuICAgICAgICBsZXQgc3EgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IHBIYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIGxldCBvSGFuZE1hcCA9IG5ldyBNYXA8UGllY2V0eXBlLCBSZWN0PigpO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjYsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnbGFuY2UnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdrbmlnaHQnLCB7IHg6cGFkZGluZyArIHNxLzIsIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjcsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6cGFkZGluZyArIHNxKigzLzIpLCB5OnNxKjgsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncm9vaycsIHsgeDpwYWRkaW5nICsgc3EqKDUvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdwYXduJywgeyB4OnNxKjIsIHk6c3EqMiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpzcSozLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpzcSozLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnc2lsdmVyJywgeyB4OnNxKjIsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgnZ29sZCcsIHsgeDpzcSwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdiaXNob3AnLCB7IHg6c3EqMiwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Jvb2snLCB7IHg6c3EsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcblxuICAgICAgICByZXR1cm4geyBwbGF5ZXI6IHBIYW5kTWFwLCBvcHBvbmVudDogb0hhbmRNYXAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhckNhbnZhcygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3NsYXRlZ3JleSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmFycm93Q2FudmFzLndpZHRoLCB0aGlzLmFycm93Q2FudmFzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdCb2FyZCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSAnc2lsdmVyJztcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMTtcblxuICAgICAgICBmb3IgKGxldCBmID0gMDsgZiA8PSA5OyBmKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gZip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRCb3VuZHMueDtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oaSwgdGhpcy5ib2FyZEJvdW5kcy55KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhpLCB0aGlzLmJvYXJkQm91bmRzLnkgKyB0aGlzLmJvYXJkQm91bmRzLmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPD0gOTsgcisrKSB7XG4gICAgICAgICAgICBsZXQgaSA9IHIqdGhpcy5zcVNpemUgKyB0aGlzLmJvYXJkQm91bmRzLnk7XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHRoaXMuYm9hcmRCb3VuZHMueCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8odGhpcy5ib2FyZEJvdW5kcy54ICsgdGhpcy5ib2FyZEJvdW5kcy53aWR0aCwgaSk7XG4gICAgICAgICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdGaWxlUmFua0xhYmVscygpOiB2b2lkIHtcbiAgICAgICAgbGV0IGludGVydmFsID0gdGhpcy5zcVNpemU7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSAnMTVweCBhcmlhbCdcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgbGV0IGxhYmVsID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwgPSA4IC0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQoIFN0cmluZy5mcm9tQ2hhckNvZGUobGFiZWwrMSs5NiksIHRoaXMuYm9hcmRCb3VuZHMueCArIHRoaXMuYm9hcmRCb3VuZHMud2lkdGggKyAzLCB0aGlzLmJvYXJkQm91bmRzLnkgKyB0aGlzLnNxU2l6ZS8yKyhpKmludGVydmFsKSApO1xuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ3RvcCc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggKDEwIC0gKGxhYmVsKzEpKS50b1N0cmluZygpLCB0aGlzLmJvYXJkQm91bmRzLnggKyAodGhpcy5zcVNpemUvMikrKGkqaW50ZXJ2YWwpLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3UGllY2UocGllY2U6IFBpZWNlLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBwaWVjZS50eXBlO1xuICAgICAgICBpZiAocGllY2UucHJvbW90ZWQpIHtcbiAgICAgICAgICAgIGtleSA9ICcrJyArIGtleTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGllY2VJbWc6IEhUTUxJbWFnZUVsZW1lbnR8dW5kZWZpbmVkID0gdGhpcy5pbWFnZU1hcC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGllY2UuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwaWVjZUltZywgeCwgeSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0ludmVydGVkKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdQaWVjZUF0U3F1YXJlKHNxOiBTcXVhcmUpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHBpZWNlOiBQaWVjZXx1bmRlZmluZWQgPSB0aGlzLmJvYXJkLmdldFBpZWNlKHNxKTtcbiAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd1BpZWNlKHBpZWNlLCBwb3MueCwgcG9zLnkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SGFuZChjb2xvcjogQ29sb3IpIHtcbiAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ2JvdHRvbSc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgIGlmIChjb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMucGxheWVySGFuZEJvdW5kcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB2YWx1ZS54LCB2YWx1ZS55LCB2YWx1ZS53aWR0aCwgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dChudW1PZlBpZWNlcy50b1N0cmluZygpLCB2YWx1ZS54LCB2YWx1ZS55ICsgdmFsdWUuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcykge1xuICAgICAgICAgICAgICAgIGxldCBudW1PZlBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKGNvbG9yLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtT2ZQaWVjZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gbnVtT2ZQaWVjZXMgPT09IDAgPyAwLjIgOiAxO1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghcGllY2VJbWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgcGllY2UgaW1hZ2U6IFwiICsga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgIH1cblxuICAgIHB1YmxpYyBoaWdobGlnaHRTcXVhcmUoc3R5bGU6IHN0cmluZywgdHlwZTogc3RyaW5nLCBzcTogU3F1YXJlLCBhbHBoYT86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2hpZGRlbicpIHJldHVybiBmYWxzZTtcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuc3F1YXJlMlBvcyhzcSk7XG5cbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgaWYgKGFscGhhKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdmaWxsJzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChwb3MueCwgcG9zLnksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ291dGxpbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IHRoaXMuY2FudmFzLndpZHRoLzIwMDtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KHBvcy54ICsgNCwgcG9zLnkgKyA0LCB0aGlzLnNxU2l6ZSAtIDgsIHRoaXMuc3FTaXplIC0gOCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvNTAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmFyYyhwb3MuY2VudGVyWCwgcG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzIgLSA0LCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4vKlxuICAgICAgICAgICAgY2FzZSAnZG90JzpcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5hcmMocG9zLmNlbnRlclgsIHBvcy5jZW50ZXJZLCB0aGlzLnNxU2l6ZS84LCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdBcnJvdyhzdHlsZTogc3RyaW5nLCBzaXplOiBudW1iZXIsIGZyb214OiBudW1iZXIsIGZyb215OiBudW1iZXIsIHRveDogbnVtYmVyLCB0b3k6IG51bWJlcikge1xuICAgICAgICB0aGlzLmFycm93Q3R4LnNhdmUoKTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0b3kgLSBmcm9teSwgdG94IC0gZnJvbXgpO1xuICAgICAgICBsZXQgcmFkaXVzID0gc2l6ZSoodGhpcy5hcnJvd0NhbnZhcy53aWR0aC8xNTApO1xuICAgICAgICBsZXQgeCA9IHRveCAtIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgbGV0IHkgPSB0b3kgLSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVdpZHRoID0gMipyYWRpdXMvNTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5maWxsU3R5bGUgPSBzdHlsZTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2VTdHlsZSA9IHN0eWxlO1xuIFxuICAgICAgICAvLyBEcmF3IGxpbmVcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8oZnJvbXgsIGZyb215KTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gXG4gICAgICAgIC8vIERyYXcgYXJyb3cgaGVhZFxuICAgICAgICB0aGlzLmFycm93Q3R4LmJlZ2luUGF0aCgpO1xuIFxuICAgICAgICBsZXQgeGNlbnRlciA9ICh0b3ggKyB4KS8yO1xuICAgICAgICBsZXQgeWNlbnRlciA9ICh0b3kgKyB5KS8yO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4Lm1vdmVUbyh0b3gsIHRveSk7XG4gICAgICAgIGFuZ2xlICs9IDIqTWF0aC5QSS8zO1xuICAgICAgICB4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpICsgeGNlbnRlcjtcbiAgICAgICAgeSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSArIHljZW50ZXI7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5maWxsKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERyYXcgYW4gYXJyb3cgdGhhdCBzbmFwcyB0byBib2FyZCBzcXVhcmVzIG9yIGhhbmQgcGllY2VzXG4gICAgICogQHBhcmFtIGFycm93IFxuICAgICAqL1xuICAgIHB1YmxpYyBkcmF3U25hcEFycm93KGFycm93OiBBcnJvdykge1xuICAgICAgICBpZiAoIWFycm93LmRlc3QpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAoaXNWYWxpZFNxdWFyZShhcnJvdy5zcmMpKSB7IC8vIEJlZ2lubmluZyBvZiBhcnJvdyBzdGFydHMgYXQgYSBib2FyZCBzcXVhcmVcbiAgICAgICAgICAgIGxldCBmcm9tU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cuc3JjKTtcblxuICAgICAgICAgICAgaWYgKGFycm93LmRlc3QgPT09IGFycm93LnNyYykgeyBcbiAgICAgICAgICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZVN0eWxlID0gYXJyb3cuc3R5bGU7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lV2lkdGggPSBhcnJvdy5zaXplKnRoaXMuY2FudmFzLndpZHRoLzE3NTA7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFycm93Q3R4LmFyYyhmcm9tU3FQb3MuY2VudGVyWCwgZnJvbVNxUG9zLmNlbnRlclksIHRoaXMuc3FTaXplLzIgLSA0LCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cuZGVzdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cuc3R5bGUsIGFycm93LnNpemUsIGZyb21TcVBvcy5jZW50ZXJYLCBmcm9tU3FQb3MuY2VudGVyWSwgdG9TcVBvcy5jZW50ZXJYLCB0b1NxUG9zLmNlbnRlclkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBCZWdpbm5pbmcgb2YgYXJyb3cgc3RhcnRzIGF0IGEgaGFuZCBwaWVjZVxuICAgICAgICAgICAgbGV0IHJlY3Q7XG4gICAgICAgICAgICBsZXQgaGFuZFBpZWNlID0gYXJyb3cuc3JjO1xuICAgICAgICAgICAgaWYgKGhhbmRQaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgICAgIHJlY3QgPSB0aGlzLnBsYXllckhhbmRCb3VuZHMuZ2V0KGhhbmRQaWVjZS50eXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5vcHBvbmVudEhhbmRCb3VuZHMuZ2V0KGhhbmRQaWVjZS50eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVjdCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgbGV0IHRvU3FQb3MgPSB0aGlzLnNxdWFyZTJQb3MoYXJyb3cuZGVzdCk7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93LnN0eWxlLCBhcnJvdy5zaXplLCByZWN0LngrKHJlY3Qud2lkdGgvMiksIHJlY3QueSsocmVjdC5oZWlnaHQvMiksIHRvU3FQb3MuY2VudGVyWCwgdG9TcVBvcy5jZW50ZXJZKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3QXJyb3dDYW52YXMoYWxwaGE6IG51bWJlcikge1xuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5hcnJvd0NhbnZhcywgMCwgMCk7XG4gICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gMS4wO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3SW52ZXJ0ZWQoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgICAgdGhpcy5jdHgudHJhbnNsYXRlKHggKyB3aWR0aC8yLCB5ICsgaGVpZ2h0LzIpO1xuICAgICAgICB0aGlzLmN0eC5yb3RhdGUoTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSggLSh4ICsgd2lkdGgvMiksIC0oeSArIGhlaWdodC8yKSApO1xuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoaW1hZ2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcG9zMlNxdWFyZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IFNxdWFyZXx1bmRlZmluZWQge1xuICAgICAgICBsZXQgY29sID0gTWF0aC5mbG9vciggKHggLSB0aGlzLmJvYXJkQm91bmRzLngpL3RoaXMuc3FTaXplICk7XG4gICAgICAgIGxldCByb3cgPSBNYXRoLmZsb29yKCAoeSAtIHRoaXMuYm9hcmRCb3VuZHMueSkvdGhpcy5zcVNpemUpO1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbCA8IDAgfHwgcm93IDwgMCB8fCBjb2wgPiA5IC0gMSB8fCByb3cgPiA5IC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3F1YXJlc1sgOSpyb3cgKyBjb2wgXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3F1YXJlMlBvcyhzcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBjb2wgPSA5IC0gcGFyc2VJbnQoc3FbMF0pO1xuICAgICAgICBsZXQgcm93ID0gc3EuY2hhckNvZGVBdCgxKSAtIDk3O1xuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJykge1xuICAgICAgICAgICAgY29sID0gOCAtIGNvbDtcbiAgICAgICAgICAgIHJvdyA9IDggLSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHggPSB0aGlzLmJvYXJkQm91bmRzLnggKyAoY29sICogdGhpcy5zcVNpemUpO1xuICAgICAgICBsZXQgeSA9IHRoaXMuYm9hcmRCb3VuZHMueSArIHJvdyAqIHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgY2VudGVyWCA9IHggKyAodGhpcy5zcVNpemUvMik7XG4gICAgICAgIGxldCBjZW50ZXJZID0geSArICh0aGlzLnNxU2l6ZS8yKVxuICAgICAgICByZXR1cm4geyB4LCB5LCBjZW50ZXJYLCBjZW50ZXJZIH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldEJvYXJkQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3FTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zcVNpemU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBsYXllckhhbmRCb3VuZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllckhhbmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE9wcG9uZW50SGFuZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcmllbnRhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGdldENhbnZhcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBTaG9HVUkgfSBmcm9tIFwiLi9zaG9ndWlcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IEdVSSBmcm9tIFwiLi9ndWlcIjtcbmltcG9ydCB7IENvbmZpZywgQXJyb3csIFNxdWFyZSwgUGllY2UsIENvbG9yIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgYXJyb3dzRXF1YWwgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBEcmFnZ2luZ1BpZWNlIHtcbiAgICBwaWVjZTogUGllY2UsXG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlclxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBndWk6IEdVSTtcbiAgICBcbiAgICBwcml2YXRlIGN1cnJlbnRBcnJvdzogQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dzOiBBcnJvd1tdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNob2d1aTogU2hvR1VJLCBwcml2YXRlIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmJvYXJkID0gc2hvZ3VpLmdldEJvYXJkKCk7XG4gICAgICAgIHRoaXMuZ3VpID0gc2hvZ3VpLmdldEd1aSgpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gbW91c2VNb3ZlSGFuZGxlcihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVIYW5kbGVyKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VVcChlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApICk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEFjdGl2ZVNxdWFyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU3F1YXJlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXREcmFnZ2luZ1BpZWNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnZ2luZ1BpZWNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50QXJyb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRBcnJvdztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlckFycm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyb3dzO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkQXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIHRoaXMuYXJyb3dzLnB1c2goYXJyb3cpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlQXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgY21wQXJyb3cgb2YgdGhpcy5hcnJvd3MpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3dzRXF1YWwoY21wQXJyb3csIGFycm93KSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFycm93cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uUmlnaHRDbGljayhldmVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyQXJyb3dzKCk7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gY2xpY2tlZFNxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gY2xpY2tlZFNxO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAhPT0gY2xpY2tlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCksIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKG9wcG9uZW50Q29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiB0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gc3FPdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIHNxT3Zlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmICF0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvZ3VpLmRyb3BQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UuY29sb3IsIHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZS50eXBlLCBzcU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnJlbW92ZUFycm93KHRoaXMuY3VycmVudEFycm93KSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cuc2l6ZSArPSAwLjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZ3VpLmdldENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGhvdmVyU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcblxuICAgICAgICBpZiAoIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnggPSBtb3VzZVg7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueSA9IG1vdXNlWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgaWYgKGhvdmVyU3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy5kZXN0ID0gaG92ZXJTcTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cuZGVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SaWdodENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5ndWkuZ2V0Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgY2xpY2tlZFNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgIGxldCBhcnJvd1N0eWxlID0gJ2JsdWUnO1xuICAgICAgICBpZiAodGhpcy5jb25maWcuYXJyb3dTdHlsZSkge1xuICAgICAgICAgICAgYXJyb3dTdHlsZSA9IHRoaXMuY29uZmlnLmFycm93U3R5bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmFsdEFycm93U3R5bGUgJiYgZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBhcnJvd1N0eWxlID0gdGhpcy5jb25maWcuYWx0QXJyb3dTdHlsZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25maWcuY3RybEFycm93U3R5bGUgJiYgZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgYXJyb3dTdHlsZSA9IHRoaXMuY29uZmlnLmN0cmxBcnJvd1N0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsaWNrZWRTcSAmJiAhdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6IGFycm93U3R5bGUsIHNpemU6IDMuNSwgc3JjOiBjbGlja2VkU3EsIGRlc3Q6IGNsaWNrZWRTcSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiBhcnJvd1N0eWxlLCBzaXplOiAzLjUsIHNyYzoge3R5cGU6IGtleSwgY29sb3I6IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCl9IH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0T3Bwb25lbnRIYW5kQm91bmRzKCkpIHtcbiAgICAgICAgICAgIGlmIChpc1Bvc0luc2lkZVJlY3QodmFsdWUsIG1vdXNlWCwgbW91c2VZKSkge1xuICAgICAgICAgICAgICAgIGxldCBvcHBvbmVudENvbG9yOiBDb2xvciA9IHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCkgPT09ICdibGFjaycgPyAnd2hpdGUnIDogJ2JsYWNrJztcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6IGFycm93U3R5bGUsIHNpemU6IDMuNSwgc3JjOiB7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgfVxufSIsImltcG9ydCBHVUkgZnJvbSBcIi4vZ3VpXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCB7IENvbmZpZywgUGllY2V0eXBlLCBTcXVhcmUsIHNxdWFyZXMsIENvbG9yLCBBcnJvdywgSGlnaGxpZ2h0IH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGFycm93c0VxdWFsIH0gZnJvbSBcIi4vdXRpbFwiO1xuaW1wb3J0IElucHV0IGZyb20gXCIuL2lucHV0XCI7XG5cbmV4cG9ydCBjbGFzcyBTaG9HVUkge1xuICAgIHByaXZhdGUgYm9hcmQ6IEJvYXJkO1xuICAgIHByaXZhdGUgZ3VpOiBHVUk7XG4gICAgcHJpdmF0ZSBpbnB1dDogSW5wdXQ7XG4gICAgcHJpdmF0ZSBoaWdobGlnaHRMaXN0OiBIaWdobGlnaHRbXTtcbiAgICBwcml2YXRlIGFycm93TGlzdDogQXJyb3dbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29udGFpbmVyOiBIVE1MRWxlbWVudCwgcHJpdmF0ZSBjb25maWc6IENvbmZpZykge1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIHRoaXMuZ3VpID0gbmV3IEdVSSh0aGlzLmJvYXJkLCBjb250YWluZXIsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQodGhpcywgY29uZmlnKTtcblxuICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5hcnJvd0xpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UG9zaXRpb24oc2Zlbjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYm9hcmQuc2V0UG9zaXRpb24oc2Zlbik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2FyZC5nZXRQb3NpdGlvbigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKSB7XG4gICAgICAgIHRoaXMuZ3VpLmZsaXBCb2FyZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNTcXVhcmVIaWdobGlnaHRlZChzcTogU3F1YXJlKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBzcSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSGlnaGxpZ2h0KGhpZ2hsaWdodDogSGlnaGxpZ2h0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5pc1NxdWFyZUhpZ2hsaWdodGVkKGhpZ2hsaWdodC5zcSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0TGlzdC5wdXNoKGhpZ2hsaWdodCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGZvciAobGV0IHRtcGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIGlmICggdG1waGlnaGxpZ2h0LnNxID09PSBoaWdobGlnaHQuc3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJIaWdobGlnaHRzKCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQXJyb3coYXJyb3c6IEFycm93KTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChhcnJvdy5kZXN0ID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5hcnJvd0xpc3QucHVzaChhcnJvdyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVBcnJvdyhhcnJvdzogQXJyb3cpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCBjbXBBcnJvdyBvZiB0aGlzLmFycm93TGlzdCkge1xuICAgICAgICAgICAgaWYgKCBhcnJvd3NFcXVhbChjbXBBcnJvdywgYXJyb3cpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXJyb3dMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQXJyb3dzKCkge1xuICAgICAgICB0aGlzLmFycm93TGlzdCA9IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUGllY2Uoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25Nb3ZlUGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyb3BQaWVjZShjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uRHJvcFBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbkRyb3BQaWVjZShjb2xvciwgcGllY2V0eXBlLCBzcSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5kcm9wUGllY2UoY29sb3IsIHBpZWNldHlwZSwgc3EsIG51bSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVmcmVzaENhbnZhcygpIHtcbiAgICAgICAgbGV0IGFjdGl2ZVNxdWFyZSA9IHRoaXMuaW5wdXQuZ2V0QWN0aXZlU3F1YXJlKCk7XG4gICAgICAgIGxldCBkcmFnZ2luZ1BpZWNlID0gdGhpcy5pbnB1dC5nZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgICAgIGxldCBjdXJyZW50QXJyb3cgPSB0aGlzLmlucHV0LmdldEN1cnJlbnRBcnJvdygpO1xuICAgICAgICB0aGlzLmd1aS5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGZvciAobGV0IGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmhpZ2hsaWdodFNxdWFyZShoaWdobGlnaHQuc3R5bGUsIGhpZ2hsaWdodC50eXBlLCBoaWdobGlnaHQuc3EsIGhpZ2hsaWdodC5hbHBoYSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoJ21pbnRjcmVhbScsICdmaWxsJywgYWN0aXZlU3F1YXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aS5kcmF3RmlsZVJhbmtMYWJlbHMoKTtcblxuICAgICAgICBmb3IgKGxldCBpIG9mIHNxdWFyZXMpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmVTcXVhcmUgJiYgZHJhZ2dpbmdQaWVjZSkgeyAvLyBEb24ndCBkcmF3IHRoZSBjdXJyZW50bHkgZHJhZ2dpbmcgcGllY2Ugb24gaXRzIHNxdWFyZVxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVTcXVhcmUgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlQXRTcXVhcmUoaSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnYmxhY2snKTsgXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kKCd3aGl0ZScpO1xuXG4gICAgICAgIGlmIChkcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3UGllY2UoZHJhZ2dpbmdQaWVjZS5waWVjZSwgZHJhZ2dpbmdQaWVjZS54IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMiwgZHJhZ2dpbmdQaWVjZS55IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBsZXQgYXJyb3cgb2YgdGhpcy5pbnB1dC5nZXRVc2VyQXJyb3dzKCkgKSB7IC8vIERyYXcgdXNlciBpbnB1dCBhcnJvd3NcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggbGV0IGFycm93IG9mIHRoaXMuYXJyb3dMaXN0ICkgeyAvLyBEcmF3IHByb2dyYW1tYXRpY2FsbHktYWRkZWQgYXJyb3dzXG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhjdXJyZW50QXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0Fycm93Q2FudmFzKDAuNik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3QXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIHRoaXMuZ3VpLmRyYXdTbmFwQXJyb3coYXJyb3cpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCb2FyZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEd1aSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaG9HVUk7IiwiZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICAgIG9yaWVudGF0aW9uPzogQ29sb3IsXG4gICAgYXJyb3dTdHlsZT86IHN0cmluZyxcbiAgICBhbHRBcnJvd1N0eWxlPzogc3RyaW5nLFxuICAgIGN0cmxBcnJvd1N0eWxlPzogc3RyaW5nLFxuICAgIG9uTW92ZVBpZWNlPzogKC4uLmFyZ3M6IFNxdWFyZVtdKSA9PiBib29sZWFuLFxuICAgIG9uRHJvcFBpZWNlPzogKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25TZWxlY3RQaWVjZT86IChwaWVjZTogUGllY2UsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25EZXNlbGVjdFBpZWNlPzogKCkgPT4gYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBDb2xvciA9ICdibGFjaycgfCAnd2hpdGUnO1xuZXhwb3J0IHR5cGUgUGllY2V0eXBlID0gJ2tpbmcnIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgfCAnZ29sZCcgfCAnc2lsdmVyJyB8ICdrbmlnaHQnIHwgJ2xhbmNlJyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIEhpZ2hsaWdodFR5cGUgPSAnZmlsbCcgfCAnb3V0bGluZScgfCAnY2lyY2xlJyB8ICdoaWRkZW4nXG5leHBvcnQgdHlwZSBQaWVjZUNvZGUgPSAnSycgfCAnUicgfCAnQicgfCAnRycgfCAnUycgfCAnTicgfCAnTCcgfCAnUCcgfCAvLyBTRkVOIFBpZWNlY29kZXMgKHdpdGhvdXQgdGhlICcrJylcbiAgICAgICAgICAgICAgICAgICAgICAgICdrJyB8ICdyJyB8ICdiJyB8ICdnJyB8ICdzJyB8ICduJyB8ICdsJyB8ICdwJztcblxuZXhwb3J0IGNvbnN0IHNxdWFyZXMgPSBbICc5YScgLCAnOGEnICwgJzdhJyAsICc2YScgLCAnNWEnICwgJzRhJyAsICczYScgLCAnMmEnICwgJzFhJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzliJyAsICc4YicgLCAnN2InICwgJzZiJyAsICc1YicgLCAnNGInICwgJzNiJyAsICcyYicgLCAnMWInICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWMnICwgJzhjJyAsICc3YycgLCAnNmMnICwgJzVjJyAsICc0YycgLCAnM2MnICwgJzJjJyAsICcxYycgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5ZCcgLCAnOGQnICwgJzdkJyAsICc2ZCcgLCAnNWQnICwgJzRkJyAsICczZCcgLCAnMmQnICwgJzFkJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzllJyAsICc4ZScgLCAnN2UnICwgJzZlJyAsICc1ZScgLCAnNGUnICwgJzNlJyAsICcyZScgLCAnMWUnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWYnICwgJzhmJyAsICc3ZicgLCAnNmYnICwgJzVmJyAsICc0ZicgLCAnM2YnICwgJzJmJyAsICcxZicgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5ZycgLCAnOGcnICwgJzdnJyAsICc2ZycgLCAnNWcnICwgJzRnJyAsICczZycgLCAnMmcnICwgJzFnJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzloJyAsICc4aCcgLCAnN2gnICwgJzZoJyAsICc1aCcgLCAnNGgnICwgJzNoJyAsICcyaCcgLCAnMWgnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWknICwgJzhpJyAsICc3aScgLCAnNmknICwgJzVpJyAsICc0aScgLCAnM2knICwgJzJpJyAsICcxaScgXSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgU3F1YXJlID0gdHlwZW9mIHNxdWFyZXNbbnVtYmVyXTtcblxuZXhwb3J0IGludGVyZmFjZSBQaWVjZSB7XG4gICAgdHlwZTogUGllY2V0eXBlLFxuICAgIGNvbG9yOiBDb2xvcixcbiAgICBwcm9tb3RlZD86IGJvb2xlYW5cbn1cbmV4cG9ydCBpbnRlcmZhY2UgUmVjdCB7XG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG59XG5leHBvcnQgaW50ZXJmYWNlIEFycm93IHtcbiAgICBzdHlsZTogc3RyaW5nO1xuICAgIHNpemU6IG51bWJlcixcbiAgICBzcmM6IFNxdWFyZXxQaWVjZSxcbiAgICBkZXN0PzogU3F1YXJlXG59XG5leHBvcnQgaW50ZXJmYWNlIEhpZ2hsaWdodCB7XG4gICAgc3R5bGU6IHN0cmluZyxcbiAgICB0eXBlOiBIaWdobGlnaHRUeXBlLFxuICAgIGFscGhhPzogbnVtYmVyLFxuICAgIHNxOiBTcXVhcmVcbn0iLCJpbXBvcnQgeyBSZWN0LCBBcnJvdywgUGllY2UsIFNxdWFyZSwgc3F1YXJlcywgQ29sb3IsIFBpZWNldHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBzb21ldGhpbmcgaXMgaW5zaWRlIHRoZSBSZWN0XG4gKiBAcGFyYW0gcmVjdCAtIFJlY3RhbmdsZSB0byBjaGVjayBpZiBwb3MgaXMgaW5zaWRlXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiBwb3NpdGlvblxuICogQHBhcmFtIHkgLSBZIGNvb3JkaWFudGUgb2YgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zSW5zaWRlUmVjdChyZWN0OiBSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICh4IDwgcmVjdC54IHx8IHggPj0gcmVjdC54ICsgcmVjdC53aWR0aCB8fFxuICAgICAgICB5IDwgcmVjdC55IHx8IHkgPj0gcmVjdC55ICsgcmVjdC5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycm93c0VxdWFsKGFycm93MTogQXJyb3csIGFycm93MjogQXJyb3cpOiBib29sZWFuIHtcbiAgICBpZiAoYXJyb3cxLnNyYyA9PT0gYXJyb3cyLnNyYykgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFNxdWFyZShhcmc6YW55KTogYXJnIGlzIFNxdWFyZSB7XG4gICAgcmV0dXJuIHNxdWFyZXMuaW5jbHVkZXMoYXJnKSAhPT0gZmFsc2U7XG59XG5cbi8vIFRPT0Q6IENoZWNrIGhhbmQgc3Vic3RyaW5nIG9mIHNmZW5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFNmZW4oc2Zlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IHNmZW5BcnIgPSBzZmVuLnNwbGl0KCcgJyk7XG4gICAgbGV0IHNmZW5Cb2FyZCA9IHNmZW5BcnJbMF07XG4gICAgbGV0IHJvd3MgPSBzZmVuQm9hcmQuc3BsaXQoJy8nKTtcblxuICAgIGlmIChyb3dzLmxlbmd0aCAhPT0gOSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHNxQ291bnQgPSAwO1xuICAgIGZvcihsZXQgciBvZiByb3dzKSB7XG4gICAgICAgIGZvcihsZXQgY2hhciBvZiByKSB7XG4gICAgICAgICAgICBpZiAoICFpc05hTihOdW1iZXIoY2hhcikpICl7XG4gICAgICAgICAgICAgICAgc3FDb3VudCArPSBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggY2hhci5zZWFyY2goL1tecGxuc2dicmtQTE5TR0JSS10vKSApIHtcbiAgICAgICAgICAgICAgICAgICAgc3FDb3VudCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNxQ291bnQgIT09IDkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzcUNvdW50ID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlMnNmZW4ocGllY2U6IFBpZWNlKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAvLyBHZXQgdGhlIHNmZW4gZnJvbSBwaWVjZXR5cGVcbiAgICBpZiAocGllY2UudHlwZSA9PT0gJ2tuaWdodCcpIHtcbiAgICAgICAgcmVzdWx0ICs9ICduJ1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCArPSBwaWVjZS50eXBlWzBdO1xuICAgIH1cblxuICAgIC8vIE1ha2UgaXQgdXBwZXJjYXNlIGlmIGl0J3MgYmxhY2sncyBwaWVjZVxuICAgIGlmIChwaWVjZS5jb2xvciA9PT0gJ2JsYWNrJykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQudG9VcHBlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIHBsdXMgc2lnbiBpZiB0aGUgcGllY2UgaXMgcHJvbW90ZWRcbiAgICBpZiAocGllY2UucHJvbW90ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gJysnICsgcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZmVuMlBpZWNlKHNmZW46IHN0cmluZyk6IFBpZWNlfHVuZGVmaW5lZCB7XG4gICAgbGV0IHBVcHBlciA9IHNmZW4udG9VcHBlckNhc2UoKTtcbiAgICBsZXQgcmVzdWx0ID0geyB0eXBlOiA8UGllY2V0eXBlPicnLCBjb2xvcjogPENvbG9yPicnfTtcblxuICAgIHJlc3VsdC5jb2xvciA9IHBVcHBlciA9PT0gc2ZlbiA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG4gICAgc3dpdGNoIChwVXBwZXIpIHtcbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdwYXduJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdMJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2xhbmNlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2tuaWdodCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdzaWx2ZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0cnOlxuICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSAnZ29sZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUic6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdyb29rJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdCJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2Jpc2hvcCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSyc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdraW5nJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIl19
