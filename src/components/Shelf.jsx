import React from 'react';

import { connect } from '../appState';
import style from './Shelf.css';


class Shelf extends React.Component {
    render() {
        return <div className={style.shelf}>
            <img className={style.logo} src="./aheui.svg" alt="아희"/>
            <div className={style.label}>AVIS - 잘만든 아희 편집기 &amp; 실행기</div>
        </div>;
    }
}

export default Shelf;
