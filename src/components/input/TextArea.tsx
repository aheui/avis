import * as React from 'react';
import * as classNames from 'classnames';

import * as style from './input.css';


interface TextAreaProps {
    value: string;
    onChange?: (value: string) => void;
    rows?: number;
    readOnly?: boolean;
    className?: string;
}

const TextArea: React.SFC<TextAreaProps> = ({
    value,
    onChange,
    rows,
    readOnly,
    className,
}) => <textarea
    className={classNames(
        style.input,
        style.textArea,
        className,
    )}
    value={value}
    onChange={e => onChange && onChange(e.target.value)}
    readOnly={readOnly}
    rows={rows || 5}
/>;

export default TextArea;
