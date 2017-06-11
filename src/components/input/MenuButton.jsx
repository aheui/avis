import React from 'react';
import classNames from 'classnames';

import style from './MenuButton.css';

export default class extends React.Component {
    render() {
        const {
            label,
            disabled,
            onClick,
            className,
        } = this.props;
        return <div
            onClick={() => disabled || onClick()}
            className={classNames(style.button, className)}>
            <div className={classNames(style.label, {
                [style.disabled]: disabled
            })}>
                { label }
            </div>
        </div>;
    }
}
