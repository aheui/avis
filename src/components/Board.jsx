import React from 'react';

import { connect } from '../appState';
import style from './Board.css';


class Board extends React.Component {
    render() {
        const { codeSpace } = this.props;
        return <div className={style.board}>
            {
                codeSpace.map(
                    (codeLine, index) =>
                    <CodeLine key={index} codeLine={codeLine}/>
                )
            }
        </div>;
    }
}

const CodeLine = props => <div className={style.codeLine}>
    {
        props.codeLine.map(
            (code, index) => <Cell key={index} code={code}/>
        )
    }
</div>;

const Cell = props => <div className={style.cell}>
    { props.code.char }
</div>;

export default connect(appState => {
    return {
        codeSpace: appState.codeSpace,
    };
})(Board);
