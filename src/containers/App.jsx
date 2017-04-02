import React from 'react';

import { connect } from '../appState';


class App extends React.Component {
    render() {
        return <div>Hello, AVIS!</div>
    }
}

export default connect(App);
