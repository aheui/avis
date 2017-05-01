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
        const { classList } = this.caretElement;
        if (classList.contains(style.caret)) {
            classList.remove(style.caret);
            this.caretElement.offsetHeight; // 강제 리플로우 트리거
            classList.add(style.caret);
        }
    }
    scrollToFocus() {
        const { appState } = this.props;
        let { scrollTop, scrollLeft, clientWidth, clientHeight } = this.scrollElement;
        const [ scrollBottom, scrollRight ] = [scrollTop + clientHeight, scrollLeft + clientWidth];
        const { focus } = appState.selection;
        const [ focusTop, focusLeft ] = [ focus.y * 30, focus.x * 30 ];
        const [ focusBottom, focusRight ] = [ focusTop + 30, focusLeft + 30 ];
        if (scrollTop > focusTop) scrollTop = focusTop;
        if (scrollBottom < focusBottom) scrollTop = focusBottom - clientHeight;
        if (scrollLeft > focusLeft) scrollLeft = focusLeft;
        if (scrollRight < focusRight) scrollLeft = focusRight - clientWidth;
        Object.assign(this.scrollElement, { scrollTop, scrollLeft });
        this.props.onScroll({ scrollTop, scrollLeft });
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
                    let key = e.key;
                    // 맥 크롬57에서 방향키 입력시 캐럿이 이동한 위치에 코드가 입력되고 캐럿이 추가이동되는 문제 우회용.
                    // composition 중에 방향키(composition 상태를 빠져나오는 키) 입력시 keydown이 두 번 호출되는데, (참고로 change 이벤트도 이 사이에 한 번 더 호출된다)
                    // 처음 이벤트의 `e.isComposing` 속성값은 `true`이고, 두번째 이벤트의 `e.isComposing` 속성값은 `false`다.
                    // 윈도 크롬57에서는 `e.isComposing`이 `true`일 때 `e.key`가 `"Process"`로 들어있어서 문제가 발생하지 않았고,
                    // 맥 크롬57에서는 `e.key`에 해당 키의 값(예: `"ArrowRight"`)가 그대로 들어있어서 선술한 문제가 발생하였다.
                    // 따라서 아래의 조건문과 같이 우회한다. `e.isComposing`을 바로 접근하지 않고 `e.nativeEvent.isComposing`을 바라보는 이유는
                    // react 15에서 이벤트의 `isComposing` 속성을 감춰버리기 때문에 네이티브 이벤트에 직접 접근할 필요가 있기 때문이다.
                    if (e.nativeEvent.isComposing) {
                        key = 'Process';
                    }
                    handleInputKeyDown(
                        key,
                        { ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey },
                        this.inputElement.value,
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                        () => this.scrollToFocus(),
                    );
                }}
                onChange={e => {
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
    { ctrl, shift, alt, meta },
    inputValue,
    appState,
    clearInputValue,
    resetCaretAnimation,
    scrollToFocus,
) {
    const inputLength = inputValue.length;
    switch (key) {
    case 'Backspace':
        if (!inputLength) {
            const { selection } = appState;
            const { x, y } = selection;
            if (selection.isCaret) {
                if (x !== 0) {
                    appState.shrinkCode(y, x - 1, 1, 1);
                    appState.translateSelection(-1, 0);
                } else if (y !== 0) {
                    appState.translateSelection(0, -1);
                    const { y } = appState.selection;
                    appState.caret = { x: appState.codeSpace[y].length };
                    appState.joinCodeRows(y, 2);
                }
                resetCaretAnimation();
            } else {
                appState.shrinkCode(
                    appState.selection.y,
                    appState.selection.x,
                    appState.selection.width,
                    appState.selection.height,
                );
                appState.caret = {};
            }
            scrollToFocus();
        }
        return;
    case 'Enter':
        {
            const { x, y, height } = appState.selection;
            appState.divideAndCarryCode(y, x + inputLength, height);
            appState.translateSelection(-x, height);
            clearInputValue();
            resetCaretAnimation();
            scrollToFocus();
            return;
        }
    case 'ArrowUp': moveCaret(0, -1, shift); return;
    case 'ArrowDown': moveCaret(0, 1, shift); return;
    case 'ArrowLeft': moveCaret(-1, 0, shift); return;
    case 'ArrowRight': moveCaret(1, 0, shift); return;
    case 'Home': setCaret(0, null, shift); return;
    case 'End':
        {
            const { x, y } = appState.selection;
            const lineWidth = appState.codeSpace.getLineWidth(y);
            if (x < lineWidth) setCaret(lineWidth, null, shift);
            return;
        }
    }
    function setCaret(x, y, extend) {
        if (extend) {
            appState.selection = { focus: { x, y } };
        } else {
            appState.caret = { x, y };
        }
        clearInputValue();
        resetCaretAnimation();
        scrollToFocus();
    }
    function moveCaret(dx, dy, extend) {
        const { x, y } = appState.selection.focus;
        setCaret(
            x + inputLength + dx,
            y + dy,
            extend,
        );
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
    appState.caret = {};
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
