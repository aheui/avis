import React from 'react';
import classNames from 'classnames';

import { connect } from '../../appState';
import CodeSpaceStateViewer from '../CodeSpaceStateViewer';
import style from './style.css';

export default connect(
    appState => ({ appState }),
)(class CodeSpace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mouseOn: false,
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            ghostCaretX: 0,
            ghostCaretY: 0,
            codeSpaceX: 0,
            codeSpaceY: 0,
            compositing: false,
        };
        this.scrollElement = null;
        this.codeSpaceElement = null;
        this.caretElement = null;
        this.inputElement = null;
        this.lastInputValue = '';
        { // mousemove 이벤트 쓰로틀을 위한 속성
            this.raf = null;
            this.throttled = null;
        }
        { // ime hack을 위한 속성
            this.startComposition = false;
        }
    }
    onMouseDragUp(e) {
        this.setState({ mouseDown: false });
        this.removeMouseDragEventListeners();
    }
    onMouseDragMove(e) {
        const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
        const { appState } = this.props;
        const cellPos = this.getCellPosFromMousePos(mouseX, mouseY);
        appState.selection = { focus: cellPos };
    }
    removeMouseDragEventListeners() {
        window.removeEventListener('mouseup', this.mouseDragUpHandler, true);
        window.removeEventListener('mousemove', this.mouseDragMoveHandler, true);
    }
    componentDidMount() {
        this.throttled = new Map();
        this.raf = () => {
            try {
                for (let [handler, args] of this.throttled.entries()) {
                    if (args) {
                        handler.apply(this, args);
                        this.throttled.set(handler, null);
                    }
                }
            } finally {
                this.raf && window.requestAnimationFrame(this.raf);
            }
        };
        window.requestAnimationFrame(this.raf);
        this.updateCodeSpacePosition();
    }
    componentWillUnmount() {
        this.raf = null;
        this.removeMouseDragEventListeners();
    }
    updateCodeSpacePosition() {
        const { left, top } = this.codeSpaceElement.getBoundingClientRect();
        this.setState({
            codeSpaceX: left,
            codeSpaceY: top,
        });
    }
    getCellPosFromMousePos(
        mouseX,
        mouseY,
        codeSpaceX = this.state.codeSpaceX,
        codeSpaceY = this.state.codeSpaceY,
    ) {
        return {
            x: ((mouseX - codeSpaceX) / 30) | 0,
            y: ((mouseY - codeSpaceY) / 30) | 0,
        };
    }
    updateGhostCaret(mouseX, mouseY, mouseOn) {
        this.setState(({ codeSpaceX, codeSpaceY }) => {
            const cellPos = this.getCellPosFromMousePos(
                mouseX,
                mouseY,
                codeSpaceX,
                codeSpaceY,
            );
            return {
                mouseX, mouseY, mouseOn,
                ghostCaretX: cellPos.x,
                ghostCaretY: cellPos.y,
            };
        });
    }
    clearInputValue() {
        this.inputElement.value = '';
        this.lastInputValue = '';
    }
    resetCaretAnimation() {
        this.caretElement.classList.remove(style.caret);
        this.caretElement.offsetHeight; // 강제 리플로우 트리거
        this.caretElement.classList.add(style.caret);
    }
    render() {
        const { codeSpace, appState } = this.props;
        const { selection } = appState;
        const { isCaret } = selection;
        const {
            mouseOn, mouseDown,
            ghostCaretX, ghostCaretY,
            compositing,
        } = this.state;
        const inputText = this.inputElement ? this.inputElement.value : '';
        const caretX = selection.x + inputText.length - (compositing ? 1 : 0);
        const selectionBox = {
            top: selection.y * 30,
            left: caretX * 30,
            width: selection.width * 30,
            height: selection.height * 30,
        };
        return <div
            ref={scrollElement => this.scrollElement = scrollElement}
            className={style.codeSpaceScroll}
            onScroll={() => {
                this.updateCodeSpacePosition();
                this.updateGhostCaret(
                    this.state.mouseX,
                    this.state.mouseY,
                    this.state.mouseOn,
                );
                this.props.onScroll({
                    scrollTop: this.scrollElement.scrollTop,
                    scrollLeft: this.scrollElement.scrollLeft,
                });
            }}
            onMouseOverCapture={e => this.updateGhostCaret(e.clientX, e.clientY, true)}
            onMouseOutCapture={e => this.updateGhostCaret(e.clientX, e.clientY, false)}
            onMouseDownCapture={e => {
                const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
                const { mouseDown } = this.state;
                const cellPos = this.getCellPosFromMousePos(mouseX, mouseY);
                if (!mouseDown) {
                    this.setState({ mouseDown: true });
                    this.mouseDragUpHandler = e => this.onMouseDragUp(e);
                    this.mouseDragMoveHandler =
                        (...args) => this.throttled.set(this.onMouseDragMove, args);
                    window.addEventListener('mouseup', this.mouseDragUpHandler, true);
                    window.addEventListener('mousemove', this.mouseDragMoveHandler, true);
                }
                appState.selection = { anchor: cellPos, focus: cellPos };
                this.clearInputValue();
                this.resetCaretAnimation();
            }}
            onMouseUpCapture={e => {
                this.inputElement.focus();
            }}
            onMouseMoveCapture={e => {
                const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
                const { mouseOn } = this.state;
                this.throttled.set(
                    this.updateGhostCaret,
                    [mouseX, mouseY, mouseOn]
                );
            }}
        >
            <CodeSpaceStateViewer>
                <div
                    ref={codeSpaceElement => this.codeSpaceElement = codeSpaceElement}
                    className={style.codeSpace}
                    style={{
                        width: `calc(100% + ${ (codeSpace.width - 1) * 30 }px)`,
                        height: `calc(100% + ${ (codeSpace.height - 1) * 30 }px)`,
                    }}
                >
                    {
                        codeSpace.map(
                            (codeLine, index) =>
                            <CodeLine key={index} index={index} codeLine={codeLine}/>
                        )
                    }
                </div>
            </CodeSpaceStateViewer>
            <div
                className={classNames(style.ghostCaret, { [style.on]: mouseOn && !mouseDown })}
                style={{
                    top: ghostCaretY * 30,
                    left: ghostCaretX * 30,
                }}
            />
            <div
                className={classNames(style.selection, { [style.caret]: isCaret })}
                style={selectionBox}
                ref={caretElement => this.caretElement = caretElement}
            >
                { !isCaret && <svg
                    viewBox={`0 0 ${ selectionBox.width } ${ selectionBox.height }`}
                >
                    <rect
                        className={style.dash}
                        x="1.5" y="1.5"
                        width={ selectionBox.width - 3 }
                        height={ selectionBox.height - 3 }
                    />
                </svg> }
            </div>
            <input
                type="text"
                className={style.input}
                style={{
                    top: selectionBox.top,
                    left: selectionBox.left,
                }}
                ref={inputElement => this.inputElement = inputElement}
                onKeyDown={e => {
                    handleInputKeyDown(
                        e.key,
                        this.inputElement.value,
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                    );
                }}
                onChange={() => {
                    // compositionstart로부터 위임받은 상태 변경 처리
                    if (this.startComposition) {
                        this.setState({ compositing: true });
                        this.startComposition = false;
                    }
                    handleInputChange(
                        this.inputElement.value,
                        this.lastInputValue,
                        appState,
                        () => this.resetCaretAnimation(),
                    );
                    this.lastInputValue = this.inputElement.value;
                }}
                // compositionstart 후에 change 이벤트가 발생함.
                // compositionstart 시점은 아직 inputElement.value가 변하지 않은 시점.
                // inputElement.value에 변화가 온 다음에 렌더가 일어나야하기 때문에
                // compositionstart에서는 state를 바로 변경하지 않고
                // change 이벤트로 상태 변경을 위임
                onCompositionStart={() => this.startComposition = true}
                onCompositionEnd={() => this.setState({ compositing: false })}
                // edge에서는 composition 중에 blur되면 compositionend가 호출되지 않음.
                // 어차피 blur 되었으면 무조건 composition 상태가 아니므로
                // compositionend의 처리를 blur에서도 처리하는 식으로 우회
                onBlur={() => this.setState({ compositing: false })}
            />
        </div>;
    }
});

