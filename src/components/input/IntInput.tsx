import * as React from 'react';
import * as classNames from 'classnames';

import * as style from './input.css';


interface IntInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

const IntInput: React.SFC<IntInputProps> = ({
    value,
    onChange,
    min,
    max,
    className,
}) => <input
    type="number"
    className={classNames(
        style.input,
        style.intInput,
        className,
    )}
    value={value}
    onChange={e => {
        const value = +e.target.value;
        if (isNaN(value)) onChange(0);
        else onChange(value);
    }}
    min={min}
    max={max}
    step="1"
/>;

export default IntInput;
