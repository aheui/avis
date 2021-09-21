import * as React from 'react';
import classNames from 'classnames';

import * as style from './Label.css';


interface LabelProps {
    title: string | React.ReactElement<any>;
    className?: string;
    note?: string;
}

const Label: React.SFC<LabelProps> = ({ title, className, note, children }) => (
    <label className={classNames(style.label, className)}>
        <div className={style.title}>{ title }</div>
        <div className={style.children}>{ children }</div>
        { note && <div className={style.note}>{ note }</div> }
    </label>
);

export default Label;
