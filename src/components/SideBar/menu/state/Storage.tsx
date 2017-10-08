import * as React from 'react';

import IntInput from '../../../input/IntInput';
import * as style from './Storage.css';


interface StorageProps {
    storage: number[];
}

const Storage: React.SFC<StorageProps> = ({
    storage,
}) => <table className={style.table}><tbody>{
    storage.length ?
    storage.map((value, index) => <tr key={index}>
        <td>{ index }</td>
        <td><IntInput
            readOnly
            key={index}
            className={style.input}
            value={value}
            onChange={(_value: number) => {
                // TODO: 값 변경 기능
            }}
        /></td>
        <td>( { String.fromCharCode(value) } )</td>
    </tr>) :
    <tr><td colSpan={3}>(비어있음)</td></tr>
    // TODO: 새 항목 추가 기능
}</tbody></table>;

export default Storage;
