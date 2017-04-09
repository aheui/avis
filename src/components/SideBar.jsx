import React from 'react';

import { connect } from '../appState';
import style from './SideBar.css';


class SideBar extends React.Component {
    render() {
        return <div className={style.sideBar}></div>;
    }
}

export default SideBar;