function handleInputKeyDown(
    key,
    inputValue,
    appState,
    clearInputValue,
    resetCaretAnimation,
) {
    const inputLength = inputValue.length;
    switch (key) {
    case 'Backspace':
        if (!inputValue.length) {
            const { selection } = appState;
            if (selection.isCaret) {
                if (selection.x === 0) return;
                appState.shrinkCode(
                    selection.y,
                    selection.x - 1,
                    1,
                    1,
                );
                appState.translateSelection(-1, 0);
                resetCaretAnimation();
            } else {
                appState.shrinkCode(
                    appState.selection.y,
                    appState.selection.x,
                    appState.selection.width,
                    appState.selection.height,
                );
                appState.collapseSelection();
            }
        }
        return;
    case 'ArrowUp': arrowKey(0, -1); return;
    case 'ArrowDown': arrowKey(0, 1); return;
    case 'ArrowLeft': arrowKey(-1, 0); return;
    case 'ArrowRight': arrowKey(1, 0); return;
    }
    function arrowKey(dx, dy) {
        appState.translateSelection(inputLength, 0);
        appState.translateSelection(dx, dy);
        appState.collapseSelection();
        clearInputValue();
        resetCaretAnimation();
    }
}

function handleInputChange(
    inputValue,
    lastInputValue,
    appState,
    resetCaretAnimation,
) {
    const inputLength = inputValue.length;
    const lastInputLength = lastInputValue.length;
    if (!appState.selection.isCaret) {
        appState.shrinkCode(
            appState.selection.y,
            appState.selection.x,
            appState.selection.width,
            appState.selection.height,
        );
    }
    appState.collapseSelection();
    if (inputLength < lastInputLength) {
        appState.shrinkCode(
            appState.selection.y,
            appState.selection.x + inputLength,
            lastInputLength - inputLength,
            1,
        );
    } else {
        appState.shrinkCode(
            appState.selection.y,
            appState.selection.x,
            lastInputLength,
            1,
        );
        appState.insertCode(
            appState.selection.y,
            appState.selection.x,
            inputValue,
            false,
        );
    }
    resetCaretAnimation();
}

const CodeLine = props => <div
    className={style.codeLine}
    style={{
        top: props.index * 30,
    }}
>
    {
        props.codeLine.map(
            (code, index) => <Cell key={index} index={index} code={code}/>
        )
    }
    <GhostCell index={props.codeLine.length}/>
</div>;

const Cell = props => <div
    className={classNames(style.cell, { [style.comment]: props.code.isComment })}
    style={{
        left: props.index * 30,
    }}
>
    { props.code.char }
</div>;

const GhostCell = props => <div
    className={classNames(style.cell, style.ghost)}
    style={{
        left: props.index * 30,
    }}
/>;
