import * as React from 'react';
import * as classNames from 'classnames';

import * as file from './menu/file';
import * as edit from './menu/edit';
import * as state from './menu/state';
import * as style from './style.css';

const menus: {
    [key: string]: {
        Button: React.ComponentClass | React.SFC<any>,
        Content: React.ComponentClass | React.SFC<any>,
    };
} = {
    file,
    edit,
    state,
};
const menuButtonOrder: (keyof typeof menus)[] = [
    'file',
    'edit',
    'state',
];

interface SideBarProps {
    updateCodeSpacePosition: () => void;
}

interface SideBarState {
    current: string | null;
}

class SideBar extends React.Component<SideBarProps, SideBarState> {
    constructor(props: SideBarProps) {
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
                { menuButtonOrder.map(name => {
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
