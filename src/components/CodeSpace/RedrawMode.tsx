import * as React from 'react';
import * as classNames from 'classnames';

import {
    connect,
    AppState,
    CodeSpace,
} from '../../appState';
import CodeSpaceStateViewer from '../CodeSpaceStateViewer';
import PathTrack from './PathTrack';
import { CellLine } from '.';
import * as style from './style.css';

interface CodeSpaceProps {
    appState: AppState;
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

export default connect<CodeSpaceProps>(
    appState => ({ appState }),
)(class CodeSpace extends React.Component<CodeSpaceProps, CodeSpaceState> {
    scrollElement: HTMLElement;
    codeSpaceElement: HTMLElement;
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
        };
    }
    onMouseDragUp(_e: MouseEvent) {
        this.setState({ mouseDown: false });
        this.removeMouseDragEventListeners();
    }
    onMouseDragMove(e: MouseEvent) {
        const [ mouseX, mouseY ] = [ e.clientX, e.clientY ];
        console.log('drag:', this.getCellPosFromMousePos(mouseX, mouseY));
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
    render() {
        const { codeSpace, appState } = this.props;
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
                console.log('mousedown:', cellPos);
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
        </div>;
    }
});
