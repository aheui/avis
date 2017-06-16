import React from 'react';
import classNames from 'classnames';

import { connect } from '../../appState';
import CodeSpaceStateViewer from '../CodeSpaceStateViewer';
import * as keyboard from '../../misc/keyboard';
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
            inputFocus: false,
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
        const { appState } = this.props;
        const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
        appState.selection = { focus: this.getCellPosFromMousePos(mouseX, mouseY) };
        this.scrollToFocus();
        if (keyboard.key('shift')) appState.squareSelection();
    }
    removeMouseDragEventListeners() {
        window.removeEventListener('mouseup', this.mouseDragUpHandler, true);
        window.removeEventListener('mousemove', this.mouseDragMoveHandler, true);
        keyboard.off('Shift', this.mouseDragShift);
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
        this.mouseDragUpHandler = e => {
            this.focusInputElement();
            this.onMouseDragUp(e);
        };
        this.mouseDragMoveHandler = e => this.throttled.set(this.onMouseDragMove, [e]);
        this.mouseDragShift = down => this.props.appState.squareSelection();
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
    focusInputElement() {
        this.inputElement.focus();
        this.setState({ inputFocus: true });
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
            compositing, inputFocus,
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
            className={classNames(style.codeSpaceScroll, {
                [style.focus]: inputFocus || mouseDown,
            })}
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
                    window.addEventListener('mouseup', this.mouseDragUpHandler, true);
                    window.addEventListener('mousemove', this.mouseDragMoveHandler, true);
                    keyboard.on('Shift', this.mouseDragShift);
                }
                appState.selection = { anchor: cellPos, focus: cellPos };
                this.clearInputValue();
                this.resetCaretAnimation();
            }}
            onMouseUpCapture={e => {
                this.focusInputElement();
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
            <div className={classNames(style.cursor, {
                [style.onBreakPoint]: false,
            })} style={{
                top: `${ 30 * appState.cursor.y }px`,
                left: `${ 30 * appState.cursor.x }px`,
            }}>
                <svg viewBox="0 0 30 30" width="30" height="30">
                    <rect className={style.cursorRect} x="3" y="3" width="24" height="24"/>
                    <rect className={style.cursorDeco} x="3" y="3" width="24" height="24"/>
                </svg>
            </div>
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
                        this.inputElement.value,
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                        () => this.scrollToFocus(),
                        () => e.preventDefault(),
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
                onBlur={() => this.setState({
                    compositing: false,
                    inputFocus: false,
                })}
                onFocus={() => this.setState({
                    inputFocus: true,
                })}
                onCopy={e => {
                    const { appState: { codeSpace, selection } } = this.props;
                    e.preventDefault();
                    // 복사되는 내용을 현재 선택영역의 문자열 값으로 바꿈
                    e.clipboardData.setData(
                         'text/plain',
                         codeSpace.toString(selection)
                    );
                }}
                onCut={e => {
                    const { appState: { codeSpace, selection } } = this.props;
                    e.preventDefault();
                    // 복사되는 내용을 현재 선택영역의 문자열 값으로 바꿈
                    e.clipboardData.setData(
                         'text/plain',
                         codeSpace.toString(selection)
                    );
                    handleInputCut(
                        this.inputElement.value,
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                        () => this.scrollToFocus(),
                    );
                }}
                onPaste={e => {
                    // 다른 브라우저들과 파이어폭스 22+에서 지원하고 있어서
                    // 파이어폭스 22 미만을 지원하려면 다른 방법도 구현해야 함
                    let clipboardData, pastedData;
                    e.preventDefault();
                    clipboardData = e.clipboardData || window.clipboardData;
                    pastedData = clipboardData.getData('Text');
                    handleInputPaste(
                        this.inputElement.value,
                        pastedData.trim(),
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                        () => this.scrollToFocus(),
                    );
                }}
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
    scrollToFocus,
    preventDefault,
) {
    const inputLength = inputValue.length;
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const { control, shift } = keyboard.keys('Control', 'Shift');
    const del = (...args) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](...args);
    };
    switch (key) {
    case 'a':
        if (control) {
            clearInputValue();
            appState.selectAll();
        }
        return;
    case 'Backspace':
        if (!inputLength) {
            const { selection } = appState;
            const { x, y } = selection;
            if (selection.isCaret) {
                if (overwriteMode) {
                    if (x !== 0) {
                        appState.peelCode(y, x - 1, 1, 1);
                        appState.translateSelection(-1, 0);
                    }
                } else {
                    if (x !== 0) {
                        appState.shrinkCode(y, x - 1, 1, 1);
                        appState.translateSelection(-1, 0);
                    } else if (y !== 0) {
                        appState.translateSelection(0, -1);
                        // selection이 변경되었으므로 y값을 새로 가져와야함
                        const { y } = appState.selection;
                        appState.caret = { x: appState.codeSpace.getLineWidth(y) };
                        appState.joinCodeRows(y, 2);
                    }
                }
                resetCaretAnimation();
            } else {
                delSelection();
            }
            scrollToFocus();
        }
        return;
    case 'Delete':
        if (inputLength) {
            const { x, y } = appState.selection;
            setCaret(x + inputLength, y, false);
        }
        {
            const { selection } = appState;
            const { x, y } = selection;
            if (selection.isCaret) {
                const { codeSpace } = appState;
                const lineWidth = codeSpace.getLineWidth(y);
                if (codeSpace.codeLength > codeSpace.getIndex(x, y)) {
                    if (overwriteMode) {
                        if (x < lineWidth) {
                            appState.peelCode(y, x, 1, 1);
                            appState.translateSelection(1, 0);
                        }
                    } else {
                        if (x >= lineWidth) {
                            appState.ensureCodeRowWidth(y, x);
                            appState.joinCodeRows(y, 2);
                        } else {
                            appState.shrinkCode(y, x, 1, 1);
                        }
                    }
                }
                resetCaretAnimation();
            } else {
                delSelection();
            }
        }
        return;
    case 'Insert':
        {
            const { inputMethod } = appState.editOptions;
            appState.editOptions = {
                inputMethod:
                    inputMethod === 'insert' ?
                    'overwrite' :
                    'insert'
            };
            preventDefault();
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
    case 'Home':
        setCaret(0, null, shift);
        preventDefault();
        return;
    case 'End':
        {
            const { x, y } = appState.selection;
            const lineWidth = appState.codeSpace.getLineWidth(y);
            if (x < lineWidth) setCaret(lineWidth, null, shift);
            preventDefault();
            return;
        }
    }
    function setCaret(x, y, extend) {
        if (extend) {
            if (inputLength) {
                const anchorX = appState.selection.anchor.x + inputLength;
                appState.selection = { anchor: { x: anchorX } };
            }
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
        setCaret(x + inputLength + dx, y + dy, extend);
    }
    function delSelection() {
        del(
            appState.selection.y,
            appState.selection.x,
            appState.selection.width,
            appState.selection.height,
        );
        appState.caret = {};
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
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const del = (...args) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](...args);
    };
    if (!appState.selection.isCaret) {
        del(
            appState.selection.y,
            appState.selection.x,
            appState.selection.width,
            appState.selection.height,
        );
    }
    appState.caret = {};
    if (inputLength < lastInputLength) {
        del(
            appState.selection.y,
            appState.selection.x + inputLength,
            lastInputLength - inputLength,
            1,
        );
    } else {
        del(
            appState.selection.y,
            appState.selection.x,
            lastInputLength,
            1,
        );
        appState.insertCode(
            appState.selection.y,
            appState.selection.x,
            inputValue.replace(/ /g, appState.spaceFillChar),
            overwriteMode,
        );
    }
    resetCaretAnimation();
}

