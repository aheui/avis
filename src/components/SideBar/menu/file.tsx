import * as React from 'react';
import { saveAs } from 'file-saver';

import {
    connect,
    AppState,
} from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
} from '..';
import MenuButton from '../../input/Button';
import SaveAsGistModal from './file/SaveAsGistModal';
import * as style from './file.css';

interface ButtonProps {
    active?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

export const Button = (props: ButtonProps) => <SideBarButton
    {...props}
    icon="file-text"
/>;

interface ContentProps {
    appState: AppState;
}

class ContentComponent extends React.Component<ContentProps> {
    fileInput: HTMLInputElement;
    render() {
        const { appState } = this.props;
        return <SideBarContent title="파일">
            <SideBarContentFolder
                title="저장하기"
                open={appState.getUIOpen('file.save')}
                onBarClick={open => appState.setUIOpen('file.save', !open)}>
                <MenuButton
                    label="내 컴퓨터로..."
                    onClick={() => {
                        const file = new File(
                            [ appState.codeSpace.toString() ],
                            'avis.aheui',
                            { type: 'text/plain;charset=utf-8' }
                        );
                        saveAs(file);
                    }}
                />
                <MenuButton
                    label="gist로..."
                    onClick={() => appState.setUIOpen('modal.saveAsGist', true)}
                />
            </SideBarContentFolder>
            <SideBarContentFolder
                title="불러오기"
                open={appState.getUIOpen('file.load')}
                onBarClick={open => appState.setUIOpen('file.load', !open)}>
                <MenuButton
                    label="새 문서"
                    // TODO: 저장되지 않은 내용이 있을 경우 경고모달 띄우기
                    onClick={() => appState.init('')}
                />
                <MenuButton
                    label="내 컴퓨터에서..."
                    onClick={() => this.fileInput.click()}
                />
            </SideBarContentFolder>
            <input
                className={style.fileInput}
                ref={ref => this.fileInput = ref!}
                type="file"
                onChange={e => {
                    const { files } = e.target;
                    if (!files || !files[0]) return;
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        appState.init(reader.result as string);
                    };
                    reader.readAsText(file);
                    this.fileInput.value = '';
                }}
            />
            { appState.getUIOpen('modal.saveAsGist') && <SaveAsGistModal/> }
        </SideBarContent>;
    }
}

export const Content = connect(
    appState => ({ appState })
)(ContentComponent);
