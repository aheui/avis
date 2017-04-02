import React from 'react';
import ReactDOM from 'react-dom';

import App from './containers/App';


class Provider extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.appState = props.appState;
    }
    getChildContext() {
        return { appState: this.appState };
    }
    render() {
        return React.Children.only(this.props.children);
    }
    static childContextTypes = {
        appState: React.PropTypes.object.isRequired,
    };
}

export function render(appState, target) {
    ReactDOM.render(
        <Provider appState={appState}><App/></Provider>,
        target,
    );
}
