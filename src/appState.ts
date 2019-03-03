import * as React from 'react';
import * as Aheui from 'naheui';

import {
    Vec2,
    Moment,
    Path,
} from './model/path';
import cloneable, { Cloneable } from './model/cloneable';
import mutationManager, {
    Executor,
    MutationManager,
} from './model/mutationManager';
import * as propTypes from './propTypes';

const defaultSpaceFillChar = '\u3000';

@mutationManager()
export class AppState implements MutationManager {
    // MutationManager
    stateId: number;
    mutate: (executor: Executor) => void;
    // AppState
    private _changeDispatcher: ChangeDispatcher;
    private _uiState: UIState;
    private _editOptions: EditOptions;
    private _runningOptions: RunningOptions;
    private _selection: Selection;
    private _codeSpace: CodeSpace;
    private _machine: Aheui.Machine;
    private _spaceFillChar: string;
    private _path: Path;
    private _fuel: number;
    private _runner: (() => void) | null;
    constructor({ content }: { content: string }) {
        this._changeDispatcher = new ChangeDispatcher();
        this._uiState = new UIState();
        this._editOptions = new EditOptions();
        this._runningOptions = new RunningOptions();
        this._selection = new Selection();
        // this._codeSpace // init에서 생성됨
        // this._machine; // init에서 생성됨
        this._spaceFillChar = defaultSpaceFillChar;
        this._path = new Path();
        this._fuel = 50; // 과거 추적 깊이
        this._runner = null; // rAF handler
        this.init(content);
    }
    get changeDispatcher() { return this._changeDispatcher; }
    get cursorOnBreakPoint() {
        const { cursor } = this._machine;
        const code = this._codeSpace.get(cursor.x, cursor.y);
        return !!code && code.breakPoint;
    }
    get editOptions() { return this._editOptions; }
    set editOptions(value: Partial<EditOptions>) { this.mutate(() => Object.assign(this._editOptions, value)); }
    get runningOptions() { return this._runningOptions; }
    set runningOptions(value: Partial<RunningOptions>) { this.mutate(() => Object.assign(this._runningOptions, value)); }
    get selection() {
        return this._selection;
    }
    set selection({ anchor, focus }: { anchor?: Vec2, focus?: Vec2 }) {
        if (!anchor && !focus) return;
        this.mutate(() => {
            if (anchor) this._selection.anchor = anchor;
            if (focus) this._selection.focus = focus;
        });
    }
    set caret({ x, y }: { x?: number | null, y?: number | null }) {
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
    get selectedStorage() {
        const ah = '아'.charCodeAt(0);
        return String.fromCharCode(
            ah + this._machine._selectedStorage
        );
    }
    get storages() {
        const ah = '아'.charCodeAt(0);
        return new Map(Array.from({
            length: Aheui.jongTable.length,
        }, (_, i) => String.fromCharCode(ah + i)).map(
            code => [
                code,
                this._machine.getStorage(code)._getArray(),
            ] as [string, number[]]
        ));
    }
    get codeSpace() {
        return this._codeSpace;
    }
    get path () {
        return this._path;
    }
    get isRunning() {
        return this._runner !== null;
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
    getUIOpen(key: string) { return this._uiState.getOpen(key); }
    setUIOpen(key: string, value: boolean) { this.mutate(() => { this._uiState.setOpen(key, value); }); }
    translateSelection(x: number, y: number) {
        if (x === 0 && y === 0) return;
        this.mutate(() => {
            (this.selection as Selection).translate(x, y);
        });
    }
    squareSelection() { this.mutate(() => { (this.selection as Selection).square(); }); }
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
    setCursorX(value: number) {
        this.mutate(() => { this._machine.cursor.x = value; });
    }
    setCursorY(value: number) {
        this.mutate(() => { this._machine.cursor.y = value; });
    }
    setCursorXSpeed(value: number) {
        this.mutate(() => { this._machine.cursor.xSpeed = value; });
    }
    setCursorYSpeed(value: number) {
        this.mutate(() => { this._machine.cursor.ySpeed = value; });
    }
    insertCode(rowIndex: number, colIndex: number, text: string, overwrite: boolean) {
        this.mutate(() => { this._codeSpace.insert(rowIndex, colIndex, text, this._spaceFillChar, overwrite); });
    }
    insertCodeVertical(rowIndex: number, colIndex: number, text: string) {
        this.mutate(() => { this._codeSpace.insertVertical(rowIndex, colIndex, text, this._spaceFillChar); });
    }
    insertChunkCode(rowIndex: number, colIndex: number, text: string, pushDown: boolean, overwrite: boolean) {
        this.mutate(() => { this._codeSpace.insertChunk(rowIndex, colIndex, text, this._spaceFillChar, pushDown, overwrite); });
    }
    insertChunkSmartCode(rowIndex: number, colIndex: number, text: string, overwrite: boolean) {
        this.mutate(() => { this._codeSpace.insertChunkSmart(rowIndex, colIndex, text, this._spaceFillChar, overwrite); });
    }
    peelCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.paint(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    shrinkCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.shrink(rowIndex, colIndex, width, height); });
    }
    invertHCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.invertH(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    invertVCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.invertV(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    rotateCWCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.rotateCW(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    rotateCCWCode(rowIndex: number, colIndex: number, width: number, height: number) {
        this.mutate(() => { this._codeSpace.rotateCCW(rowIndex, colIndex, width, height, this._spaceFillChar); });
    }
    ensureCodeRowWidth(rowIndex: number, width: number) {
        this.mutate(() => { this._codeSpace.ensureLineWidth(rowIndex, width, this._spaceFillChar); });
    }
    joinCodeRows(rowIndex: number, height: number) { this.mutate(() => { this._codeSpace.joinRows(rowIndex, height); }); }
    deleteCodeRows(rowIndex: number, height: number) { this.mutate(() => { this._codeSpace.deleteRows(rowIndex, height); }); }
    divideAndCarryCode(rowIndex: number, colIndex: number, height: number) {
        this.mutate(() => { this._codeSpace.divideAndCarryLines(rowIndex, colIndex, height); });
    }
    init(content?: string) {
        this.mutate(() => {
            this.stop();
            if (content != null) {
                this._codeSpace = CodeSpace.fromText(content);
            }
            this.runningOptions = { output: '' };
            this._machine = new Aheui.Machine(this._codeSpace);
            this._machine.input = type => {
                if (this.runningOptions.inputMethod === 'modal') {
                    // TODO: naheui Machine의 input 메서드에서
                    // Promise를 반환해도 되도록 고치기.
                    // 고치고나서 prompt 쓰는 대신 직접 모달 렌더링하기.
                    const promptMessage =
                        (type === 'number') ?
                        '숫자를 입력하세요. 실행을 멈추려면 !!!를 입력하세요.' :
                        '글자를 입력하세요. 실행을 멈추려면 !!!를 입력하세요.';
                    const promptResult = prompt(promptMessage) + '';
                    if (promptResult === '!!!') {
                        this.stop();
                        return -1;
                    }
                    const input =
                        (type === 'number') ?
                        parseInt(promptResult) :
                        promptResult.charCodeAt(0);
                    return isNaN(input) ? -1 : input;
                } else {
                    const givenInput = this.runningOptions.givenInput!;
                    let input: number;
                    let left = givenInput;
                    switch (type) {
                    case 'number':
                        const match = /^[-+]?\d+/.exec(givenInput);
                        if (match) {
                            left = givenInput.substr(match[0].length);
                            input = parseInt(match[0]);
                        } else {
                            input = -1;
                        }
                        break;
                    case 'character':
                        const codePoint = givenInput.codePointAt(0);
                        if (codePoint != null) {
                            input = codePoint;
                            left = givenInput.substr(String.fromCodePoint(input).length);
                        } else {
                            input = -1;
                        }
                        break;
                    default: throw new Error('never reach here');
                    }
                    this.runningOptions = { givenInput: left };
                    return isNaN(input) ? -1 : input;
                }
            };
            this._machine.output = value => {
                const { output } = this.runningOptions;
                this.runningOptions = { output: output! + value };
            };
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
            this._machine.terminated = false;
            this._runner = () => {
                if (this._runner) this.step();
                if (this._runner) window.requestAnimationFrame(this._runner);
            };
            this._runner();
        });
    }
    stop() {
        if (!this.isRunning) return;
        this.mutate(() => {
            this._runner = null;
        });
    }
    dump() {
        return this._machine.dump();
    }
    step() {
        this.mutate(() => {
            const machine = this._machine;
            const path = this._path;
            const { cp, f } = path.lastMoment;
            Object.assign(path.lastMoment, Moment.fromMachineState(
                this._machine,
                this._codeSpace,
                cp,
                f,
            ));
            const stepResult = machine.step();
            if (stepResult.cursorMoveResult) {
                const path = this._path;
                const r = stepResult.cursorMoveResult
                const cp =
                    (Math.abs(r.xSpeed) < 2) &&
                    (Math.abs(r.ySpeed) < 2) &&
                    !r.xWrapped &&
                    !r.yWrapped;
                Object.assign(path.lastMoment, {
                    o: new Vec2(r.xSpeed, r.ySpeed),
                    cn: cp,
                });
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
    toggleBreakPoint() {
        this.mutate(() => {
            const { cursor } = this._machine;
            this._codeSpace.toggleBreakPoint(cursor.x, cursor.y);
        });
    }
}

// stores trivial states
class UIState {
    private _open: { [key: string]: boolean };
    constructor() {
        this._open = {
            'file.save': true,
            'file.load': true,
            'edit.inputMethod': true,
            'edit.rotateAndFlip': true,
            'state.cursor': true,
            'state.storage.아': true, // 아~앟
            'io.input': true,
            'io.output': true,
            'modal.saveAsGist': false,
        };
    }
    getOpen(key: string) { return !!this._open[key]; }
    setOpen(key: string, value: boolean) { this._open[key] = !!value; }
}

class EditOptions {
    inputMethod: 'insert' | 'overwrite';
    inputDirection: 'horizontal' | 'vertical';
    constructor() {
        this.inputMethod = 'insert';
        this.inputDirection = 'horizontal';
    }
}

class RunningOptions {
    inputMethod: 'modal' | 'given';
    givenInput: string;
    output: string;
    constructor() {
        this.inputMethod = 'modal';
        this.givenInput = '';
        this.output = '';
    }
}

export class Selection {
    private _anchor: Vec2;
    private _focus: Vec2;
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
    translate(x: number, y: number) {
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

@cloneable<typeof Code>()
export class Code implements Cloneable<Code> {
    // Cloneable
    clone: () => Code;
    // Code
    private _char: string;
    private _cho: number;
    private _jung: number;
    private _jong: number;
    private _isComment: boolean;
    breakPoint: boolean;
    constructor(char: string, breakPoint: boolean = false) {
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
    _mapJung(table: { [jung: number]: number }) {
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
    static isComment(cho: number, jung: number) {
        return (
            significantChoIndices.indexOf(cho) === -1 &&
            significantJungIndices.indexOf(jung) === -1
        );
    }
}

@cloneable<typeof CodeLine>()
export class CodeLine extends Array<Code> implements Cloneable<CodeLine> {
    // Cloneable
    clone: () => CodeLine;
    // CodeLine
    constructor(length: number);
    constructor() {
        super(...arguments);
        Object.setPrototypeOf(this, CodeLine.prototype);
    }
    static fromText(text: string) {
        const result = new CodeLine(text.length);
        for (let i = 0; i < text.length; ++i) {
            result[i] = new Code(text[i], false);
        }
        return result;
    }
    isEmptyAfter(index: number, spaceChars: Set<string>) {
        for (let i = index; i < this.length; ++i) {
            if (!spaceChars.has(this[i].char)) {
                return false;
            }
        }
        return true;
    }
    ensureLength(length: number, spaceFillChar: string) {
        while (this.length < length) this.push(new Code(spaceFillChar, false));
    }
    insert(
        index: number,
        text: string,
        spaceFillChar: string,
        overwrite: boolean,
    ) {
        if (text.length === 0) return;
        if (/\r|\n/.test(text)) {
            throw new Error('CodeLine 안에 개행문자가 들어오면 안됨');
        }
        this.ensureLength(index, spaceFillChar);
        const codes = text.split('').map(char => new Code(char, false));
        this.splice(index, overwrite ? codes.length : 0, ...codes);
    }
    paint(index: number, length: number, paintChar: string) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i] = new Code(paintChar, false);
        }
    }
    divide(index: number) {
        const tail = this.slice(index);
        this.length = Math.min(this.length, index);
        console.assert(tail instanceof CodeLine);
        return tail;
    }
    shrink(index: number, length: number) {
        if (length < 1) return;
        this.splice(index, length);
    }
    invertH(index: number, length: number, jungConv: boolean = true) {
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
    invertV(index: number, length: number) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].invertV();
        }
    }
    rotateCW(index: number, length: number) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].rotateCW();
        }
    }
    rotateCCW(index: number, length: number) {
        if (length < 1) return;
        if (this.length <= index) return;
        const to = Math.min(this.length, index + length);
        for (let i = index; i < to; ++i) {
            this[i].rotateCCW();
        }
    }
    toString(selection?: Selection) {
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
@cloneable<typeof CodeSpace>()
export class CodeSpace
    extends Array<CodeLine>
    implements
        MutationManager,
        Cloneable<CodeSpace> {
    // MutationManager
    stateId: number;
    mutate: (executor: Executor) => void;
    onMutate?: () => void;
    // Cloneable
    clone: () => CodeSpace;
    // CodeSpace
    private _width: number;
    constructor(length: number);
    constructor() {
        super(...arguments);
        this._width = 0;
        Object.setPrototypeOf(this, CodeSpace.prototype);
    }
    ensureHeight(height: number) {
        if (this.length >= height) return;
        this.mutate(() => {
            while (this.length < height) this.push(new CodeLine(0));
        });
    }
    ensureLineWidth(rowIndex: number, width: number, spaceFillChar: string) {
        this.ensureHeight(rowIndex + 1);
        const codeLine = this[rowIndex];
        if (codeLine.length >= width) return;
        this.mutate(() => {
            codeLine.ensureLength(width, spaceFillChar);
        });
    }
    ensureRect(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        spaceFillChar: string,
    ) {
        const bottom = rowIndex + height;
        for (let i = rowIndex; i < bottom; ++i) {
            this.ensureLineWidth(i, width + colIndex, spaceFillChar);
        }
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
    get(x: number, y: number) {
        const line = this[y];
        if (line) {
            const code = line[x];
            return code || null;
        }
        return null;
    }
    getIndex(x: number, y: number) {
        if (y >= this.length) return this.codeLength;
        let sum = y;
        for (let i = 0; i < y; ++i) sum += this[i].length;
        sum += (x > this[y].length) ? this[y].length : x;
        return sum;
    }
    getLineWidth(rowIndex: number) {
        const line = this[rowIndex];
        return line ? line.length : 0;
    }
    insert(
        rowIndex: number,
        colIndex: number,
        text: string,
        spaceFillChar: string,
        overwrite: boolean,
    ) {
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
    insertVertical(
        rowIndex: number,
        colIndex: number,
        text: string,
        spaceFillChar: string,
    ) {
        if (text.length === 0) return;
        this.mutate(() => {
            const _text = text.replace(/\r?\n/g, spaceFillChar);
            this.ensureHeight(rowIndex + _text.length);
            for (let i = 0; i < _text.length; ++i) {
                const char = _text[i];
                const codeLine = this[rowIndex + i];
                codeLine.insert(colIndex, char, spaceFillChar, true);
                if (codeLine.length > this._width) {
                    this._width = codeLine.length;
                }
            }
        });
    }
    insertChunk(
        rowIndex: number,
        colIndex: number,
        text: string,
        spaceFillChar: string,
        pushDown: boolean,
        overwrite: boolean,
    ) {
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
                    const codeLine = this[rowIndex + i];
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
                    let codeLine = new CodeLine(0);
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
    insertChunkSmart(
        rowIndex: number,
        colIndex: number,
        text: string,
        spaceFillChar: string,
        overwrite: boolean,
    ) {
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
    paint(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        paintChar: string,
    ) {
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
    shrink(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
    ) {
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
            if (this.length === 0) this.push(new CodeLine(0));
            this._recalculateWidth();
        });
    }
    invertH(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        spaceFillChar: string,
    ) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            this.ensureRect(rowIndex, colIndex, width, height, spaceFillChar);
            for (let r = 0; r < height; ++r) {
                const codeLine = this[rowIndex + r];
                if (!codeLine) break;
                codeLine.invertH(colIndex, width);
            }
        });
    }
    invertV(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        spaceFillChar: string,
    ) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        this.mutate(() => {
            this.ensureRect(rowIndex, colIndex, width, height, spaceFillChar);
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
    rotateCW(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        spaceFillChar: string,
    ) {
        // rotateCW : invertXY then invertH
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        if (width != height) return;
        this.mutate(() => {
            this.ensureRect(rowIndex, colIndex, width, height, spaceFillChar);
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
    rotateCCW(
        rowIndex: number,
        colIndex: number,
        width: number,
        height: number,
        spaceFillChar: string,
    ) {
        // rotateCW : invertH then invertXY
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this.length <= rowIndex) return;
        if (width != height) return;
        this.mutate(() => {
            this.ensureRect(rowIndex, colIndex, width, height, spaceFillChar);
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
    joinRows(
        rowIndex: number,
        height: number,
    ) { // TODO: 테스트 짜야겠다
        if (this.length <= rowIndex) return;
        const _height = Math.min(height, this.length - rowIndex);
        if (_height < 2) return;
        this.mutate(() => {
            this[rowIndex] = this[rowIndex].concat(
                ...this.slice(rowIndex + 1, rowIndex + _height)
            ) as CodeLine;
            this.deleteRows(rowIndex + 1, _height - 1);
            // width 계산은 deleteRows에서 일어남
        });
    }
    deleteRows(
        rowIndex: number,
        height: number = 1,
    ) {
        if (height < 1) return;
        this.mutate(() => {
            this.splice(rowIndex, height);
            this._recalculateWidth();
        });
    }
    divideAndCarryLines(
        rowIndex: number,
        colIndex: number,
        height: number,
    ) {
        this.mutate(() => {
            this.ensureHeight(rowIndex + height);
            const tails = this.slice(rowIndex, rowIndex + height).map(
                codeLine => codeLine.divide(colIndex) as CodeLine
            );
            this.splice(rowIndex + height, 0, ...tails);
            this._recalculateWidth();
        });
    }
    toggleBreakPoint(_x: number, _y: number) {
        // TODO
    }
    toString(selection?: Selection) {
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
    static fromText(text: string) {
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
            result.push(new CodeLine(0));
        }
        return result;
    }
}

type ChangeListener = () => void;

class ChangeDispatcher {
    private _listeners: ChangeListener[];
    private __listeners: ChangeListener[];
    parent: ChangeDispatcher | null;
    constructor(parent: ChangeDispatcher | null = null) {
        this.parent = parent;
        this._listeners = [];
        this.__listeners = this._listeners;
    }
    dispatch() {
        this._listeners = this.__listeners;
        for (let listener of this._listeners) listener.call(null);
    }
    addListener(listener: ChangeListener) {
        if (this.__listeners === this._listeners) {
            this.__listeners = [...this._listeners];
        }
        this.__listeners.push(listener);
    }
    removeListener(listener: ChangeListener) {
        if (this.__listeners === this._listeners) {
            this.__listeners = [...this._listeners];
        }
        const index = this.__listeners.indexOf(listener);
        if (index === -1) return;
        this.__listeners.splice(index, 1);
    }
}

type Diff<T extends string, U extends string> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<Extract<keyof T, string>, Extract<K, string>>>;

type ReactComponent<T> = React.ComponentClass<T> | React.SFC<T>;

interface Connect<TOwnProps extends TInjectedProps, TInjectedProps> {
    (Container: ReactComponent<TOwnProps>): React.ComponentClass<Omit<TOwnProps, keyof TInjectedProps>>;
}

export function connect<
    TOwnProps extends TInjectedProps,
    TInjectedProps={ appState: AppState }
>(mapStateToProps: (appState: AppState) => TInjectedProps): Connect<TOwnProps, TInjectedProps> {
    interface Context {
        changeDispatcher: ChangeDispatcher;
        appState: AppState;
    }
    void mapStateToProps;
    return (
        Container: ReactComponent<TOwnProps>,
    ) => class Connect extends React.Component<TOwnProps> {
        ref: typeof Container | null;
        changeDispatcher: ChangeDispatcher;
        constructor(props: TOwnProps, context: Context) {
            super(props, context);
            this.state = {};
            this.ref = null;
            this.changeDispatcher = new ChangeDispatcher(
                context.changeDispatcher ||
                context.appState.changeDispatcher
            );
        }
        componentDidMount() {
            (this.changeDispatcher as any).call = () => {
                this.setState({});
                this.changeDispatcher.dispatch();
            }
            this.changeDispatcher.parent!.addListener(
                this.changeDispatcher as any as ChangeListener,
            );
        }
        componentWillUnmount() {
            (this.changeDispatcher as any).call = null;
            this.changeDispatcher.parent!.removeListener(
                this.changeDispatcher as any as ChangeListener,
            );
        }
        getChildContext() {
            return {
                appState: this.context.appState,
                changeDispatcher: this.changeDispatcher,
            };
        }
        render() {
            return React.createElement(Container as any, {
                ...this.props as any,
                ref: (ref: typeof Container | null) => this.ref = ref,
                ...(mapStateToProps as any)(this.context.appState),
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
    } as any;
}
