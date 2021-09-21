import * as React from 'react';
import classNames from 'classnames';

import * as style from './input.css';


interface IntInputProps {
    value: number;
    onChange: (value: number) => void;
    readOnly?: boolean;
    min?: number;
    max?: number;
    className?: string;
}

const IntInput: React.SFC<IntInputProps> = ({
    value,
    onChange,
    readOnly,
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
    readOnly={readOnly}
    min={min}
    max={max}
    step="1"
/>;

export default IntInput;
