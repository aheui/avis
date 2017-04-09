import React from 'react';

import { connect } from '../appState';
import Board from './Board';
import Shelf from './Shelf';
import SideBar from './SideBar';
import StatusBar from './StatusBar';
import style from './App.css';


class App extends React.Component {
    render() {
        return <div className={style.app}>
            <Shelf/>
            <div className={style.body}>
                <SideBar/>
                <Board/>
            </div>
            <StatusBar/>
        </div>;
    }
}

export default App;
