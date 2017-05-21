import React from 'react';
import classNames from 'classnames';

import style from './Switch.css';

export default class extends React.Component {
    render() {
        const {
            leftLabel,
            leftValue,
            rightLabel,
            rightValue,
            value,
            onChange,
            className,
        } = this.props;
        const left = value === leftValue;
        return <div
            onClick={() => onChange(left ? rightValue : leftValue)}
            className={classNames(style.switch, {
                [style.left]: left,
            }, className)}>
            <div className={classNames(style.label, style.left)}>
                { leftLabel }
            </div>
            <div className={classNames(style.label, style.right)}>
                { rightLabel }
            </div>
            <div className={style.highlight}/>
        </div>;
    }
}
