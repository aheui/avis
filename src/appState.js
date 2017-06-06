import React from 'react';
import Aheui from 'naheui';
import * as hangul from './misc/hangul'

const defaultSpaceFillChar = '\u3000';

export class AppState {
    constructor({ content }) {
        this._mutating;
        this._stateId = 0;
        this._changeDispatcher = new ChangeDispatcher();
        this._uiState = new UIState();
        this._editOptions = new EditOptions();
        this._selection = new Selection();
        this._codeSpace = CodeSpace.fromText(content || '');
        this._machine = new Aheui.Machine(this._codeSpace);
        this._spaceFillChar = defaultSpaceFillChar;
        this._pathTrace = new PathTrace();
        this._intervalId = null;
        this._interval = 1; // 코드 실행 속도
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
    get stateId() { return this._stateId; }
    // 앱 상태에 변경이 있을 때마다 깔아놓은 가정들이 온전한지 체크
    checkState() {
        console.assert(this._codeSpace.length > 0);
    }
    // 앱 상태를 변경하는 메서드
    // 모든 상태변경은 이 메서드가 받는 executor 안에서 이루어져야함
    mutate(executor) {
        if (!this._mutating) {
            try {
                this._mutating = true;
                executor();
            } finally {
                this._mutating = false;
                ++this._stateId;
                this._changeDispatcher.dispatch();
                this.checkState();
            }
        } else {
            executor();
        }
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
            // TODO
            // clear machine state
            // init machine with appState's codeSpace
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
            const pathTrace = this._pathTrace;
            const { cursor, storage } = machine;
            pathTrace.push(cursor.x, cursor.y);
            machine.step();
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
// ㅏ↔ㅓ, ㅑ↔ㅕ
const jungHInvertMap = { 0: +4,  4: -4,  2: +4,  6: -4 };
// ㅗ↔ㅜ, ㅛ↔ㅠ
const jungVInvertMap = { 8: +5, 13: -5, 12: +5, 17: -5 };
// 회전
const jungCWRotationMap = { 
    0: +13, 13:  -9, 4: +4,  8:  -8, // ㅏㅜㅓㅗ
    2: +15, 17: -11, 6: +6, 12: -10, // ㅑㅠㅕㅛ
}
const jungCCWRotationMap = { 
    0:  +8,  8: -4, 4:  +9, 13: -13, // ㅏㅗㅓㅜ
    2: +10, 12: -6, 6: +11, 17: -15, // ㅑㅛㅕㅠ
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
    _updateFromIndices() {
        if (!this._isComment) {
            this._char = hangul.fromIndices(this._cho, this._jung, this._jong);
        }
    }
    invertH() {
        this._jung += jungHInvertMap[this._jung] | 0; 
        this._updateFromIndices();
    }
    invertV() { 
        this._jung += jungVInvertMap[this._jung] | 0; 
        this._updateFromIndices();
    }
    rotateCW() { 
        this._jung += jungCWRotationMap[this._jung] | 0; 
        this._updateFromIndices();
    }
    rotateCCW() { 
        this._jung += jungCCWRotationMap[this._jung] | 0; 
        this._updateFromIndices();
    }

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
    toString() {
        return this.map(code => code.toString()).join('');
    }
}

class CodeSpace extends Array {
    constructor(...args) {
        super(...args);
        this._mutating = false;
        this._stateId = 0;
        this._width = 0;
    }
    get stateId() { return this._stateId; }
    mutate(executor) {
        if (!this._mutating) {
            try {
                this._mutating = true;
                executor();
            } finally {
                this._mutating = false;
                ++this._stateId;
            }
        } else {
            executor();
        }
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
        console.log(`rotateCW(${rowIndex}, ${colIndex}, ${width}, ${height})`); // TODO
    }
    rotateCCW(rowIndex, colIndex, width, height) {
        console.log(`rotateCCW(${rowIndex}, ${colIndex}, ${width}, ${height})`); // TODO
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
    toString() {
        return this.map(line => line.toString()).join('\n');
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

class PathTrace {
    constructor(limit = 20) {
        this.data = [];
        this._limit = limit;
    }
    get limit() {
        return this._limit;
    }
    set limit(value) {
        if (value < 0) {
            this._limit = 0;
        } else {
            this._limit = value | 0;
        }
        this._cut();
    }
    push(x, y) {
        this.data.unshift({ x, y });
        this._cut();
    }
    clear() {
        this.data.length = 0;
    }
    _cut() {
        if (this.data.length > this._limit) {
            this.data.length = this._limit;
        }
    }
    *[Symbol.iterator]() {
        for (let data of this.data) yield data;
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
            appState: React.PropTypes.object.isRequired,
            changeDispatcher: React.PropTypes.object,
        };
        static childContextTypes = {
            appState: React.PropTypes.object.isRequired,
            changeDispatcher: React.PropTypes.object.isRequired,
        };
    };
}
