import * as React from 'react';

import {
    connect,
    Selection,
    AppState,
    RedrawMode,
} from '../../../appState';
import {
    SideBarButton,
    SideBarContent,
    SideBarContentFolder,
} from '..';
import Label from '../../input/Label';
import Key from '../../misc/Key';
import Switch from '../../input/Switch';
import MenuButton from '../../input/Button';

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
                    onChange={(inputMethod) => {
                        appState.editOptions = { inputMethod: inputMethod as ('insert' | 'overwrite') };
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
                    value={appState.editOptions.inputDirection!}
                    onChange={(inputDirection) => {
                        appState.editOptions = { inputDirection: inputDirection as ('horizontal' | 'vertical') };
                    }}
                />
            </Label>
        </SideBarContentFolder>
        <RedrawModeFolder appState={appState}/>
        <SideBarContentFolder
            title="회전 / 반전"
            open={appState.getUIOpen('edit.rotateAndFlip')}
            onBarClick={open => appState.setUIOpen('edit.rotateAndFlip', !open)}>
            <Label
                title="회전"
                note="선택영역이 정사각형일 경우 코드를 회전할 수 있습니다.">
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

interface RedrawModeFolderProps {
    appState: AppState;
}
const RedrawModeFolder: React.FC<RedrawModeFolderProps> = ({ appState }) => {
    const redrawMode = appState.specialMode as RedrawMode;
    return <SideBarContentFolder
        title="다시 그리기"
        open={appState.getUIOpen('edit.redraw')}
        onBarClick={open => appState.setUIOpen('edit.redraw', !open)}>
        { appState.specialMode instanceof RedrawMode ? <>
            { redrawMode.phase.type === 'select' ?
                <RedrawModeFolderSelectPhase appState={appState} redrawMode={redrawMode}/> :
                <RedrawModeFolderDrawPhase appState={appState} redrawMode={redrawMode}/> }
            <MenuButton
                label="취소"
                disabled={appState.isRunning}
                onClick={() => { appState.finishSpecialMode(); }}
            />
        </> : <>
            <MenuButton
                label="시작"
                disabled={appState.isRunning}
                onClick={() => { appState.startRedrawMode(); }}
            />
        </> }
    </SideBarContentFolder>;
};

interface RedrawModeFolderPhaseProps extends RedrawModeFolderProps {
    redrawMode: RedrawMode;
}

const RedrawModeFolderSelectPhase: React.FC<RedrawModeFolderPhaseProps> = ({ appState, redrawMode }) => {
    return <Label
        title="(선택 단계)"
        note="코드 공간에서 다시 그리고 싶은 코드를 드래그하여 선택해주세요">
        <MenuButton
            label="선택 초기화"
            disabled={appState.isRunning}
            onClick={() => { redrawMode.clearSelection(); }}
        />
        <MenuButton
            label="선택 완료"
            disabled={appState.isRunning}
            onClick={() => {
                // TODO
            }}
        />
    </Label>;
};

const RedrawModeFolderDrawPhase: React.FC<RedrawModeFolderPhaseProps> = ({ appState, redrawMode }) => {
    return <Label
        title="(그리기 단계)"
        note="코드 공간에서 새로 그릴 경로를 드래그하여 선택해주세요">
        <MenuButton
            label="그리기 초기화"
            disabled={appState.isRunning}
            onClick={() => {
                // TODO
            }}
        />
        <MenuButton
            label="다시 그리기 완료"
            disabled={appState.isRunning}
            onClick={() => {
                // TODO
            }}
        />
    </Label>;
};
