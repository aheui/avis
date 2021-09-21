import * as React from 'react';
import classNames from 'classnames';

import { connect, AppState, RedrawMode } from '../appState';
import * as styles from './Shelf.css';
import FontAwesome from './FontAwesome';


interface ShelfProps {
    appState: AppState;
}

export default connect(
    appState => ({ appState }),
)(class Shelf extends React.Component<ShelfProps> {
    render() {
        const { appState } = this.props;
        return <div className={styles.shelf}>
            <img className={styles.logo} src="./aheui.svg" alt="아희"/>
            <div className={styles.label}>AVIS - 잘 만든 아희 편집기 &amp; 실행기</div>
            <ControlBox
                appState={appState}
                disabled={appState.specialMode instanceof RedrawMode}
            />
        </div>;
    }
});

interface ControlBoxProps {
    appState: AppState;
    disabled?: boolean;
}
const ControlBox: React.FC<ControlBoxProps> = ({ appState, disabled }) => {
    return <div className={classNames(styles.controlBox, {
        [styles.disabled]: disabled,
    })}>
        {
            appState.isRunning ?
            <div className={styles.controlButton} onClick={() => appState.stop()}>
                <FontAwesome icon='pause'/>
            </div> :
            <div className={styles.controlButton} onClick={() => appState.run()}>
                <FontAwesome icon='play'/>
            </div>
        }
        <div className={styles.controlButton} onClick={() => appState.step()}>
            <FontAwesome icon='step-forward'/>
        </div>
        <div className={styles.controlButton} onClick={() => appState.init()}>
            <FontAwesome icon='stop'/>
        </div>
    </div>;
};
