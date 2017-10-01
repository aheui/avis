import * as React from 'react';

import Board from './Board';
import Shelf from './Shelf';
import SideBar from './SideBar';
import StatusBar from './StatusBar';
import * as style from './App.css';

class App extends React.Component {
    render() {
        return <div className={style.app}>
            <Shelf/>
            <div className={style.body}>
                <SideBar updateCodeSpacePosition={
                    () => (this.refs.board as any).ref.updateCodeSpacePosition()
                }/>
                <Board ref="board"/>
            </div>
            <StatusBar/>
        </div>;
    }
}

export default App;
