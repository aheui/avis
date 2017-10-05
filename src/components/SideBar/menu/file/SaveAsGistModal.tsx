import * as React from 'react';

import {
    connect,
    AppState,
} from '../../../../appState';
import Modal from '../../../Modal';


interface SaveAsGistModalProps {
    appState: AppState;
}

interface SaveAsGistModalState {
    phase: 1 | 2;
}

class SaveAsGistModal extends React.Component<SaveAsGistModalProps, SaveAsGistModalState> {
    componentWillMount() {
        this.setState({ phase: 1 });
    }
    closeModal() {
        const { appState } = this.props;
        appState.setUIOpen('modal.saveAsGist', false);
    }
    renderPhase1() {
        return <Modal
            title="gist로 저장하기"
            prompt={[
                ['취소', null, () => this.closeModal()],
                ['확인', 'primary', () => {
                    // TODO
                    return new Promise(() => {});
                }],
            ]}
            closeModal={() => this.closeModal()}
        ></Modal>;
    }
    renderPhase2() {
        return <Modal
            title="gist로 저장하기"
            prompt={[
                ['닫기', null, () => {}],
            ]}
            closeModal={() => this.closeModal()}
        ></Modal>;
    }
    render() {
        return this.renderPhase1();
    }
}

export default connect(
    appState => ({ appState }),
)(SaveAsGistModal);
