import * as React from 'react';
import * as classNames from 'classnames';

import {
    connect,
    AppState,
    CodeSpace,
    CodeLine,
    Code,
    Selection,
} from '../../appState';
import CodeSpaceStateViewer from '../CodeSpaceStateViewer';
import PathTrack from './PathTrack';
import { Vec2 } from '../../model/path';
import * as keyboard from '../../misc/keyboard';
import * as style from './style.css';

interface CodeSpaceProps {
    appState: AppState;
    codeSpace: CodeSpace;
    onScroll: (scroll: { scrollTop: number, scrollLeft: number }) => void;
}

interface CodeSpaceState {
    mouseOn: boolean;
    mouseDown: boolean;
    mouseX: number;
    mouseY: number;
    ghostCaretX: number;
    ghostCaretY: number;
    codeSpaceX: number;
    codeSpaceY: number;
    compositing: boolean;
    inputFocus: boolean;
}

export default connect<CodeSpaceProps>(
    appState => ({ appState }),
)(class CodeSpace extends React.Component<CodeSpaceProps, CodeSpaceState> {
    scrollElement: HTMLElement;
    codeSpaceElement: HTMLElement;
    caretElement: HTMLElement;
    inputElement: HTMLInputElement;
    lastInputValue: string;
    mouseDragUpHandler: (e: MouseEvent) => void;
    mouseDragMoveHandler: (e: MouseEvent) => void;
    mouseDragShift: () => void;
    // mousemove 이벤트 쓰로틀을 위한 속성
    raf: (() => void) | null;
    throttled: Map<(...args: any[]) => void, any[] | null>;
    // ime hack을 위한 속성
    startComposition: boolean;
    constructor(props: CodeSpaceProps) {
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
        this.lastInputValue = '';
    }
    onMouseDragUp(_e: MouseEvent) {
        this.setState({ mouseDown: false });
        this.removeMouseDragEventListeners();
    }
    onMouseDragMove(e: MouseEvent) {
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
                        // FIXME: delete 해야하지 않으려나
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
        this.mouseDragShift = () => this.props.appState.squareSelection();
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
        mouseX: number,
        mouseY: number,
        codeSpaceX = this.state.codeSpaceX,
        codeSpaceY = this.state.codeSpaceY,
    ) {
        return {
            x: ((mouseX - codeSpaceX) / 30) | 0,
            y: ((mouseY - codeSpaceY) / 30) | 0,
        };
    }
    updateGhostCaret(mouseX: number, mouseY: number, mouseOn: boolean) {
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
        const focus = appState.selection.focus!;
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
        const selection = appState.selection as Selection;
        const { isCaret } = selection;
        const {
            mouseOn, mouseDown,
            ghostCaretX, ghostCaretY,
            compositing, inputFocus,
        } = this.state;
        const { inputMethod, inputDirection } = appState.editOptions;
        const overwriteMode = inputMethod === 'overwrite';
        const verticalMode = overwriteMode && (inputDirection === 'vertical');
        const inputText = this.inputElement ? this.inputElement.value : '';
        const caretOffset = (pos: number): number => pos + inputText.length - (compositing ? 1 : 0);
        const selectionBox = {
            top: (verticalMode ? caretOffset(selection.y) : selection.y) * 30,
            left: (verticalMode ? selection.x : caretOffset(selection.x)) * 30,
            width: selection.width * 30,
            height: selection.height * 30,
        };
        return <div
            ref={scrollElement => this.scrollElement = scrollElement!}
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
            onMouseUpCapture={_e => {
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
            <PathTrack path={appState.path} codeSpace={codeSpace}/>
            <CodeSpaceStateViewer>
                <div
                    ref={codeSpaceElement => this.codeSpaceElement = codeSpaceElement!}
                    className={style.codeSpace}
                    style={{
                        width: `calc(100% + ${ (codeSpace.width - 1) * 30 }px)`,
                        height: `calc(100% + ${ (codeSpace.height - 1) * 30 }px)`,
                    }}
                >
                    {
                        codeSpace.map(
                            (codeLine, index) =>
                            <CellLine key={index} index={index} codeLine={codeLine}/>
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
                ref={caretElement => this.caretElement = caretElement!}
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
                ref={inputElement => this.inputElement = inputElement!}
                onKeyDown={e => {
                    let key = e.key;
                    // 맥 크롬57에서 방향키 입력시 캐럿이 이동한 위치에 코드가 입력되고 캐럿이 추가이동되는 문제 우회용.
                    // composition 중에 방향키(composition 상태를 빠져나오는 키) 입력시 keydown이 두 번 호출되는데, (참고로 change 이벤트도 이 사이에 한 번 더 호출된다)
                    // 처음 이벤트의 `e.isComposing` 속성값은 `true`이고, 두번째 이벤트의 `e.isComposing` 속성값은 `false`다.
                    // 윈도 크롬57에서는 `e.isComposing`이 `true`일 때 `e.key`가 `"Process"`로 들어있어서 문제가 발생하지 않았고,
                    // 맥 크롬57에서는 `e.key`에 해당 키의 값(예: `"ArrowRight"`)가 그대로 들어있어서 선술한 문제가 발생하였다.
                    // 따라서 아래의 조건문과 같이 우회한다. `e.isComposing`을 바로 접근하지 않고 `e.nativeEvent.isComposing`을 바라보는 이유는
                    // react 15에서 이벤트의 `isComposing` 속성을 감춰버리기 때문에 네이티브 이벤트에 직접 접근할 필요가 있기 때문이다.
                    if ((e.nativeEvent as any).isComposing) {
                        key = 'Process';
                    }
                    handleInputKeyDown(
                        key,
                        e.nativeEvent.code,
                        this.inputElement.value,
                        appState,
                        () => this.clearInputValue(),
                        () => this.resetCaretAnimation(),
                        () => this.scrollToFocus(),
                        () => e.preventDefault(),
                    );
                }}
                onChange={_e => {
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
                         codeSpace.toString(selection as Selection)
                    );
                }}
                onCut={e => {
                    const { appState: { codeSpace, selection } } = this.props;
                    e.preventDefault();
                    // 복사되는 내용을 현재 선택영역의 문자열 값으로 바꿈
                    e.clipboardData.setData(
                         'text/plain',
                         codeSpace.toString(selection as Selection)
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
                    const clipboardData = e.clipboardData || (window as any).clipboardData;
                    const pastedData = clipboardData.getData('Text');
                    e.preventDefault();
                    handleInputPaste(
                        this.inputElement.value,
                        pastedData,
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
    _key: string,
    keyCode: string,
    inputValue: string,
    appState: AppState,
    clearInputValue: () => void,
    resetCaretAnimation: () => void,
    scrollToFocus: () => void,
    preventDefault: () => void,
) {
    const inputLength = inputValue.length;
    const { inputMethod, inputDirection } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const verticalMode = overwriteMode && (inputDirection === 'vertical');
    const { control, shift } = keyboard.keys('Control', 'Shift');
    const del = (y: number, x: number, width: number, height: number) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](y, x, width, height);
    };
    switch (keyCode) {
    case 'KeyA':
        if (control) {
            clearInputValue();
            appState.selectAll();
        }
        return;
    case 'Backspace':
        if (!inputLength) {
            const selection = appState.selection as Selection;
            const { x, y } = selection;
            if (selection.isCaret) {
                if (overwriteMode) {
                    if (verticalMode) {
                        if (y !== 0) {
                            appState.peelCode(y - 1, x, 1, 1);
                            appState.translateSelection(0, -1);
                        }
                    } else {
                        if (x !== 0) {
                            appState.peelCode(y, x - 1, 1, 1);
                            appState.translateSelection(-1, 0);
                        }
                    }
                } else {
                    if (x !== 0) {
                        appState.shrinkCode(y, x - 1, 1, 1);
                        appState.translateSelection(-1, 0);
                    } else if (y !== 0) {
                        appState.translateSelection(0, -1);
                        // selection이 변경되었으므로 y값을 새로 가져와야함
                        const { y } = appState.selection as Selection;
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
            const { x, y } = appState.selection as Selection;
            setCaret(x + inputLength, y, false);
        }
        {
            const selection = appState.selection as Selection;
            const { x, y } = selection;
            if (selection.isCaret) {
                const { codeSpace } = appState;
                const lineWidth = codeSpace.getLineWidth(y);
                if (codeSpace.codeLength > codeSpace.getIndex(x, y)) {
                    if (overwriteMode) {
                        if (verticalMode) {
                            appState.peelCode(y, x, 1, 1);
                            appState.translateSelection(0, 1);
                        } else {
                            if (x < lineWidth) {
                                appState.peelCode(y, x, 1, 1);
                                appState.translateSelection(1, 0);
                            }
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
            const { x, y, height } = appState.selection as Selection;
            if (overwriteMode) {
                appState.translateSelection(0, height + inputLength);
            } else {
                appState.divideAndCarryCode(y, x + inputLength, height);
                appState.translateSelection(-x, height);
            }
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
            const { x, y } = appState.selection as Selection;
            const lineWidth = appState.codeSpace.getLineWidth(y);
            if (x < lineWidth) setCaret(lineWidth, null, shift);
            preventDefault();
            return;
        }
    }
    function setCaret(x: number, y: number | null, extend: boolean) {
        if (extend) {
            if (inputLength) {
                const anchorX = appState.selection!.anchor!.x + inputLength;
                appState.selection = { anchor: { x: anchorX } } as Selection;
            }
            appState.selection = { focus: { x, y } as Vec2 };
        } else {
            appState.caret = { x, y };
        }
        clearInputValue();
        resetCaretAnimation();
        scrollToFocus();
    }
    function moveCaret(dx: number, dy: number, extend: boolean) {
        const { x, y } = appState.selection.focus!;
        setCaret(x + inputLength + dx, y + dy, extend);
    }
    function delSelection() {
        const { y, x, width, height } = appState.selection as Selection;
        del(y, x, width, height);
        appState.caret = {};
    }
}

function handleInputChange(
    inputValue: string,
    lastInputValue: string,
    appState: AppState,
    resetCaretAnimation: () => void,
) {
    const inputLength = inputValue.length;
    const lastInputLength = lastInputValue.length;
    const { inputMethod, inputDirection } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const verticalMode = overwriteMode && (inputDirection === 'vertical');
    const del = (y: number, x: number, width: number, height: number) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](y, x, width, height);
    };
    const { y, x, width, height, isCaret } = appState.selection as Selection;
    if (!isCaret) {
        del(y, x, width, height);
    }
    appState.caret = {};
    if (inputLength < lastInputLength) {
        if (verticalMode) {
            del(y + inputLength, x, 1, lastInputLength - inputLength);
        } else {
            del(y, x + inputLength, lastInputLength - inputLength, 1);
        }
    } else {
        if (verticalMode) {
            del(y, x, 1, lastInputLength);
            appState.insertCodeVertical(
                y,
                x,
                inputValue.replace(/ /g, appState.spaceFillChar),
            );
        } else {
            del(y, x, lastInputLength, 1);
            appState.insertCode(
                y,
                x,
                inputValue.replace(/ /g, appState.spaceFillChar),
                overwriteMode,
            );
        }
    }
    resetCaretAnimation();
}

function handleInputCut(
    _inputValue: string,
    appState: AppState,
    clearInputValue: () => void,
    resetCaretAnimation: () => void,
    scrollToFocus: () => void,
) {
    // 선택한 부분의 내용 전체를 삭제하면 됨 
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const del = (y: number, x: number, width: number, height: number) => {
        appState[
            overwriteMode ?
            'peelCode' :
            'shrinkCode'
        ](y, x, width, height);
    };
    const { y, x, width, height } = appState.selection as Selection;
    del(y, x, width, height);
    clearInputValue();
    resetCaretAnimation();
    scrollToFocus();
}

function handleInputPaste(
    inputValueUntrimmed: string,
    pasteValue: string,
    appState: AppState,
    clearInputValue: () => void,
    resetCaretAnimation: () => void,
    scrollToFocus: () => void,
) {
    // 외부에서 가지고 올 때 \n은 자르되 공백은 자르면 안되므로 따로
    // 정규표현식으로 처리함
    const inputValue = inputValueUntrimmed.replace(/^[\r\n]+|[\r\n]+$/, '');
    const inputLength = inputValue.length;
    const { inputMethod } = appState.editOptions;
    const overwriteMode = inputMethod === 'overwrite';
    const pasteLines = pasteValue.split(/\r?\n/);
    const pasteWidth = pasteLines.reduce(
        (prev, current) => Math.max(prev, current.length),
        0
    );
    const pasteHeight = pasteLines.length;
    const { y, x, width, height, isCaret } = appState.selection as Selection;
    if (!isCaret) {
        appState.peelCode(y, x + inputLength, width, height);
    }
    appState.insertChunkSmartCode(
        y,
        x + inputLength,
        pasteValue,
        overwriteMode
    );
    // 입력한 뒤 붙여넣은 텍스트를 선택 (엑셀의 동작)
    appState.selection = {
        anchor: {
            y: y,
            x: x + inputLength,
        },
        focus: {
            y: y + pasteHeight - 1,
            x: x + inputLength + pasteWidth - 1,
        }
    };
    clearInputValue();
    resetCaretAnimation();
    scrollToFocus();
}

interface CellLineProps {
    index: number;
    codeLine: CodeLine;
}

const CellLine: React.SFC<CellLineProps> = props => <div
    className={style.cellLine}
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

interface CellProps {
    index: number;
    code: Code;
}

const Cell: React.SFC<CellProps> = props => <div
    className={classNames(style.cell, { [style.comment]: props.code.isComment })}
    style={{
        left: props.index * 30,
    }}
>
    { props.code.char }
</div>;

interface GhostCellProps {
    index: number;
}

const GhostCell: React.SFC<GhostCellProps> = props => <div
    className={classNames(style.cell, style.ghost)}
    style={{
        left: props.index * 30,
    }}
/>;
