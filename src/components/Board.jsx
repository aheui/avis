import React from 'react';
import classNames from 'classnames';

import { connect } from '../appState';
import { base26 } from '../misc/base';
import CodeSpace from './CodeSpace';
import CodeSpaceStateViewer from './CodeSpaceStateViewer';
import style from './Board.css';


export default connect(
    appState => ({ appState }),
)(class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
        };
    }
    updateCodeSpacePosition() {
        this.refs.codeSpace.ref.updateCodeSpacePosition();
    }
    render() {
        const { appState } = this.props;
        const { codeSpace } = appState;
        const { scrollTop, scrollLeft } = this.state;
        return <div className={style.board}>
            <CodeSpace
                ref="codeSpace"
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
            <div
                className={style.square}
                onClick={() => {
                    appState.selectAll();
                    this.refs.codeSpace.ref.focusInputElement();
                }}
            >{
                `${ codeSpace.width } \xd7 ${ codeSpace.height }`
            }</div>
        </div>;
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
