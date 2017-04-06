import React from 'react';

import { connect } from '../appState';
import style from './Board.css';


class Board extends React.Component {
    render() {
        const { code } = this.props;
        return <div className={style.board}>
            { code }
        </div>;
    }
}

export default connect(appState => {
    return {
        code: appState.codeSpace.toString(),
    };
})(Board);
