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
    Label,
} from '..';
import MenuButton from '../../input/MenuButton';
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
                title="저장 및 공유"
                open={appState.getUIOpen('file.saveAndShare')}
                onBarClick={open => appState.setUIOpen('file.saveAndShare', !open)}>
                <Label title="내 컴퓨터">
                    <MenuButton
                        label="불러오기"
                        onClick={() => this.fileInput.click()}
                    />
                    <MenuButton
                        label="저장하기"
                        onClick={() => {
                            const file = new File(
                                [ appState.codeSpace.toString() ],
                                'avis.aheui',
                                { type: 'text/plain;charset=utf-8' }
                            );
                            saveAs(file);
                        }}
                    />
                </Label>
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
                        appState.init(reader.result);
                    };
                    reader.readAsText(file);
                    this.fileInput.value = '';
                }}
            />
        </SideBarContent>;
    }
}

export const Content = connect(
    appState => ({ appState })
)(ContentComponent);