function handleInputCut(
    inputValue,
    appState, 
    clearInputValue,
    resetCaretAnimation,
    scrollToFocus,
) {
    // 선택한 부분의 내용 전체를 삭제하면 됨 
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const del = (...args) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](...args);
    };
    del(
        appState.selection.y,
        appState.selection.x,
        appState.selection.width,
        appState.selection.height,
    );
    clearInputValue();
    resetCaretAnimation();
    scrollToFocus();
}

function handleInputPaste(
    inputValue,
    pasteValue,
    appState, 
    clearInputValue,
    resetCaretAnimation,
    scrollToFocus,
) {
    // 밀어쓰기 모드의 경우 붙여넣을 영역이 전부 빈 공간인지 확인하고,
    // 빈 공간이라면 해당 공간에 그대로 덮어쓰면 됨
    // 아니라면 붙여넣을 영역을 확보하기 위해 행과 열을 밀어낸 뒤 덮어 씀
    // 덮어쓰기 모드에서는 그대로 덮어쓰면 됨
    // TODO: 밀어쓰기 모드에서의 빈 공간 확보
    const inputLength = inputValue.length;
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const pasteLines = pasteValue.split(/\r?\n/);
    const pasteWidth = pasteLines.reduce(
        (prev, current) => Math.max(prev, current.length),
        0
    );
    const pasteHeight = pasteLines.length;
    appState.insertCode(
        appState.selection.y,
        appState.selection.x + inputLength,
        pasteValue,
        true
    );
    // 입력한 뒤 붙여넣은 텍스트를 선택 (엑셀의 동작)
    appState.selection = {
        anchor: {
            y: appState.selection.y + pasteHeight - 1,
            x: appState.selection.x + inputLength + pasteWidth - 1,
        },
        focus: {
            y: appState.selection.y,
            x: appState.selection.x + inputLength,
        }
    };
    clearInputValue();
    resetCaretAnimation();
    scrollToFocus();
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
