(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ShoGUI = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const util_1 = require("./util");
class Board {
    constructor() {
        this.pieceList = new Map();
        this.blackHand = new Map();
        this.blackHand.set('pawn', 0);
        this.blackHand.set('lance', 0);
        this.blackHand.set('knight', 0);
        this.blackHand.set('silver', 0);
        this.blackHand.set('gold', 0);
        this.blackHand.set('bishop', 0);
        this.blackHand.set('rook', 0);
        this.whiteHand = new Map(this.blackHand);
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
                    let piece = util_1.getPieceObj(char);
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
                let piece = util_1.getPieceObj(char);
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
                sfen += util_1.getPieceCode(piece);
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
            let handPiece = arrow.src;
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
            if (util_1.arrowEndpointsEqual(cmpArrow, arrow)) {
                this.arrows.splice(i, 1);
                return cmpArrow;
            }
            i++;
        }
        return undefined;
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
                let removedArrow = this.removeArrow(this.currentArrow);
                if (!removedArrow || removedArrow.style !== this.currentArrow.style) {
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
            if (util_1.arrowEndpointsEqual(cmpArrow, arrow)) {
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
exports.getPieceObj = exports.getPieceCode = exports.validSfen = exports.isValidSquare = exports.arrowEndpointsEqual = exports.isPosInsideRect = void 0;
const types_1 = require("./types");
function isPosInsideRect(rect, x, y) {
    if (x < rect.x || x >= rect.x + rect.width ||
        y < rect.y || y >= rect.y + rect.height) {
        return false;
    }
    return true;
}
exports.isPosInsideRect = isPosInsideRect;
function arrowEndpointsEqual(arrow1, arrow2) {
    if (arrow1.src === arrow2.src && arrow1.dest === arrow2.dest)
        return true;
    return false;
}
exports.arrowEndpointsEqual = arrowEndpointsEqual;
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
function getPieceCode(piece) {
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
exports.getPieceCode = getPieceCode;
const piecetypeMap = new Map();
piecetypeMap.set('p', 'pawn');
piecetypeMap.set('l', 'lance');
piecetypeMap.set('n', 'knight');
piecetypeMap.set('s', 'silver');
piecetypeMap.set('g', 'gold');
piecetypeMap.set('b', 'bishop');
piecetypeMap.set('r', 'rook');
piecetypeMap.set('k', 'king');
function getPieceObj(sfenPieceCode) {
    let pieceCode = sfenPieceCode.toLowerCase();
    let pColor = pieceCode === sfenPieceCode ? 'white' : 'black';
    let pType = piecetypeMap.get(pieceCode);
    if (!pType)
        return undefined;
    return { type: pType, color: pColor };
}
exports.getPieceObj = getPieceObj;

},{"./types":5}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYm9hcmQudHMiLCJzcmMvZ3VpLnRzIiwic3JjL2lucHV0LnRzIiwic3JjL3Nob2d1aS50cyIsInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxtQ0FBbUU7QUFDbkUsaUNBQThEO0FBRTlELE1BQXFCLEtBQUs7SUFLdEI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFFOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBTU0sV0FBVyxDQUFDLElBQVk7UUFDM0IsSUFBSSxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbEIsT0FB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O1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXZDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLEtBQUssQ0FBQyxHQUFHLEdBQUcsa0JBQWtCLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztTQUVqRDtRQUdELElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFFLENBQUM7UUFDOUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUM7UUFHdkMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDNUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFFaEQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVPLGdCQUFnQjtRQUNwQixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMxRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JCLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1FBQzFDLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1FBQzFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxPQUFPLEdBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUMsT0FBTyxHQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RCxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RCxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFELFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUMsRUFBRSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBRSxD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Q0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7UUFHMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUUxQixJQUFJLE9BQU8sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixLQUFLLElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQyxFQUFFLEdBQUMsQ0FBQyxDQUFDO1FBQ3JCLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDdkMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0IsS0FBSyxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQztRQUNyQixDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQ3ZDLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTNC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UUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sVUFBVSxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQ2xDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFFLENBQUM7UUFDN0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RCxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssT0FBTyxFQUFFO1lBQzlCLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ2QsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7U0FDakI7UUFDRCxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFH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QUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxTQUFTLENBQUM7SUFFakMsT0FBTyxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDO0FBQ3ZDLENBQUM7QUFQRCxrQ0FPQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFBpZWNlLCBQaWVjZXR5cGUsIFNxdWFyZSwgQ29sb3IsIHNxdWFyZXMgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgdmFsaWRTZmVuLCBnZXRQaWVjZUNvZGUsIGdldFBpZWNlT2JqIH0gZnJvbSBcIi4vdXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb2FyZCB7XG4gICAgcHJpdmF0ZSBwaWVjZUxpc3Q6IE1hcDxTcXVhcmUsIFBpZWNlPjtcbiAgICBwcml2YXRlIHdoaXRlSGFuZDogTWFwPFBpZWNldHlwZSwgbnVtYmVyPjtcbiAgICBwcml2YXRlIGJsYWNrSGFuZDogTWFwPFBpZWNldHlwZSwgbnVtYmVyPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnBpZWNlTGlzdCA9IG5ldyBNYXA8U3F1YXJlLCBQaWVjZT4oKTtcbiAgICAgICAgdGhpcy5ibGFja0hhbmQgPSBuZXcgTWFwPFBpZWNldHlwZSwgbnVtYmVyPigpO1xuXG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgncGF3bicsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2xhbmNlJywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgna25pZ2h0JywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgnc2lsdmVyJywgMCk7XG4gICAgICAgIHRoaXMuYmxhY2tIYW5kLnNldCgnZ29sZCcsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ2Jpc2hvcCcsIDApO1xuICAgICAgICB0aGlzLmJsYWNrSGFuZC5zZXQoJ3Jvb2snLCAwKTtcblxuICAgICAgICB0aGlzLndoaXRlSGFuZCA9IG5ldyBNYXA8UGllY2V0eXBlLCBudW1iZXI+KHRoaXMuYmxhY2tIYW5kKTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogU2V0cyB0aGUgYm9hcmQgdG8gc2ZlbiBwb3NpdGlvblxuICAgICAqIEBwYXJhbSBzZmVuIC0gc2ZlbiBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UG9zaXRpb24oc2Zlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdmFsaWRTZmVuKHNmZW4pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNmZW5BcnIgPSBzZmVuLnNwbGl0KCcgJyk7XG4gICAgICAgIGxldCBzZmVuQm9hcmQgPSBzZmVuQXJyWzBdO1xuICAgICAgICBsZXQgc2ZlbkhhbmQgPSBzZmVuQXJyWzJdO1xuXG4gICAgICAgIGxldCByb3dzID0gc2ZlbkJvYXJkLnNwbGl0KCcvJyk7XG4gICAgICAgIGxldCBjdXJTcXVhcmVJbmRleCA9IDA7XG4gICAgICAgIGxldCBpc1Byb21vdGUgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGxldCByIG9mIHJvd3MpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXIgb2Ygcikge1xuICAgICAgICAgICAgICAgIGlmICggaXNOYU4oTnVtYmVyKGNoYXIpKSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXIgPT09ICcrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvbW90ZSkgdGhyb3cgbmV3IEVycm9yICgnRVJST1I6IFR3byBcIitcIiBzaWducyBmb3VuZCBpbiBhIHJvdyBpbiBzZmVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Byb21vdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IHBpZWNlID0gZ2V0UGllY2VPYmooY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGllY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIHBpZWNlIGZyb20gc2ZlbiBmb3IgY2hhcmFjdGVyOiAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJvbW90ZSkgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFBpZWNlKHBpZWNlLCBzcXVhcmVzW2N1clNxdWFyZUluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGN1clNxdWFyZUluZGV4Kys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VyU3F1YXJlSW5kZXggPSBjdXJTcXVhcmVJbmRleCArIE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNQcm9tb3RlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2ZlbkhhbmQpIHtcbiAgICAgICAgICAgIGxldCBhbXQgPSAxO1xuICAgICAgICAgICAgZm9yIChsZXQgY2hhciBvZiBzZmVuSGFuZCkge1xuICAgICAgICAgICAgICAgIGxldCBwaWVjZSA9IGdldFBpZWNlT2JqKGNoYXIpO1xuICAgICAgICAgICAgICAgIGlmICggIWlzTmFOKE51bWJlcihjaGFyKSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFtdCA9IE51bWJlcihjaGFyKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaWVjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFUlJPUjogQ2Fubm90IGdldCBwaWVjZSBmcm9tIHNmZW4gZm9yIGNoYXJhY3RlciAnICsgY2hhcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZDJIYW5kKHBpZWNlLmNvbG9yLCBwaWVjZS50eXBlLCBhbXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFtdCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBHZXRzIHRoZSBib2FyZCdzIFNGRU4gcG9zaXRpb25cbiAgICAgKiBUT0RPOiBBZGQgaGFuZCBzdWJzdHJpbmcgb2Ygc2ZlblxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQb3NpdGlvbigpOiBzdHJpbmcge1xuICAgICAgICBsZXQgc2ZlbiA9ICcnO1xuICAgICAgICBsZXQgbnVtRW1wdHlTcGFjZXMgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGN1clNxIG9mIHNxdWFyZXMpIHtcbiAgICAgICAgICAgIGxldCBwaWVjZSA9IHRoaXMucGllY2VMaXN0LmdldChjdXJTcSk7XG5cbiAgICAgICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgICAgIGlmIChudW1FbXB0eVNwYWNlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzZmVuICs9IG51bUVtcHR5U3BhY2VzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNmZW4gKz0gZ2V0UGllY2VDb2RlKHBpZWNlKTtcbiAgICAgICAgICAgICAgICBudW1FbXB0eVNwYWNlcyA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bUVtcHR5U3BhY2VzKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJTcVswXSA9PT0gJzEnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG51bUVtcHR5U3BhY2VzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNmZW4gKz0gbnVtRW1wdHlTcGFjZXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbnVtRW1wdHlTcGFjZXMgPSAwO1xuICAgICAgICAgICAgICAgIGlmIChjdXJTcSAhPT0gc3F1YXJlc1tzcXVhcmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHNmZW4gKz0gJy8nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZmVuO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUGllY2UoZnJvbVNxOiBTcXVhcmUsIHRvU3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZnJvbVNxID09PSB0b1NxKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5waWVjZUxpc3QuZ2V0KGZyb21TcSk7XG4gICAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICAgICAgdGhpcy5waWVjZUxpc3Quc2V0KHRvU3EsIHBpZWNlKTtcbiAgICAgICAgICAgIHRoaXMucGllY2VMaXN0LmRlbGV0ZShmcm9tU3EpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBpZWNlKHNxOiBTcXVhcmUpOiBQaWVjZXx1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5waWVjZUxpc3QuZ2V0KHNxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUGllY2UocGllY2U6IFBpZWNlLCBzcTogU3F1YXJlKSB7XG4gICAgICAgIHRoaXMucGllY2VMaXN0LnNldChzcSwgcGllY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcm9wUGllY2UoY29sb3I6IENvbG9yLCBwaWVjZXR5cGU6IFBpZWNldHlwZSwgc3E6IFNxdWFyZSwgbnVtID0gMSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVGcm9tSGFuZChjb2xvciwgcGllY2V0eXBlLCBudW0pKSB7XG4gICAgICAgICAgICB0aGlzLnBpZWNlTGlzdC5zZXQoc3EsIHt0eXBlOiBwaWVjZXR5cGUsIGNvbG9yOiBjb2xvcn0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQySGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBoYW5kID0gdGhpcy5nZXRIYW5kKGNvbG9yKTtcbiAgICAgICAgbGV0IGN1ckFtb3VudCA9IGhhbmQ/LmdldChwaWVjZXR5cGUpO1xuICAgICAgICBpZiAoY3VyQW1vdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGhhbmQ/LnNldChwaWVjZXR5cGUsIGN1ckFtb3VudCArIG51bSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUZyb21IYW5kKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIG51bSA9IDEpIHtcbiAgICAgICAgbGV0IGhhbmQgPSB0aGlzLmdldEhhbmQoY29sb3IpO1xuICAgICAgICBsZXQgY3VyQW1vdW50ID0gaGFuZD8uZ2V0KHBpZWNldHlwZSk7XG4gICAgICAgIGlmICghY3VyQW1vdW50IHx8IGN1ckFtb3VudCAtIG51bSA8IDApIHsgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaGFuZD8uc2V0KHBpZWNldHlwZSwgY3VyQW1vdW50IC0gbnVtKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE51bVBpZWNlc0luSGFuZChjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEhhbmQoY29sb3IpPy5nZXQocGllY2V0eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEhhbmQoY29sb3I6IENvbG9yKTogTWFwPFBpZWNldHlwZSwgbnVtYmVyPiB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGlmIChjb2xvciA9PT0gJ2JsYWNrJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxhY2tIYW5kO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbG9yID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aGl0ZUhhbmQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59IiwiaW1wb3J0IHsgQ29sb3IsIFBpZWNlLCBQaWVjZXR5cGUsIFJlY3QsIFNxdWFyZSwgc3F1YXJlcywgQXJyb3csIENvbmZpZyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCB7IGlzVmFsaWRTcXVhcmUgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdVSSB7XG4gICAgcHJpdmF0ZSBvcmllbnRhdGlvbjogQ29sb3I7XG4gICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICAgIHByaXZhdGUgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHJpdmF0ZSBhcnJvd0NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBhcnJvd0N0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHByaXZhdGUgaW1hZ2VNYXA6IE1hcDxzdHJpbmcsIEhUTUxJbWFnZUVsZW1lbnQ+O1xuICAgIHByaXZhdGUgc3FTaXplOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBib2FyZEJvdW5kczogUmVjdDtcbiAgICBwcml2YXRlIHBsYXllckhhbmRCb3VuZHM6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+O1xuICAgIHByaXZhdGUgb3Bwb25lbnRIYW5kQm91bmRzOiBNYXA8UGllY2V0eXBlLCBSZWN0PjtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYm9hcmQ6IEJvYXJkLCBjb250YWluZXI6IEhUTUxFbGVtZW50LCBwcml2YXRlIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSAnYmxhY2snO1xuICAgICAgICBpZiAoY29uZmlnLm9yaWVudGF0aW9uID09PSAnd2hpdGUnKSB7XG4gICAgICAgICAgICB0aGlzLm9yaWVudGF0aW9uID0gJ3doaXRlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gY29udGFpbmVyLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy53aWR0aC8yICsgMjA7XG4gICAgICAgIGxldCB0bXBDdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wQ3R4KSB7XG4gICAgICAgICAgICB0aGlzLmN0eCA9IHRtcEN0eDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIG9idGFpbiBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFycm93Q2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuYXJyb3dDYW52YXMuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICB0aGlzLmFycm93Q2FudmFzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgIGxldCB0bXBhQ3R4ID0gdGhpcy5hcnJvd0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAodG1wYUN0eCkgeyBcbiAgICAgICAgICAgIHRoaXMuYXJyb3dDdHggPSB0bXBhQ3R4O1xuICAgICAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIG9idGFpbiBhcnJvdyBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgaW1hZ2VzXG4gICAgICAgIHRoaXMuaW1hZ2VNYXAgPSBuZXcgTWFwPHN0cmluZywgSFRNTEltYWdlRWxlbWVudD4oKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3Bhd24nLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrcGF3bicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2xhbmNlJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgna25pZ2h0JywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2tuaWdodCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3NpbHZlcicsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJytzaWx2ZXInLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCdnb2xkJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnYmlzaG9wJywgbmV3IEltYWdlKCkpO1xuICAgICAgICB0aGlzLmltYWdlTWFwLnNldCgnK2Jpc2hvcCcsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ3Jvb2snLCBuZXcgSW1hZ2UoKSk7XG4gICAgICAgIHRoaXMuaW1hZ2VNYXAuc2V0KCcrcm9vaycsIG5ldyBJbWFnZSgpKTtcbiAgICAgICAgdGhpcy5pbWFnZU1hcC5zZXQoJ2tpbmcnLCBuZXcgSW1hZ2UoKSk7XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuaW1hZ2VNYXApIHtcbiAgICAgICAgICAgIHZhbHVlLnNyYyA9ICcuLi9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJztcbiAgICAgICAgICAgIC8vdmFsdWUuc3JjID0gJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nc2oyODUvU2hvR1VJL21hc3Rlci9tZWRpYS9waWVjZXMvJyArIGtleSArICcucG5nJ1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgUmVjdHNcbiAgICAgICAgdGhpcy5ib2FyZEJvdW5kcyA9IHsgeDogdGhpcy5jYW52YXMud2lkdGgvNCwgeTogMTUsIHdpZHRoOiB0aGlzLmNhbnZhcy53aWR0aC8yLCBoZWlnaHQ6IHRoaXMuY2FudmFzLndpZHRoLzIgfTtcbiAgICAgICAgdGhpcy5zcVNpemUgPSB0aGlzLmJvYXJkQm91bmRzLndpZHRoLzk7XG5cbiAgICAgICAgLy8gSGFuZCBSZWN0c1xuICAgICAgICBsZXQgdG1wSGFuZFJlY3RzID0gdGhpcy5pbml0SGFuZFJlY3RNYXBzKCk7XG4gICAgICAgIHRoaXMucGxheWVySGFuZEJvdW5kcyA9IHRtcEhhbmRSZWN0cy5wbGF5ZXI7XG4gICAgICAgIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzID0gdG1wSGFuZFJlY3RzLm9wcG9uZW50O1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0SGFuZFJlY3RNYXBzKCk6IHsgcGxheWVyOiBNYXA8UGllY2V0eXBlLCBSZWN0Piwgb3Bwb25lbnQ6IE1hcDxQaWVjZXR5cGUsIFJlY3Q+IH0ge1xuICAgICAgICBsZXQgcGFkZGluZyA9IHRoaXMuYm9hcmRCb3VuZHMueCArIHRoaXMuYm9hcmRCb3VuZHMud2lkdGg7XG4gICAgICAgIGxldCBzcSA9IHRoaXMuc3FTaXplO1xuICAgICAgICBsZXQgcEhhbmRNYXAgPSBuZXcgTWFwPFBpZWNldHlwZSwgUmVjdD4oKTtcbiAgICAgICAgbGV0IG9IYW5kTWFwID0gbmV3IE1hcDxQaWVjZXR5cGUsIFJlY3Q+KCk7XG4gICAgICAgIHBIYW5kTWFwLnNldCgncGF3bicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNiwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdsYW5jZScsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2tuaWdodCcsIHsgeDpwYWRkaW5nICsgc3EvMiwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ3NpbHZlcicsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqNywgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo3LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBwSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpwYWRkaW5nICsgc3EqKDMvMiksIHk6c3EqOCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgcEhhbmRNYXAuc2V0KCdyb29rJywgeyB4OnBhZGRpbmcgKyBzcSooNS8yKSwgeTpzcSo4LCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ3Bhd24nLCB7IHg6c3EqMiwgeTpzcSoyLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2xhbmNlJywgeyB4OnNxKjMsIHk6c3EsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgna25pZ2h0JywgeyB4OnNxKjMsIHk6MCwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdzaWx2ZXInLCB7IHg6c3EqMiwgeTpzcSwgd2lkdGg6c3EsIGhlaWdodDpzcSB9KTtcbiAgICAgICAgb0hhbmRNYXAuc2V0KCdnb2xkJywgeyB4OnNxLCB5OnNxLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuICAgICAgICBvSGFuZE1hcC5zZXQoJ2Jpc2hvcCcsIHsgeDpzcSoyLCB5OjAsIHdpZHRoOnNxLCBoZWlnaHQ6c3EgfSk7XG4gICAgICAgIG9IYW5kTWFwLnNldCgncm9vaycsIHsgeDpzcSwgeTowLCB3aWR0aDpzcSwgaGVpZ2h0OnNxIH0pO1xuXG4gICAgICAgIHJldHVybiB7IHBsYXllcjogcEhhbmRNYXAsIG9wcG9uZW50OiBvSGFuZE1hcCB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMub3JpZW50YXRpb24gPSB0aGlzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQ2FudmFzKCkge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnc2xhdGVncmV5JztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuYXJyb3dDYW52YXMud2lkdGgsIHRoaXMuYXJyb3dDYW52YXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0JvYXJkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9ICdzaWx2ZXInO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAxO1xuXG4gICAgICAgIGZvciAobGV0IGYgPSAwOyBmIDw9IDk7IGYrKykge1xuICAgICAgICAgICAgbGV0IGkgPSBmKnRoaXMuc3FTaXplICsgdGhpcy5ib2FyZEJvdW5kcy54O1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhpLCB0aGlzLmJvYXJkQm91bmRzLnkpO1xuICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKGksIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuYm9hcmRCb3VuZHMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8PSA5OyByKyspIHtcbiAgICAgICAgICAgIGxldCBpID0gcip0aGlzLnNxU2l6ZSArIHRoaXMuYm9hcmRCb3VuZHMueTtcblxuICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8odGhpcy5ib2FyZEJvdW5kcy54LCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyh0aGlzLmJvYXJkQm91bmRzLnggKyB0aGlzLmJvYXJkQm91bmRzLndpZHRoLCBpKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ZpbGVSYW5rTGFiZWxzKCk6IHZvaWQge1xuICAgICAgICBsZXQgaW50ZXJ2YWwgPSB0aGlzLnNxU2l6ZTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9ICcxNXB4IGFyaWFsJ1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgbGFiZWwgPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IDggLSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCggU3RyaW5nLmZyb21DaGFyQ29kZShsYWJlbCsxKzk2KSwgdGhpcy5ib2FyZEJvdW5kcy54ICsgdGhpcy5ib2FyZEJvdW5kcy53aWR0aCArIDMsIHRoaXMuYm9hcmRCb3VuZHMueSArIHRoaXMuc3FTaXplLzIrKGkqaW50ZXJ2YWwpICk7XG4gICAgICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJztcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KCAoMTAgLSAobGFiZWwrMSkpLnRvU3RyaW5nKCksIHRoaXMuYm9hcmRCb3VuZHMueCArICh0aGlzLnNxU2l6ZS8yKSsoaSppbnRlcnZhbCksIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdQaWVjZShwaWVjZTogUGllY2UsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGxldCBrZXk6IHN0cmluZyA9IHBpZWNlLnR5cGU7XG4gICAgICAgIGlmIChwaWVjZS5wcm9tb3RlZCkge1xuICAgICAgICAgICAga2V5ID0gJysnICsga2V5O1xuICAgICAgICB9XG4gICAgICAgIGxldCBwaWVjZUltZzogSFRNTEltYWdlRWxlbWVudHx1bmRlZmluZWQgPSB0aGlzLmltYWdlTWFwLmdldChrZXkpO1xuICAgICAgICBpZiAoIXBpZWNlSW1nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gdGhpcy5vcmllbnRhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHBpZWNlSW1nLCB4LCB5LCB0aGlzLnNxU2l6ZSwgdGhpcy5zcVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kcmF3SW52ZXJ0ZWQocGllY2VJbWcsIHgsIHksIHRoaXMuc3FTaXplLCB0aGlzLnNxU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd1BpZWNlQXRTcXVhcmUoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcGllY2U6IFBpZWNlfHVuZGVmaW5lZCA9IHRoaXMuYm9hcmQuZ2V0UGllY2Uoc3EpO1xuICAgICAgICBpZiAocGllY2UpIHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnNxdWFyZTJQb3Moc3EpO1xuICAgICAgICAgICAgdGhpcy5kcmF3UGllY2UocGllY2UsIHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGRyYXdIYW5kKGNvbG9yOiBDb2xvcikge1xuICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnYm90dG9tJztcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgaWYgKGNvbG9yID09PSB0aGlzLm9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5wbGF5ZXJIYW5kQm91bmRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQoY29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMuaW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocGllY2VJbWcsIHZhbHVlLngsIHZhbHVlLnksIHZhbHVlLndpZHRoLCB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KG51bU9mUGllY2VzLnRvU3RyaW5nKCksIHZhbHVlLngsIHZhbHVlLnkgKyB2YWx1ZS5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMub3Bwb25lbnRIYW5kQm91bmRzKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bU9mUGllY2VzID0gdGhpcy5ib2FyZC5nZXROdW1QaWVjZXNJbkhhbmQoY29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW1PZlBpZWNlcyA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBudW1PZlBpZWNlcyA9PT0gMCA/IDAuMiA6IDE7XG4gICAgICAgICAgICAgICAgbGV0IHBpZWNlSW1nOiBIVE1MSW1hZ2VFbGVtZW50fHVuZGVmaW5lZCA9IHRoaXMuaW1hZ2VNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwaWVjZUltZykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBwaWVjZSBpbWFnZTogXCIgKyBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdJbnZlcnRlZChwaWVjZUltZywgdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFRleHQobnVtT2ZQaWVjZXMudG9TdHJpbmcoKSwgdmFsdWUueCwgdmFsdWUueSArIHZhbHVlLmhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgfVxuXG4gICAgcHVibGljIGhpZ2hsaWdodFNxdWFyZShzdHlsZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHNxOiBTcXVhcmUsIGFscGhhPzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlID09PSAnaGlkZGVuJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBsZXQgcG9zID0gdGhpcy5zcXVhcmUyUG9zKHNxKTtcblxuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0eWxlO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHN0eWxlO1xuICAgICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4Lmdsb2JhbEFscGhhID0gYWxwaGE7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHBvcy54LCBwb3MueSwgdGhpcy5zcVNpemUsIHRoaXMuc3FTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnb3V0bGluZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gdGhpcy5jYW52YXMud2lkdGgvMjAwO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocG9zLnggKyA0LCBwb3MueSArIDQsIHRoaXMuc3FTaXplIC0gOCwgdGhpcy5zcVNpemUgLSA4KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdDaXJjbGUodGhpcy5jdHgsIHN0eWxlLCB0aGlzLmNhbnZhcy53aWR0aC81MDAsIHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuLypcbiAgICAgICAgICAgIGNhc2UgJ2RvdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguYXJjKHBvcy5jZW50ZXJYLCBwb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvOCwgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3Q2lyY2xlKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBzdHlsZTogc3RyaW5nLCBsaW5lV2lkdGg6IG51bWJlciwgY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1czogbnVtYmVyKSB7XG4gICAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gc3R5bGU7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIDAsIDIqTWF0aC5QSSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcblxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkcmF3QXJyb3coc3R5bGU6IHN0cmluZywgc2l6ZTogbnVtYmVyLCBmcm9teDogbnVtYmVyLCBmcm9teTogbnVtYmVyLCB0b3g6IG51bWJlciwgdG95OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5zYXZlKCk7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodG95IC0gZnJvbXksIHRveCAtIGZyb214KTtcbiAgICAgICAgbGV0IHJhZGl1cyA9IHNpemUqKHRoaXMuYXJyb3dDYW52YXMud2lkdGgvMTUwKTtcbiAgICAgICAgbGV0IHggPSB0b3ggLSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGxldCB5ID0gdG95IC0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuIFxuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVXaWR0aCA9IDIqcmFkaXVzLzU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbFN0eWxlID0gc3R5bGU7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguc3Ryb2tlU3R5bGUgPSBzdHlsZTtcbiBcbiAgICAgICAgLy8gRHJhdyBsaW5lXG4gICAgICAgIHRoaXMuYXJyb3dDdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubW92ZVRvKGZyb214LCBmcm9teSk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmNsb3NlUGF0aCgpO1xuIFxuICAgICAgICAvLyBEcmF3IGFycm93IGhlYWRcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5iZWdpblBhdGgoKTtcbiBcbiAgICAgICAgbGV0IHhjZW50ZXIgPSAodG94ICsgeCkvMjtcbiAgICAgICAgbGV0IHljZW50ZXIgPSAodG95ICsgeSkvMjtcbiBcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5tb3ZlVG8odG94LCB0b3kpO1xuICAgICAgICBhbmdsZSArPSAyKk1hdGguUEkvMztcbiAgICAgICAgeCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSArIHhjZW50ZXI7XG4gICAgICAgIHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKyB5Y2VudGVyO1xuICAgICAgICB0aGlzLmFycm93Q3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgYW5nbGUgKz0gMipNYXRoLlBJLzM7XG4gICAgICAgIHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKyB4Y2VudGVyO1xuICAgICAgICB5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpICsgeWNlbnRlcjtcbiAgICAgICAgdGhpcy5hcnJvd0N0eC5saW5lVG8oeCwgeSk7XG4gXG4gICAgICAgIHRoaXMuYXJyb3dDdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuYXJyb3dDdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmFycm93Q3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEcmF3IGFuIGFycm93IHRoYXQgc25hcHMgdG8gYm9hcmQgc3F1YXJlcyBvciBoYW5kIHBpZWNlc1xuICAgICAqIEBwYXJhbSBhcnJvdyBcbiAgICAgKi9cbiAgICBwdWJsaWMgZHJhd1NuYXBBcnJvdyhhcnJvdzogQXJyb3cpIHtcbiAgICAgICAgaWYgKCFhcnJvdy5kZXN0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKGlzVmFsaWRTcXVhcmUoYXJyb3cuc3JjKSkgeyAvLyBCZWdpbm5pbmcgb2YgYXJyb3cgc3RhcnRzIGF0IGEgYm9hcmQgc3F1YXJlXG4gICAgICAgICAgICBsZXQgZnJvbVNxUG9zID0gdGhpcy5zcXVhcmUyUG9zKGFycm93LnNyYyk7XG5cbiAgICAgICAgICAgIGlmIChhcnJvdy5kZXN0ID09PSBhcnJvdy5zcmMpIHsgXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3Q2lyY2xlKHRoaXMuYXJyb3dDdHgsIGFycm93LnN0eWxlLCBhcnJvdy5zaXplKnRoaXMuY2FudmFzLndpZHRoLzE3NTAsIGZyb21TcVBvcy5jZW50ZXJYLCBmcm9tU3FQb3MuY2VudGVyWSwgdGhpcy5zcVNpemUvMiAtIDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgdG9TcVBvcyA9IHRoaXMuc3F1YXJlMlBvcyhhcnJvdy5kZXN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgYXJyb3cuc2l6ZSwgZnJvbVNxUG9zLmNlbnRlclgsIGZyb21TcVBvcy5jZW50ZXJZLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIEJlZ2lubmluZyBvZiBhcnJvdyBzdGFydHMgYXQgYSBoYW5kIHBpZWNlXG4gICAgICAgICAgICBsZXQgcmVjdDtcbiAgICAgICAgICAgIGxldCBoYW5kUGllY2UgPSBhcnJvdy5zcmM7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kUGllY2UpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChoYW5kUGllY2UuY29sb3IgPT09IHRoaXMub3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5wbGF5ZXJIYW5kQm91bmRzLmdldChoYW5kUGllY2UudHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMub3Bwb25lbnRIYW5kQm91bmRzLmdldChoYW5kUGllY2UudHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlY3QpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGxldCB0b1NxUG9zID0gdGhpcy5zcXVhcmUyUG9zKGFycm93LmRlc3QpO1xuXG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdy5zdHlsZSwgYXJyb3cuc2l6ZSwgcmVjdC54KyhyZWN0LndpZHRoLzIpLCByZWN0LnkrKHJlY3QuaGVpZ2h0LzIpLCB0b1NxUG9zLmNlbnRlclgsIHRvU3FQb3MuY2VudGVyWSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0Fycm93Q2FudmFzKGFscGhhOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSBhbHBoYTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuYXJyb3dDYW52YXMsIDAsIDApO1xuICAgICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDEuMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZHJhd0ludmVydGVkKGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAgIHRoaXMuY3R4LnRyYW5zbGF0ZSh4ICsgd2lkdGgvMiwgeSArIGhlaWdodC8yKTtcbiAgICAgICAgdGhpcy5jdHgucm90YXRlKE1hdGguUEkpO1xuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUoIC0oeCArIHdpZHRoLzIpLCAtKHkgKyBoZWlnaHQvMikgKTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltYWdlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHBvczJTcXVhcmUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBTcXVhcmV8dW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGNvbCA9IE1hdGguZmxvb3IoICh4IC0gdGhpcy5ib2FyZEJvdW5kcy54KS90aGlzLnNxU2l6ZSApO1xuICAgICAgICBsZXQgcm93ID0gTWF0aC5mbG9vciggKHkgLSB0aGlzLmJvYXJkQm91bmRzLnkpL3RoaXMuc3FTaXplKTtcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2wgPCAwIHx8IHJvdyA8IDAgfHwgY29sID4gOSAtIDEgfHwgcm93ID4gOSAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNxdWFyZXNbIDkqcm93ICsgY29sIF07XG4gICAgfVxuXG4gICAgcHVibGljIHNxdWFyZTJQb3Moc3E6IFNxdWFyZSkge1xuICAgICAgICBsZXQgY29sID0gOSAtIHBhcnNlSW50KHNxWzBdKTtcbiAgICAgICAgbGV0IHJvdyA9IHNxLmNoYXJDb2RlQXQoMSkgLSA5NztcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICd3aGl0ZScpIHtcbiAgICAgICAgICAgIGNvbCA9IDggLSBjb2w7XG4gICAgICAgICAgICByb3cgPSA4IC0gcm93O1xuICAgICAgICB9XG4gICAgICAgIGxldCB4ID0gdGhpcy5ib2FyZEJvdW5kcy54ICsgKGNvbCAqIHRoaXMuc3FTaXplKTtcbiAgICAgICAgbGV0IHkgPSB0aGlzLmJvYXJkQm91bmRzLnkgKyByb3cgKiB0aGlzLnNxU2l6ZTtcbiAgICAgICAgbGV0IGNlbnRlclggPSB4ICsgKHRoaXMuc3FTaXplLzIpO1xuICAgICAgICBsZXQgY2VudGVyWSA9IHkgKyAodGhpcy5zcVNpemUvMilcbiAgICAgICAgcmV0dXJuIHsgeCwgeSwgY2VudGVyWCwgY2VudGVyWSB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCb2FyZEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmRCb3VuZHM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNxU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FTaXplO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQbGF5ZXJIYW5kQm91bmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJIYW5kQm91bmRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcHBvbmVudEhhbmRCb3VuZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wcG9uZW50SGFuZEJvdW5kcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0T3JpZW50YXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDYW52YXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hvR1VJIH0gZnJvbSBcIi4vc2hvZ3VpXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4vYm9hcmRcIjtcbmltcG9ydCBHVUkgZnJvbSBcIi4vZ3VpXCI7XG5pbXBvcnQgeyBDb25maWcsIEFycm93LCBTcXVhcmUsIFBpZWNlLCBDb2xvciB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBpc1Bvc0luc2lkZVJlY3QsIGFycm93RW5kcG9pbnRzRXF1YWwgfSBmcm9tIFwiLi91dGlsXCI7XG5cbmludGVyZmFjZSBEcmFnZ2luZ1BpZWNlIHtcbiAgICBwaWVjZTogUGllY2UsXG4gICAgeDogbnVtYmVyLFxuICAgIHk6IG51bWJlclxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dCB7XG4gICAgcHJpdmF0ZSBib2FyZDogQm9hcmQ7XG4gICAgcHJpdmF0ZSBndWk6IEdVSTtcbiAgICBcbiAgICBwcml2YXRlIGN1cnJlbnRBcnJvdzogQXJyb3d8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgYXJyb3dzOiBBcnJvd1tdO1xuICAgIHByaXZhdGUgYWN0aXZlU3F1YXJlOiBTcXVhcmV8dW5kZWZpbmVkO1xuICAgIHByaXZhdGUgZHJhZ2dpbmdQaWVjZTogRHJhZ2dpbmdQaWVjZXx1bmRlZmluZWQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNob2d1aTogU2hvR1VJLCBwcml2YXRlIGNvbmZpZzogQ29uZmlnKSB7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICB0aGlzLmJvYXJkID0gc2hvZ3VpLmdldEJvYXJkKCk7XG4gICAgICAgIHRoaXMuZ3VpID0gc2hvZ3VpLmdldEd1aSgpO1xuXG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG5cbiAgICAgICAgZnVuY3Rpb24gbW91c2VNb3ZlSGFuZGxlcihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VNb3ZlKGUpO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRG93bihlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVIYW5kbGVyKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICBzZWxmLm9uTW91c2VVcChlKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHNob2d1aS5yZWZyZXNoQ2FudmFzKCkgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ndWkuZ2V0Q2FudmFzKCkuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gc2hvZ3VpLnJlZnJlc2hDYW52YXMoKSApICk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEFjdGl2ZVNxdWFyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU3F1YXJlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXREcmFnZ2luZ1BpZWNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnZ2luZ1BpZWNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50QXJyb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRBcnJvdztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VXNlckFycm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyb3dzO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkQXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIHRoaXMuYXJyb3dzLnB1c2goYXJyb3cpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlQXJyb3coYXJyb3c6IEFycm93KTogQXJyb3d8dW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCBjbXBBcnJvdyBvZiB0aGlzLmFycm93cykge1xuICAgICAgICAgICAgaWYgKCBhcnJvd0VuZHBvaW50c0VxdWFsKGNtcEFycm93LCBhcnJvdykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcnJvd3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjbXBBcnJvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJBcnJvd3MoKSB7XG4gICAgICAgIHRoaXMuYXJyb3dzID0gW107XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLm9uUmlnaHRDbGljayhldmVudCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyQXJyb3dzKCk7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBjbGlja2VkU3E6IFNxdWFyZXx1bmRlZmluZWQgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsaWNrZWRTcSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IHBpZWNlID0gdGhpcy5ib2FyZC5nZXRQaWVjZShjbGlja2VkU3EpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAocGllY2UgJiYgKCF0aGlzLmFjdGl2ZVNxdWFyZSB8fCB0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gY2xpY2tlZFNxKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gY2xpY2tlZFNxO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHtwaWVjZTogcGllY2UsIHg6IG1vdXNlWCwgeTogbW91c2VZfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSAhPT0gY2xpY2tlZFNxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIGNsaWNrZWRTcSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldFBsYXllckhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKHRoaXMuZ3VpLmdldE9yaWVudGF0aW9uKCksIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHRoaXMuZ3VpLmdldE9wcG9uZW50SGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3Bwb25lbnRDb2xvcjogQ29sb3IgPSB0aGlzLmd1aS5nZXRPcmllbnRhdGlvbigpID09PSAnYmxhY2snID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgICAgICAgICAgICAgbGV0IG51bVBpZWNlcyA9IHRoaXMuYm9hcmQuZ2V0TnVtUGllY2VzSW5IYW5kKG9wcG9uZW50Q29sb3IsIGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKCFudW1QaWVjZXMgfHwgbnVtUGllY2VzIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgcGllY2UgPSB7dHlwZToga2V5LCBjb2xvcjogb3Bwb25lbnRDb2xvcn07XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0ge3BpZWNlOiBwaWVjZSwgeDogbW91c2VYLCB5OiBtb3VzZVl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh0aGlzLmd1aS5nZXRCb2FyZEJvdW5kcygpLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgIGxldCBzcU92ZXIgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgICAgICAgICBpZiAoIXNxT3ZlcikgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdQaWVjZSAmJiB0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNxdWFyZSA9PT0gc3FPdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob2d1aS5tb3ZlUGllY2UodGhpcy5hY3RpdmVTcXVhcmUsIHNxT3Zlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU3F1YXJlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kcmFnZ2luZ1BpZWNlICYmICF0aGlzLmFjdGl2ZVNxdWFyZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvZ3VpLmRyb3BQaWVjZSh0aGlzLmRyYWdnaW5nUGllY2UucGllY2UuY29sb3IsIHRoaXMuZHJhZ2dpbmdQaWVjZS5waWVjZS50eXBlLCBzcU92ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVTcXVhcmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChldmVudC5idXR0b24gPT09IDIpIHsgLy8gUmlnaHQgbW91c2UgYnV0dG9uXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50QXJyb3cpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVtb3ZlZEFycm93ID0gdGhpcy5yZW1vdmVBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdyk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZW1vdmVkQXJyb3cgfHwgcmVtb3ZlZEFycm93LnN0eWxlICE9PSB0aGlzLmN1cnJlbnRBcnJvdy5zdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy5zaXplICs9IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRBcnJvdyh0aGlzLmN1cnJlbnRBcnJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50QXJyb3cgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5ndWkuZ2V0Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBtb3VzZVggPSBldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBsZXQgbW91c2VZID0gZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBsZXQgaG92ZXJTcSA9IHRoaXMuZ3VpLnBvczJTcXVhcmUobW91c2VYLCBtb3VzZVkpO1xuXG4gICAgICAgIGlmICggdGhpcy5kcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUGllY2UueCA9IG1vdXNlWDtcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQaWVjZS55ID0gbW91c2VZO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICBpZiAoaG92ZXJTcSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93LmRlc3QgPSBob3ZlclNxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdy5kZXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJpZ2h0Q2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmd1aS5nZXRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IG1vdXNlWCA9IGV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgIGxldCBtb3VzZVkgPSBldmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgIGxldCBjbGlja2VkU3EgPSB0aGlzLmd1aS5wb3MyU3F1YXJlKG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgbGV0IGFycm93U3R5bGUgPSAnYmx1ZSc7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hcnJvd1N0eWxlKSB7XG4gICAgICAgICAgICBhcnJvd1N0eWxlID0gdGhpcy5jb25maWcuYXJyb3dTdHlsZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25maWcuYWx0QXJyb3dTdHlsZSAmJiBldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgIGFycm93U3R5bGUgPSB0aGlzLmNvbmZpZy5hbHRBcnJvd1N0eWxlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5jdHJsQXJyb3dTdHlsZSAmJiBldmVudC5jdHJsS2V5KSB7XG4gICAgICAgICAgICBhcnJvd1N0eWxlID0gdGhpcy5jb25maWcuY3RybEFycm93U3R5bGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xpY2tlZFNxICYmICF0aGlzLmRyYWdnaW5nUGllY2UpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogYXJyb3dTdHlsZSwgc2l6ZTogMy41LCBzcmM6IGNsaWNrZWRTcSwgZGVzdDogY2xpY2tlZFNxIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgdGhpcy5ndWkuZ2V0UGxheWVySGFuZEJvdW5kcygpKSB7XG4gICAgICAgICAgICBpZiAoaXNQb3NJbnNpZGVSZWN0KHZhbHVlLCBtb3VzZVgsIG1vdXNlWSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRBcnJvdyA9IHsgc3R5bGU6IGFycm93U3R5bGUsIHNpemU6IDMuNSwgc3JjOiB7dHlwZToga2V5LCBjb2xvcjogdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKX0gfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmd1aS5nZXRPcHBvbmVudEhhbmRCb3VuZHMoKSkge1xuICAgICAgICAgICAgaWYgKGlzUG9zSW5zaWRlUmVjdCh2YWx1ZSwgbW91c2VYLCBtb3VzZVkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9wcG9uZW50Q29sb3I6IENvbG9yID0gdGhpcy5ndWkuZ2V0T3JpZW50YXRpb24oKSA9PT0gJ2JsYWNrJyA/ICd3aGl0ZScgOiAnYmxhY2snO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEFycm93ID0geyBzdHlsZTogYXJyb3dTdHlsZSwgc2l6ZTogMy41LCBzcmM6IHt0eXBlOiBrZXksIGNvbG9yOiBvcHBvbmVudENvbG9yfSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BpZWNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmFjdGl2ZVNxdWFyZSA9IHVuZGVmaW5lZDtcbiAgICB9XG59IiwiaW1wb3J0IEdVSSBmcm9tIFwiLi9ndWlcIjtcbmltcG9ydCBCb2FyZCBmcm9tIFwiLi9ib2FyZFwiO1xuaW1wb3J0IHsgQ29uZmlnLCBQaWVjZXR5cGUsIFNxdWFyZSwgc3F1YXJlcywgQ29sb3IsIEFycm93LCBIaWdobGlnaHQgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgYXJyb3dFbmRwb2ludHNFcXVhbCB9IGZyb20gXCIuL3V0aWxcIjtcbmltcG9ydCBJbnB1dCBmcm9tIFwiLi9pbnB1dFwiO1xuXG5leHBvcnQgY2xhc3MgU2hvR1VJIHtcbiAgICBwcml2YXRlIGJvYXJkOiBCb2FyZDtcbiAgICBwcml2YXRlIGd1aTogR1VJO1xuICAgIHByaXZhdGUgaW5wdXQ6IElucHV0O1xuICAgIHByaXZhdGUgaGlnaGxpZ2h0TGlzdDogSGlnaGxpZ2h0W107XG4gICAgcHJpdmF0ZSBhcnJvd0xpc3Q6IEFycm93W107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHByaXZhdGUgY29uZmlnOiBDb25maWcpIHtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aSA9IG5ldyBHVUkodGhpcy5ib2FyZCwgY29udGFpbmVyLCBjb25maWcpO1xuICAgICAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KHRoaXMsIGNvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0ID0gW107XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBvc2l0aW9uKHNmZW46IHN0cmluZykge1xuICAgICAgICB0aGlzLmJvYXJkLnNldFBvc2l0aW9uKHNmZW4pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQuZ2V0UG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZmxpcEJvYXJkKCkge1xuICAgICAgICB0aGlzLmd1aS5mbGlwQm9hcmQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzU3F1YXJlSGlnaGxpZ2h0ZWQoc3E6IFNxdWFyZSk6IGJvb2xlYW4ge1xuICAgICAgICBmb3IgKGxldCB0bXBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIHRtcGhpZ2hsaWdodC5zcSA9PT0gc3EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEhpZ2hsaWdodChoaWdobGlnaHQ6IEhpZ2hsaWdodCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNTcXVhcmVIaWdobGlnaHRlZChoaWdobGlnaHQuc3EpKSB7XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodExpc3QucHVzaChoaWdobGlnaHQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVIaWdobGlnaHQoaGlnaGxpZ2h0OiBIaWdobGlnaHQpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGxldCB0bXBoaWdobGlnaHQgb2YgdGhpcy5oaWdobGlnaHRMaXN0KSB7XG4gICAgICAgICAgICBpZiAoIHRtcGhpZ2hsaWdodC5zcSA9PT0gaGlnaGxpZ2h0LnNxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFySGlnaGxpZ2h0cygpIHtcbiAgICAgICAgdGhpcy5oaWdobGlnaHRMaXN0ID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEFycm93KGFycm93OiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoYXJyb3cuZGVzdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuYXJyb3dMaXN0LnB1c2goYXJyb3cpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlQXJyb3coYXJyb3c6IEFycm93KTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgZm9yIChsZXQgY21wQXJyb3cgb2YgdGhpcy5hcnJvd0xpc3QpIHtcbiAgICAgICAgICAgIGlmICggYXJyb3dFbmRwb2ludHNFcXVhbChjbXBBcnJvdywgYXJyb3cpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXJyb3dMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyQXJyb3dzKCkge1xuICAgICAgICB0aGlzLmFycm93TGlzdCA9IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUGllY2Uoc3JjU3E6IFNxdWFyZSwgZGVzdFNxOiBTcXVhcmUpIHtcbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25Nb3ZlUGllY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3VjY2VzcyA9IHRoaXMuY29uZmlnLm9uTW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmQubW92ZVBpZWNlKHNyY1NxLCBkZXN0U3EpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRyb3BQaWVjZShjb2xvcjogQ29sb3IsIHBpZWNldHlwZTogUGllY2V0eXBlLCBzcTogU3F1YXJlLCBudW0gPSAxKSB7XG4gICAgICAgIGxldCBzdWNjZXNzID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uRHJvcFBpZWNlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0aGlzLmNvbmZpZy5vbkRyb3BQaWVjZShjb2xvciwgcGllY2V0eXBlLCBzcSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZC5kcm9wUGllY2UoY29sb3IsIHBpZWNldHlwZSwgc3EsIG51bSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVmcmVzaENhbnZhcygpIHtcbiAgICAgICAgbGV0IGFjdGl2ZVNxdWFyZSA9IHRoaXMuaW5wdXQuZ2V0QWN0aXZlU3F1YXJlKCk7XG4gICAgICAgIGxldCBkcmFnZ2luZ1BpZWNlID0gdGhpcy5pbnB1dC5nZXREcmFnZ2luZ1BpZWNlKCk7XG4gICAgICAgIGxldCBjdXJyZW50QXJyb3cgPSB0aGlzLmlucHV0LmdldEN1cnJlbnRBcnJvdygpO1xuICAgICAgICB0aGlzLmd1aS5jbGVhckNhbnZhcygpO1xuXG4gICAgICAgIGZvciAobGV0IGhpZ2hsaWdodCBvZiB0aGlzLmhpZ2hsaWdodExpc3QpIHtcbiAgICAgICAgICAgIHRoaXMuZ3VpLmhpZ2hsaWdodFNxdWFyZShoaWdobGlnaHQuc3R5bGUsIGhpZ2hsaWdodC50eXBlLCBoaWdobGlnaHQuc3EsIGhpZ2hsaWdodC5hbHBoYSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWN0aXZlU3F1YXJlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5oaWdobGlnaHRTcXVhcmUoJ21pbnRjcmVhbScsICdmaWxsJywgYWN0aXZlU3F1YXJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLmd1aS5kcmF3RmlsZVJhbmtMYWJlbHMoKTtcblxuICAgICAgICBmb3IgKGxldCBpIG9mIHNxdWFyZXMpIHtcbiAgICAgICAgICAgIGlmIChhY3RpdmVTcXVhcmUgJiYgZHJhZ2dpbmdQaWVjZSkgeyAvLyBEb24ndCBkcmF3IHRoZSBjdXJyZW50bHkgZHJhZ2dpbmcgcGllY2Ugb24gaXRzIHNxdWFyZVxuICAgICAgICAgICAgICAgIGlmIChhY3RpdmVTcXVhcmUgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ndWkuZHJhd1BpZWNlQXRTcXVhcmUoaSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmd1aS5kcmF3SGFuZCgnYmxhY2snKTsgXG4gICAgICAgIHRoaXMuZ3VpLmRyYXdIYW5kKCd3aGl0ZScpO1xuXG4gICAgICAgIGlmIChkcmFnZ2luZ1BpZWNlKSB7XG4gICAgICAgICAgICB0aGlzLmd1aS5kcmF3UGllY2UoZHJhZ2dpbmdQaWVjZS5waWVjZSwgZHJhZ2dpbmdQaWVjZS54IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMiwgZHJhZ2dpbmdQaWVjZS55IC0gdGhpcy5ndWkuZ2V0U3FTaXplKCkvMik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCBsZXQgYXJyb3cgb2YgdGhpcy5hcnJvd0xpc3QgKSB7IC8vIERyYXcgcHJvZ3JhbW1hdGljYWxseS1hZGRlZCBhcnJvd3NcbiAgICAgICAgICAgIHRoaXMuZHJhd0Fycm93KGFycm93KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoIGxldCBhcnJvdyBvZiB0aGlzLmlucHV0LmdldFVzZXJBcnJvd3MoKSApIHsgLy8gRHJhdyB1c2VyIGlucHV0IGFycm93c1xuICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhhcnJvdyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudEFycm93KSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdBcnJvdyhjdXJyZW50QXJyb3cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ndWkuZHJhd0Fycm93Q2FudmFzKDAuNik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkcmF3QXJyb3coYXJyb3c6IEFycm93KSB7XG4gICAgICAgIHRoaXMuZ3VpLmRyYXdTbmFwQXJyb3coYXJyb3cpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCb2FyZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEd1aSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaG9HVUk7IiwiZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICAgIG9yaWVudGF0aW9uPzogQ29sb3IsXG4gICAgYXJyb3dTdHlsZT86IHN0cmluZyxcbiAgICBhbHRBcnJvd1N0eWxlPzogc3RyaW5nLFxuICAgIGN0cmxBcnJvd1N0eWxlPzogc3RyaW5nLFxuICAgIG9uTW92ZVBpZWNlPzogKC4uLmFyZ3M6IFNxdWFyZVtdKSA9PiBib29sZWFuLFxuICAgIG9uRHJvcFBpZWNlPzogKGNvbG9yOiBDb2xvciwgcGllY2V0eXBlOiBQaWVjZXR5cGUsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25TZWxlY3RQaWVjZT86IChwaWVjZTogUGllY2UsIHNxOiBTcXVhcmUpID0+IGJvb2xlYW4sXG4gICAgb25EZXNlbGVjdFBpZWNlPzogKCkgPT4gYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBDb2xvciA9ICdibGFjaycgfCAnd2hpdGUnO1xuZXhwb3J0IHR5cGUgUGllY2V0eXBlID0gJ2tpbmcnIHwgJ3Jvb2snIHwgJ2Jpc2hvcCcgfCAnZ29sZCcgfCAnc2lsdmVyJyB8ICdrbmlnaHQnIHwgJ2xhbmNlJyB8ICdwYXduJztcbmV4cG9ydCB0eXBlIEhpZ2hsaWdodFR5cGUgPSAnZmlsbCcgfCAnb3V0bGluZScgfCAnY2lyY2xlJyB8ICdoaWRkZW4nXG5cbmV4cG9ydCBjb25zdCBzcXVhcmVzID0gWyAnOWEnICwgJzhhJyAsICc3YScgLCAnNmEnICwgJzVhJyAsICc0YScgLCAnM2EnICwgJzJhJyAsICcxYScgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5YicgLCAnOGInICwgJzdiJyAsICc2YicgLCAnNWInICwgJzRiJyAsICczYicgLCAnMmInICwgJzFiJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzljJyAsICc4YycgLCAnN2MnICwgJzZjJyAsICc1YycgLCAnNGMnICwgJzNjJyAsICcyYycgLCAnMWMnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWQnICwgJzhkJyAsICc3ZCcgLCAnNmQnICwgJzVkJyAsICc0ZCcgLCAnM2QnICwgJzJkJyAsICcxZCcgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5ZScgLCAnOGUnICwgJzdlJyAsICc2ZScgLCAnNWUnICwgJzRlJyAsICczZScgLCAnMmUnICwgJzFlJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzlmJyAsICc4ZicgLCAnN2YnICwgJzZmJyAsICc1ZicgLCAnNGYnICwgJzNmJyAsICcyZicgLCAnMWYnICxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnOWcnICwgJzhnJyAsICc3ZycgLCAnNmcnICwgJzVnJyAsICc0ZycgLCAnM2cnICwgJzJnJyAsICcxZycgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICc5aCcgLCAnOGgnICwgJzdoJyAsICc2aCcgLCAnNWgnICwgJzRoJyAsICczaCcgLCAnMmgnICwgJzFoJyAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJzlpJyAsICc4aScgLCAnN2knICwgJzZpJyAsICc1aScgLCAnNGknICwgJzNpJyAsICcyaScgLCAnMWknIF0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFNxdWFyZSA9IHR5cGVvZiBzcXVhcmVzW251bWJlcl07XG5cbmV4cG9ydCB0eXBlIEhhbmRQaWVjZSA9IE9taXQ8UGllY2UsICdwcm9tb3RlZCc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlIHtcbiAgICB0eXBlOiBQaWVjZXR5cGUsXG4gICAgY29sb3I6IENvbG9yLFxuICAgIHByb21vdGVkPzogYm9vbGVhblxufVxuZXhwb3J0IGludGVyZmFjZSBSZWN0IHtcbiAgICB4OiBudW1iZXIsXG4gICAgeTogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbn1cbmV4cG9ydCBpbnRlcmZhY2UgQXJyb3cge1xuICAgIHN0eWxlOiBzdHJpbmc7XG4gICAgc2l6ZTogbnVtYmVyLFxuICAgIHNyYzogU3F1YXJlfEhhbmRQaWVjZSxcbiAgICBkZXN0PzogU3F1YXJlXG59XG5leHBvcnQgaW50ZXJmYWNlIEhpZ2hsaWdodCB7XG4gICAgc3R5bGU6IHN0cmluZyxcbiAgICB0eXBlOiBIaWdobGlnaHRUeXBlLFxuICAgIGFscGhhPzogbnVtYmVyLFxuICAgIHNxOiBTcXVhcmVcbn0iLCJpbXBvcnQgeyBSZWN0LCBBcnJvdywgUGllY2UsIFNxdWFyZSwgc3F1YXJlcywgQ29sb3IsIFBpZWNldHlwZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBzb21ldGhpbmcgaXMgaW5zaWRlIHRoZSBSZWN0XG4gKiBAcGFyYW0gcmVjdCAtIFJlY3RhbmdsZSB0byBjaGVjayBpZiBwb3MgaXMgaW5zaWRlXG4gKiBAcGFyYW0geCAtIFggY29vcmRpbmF0ZSBvZiBwb3NpdGlvblxuICogQHBhcmFtIHkgLSBZIGNvb3JkaWFudGUgb2YgcG9zaXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUG9zSW5zaWRlUmVjdChyZWN0OiBSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICh4IDwgcmVjdC54IHx8IHggPj0gcmVjdC54ICsgcmVjdC53aWR0aCB8fFxuICAgICAgICB5IDwgcmVjdC55IHx8IHkgPj0gcmVjdC55ICsgcmVjdC5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFycm93RW5kcG9pbnRzRXF1YWwoYXJyb3cxOiBBcnJvdywgYXJyb3cyOiBBcnJvdyk6IGJvb2xlYW4ge1xuICAgIGlmIChhcnJvdzEuc3JjID09PSBhcnJvdzIuc3JjICYmIGFycm93MS5kZXN0ID09PSBhcnJvdzIuZGVzdCkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFNxdWFyZShhcmc6YW55KTogYXJnIGlzIFNxdWFyZSB7XG4gICAgcmV0dXJuIHNxdWFyZXMuaW5jbHVkZXMoYXJnKSAhPT0gZmFsc2U7XG59XG5cbi8vIFRPT0Q6IENoZWNrIGhhbmQgc3Vic3RyaW5nIG9mIHNmZW5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFNmZW4oc2Zlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IHNmZW5BcnIgPSBzZmVuLnNwbGl0KCcgJyk7XG4gICAgbGV0IHNmZW5Cb2FyZCA9IHNmZW5BcnJbMF07XG4gICAgbGV0IHJvd3MgPSBzZmVuQm9hcmQuc3BsaXQoJy8nKTtcblxuICAgIGlmIChyb3dzLmxlbmd0aCAhPT0gOSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHNxQ291bnQgPSAwO1xuICAgIGZvcihsZXQgciBvZiByb3dzKSB7XG4gICAgICAgIGZvcihsZXQgY2hhciBvZiByKSB7XG4gICAgICAgICAgICBpZiAoICFpc05hTihOdW1iZXIoY2hhcikpICl7XG4gICAgICAgICAgICAgICAgc3FDb3VudCArPSBOdW1iZXIoY2hhcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggY2hhci5zZWFyY2goL1tecGxuc2dicmtQTE5TR0JSS10vKSApIHtcbiAgICAgICAgICAgICAgICAgICAgc3FDb3VudCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNxQ291bnQgIT09IDkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzcUNvdW50ID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBpZWNlQ29kZShwaWVjZTogUGllY2UpOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIC8vIEdldCB0aGUgc2ZlbiBmcm9tIHBpZWNldHlwZVxuICAgIGlmIChwaWVjZS50eXBlID09PSAna25pZ2h0Jykge1xuICAgICAgICByZXN1bHQgKz0gJ24nXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ICs9IHBpZWNlLnR5cGVbMF07XG4gICAgfVxuXG4gICAgLy8gTWFrZSBpdCB1cHBlcmNhc2UgaWYgaXQncyBibGFjaydzIHBpZWNlXG4gICAgaWYgKHBpZWNlLmNvbG9yID09PSAnYmxhY2snKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC50b1VwcGVyQ2FzZSgpO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgcGx1cyBzaWduIGlmIHRoZSBwaWVjZSBpcyBwcm9tb3RlZFxuICAgIGlmIChwaWVjZS5wcm9tb3RlZCkge1xuICAgICAgICByZXN1bHQgPSAnKycgKyByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgcGllY2V0eXBlTWFwID0gbmV3IE1hcDxzdHJpbmcsIFBpZWNldHlwZT4oKTtcbnBpZWNldHlwZU1hcC5zZXQoJ3AnLCAncGF3bicpO1xucGllY2V0eXBlTWFwLnNldCgnbCcsICdsYW5jZScpO1xucGllY2V0eXBlTWFwLnNldCgnbicsICdrbmlnaHQnKTtcbnBpZWNldHlwZU1hcC5zZXQoJ3MnLCAnc2lsdmVyJyk7XG5waWVjZXR5cGVNYXAuc2V0KCdnJywgJ2dvbGQnKTtcbnBpZWNldHlwZU1hcC5zZXQoJ2InLCAnYmlzaG9wJyk7XG5waWVjZXR5cGVNYXAuc2V0KCdyJywgJ3Jvb2snKTtcbnBpZWNldHlwZU1hcC5zZXQoJ2snLCAna2luZycpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGllY2VPYmooc2ZlblBpZWNlQ29kZTogc3RyaW5nKTogUGllY2V8dW5kZWZpbmVkIHtcbiAgICBsZXQgcGllY2VDb2RlID0gc2ZlblBpZWNlQ29kZS50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBwQ29sb3I6IENvbG9yID0gcGllY2VDb2RlID09PSBzZmVuUGllY2VDb2RlID8gJ3doaXRlJyA6ICdibGFjayc7XG4gICAgbGV0IHBUeXBlID0gcGllY2V0eXBlTWFwLmdldChwaWVjZUNvZGUpO1xuICAgICAgICBpZiAoIXBUeXBlKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIHt0eXBlOnBUeXBlLCBjb2xvcjogcENvbG9yfTtcbn1cbiJdfQ==
