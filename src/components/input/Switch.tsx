import * as React from 'react';
import * as classNames from 'classnames';

import * as style from './Switch.css';

interface SwitchProps {
    leftLabel: string;
    leftValue: string;
    rightLabel: string;
    rightValue: string;
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default class extends React.Component<SwitchProps> {
    render() {
        const {
            leftLabel,
            leftValue,
            rightLabel,
            rightValue,
            disabled,
            value,
            onChange,
            className,
        } = this.props;
        const left = value === leftValue;
        return <div
            onClick={() => !disabled && onChange(left ? rightValue : leftValue)}
            className={classNames(style.switch, {
                [style.disabled]: disabled,
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
