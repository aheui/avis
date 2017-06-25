import React from 'react';
import Aheui from 'naheui';

import {
    Vec2,
    Moment,
    Path,
} from './model/path';
import mutationManager from './model/mutationManager';
import * as propTypes from './propTypes';

const defaultSpaceFillChar = '\u3000';

@mutationManager()
export class AppState {
    constructor({ content }) {
        this._changeDispatcher = new ChangeDispatcher();
        this._uiState = new UIState();
        this._editOptions = new EditOptions();
        this._selection = new Selection();
        this._codeSpace = CodeSpace.fromText(content || '');
        // this._machine; // init에서 생성됨
        this._spaceFillChar = defaultSpaceFillChar;
        this._path = new Path();
        this._fuel = 20; // 과거 추적 깊이
        this._intervalId = null;
        this._interval = 1; // 코드 실행 속도
        this.init();
    }
    get changeDispatcher() { return this._changeDispatcher; }
    get cursorOnBreakPoint() {
        const { cursor } = this._machine;
        const code = this._codeSpace.get(cursor.x, cursor.y);
        return !!code && code.breakPoint;
    }
    get editOptions() { return this._editOptions; }
    set editOptions(value) { this.mutate(() => Object.assign(this._editOptions, value)); }
    get selection() {
        return this._selection;
    }
    set selection({ anchor, focus }) {
        if (!anchor && !focus) return;
        this.mutate(() => {
            if (anchor) this._selection.anchor = anchor;
            if (focus) this._selection.focus = focus;
        });
    }
    set caret({ x, y }) {
        this.mutate(() => {
            const _x = (x == null) ? this._selection.x : x;
            const _y = (y == null) ? this._selection.y : y;
            const caret = { x: _x, y: _y };
            this.selection = { anchor: caret, focus: caret };
        });
    }
    get spaceFillChar() {
        return this._spaceFillChar;
    }
    set spaceFillChar(value) {
        this.mutate(() => {
            this._spaceFillChar = value;
        });
    }
    get cursor() {
        return this._machine.cursor;
    }
    get codeSpace() {
        return this._codeSpace;
    }
    get isRunning() {
        return this._intervalId !== null;
    }
    get interval() {
        return this._interval;
    }
    set interval(value) {
        this.mutate(() => {
            if (this.isRunning) {
                window.clearInterval(this._intervalId);
                this._intervalId = window.setInterval(() => this.step(), value);
            }
            this._interval = value;
        });
    }
    // 앱 상태에 변경이 있을 때마다 깔아놓은 가정들이 온전한지 체크
    checkState() {
        console.assert(this._codeSpace.length > 0);
    }
    // 앱 상태가 변경될 때마다 처리되는 작업들
    // 모든 상태변경은 mutate 메서드가 인자로 받는 핸들러 안에서 이루어져야 함
    onMutate() {
        this._changeDispatcher.dispatch();
        this.checkState();
    }
    getUIOpen(key) { return this._uiState.getOpen(key); }
    setUIOpen(key, value) { this.mutate(() => { this._uiState.setOpen(key, value); }); }
    translateSelection(x, y) {
        if (x === 0 && y === 0) return;
        this.mutate(() => {
            this.selection.translate(x, y);
        });
    }
    squareSelection() { this.mutate(() => { this.selection.square(); }); }
    collapseSelection() {
        if (this._selection.isCaret) return;
        this.mutate(() => {
            const { x, y } = this._selection;
            const caret = { x, y };
            this.selection = { anchor: caret, focus: caret };
        });
    }
    selectAll() {
        this.mutate(() => {
            const { width, height } = this._codeSpace;
            this.selection = {
                anchor: { x: 0, y: 0 },
                focus: { x: width, y: height - 1 },
            };
        });
    }
    insertCode(rowIndex, colIndex, text, overwrite) {
        this.mutate(() => { this._codeSpace.insert(rowIndex, colIndex, text, this._spaceFillChar, overwrite); });
    }
    insertChunkCode(rowIndex, colIndex, text, pushDown, overwrite) {
        this.mutate(() => { this._codeSpace.insertChunk(rowIndex, colIndex, text, this._spaceFillChar, pushDown, overwrite); });
    }
    insertChunkSmartCode(rowIndex, colIndex, text, overwrite) {
        this.mutate(() => { this._codeSpace.insertChunkSmart(rowIndex, colIndex, text, this._spaceFillChar, overwrite); });
    }
    peelCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.paint(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    shrinkCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.shrink(rowIndex, colIndex, width, height); });
    }
    invertHCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.invertH(rowIndex, colIndex, width, height); });
    }
    invertVCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.invertV(rowIndex, colIndex, width, height); });
    }
    rotateCWCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.rotateCW(rowIndex, colIndex, width, height); });
    }
    rotateCCWCode(rowIndex, colIndex, width, height) {
        this.mutate(() => { this._codeSpace.rotateCCW(rowIndex, colIndex, width, height); });
    }
    ensureCodeRowWidth(rowIndex, width) {
        this.mutate(() => { this._codeSpace.ensureLineWidth(rowIndex, width, this._spaceFillChar); });
    }
    joinCodeRows(rowIndex, height) { this.mutate(() => { this._codeSpace.joinRows(rowIndex, height); }); }
    deleteCodeRows(rowIndex, height) { this.mutate(() => { this._codeSpace.deleteRows(rowIndex, height); }); }
    divideAndCarryCode(rowIndex, colIndex, height) {
        this.mutate(() => { this._codeSpace.divideAndCarryLines(rowIndex, colIndex, height); });
    }
    init() {
        this.mutate(() => {
            this.stop();
            this._machine = new Aheui.Machine(this._codeSpace);
            this._path.clear();
            this._path.step(Moment.fromMachineState(
                this._machine,
                this._codeSpace,
                false,
                this._fuel,
            ));
        });
    }
    run() {
        if (this.isRunning) return;
        this.mutate(() => {
            this._machine.terminateFlag = false;
            this._intervalId = window.setInterval(() => this.step(), this._interval);
        });
    }
    stop() {
        if (!this.isRunning) return;
        this.mutate(() => {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
        });
    }
    dump() {
        return this._machine.dump();
    }
    step() {
        this.mutate(() => {
            const machine = this._machine;
            const path = this._path;
            const { cursor, storage } = machine;
            const stepResult = machine.step();
            if (stepResult.cursorMoveResult) {
                const path = this._path;
                const r = stepResult.cursorMoveResult
                const cp =
                    (r.xSpeed < 2) &&
                    (r.ySpeed < 2) &&
                    !r.xWrapped &&
                    !r.yWrapped;
                Object.assign(path.lastMoment, { cn: cp });
                path.step(Moment.fromMachineState(
                    this._machine,
                    this._codeSpace,
                    cp,
                    this._fuel,
                ));
            }
            if (machine.terminated || this.cursorOnBreakPoint) {
                this.stop();
            }
        });
    }
    toggleBreakPoint(x, y) {
        this.mutate(() => {
            const { cursor } = this._machine;
            this._codeSpace.toggleBreakPoint(cursor.x, cursor.y);
        });
    }
}

