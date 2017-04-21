import React from 'react';
import Aheui from 'naheui';

const defaultSpaceChar = '\u3000';

export class AppState {
    constructor({ content }) {
        this._stateId = 0;
        this._changDispatcher = new ChangeDispatcher();
        this._selection = new Selection();
        this._codeSpace = CodeSpace.fromText(content || '');
        this._machine = new Aheui.Machine(this._codeSpace);
        this._pathTrace = new PathTrace();
        this._intervalId = null;
        this._interval = 1;
    }
    get changeDispatcher() { return this._changDispatcher; }
    get cursorOnBreakPoint() {
        const { cursor } = this._machine;
        const code = this._codeSpace.get(cursor.x, cursor.y);
        return !!code && code.breakPoint;
    }
    get selection() {
        return this._selection;
    }
    set selection({ anchor, focus }) {
        if (anchor) {
            this._selection.anchor.x = anchor.x | 0;
            this._selection.anchor.y = anchor.y | 0;
        }
        if (focus) {
            this._selection.focus.x = focus.x | 0;
            this._selection.focus.y = focus.y | 0;
        }
        this.dispatch();
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
        if (this.isRunning) {
            window.clearInterval(this._intervalId);
            this._intervalId = window.setInterval(() => this.step(), value);
        }
        this._interval = value;
        this.dispatch();
    }
    get stateId() { return this._stateId; }
    dispatch() {
        ++this._stateId;
        this._changDispatcher.dispatch();
    }
    init() {
        this.stop();
        this.dispatch();
    }
    run() {
        if (this.isRunning) return;
        this._machine.terminateFlag = false;
        this._intervalId = window.setInterval(() => this.step(), this._interval);
        this.dispatch();
    }
    stop() {
        if (this.isRunning) {
            window.clearInterval(this._intervalId);
        }
        this._intervalId = null;
        this.dispatch();
    }
    dump() {
        return this._machine.dump();
    }
    step() {
        const machine = this._machine;
        const pathTrace = this._pathTrace;
        const { cursor, storage } = machine;
        pathTrace.push(cursor.x, cursor.y);
        machine.step();
        if (machine.terminated || this.cursorOnBreakPoint) {
            this.stop();
        }
        this.dispatch();
    }
    toggleBreakPoint(x, y) {
        const { cursor } = this._machine;
        const code = this._codeSpace.get(cursor.x, cursor.y);
        if (code) {
            code.breakPoint != code.breakPoint;
        }
    }
}

class Selection {
    constructor(anchor = { x: 0, y: 0 }, focus = { x: 0, y: 0 }) {
        this.anchor = anchor;
        this.focus = focus;
    }
    get isCaret() { return (this.width === 1) && (this.height === 1); }
    get x() { return Math.min(this.anchor.x, this.focus.x); }
    get y() { return Math.min(this.anchor.y, this.focus.y); }
    get width() { return Math.abs(this.anchor.x - this.focus.x) + 1; }
    get height() { return Math.abs(this.anchor.y - this.focus.y) + 1; }
}

class Code {
    constructor(char, breakPoint = false) {
        this._cho = -1;
        this._jung = -1;
        this._jong = -1;
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
    }
    get cho() { return this._cho; }
    get jung() { return this._jung; }
    get jong() { return this._jong; }
    toString() {
        return this.char;
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
    toString() {
        return this.map(code => code.toString()).join('');
    }
}

class CodeSpace extends Array {
    constructor(...args) {
        super(...args);
        this._width = 0;
    }
    get(x, y) {
        const line = this[y];
        if (line) {
            const code = line[x];
            return code || null;
        }
        return null;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this.length;
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
