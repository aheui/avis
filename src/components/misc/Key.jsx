import React from 'react';
import classNames from 'classnames';

import * as keyboard from '../../misc/keyboard';
import style from './Key.css';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { down: false };
    }
    componentDidMount() {
        const { listen } = this.props;
        if (listen) {
            this.handler = down => this.setState({ down });
            keyboard.on(listen, this.handler);
        }
    }
    componentWillUnmount() {
        const { listen } = this.props;
        keyboard.off(listen, this.handler);
    }
    render() {
        const { children } = this.props;
        return <kbd className={classNames(style.key, { [style.down]: this.state.down })}>
            <span className={style.text}>{ children }</span>
        </kbd>;
    }
}