// stores trivial states
class UIState {
    constructor() {
        this._open = {
            'edit.inputMethod': true,
            'edit.rotateAndFlip': true,
        };
    }
    getOpen(key) { return !!this._open[key]; }
    setOpen(key, value) { this._open[key] = !!value; }
}

class EditOptions {
    constructor() {
        // insert, overwrite
        this.inputMethod = 'insert';
    }
}

class Selection {
    constructor() {
        this._anchor = { x: 0, y: 0 };
        this._focus = { x: 0, y: 0 };
    }
    get isCaret() { return (this.width === 1) && (this.height === 1); }
    get isSquare() { return this.width === this.height; }
    get x() { return Math.min(this._anchor.x, this._focus.x); }
    get y() { return Math.min(this._anchor.y, this._focus.y); }
    get top() { return this.y; }
    get left() { return this.x; }
    get right() { return this.x + this.width - 1; }
    get bottom() { return this.y + this.height - 1; }
    get width() { return Math.abs(this._anchor.x - this._focus.x) + 1; }
    get height() { return Math.abs(this._anchor.y - this._focus.y) + 1; }
    get area() { return this.width * this.height; }
    get anchor() { return this._anchor; }
    set anchor(value) {
        const { x, y } = value;
        if (x != null) this._anchor.x = Math.max(x | 0, 0);
        if (y != null) this._anchor.y = Math.max(y | 0, 0);
    }
    get focus() { return this._focus; }
    set focus(value) {
        const { x, y } = value;
        if (x != null) this._focus.x = Math.max(x | 0, 0);
        if (y != null) this._focus.y = Math.max(y | 0, 0);
    }
    translate(x, y) {
        this.anchor = { x: this.anchor.x + x, y: this.anchor.y + y };
        this.focus = { x: this.focus.x + x, y: this.focus.y + y };
    }
    square() {
        const { x, y } = this._anchor;
        const [ dx, dy ] = [ this._focus.x - x, this._focus.y - y ];
        const [ adx, ady ] = [ Math.abs(dx), Math.abs(dy) ];
        const d = adx > ady ? adx : ady;
        this.focus = {
            x: x + (dx >= 0 ? d : -d),
            y: y + (dy >= 0 ? d : -d),
        };
    }
}

