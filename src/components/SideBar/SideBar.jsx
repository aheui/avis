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
    componentDidUpdate() {
        this.props.updateCodeSpacePosition();
    }
    render() {
        const { current } = this.state;
        return <div className={classNames(style.sideBar, {
            [style.open]: !!current,
        })}>
            <div className={style.buttons}>
                { menus.order.map(name => {
                    const { Button } = menus[name];
                    return <Button
                        key={name}
                        active={current === name}
                        onActivate={() => this.setState({ current: name })}
                        onDeactivate={() => this.setState({ current: null })}
                    />;
                }) }
            </div>
            { current && (() => {
                const { Content } = menus[current];
                return <Content/>;
            })() }
        </div>;
    }
}

export default SideBar;
