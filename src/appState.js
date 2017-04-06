import React from 'react';
import Aheui from 'naheui';


export class AppState {
    constructor({ content }) {
        this._listeners = [];
        this._codeSpace = CodeSpace.fromText(content || '');
        this._machine = new Aheui.Machine(this._codeSpace);
        this._pathTrace = new PathTrace();
        this._intervalId = null;
        this._interval = 1;
    }
    get cursorOnBreakPoint() {
        const { cursor } = this._machine;
        const cell = this._codeSpace.get(cursor.x, cursor.y);
        return !!cell && cell.breakPoint;
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
    dispatch() {
        for (let listener of this._listeners) listener();
    }
    listen(listener) {
        this._listeners.push(listener);
    }
    unlisten(listener) {
        const index = this._listeners.indexOf(listener);
        if (index === -1) return;
        this._listeners.splice(index, 1);
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
        const cell = this._codeSpace.get(cursor.x, cursor.y);
        if (cell) {
            cell.breakPoint != cell.breakPoint;
        }
    }
}

class Cell {
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
            result[i] = new Cell(text[i], false);
        }
        return result;
    }
    toString() {
        return this.map(cell => cell.toString()).join('');
    }
}

class CodeSpace extends Array {
    get(x, y) {
        const line = this[y];
        if (line) {
            const cell = line[x];
            return cell || null;
        }
        return null;
    }
    toString() {
        return this.map(line => line.toString()).join('\n');
    }
    static fromText(text) {
        const lines = text.split(/\r?\n/g);
        const result = new CodeSpace(lines.length);
        for (let i = 0; i < lines.length; ++i) {
            result[i] = CodeLine.fromText(lines[i]);
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

export function connect(mapStateToProps) {
    return Container => class Connect extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {};
            this.appState = context.appState;
            this.listener = () => this.setState({});
        }
        componentDidMount() {
            this.appState.listen(this.listener);
        }
        componentWillUnmount() {
            this.appState.unlisten(this.listener);
        }
        render() {
            return React.createElement(Container, {
                ...this.props,
                ...mapStateToProps(this.appState),
            }, null);
        }
        static contextTypes = {
            appState: React.PropTypes.object.isRequired,
        };
    };
}