// ㄴㄷㄸㄹㅁㅂㅃㅅㅆㅈㅊㅌㅍㅎ
const significantChoIndices = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 17, 18];
// ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅢㅣ
const significantJungIndices = [0, 2, 4, 6, 8, 12, 13, 17, 18, 19, 20];
const jungHInvertMap = {
    0: 4, 4: 0, // ㅏㅓ
    2: 6, 6: 2, // ㅑㅕ
};
const jungVInvertMap = {
    8: 13, 13: 8, // ㅗㅜ
    12: 17, 17: 12, // ㅛㅠ
};
const jungCWRotationMap = { 
    0: 13, 13: 4, 4: 8, 8: 0, // ㅏㅜㅓㅗ
    2: 17, 17: 6, 6: 12, 12: 2, // ㅑㅠㅕㅛ
}
const jungCCWRotationMap = { 
    0: 8, 8: 4, 4: 13, 13: 0, // ㅏㅗㅓㅜ
    2: 12, 12: 6, 6: 17, 17: 2, // ㅑㅛㅕㅠ
}

class Code {
    constructor(char, breakPoint = false) {
        this._cho = -1;
        this._jung = -1;
        this._jong = -1;
        this._isComment = true;
        this.char = char;
        this.breakPoint = breakPoint;
    }
    get char() {
        return this._char;
    }
    set char(value) {
        this._char = value;
        this._cho = Aheui.cho(value);
        this._jung = Aheui.jung(value);
        this._jong = Aheui.jong(value);
        this._isComment = Code.isComment(this._cho, this._jung);
    }
    get cho() { return this._cho; }
    get jung() { return this._jung; }
    get jong() { return this._jong; }
    get isComment() { return this._isComment; }
    set jung(value) {
        this._jung = value;
        const { _cho, _jung, _jong } = this;
        this._char = String.fromCharCode(
            44032 + 28 * ((_cho * 21) + _jung) + _jong
        );
    }
    _mapJung(table) {
        if (this._isComment) return;
        const jung = table[this._jung];
        if (jung != null) this.jung = jung;
    }
    invertH() { this._mapJung(jungHInvertMap); }
    invertV() { this._mapJung(jungVInvertMap); }
    rotateCW() { this._mapJung(jungCWRotationMap); }
    rotateCCW() { this._mapJung(jungCCWRotationMap); }

