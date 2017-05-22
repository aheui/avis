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

export const Button = props => <SideBarButton {...props} icon="pencil"/>;

export const Content = connect(
    appState => ({ appState })
)(
    ({ appState }) => <SideBarContent title="편집">
        <SideBarContentFolder
            title='키보드 입력'
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
    </SideBarContent>
);
