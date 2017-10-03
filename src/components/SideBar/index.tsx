import * as React from 'react';
import * as classNames from 'classnames';

import SideBar from './SideBar';
import * as style from './style.css';
import FontAwesome from '../FontAwesome';

interface SideBarButtonProps {
    icon: string;
    active?: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}

export const SideBarButton: React.SFC<SideBarButtonProps> = ({
    icon,
    active,
    onActivate,
    onDeactivate,
}) => <div
    className={classNames(style.button, { [style.active]: active })}
    onClick={() => active ? onDeactivate() : onActivate()}
><FontAwesome icon={icon}/></div>;

interface SideBarContentProps {
    title: string;
}

export const SideBarContent: React.SFC<SideBarContentProps> = ({ title, children }) => <div className={style.content}>
    <div className={style.sidebarTitle}>{ title }</div>
    { children }
</div>;

interface SideBarContentFolderProps {
    title: string;
    open?: boolean;
    onBarClick: (open: boolean) => void;
    className?: string;
}

export const SideBarContentFolder: React.SFC<SideBarContentFolderProps> = ({ title, open, onBarClick, children, className }) => (
    <div className={classNames(style.folder, { [style.open]: open }, className)}>
        <div className={style.bar} onClick={() => onBarClick(!!open)}>
            <FontAwesome icon='caret-right' className={style.caret}/>
            { title }
        </div>
        { open && <div className={style.scrollArea}>{ children }</div> }
    </div>
);

interface LabelProps {
    title: string | React.ReactElement<any>;
    className?: string;
    note?: string;
}

export const Label: React.SFC<LabelProps> = ({ title, className, note, children }) => (
    <label className={classNames(style.label, className)}>
        <div className={style.title}>{ title }</div>
        <div className={style.children}>{ children }</div>
        { note && <div className={style.note}>{ note }</div> }
    </label>
);

export default SideBar;