    toString() {
        return this.char;
    }
    static isComment(cho, jung) {
        return (
            significantChoIndices.indexOf(cho) === -1 &&
            significantJungIndices.indexOf(jung) === -1
        );
    }
}

class CodeLine extends Array {
    static fromText(text) {
        const result = new CodeLine(text.length);
        for (let i = 0; i < text.length; ++i) {
            result[i] = new Code(text[i], false);
        }
        return result;
    }
    isEmptyAfter(index, spaceChars) {
        for (let i = index; i < this.length; ++i) {
            if (!spaceChars.has(this[i].char)) {
                return false;
            }
        }
        return true;
    }
    ensureLength(length, spaceFillChar) {
        while (this.length < length) this.push(new Code(spaceFillChar, false));
    }
    insert(index, text, spaceFillChar, overwrite) {
        if (text.length === 0) return;
        if (/\r|\n/.test(text)) {
            throw new Error('CodeLine 안에 개행문자가 들어오면 안됨');
        }
        this.ensureLength(index, spaceFillChar);
        const codes = text.split('').map(char => new Code(char, false));
        this.splice(index, overwrite ? codes.length : 0, ...codes);
    }
    paint(index, length, paintChar) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i] = new Code(paintChar, false);
        }
    }
    divide(index) {
        const tail = this.slice(index);
        this.length = Math.min(this.length, index);
        console.assert(tail instanceof CodeLine);
        return tail;
    }
    shrink(index, length) {
        if (length < 1) return;
        this.splice(index, length);
    }
    invertH(index, length, jungConv = true) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        if (jungConv) {
            for (let i = index; i < to; ++i) {
                this[i].invertH();
            }
        }
        const halfLength = length / 2;
        for (let c = 0; c < halfLength; ++c) {
            const left = c + index;
            const right = length - c - 1 + index;
            [this[left], this[right]] = [this[right], this[left]];
        }
    }
    invertV(index, length) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].invertV();
        }
    }
    rotateCW(index, length) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].rotateCW();
        }
    }
    rotateCCW(index, length) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].rotateCCW();
        }
    }
    toString(selection) {
        // selection이 없으면 전체를 뱉음
        if (selection == null) {
            return this.map(code => code.toString()).join('');
        }
        // 아니라면 selection의 left / right만큼 잘라서 보내줌
        // right는 inclusive한 인덱스라서 1만큼 더해야 slice에서 쓸 수 있음
        return this.slice(selection.left, selection.right + 1).map(
            code => code.toString()
        ).join('');
    }
}

