import React from 'react';
import classNames from 'classnames';

import * as edit from './menu/Edit';
import style from './style.css';

const menus = {
    order: [ 'edit' ],
    edit,
};

class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: null,
        };
    }
    render() {
        const { current } = this.state;
        return <div className={classNames(style.sideBar, {
            [style.open]: !!current,
        })}>
            <div className={style.buttons}>
                { menus.order.map(name => menus[name].Button({
                    key: name,
                    active: current === name,
                    onActivate() { this.setState({ current: name }) },
                    onDeactivate() { this.setState({ current: null }) },
                })) }
            </div>
            { current && menus[current].Content() }
        </div>;
    }
}

export default SideBar;
