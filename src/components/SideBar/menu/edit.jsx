import React from 'react';

import { connect } from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
    Label,
} from '..';
import Key from '../../misc/Key';
import Switch from '../../input/Switch';
import MenuButton from '../../input/MenuButton';

export const Button = props => <SideBarButton {...props} icon="pencil"/>;

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
                    value={appState.editOptions.inputMethod}
                    onChange={inputMethod => {
                        appState.editOptions = { inputMethod };
                    }}
                />
            </Label>
        </SideBarContentFolder>
        <SideBarContentFolder
            title="회전 / 반전"
            open={appState.getUIOpen('edit.rotateAndFlip')}
            onBarClick={open => appState.setUIOpen('edit.rotateAndFlip', !open)}>
            <Label title="회전">
                <MenuButton
                    label="시계방향"
                    disabled={!appState.selection.isSquare}
                    onClick={() => appState.rotateCWCode(
                        appState.selection.y, appState.selection.x,
                        appState.selection.width, appState.selection.height
                    )}
                />
                <MenuButton
                    label="반시계방향"
                    disabled={!appState.selection.isSquare}
                    onClick={() => appState.rotateCCWCode(
                        appState.selection.y, appState.selection.x,
                        appState.selection.width, appState.selection.height
                    )}
                />
            </Label>
            <Label title="반전">
                <MenuButton
                    label="좌우반전"
                    onClick={() => appState.invertHCode(
                        appState.selection.y, appState.selection.x,
                        appState.selection.width, appState.selection.height
                    )}
                />
                <MenuButton
                    label="상하반전"
                    onClick={() => appState.invertVCode(
                        appState.selection.y, appState.selection.x,
                        appState.selection.width, appState.selection.height
                    )}
                />
            </Label>
        </SideBarContentFolder>
    </SideBarContent>
);