@mutationManager()
class CodeSpace extends Array {
    constructor(...args) {
        super(...args);
        this._width = 0;
    }
    ensureHeight(height) {
        if (this.length >= height) return;
        this.mutate(() => {
            while (this.length < height) this.push(new CodeLine());
        });
    }
    ensureLineWidth(rowIndex, width, spaceFillChar) {
        this.ensureHeight(rowIndex + 1);
        const codeLine = this[rowIndex];
        if (codeLine.length >= width) return;
        this.mutate(() => {
            codeLine.ensureLength(width, spaceFillChar);
        });
    }
    _recalculateWidth() {
        this._width = 0;
        for (let codeLine of this) {
            if (codeLine.length > this._width) {
                this._width = codeLine.length;
            }
        }
    }
    get width() {
        return this._width;
    }
    get height() {
        return this.length;
    }
    get codeLength() {
        // 개행은 길이 1
        return this.reduce((sum, codeLine) => sum + codeLine.length + 1, -1);
    }
    get(x, y) {
        const line = this[y];
        if (line) {
            const code = line[x];
            return code || null;
        }
        return null;
    }
    getIndex(x, y) {
        if (y >= this.length) return this.codeLength;
        let sum = y;
        for (let i = 0; i < y; ++i) sum += this[i].length;
        sum += (x > this[y].length) ? this[y].length : x;
        return sum;
    }
    getLineWidth(rowIndex) {
        const line = this[rowIndex];
        return line ? line.length : 0;
    }
    insert(rowIndex, colIndex, text, spaceFillChar, overwrite) {
        if (text.length === 0) return;
        this.mutate(() => {
            const textLines = text.split(/\r?\n/);
            this.ensureHeight(rowIndex + textLines.length);
            for (let i = 0; i < textLines.length; ++i) {
                const textLine = textLines[i];
                const codeLine = this[rowIndex + i];
                codeLine.insert(colIndex, textLine, spaceFillChar, overwrite);
                if (codeLine.length > this._width) {
                    this._width = codeLine.length;
                }
            }
        });
    }
    insertChunk(rowIndex, colIndex, text, spaceFillChar, pushDown, overwrite) {
        // TODO 테스트 작성?
        // TODO spaceChars 딴 곳으로 옮기기
        const spaceChars = new Set([spaceFillChar, ' ']);
        // 덮어쓰기 모드라면 insert를 그대로 적용해도 무방함
        if (overwrite) {
            return this.insert(
                rowIndex,
                colIndex,
                text,
                spaceFillChar,
                overwrite
            );
        }
        if (text.length === 0) return;
        this.mutate(() => {
            const textLines = text.split(/\r?\n/);
            const textWidth = textLines.reduce(
                (prev, current) => Math.max(prev, current.length),
                0
            );
            let boundWidth = textWidth;
            let boundHeight;
            let i;
            // 가로는 밀어낼 길이를 알아내기 위해서 검사를 두 번 돌아야 함...
            if (pushDown) {
                this.ensureHeight(rowIndex + 1);
                boundWidth = 0;
                // 첫 줄이 비어있으면 그냥 그대로 덮어쓰고, 아니면 새로 만듦
                if (this[rowIndex].isEmptyAfter(colIndex, spaceChars)) {
                    this[rowIndex].ensureLength(colIndex, spaceFillChar);
                    boundHeight = 1;
                } else {
                    boundHeight = 0;
                }
            } else {
                this.ensureHeight(rowIndex);
                boundHeight = Math.min(this.length - rowIndex, textLines.length);
                for (i = 0; i < boundHeight; ++i) {
                    const textLine = textLines[i];
                    const codeLine = this[rowIndex + i];
                    const codeCol = codeLine[colIndex];
                    codeLine.ensureLength(colIndex, spaceFillChar);
                    let j;
                    // code가 존재하는 만큼만 검사함
                    const loopSize = Math.min(codeLine.length - colIndex, textWidth);
                    for (j = 0; j < loopSize; ++j) {
                        let code = codeLine[j + colIndex];
                        // 해당 열에 Code가 무시할 글자가 아니면 그 구간부터 가로로
                        // 밀어냄
                        if (!spaceChars.has(code.char)) {
                            if (j < boundWidth) boundWidth = j;
                            break;
                        }
                    }
                }
            }
            for (i = 0; i < boundHeight; ++i) {
                const textLine = textLines[i];
                const codeLine = this[rowIndex + i];
                let j;
                const loopSize = Math.min(codeLine.length - colIndex, boundWidth);
                for (j = 0; j < loopSize; ++j) {
                    codeLine[j + colIndex].char = textLine[j] || spaceFillChar;
                }
                if (j < textWidth) {
                    const codes = textLine.split('').slice(j).map(
                        char => new Code(char, false)
                    );
                    // 코드 뒤에 뭐가 있으면 spaceFillChar를 필요한 만큼 붙임
                    if (codeLine.length > colIndex + j) {
                        const fillWidth = textWidth - boundWidth;
                        for (let k = codes.length; k < fillWidth; ++k) {
                            codes.push(new Code(spaceFillChar, false));
                        }
                    }
                    codeLine.splice(colIndex + j, 0, ...codes);
                }
                if (codeLine.length > this._width) {
                    this._width = codeLine.length;
                }
            }
            if (i < textLines.length) {
                const codeLineAppends = textLines.slice(i).map(text => {
                    let codeLine = new CodeLine();
                    codeLine.ensureLength(colIndex, spaceFillChar);
                    codeLine.insert(colIndex, text, spaceFillChar, true);
                    return codeLine;
                });
                this.splice(rowIndex + i, 0, ...codeLineAppends);
                if (colIndex + textWidth > this._width) {
                    this._width = colIndex + textWidth;
                }
            }
        });
    }
    insertChunkSmart(rowIndex, colIndex, text, spaceFillChar, overwrite) {
        // TODO spaceChars 딴 곳으로 옮기기
        const spaceChars = new Set([spaceFillChar, ' ']);
        const textLines = text.split(/\r?\n/);
        // 첫째 행이 해당 열부터 비어있다면:
        // 적용될 행들이 해당 열부터 비어있는지 여부를 검사하고 비어있다면
        // 오른쪽으로 밀고, 아니면 아래로 내림
        // 첫째 행이 비어있지 않으면 그냥 오른쪽으로 밂
        let pushDown = true;
        for (let i = 0; i < textLines.length; ++i) {
            const codeLine = this[i + rowIndex];
            if (codeLine != null && !codeLine.isEmptyAfter(colIndex, spaceChars)) {
                pushDown = i !== 0;
                break;
            } else {
                pushDown = i === 0;
            }
        }
        return this.insertChunk(
            rowIndex,
            colIndex,
            text,
            spaceFillChar,
            pushDown,
            overwrite
        );
    }
    paint(rowIndex, colIndex, width, height, paintChar) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                codeLine.paint(colIndex, width, paintChar);
            }
        });
    }
    shrink(rowIndex, colIndex, width, height) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            const voids = [];
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                if (colIndex === 0 && codeLine.length < width) {
                    voids.push(codeLine);
                } else {
                    codeLine.shrink(colIndex, width);
                }
            }
            for (let codeLine of voids) this.splice(this.indexOf(codeLine), 1);
            if (this.length === 0) this.push(new CodeLine());
            this._recalculateWidth();
        });
    }
    invertH(rowIndex, colIndex, width, height) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            for (let r = 0; r < height; ++r) {
                const codeLine = this[rowIndex + r];
                if (!codeLine) break;
                codeLine.invertH(colIndex, width);
            }
        });
    }
    invertV(rowIndex, colIndex, width, height) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                codeLine.invertV(colIndex, width);
            }
            const halfHeight = height / 2;
            for (let r = 0; r < halfHeight; ++r) {

                const codeLine1 = this[rowIndex + r];
                const codeLine2 = this[rowIndex + height - r - 1];
                for (let c = 0; c < width; ++c) {
                    const i = c + colIndex;
                    [codeLine1[i], codeLine2[i]] = [codeLine2[i], codeLine1[i]];
                }
            }
        });
    }
    rotateCW(rowIndex, colIndex, width, height) {
        // rotateCW : invertXY then invertH
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        if (width != height) return;
        this.mutate(() => {
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                codeLine.rotateCW(colIndex, width);
            }
            // invert XY
            for (let r = 0; r < height; ++r) {
                const y = rowIndex + r;
                const tx = colIndex + r;
                for (let c = 0; c < r; ++c) {
                    const x = colIndex + c;
                    const ty = rowIndex + c;
                    [this[y][x], this[ty][tx]] = [this[ty][tx], this[y][x]];
                }
            }
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                codeLine.invertH(colIndex, width, false);
            }
        });
    }
    rotateCCW(rowIndex, colIndex, width, height) {
        // rotateCW : invertH then invertXY
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        if (width != height) return;
        this.mutate(() => {
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) break;
                codeLine.rotateCCW(colIndex, width);
                codeLine.invertH(colIndex, width, false);
            }
            // invert XY
            for (let r = 0; r < height; ++r) {
                const y = rowIndex + r;
                const tx = colIndex + r;
                for (let c = 0; c < r; ++c) {
                    const x = colIndex + c;
                    const ty = rowIndex + c;
                    [this[y][x], this[ty][tx]] = [this[ty][tx], this[y][x]];
                }
            }
        });
    }
    joinRows(rowIndex, height) { // TODO: 테스트 짜야겠다
        if (this.length <= rowIndex) return;
        const _height = Math.min(height, this.length - rowIndex);
        if (_height < 2) return;
        this.mutate(() => {
            this[rowIndex] = this[rowIndex].concat(
                ...this.slice(rowIndex + 1, rowIndex + _height)
            );
            this.deleteRows(rowIndex + 1, _height - 1);
            // width 계산은 deleteRows에서 일어남
        });
    }
    deleteRows(rowIndex, height = 1) {
        if (height < 1) return;
        this.mutate(() => {
            this.splice(rowIndex, height);
            this._recalculateWidth();
        });
    }
    divideAndCarryLines(rowIndex, colIndex, height) {
        this.mutate(() => {
            this.ensureHeight(rowIndex + height);
            const tails = this.slice(rowIndex, rowIndex + height).map(
                codeLine => codeLine.divide(colIndex)
            );
            this.splice(rowIndex + height, 0, ...tails);
            this._recalculateWidth();
        });
    }
    toggleBreakPoint(x, y) {
        // TODO
    }
    toString(selection) {
        // 선택 영역을 지정하지 않았으면 코드 전체를 뱉음
        if (selection == null) {
            return this.map(line => line.toString()).join('\n');
        }
        // right / bottom은 inclusive 인덱스라서 slice에다가 쓰려면 1을
        // 더해야 함
        return this.slice(selection.top, selection.bottom + 1).map(
            line => line.toString(selection)
        ).join('\n');
    }
    static fromText(text) {
        const lines = text.split(/\r?\n/g);
        const result = new CodeSpace(lines.length);
        for (let i = 0; i < lines.length; ++i) {
            const codeLine = CodeLine.fromText(lines[i]);
            result[i] = codeLine;
            if (codeLine.length > result._width) {
                result._width = codeLine.length;
            }
        }
        if (result.length === 0) {
            result.push(new CodeLine());
        }
        return result;
    }
}

