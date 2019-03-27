import * as React from 'react';
import * as classNames from 'classnames';

import {
    connect,
    AppState,
    CodeSpace,
    RedrawMode,
} from '../../appState';
import CodeSpaceStateViewer from '../CodeSpaceStateViewer';
import PathTrack from './PathTrack';
import { CellLine, Cursor } from '.';
import * as style from './style.css';
import * as redrawModeStyle from './redraw-mode.css';

interface CodeSpaceProps {
    appState: AppState;
    redrawMode: RedrawMode;
    codeSpace: CodeSpace;
    onScroll: (scroll: { scrollTop: number, scrollLeft: number }) => void;
    initialScrollTop: number;
    initialScrollLeft: number;
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
}

export default connect<CodeSpaceProps, { appState: AppState, redrawMode: RedrawMode }>(
    appState => ({ appState, redrawMode: appState.specialMode as RedrawMode }),
)(class CodeSpace extends React.Component<CodeSpaceProps, CodeSpaceState> {
    scrollElement: HTMLElement;
    codeSpaceElement: HTMLElement;
    mouseDragUpHandler: (e: MouseEvent) => void;
    mouseDragMoveHandler: (e: MouseEvent) => void;
    mouseDragShift: () => void;
    // mousemove 이벤트 쓰로틀을 위한 속성
    raf: (() => void) | null;
    throttled: Map<(...args: any[]) => void, any[] | null>;
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
        };
    }
    onMouseDragUp(_e: MouseEvent) {
        this.setState({ mouseDown: false });
        this.removeMouseDragEventListeners();
    }
    onMouseDragMove(e: MouseEvent) {
        const {
            redrawMode,
            codeSpace,
        } = this.props;
        const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
        const cellPos = this.getCellPosFromMousePos(mouseX, mouseY);
        // TODO: 마우스가 빠르게 드래그 되었을 경우 중간 셀들도 일괄 선택되도록 처리
        redrawMode.selectOrDeselect(cellPos, codeSpace);
        this.scrollToFocus();
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
            this.onMouseDragUp(e);
        };
        this.mouseDragMoveHandler = e => this.throttled.set(this.onMouseDragMove, [e]);
        this.mouseDragShift = () => this.props.appState.squareSelection();
        this.scrollElement.scrollTo(this.props.initialScrollLeft, this.props.initialScrollTop);
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
    renderSelectState() {
        const {
            redrawMode,
            codeSpace,
        } = this.props;
        const { phase } = redrawMode;
        if (phase.type !== 'select') return;
        const { lastMoment } = phase.path;
        return <>
            { lastMoment && <Cursor
                x={lastMoment.p.x}
                y={lastMoment.p.y}
                className={redrawModeStyle.cursor}
            /> }
            <PathTrack path={phase.path} codeSpace={codeSpace}/>
        </>;
    }
    render() {
        const {
            redrawMode,
            codeSpace,
        } = this.props;
        const {
            mouseOn, mouseDown,
            ghostCaretX, ghostCaretY,
        } = this.state;
        return <div
            ref={scrollElement => this.scrollElement = scrollElement!}
            className={classNames(style.codeSpaceScroll, {
                [style.focus]: mouseDown,
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
                toggle: if (redrawMode.isSelected(cellPos)) {
                    if (redrawMode.phase.type !== 'select') break toggle;
                    if (redrawMode.phase.path.moments.length !== 1) break toggle;
                    const lastMoment = redrawMode.phase.path.lastMoment!;
                    if (lastMoment.p.x !== cellPos.x) break toggle;
                    if (lastMoment.p.y !== cellPos.y) break toggle;
                    redrawMode.clearSelection();
                } else {
                    redrawMode.select(cellPos, codeSpace);
                }
                if (!mouseDown) {
                    this.setState({ mouseDown: true });
                    window.addEventListener('mouseup', this.mouseDragUpHandler, true);
                    window.addEventListener('mousemove', this.mouseDragMoveHandler, true);
                }
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
            { this.renderSelectState() }
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
        </div>;
    }
});
