import * as React from 'react';

import {
    connect,
} from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
} from '..';
import Label from '../../input/Label';
import IntInput from '../../input/IntInput';

interface ButtonProps {
    active?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

export const Button = (props: ButtonProps) => <SideBarButton
    {...props}
    icon="table"
/>;

export const Content = connect(
    appState => ({ appState })
)(
    ({ appState }) => <SideBarContent title="상태">
        <SideBarContentFolder
            title="커서"
            open={appState.getUIOpen('state.cursor')}
            onBarClick={open => appState.setUIOpen('state.cursor', !open)}>
            <Label title="x">
                <IntInput
                    value={appState.cursor.x}
                    onChange={(value: number) => appState.setCursorX(value)}
                    min={0}
                />
            </Label>
            <Label title="y">
                <IntInput
                    value={appState.cursor.y}
                    onChange={(value: number) => appState.setCursorY(value)}
                    min={0}
                />
            </Label>
            <Label title="x 속력">
                <IntInput
                    value={appState.cursor.xSpeed}
                    onChange={(value: number) => appState.setCursorXSpeed(value)}
                    min={-2}
                    max={2}
                />
            </Label>
            <Label title="y 속력">
                <IntInput
                    value={appState.cursor.ySpeed}
                    onChange={(value: number) => appState.setCursorYSpeed(value)}
                    min={-2}
                    max={2}
                />
            </Label>
        </SideBarContentFolder>
        <SideBarContentFolder
            title="저장공간"
            open={appState.getUIOpen('state.storage')}
            onBarClick={open => appState.setUIOpen('state.storage', !open)}>
            TODO
        </SideBarContentFolder>
    </SideBarContent>
);
