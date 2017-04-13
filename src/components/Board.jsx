import React from 'react';
import classNames from 'classnames';

import { connect } from '../appState';
import { base26 } from '../misc/base';
import style from './Board.css';


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
        };
    }
    render() {
        const { codeSpace } = this.props;
        const { scrollTop, scrollLeft } = this.state;
        return <div className={style.board}>
            <CodeSpace
                codeSpace={codeSpace}
                onScroll={
                    ({ scrollTop, scrollLeft }) => this.setState({ scrollTop, scrollLeft })
                }
            />
            <LineNumbersScroll
                codeSpace={codeSpace}
                scrollTop={scrollTop}
                scrollLeft={scrollLeft}
            />
            <ColumnNumbersScroll
                codeSpace={codeSpace}
                scrollTop={scrollTop}
                scrollLeft={scrollLeft}
            />
            <div className={style.square}>{
                `${ codeSpace.width } \xd7 ${ codeSpace.height }`
            }</div>
        </div>;
    }
}

const CodeSpaceStateViewer = connect(
    appState => ({
        codeSpace: appState.codeSpace,
    }),
)(class CodeSpaceStateViewer extends React.Component {
    constructor(props) {
        super(props);
        this.stateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ codeSpace }) {
        return this.stateId !== codeSpace.stateId;
    }
    render() {
        const { codeSpace, children } = this.props;
        this.stateId = codeSpace.stateId;
        return React.Children.only(children);
    }
});

const LineNumbersScroll = ({ codeSpace, scrollTop, scrollLeft }) => <div
    className={classNames(style.lineNumbersScroll, {
        [style.shadow]: scrollLeft > 0,
    })}>
    <div
        className={style.scroll}
        style={{
            top: 30 - scrollTop,
            height: codeSpace.height * 30,
        }}
    >
        <CodeSpaceStateViewer>
            <div className={style.numbers}>
                {
                    codeSpace.map((_, index) => <div
                        className={style.lineNumber}
                        key={index}
                        style={{
                            top: index * 30,
                        }}
                    >{ index + 1 }</div>)
                }
            </div>
        </CodeSpaceStateViewer>
    </div>
</div>;

const ColumnNumbersScroll = ({ codeSpace, scrollTop, scrollLeft }) => <div
    className={classNames(style.columnNumbersScroll, {
        [style.shadow]: scrollTop > 0,
    })}>
    <div
        className={style.scroll}
        style={{
            left: 70 - scrollLeft,
            width: codeSpace.width * 30,
        }}
    >
        <CodeSpaceStateViewer>
            <div className={style.numbers}>
                {
                    (new Array(codeSpace.width)).fill(0).map((_, index) => <div
                        className={style.columnNumber}
                        key={index}
                        style={{
                            left: index * 30,
                        }}
                    >{ base26(index) }</div>)
                }
            </div>
        </CodeSpaceStateViewer>
    </div>
</div>;

class CodeSpace extends React.Component {
    constructor(props) {
        super(props);
        this.element = null;
    }
    render() {
        const { codeSpace } = this.props;
        return <div
            ref={element => this.element = element}
            className={style.codeSpaceScroll}
            onScroll={() => this.props.onScroll({
                scrollTop: this.element.scrollTop,
                scrollLeft: this.element.scrollLeft,
            })}
        >
            <CodeSpaceStateViewer>
                <div
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
        </div>;
    }
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
    className={style.cell}
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

export default connect(appState => {
    return {
        codeSpace: appState.codeSpace,
    };
})(Board);
