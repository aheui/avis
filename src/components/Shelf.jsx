import React from 'react';

import { connect } from '../appState';
import style from './Shelf.css';
import FontAwesome from './FontAwesome';


export default connect(
    appState => ({ appState }),
)(class Shelf extends React.Component {
    render() {
        const { appState } = this.props;
        return <div className={style.shelf}>
            <img className={style.logo} src="./aheui.svg" alt="아희"/>
            <div className={style.label}>AVIS - 잘만든 아희 편집기 &amp; 실행기</div>
            <div className={style.controlBox}>
                {
                    appState.isRunning ?
                    <div className={style.controlButton} onClick={() => appState.stop()}>
                        <FontAwesome icon='pause'/>
                    </div> :
                    <div className={style.controlButton} onClick={() => appState.run()}>
                        <FontAwesome icon='play'/>
                    </div>
                }
                <div className={style.controlButton} onClick={() => appState.step()}>
                    <FontAwesome icon='step-forward'/>
                </div>
                <div className={style.controlButton} onClick={() => appState.init()}>
                    <FontAwesome icon='stop'/>
                </div>
            </div>
        </div>;
    }
});
