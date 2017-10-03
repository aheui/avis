import * as React from 'react';

import {
    connect,
    Selection,
} from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
    Label,
} from '..';
import Key from '../../misc/Key';
import Switch from '../../input/Switch';
import MenuButton from '../../input/MenuButton';

interface ButtonProps {
    active?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

export const Button = (props: ButtonProps) => <SideBarButton
    {...props}
    icon="pencil"
/>;

export const Content = connect(
    appState => ({ appState })
)(
    ({ appState }) => <SideBarContent title="편집">
        <SideBarContentFolder
            title="키보드 입력"
            open={appState.getUIOpen('edit.inputMethod')}
            onBarClick={open => appState.setUIOpen('edit.inputMethod', !open)}>
            <Label title={<div> 입력방식 <Key listen="insert">insert</Key> </div>}>
                <Switch
                    leftLabel="밀어쓰기"
                    leftValue="insert"
                    rightLabel="덮어쓰기"
                    rightValue="overwrite"
                    value={appState.editOptions.inputMethod!}
                    onChange={(inputMethod: 'insert' | 'overwrite') => {
                        appState.editOptions = { inputMethod };
                    }}
                />
            </Label>
            <Label
                title="입력방향"
                note="입력방식이 밀어쓰기일 경우 가로쓰기만 가능합니다.">
                <Switch
                    leftLabel="가로쓰기"
                    leftValue="horizontal"
                    rightLabel="세로쓰기"
                    rightValue="vertical"
                    disabled={appState.editOptions.inputMethod === 'insert'}
                    value={
                        appState.editOptions.inputMethod === 'insert' ?
                        'horizontal' :
                        appState.editOptions.inputDirection!
                    }
                    onChange={(inputDirection: 'horizontal' | 'vertical') => {
                        appState.editOptions = { inputDirection };
                    }}
                />
            </Label>
        </SideBarContentFolder>
        <SideBarContentFolder
            title="회전 / 반전"
            open={appState.getUIOpen('edit.rotateAndFlip')}
            onBarClick={open => appState.setUIOpen('edit.rotateAndFlip', !open)}>
            <Label
                title="회전"
                note="선택영역이 정사각형일 경우 회전 가능합니다.">
                <MenuButton
                    label="시계방향"
                    disabled={!(appState.selection as Selection).isSquare}
                    onClick={() => appState.rotateCWCode(
                        (appState.selection as Selection).y, (appState.selection as Selection).x,
                        (appState.selection as Selection).width, (appState.selection as Selection).height
                    )}
                />
                <MenuButton
                    label="반시계방향"
                    disabled={!(appState.selection as Selection).isSquare}
                    onClick={() => appState.rotateCCWCode(
                        (appState.selection as Selection).y, (appState.selection as Selection).x,
                        (appState.selection as Selection).width, (appState.selection as Selection).height
                    )}
                />
            </Label>
            <Label title="반전">
                <MenuButton
                    label="좌우반전"
                    onClick={() => appState.invertHCode(
                        (appState.selection as Selection).y, (appState.selection as Selection).x,
                        (appState.selection as Selection).width, (appState.selection as Selection).height
                    )}
                />
                <MenuButton
                    label="상하반전"
                    onClick={() => appState.invertVCode(
                        (appState.selection as Selection).y, (appState.selection as Selection).x,
                        (appState.selection as Selection).width, (appState.selection as Selection).height
                    )}
                />
            </Label>
        </SideBarContentFolder>
    </SideBarContent>
);
