import React from 'react';

import { connect } from '../appState';
import style from './StatusBar.css';


class StatusBar extends React.Component {
    render() {
        return <div className={style.statusBar}></div>;
    }
}

export default StatusBar;
