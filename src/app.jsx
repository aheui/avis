import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';


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

export function render(App, appState, target) {
    ReactDOM.render(
        <AppContainer>
            <Provider appState={appState}>
                <App/>
            </Provider>
        </AppContainer>,
        target,
    );
}
