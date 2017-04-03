import React from 'react';

import { connect } from '../appState';
import style from './Board.css';


class Board extends React.Component {
    render() {
        const { appState } = this.props;
        return <div className={style.board}>
            {
                appState.codeSpace.toString()
            }
        </div>;
    }
}

export default connect(Board);
