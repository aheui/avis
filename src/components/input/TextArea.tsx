import * as React from 'react';
import classNames from 'classnames';

import * as style from './input.css';


interface TextAreaProps {
    value: string;
    onChange?: (value: string) => void;
    rows?: number;
    readOnly?: boolean;
    placeholder?: string;
    className?: string;
}

const TextArea: React.SFC<TextAreaProps> = ({
    value,
    onChange,
    rows,
    readOnly,
    placeholder,
    className,
}) => <textarea
    className={classNames(
        style.input,
        style.textArea,
        className,
    )}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange && onChange(e.target.value)}
    readOnly={readOnly}
    rows={rows || 5}
/>;

export default TextArea;
