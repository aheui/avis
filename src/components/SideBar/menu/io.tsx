import * as React from 'react';

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
import Label from '../../input/Label';
import Switch from '../../input/Switch';
import TextInput from '../../input/TextInput';


interface ButtonProps {
    active?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

export const Button = (props: ButtonProps) => <SideBarButton
    {...props}
    icon="terminal"
/>;

interface ContentProps {
    appState: AppState;
}

class ContentComponent extends React.Component<ContentProps> {
    fileInput: HTMLInputElement;
    render() {
        const { appState } = this.props;
        return <SideBarContent title="입출력">
            <SideBarContentFolder
                title="입력"
                open={appState.getUIOpen('io.input')}
                onBarClick={open => appState.setUIOpen('io.input', !open)}>
                <Label
                    title="입력방식"
                    note="미리 준비 입력방식의 경우, 미리 준비된 내용이 다 소모된 뒤부터는 -1을 입력합니다.">
                    <Switch
                        leftLabel="미리 준비"
                        leftValue="predefined"
                        rightLabel="매번 입력"
                        rightValue="inputmodal"
                        value="predefined"
                        onChange={value => console.log(value)}
                    />
                </Label>
                <TextInput value="" onChange={value => console.log(value)}/>
            </SideBarContentFolder>
            <SideBarContentFolder
                title="출력"
                open={appState.getUIOpen('io.output')}
                onBarClick={open => appState.setUIOpen('io.output', !open)}>
                <MenuButton label="전부 지우기" onClick={() => {
                    //
                }}/>
                <TextInput value="" onChange={value => console.log(value)}/>
            </SideBarContentFolder>
        </SideBarContent>;
    }
}

export const Content = connect(
    appState => ({ appState })
)(ContentComponent);
