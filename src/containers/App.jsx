import React from 'react';

import { connect } from '../appState';
import Board from './Board';


class App extends React.Component {
    render() {
        return <Board/>;
    }
}

export default connect(App);
