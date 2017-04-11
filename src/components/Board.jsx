import React from 'react';
import classNames from 'classnames';

import { connect } from '../appState';
import style from './Board.css';


class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
        };
        this.scrollPane = null;
    }
    render() {
        const { codeSpace } = this.props;
        return <div className={style.board}>
            <div
                ref={element => this.scrollPane = element}
                className={style.scrollPane}
                onScroll={() => this.setState({
                    scrollTop: this.scrollPane.scrollTop,
                    scrollLeft: this.scrollPane.scrollLeft,
                })}
            >
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
            </div>
            <div
                className={style.lineNumbers}
                style={{
                    top: -this.state.scrollTop,
                    height: codeSpace.height * 30,
                }}
            >
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
            <div className={classNames(style.lineNumbersShadow, {
                [style.on]: this.state.scrollLeft > 0,
            })}/>
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
