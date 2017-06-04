import React from 'react';
import classNames from 'classnames';

import style from './MenuButton.css';

export default class extends React.Component {
    render() {
        const {
            label,
            onClick,
            className,
        } = this.props;
        return <div
            onClick={() => onClick()}
            className={classNames(style.button, className)}>
            <div className={classNames(style.label)}>
                { label }
            </div>
        </div>;
    }
}
