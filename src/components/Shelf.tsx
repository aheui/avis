import * as React from 'react';

import { connect, AppState } from '../appState';
import * as style from './Shelf.css';
import FontAwesome from './FontAwesome';


interface ShelfProps {
    appState: AppState;
}

export default connect(
    appState => ({ appState }),
)(class Shelf extends React.Component<ShelfProps> {
    render() {
        const { appState } = this.props;
        return <div className={style.shelf}>
            <img className={style.logo} src="./aheui.svg" alt="아희"/>
            <div className={style.label}>AVIS - 잘 만든 아희 편집기 &amp; 실행기</div>
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
