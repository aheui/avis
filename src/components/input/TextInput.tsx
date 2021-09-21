import * as React from 'react';
import classNames from 'classnames';

import * as style from './input.css';


interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const TextInput: React.SFC<TextInputProps> = ({
    value,
    onChange,
    className,
}) => <input
    type="text"
    className={classNames(
        style.input,
        style.textInput,
        className,
    )}
    value={value}
    onChange={e => onChange(e.target.value)}
/>;

export default TextInput;
