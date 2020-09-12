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
                this.drawCircle(this.ctx, style, this.canvas.width / 500, pos.centerX, pos.centerY, this.sqSize / 2 - 4);
                break;
            default:
                return false;
        }
        this.ctx.restore();
        return true;
    }
    drawCircle(ctx, style, lineWidth, centerX, centerY, radius) {
        ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = style;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
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
                this.drawCircle(this.arrowCtx, arrow.style, arrow.size * this.canvas.width / 1750, fromSqPos.centerX, fromSqPos.centerY, this.sqSize / 2 - 4);
            }
            else {
                let toSqPos = this.square2Pos(arrow.dest);
                this.drawArrow(arrow.style, arrow.size, fromSqPos.centerX, fromSqPos.centerY, toSqPos.centerX, toSqPos.centerY);
            }
        }
        else {
            let rect;
            let handPiece = util_1.sfen2Piece(arrow.src);
            if (!handPiece)
                return false;
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
                this.currentArrow = { style: arrowStyle, size: 3.5, src: util_1.piece2sfen({ type: key, color: this.gui.getOrientation() }) };
            }
        }
        for (let [key, value] of this.gui.getOpponentHandBounds()) {
            if (util_1.isPosInsideRect(value, mouseX, mouseY)) {
                let opponentColor = this.gui.getOrientation() === 'black' ? 'white' : 'black';
                this.currentArrow = { style: arrowStyle, size: 3.5, src: util_1.piece2sfen({ type: key, color: opponentColor }) };
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
        for (let arrow of this.arrowList) {
            this.drawArrow(arrow);
        }
        for (let arrow of this.input.getUserArrows()) {
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
    if (arrow1.src === arrow2.src && arrow1.dest === arrow2.dest)
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2lucHV0LnRzIiwic3JjL3Nob2d1aS50cyIsInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxtQ0FBbUU7QUFDbkUsaUNBQTJEO0FBRTNELE1BQXFCLEtBQUs7SUFLdEI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8s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O1NBQzdEO1FBR0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDcEMsS0FBSyxDQUFDLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO1NBRWpEO1FBR0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQztRQUd2QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztRQUVoRCxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO1FBQzFELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDMUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RSxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6RCxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN4RSxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxTQUFTO1FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBRTNDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ3JCO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUUzQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjtJQUNMLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUE7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBRTdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLE9BQU8sRUFBRTtnQkFDOUIsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakI7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsQ0FBRSxDQUFDO1lBQ3ZKLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN6RztJQUNMLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBWSxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9DLElBQUksR0FBRyxHQUFXLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2hCLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxRQUFRLEdBQStCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3pEO1FBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEU7YUFBTTtZQUNILElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0Q7SUFDTCxDQUFDO0lBRU0saUJBQWlCLENBQUMsRUFBVTtRQUMvQixJQUFJLEtBQUssR0FBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckQsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVk7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzVDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLFdBQVcsS0FBSyxTQUFTO29CQUFFLE9BQU87Z0JBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFFBQVEsR0FBK0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxHQUFHLENBQUMsQ0FBQztpQkFDekQ7Z0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDOUU7U0FDSjthQUFNO1lBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDOUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3hELElBQUksV0FBVyxLQUFLLFNBQVM7b0JBQUUsT0FBTztnQkFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELElBQUksUUFBUSxHQUErQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLEdBQUcsQ0FBQyxDQUFDO2lCQUN6RDtnQkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlFO1NBQ0o7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLGVBQWUsQ0FBQyxLQUFhLEVBQUUsSUFBWSxFQUFFLEVBQVUsRUFBRSxLQUFjO1FBQzFFLElBQUksSUFBSSxLQUFLLFFBQVE7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNwQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUNoQztRQUNELFFBQU8sSUFBSSxFQUFFO1lBQ1QsS0FBSyxNQUFNO2dCQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUQsTUFBTTtZQUVWLEtBQUssU0FBUztnQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLE1BQU07WUFFVixLQUFLLFFBQVE7Z0JBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNO1lBUVY7Z0JBQ0ksT0FBTyxLQUFLLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxVQUFVLENBQUMsR0FBNkIsRUFBRSxLQUFhLEVBQUUsU0FBaUIsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLE1BQWM7UUFDL0gsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVgsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDMUIsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEQsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWIsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxTQUFTLENBQUMsS0FBYSxFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ2hHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNqRCxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTFCLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLEVBQUUsR0FBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFH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SUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUk7SUFDNUQsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJO0lBQzVELElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSTtJQUM1RCxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUk7SUFDNUQsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJO0lBQzVELElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSTtJQUM1RCxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUk7SUFDNUQsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLEVBQUcsSUFBSSxFQUFHLElBQUksRUFBRyxJQUFJLENBQVcsQ0FBQzs7Ozs7O0FDekJqRyxtQ0FBZ0Y7QUFRaEYsU0FBZ0IsZUFBZSxDQUFDLElBQVUsRUFBRSxDQUFTLEVBQUUsQ0FBUztJQUM1RCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLO1FBQ3RDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMs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SyxHQUFHO1lBQ0osTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7WUFDckIsTUFBTTtRQUNWLEtBQUssR0FBRztZQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1lBQ3RCLE1BQU07UUFDVixLQUFLLEdBQUc7WUFDSixNQUFNLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUN2QixNQUFNO1FBQ1YsS0FBSyxHQUFHO1lBQ0osTUFBTSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFDdkIsTUFBTTtRQUNWLEtBQUssR0FBRztZQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLE1BQU07UUFDVixLQUFLLEdBQUc7WUFDSixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUNyQixNQUFNO1FBQ1YsS0FBSyxHQUFHO1lBQ0osTUFBTSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7WUFDdkIsTUFBTTtRQUNWLEtBQUssR0FBRztZQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLE1BQU07UUFDVjtZQUNJLE9BQU8sU0FBUyxDQUFDO0tBQ3hCO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQXBDRCxnQ0FvQ0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBQaWVjZSwgUGllY2V0eXBlLCBTcXVhcmUsIENvbG9yLCBzcXVhcmVzIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHBpZWNlMnNmZW4sIHZhbGlkU2Zlbiwgc2ZlbjJQaWVjZSB9IGZyb20gXCIuL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9hcmQge1xuICAgIHByaXZhdGUgcGllY2VMaXN0OiBNYXA8U3F1YXJlLCBQaWVjZT47XG4gICAgcHJpdmF0ZSB3aGl0ZUhhbmQ6IE1hcDxQaWVjZXR5cGUsIG51bWJlcj47XG4gICAgcHJpdmF0ZSBibGFja0hhbmQ6IE1hcDxQaWVjZXR5cGUsIG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5waWVjZUxpc3QgPSBuZXcgTWFwPFNxdWFyZSwgUGllY2U+KCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kID0gbmV3IE1hcDxQaWVjZXR5cGUsIG51bWJlcj4oKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuXG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgncGF3bicsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2xhbmNlJywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgna25pZ2h0JywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgnc2lsdmVyJywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgnZ29sZCcsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2Jpc2hvcCcsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ3Jvb2snLCAwKTtcblxuICAgICAgICB0aGlzLndoaXRlSGFuZC5zZXQoJ3Bhd24nLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdsYW5jZScsIDApO1xuICAgICAgICB0aGlzLndoaXRlSGFuZC5zZXQoJ2tuaWdodCcsIDApO1xuICAgICAgICB0aGlzLndoaXRlSGFuZC5zZXQoJ3NpbHZlcicsIDApO1xuICAgICAgICB0aGlzLndoaXRlSGFuZC5zZXQoJ2dvbGQnLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdiaXNob3AnLCAwKTtcbiAgICAgICAgdGhpcy53aGl0ZUhhbmQuc2V0KCdyb29rJywgMCk7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIFNldHMgdGhlIGJvYXJkIHRvIHNmZW4gcG9zaXRpb25cbiAgICAgKiBAcGFyYW0gc2ZlbiAtIHNmZW4gc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHNmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXZhbGlkU2ZlbihzZmVuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzZmVuQXJyID0gc2Zlbi5zcGxpdCgnICcpO1xuICAgICAgICBsZXQgc2ZlbkJvYXJkID0gc2ZlbkFyclswXTtcbiAgICAgICAgbGV0IHNmZW5IYW5kID0gc2ZlbkFyclsyXTtcblxuICAgICAgICBsZXQgcm93cyA9IHNmZW5Cb2FyZC5zcGxpdCgnLycpO1xuICAgICAgICBsZXQgY3VyU3F1YXJlSW5kZXggPSAwO1xuICAgICAgICBsZXQgaXNQcm9tb3RlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgciBvZiByb3dzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjaGFyIG9mIHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIGlzTmFOKE51bWJlcihjaGFyKSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1Byb21vdGUpIHRocm93IG5ldyBFcnJvciAoJ0VSUk9SOiBUd28gXCIrXCIgc2lnbnMgZm91bmQgaW4gYSByb3cgaW4gc2ZlbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9tb3RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHNmZW4yUGllY2UoY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGllY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIHBpZWNlIGZyb20gc2ZlbiBmb3IgY2hhcmFjdGVyOiAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvbW90ZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBpZWNlKHBpZWNlLCBzcXVhcmVzW2N1clNxdWFyZUluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGN1clNxdWFyZUluZGV4Kys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyU3F1YXJlSW5kZXggPSBjdXJTcXVhcmVJbmRleCArIE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNQcm9tb3RlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2ZlbkhhbmQpIHtcbiAgICAgICAgICAgIGxldCBhbXQgPSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhciBvZiBzZmVuSGFuZCkge1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IHNmZW4yUGllY2UoY2hhcik7XG4gICAgICAgICAgICAgICAgaWYgKCAhaXNOYU4oTnVtYmVyKGNoYXIpKSApIHtcbiAgICAgICAgICAgICAgICAgICAgYW10ID0gTnVtYmVyKGNoYXIpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBpZWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VSUk9SOiBDYW5ub3QgZ2V0IHBpZWNlIGZyb20gc2ZlbiBmb3IgY2hhcmFjdGVyICcgKyBjaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkMkhhbmQocGllY2UuY29sb3IsIHBpZWNlLnR5cGUsIGFtdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYW10ID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICAqIEdldHMgdGhlIGJvYXJkJ3MgU0ZFTiBwb3NpdGlvblxuICAgICAqIFRPRE86IEFkZCBoYW5kIHN1YnN0cmluZyBvZiBzZmVuXG4gICAgICovXG4gICAgcHVibGljIGdldFBvc2l0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBzZmVuID0gJyc7XG4gICAgICAgIGxldCBudW1FbXB0eVNwYWNlcyA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgY3VyU3Egb2Ygc3F1YXJlcykge1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5waWVjZUxpc3QuZ2V0KGN1clNxKTtcblxuICAgICAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bUVtcHR5U3BhY2VzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNmZW4gKz0gbnVtRW1wdHlTcGFjZXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2ZlbiArPSBwaWVjZTJzZmVuKHBpZWNlKTtcbiAgICAgICAgICAgICAgICBudW1FbXB0eVNwYWNlcyA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bUVtcHR5U3BhY2VzKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJTcVswXSA9PT0gJzEnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bUVtcHR5U3BhY2VzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNmZW4gKz0gbnVtRW1wdHlTcGFjZXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbnVtRW1wdHlTcGFjZXMgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChjdXJTcSAhPT0gc3F1YXJlc1tzcXVhcmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHNmZW4gKz0gJy8nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZmVuO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUGllY2UoZnJvbVNxOiBTcXVhcmUsIHRvU3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZnJvbVNxID09PSB0b1NxKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5waWVjZUxpc3QuZ2V0KGZyb21TcSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHRvU3EsIHBpZWNlKTtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LmRlbGV0ZShmcm9tU3EpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBpZWNlKHNxOiBTcXVhcmUpOiBQaWVjZXx1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5waWVjZUxpc3QuZ2V0KHNxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIHRoaXMucGllY2VMaXN0LnNldChzcSwgcGllY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSwgbnVtID0gMSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVGcm9tSGFuZChjb2xvciwgcGllY2V0eXBlLCBudW0pKSB7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHt0eXBlOiBwaWVjZXR5cGUsIGNvbG9yOiBjb2xvcn0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQySGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5nZXRIYW5kKGNvbG9yKTtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IGhhbmQ/LmdldChwaWVjZXR5cGUpO1xuICAgICAgICBpZiAoY3VyQW1vdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCArIG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUZyb21IYW5kKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGhhbmQgPSB0aGlzLmdldEhhbmQoY29sb3IpO1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gaGFuZD8uZ2V0KHBpZWNldHlwZSk7XG4gICAgICAgIGlmICghY3VyQW1vdW50IHx8IGN1ckFtb3VudCAtIG51bSA8IDApIHsgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaGFuZD8uc2V0KHBpZWNldHlwZSwgY3VyQW1vdW50IC0gbnVtKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE51bVBpZWNlc0luSGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEhhbmQoY29sb3IpPy5nZXQocGllY2V0eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEhhbmQoY29sb3I6IENvbG9yKTogTWFwPFBpZWNldHlwZSwgbnVtYmVyPiB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ2JsYWNrJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxhY2tIYW5kO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbG9yID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aGl0ZUhhbmQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgc3F1YXJlcywgQXJyb3csIENvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCB7IGlzVmFsaWRTcXVhcmUsIHNmZW4yUGllY2UgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdVSSB7XG4gICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogQ29sb3I7XG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBhcnJvd0NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhcnJvd0N0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgaW1hZ2VNYXA6IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+O1xuICAgIHByaXZhdGUgc3FTaXplOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBib2FyZEJvdW5kczogUmVjdDtcbiAgICBwcml2YXRlIHBsYXllckhhbmRCb3VuZHM6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgb3Bwb25lbnRIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYm9hcmQ6IEJvYXJkLCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBwcml2YXRlIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSAnYmxhY2snO1xuICAgICAgICBpZiAoY29uZmlnLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ3doaXRlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gY29udGFpbmVyLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy53aWR0aC8yICsgMjA7XG4gICAgICAgIGxldCB0bXBDdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wQ3R4KSB7XG4gICAgICAgICAgICB0aGlzLmN0eCA9IHRtcEN0eDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIG9idGFpbiBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFycm93Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICB0aGlzLmFycm93Q2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgIGxldCB0bXBhQ3R4ID0gdGhpcy5hcnJvd0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wYUN0eCkgeyBcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHggPSB0bXBhQ3R4O1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIG9idGFpbiBhcnJvdyBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgaW1hZ2VzXG4gICAgICAgIHRoaXMuaW1hZ2VNYXAgPSBuZXcgTWFwPHN0cmluZywgSFRNTEltYWdlRWxlbWVudD4oKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrcGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgna25pZ2h0JywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2tuaWdodCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytzaWx2ZXInLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdnb2xkJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2Jpc2hvcCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3Jvb2snLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrcm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2tpbmcnLCBuZXcgSW1hZ2UoKSk7XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuaW1hZ2VNYXApIHtcbiAgICAgICAgICAgIHZhbHVlLnNyYyA9ICcuLi9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJztcbiAgICAgICAgICAgIC8vdmFsdWUuc3JjID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nc2oyODUvU2hvR1VJL21hc3Rlci9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJ1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgUmVjdHNcbiAgICAgICAgdGhpcy5ib2FyZEJvdW5kcyA9IHsgeDogdGhpcy5jYW52YXMud2lkdGgvNCwgeTogMTUsIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aC8yLCBoZWlnaHQ6IHRoaXMuY2FudmFzLndpZHRoLzIgfTtcbiAgICAgICAgdGhpcy5zcVNpemUgPSB0aGlzLmJvYXJkQm91bmRzLndpZHRoLzk7XG5cbiAgICAgICAgLy8gSGFuZCBSZWN0c1xuICAgICAgICBsZXQgdG1wSGFuZFJlY3RzID0gdGhpcy5pbml0SGFuZFJlY3RNYXBzKCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZEJvdW5kcyA9IHRtcEhhbmRSZWN0cy5wbGF5ZXI7XG4gICAgICAgIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzID0gdG1wSGFuZFJlY3RzLm9wcG9uZW50O1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0SGFuZFJlY3RNYXBzKCk6IHsgcGxheWVyOiBNYXA8UGllY2V0eXBlLCBSZWN0Piwgb3Bwb25lbnQ6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+IH0ge1xuICAgICAgICBsZXQgcGFkZGluZyA9IHRoaXMuYm9hcmRCb3VuZHMueCArIHRoaXMuYm9hcmRCb3VuZHMud2lkdGg7XG4gICAgICAgIGxldCBzcSA9IHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgcEhhbmRNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgUmVjdD4oKTtcbiAgICAgICAgbGV0IG9IYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncGF3bicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdyb29rJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6c3EqMiwgeTpzcSoyLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnNxKjMsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnNxKjMsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6c3EqMiwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnNxLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpzcSoyLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncm9vaycsIHsgeDpzcSwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHBsYXllcjogcEhhbmRNYXAsIG9wcG9uZW50OiBvSGFuZE1hcCB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQ2FudmFzKCkge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnc2xhdGVncmV5JztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuYXJyb3dDYW52YXMud2lkdGgsIHRoaXMuYXJyb3dDYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0JvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdzaWx2ZXInO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAxO1xuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDw9IDk7IGYrKykge1xuICAgICAgICAgICAgbGV0IGkgPSBmKnRoaXMuc3FTaXplICsgdGhpcy5ib2FyZEJvdW5kcy54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkQm91bmRzLnkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGksIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuYm9hcmRCb3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRCb3VuZHMueTtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5ib2FyZEJvdW5kcy54LCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkQm91bmRzLnggKyB0aGlzLmJvYXJkQm91bmRzLndpZHRoLCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ZpbGVSYW5rTGFiZWxzKCk6IHZvaWQge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICcxNXB4IGFyaWFsJ1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IDggLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggU3RyaW5nLmZyb21DaGFyQ29kZShsYWJlbCsxKzk2KSwgdGhpcy5ib2FyZEJvdW5kcy54ICsgdGhpcy5ib2FyZEJvdW5kcy53aWR0aCArIDMsIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuc3FTaXplLzIrKGkqaW50ZXJ2YWwpICk7XG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJztcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCAoMTAgLSAobGFiZWwrMSkpLnRvU3RyaW5nKCksIHRoaXMuYm9hcmRCb3VuZHMueCArICh0aGlzLnNxU2l6ZS8yKSsoaSppbnRlcnZhbCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdQaWVjZShwaWVjZTogUGllY2UsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZyA9IHBpZWNlLnR5cGU7XG4gICAgICAgIGlmIChwaWVjZS5wcm9tb3RlZCkge1xuICAgICAgICAgICAga2V5ID0gJysnICsga2V5O1xuICAgICAgICB9XG4gICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlQXRTcXVhcmUoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnNxdWFyZTJQb3Moc3EpO1xuICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UocGllY2UsIHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgaWYgKGNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5wbGF5ZXJIYW5kQm91bmRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQoY29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMuaW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQoY29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMuaW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZ2hsaWdodFNxdWFyZShzdHlsZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHNxOiBTcXVhcmUsIGFscGhhPzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlID09PSAnaGlkZGVuJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxKTtcblxuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHN0eWxlO1xuICAgICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBwb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvMjAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocG9zLnggKyA0LCBwb3MueSArIDQsIHRoaXMuc3FTaXplIC0gOCwgdGhpcy5zcVNpemUgLSA4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGUodGhpcy5jdHgsIHN0eWxlLCB0aGlzLmNhbnZhcy53aWR0aC81MDAsIHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuLypcbiAgICAgICAgICAgIGNhc2UgJ2RvdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvOCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3Q2lyY2xlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzdHlsZTogc3RyaW5nLCBsaW5lV2lkdGg6IG51bWJlciwgY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1czogbnVtYmVyKSB7XG4gICAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIDAsIDIqTWF0aC5QSSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3QXJyb3coc3R5bGU6IHN0cmluZywgc2l6ZTogbnVtYmVyLCBmcm9teDogbnVtYmVyLCBmcm9teTogbnVtYmVyLCB0b3g6IG51bWJlciwgdG95OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zYXZlKCk7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodG95IC0gZnJvbXksIHRveCAtIGZyb214KTtcbiAgICAgICAgbGV0IHJhZGl1cyA9IHNpemUqKHRoaXMuYXJyb3dDYW52YXMud2lkdGgvMTUwKTtcbiAgICAgICAgbGV0IHggPSB0b3ggLSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gdG95IC0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IDIqcmFkaXVzLzU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiBcbiAgICAgICAgLy8gRHJhdyBsaW5lXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKGZyb214LCBmcm9teSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuIFxuICAgICAgICAvLyBEcmF3IGFycm93IGhlYWRcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiBcbiAgICAgICAgbGV0IHhjZW50ZXIgPSAodG94ICsgeCkvMjtcbiAgICAgICAgbGV0IHljZW50ZXIgPSAodG95ICsgeSkvMjtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8odG94LCB0b3kpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEcmF3IGFuIGFycm93IHRoYXQgc25hcHMgdG8gYm9hcmQgc3F1YXJlcyBvciBoYW5kIHBpZWNlc1xuICAgICAqIEBwYXJhbSBhcnJvdyBcbiAgICAgKi9cbiAgICBwdWJsaWMgZHJhd1NuYXBBcnJvdyhhcnJvdzogQXJyb3cpIHtcbiAgICAgICAgaWYgKCFhcnJvdy5kZXN0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKGlzVmFsaWRTcXVhcmUoYXJyb3cuc3JjKSkgeyAvLyBCZWdpbm5pbmcgb2YgYXJyb3cgc3RhcnRzIGF0IGEgYm9hcmQgc3F1YXJlXG4gICAgICAgICAgICBsZXQgZnJvbVNxUG9zID0gdGhpcy5zcXVhcmUyUG9zKGFycm93LnNyYyk7XG5cbiAgICAgICAgICAgIGlmIChhcnJvdy5kZXN0ID09PSBhcnJvdy5zcmMpIHsgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKHRoaXMuYXJyb3dDdHgsIGFycm93LnN0eWxlLCBhcnJvdy5zaXplKnRoaXMuY2FudmFzLndpZHRoLzE3NTAsIGZyb21TcVBvcy5jZW50ZXJYLCBmcm9tU3FQb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5kZXN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgYXJyb3cuc2l6ZSwgZnJvbVNxUG9zLmNlbnRlclgsIGZyb21TcVBvcy5jZW50ZXJZLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIEJlZ2lubmluZyBvZiBhcnJvdyBzdGFydHMgYXQgYSBoYW5kIHBpZWNlXG4gICAgICAgICAgICBsZXQgcmVjdDtcbiAgICAgICAgICAgIGxldCBoYW5kUGllY2UgPSBzZmVuMlBpZWNlKGFycm93LnNyYyk7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kUGllY2UpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChoYW5kUGllY2UuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5wbGF5ZXJIYW5kQm91bmRzLmdldChoYW5kUGllY2UudHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kQm91bmRzLmdldChoYW5kUGllY2UudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlY3QpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGxldCB0b1NxUG9zID0gdGhpcy5zcXVhcmUyUG9zKGFycm93LmRlc3QpO1xuXG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgYXJyb3cuc2l6ZSwgcmVjdC54KyhyZWN0LndpZHRoLzIpLCByZWN0LnkrKHJlY3QuaGVpZ2h0LzIpLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93Q2FudmFzKGFscGhhOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuYXJyb3dDYW52YXMsIDAsIDApO1xuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDEuMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ludmVydGVkKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh4ICsgd2lkdGgvMiwgeSArIGhlaWdodC8yKTtcbiAgICAgICAgdGhpcy5jdHgucm90YXRlKE1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoIC0oeCArIHdpZHRoLzIpLCAtKHkgKyBoZWlnaHQvMikgKTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBvczJTcXVhcmUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBTcXVhcmV8dW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbCA9IE1hdGguZmxvb3IoICh4IC0gdGhpcy5ib2FyZEJvdW5kcy54KS90aGlzLnNxU2l6ZSApO1xuICAgICAgICBsZXQgcm93ID0gTWF0aC5mbG9vciggKHkgLSB0aGlzLmJvYXJkQm91bmRzLnkpL3RoaXMuc3FTaXplKTtcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPCAwIHx8IHJvdyA8IDAgfHwgY29sID4gOSAtIDEgfHwgcm93ID4gOSAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNxdWFyZXNbIDkqcm93ICsgY29sIF07XG4gICAgfVxuXG4gICAgcHVibGljIHNxdWFyZTJQb3Moc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgY29sID0gOSAtIHBhcnNlSW50KHNxWzBdKTtcbiAgICAgICAgbGV0IHJvdyA9IHNxLmNoYXJDb2RlQXQoMSkgLSA5NztcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGxldCB4ID0gdGhpcy5ib2FyZEJvdW5kcy54ICsgKGNvbCAqIHRoaXMuc3FTaXplKTtcbiAgICAgICAgbGV0IHkgPSB0aGlzLmJvYXJkQm91bmRzLnkgKyByb3cgKiB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IGNlbnRlclggPSB4ICsgKHRoaXMuc3FTaXplLzIpO1xuICAgICAgICBsZXQgY2VudGVyWSA9IHkgKyAodGhpcy5zcVNpemUvMilcbiAgICAgICAgcmV0dXJuIHsgeCwgeSwgY2VudGVyWCwgY2VudGVyWSB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCb2FyZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNxU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FTaXplO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQbGF5ZXJIYW5kQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJIYW5kQm91bmRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcHBvbmVudEhhbmRCb3VuZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3JpZW50YXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDYW52YXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hvR1VJIH0gZnJvbSBcIi4vc2hvZ3VpXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCBHVUkgZnJvbSBcIi4vZ3VpXCI7XG5pbXBvcnQgeyBDb25maWcsIEFycm93LCBTcXVhcmUsIFBpZWNlLCBDb2xvciwgUGllY2VDb2RlIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGlzUG9zSW5zaWRlUmVjdCwgYXJyb3dzRXF1YWwsIHBpZWNlMnNmZW4gfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBEcmFnZ2luZ1BpZWNlIHtcbiAgICBwaWVjZTogUGllY2UsXG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlclxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBndWk6IEdVSTtcbiAgICBcbiAgICBwcml2YXRlIGN1cnJlbnRBcnJvdzogQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dzOiBBcnJvd1tdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNob2d1aTogU2hvR1VJLCBwcml2YXRlIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmJvYXJkID0gc2hvZ3VpLmdldEJvYXJkKCk7XG4gICAgICAgIHRoaXMuZ3VpID0gc2hvZ3VpLmdldEd1aSgpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gbW91c2VNb3ZlSGFuZGxlcihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVIYW5kbGVyKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VVcChlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApICk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEFjdGl2ZVNxdWFyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU3F1YXJlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXREcmFnZ2luZ1BpZWNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnZ2luZ1BpZWNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50QXJyb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRBcnJvdztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlckFycm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyb3dzO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkQXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIHRoaXMuYXJyb3dzLnB1c2goYXJyb3cpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlQXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgY21wQXJyb3cgb2YgdGhpcy5hcnJvd3MpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3dzRXF1YWwoY21wQXJyb3csIGFycm93KSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFycm93cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uUmlnaHRDbGljayhldmVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyQXJyb3dzKCk7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gY2xpY2tlZFNxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gY2xpY2tlZFNxO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAhPT0gY2xpY2tlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCksIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKG9wcG9uZW50Q29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiB0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gc3FPdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIHNxT3Zlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmICF0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvZ3VpLmRyb3BQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UuY29sb3IsIHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZS50eXBlLCBzcU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnJlbW92ZUFycm93KHRoaXMuY3VycmVudEFycm93KSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cuc2l6ZSArPSAwLjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQXJyb3codGhpcy5jdXJyZW50QXJyb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZ3VpLmdldENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbW91c2VYID0gZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgbGV0IG1vdXNlWSA9IGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgbGV0IGhvdmVyU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcblxuICAgICAgICBpZiAoIHRoaXMuZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlLnggPSBtb3VzZVg7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueSA9IG1vdXNlWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgaWYgKGhvdmVyU3EpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy5kZXN0ID0gaG92ZXJTcTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cuZGVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25SaWdodENsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5ndWkuZ2V0Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgY2xpY2tlZFNxID0gdGhpcy5ndWkucG9zMlNxdWFyZShtb3VzZVgsIG1vdXNlWSk7XG4gICAgICAgIGxldCBhcnJvd1N0eWxlID0gJ2JsdWUnO1xuICAgICAgICBpZiAodGhpcy5jb25maWcuYXJyb3dTdHlsZSkge1xuICAgICAgICAgICAgYXJyb3dTdHlsZSA9IHRoaXMuY29uZmlnLmFycm93U3R5bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmFsdEFycm93U3R5bGUgJiYgZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBhcnJvd1N0eWxlID0gdGhpcy5jb25maWcuYWx0QXJyb3dTdHlsZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25maWcuY3RybEFycm93U3R5bGUgJiYgZXZlbnQuY3RybEtleSkge1xuICAgICAgICAgICAgYXJyb3dTdHlsZSA9IHRoaXMuY29uZmlnLmN0cmxBcnJvd1N0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsaWNrZWRTcSAmJiAhdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6IGFycm93U3R5bGUsIHNpemU6IDMuNSwgc3JjOiBjbGlja2VkU3EsIGRlc3Q6IGNsaWNrZWRTcSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB7IHN0eWxlOiBhcnJvd1N0eWxlLCBzaXplOiAzLjUsIHNyYzogPFBpZWNlQ29kZT5waWVjZTJzZmVuKHt0eXBlOiBrZXksIGNvbG9yOiB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpfSkgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogYXJyb3dTdHlsZSwgc2l6ZTogMy41LCBzcmM6IDxQaWVjZUNvZGU+cGllY2Uyc2Zlbih7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn0pIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgIH1cbn0iLCJpbXBvcnQgR1VJIGZyb20gXCIuL2d1aVwiO1xuaW1wb3J0IEJvYXJkIGZyb20gXCIuL2JvYXJkXCI7XG5pbXBvcnQgeyBDb25maWcsIFBpZWNldHlwZSwgU3F1YXJlLCBzcXVhcmVzLCBDb2xvciwgQXJyb3csIEhpZ2hsaWdodCB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBhcnJvd3NFcXVhbCB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCBJbnB1dCBmcm9tIFwiLi9pbnB1dFwiO1xuXG5leHBvcnQgY2xhc3MgU2hvR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuICAgIHByaXZhdGUgaW5wdXQ6IElucHV0O1xuICAgIHByaXZhdGUgaGlnaGxpZ2h0TGlzdDogSGlnaGxpZ2h0W107XG4gICAgcHJpdmF0ZSBhcnJvd0xpc3Q6IEFycm93W107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHByaXZhdGUgY29uZmlnOiBDb25maWcpIHtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgY29udGFpbmVyLCBjb25maWcpO1xuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KHRoaXMsIGNvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0ID0gW107XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHNmZW46IHN0cmluZykge1xuICAgICAgICB0aGlzLmJvYXJkLnNldFBvc2l0aW9uKHNmZW4pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQuZ2V0UG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCkge1xuICAgICAgICB0aGlzLmd1aS5mbGlwQm9hcmQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzU3F1YXJlSGlnaGxpZ2h0ZWQoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBmb3IgKGxldCB0bXBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIHRtcGhpZ2hsaWdodC5zcSA9PT0gc3EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNTcXVhcmVIaWdobGlnaHRlZChoaWdobGlnaHQuc3EpKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QucHVzaChoaWdobGlnaHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVIaWdobGlnaHQoaGlnaGxpZ2h0OiBIaWdobGlnaHQpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB0bXBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIHRtcGhpZ2hsaWdodC5zcSA9PT0gaGlnaGxpZ2h0LnNxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFySGlnaGxpZ2h0cygpIHtcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEFycm93KGFycm93OiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoYXJyb3cuZGVzdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0LnB1c2goYXJyb3cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlQXJyb3coYXJyb3c6IEFycm93KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgY21wQXJyb3cgb2YgdGhpcy5hcnJvd0xpc3QpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3dzRXF1YWwoY21wQXJyb3csIGFycm93KSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFycm93TGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbGVhckFycm93cygpIHtcbiAgICAgICAgdGhpcy5hcnJvd0xpc3QgPSBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZVBpZWNlKHNyY1NxOiBTcXVhcmUsIGRlc3RTcTogU3F1YXJlKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbk1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkLm1vdmVQaWVjZShzcmNTcSwgZGVzdFNxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSwgbnVtID0gMSkge1xuICAgICAgICBsZXQgc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZy5vbkRyb3BQaWVjZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBzdWNjZXNzID0gdGhpcy5jb25maWcub25Ecm9wUGllY2UoY29sb3IsIHBpZWNldHlwZSwgc3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZHJvcFBpZWNlKGNvbG9yLCBwaWVjZXR5cGUsIHNxLCBudW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlZnJlc2hDYW52YXMoKSB7XG4gICAgICAgIGxldCBhY3RpdmVTcXVhcmUgPSB0aGlzLmlucHV0LmdldEFjdGl2ZVNxdWFyZSgpO1xuICAgICAgICBsZXQgZHJhZ2dpbmdQaWVjZSA9IHRoaXMuaW5wdXQuZ2V0RHJhZ2dpbmdQaWVjZSgpO1xuICAgICAgICBsZXQgY3VycmVudEFycm93ID0gdGhpcy5pbnB1dC5nZXRDdXJyZW50QXJyb3coKTtcbiAgICAgICAgdGhpcy5ndWkuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBmb3IgKGxldCBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoaGlnaGxpZ2h0LnN0eWxlLCBoaWdobGlnaHQudHlwZSwgaGlnaGxpZ2h0LnNxLCBoaWdobGlnaHQuYWxwaGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgdGhpcy5ndWkuaGlnaGxpZ2h0U3F1YXJlKCdtaW50Y3JlYW0nLCAnZmlsbCcsIGFjdGl2ZVNxdWFyZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5ndWkuZHJhd0ZpbGVSYW5rTGFiZWxzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSBvZiBzcXVhcmVzKSB7XG4gICAgICAgICAgICBpZiAoYWN0aXZlU3F1YXJlICYmIGRyYWdnaW5nUGllY2UpIHsgLy8gRG9uJ3QgZHJhdyB0aGUgY3VycmVudGx5IGRyYWdnaW5nIHBpZWNlIG9uIGl0cyBzcXVhcmVcbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlU3F1YXJlID09PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3VpLmRyYXdQaWVjZUF0U3F1YXJlKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0hhbmQoJ2JsYWNrJyk7IFxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnd2hpdGUnKTtcblxuICAgICAgICBpZiAoZHJhZ2dpbmdQaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlKGRyYWdnaW5nUGllY2UucGllY2UsIGRyYWdnaW5nUGllY2UueCAtIHRoaXMuZ3VpLmdldFNxU2l6ZSgpLzIsIGRyYWdnaW5nUGllY2UueSAtIHRoaXMuZ3VpLmdldFNxU2l6ZSgpLzIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggbGV0IGFycm93IG9mIHRoaXMuYXJyb3dMaXN0ICkgeyAvLyBEcmF3IHByb2dyYW1tYXRpY2FsbHktYWRkZWQgYXJyb3dzXG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBsZXQgYXJyb3cgb2YgdGhpcy5pbnB1dC5nZXRVc2VyQXJyb3dzKCkgKSB7IC8vIERyYXcgdXNlciBpbnB1dCBhcnJvd3NcbiAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coYXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN1cnJlbnRBcnJvdykge1xuICAgICAgICAgICAgdGhpcy5kcmF3QXJyb3coY3VycmVudEFycm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdBcnJvd0NhbnZhcygwLjYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd0Fycm93KGFycm93OiBBcnJvdykge1xuICAgICAgICB0aGlzLmd1aS5kcmF3U25hcEFycm93KGFycm93KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Qm9hcmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJvYXJkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRHdWkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2hvR1VJOyIsImV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgICBvcmllbnRhdGlvbj86IENvbG9yLFxuICAgIGFycm93U3R5bGU/OiBzdHJpbmcsXG4gICAgYWx0QXJyb3dTdHlsZT86IHN0cmluZyxcbiAgICBjdHJsQXJyb3dTdHlsZT86IHN0cmluZyxcbiAgICBvbk1vdmVQaWVjZT86ICguLi5hcmdzOiBTcXVhcmVbXSkgPT4gYm9vbGVhbixcbiAgICBvbkRyb3BQaWVjZT86IChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlKSA9PiBib29sZWFuLFxuICAgIG9uU2VsZWN0UGllY2U/OiAocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSA9PiBib29sZWFuLFxuICAgIG9uRGVzZWxlY3RQaWVjZT86ICgpID0+IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgQ29sb3IgPSAnYmxhY2snIHwgJ3doaXRlJztcbmV4cG9ydCB0eXBlIFBpZWNldHlwZSA9ICdraW5nJyB8ICdyb29rJyB8ICdiaXNob3AnIHwgJ2dvbGQnIHwgJ3NpbHZlcicgfCAna25pZ2h0JyB8ICdsYW5jZScgfCAncGF3bic7XG5leHBvcnQgdHlwZSBIaWdobGlnaHRUeXBlID0gJ2ZpbGwnIHwgJ291dGxpbmUnIHwgJ2NpcmNsZScgfCAnaGlkZGVuJ1xuZXhwb3J0IHR5cGUgUGllY2VDb2RlID0gJ0snIHwgJ1InIHwgJ0InIHwgJ0cnIHwgJ1MnIHwgJ04nIHwgJ0wnIHwgJ1AnIHwgLy8gU0ZFTiBQaWVjZWNvZGVzICh3aXRob3V0IHRoZSAnKycpXG4gICAgICAgICAgICAgICAgICAgICAgICAnaycgfCAncicgfCAnYicgfCAnZycgfCAncycgfCAnbicgfCAnbCcgfCAncCc7XG5cbmV4cG9ydCBjb25zdCBzcXVhcmVzID0gWyAnOWEnICwgJzhhJyAsICc3YScgLCAnNmEnICwgJzVhJyAsICc0YScgLCAnM2EnICwgJzJhJyAsICcxYScgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5YicgLCAnOGInICwgJzdiJyAsICc2YicgLCAnNWInICwgJzRiJyAsICczYicgLCAnMmInICwgJzFiJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzljJyAsICc4YycgLCAnN2MnICwgJzZjJyAsICc1YycgLCAnNGMnICwgJzNjJyAsICcyYycgLCAnMWMnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWQnICwgJzhkJyAsICc3ZCcgLCAnNmQnICwgJzVkJyAsICc0ZCcgLCAnM2QnICwgJzJkJyAsICcxZCcgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5ZScgLCAnOGUnICwgJzdlJyAsICc2ZScgLCAnNWUnICwgJzRlJyAsICczZScgLCAnMmUnICwgJzFlJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzlmJyAsICc4ZicgLCAnN2YnICwgJzZmJyAsICc1ZicgLCAnNGYnICwgJzNmJyAsICcyZicgLCAnMWYnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWcnICwgJzhnJyAsICc3ZycgLCAnNmcnICwgJzVnJyAsICc0ZycgLCAnM2cnICwgJzJnJyAsICcxZycgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5aCcgLCAnOGgnICwgJzdoJyAsICc2aCcgLCAnNWgnICwgJzRoJyAsICczaCcgLCAnMmgnICwgJzFoJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzlpJyAsICc4aScgLCAnN2knICwgJzZpJyAsICc1aScgLCAnNGknICwgJzNpJyAsICcyaScgLCAnMWknIF0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFNxdWFyZSA9IHR5cGVvZiBzcXVhcmVzW251bWJlcl07XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICAgIHR5cGU6IFBpZWNldHlwZSxcbiAgICBjb2xvcjogQ29sb3IsXG4gICAgcHJvbW90ZWQ/OiBib29sZWFuXG59XG5leHBvcnQgaW50ZXJmYWNlIFJlY3Qge1xuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXIsXG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBoZWlnaHQ6IG51bWJlclxufVxuZXhwb3J0IGludGVyZmFjZSBBcnJvdyB7XG4gICAgc3R5bGU6IHN0cmluZztcbiAgICBzaXplOiBudW1iZXIsXG4gICAgc3JjOiBTcXVhcmV8UGllY2VDb2RlLFxuICAgIGRlc3Q/OiBTcXVhcmVcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSGlnaGxpZ2h0IHtcbiAgICBzdHlsZTogc3RyaW5nLFxuICAgIHR5cGU6IEhpZ2hsaWdodFR5cGUsXG4gICAgYWxwaGE/OiBudW1iZXIsXG4gICAgc3E6IFNxdWFyZVxufSIsImltcG9ydCB7IFJlY3QsIEFycm93LCBQaWVjZSwgU3F1YXJlLCBzcXVhcmVzLCBDb2xvciwgUGllY2V0eXBlIH0gZnJvbSBcIi4vdHlwZXNcIjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHNvbWV0aGluZyBpcyBpbnNpZGUgdGhlIFJlY3RcbiAqIEBwYXJhbSByZWN0IC0gUmVjdGFuZ2xlIHRvIGNoZWNrIGlmIHBvcyBpcyBpbnNpZGVcbiAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlIG9mIHBvc2l0aW9uXG4gKiBAcGFyYW0geSAtIFkgY29vcmRpYW50ZSBvZiBwb3NpdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQb3NJbnNpZGVSZWN0KHJlY3Q6IFJlY3QsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKHggPCByZWN0LnggfHwgeCA+PSByZWN0LnggKyByZWN0LndpZHRoIHx8XG4gICAgICAgIHkgPCByZWN0LnkgfHwgeSA+PSByZWN0LnkgKyByZWN0LmhlaWdodCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyb3dzRXF1YWwoYXJyb3cxOiBBcnJvdywgYXJyb3cyOiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgIGlmIChhcnJvdzEuc3JjID09PSBhcnJvdzIuc3JjICYmIGFycm93MS5kZXN0ID09PSBhcnJvdzIuZGVzdCkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFNxdWFyZShhcmc6YW55KTogYXJnIGlzIFNxdWFyZSB7XG4gICAgcmV0dXJuIHNxdWFyZXMuaW5jbHVkZXMoYXJnKSAhPT0gZmFsc2U7XG59XG5cbi8vIFRPT0Q6IENoZWNrIGhhbmQgc3Vic3RyaW5nIG9mIHNmZW5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFNmZW4oc2Zlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IHNmZW5BcnIgPSBzZmVuLnNwbGl0KCcgJyk7XG4gICAgbGV0IHNmZW5Cb2FyZCA9IHNmZW5BcnJbMF07XG4gICAgbGV0IHJvd3MgPSBzZmVuQm9hcmQuc3BsaXQoJy8nKTtcblxuICAgIGlmIChyb3dzLmxlbmd0aCAhPT0gOSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHNxQ291bnQgPSAwO1xuICAgIGZvcihsZXQgciBvZiByb3dzKSB7XG4gICAgICAgIGZvcihsZXQgY2hhciBvZiByKSB7XG4gICAgICAgICAgICBpZiAoICFpc05hTihOdW1iZXIoY2hhcikpICl7XG4gICAgICAgICAgICAgICAgc3FDb3VudCArPSBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggY2hhci5zZWFyY2goL1tecGxuc2dicmtQTE5TR0JSS10vKSApIHtcbiAgICAgICAgICAgICAgICAgICAgc3FDb3VudCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNxQ291bnQgIT09IDkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzcUNvdW50ID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlMnNmZW4ocGllY2U6IFBpZWNlKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICAvLyBHZXQgdGhlIHNmZW4gZnJvbSBwaWVjZXR5cGVcbiAgICBpZiAocGllY2UudHlwZSA9PT0gJ2tuaWdodCcpIHtcbiAgICAgICAgcmVzdWx0ICs9ICduJ1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCArPSBwaWVjZS50eXBlWzBdO1xuICAgIH1cblxuICAgIC8vIE1ha2UgaXQgdXBwZXJjYXNlIGlmIGl0J3MgYmxhY2sncyBwaWVjZVxuICAgIGlmIChwaWVjZS5jb2xvciA9PT0gJ2JsYWNrJykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQudG9VcHBlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIHBsdXMgc2lnbiBpZiB0aGUgcGllY2UgaXMgcHJvbW90ZWRcbiAgICBpZiAocGllY2UucHJvbW90ZWQpIHtcbiAgICAgICAgcmVzdWx0ID0gJysnICsgcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZmVuMlBpZWNlKHNmZW46IHN0cmluZyk6IFBpZWNlfHVuZGVmaW5lZCB7XG4gICAgbGV0IHBVcHBlciA9IHNmZW4udG9VcHBlckNhc2UoKTtcbiAgICBsZXQgcmVzdWx0ID0geyB0eXBlOiA8UGllY2V0eXBlPicnLCBjb2xvcjogPENvbG9yPicnfTtcblxuICAgIHJlc3VsdC5jb2xvciA9IHBVcHBlciA9PT0gc2ZlbiA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG4gICAgc3dpdGNoIChwVXBwZXIpIHtcbiAgICAgICAgY2FzZSAnUCc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdwYXduJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdMJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2xhbmNlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdOJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2tuaWdodCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdzaWx2ZXInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0cnOlxuICAgICAgICAgICAgcmVzdWx0LnR5cGUgPSAnZ29sZCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnUic6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdyb29rJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdCJzpcbiAgICAgICAgICAgIHJlc3VsdC50eXBlID0gJ2Jpc2hvcCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnSyc6XG4gICAgICAgICAgICByZXN1bHQudHlwZSA9ICdraW5nJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIl19
