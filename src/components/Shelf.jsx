import React from 'react';

import { connect } from '../appState';
import style from './Shelf.css';


class Shelf extends React.Component {
    render() {
        return <div className={style.shelf}></div>;
    }
}

export default Shelf;
