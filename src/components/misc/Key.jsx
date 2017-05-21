import React from 'react';
import classNames from 'classnames';

import style from './Key.css';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { down: false };
    }
    componentDidMount() {
        const { listen } = this.props;
        if (listen) {
            this.keydownHandler = e => {
                if (e.key.toLowerCase() === listen) {
                    this.setState({ down: true });
                }
            };
            this.keyupHandler = e => {
                if (e.key.toLowerCase() === listen) {
                    this.setState({ down: false });
                }
            };
            window.addEventListener('keydown', this.keydownHandler, true);
            window.addEventListener('keyup', this.keyupHandler, true);
        }
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.keydownHandler, true);
        window.removeEventListener('keyup', this.keyupHandler, true);
    }
    render() {
        const { children } = this.props;
        return <kbd className={classNames(style.key, { [style.down]: this.state.down })}>
            <span className={style.text}>{ children }</span>
        </kbd>;
    }
}