class ChangeDispatcher {
    constructor(parent = null) {
        this.parent = parent;
        this._listeners = [];
        this.__listeners = this._listeners;
    }
    dispatch() {
        this._listeners = this.__listeners;
        for (let listener of this._listeners) listener.call();
    }
    addListener(listener) {
        if (this.__listeners === this._listeners) {
            this.__listeners = [...this._listeners];
        }
        this.__listeners.push(listener);
    }
    removeListener(listener) {
        if (this.__listeners === this._listeners) {
            this.__listeners = [...this._listeners];
        }
        const index = this.__listeners.indexOf(listener);
        if (index === -1) return;
        this.__listeners.splice(index, 1);
    }
}

export function connect(mapStateToProps) {
    return Container => class Connect extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {};
            this.ref = null;
            this.changeDispatcher = new ChangeDispatcher(
                context.changeDispatcher ||
                context.appState.changeDispatcher
            );
        }
        componentDidMount() {
            this.changeDispatcher.call = () => {
                this.setState({});
                this.changeDispatcher.dispatch();
            }
            this.changeDispatcher.parent.addListener(this.changeDispatcher);
        }
        componentWillUnmount() {
            this.changeDispatcher.call = null;
            this.changeDispatcher.parent.removeListener(this.changeDispatcher);
        }
        getChildContext() {
            return {
                appState: this.context.appState,
                changeDispatcher: this.changeDispatcher,
            };
        }
        render() {
            return React.createElement(Container, {
                ...this.props,
                ref: ref => this.ref = ref,
                ...mapStateToProps(this.context.appState),
            });
        }
        static contextTypes = {
            appState: propTypes.objectIsRequired,
            changeDispatcher: propTypes.object,
        };
        static childContextTypes = {
            appState: propTypes.objectIsRequired,
            changeDispatcher: propTypes.objectIsRequired,
        };
    };
}
