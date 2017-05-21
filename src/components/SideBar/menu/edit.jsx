import React from 'react';

import { connect } from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
} from '..';

export const Button = props => <SideBarButton {...props} icon="pencil"/>;

export const Content = connect(
    appState => ({ appState })
)(
    ({ appState }) => <SideBarContent title="편집">
        <SideBarContentFolder
            title='입력방식'
            open={appState.getUIOpen('edit.inputMethod')}
            onBarClick={open => appState.setUIOpen('edit.inputMethod', !open)}>
            TODO: 밀어쓰기/덮어쓰기 스위치
        </SideBarContentFolder>
    </SideBarContent>
);
