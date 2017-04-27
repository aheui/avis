import React from 'react';
import Aheui from 'naheui';

const defaultSpaceFillChar = '\u3000';

export class AppState {
    constructor({ content }) {
        this._mutating;
        this._stateId = 0;
        this._changeDispatcher = new ChangeDispatcher();
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
    mutate(executor) {
        if (!this._mutating) {
            try {
                this._mutating = true;
                executor();
            } finally {
                this._mutating = false;
                ++this._stateId;
                this._changeDispatcher.dispatch();
            }
        } else {
            executor();
        }
    }
    translateSelection(x, y) {
        if (x === 0 && y === 0) return;
        this.mutate(() => {
            this.selection.translate(x, y);
        });
    }
    collapseSelection() {
        if (this._selection.isCaret) return;
        this.mutate(() => {
            const { x, y } = this._selection;
            const caret = { x, y };
            this.selection = { anchor: caret, focus: caret };
        });
    }
    insertCode(rowIndex, colIndex, text, overwrite) {
        this.mutate(() => {
            this._codeSpace.insert(rowIndex, colIndex, text, this._spaceFillChar);
        });
    }
    shrinkCode(rowIndex, colIndex, width, height) {
        this.mutate(() => {
            this._codeSpace.shrink(rowIndex, colIndex, width, height);
        });
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

class Selection {
    constructor(anchor = { x: 0, y: 0 }, focus = { x: 0, y: 0 }) {
        this.anchor = anchor;
        this.focus = focus;
    }
    get isCaret() { return (this.width === 1) && (this.height === 1); }
    get x() { return Math.min(this._anchor.x, this._focus.x); }
    get y() { return Math.min(this._anchor.y, this._focus.y); }
    get width() { return Math.abs(this._anchor.x - this._focus.x) + 1; }
    get height() { return Math.abs(this._anchor.y - this._focus.y) + 1; }
    get anchor() { return this._anchor; }
    set anchor(value) { this._anchor = { x: Math.max(value.x | 0, 0), y: Math.max(value.y | 0, 0) }; }
    get focus() { return this._focus; }
    set focus(value) { this._focus = { x: Math.max(value.x | 0, 0), y: Math.max(value.y | 0, 0) }; }
    translate(x, y) {
        this.anchor = { x: this.anchor.x + x, y: this.anchor.y + y };
        this.focus = { x: this.focus.x + x, y: this.focus.y + y };
    }
}

// ㄴㄷㄸㄹㅁㅂㅃㅅㅆㅈㅊㅌㅍㅎ
const significantChoIndices = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 17, 18];
// ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅢㅣ
const significantJungIndices = [0, 2, 4, 6, 8, 12, 13, 17, 18, 19, 20];

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
    insert(index, text, spaceFillChar, overwrite) {
        if (text.length === 0) return;
        if (/\r|\n/.test(text)) {
            throw new Error('CodeLine 안에 개행문자가 들어오면 안됨');
        }
        while (this.length < index) this.push(new Code(spaceFillChar, false));
        const codes = text.split('').map(char => new Code(char, false));
        this.splice(index, overwrite ? codes.length : 0, ...codes);
    }
    shrink(index, length) {
        if (length < 1) return;
        this.splice(index, length);
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
    get(x, y) {
        const line = this[y];
        if (line) {
            const code = line[x];
            return code || null;
        }
        return null;
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
    insert(rowIndex, colIndex, text, spaceFillChar, overwrite) {
        if (text.length === 0) return;
        this.mutate(() => {
            const textLines = text.split(/\r?\n/);
            const height = rowIndex + textLines.length;
            while (this.length < height) this.push(new CodeLine());
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
    shrink(rowIndex, colIndex, width, height) {
        if (width < 1 || height < 1) return;
        if (this._width <= colIndex || this._height <= rowIndex) return;
        this.mutate(() => {
            for (let i = 0; i < height; ++i) {
                const codeLine = this[rowIndex + i];
                if (!codeLine) return;
                codeLine.shrink(colIndex, width);
            }
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
