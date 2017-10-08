import * as React from 'react';
import * as classNames from 'classnames';

import * as keyboard from '../../misc/keyboard';
import * as style from './Key.css';

interface KeyProps {
    listen: string;
}

interface KeyState {
    down: boolean;
}

export default class extends React.Component<KeyProps, KeyState> {
    handler: (down: boolean) => void;
    constructor(props: KeyProps) {
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
