import * as React from 'react';
import * as GitHub from 'github-api';

import {
    connect,
    AppState,
} from '../../../../appState';
import Label from '../../../input/Label';
import TextInput from '../../../input/TextInput';
import Switch from '../../../input/Switch';
import Modal from '../../../Modal';
import * as style from './SaveAsGistModal.css';


interface SaveAsGistModalProps {
    appState: AppState;
}

interface SaveAsGistModalState {
    phase: Phase1State | Phase2State;
}

interface Phase1State {
    type: 'phase1state';
    filename: string;
    description: string;
    isPublic: boolean;
}

interface Phase2State {
    type: 'phase2state';
    gistId: string;
}

class SaveAsGistModal extends React.Component<SaveAsGistModalProps, SaveAsGistModalState> {
    componentWillMount() {
        this.setState({ phase: {
            type: 'phase1state',
            filename: '제목없음.aheui',
            description: 'avis( http://aheui.github.io/avis/ )에서 작성한 코드입니다.',
            isPublic: true,
        } });
    }
    closeModal() {
        const { appState } = this.props;
        appState.setUIOpen('modal.saveAsGist', false);
    }
    renderPhase1() {
        const { appState } = this.props;
        const { phase } = this.state;
        if (phase.type !== 'phase1state') return null;
        const {
            filename,
            description,
            isPublic,
        } = phase;
        return <Modal
            title="gist로 저장하기"
            prompt={[
                ['취소', null, () => this.closeModal()],
                ['확인', 'primary', async () => {
                    const github = new GitHub();
                    const gist = github.getGist();
                    const res = await gist.create({
                        files: { [filename]: {
                            content: appState.codeSpace.toString(),
                        } },
                        description,
                        public: isPublic,
                    });
                    if (res.status < 300) {
                        this.setState({ phase: {
                            type: 'phase2state',
                            gistId: res.data.id,
                        } });
                    } else {
                        // TODO: 아몰랑
                        throw res;
                    }
                }],
            ]}
            closeModal={() => this.closeModal()}>
            <Label title="파일 이름">
                <TextInput
                    value={filename}
                    onChange={filename => this.setState({ phase: {
                        ...phase,
                        filename,
                    } })}
                />
            </Label>
            <Label title="설명">
                <TextInput
                    value={description}
                    onChange={description => this.setState({ phase: {
                        ...phase,
                        description,
                    } })}
                />
            </Label>
            <Label title="공개 여부">
                <Switch
                    leftLabel="공개"
                    leftValue="public"
                    rightLabel="비공개"
                    rightValue="private"
                    value={isPublic ? 'public' : 'private'}
                    onChange={value => this.setState({ phase: {
                        ...phase,
                        isPublic: value === 'public',
                    } })}
                />
            </Label>
        </Modal>;
    }
    renderPhase2() {
        const { phase } = this.state;
        if (phase.type !== 'phase2state') return null;
        const {
            gistId,
        } = phase;
        const gistUrl = `https://gist.github.com/anonymous/${ gistId }`;
        const shareUrl = `${ location.protocol }//${ location.host }${ location.pathname }?content=gist:${ gistId }`;
        return <Modal
            title="gist로 저장하기"
            prompt={[
                ['닫기', null, () => this.closeModal()],
            ]}
            closeModal={() => this.closeModal()}
            bodyClassName={style.phase2body}>
            <Label title="아래의 gist url로 저장되었습니다:">
                <a href={gistUrl} className={style.link} target="_blank">
                    { gistUrl }
                </a>
            </Label>
            <Label title="아래의 url을 통해서 avis로 다시 열어볼 수 있습니다:">
                <a href={shareUrl} className={style.link} target="_blank">
                    { shareUrl }
                </a>
            </Label>
        </Modal>;
    }
    render() {
        switch (this.state.phase.type) {
            case 'phase1state': return this.renderPhase1();
            case 'phase2state': return this.renderPhase2();
            default: return null;
        }
    }
}

export default connect(
    appState => ({ appState }),
)(SaveAsGistModal);
