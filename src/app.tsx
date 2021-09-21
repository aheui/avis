import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AppState } from './appState';
import * as propTypes from './propTypes'

import './app.css';


interface ProviderProps {
    appState: AppState;
}

interface ProviderContext {}

class Provider extends React.Component<ProviderProps> {
    appState: AppState;
    constructor(props: ProviderProps, context: ProviderContext) {
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
        appState: propTypes.objectIsRequired,
    };
}

export function render(App: React.ComponentClass, appState: AppState, target: HTMLElement) {
    ReactDOM.render(
        <Provider appState={appState}>
            <App/>
        </Provider>,
        target,
    );
}
